import { useCallback, useEffect, useMemo } from 'react';
import { LanguageContext } from './languageContext.js';
import { LOCALES, translate } from './translations.js';

export function LanguageProvider({ language, children }) {
  const t = useCallback(
    (key, values) => translate(language, key, values),
    [language]
  );
  const context = useMemo(() => ({ language, t }), [language, t]);

  useEffect(() => {
    document.documentElement.lang = LOCALES[language] ?? LOCALES.en;
  }, [language]);

  return (
    <LanguageContext.Provider value={context}>
      {children}
    </LanguageContext.Provider>
  );
}
