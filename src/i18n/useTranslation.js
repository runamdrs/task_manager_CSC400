import { useContext } from 'react';
import { LanguageContext } from './languageContext.js';

export function useTranslation() {
  return useContext(LanguageContext);
}
