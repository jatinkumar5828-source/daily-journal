import React from 'react';
import { JournalEntry, MOODS } from '../types/journal';
import { formatFullDate } from '../utils/dateUtils';

interface PrintViewProps {

  entry: JournalEntry | null;
}

export const PrintView: React.FC<PrintViewProps> = ({ entry }) => {
  if (!entry) return null;

  return (
    <div className="hidden print:block p-8 font-serif max-w-3xl mx-auto text-black">
      <div className="border-b-2 border-stone-800 pb-4 mb-6">
        <div className="text-xs uppercase tracking-widest text-stone-500 mb-1">
          LifeDiary Entry
        </div>
        <h1 className="text-2xl font-bold">{entry.title || 'Untitled Entry'}</h1>
        <div className="flex items-center gap-4 text-sm text-stone-600 mt-2">
          <span>{entry.date}</span>
          {entry.mood && <span>Mood: {entry.mood}</span>}
          {entry.rating && <span>Rating: {entry.rating}/10</span>}
        </div>
      </div>

      {/* Reflection summary */}
      {(entry.highlight || entry.challenge || entry.tomorrow) && (
        <div className="mb-6 p-4 border border-stone-300 rounded-lg text-sm space-y-2 bg-stone-50">
          {entry.highlight && (
            <p>
              <strong>Main Highlight:</strong> {entry.highlight}
            </p>
          )}
          {entry.challenge && (
            <p>
              <strong>Main Challenge:</strong> {entry.challenge}
            </p>
          )}
          {entry.tomorrow && (
            <p>
              <strong>Tomorrow:</strong> {entry.tomorrow}
            </p>
          )}
        </div>
      )}

      {/* Moments */}
      {entry.moments && entry.moments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Important Moments</h3>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            {entry.moments.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Journal Content */}
      <div
        className="prose max-w-none text-base leading-relaxed mb-8"
        dangerouslySetInnerHTML={{ __html: entry.content || '' }}
      />

      {/* Photos */}
      {entry.photos && entry.photos.length > 0 && (
        <div className="mt-8 pt-6 border-t border-stone-300">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Photos</h3>
          <div className="grid grid-cols-2 gap-4">
            {entry.photos.map((p) => (
              <img
                key={p.id}
                src={p.dataUrl}
                alt="Journal memory"
                className="max-h-60 w-full object-cover rounded border border-stone-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
