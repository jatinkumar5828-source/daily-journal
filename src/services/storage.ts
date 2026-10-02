import { JournalEntry, AppSettings, PhotoAttachment } from '../types/journal';

const DB_NAME = 'LifeDiaryDB';
const DB_VERSION = 1;
const STORE_ENTRIES = 'entries';
const STORE_SETTINGS = 'settings';

const LOCAL_STORAGE_BACKUP_KEY = 'lifediary_entries_backup';
const LOCAL_STORAGE_SETTINGS_KEY = 'lifediary_settings';

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
        db.createObjectStore(STORE_ENTRIES, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve a single entry by date 'YYYY-MM-DD'
 */
export async function getEntry(date: string): Promise<JournalEntry | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ENTRIES, 'readonly');
      const store = transaction.objectStore(STORE_ENTRIES);
      const request = store.get(date);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    // LocalStorage fallback
    try {
      const backup = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        return parsed[date] || null;
      }
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * Save or update a journal entry
 */
export async function saveEntry(entry: JournalEntry): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_ENTRIES, 'readwrite');
      const store = transaction.objectStore(STORE_ENTRIES);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback sync to localStorage
    try {
      const backup = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      const entriesMap = backup ? JSON.parse(backup) : {};
      entriesMap[entry.date] = entry;
      localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(entriesMap));
    } catch {
      // ignore
    }
  }
}

/**
 * Delete a journal entry
 */
export async function deleteEntry(date: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_ENTRIES, 'readwrite');
      const store = transaction.objectStore(STORE_ENTRIES);
      const request = store.delete(date);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback sync to localStorage
    try {
      const backup = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (backup) {
        const entriesMap = JSON.parse(backup);
        delete entriesMap[date];
        localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(entriesMap));
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Get all saved journal entries
 */
export async function getAllEntries(): Promise<JournalEntry[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ENTRIES, 'readonly');
      const store = transaction.objectStore(STORE_ENTRIES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    try {
      const backup = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        return Object.values(parsed);
      }
    } catch {
      // ignore
    }
    return [];
  }
}

/**
 * Get a set of all dates ('YYYY-MM-DD') that have non-empty journal entries
 */
export async function getAllRecordedDates(): Promise<Set<string>> {
  const entries = await getAllEntries();
  const set = new Set<string>();
  for (const entry of entries) {
    // Consider an entry recorded if it has content, title, mood, or photos
    const hasContent =
      (entry.content && entry.content.trim().length > 0) ||
      (entry.title && entry.title.trim().length > 0) ||
      !!entry.mood ||
      (entry.photos && entry.photos.length > 0) ||
      (entry.moments && entry.moments.length > 0);

    if (hasContent) {
      set.add(entry.date);
    }
  }
  return set;
}

/**
 * Export full journal data as a formatted JSON string
 */
export async function exportJournalJSON(): Promise<string> {
  const entries = await getAllEntries();
  const exportPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalEntries: entries.length,
    entries: entries,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Import journal entries from a JSON file string
 */
export async function importJournalJSON(jsonStr: string): Promise<{ success: boolean; importedCount: number; error?: string }> {
  try {
    const data = JSON.parse(jsonStr);
    const entriesToImport: JournalEntry[] = Array.isArray(data)
      ? data
      : Array.isArray(data.entries)
      ? data.entries
      : null;

    if (!entriesToImport) {
      return { success: false, importedCount: 0, error: 'Invalid journal file format.' };
    }

    let count = 0;
    for (const item of entriesToImport) {
      if (item && item.date) {
        await saveEntry({
          date: item.date,
          title: item.title || '',
          content: item.content || '',
          mood: item.mood || '',
          energy: item.energy || 3,
          rating: item.rating || 5,
          highlight: item.highlight || '',
          challenge: item.challenge || '',
          tomorrow: item.tomorrow || '',
          moments: Array.isArray(item.moments) ? item.moments : [],
          photos: Array.isArray(item.photos) ? item.photos : [],
          createdAt: item.createdAt || Date.now(),
          updatedAt: item.updatedAt || Date.now(),
        });
        count++;
      }
    }

    return { success: true, importedCount: count };
  } catch (err) {
    return { success: false, importedCount: 0, error: (err as Error).message };
  }
}

/**
 * Settings management
 */
export function getStoredSettings(): AppSettings {
  const defaults: AppSettings = {
    isLocked: false,
    pinHash: null,
    theme: 'light',
    reminderEnabled: false,
    reminderTime: '20:00',
  };

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (saved) {
      return { ...defaults, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }

  // Detect system dark mode if not set
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    defaults.theme = 'dark';
  }

  return defaults;
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
