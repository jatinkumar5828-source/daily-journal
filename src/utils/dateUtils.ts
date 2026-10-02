export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns today's date in 'YYYY-MM-DD' formatted string based on local time
 */
export function getTodayString(): string {
  const now = new Date();
  return formatDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Pad zero for 2-digit numbers
 */
export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Format year, month (1-12), and day (1-31) into 'YYYY-MM-DD'
 */
export function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${padZero(month)}-${padZero(day)}`;
}

/**
 * Parse 'YYYY-MM-DD' into { year, month (1-12), day }
 */
export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/**
 * Returns a Javascript Date object from 'YYYY-MM-DD' in local time (at noon to avoid timezone shift)
 */
export function dateFromString(dateStr: string): Date {
  const { year, month, day } = parseDateString(dateStr);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formats a date string into "Friday, October 2, 2026"
 */
export function formatFullDate(dateStr: string): string {
  const d = dateFromString(dateStr);
  const dayName = DAY_NAMES[d.getDay()];
  const monthName = MONTH_NAMES[d.getMonth()];
  return `${dayName}, ${monthName} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Returns { dayName: 'Friday', monthName: 'October', dayNumber: 2, year: 2026 }
 */
export function getDateBreakdown(dateStr: string) {
  const d = dateFromString(dateStr);
  return {
    dayOfWeek: DAY_NAMES[d.getDay()],
    dayNumber: d.getDate(),
    monthName: MONTH_NAMES[d.getMonth()],
    year: d.getFullYear(),
  };
}

/**
 * Format timestamp into readable time like "8:42 PM"
 */
export function formatTime(timestamp: number): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Get number of days in a given year and month (1-12)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get starting day of week for the 1st of month (0 = Sunday, 1 = Monday...)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Add or subtract days from a 'YYYY-MM-DD' string
 */
export function shiftDate(dateStr: string, daysOffset: number): string {
  const d = dateFromString(dateStr);
  d.setDate(d.getDate() + daysOffset);
  return formatDateString(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Check if a date string is in the future compared to today
 */
export function isFutureDate(dateStr: string): boolean {
  const today = getTodayString();
  return dateStr > today;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/**
 * Generate year list dynamically starting from base year (e.g. 2026) up to currentYear + 8 or beyond
 */
export function getAvailableYears(minYear = 2026, existingDates: string[] = []): number[] {
  const currentYear = new Date().getFullYear();
  let startYear = Math.min(minYear, currentYear);
  let endYear = Math.max(currentYear + 6, 2035);

  // If there are existing dates earlier or later, expand
  for (const d of existingDates) {
    const y = parseInt(d.split('-')[0], 10);
    if (!isNaN(y)) {
      if (y < startYear) startYear = y;
      if (y > endYear) endYear = y;
    }
  }

  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
}

/**
 * Calculate streaks from a set of recorded date strings
 */
export function calculateStreaks(recordedDates: Set<string>): { currentStreak: number; longestStreak: number } {
  if (recordedDates.size === 0) return { currentStreak: 0, longestStreak: 0 };

  const sortedDates = Array.from(recordedDates).sort();
  const dateSet = recordedDates;

  // Longest streak
  let longestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const curr = dateFromString(dateStr);
    if (!prevDate) {
      currentRun = 1;
    } else {
      const diffTime = curr.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    prevDate = curr;
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  // Current streak (checking backwards from today or yesterday)
  const todayStr = getTodayString();
  let checkStr = todayStr;
  let currentStreak = 0;

  // If today is not journaled, we allow starting from yesterday for active streak
  if (!dateSet.has(checkStr)) {
    checkStr = shiftDate(todayStr, -1);
  }

  while (dateSet.has(checkStr)) {
    currentStreak++;
    checkStr = shiftDate(checkStr, -1);
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
