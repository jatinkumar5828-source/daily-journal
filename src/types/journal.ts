export type MoodType = 'great' | 'good' | 'normal' | 'sad' | 'angry' | 'tired' | 'productive' | '';

export interface MoodConfig {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
}

export const MOODS: MoodConfig[] = [
  { id: 'great', emoji: '😀', label: 'Great', color: 'text-amber-500' },
  { id: 'good', emoji: '🙂', label: 'Good', color: 'text-emerald-500' },
  { id: 'normal', emoji: '😐', label: 'Normal', color: 'text-blue-500' },
  { id: 'sad', emoji: '😔', label: 'Sad', color: 'text-indigo-400' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: 'text-rose-500' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: 'text-purple-400' },
  { id: 'productive', emoji: '🔥', label: 'Productive', color: 'text-orange-500' },
];

export interface PhotoAttachment {
  id: string;
  date: string;
  dataUrl: string; // Base64 data URL
  caption?: string;
  createdAt: number;
}

export interface JournalEntry {
  date: string; // 'YYYY-MM-DD'
  title: string;
  content: string; // HTML formatted rich text
  mood?: MoodType;
  energy?: number; // 1 to 5
  rating?: number; // 1 to 10
  highlight?: string; // What was the best thing about today?
  challenge?: string; // What was difficult today?
  tomorrow?: string; // What do I want to do tomorrow?
  moments?: string[]; // Bullet-point memories
  photos?: PhotoAttachment[];
  createdAt: number;
  updatedAt: number;
}

export interface JournalStats {
  totalEntries: number;
  entriesThisMonth: number;
  daysInThisMonth: number;
  entriesThisYear: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysRecorded: number;
  moodCounts: Record<string, number>;
}

export interface AppSettings {
  isLocked: boolean;
  pinHash: string | null;
  theme: 'light' | 'dark' | 'system';
  reminderEnabled: boolean;
  reminderTime: string; // '20:00'
}
