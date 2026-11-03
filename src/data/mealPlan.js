export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

export function createEmptyPlan() {
  return DAYS.map(() => ({
    Breakfast: '',
    Lunch: '',
    Dinner: '',
  }));
}
