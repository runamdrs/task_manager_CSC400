import { useTranslation } from '../i18n/useTranslation.js';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
];

function SettingsPage({ language, languageError, onLanguageChange }) {
  const { t } = useTranslation();

  return (
    <div className="app settings-page">
      <header className="settings-header">
        <h1 className="settings-title">{t('Settings')}</h1>
        <p className="settings-subtitle">
          {t('Choose your language and personalize SmartPrep.')}
        </p>
      </header>
      <section className="settings-card" aria-labelledby="settings-preferences-heading">
        <div className="settings-card-header">
          <div>
            <h2 id="settings-preferences-heading" className="settings-card-title">
              {t('Preferences')}
            </h2>
            <p className="settings-card-subtitle">
              {t('Choose the language used throughout SmartPrep.')}
            </p>
          </div>
        </div>
        <div className="settings-row">
          <label className="settings-row-label" htmlFor="language-preference">
            {t('Language')}
          </label>
          <select
            id="language-preference"
            className="settings-language-select"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            {LANGUAGE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{t(label)}</option>
            ))}
          </select>
        </div>
        {languageError && (
          <p className="mp-error" role="alert">
            {t('Language preference could not be saved: {error}', { error: languageError })}
          </p>
        )}
      </section>
    </div>
  );
}

export default SettingsPage;
