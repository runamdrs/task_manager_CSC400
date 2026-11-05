const MEALS_STORAGE_KEY = 'smartprep-meal-planner-meals';
const GROCERY_HANDOFF_STORAGE_KEY = 'smartprep-generated-grocery-list';
const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(date) {
  if (typeof date !== 'string' || !DATE_PATTERN.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isValidMeal(meal) {
  return Boolean(
    meal &&
    typeof meal.id === 'string' &&
    meal.id &&
    typeof meal.name === 'string' &&
    meal.name.trim() &&
    isValidDate(meal.date) &&
    MEAL_CATEGORIES.includes(meal.category) &&
    Array.isArray(meal.ingredients) &&
    meal.ingredients.every((ingredient) =>
      ingredient &&
      typeof ingredient.name === 'string' &&
      typeof ingredient.quantity === 'string'
    ) &&
    typeof meal.preparationTime === 'number' &&
    Number.isFinite(meal.preparationTime) &&
    meal.preparationTime >= 0 &&
    (meal.image === '' || typeof meal.image === 'string')
  );
}

export function loadPlannedMeals() {
  const stored = localStorage.getItem(MEALS_STORAGE_KEY);
  if (stored === null) return [];

  let meals;
  try {
    meals = JSON.parse(stored);
  } catch (error) {
    throw new Error(`Meal data is not valid JSON (${error.message}).`);
  }

  if (!Array.isArray(meals) || !meals.every(isValidMeal)) {
    throw new Error('Saved meal data has an unexpected format.');
  }

  const ids = new Set();
  const occupiedSlots = new Set();
  for (const meal of meals) {
    const slot = `${meal.date}:${meal.category}`;
    if (ids.has(meal.id) || occupiedSlots.has(slot)) {
      throw new Error('Saved meal data contains duplicate meals or occupied slots.');
    }
    ids.add(meal.id);
    occupiedSlots.add(slot);
  }

  return meals;
}

export function savePlannedMeals(meals) {
  if (!Array.isArray(meals) || !meals.every(isValidMeal)) {
    throw new Error('Meal data could not be saved because its format is invalid.');
  }
  localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(meals));
}

export function publishGeneratedGroceryList(groceryList) {
  localStorage.setItem(GROCERY_HANDOFF_STORAGE_KEY, JSON.stringify(groceryList));
  window.dispatchEvent(
    new CustomEvent('smartprep:grocery-list-generated', { detail: groceryList })
  );
}
