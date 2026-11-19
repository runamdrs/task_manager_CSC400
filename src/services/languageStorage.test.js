import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadLanguage, saveLanguage } from './languageStorage.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe('languageStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to English when there is no saved preference', () => {
    expect(loadLanguage()).toBe('en');
  });

  it.each(['en', 'es', 'de'])('persists the %s language', (language) => {
    saveLanguage(language);
    expect(loadLanguage()).toBe(language);
  });

  it('ignores unsupported saved preferences', () => {
    localStorage.setItem('smartprep-language', 'fr');
    expect(loadLanguage()).toBe('en');
    expect(() => saveLanguage('fr')).toThrow('Unsupported language preference.');
  });
});
