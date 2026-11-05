// Date helpers shared by Dashboard selectors. Dates use the same local
// 'YYYY-MM-DD' keys and Monday-start weeks as the Meal Planner.

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  // Noon avoids daylight-saving shifts moving the date across midnight.
  return new Date(year, month - 1, day, 12);
}

export function getWeekDateKeys(dateKey) {
  const monday = fromDateKey(dateKey);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return toDateKey(date);
  });
}

export function getWeekdayName(dateKey) {
  return fromDateKey(dateKey).toLocaleDateString('en-US', { weekday: 'long' });
}
