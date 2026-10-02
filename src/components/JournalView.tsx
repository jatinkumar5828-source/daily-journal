import React, { useEffect, useState, useRef, useCallback } from 'react';
import { JournalEntry, MoodType, PhotoAttachment, MOODS } from '../types/journal';
import {
  formatFullDate,
  getDateBreakdown,
  shiftDate,
  getTodayString,
  isFutureDate,
  formatTime,
} from '../utils/dateUtils';
import { RichTextEditor } from './RichTextEditor';
import { PhotoGallery } from './PhotoGallery';
import {

  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Calendar,
  Clock,
  Trash2,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';

interface JournalViewProps {
  currentDateStr: string;
  initialEntry: JournalEntry | null;
  onSaveEntry: (entry: JournalEntry) => Promise<void>;
  onDeleteEntry: (dateStr: string) => Promise<void>;
  onNavigateDate: (dateStr: string) => void;
  onPrintEntry: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  currentDateStr,
  initialEntry,
  onSaveEntry,
  onDeleteEntry,
  onNavigateDate,
  onPrintEntry,
}) => {
  const todayStr = getTodayString();
  const isViewingToday = currentDateStr === todayStr;
  const isFuture = isFutureDate(currentDateStr);
  const dateBreakdown = getDateBreakdown(currentDateStr);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('');
  const [energy, setEnergy] = useState<number>(3);
  const [rating, setRating] = useState<number>(7);
  const [highlight, setHighlight] = useState('');
  const [challenge, setChallenge] = useState('');
  const [tomorrow, setTomorrow] = useState('');
  const [moments, setMoments] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [lastEditedTime, setLastEditedTime] = useState<number | null>(null);

  // Save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMountRef = useRef(true);
  const loadedDateRef = useRef<string>(currentDateStr);

  // Synchronize when date or initialEntry changes
  useEffect(() => {
    loadedDateRef.current = currentDateStr;
    if (initialEntry) {
      setTitle(initialEntry.title || '');
      setContent(initialEntry.content || '');
      setMood(initialEntry.mood || '');
      setEnergy(initialEntry.energy || 3);
      setRating(initialEntry.rating || 7);
      setHighlight(initialEntry.highlight || '');
      setChallenge(initialEntry.challenge || '');
      setTomorrow(initialEntry.tomorrow || '');
      setMoments(initialEntry.moments || []);
      setPhotos(initialEntry.photos || []);
      setLastEditedTime(initialEntry.updatedAt || initialEntry.createdAt || null);
    } else {
      // Empty entry for date
      setTitle('');
      setContent('');
      setMood('');
      setEnergy(3);
      setRating(7);
      setHighlight('');
      setChallenge('');
      setTomorrow('');
      setMoments([]);
      setPhotos([]);
      setLastEditedTime(null);
    }
    setSaveStatus('idle');
    isFirstMountRef.current = true;
  }, [currentDateStr, initialEntry]);

  // Handle building current entry object
  const getCurrentEntry = useCallback((): JournalEntry => {
    return {
      date: currentDateStr,
      title,
      content,
      mood,
      energy,
      rating,
      highlight,
      challenge,
      tomorrow,
      moments,
      photos,
      createdAt: initialEntry?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
  }, [
    currentDateStr,
    title,
    content,
    mood,
    energy,
    rating,
    highlight,
    challenge,
    tomorrow,
    moments,
    photos,
    initialEntry,
  ]);

  // Debounced auto-save function
  const triggerAutoSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSaveStatus('saving');
    debounceTimerRef.current = setTimeout(async () => {
      const entryToSave = getCurrentEntry();

      // Only save if there's meaningful content or user interacted
      const hasData =
        entryToSave.title.trim() ||
        entryToSave.content.trim() ||
        entryToSave.mood ||
        entryToSave.photos?.length ||
        entryToSave.moments?.length ||
        entryToSave.highlight?.trim();

      if (hasData) {
        await onSaveEntry(entryToSave);
        setLastEditedTime(entryToSave.updatedAt);
        setSaveStatus('saved');
      } else {
        setSaveStatus('idle');
      }
    }, 700);
  }, [getCurrentEntry, onSaveEntry]);

  // Track user edits for auto-save (skip first mount to avoid saving pristine loaded state)
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    triggerAutoSave();
  }, [title, content, mood, energy, rating, highlight, challenge, tomorrow, moments, photos, triggerAutoSave]);

  // Manual save handler
  const handleManualSave = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSaveStatus('saving');
    const entryToSave = getCurrentEntry();
    await onSaveEntry(entryToSave);
    setLastEditedTime(entryToSave.updatedAt);
    setSaveStatus('saved');
  };

  // Keyboard shortcut Ctrl+S / Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  // Navigation handlers
  const handlePrevDay = () => onNavigateDate(shiftDate(currentDateStr, -1));
  const handleNextDay = () => onNavigateDate(shiftDate(currentDateStr, 1));
  const handleGoToToday = () => onNavigateDate(todayStr);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the journal entry for ${formatFullDate(currentDateStr)}? This cannot be undone.`
    );
    if (confirmed) {
      await onDeleteEntry(currentDateStr);
    }
  };

  const hasAnyContent =
    title.trim().length > 0 ||
    content.trim().length > 0 ||
    !!mood ||
    photos.length > 0 ||
    moments.length > 0;

  return (
    <main className="flex-1 overflow-y-auto bg-stone-50/60 dark:bg-stone-950/70 py-6 sm:py-8 px-4 sm:px-8 lg:px-12 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col journal-paper">
        {/* Date Navigation & Breadcrumb Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
          {/* Quick Prev / Today / Next day switcher */}
          <div className="flex items-center gap-1 bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 rounded-xl p-1 shadow-2xs backdrop-blur-xs">
            <button
              type="button"
              onClick={handlePrevDay}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Previous Day (Alt+Left)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous Day</span>
            </button>

            {!isViewingToday && (
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 transition-colors"
                title="Go to Today"
              >
                Today
              </button>
            )}

            <button
              type="button"
              onClick={handleNextDay}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Next Day (Alt+Right)"
            >
              <span className="hidden sm:inline">Next Day</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Auto-save & Status indicators */}
          <div className="flex items-center gap-3">
            {/* Auto save badge */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved ✓</span>
                </span>
              )}
              {lastEditedTime && saveStatus !== 'saving' && (
                <span className="hidden md:flex items-center gap-1 text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>Last edited: {formatTime(lastEditedTime)}</span>
                </span>
              )}
            </div>

            {/* Manual Save Entry Button */}
            <button
              type="button"
              onClick={handleManualSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 shadow-xs transition-colors"
              title="Save Entry (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Entry</span>
            </button>

            {/* Print Entry */}
            <button
              type="button"
              onClick={onPrintEntry}
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
              title="Print / Save this entry as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Delete entry if exists */}
            {hasAnyContent && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete this entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Future Date Notification Banner */}
        {isFuture && (
          <div className="mb-6 p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-3 no-print">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200">
              <strong className="font-semibold">This day hasn't happened yet.</strong>{' '}
              Planning ahead or drafting your goals for this date? Feel free to write notes!
            </div>
          </div>
        )}

        {/* Empty Date State prompt */}
        {!hasAnyContent && !isFuture && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50/50 dark:bg-stone-900/40 border border-amber-200/40 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>No entry for this day yet. What happened today? Start typing below.</span>
            </div>
          </div>
        )}

        {/* Big Date Header */}
        <div className="mb-6 border-b border-stone-200/80 dark:border-stone-800 pb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 font-sans mb-1">
                {dateBreakdown.dayOfWeek}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 dark:text-stone-50 tracking-tight">
                {dateBreakdown.monthName} {dateBreakdown.dayNumber}, {dateBreakdown.year}
              </h1>
            </div>

            {isViewingToday && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                Today's Diary
              </span>
            )}
          </div>
        </div>

        {/* Today's Title Input with clean Mood Selector */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Today's Title
            </label>
            <div className="flex items-center gap-1">
              <span className="text-2xs text-stone-400 dark:text-stone-500 mr-1 hidden sm:inline">
                Mood:
              </span>
              {MOODS.map((m) => {
                const isSelected = mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(isSelected ? '' : m.id)}
                    title={m.label}
                    className={`px-1.5 py-1 text-sm rounded-lg transition-all ${
                      isSelected
                        ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 scale-110 shadow-2xs'
                        : 'hover:bg-stone-200/60 dark:hover:bg-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span>{m.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "College, coding and a productive evening"'
            className="w-full text-xl sm:text-2xl font-bold font-serif px-4 py-3 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400/80 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all shadow-2xs"
          />
        </div>

        {/* Main Distraction-free Digital Notepad */}
        <div className="space-y-2 mb-8">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Main Journal
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write about what happened today... thoughts, experiences, lessons, and memories."
            autoFocus={!hasAnyContent}
          />
        </div>

        {/* Photo Attachment Gallery */}
        <PhotoGallery
          photos={photos}
          onAddPhotos={(newPhotos) => setPhotos((prev) => [...prev, ...newPhotos])}
          onRemovePhoto={(id) => setPhotos((prev) => prev.filter((p) => p.id !== id))}
        />
      </div>
    </main>
  );
};
