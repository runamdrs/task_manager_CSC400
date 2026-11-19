import { useCallback, useEffect, useState } from 'react';
import DashboardPage from './components/DashboardPage.jsx';
import MealPlanner from './components/MealPlanner.jsx';
import PlannedIngredientsPage from './components/PlannedIngredientsPage.jsx';
import RecipesPage from './components/RecipesPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import { RECIPES } from './data/recipes.js';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import { getWeeklyGroceries, indexRecipes } from './selectors/grocery.js';
import {
  getPurchaseKey,
  loadGroceryPurchases,
  saveGroceryPurchases,
} from './services/groceryStorage.js';
import {
  loadPlannedMeals,
  MEALS_STORAGE_KEY,
  savePlannedMeals,
} from './services/mealPlannerStorage.js';
import { loadPreferences, savePreferences } from './services/preferencesStorage.js';
import { toDateKey } from './utils/dates.js';
// Import the browser-storage helpers used to persist tasks between visits.
import { loadTasks, saveTasks } from './services/taskStorage.js';
import { loadLanguage, saveLanguage } from './services/languageStorage.js';
import { translate } from './i18n/translations.js';

// Import the Smart Grocery List component.
import GroceryList from './components/GroceryList.jsx';


// Provide starter data when the browser has no saved tasks yet.
const SAMPLE_TASKS = [
  {
    id: crypto.randomUUID(),
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, and coffee.',
    dueDate: '2026-07-20',
    priority: 'medium',
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'Finish project report',
    description: 'Write the summary section and proofread.',
    dueDate: '2026-07-18',
    priority: 'high',
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'Call the dentist',
    description: 'Schedule a cleaning appointment.',
    dueDate: '2026-07-25',
    priority: 'low',
    completed: true,
  },
];

function getInitialTasks() {
  // Read saved tasks before the first render.
  const stored = loadTasks();

  // Seed storage only for a first-time visitor.
  if (stored === null) {
    saveTasks(SAMPLE_TASKS);
    return SAMPLE_TASKS;
  }

  return stored;
}

function readInitialPlannedMeals() {
  try {
    return { meals: loadPlannedMeals(), error: '' };
  } catch (error) {
    return { meals: [], error: error.message };
  }
}

const PAGES = ['dashboard', 'meal-planner', 'recipes', 'grocery-list', 'settings'];
const RECIPES_BY_ID = indexRecipes(RECIPES);

function getPageFromHash() {
  // The URL hash (#recipes) is the source of truth for the current page, so
  // refresh, bookmarks, and the back/forward buttons all work.
  const page = window.location.hash.slice(1);
  return PAGES.includes(page) ? page : 'dashboard';
}

function useClock() {
  // Re-check the time each minute so "today" rolls over at midnight and the
  // greeting changes with the time of day. Both are primitives, so React only
  // re-renders when one of them actually changes.
  const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()));
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTodayKey(toDateKey(now));
      setCurrentHour(now.getHours());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  return { todayKey, currentHour };
}

