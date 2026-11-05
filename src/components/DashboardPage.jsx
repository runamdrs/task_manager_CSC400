import { useMemo } from 'react';
import { RECIPES } from '../data/recipes.js';
import {
  MEAL_CATEGORIES,
  getTodayPrep,
  getWeeklyGroceries,
  indexRecipes,
} from '../selectors/grocery.js';
import { getWeekdayName } from '../utils/dates.js';
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

function SummaryCard({ icon, label, destination, hint, summary, children, onNavigate }) {
  return (
    <button
      className="dashboard-summary-card"
      type="button"
      aria-label={summary ? `${label}. ${summary}. ${hint}` : `${label}. ${hint}`}
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
            <li
              className={`planned-meal${meal.isPast ? ' planned-meal-past' : ''}${
                meal.isToday ? ' planned-meal-today' : ''
              }`}
              key={meal.id}
            >
              <span className="planned-meal-day">
                {meal.isToday ? 'Today' : meal.day}
                {meal.isPast && <span className="visually-hidden"> (past)</span>}
              </span>
              <span className="planned-meal-type">{meal.type}</span>
              <span className="planned-meal-name">{meal.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GroceryProgressContent({ weekly }) {
  if (weekly.total === 0) {
    return (
      <>
        <p className="summary-coming-soon">No groceries needed yet.</p>
        <p className="summary-note">Add ingredients to this week&apos;s meals.</p>
      </>
    );
  }

  const percent = Math.round((weekly.purchasedCount / weekly.total) * 100);
  return (
    <>
      <p className="summary-value">{weekly.remaining}</p>
      <p className="summary-note">
        {weekly.remaining === 0
          ? 'Everything is purchased'
          : `${weekly.remaining === 1 ? 'item' : 'items'} left to buy`}
      </p>
      <span
        className="grocery-progress-track"
        role="progressbar"
        aria-label="Grocery items purchased"
        aria-valuemin={0}
        aria-valuemax={weekly.total}
        aria-valuenow={weekly.purchasedCount}
      >
        <span className="grocery-progress-fill" style={{ width: `${percent}%` }} />
      </span>
      <p className="summary-note">
        {weekly.purchasedCount} of {weekly.total} purchased
      </p>
    </>
  );
}

function getGroceryNote(item) {
  const weeklyItem = item.weeklyItem;
  if (weeklyItem.status === 'needs-more') {
    return `More needed: ${weeklyItem.quantity} for the week`;
  }
  if (weeklyItem.quantity && weeklyItem.quantity !== item.quantity) {
    return `${weeklyItem.quantity} needed this week`;
  }
  return '';
}

function TodayPrepCard({ prep, weekStart, recipesById, onToggleGroceryPurchased, onNavigate }) {
  return (
    <section className="dashboard-card prep-tasks-card">
      <div className="dashboard-section-heading">
        <div>
          <p className="dashboard-eyebrow">Today</p>
          <h2>Prep Tasks</h2>
        </div>
        <button
          className="dashboard-text-action"
          type="button"
          onClick={() => onNavigate('meal-planner')}
        >
          View Plan <span aria-hidden="true">→</span>
        </button>
      </div>

      {prep.mealCount === 0 ? (
        <div className="dashboard-placeholder">
          <span className="dashboard-icon-wrap">
            <DashboardIcon name="checklist" className="dashboard-icon" />
          </span>
          <div>
            <h3>Nothing planned for today.</h3>
            <p>Add a meal to today&apos;s plan to see its shopping and meals here.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="today-prep-section">
            <h3 className="today-prep-heading">Grocery Shopping</h3>
            {prep.groceries.length === 0 ? (
              <p className="today-prep-note">
                {prep.ingredientCount === 0
                  ? "Today's meals don't list any ingredients yet."
                  : "Everything for today's meals is purchased."}
              </p>
            ) : (
              <ul className="today-grocery-list">
                {prep.groceries.map((item) => {
                  const note = getGroceryNote(item);
                  return (
                    <li key={item.key}>
                      <label className="today-grocery-item">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => onToggleGroceryPurchased(weekStart, item.weeklyItem)}
                        />
                        <span>
                          <span className="today-grocery-name">{item.name}</span>
                          {item.quantity && (
                            <span className="today-grocery-quantity"> – {item.quantity}</span>
                          )}
                          {note && <span className="today-grocery-note">{note}</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {MEAL_CATEGORIES.filter((category) => prep.mealsByCategory[category].length > 0).map(
            (category) => (
              <div className="today-prep-section" key={category}>
                <h3 className="today-prep-heading">{category}</h3>
                <ul className="today-meal-list">
                  {prep.mealsByCategory[category].map((meal) => (
                    <li key={meal.id}>
                      {meal.recipeId && recipesById.has(meal.recipeId) ? (
                        <button
                          className="today-meal-link"
                          type="button"
                          onClick={() => onNavigate('recipes')}
                        >
                          {meal.name}
                        </button>
                      ) : (
                        meal.name
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </>
      )}
    </section>
  );
}

function DashboardPage({
  plannedMeals,
  groceryPurchases,
  todayKey,
  currentHour,
  onToggleGroceryPurchased,
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
  // The hour comes from App's once-a-minute clock so the greeting stays current.
  const hour = currentHour;
  const greeting =
    hour >= 5 && hour < 12
      ? 'Good morning!'
      : hour >= 12 && hour < 17
        ? 'Good afternoon!'
        : hour >= 17 && hour < 21
          ? 'Good evening!'
          : 'Good night!';

  const recipesById = useMemo(() => indexRecipes(RECIPES), []);
  const weekly = useMemo(
    () => getWeeklyGroceries(plannedMeals, recipesById, groceryPurchases, todayKey),
    [plannedMeals, recipesById, groceryPurchases, todayKey]
  );
  const todayPrep = useMemo(
    () => getTodayPrep(plannedMeals, recipesById, weekly, todayKey),
    [plannedMeals, recipesById, weekly, todayKey]
  );
  const weekMeals = [...weekly.weekMeals]
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        MEAL_CATEGORIES.indexOf(a.category) - MEAL_CATEGORIES.indexOf(b.category)
    )
    .map((meal) => ({
      id: meal.id,
      day: getWeekdayName(meal.date),
      type: meal.category,
      name: meal.name,
      // Date keys are YYYY-MM-DD, so string comparison matches date order.
      isPast: meal.date < todayKey,
      isToday: meal.date === todayKey,
    }));
  const grocerySummary =
    weekly.total === 0
      ? 'No groceries needed yet'
      : `${weekly.remaining} of ${weekly.total} items left to buy`;

  return (
    <div className="app dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">{greeting}</p>
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
          <p className="summary-value">{weekMeals.length}</p>
          <p className="summary-note">Planned this week</p>
        </SummaryCard>
        <SummaryCard
          icon="cart"
          label="Grocery Progress"
          destination="grocery-list"
          hint="Open grocery list"
          summary={grocerySummary}
          onNavigate={onNavigate}
        >
          <GroceryProgressContent weekly={weekly} />
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
          <p className="summary-value">{RECIPES.length}</p>
          <p className="summary-note">Recipes in your library</p>
        </SummaryCard>
      </section>

      <div className="dashboard-content-grid">
        <PlannedMealsCard meals={weekMeals} onNavigate={onNavigate} />
        <div className="dashboard-right-column">
          <TodayPrepCard
            prep={todayPrep}
            weekStart={weekly.weekStart}
            recipesById={recipesById}
            onToggleGroceryPurchased={onToggleGroceryPurchased}
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
