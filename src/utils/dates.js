// Date helpers shared by the Meal Planner, Dashboard, and grocery selectors.
// Dates use local 'YYYY-MM-DD' keys. Weeks start on the user's chosen first
// day ('sunday' or 'monday', see services/preferencesStorage.js).

const FIRST_DAY_INDEX = { sunday: 0, monday: 1 };

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  // Noon avoids daylight-saving shifts moving the date across midnight.
  return new Date(year, month - 1, day, 12);
}

export function shiftDateKey(dateKey, days) {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** First date of the week containing `dateKey`. */
export function getWeekStartKey(dateKey, firstDay = 'monday') {
  const firstDayIndex = FIRST_DAY_INDEX[firstDay] ?? FIRST_DAY_INDEX.monday;
  const daysSinceStart = (fromDateKey(dateKey).getDay() - firstDayIndex + 7) % 7;
  return shiftDateKey(dateKey, -daysSinceStart);
}

/** The seven dates of the week containing `dateKey`, in display order. */
export function getWeekDateKeys(dateKey, firstDay = 'monday') {
  const weekStart = getWeekStartKey(dateKey, firstDay);
  return Array.from({ length: 7 }, (_, index) => shiftDateKey(weekStart, index));
}

export function getWeekdayName(dateKey, locale = 'en-US') {
  return fromDateKey(dateKey).toLocaleDateString(locale, { weekday: 'long' });
}
