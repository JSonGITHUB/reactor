// sessionTimeUtils.js
// Centralized utilities for session time handling (local time, robust, string-based)

/**
 * Combine date (YYYY-MM-DD) and time (HH:mm) into a Date object (local time)
 */
export function combineDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/**
 * Format a Date object as 'YYYY-MM-DD' (local time)
 */
export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format a Date object as 'HH:mm' (local time, 24hr)
 */
export function formatTime(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Calculate accumulated time in minutes between two date/time strings (local)
 * Returns 0 if invalid or negative
 */
export function getAccumulatedMinutes(startDate, startTime, endDate, endTime) {
  const start = combineDateAndTime(startDate, startTime);
  const end = combineDateAndTime(endDate, endTime);
  if (!start || !end) return 0;
  const diff = Math.round((end - start) / 60000);
  return diff > 0 ? diff : 0;
}

/**
 * Parse legacy SessionTime object to new normalized format
 * Returns { startDate, startTime, endTime, accumulatedTime }
 */
export function normalizeSessionTime(sessionTime) {
  if (!sessionTime) return { startDate: '', startTime: '', endTime: '', accumulatedTime: 0 };
  // Try to extract date/time from possible Date/string fields
  let start = sessionTime.startTime;
  let end = sessionTime.endTime;
  let date = sessionTime.startDate || '';
  if (start instanceof Date) {
    date = formatDate(start);
    start = formatTime(start);
  } else if (typeof start === 'string' && start.length > 5) {
    const d = new Date(start);
    if (!isNaN(d.getTime())) {
      date = formatDate(d);
      start = formatTime(d);
    }
  }
  if (end instanceof Date) {
    end = formatTime(end);
  } else if (typeof end === 'string' && end.length > 5) {
    const d = new Date(end);
    if (!isNaN(d.getTime())) {
      end = formatTime(d);
    }
  }
  // If no date, fallback to today
  if (!date) date = formatDate(new Date());
  // If no times, fallback to '06:00' and '08:00'
  if (!start) start = '06:00';
  if (!end) end = '08:00';
  const accumulatedTime = getAccumulatedMinutes(date, start, date, end);
  return { startDate: date, startTime: start, endTime: end, accumulatedTime };
}
