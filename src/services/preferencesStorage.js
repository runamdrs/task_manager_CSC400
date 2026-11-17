// Persists app-wide user preferences (currently only the first day of the week).

const PREFERENCES_STORAGE_KEY = 'smartprep-preferences';

export const FIRST_DAY_OPTIONS = ['sunday', 'monday'];

export const DEFAULT_PREFERENCES = { firstDayOfWeek: 'sunday' };

/** Returns saved preferences, falling back to defaults for missing or invalid values. */
export function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}');
    const firstDayOfWeek = FIRST_DAY_OPTIONS.includes(stored?.firstDayOfWeek)
      ? stored.firstDayOfWeek
      : DEFAULT_PREFERENCES.firstDayOfWeek;
    return { ...DEFAULT_PREFERENCES, firstDayOfWeek };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(preferences) {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}
