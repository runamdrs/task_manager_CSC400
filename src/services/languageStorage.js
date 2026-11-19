import { SUPPORTED_LANGUAGES } from '../i18n/translations.js';

const LANGUAGE_STORAGE_KEY = 'smartprep-language';

export function loadLanguage() {
  try {
    const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(language) ? language : 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error('Unsupported language preference.');
  }
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}
