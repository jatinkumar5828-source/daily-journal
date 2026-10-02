import React from 'react';
import {
  BookOpen,
  Calendar,
  Search,
  Flame,
  Sun,
  Moon,
  Lock,
  Unlock,
  Download,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onGoToToday: () => void;
  onOpenSearch: () => void;
  onOpenStats: () => void;
  onOpenBackup: () => void;
  onToggleLock: () => void;
  isLocked: boolean;
  hasPin: boolean;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  currentStreak: number;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoToToday,
  onOpenSearch,
  onOpenStats,
  onOpenBackup,
  onToggleLock,
  isLocked,
  hasPin,
  theme,
  onToggleTheme,
  currentStreak,
  onOpenMobileMenu,
}) => {
  return (
    <header className="h-16 px-4 sm:px-6 border-b border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between no-print">
      {/* Zone 1: Brand & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Open Calendar Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-white font-serif">
            LifeDiary
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links & Action triggers */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Prominent Go to Today button */}
        <button
          type="button"
          onClick={onGoToToday}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-200/90 dark:hover:bg-amber-900/60 transition-all border border-amber-300/80 dark:border-amber-700/50 shadow-2xs whitespace-nowrap"
          title="Go to Today's Journal (Press 'T')"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>Today</span>
        </button>

        {/* Search trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Search entries (Ctrl+F)"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden lg:inline text-2xs text-stone-400 dark:text-stone-500 bg-stone-200/60 dark:bg-stone-800 px-1 rounded">
            Ctrl+F
          </kbd>
        </button>

        {/* Streak & Stats trigger */}
        <button
          type="button"
          onClick={onOpenStats}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Journal Streak & Stats"
        >
          <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-stone-400'}`} />
          <span className="tabular-nums font-semibold">{currentStreak}</span>
          <span className="hidden sm:inline text-xs text-stone-500">streak</span>
        </button>
      </div>

      {/* Zone 3: Security, Theme, and Backup Tools */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Backup / Export / Import */}
        <button
          type="button"
          onClick={onOpenBackup}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Backup, Export, & Print"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Lock / Privacy */}
        <button
          type="button"
          onClick={onToggleLock}
          className={`p-2 rounded-xl transition-colors ${
            hasPin
              ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
          title={hasPin ? 'Lock Journal (PIN Protected)' : 'Set Security PIN'}
        >
          {isLocked ? <Lock className="w-4 h-4 text-rose-500" /> : <Unlock className="w-4 h-4" />}
        </button>

        {/* Dark / Light Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-stone-600" />
          )}
        </button>
      </div>
    </header>
  );
};
