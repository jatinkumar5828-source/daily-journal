import React from 'react';
import { JournalStats, MOODS } from '../types/journal';
import { X, Flame, Trophy, Calendar, BookOpen, Smile } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: JournalStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Journal Reflection & Stats
              </h3>
              <p className="text-xs text-stone-500">Your writing consistency over time</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Streak & Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Current Streak */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Current Streak</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tabular-nums">
              {stats.currentStreak} <span className="text-sm font-normal text-stone-500">days</span>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Longest Streak</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tabular-nums">
              {stats.longestStreak} <span className="text-sm font-normal text-stone-500">days</span>
            </div>
          </div>
        </div>

        {/* Breakdown Counts */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>This Month</span>
            </div>
            <span className="text-xs font-semibold text-stone-900 dark:text-white tabular-nums">
              {stats.entriesThisMonth} / {stats.daysInThisMonth} days
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>This Year</span>
            </div>
            <span className="text-xs font-semibold text-stone-900 dark:text-white tabular-nums">
              {stats.entriesThisYear} entries
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/50 dark:border-stone-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
              <Smile className="w-4 h-4 text-emerald-500" />
              <span>All-Time Total</span>
            </div>
            <span className="text-xs font-semibold text-stone-900 dark:text-white tabular-nums">
              {stats.totalEntries} journaled days
            </span>
          </div>
        </div>

        {/* Mood Distribution */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
            Mood History
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
            {MOODS.map((m) => {
              const count = stats.moodCounts[m.id] || 0;
              return (
                <div
                  key={m.id}
                  className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/40 dark:border-stone-800 flex flex-col items-center"
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1 tabular-nums">
                    {count}
                  </span>
                  <span className="text-3xs text-stone-400 capitalize">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
