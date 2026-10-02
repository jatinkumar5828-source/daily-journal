import React from 'react';
import {
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  DAY_NAMES_SHORT,
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDateString,
  getTodayString,
  isFutureDate,
} from '../utils/dateUtils';
import { Calendar, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SidebarProps {
  currentDateStr: string;
  selectedYear: number;
  selectedMonth: number; // 1-12
  selectedDay: number;
  availableYears: number[];
  recordedDates: Set<string>;
  onSelectYear: (year: number) => void;
  onSelectMonth: (month: number) => void;
  onSelectDate: (dateStr: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentDateStr,
  selectedYear,
  selectedMonth,
  selectedDay,
  availableYears,
  recordedDates,
  onSelectYear,
  onSelectMonth,
  onSelectDate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const todayStr = getTodayString();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Month navigation calculation
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const startDayOfWeek = getFirstDayOfMonth(selectedYear, selectedMonth); // 0 (Sun) - 6 (Sat)

  // Quick month decrement/increment
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onSelectYear(selectedYear - 1);
      onSelectMonth(12);
    } else {
      onSelectMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onSelectYear(selectedYear + 1);
      onSelectMonth(1);
    } else {
      onSelectMonth(selectedMonth + 1);
    }
  };

  // Calendar dates matrix
  const calendarCells = [];
  // Empty blank days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Actual month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Count entries in currently viewed month
  let monthEntryCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = formatDateString(selectedYear, selectedMonth, d);
    if (recordedDates.has(dStr)) {
      monthEntryCount++;
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Navigation Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[340px] xl:w-[380px] bg-stone-100 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } no-print`}
      >
        {/* Header on Mobile */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 lg:hidden">
          <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Journal Calendar</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Year Selector Bar */}
        <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-stone-100/90 dark:bg-stone-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Years
            </span>
            <span className="text-2xs text-stone-400 dark:text-stone-500">
              {availableYears.length} available
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {availableYears.map((year) => {
              const isSelected = selectedYear === year;
              const isThisYear = year === currentYear;

              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => onSelectYear(year)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                      : isThisYear
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  <span>{year}</span>
                  {isThisYear && !isSelected && (
                    <span className="ml-1 text-2xs opacity-75">•</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Month Selector Horizontal / Tabs */}
        <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Months ({selectedYear})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {MONTH_NAMES_SHORT.map((shortName, index) => {
              const monthNumber = index + 1;
              const isSelected = selectedMonth === monthNumber;
              const isThisMonth = selectedYear === currentYear && currentMonth === monthNumber;

              return (
                <button
                  key={shortName}
                  type="button"
                  onClick={() => onSelectMonth(monthNumber)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : isThisMonth
                      ? 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Month Calendar Grid (Date Selection) */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between bg-stone-100/50 dark:bg-stone-900">
          <div>
            {/* Current View Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-stone-800 dark:text-stone-100">
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </h2>
              <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums">
                {monthEntryCount} / {daysInMonth} days written
              </span>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {DAY_NAMES_SHORT.map((day) => (
                <span
                  key={day}
                  className="text-2xs font-semibold text-stone-400 dark:text-stone-500 py-1"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-9 sm:h-10" />;
                }

                const dateStr = formatDateString(selectedYear, selectedMonth, day);
                const isSelected = currentDateStr === dateStr;
                const isCurrentToday = dateStr === todayStr;
                const hasEntry = recordedDates.has(dateStr);
                const isFuture = isFutureDate(dateStr);

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      onSelectDate(dateStr);
                      onCloseMobile();
                    }}
                    className={`relative h-9 sm:h-10 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold shadow-xs scale-105 z-10'
                        : isCurrentToday
                        ? 'ring-2 ring-amber-500/80 bg-amber-50 dark:bg-amber-950/40 text-stone-900 dark:text-amber-200 font-bold'
                        : hasEntry
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                        : isFuture
                        ? 'text-stone-400 dark:text-stone-600 hover:bg-stone-200 dark:hover:bg-stone-800/50'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="tabular-nums">{day}</span>

                    {/* Has Journal Indicator */}
                    {hasEntry && (
                      <span
                        className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? 'bg-amber-400 dark:bg-amber-600'
                            : 'bg-emerald-500 dark:bg-emerald-400'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend / Status Helper */}
          <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 text-2xs text-stone-500 dark:text-stone-400 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              <span>Written journal entry</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/50 shrink-0" />
              <span>Today's date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 dark:bg-stone-100 shrink-0" />
              <span>Currently viewed</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
