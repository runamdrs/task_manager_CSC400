const FIRST_DAY_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
];

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function SettingsPage({ firstDayOfWeek, onFirstDayOfWeekChange }) {
  return (
    <div className="app settings-page">
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Choose how SmartPrep works for you.</p>
      </header>

      <section className="settings-card" aria-labelledby="settings-preferences-heading">
        <div className="settings-card-header">
          <span className="settings-card-icon">
            <CalendarIcon />
          </span>
          <div>
            <h2 id="settings-preferences-heading" className="settings-card-title">Preferences</h2>
            <p className="settings-card-subtitle">Customize how your weekly plan is displayed.</p>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-copy">
            <p id="first-day-label" className="settings-row-label">First day of the week</p>
            <p id="first-day-description" className="settings-row-description">
              Used across your meal planner and weekly summaries.
            </p>
          </div>
          <div
            className="settings-segmented"
            role="radiogroup"
            aria-labelledby="first-day-label"
            aria-describedby="first-day-description"
          >
            {FIRST_DAY_OPTIONS.map(({ value, label }) => (
              <label key={value} className="settings-segment">
                <input
                  type="radio"
                  name="first-day-of-week"
                  value={value}
                  checked={firstDayOfWeek === value}
                  onChange={() => onFirstDayOfWeekChange(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
