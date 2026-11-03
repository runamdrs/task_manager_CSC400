import { DAYS, MEALS } from '../data/mealPlan.js';
import TaskForm from './TaskForm.jsx';
import TaskList from './TaskList.jsx';

const ICON_PATHS = {
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
  checklist: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3.5 6 1.2 1.2L7 4.8M3.5 12l1.2 1.2L7 10.8M3.5 18l1.2 1.2L7 16.8" />
    </>
  ),
};

function DashboardIcon({ name, className = '' }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function SummaryCard({ icon, label, destination, hint, children, onNavigate }) {
  return (
    <button
      className="dashboard-summary-card"
      type="button"
      aria-label={`${label}. ${hint}`}
      onClick={() => onNavigate(destination)}
    >
      <span className="dashboard-icon-wrap">
        <DashboardIcon name={icon} className="dashboard-icon" />
      </span>
      <div className="dashboard-summary-content">
        <span className="dashboard-summary-title" role="heading" aria-level="2">
          {label}
        </span>
        {children}
        <span className="dashboard-summary-hint">
          {hint} <span aria-hidden="true">→</span>
        </span>
      </div>
    </button>
  );
}

function PlannedMealsCard({ meals, onNavigate }) {
  return (
    <section className="dashboard-card weekly-meal-card">
      <div className="dashboard-section-heading">
        <div>
          <p className="dashboard-eyebrow">Meal Plan</p>
          <h2>Coming Up This Week</h2>
        </div>
        <button
          className="dashboard-text-action"
          type="button"
          onClick={() => onNavigate('meal-planner')}
        >
          View Full Plan <span aria-hidden="true">→</span>
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="dashboard-empty-state">
          <span className="dashboard-empty-icon">
            <DashboardIcon name="calendar" className="dashboard-icon" />
          </span>
          <h3>No meals planned yet.</h3>
          <p>Your weekly plan will show up here once you add a meal.</p>
          <button
            className="dashboard-button dashboard-button-secondary"
            type="button"
            onClick={() => onNavigate('meal-planner')}
          >
            Plan Your First Meal
          </button>
        </div>
      ) : (
        <ul className="planned-meal-list">
          {meals.map((meal) => (
            <li className="planned-meal" key={`${meal.day}-${meal.type}`}>
              <span className="planned-meal-day">{meal.day}</span>
              <span className="planned-meal-type">{meal.type}</span>
              <span className="planned-meal-name">{meal.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PlaceholderCard({ icon, title, description, action, onNavigate }) {
  return (
    <section className="dashboard-card prep-tasks-card">
      <div className="dashboard-section-heading">
        <div>
          <p className="dashboard-eyebrow">Today</p>
          <h2>{title}</h2>
        </div>
        {action && (
          <button
            className="dashboard-text-action"
            type="button"
            onClick={() => onNavigate(action.page)}
          >
            {action.label} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <div className="dashboard-placeholder">
        <span className="dashboard-icon-wrap">
          <DashboardIcon name={icon} className="dashboard-icon" />
        </span>
        <div>
          <h3>{title === 'Prep Tasks' ? 'Ready to start cooking?' : title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </section>
  );
}

function DashboardPage({
  mealPlan,
  onNavigate,
  tasks,
  taskFilter,
  onTaskFilterChange,
  onSave,
  editingTask,
  onCancelEdit,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  const plannedMeals = mealPlan.flatMap((day, dayIndex) =>
    MEALS.flatMap((type) => {
      const name = day[type].trim();
      return name ? [{ day: DAYS[dayIndex], type, name }] : [];
    })
  );

  return (
    <div className="app dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Good morning!</p>
          <h1>Let&apos;s make this week easier.</h1>
          <p className="dashboard-intro">
            Plan your meals, organize your groceries, and stay on top of prep.
          </p>
        </div>
        <button
          className="dashboard-button dashboard-button-primary"
          type="button"
          onClick={() => onNavigate('meal-planner')}
        >
          <DashboardIcon name="calendar" className="dashboard-icon" />
          Plan a Meal
        </button>
      </header>

      <section className="dashboard-summary-grid" aria-label="Weekly summary">
        <SummaryCard
          icon="calendar"
          label="Planned Meals"
          destination="meal-planner"
          hint="View meal plan"
          onNavigate={onNavigate}
        >
          <p className="summary-value">{plannedMeals.length}</p>
          <p className="summary-note">Planned this week</p>
        </SummaryCard>
        <SummaryCard
          icon="cart"
          label="Grocery Progress"
          destination="grocery-list"
          hint="Open grocery list"
          onNavigate={onNavigate}
        >
          <p className="summary-coming-soon">Coming Soon</p>
          <p className="summary-note">Grocery tracking will be available here.</p>
        </SummaryCard>
        <SummaryCard
          icon="checklist"
          label="Prep Tasks"
          destination="recipes"
          hint="Explore prep options"
          onNavigate={onNavigate}
        >
          <p className="summary-coming-soon">Coming Soon</p>
          <p className="summary-note">Cooking tasks will appear here.</p>
        </SummaryCard>
        <SummaryCard
          icon="book"
          label="Recipes"
          destination="recipes"
          hint="Browse recipes"
          onNavigate={onNavigate}
        >
          <p className="summary-coming-soon">Coming Soon</p>
          <p className="summary-note">Your saved recipes will appear here.</p>
        </SummaryCard>
      </section>

      <div className="dashboard-content-grid">
        <PlannedMealsCard meals={plannedMeals} onNavigate={onNavigate} />
        <div className="dashboard-right-column">
          <PlaceholderCard
            icon="checklist"
            title="Prep Tasks"
            description="Your cooking tasks will appear here once you start preparing a recipe."
            action={{ label: 'View Recipes', page: 'recipes' }}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <details className="legacy-task-manager">
        <summary>Open TaskFlow task manager</summary>
        <TaskForm
          onSubmit={onSave}
          editingTask={editingTask}
          onCancel={onCancelEdit}
        />
        <TaskList
          tasks={tasks}
          taskFilter={taskFilter}
          onTaskFilterChange={onTaskFilterChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      </details>
    </div>
  );
}

export default DashboardPage;
