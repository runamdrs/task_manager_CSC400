import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPreferences, savePreferences } from './preferencesStorage.js';

// Minimal in-memory stand-in for the browser's localStorage.
function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

describe('preferencesStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to a Sunday start for a new user', () => {
    expect(loadPreferences().firstDayOfWeek).toBe('sunday');
  });

  it('round-trips the saved first day of the week', () => {
    savePreferences({ firstDayOfWeek: 'monday' });
    expect(loadPreferences().firstDayOfWeek).toBe('monday');
  });

  it('falls back to Sunday for invalid or corrupted data', () => {
    localStorage.setItem('smartprep-preferences', JSON.stringify({ firstDayOfWeek: 'friday' }));
    expect(loadPreferences().firstDayOfWeek).toBe('sunday');

    localStorage.setItem('smartprep-preferences', '{not json');
    expect(loadPreferences().firstDayOfWeek).toBe('sunday');
  });
});
