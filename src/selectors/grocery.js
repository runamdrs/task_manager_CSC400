// Pure selectors that derive grocery data from planned meals and recipes.
// Shared by the Dashboard now and intended for the Grocery List page.

import { getPurchaseKey } from '../services/groceryStorage.js';
import { getWeekDateKeys } from '../utils/dates.js';
import {
  isRequirementCovered,
  normalizeIngredientName,
  summarizeQuantities,
} from '../utils/ingredientQuantities.js';

export const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner'];

export function indexRecipes(recipes) {
  return new Map(recipes.map((recipe) => [recipe.id, recipe]));
}

/**
 * A meal linked to a recipe (optional `recipeId`, not yet part of the Meal
 * Planner contract) reads ingredients live from that recipe. Otherwise the
 * meal's own ingredients are used.
 */
export function getMealIngredients(meal, recipesById) {
  const recipe = meal.recipeId ? recipesById.get(meal.recipeId) : null;
  if (recipe) {
    return recipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity ?? ingredient.amount ?? '',
    }));
  }
  return Array.isArray(meal.ingredients) ? meal.ingredients : [];
}

/** Consolidates the ingredients of the given meals into one item per ingredient. */
export function buildGroceryItems(meals, recipesById) {
  const grouped = new Map();

  meals.forEach((meal) => {
    getMealIngredients(meal, recipesById).forEach((ingredient) => {
      const name = typeof ingredient.name === 'string' ? ingredient.name.trim() : '';
      if (!name) return;

      const key = normalizeIngredientName(name);
      if (!grouped.has(key)) {
        grouped.set(key, { key, name, quantities: [], sources: new Map() });
      }

      const entry = grouped.get(key);
      entry.quantities.push(ingredient.quantity ?? '');
      if (!entry.sources.has(meal.id)) {
        entry.sources.set(meal.id, {
          mealId: meal.id,
          mealName: meal.name,
          date: meal.date,
          category: meal.category,
          recipeId: meal.recipeId ?? null,
        });
      }
    });
  });

  return [...grouped.values()]
    .map(({ key, name, quantities, sources }) => {
      const { display, totals } = summarizeQuantities(quantities);
      return { key, name, quantity: display, totals, sources: [...sources.values()] };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getPurchaseStatus(item, record) {
  if (!record) return 'to-buy';
  return isRequirementCovered(item.totals, record.totals) ? 'purchased' : 'needs-more';
}

/** Grocery items and progress for the Monday-Sunday week containing `dateKey`. */
export function getWeeklyGroceries(meals, recipesById, purchases, dateKey) {
  const weekDates = getWeekDateKeys(dateKey);
  const weekStart = weekDates[0];
  const weekDateSet = new Set(weekDates);
  const weekMeals = meals.filter((meal) => weekDateSet.has(meal.date));

  const items = buildGroceryItems(weekMeals, recipesById).map((item) => {
    const status = getPurchaseStatus(item, purchases[getPurchaseKey(weekStart, item.key)]);
    return { ...item, status };
  });
  const purchasedCount = items.filter((item) => item.status === 'purchased').length;

  return {
    weekStart,
    weekEnd: weekDates[6],
    weekMeals,
    items,
    total: items.length,
    purchasedCount,
    remaining: items.length - purchasedCount,
  };
}

/**
 * Today's meals grouped by category, plus the ingredients today's meals need
 * that are not yet purchased. Each grocery entry shows today's combined
 * quantity and carries its weekly item, whose purchase status it shares.
 */
export function getTodayPrep(meals, recipesById, weekly, dateKey) {
  const todayMeals = meals.filter((meal) => meal.date === dateKey);
  const mealsByCategory = Object.fromEntries(
    MEAL_CATEGORIES.map((category) => [
      category,
      todayMeals.filter((meal) => meal.category === category),
    ])
  );

  const weeklyByKey = new Map(weekly.items.map((item) => [item.key, item]));
  const todayItems = buildGroceryItems(todayMeals, recipesById);
  const groceries = todayItems
    .map((item) => ({ ...item, weeklyItem: weeklyByKey.get(item.key) }))
    .filter((item) => item.weeklyItem && item.weeklyItem.status !== 'purchased');

  return {
    mealCount: todayMeals.length,
    mealsByCategory,
    ingredientCount: todayItems.length,
    groceries,
  };
}
