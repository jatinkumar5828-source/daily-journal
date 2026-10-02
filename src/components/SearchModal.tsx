import React, { useState, useEffect, useMemo, useRef } from 'react';
import { JournalEntry } from '../types/journal';
import { formatFullDate } from '../utils/dateUtils';
import { Search, X, Calendar, FileText, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  onSelectDate: (dateStr: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectDate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Strip HTML tags for clean snippet searching
  const cleanSnippet = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return entries
      .map((entry) => {
        const textContent = cleanSnippet(entry.content || '');
        const title = entry.title || '';
        const moments = (entry.moments || []).join(' ');
        const highlight = entry.highlight || '';
        const challenge = entry.challenge || '';
        const tomorrow = entry.tomorrow || '';
        const dateStr = entry.date;

        const allText = `${title} ${dateStr} ${textContent} ${moments} ${highlight} ${challenge} ${tomorrow}`.toLowerCase();

        if (allText.includes(q)) {
          // Find snippet context
          let snippet = '';
          const idx = textContent.toLowerCase().indexOf(q);
          if (idx !== -1) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(textContent.length, idx + q.length + 60);
            snippet = (start > 0 ? '...' : '') + textContent.substring(start, end) + (end < textContent.length ? '...' : '');
          } else if (title.toLowerCase().includes(q)) {
            snippet = `Title: ${title}`;
          } else if (moments.toLowerCase().includes(q)) {
            snippet = `Moment: ${moments}`;
          } else if (highlight.toLowerCase().includes(q)) {
            snippet = `Highlight: ${highlight}`;
          } else {
            snippet = textContent.slice(0, 100);
          }

          return {
            entry,
            title: title || 'Untitled Entry',
            snippet,
            fullDate: formatFullDate(dateStr),
          };
        }
        return null;
      })
      .filter(Boolean) as {
      entry: JournalEntry;
      title: string;
      snippet: string;
      fullDate: string;
    }[];
  }, [query, entries]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words, titles, memories, dates..."
            className="w-full bg-transparent text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline text-xs text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Search your entire life journal</p>
              <p className="text-xs mt-1">Try "college", "vacation", "ideas", or dates</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500">
              <p className="text-sm">No entries matched "{query}"</p>
            </div>
          ) : (
            results.map(({ entry, title, snippet, fullDate }) => (
              <div
                key={entry.date}
                onClick={() => {
                  onSelectDate(entry.date);
                  onClose();
                }}
                className="group p-3.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 cursor-pointer transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700/60"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-200">
                      {fullDate}
                    </span>
                    {entry.mood && <span className="text-xs">{entry.mood}</span>}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 group-hover:text-amber-600 transition-all" />
                </div>
                <h4 className="text-sm font-medium text-stone-800 dark:text-stone-300 mb-1">
                  {title}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                  {snippet}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
