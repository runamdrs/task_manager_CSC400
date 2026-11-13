const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'meal-planner', label: 'Meal Planner', icon: 'calendar' },
  { id: 'recipes', label: 'Recipes', icon: 'book' },
  { id: 'grocery-list', label: 'Grocery List', icon: 'cart' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const ICON_PATHS = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
      <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9Z" />
    </>
  ),
};

function NavigationIcon({ name, className = '' }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#dashboard"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('dashboard');
        }}
        aria-label="SmartPrep home"
      >
        <span className="brand-mark">
          <img
            className="brand-logo"
            src="/assets/smartprep-logo.png"
            alt="SmartPrep Logo"
          />
        </span>
        <span className="brand-copy">
          <span className="brand-name">SmartPrep</span>
          <span className="brand-tagline">Plan. Shop. Prep.</span>
        </span>
      </a>

      <nav className="sidebar-nav" aria-label="Main menu">
        <h2 className="nav-heading">Main Menu</h2>
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item${activePage === item.id ? ' active' : ''}`}
                type="button"
                aria-current={activePage === item.id ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <NavigationIcon name={item.icon} className="nav-icon" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

    </aside>
  );
}

export default Sidebar;