function App() {
  const [activePage, setActivePage] = useState(getPageFromHash);
  const [plannedMealState, setPlannedMealState] = useState(readInitialPlannedMeals);
  const { meals: plannedMeals, error: mealStorageError } = plannedMealState;
  const [language, setLanguage] = useState(loadLanguage);
  const [languageError, setLanguageError] = useState('');
  // Grocery purchase status; grocery items themselves are derived, not stored.
  const [groceryPurchases, setGroceryPurchases] = useState(loadGroceryPurchases);
  // App-wide preferences, such as which day weekly views start on.
  const [preferences, setPreferences] = useState(loadPreferences);
  const { todayKey, currentHour } = useClock();
  // Keep the complete task collection in component state.

  const weeklyGroceries = getWeeklyGroceries(
    plannedMeals,
    RECIPES_BY_ID,
    groceryPurchases,
    todayKey,
    preferences.firstDayOfWeek
  );
  const [tasks, setTasks] = useState(getInitialTasks);
  // Keep the selected completion filter in UI state only.
  const [taskFilter, setTaskFilter] = useState('all');
  // Track the task currently being edited, or null while adding a task.
  const [editingTask, setEditingTask] = useState(null);
  const [recipeSelectionMode, setRecipeSelectionMode] = useState(false);
  const [recipeSelection, setRecipeSelection] = useState(null);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === null || event.key === MEALS_STORAGE_KEY) {
        try {
          setPlannedMealState({ meals: loadPlannedMeals(), error: '' });
        } catch (error) {
          setPlannedMealState({ meals: [], error: error.message });
        }
      }
      setGroceryPurchases(loadGroceryPurchases());
      setPreferences(loadPreferences());
      setLanguage(loadLanguage());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setActivePage(getPageFromHash());
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = useCallback((page) => {
    if (window.location.hash === `#${page}`) {
      setActivePage(page);
      return;
    }
    // Adds a history entry; the hashchange listener updates the page.
    window.location.hash = page;
  }, []);

  const handleSavePlannedMeal = useCallback((mealData) => {
    const occupiedMeal = plannedMeals.find(
      (meal) =>
        meal.id !== mealData.id &&
        meal.date === mealData.date &&
        meal.category === mealData.category
    );
    if (occupiedMeal) return { ok: false, occupiedMeal };

    const savedMeal = mealData.id
      ? mealData
      : { ...mealData, id: crypto.randomUUID() };
    const updatedMeals = mealData.id
      ? plannedMeals.map((meal) => (meal.id === mealData.id ? savedMeal : meal))
      : [...plannedMeals, savedMeal];

    try {
      savePlannedMeals(updatedMeals);
      setPlannedMealState({ meals: updatedMeals, error: '' });
      return { ok: true, meal: savedMeal };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [plannedMeals]);

  const handleBrowseRecipes = useCallback(() => {
    setRecipeSelectionMode(true);
    handleNavigate('recipes');
  }, [handleNavigate]);

  const handleCancelRecipeSelection = useCallback(() => {
    setRecipeSelectionMode(false);
    handleNavigate('meal-planner');
  }, [handleNavigate]);

  const handleChooseRecipe = useCallback((recipeId) => {
    setRecipeSelection({
      recipeId,
      requestId: crypto.randomUUID(),
    });
    setRecipeSelectionMode(false);
    handleNavigate('meal-planner');
  }, [handleNavigate]);

  const handleRecipeApplied = useCallback((requestId) => {
    setRecipeSelection((current) =>
      current?.requestId === requestId ? null : current
    );
  }, []);

  function handleRemovePlannedMeal(id) {
    const updatedMeals = plannedMeals.filter((meal) => meal.id !== id);
    try {
      savePlannedMeals(updatedMeals);
      setPlannedMealState({ meals: updatedMeals, error: '' });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  function handleLanguageChange(nextLanguage) {
    try {
      saveLanguage(nextLanguage);
      setLanguage(nextLanguage);
      setLanguageError('');
    } catch (error) {
      setLanguageError(error.message);
    }
  }

  function handleToggleGroceryPurchased(weekStart, item) {
    const key = getPurchaseKey(weekStart, item.key);
    const updatedPurchases = { ...groceryPurchases };

    if (item.status === 'purchased') {
      delete updatedPurchases[key];
    } else {
      // Record the requirement covered now, so needing more later is detected.
      updatedPurchases[key] = {
        totals: item.totals,
        quantity: item.quantity,
        purchasedAt: new Date().toISOString(),
      };
    }

    setGroceryPurchases(updatedPurchases);
    saveGroceryPurchases(updatedPurchases);
  }

  function handleFirstDayOfWeekChange(firstDayOfWeek) {
    // Only the layout of weekly views changes; meal dates are untouched.
    const updatedPreferences = { ...preferences, firstDayOfWeek };
    setPreferences(updatedPreferences);
    savePreferences(updatedPreferences);
  }

  function handleSave(taskData) {
    let updatedTasks;

    if (editingTask) {
      updatedTasks = tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: taskData.title,
              description: taskData.description,
              dueDate: taskData.dueDate,
              priority: taskData.priority,
              taskType: taskData.taskType,
            }
          : task
      );

      setEditingTask(null);
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        taskType: taskData.taskType,
        completed: false,
      };

      updatedTasks = [...tasks, newTask];
    }

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }


  function handleEdit(task) {
    setEditingTask(task);
  }


  function handleCancelEdit() {
    setEditingTask(null);
  }

  function handleDelete(id, confirmationText) {
    const confirmed = window.confirm(
      confirmationText ?? translate(language, 'Are you sure you want to delete this task?')
    );

    if (!confirmed) {
      return;
    }

    const updatedTasks = tasks.filter((task) => task.id !== id);

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    if (editingTask && editingTask.id === id) {
      setEditingTask(null);
    }
  }


  function handleToggleComplete(id) {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  

  return (
    <LanguageProvider language={language}>
      <div className="app-shell">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} />
        <main className="main-content">
        <div className="page-panel" hidden={activePage !== 'dashboard'}>
          <DashboardPage
            plannedMeals={plannedMeals}
            groceryPurchases={groceryPurchases}
            todayKey={todayKey}
            currentHour={currentHour}
            firstDayOfWeek={preferences.firstDayOfWeek}
            onToggleGroceryPurchased={handleToggleGroceryPurchased}
            onNavigate={handleNavigate}
            tasks={tasks}
            taskFilter={taskFilter}
            onTaskFilterChange={setTaskFilter}
            onSave={handleSave}
            editingTask={editingTask}
            onCancelEdit={handleCancelEdit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />
        </div>
        <div className="page-panel" hidden={activePage !== 'meal-planner'}>
          <MealPlanner
            meals={plannedMeals}
            recipes={RECIPES}
            storageError={mealStorageError}
            onSaveMeal={handleSavePlannedMeal}
            onRemoveMeal={handleRemovePlannedMeal}
            firstDayOfWeek={preferences.firstDayOfWeek}
            onBrowseRecipes={handleBrowseRecipes}
            recipeSelection={recipeSelection}
            onRecipeApplied={handleRecipeApplied}
          />
        </div>
        <div className="page-panel" hidden={activePage !== 'recipes'}>
          <RecipesPage
            plannedMeals={plannedMeals}
            recipeSelectionMode={recipeSelectionMode}
            onChooseRecipe={handleChooseRecipe}
            onCancelRecipeSelection={handleCancelRecipeSelection}
          />
        </div>
        <div className="page-panel" hidden={activePage !== 'grocery-list'}>
          <GroceryList
            items={weeklyGroceries.items}
            weekStart={weeklyGroceries.weekStart}
            total={weeklyGroceries.total}
            purchasedCount={weeklyGroceries.purchasedCount}
            remaining={weeklyGroceries.remaining}
            onTogglePurchased={handleToggleGroceryPurchased}
          />
          <PlannedIngredientsPage plannedMeals={plannedMeals} recipes={RECIPES} />
        </div>
        <div className="page-panel" hidden={activePage !== 'settings'}>
          <SettingsPage
            language={language}
            languageError={languageError}
            onLanguageChange={handleLanguageChange}
            firstDayOfWeek={preferences.firstDayOfWeek}
            onFirstDayOfWeekChange={handleFirstDayOfWeekChange}
          />
        </div>
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
      