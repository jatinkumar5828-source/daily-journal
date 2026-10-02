/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { JournalEntry, JournalStats, AppSettings } from './types/journal';
import {
  getTodayString,
  parseDateString,
  getAvailableYears,
  getDaysInMonth,
  calculateStreaks,
  shiftDate,
} from './utils/dateUtils';
import {
  getEntry,
  saveEntry,
  deleteEntry,
  getAllEntries,
  getAllRecordedDates,
  getStoredSettings,
  saveStoredSettings,
} from './services/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { JournalView } from './components/JournalView';
import { SearchModal } from './components/SearchModal';
import { StatsModal } from './components/StatsModal';
import { BackupModal } from './components/BackupModal';
import { LockModal } from './components/LockModal';
import { PinScreen } from './components/PinScreen';
import { PrintView } from './components/PrintView';

export default function App() {
  const todayStr = getTodayString();
  const initialDateParts = parseDateString(todayStr);

  // Active navigation date states
  const [currentDateStr, setCurrentDateStr] = useState<string>(todayStr);
  const [selectedYear, setSelectedYear] = useState<number>(initialDateParts.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialDateParts.month);
  const [selectedDay, setSelectedDay] = useState<number>(initialDateParts.day);

  // Loaded journal entry for currentDateStr
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [recordedDates, setRecordedDates] = useState<Set<string>>(new Set());

  // App settings & security
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [isSessionUnlocked, setIsSessionUnlocked] = useState<boolean>(false);

  // Modals & Mobile Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // Sync theme with DOM document element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Load all entries and recorded dates from storage on mount
  const refreshStorageData = useCallback(async () => {
    const dates = await getAllRecordedDates();
    setRecordedDates(dates);
    const entries = await getAllEntries();
    setAllEntries(entries);
  }, []);

  useEffect(() => {
    refreshStorageData();
  }, [refreshStorageData]);

  // Load journal entry whenever currentDateStr changes
  useEffect(() => {
    let isCancelled = false;
    getEntry(currentDateStr).then((entry) => {
      if (!isCancelled) {
        setCurrentEntry(entry);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [currentDateStr]);

  // Dynamic available years list
  const availableYears = useMemo(() => {
    const datesList = Array.from(recordedDates);
    return getAvailableYears(2026, datesList);
  }, [recordedDates]);

  // Streak & Statistics calculation
  const stats = useMemo((): JournalStats => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const daysInThisMonth = getDaysInMonth(currentYear, currentMonth);

    const { currentStreak, longestStreak } = calculateStreaks(recordedDates);

    let entriesThisMonth = 0;
    let entriesThisYear = 0;
    const moodCounts: Record<string, number> = {};

    for (const entry of allEntries) {
      const parts = parseDateString(entry.date);
      if (parts.year === currentYear) {
        entriesThisYear++;
        if (parts.month === currentMonth) {
          entriesThisMonth++;
        }
      }
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    }

    return {
      totalEntries: allEntries.length,
      entriesThisMonth,
      daysInThisMonth,
      entriesThisYear,
      currentStreak,
      longestStreak,
      totalDaysRecorded: recordedDates.size,
      moodCounts,
    };
  }, [allEntries, recordedDates]);

  // Save entry handler
  const handleSaveEntry = async (entry: JournalEntry) => {
    await saveEntry(entry);
    setCurrentEntry(entry);
    // Refresh indices
    setRecordedDates((prev) => new Set(prev).add(entry.date));
    setAllEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== entry.date);
      return [...filtered, entry];
    });
  };

  // Delete entry handler
  const handleDeleteEntry = async (dateStr: string) => {
    await deleteEntry(dateStr);
    setCurrentEntry(null);
    setRecordedDates((prev) => {
      const next = new Set(prev);
      next.delete(dateStr);
      return next;
    });
    setAllEntries((prev) => prev.filter((e) => e.date !== dateStr));
  };

  // Date selection handler
  const handleSelectDate = (dateStr: string) => {
    setCurrentDateStr(dateStr);
    const { year, month, day } = parseDateString(dateStr);
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
  };

  // Year selection in sidebar
  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    // Keep month and day aligned or adjust
    const maxDays = getDaysInMonth(year, selectedMonth);
    const validDay = Math.min(selectedDay, maxDays);
    const newDateStr = `${year}-${String(selectedMonth).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    setCurrentDateStr(newDateStr);
    setSelectedDay(validDay);
  };

  // Month selection in sidebar
  const handleSelectMonth = (month: number) => {
    setSelectedMonth(month);
    const maxDays = getDaysInMonth(selectedYear, month);
    const validDay = Math.min(selectedDay, maxDays);
    const newDateStr = `${selectedYear}-${String(month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    setCurrentDateStr(newDateStr);
    setSelectedDay(validDay);
  };

  // Theme toggle
  const handleToggleTheme = () => {
    const nextTheme: 'light' | 'dark' = settings.theme === 'dark' ? 'light' : 'dark';
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Lock status toggle
  const handleToggleLock = () => {
    if (!settings.pinHash) {
      // Prompt user to set a PIN
      setIsLockModalOpen(true);
    } else {
      // Toggle locked state
      const nextLocked = !settings.isLocked;
      const updated = { ...settings, isLocked: nextLocked };
      setSettings(updated);
      saveStoredSettings(updated);
      if (nextLocked) {
        setIsSessionUnlocked(false);
      }
    }
  };

  const handleSavePin = (pinHash: string | null) => {
    const updated = {
      ...settings,
      pinHash,
      isLocked: !!pinHash,
    };
    setSettings(updated);
    saveStoredSettings(updated);
    if (pinHash) {
      setIsSessionUnlocked(true);
    }
  };

  const handleLockNow = () => {
    const updated = { ...settings, isLocked: true };
    setSettings(updated);
    saveStoredSettings(updated);
    setIsSessionUnlocked(false);
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger 'T' when user is typing in an input or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (!isInput && (e.key === 't' || e.key === 'T')) {
        handleSelectDate(todayStr);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [todayStr]);

  // Determine if PIN screen should block access
  const isPinLocked = settings.isLocked && settings.pinHash && !isSessionUnlocked;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* If PIN lock is active, show security unlock screen */}
      {isPinLocked ? (
        <PinScreen
          pinHash={settings.pinHash!}
          onUnlockSuccess={() => setIsSessionUnlocked(true)}
        />
      ) : (
        <>
          {/* Top Navigation Bar */}
          <Header
            onGoToToday={() => handleSelectDate(todayStr)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenBackup={() => setIsBackupOpen(true)}
            onToggleLock={handleToggleLock}
            isLocked={settings.isLocked}
            hasPin={!!settings.pinHash}
            theme={settings.theme}
            onToggleTheme={handleToggleTheme}
            currentStreak={stats.currentStreak}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          {/* Main App Layout: Sidebar + Journal Editor Canvas */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar navigation for Years, Months, and Days */}
            <Sidebar
              currentDateStr={currentDateStr}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              selectedDay={selectedDay}
              availableYears={availableYears}
              recordedDates={recordedDates}
              onSelectYear={handleSelectYear}
              onSelectMonth={handleSelectMonth}
              onSelectDate={handleSelectDate}
              isOpenMobile={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />

            {/* Daily Journal Editor Page */}
            <JournalView
              currentDateStr={currentDateStr}
              initialEntry={currentEntry}
              onSaveEntry={handleSaveEntry}
              onDeleteEntry={handleDeleteEntry}
              onNavigateDate={handleSelectDate}
              onPrintEntry={() => window.print()}
            />
          </div>

          {/* Printable Layout (Visible only in print / Save as PDF mode) */}
          <PrintView entry={currentEntry} />

          {/* Search Modal (Ctrl+F) */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            entries={allEntries}
            onSelectDate={handleSelectDate}
          />

          {/* Stats & Reflection Modal */}
          <StatsModal
            isOpen={isStatsOpen}
            onClose={() => setIsStatsOpen(false)}
            stats={stats}
          />

          {/* Backup, Restore, and PDF Modal */}
          <BackupModal
            isOpen={isBackupOpen}
            onClose={() => setIsBackupOpen(false)}
            onDataRestored={refreshStorageData}
            onPrintCurrentEntry={() => window.print()}
          />

          {/* Privacy & PIN Lock Modal */}
          <LockModal
            isOpen={isLockModalOpen}
            onClose={() => setIsLockModalOpen(false)}
            hasPin={!!settings.pinHash}
            currentPinHash={settings.pinHash}
            onSavePin={handleSavePin}
            onLockNow={handleLockNow}
          />
        </>
      )}
    </div>
  );
}
