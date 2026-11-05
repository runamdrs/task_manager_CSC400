import { describe, expect, it } from 'vitest';
import { getPurchaseKey } from '../services/groceryStorage.js';
import {
  buildGroceryItems,
  getTodayPrep,
  getWeeklyGroceries,
  indexRecipes,
} from './grocery.js';

// Test-only fixtures, shaped like real planned meals and recipes.
const TODAY = '2026-11-05'; // Thursday
const WEEK_START = '2026-11-02'; // Monday

function meal(id, date, category, ingredients, extra = {}) {
  return { id, name: `Meal ${id}`, date, category, ingredients, preparationTime: 10, image: '', ...extra };
}

const recipesById = indexRecipes([
  {
    id: 'r1',
    title: 'Test Recipe',
    ingredients: [
      { name: 'Rice', amount: '1 cup' },
      { name: 'Garlic', amount: '2 cloves' },
    ],
    steps: [],
  },
]);

const noRecipes = new Map();

function purchase(item) {
  return {
    [getPurchaseKey(WEEK_START, item.key)]: {
      totals: item.totals,
      quantity: item.quantity,
      purchasedAt: '2026-11-05T10:00:00.000Z',
    },
  };
}

describe('buildGroceryItems', () => {
  it('consolidates the same ingredient across meals and records each source', () => {
    const items = buildGroceryItems(
      [
        meal('a', TODAY, 'Lunch', [{ name: 'Rice', quantity: '1 cup' }]),
        meal('b', TODAY, 'Dinner', [{ name: ' rice ', quantity: '1/2 cup' }]),
      ],
      noRecipes
    );

    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe('1 1/2 cups');
    expect(items[0].sources.map((source) => source.mealId)).toEqual(['a', 'b']);
  });

  it('lists mismatched units side by side', () => {
    const items = buildGroceryItems(
      [
        meal('a', TODAY, 'Lunch', [{ name: 'Garlic', quantity: '2 cloves' }]),
        meal('b', TODAY, 'Dinner', [{ name: 'Garlic', quantity: '1 tbsp' }]),
      ],
      noRecipes
    );

    expect(items[0].quantity).toBe('2 cloves + 1 tbsp');
  });

  it('reads ingredients live from a linked recipe', () => {
    const items = buildGroceryItems(
      [meal('a', TODAY, 'Lunch', [{ name: 'Ignored', quantity: '1' }], { recipeId: 'r1' })],
      recipesById
    );

    expect(items.map((item) => `${item.name}: ${item.quantity}`)).toEqual([
      'Garlic: 2 cloves',
      'Rice: 1 cup',
    ]);
  });

  it('falls back to the meal ingredients when the recipe no longer exists', () => {
    const items = buildGroceryItems(
      [meal('a', TODAY, 'Lunch', [{ name: 'Eggs', quantity: '2' }], { recipeId: 'gone' })],
      recipesById
    );

    expect(items.map((item) => item.name)).toEqual(['Eggs']);
  });

  it('skips ingredients with blank names', () => {
    const items = buildGroceryItems(
      [meal('a', TODAY, 'Lunch', [{ name: '  ', quantity: '1' }])],
      noRecipes
    );

    expect(items).toEqual([]);
  });
});

describe('getWeeklyGroceries', () => {
  const lunch = meal('a', TODAY, 'Lunch', [{ name: 'Rice', quantity: '1 cup' }]);
  const dinner = meal('b', TODAY, 'Dinner', [
    { name: 'Rice', quantity: '1 cup' },
    { name: 'Garlic', quantity: '2 cloves' },
  ]);

  it('includes only meals from the Monday-Sunday week containing the date', () => {
    const weekly = getWeeklyGroceries(
      [
        meal('sun-before', '2026-11-01', 'Lunch', [{ name: 'Old', quantity: '1' }]),
        meal('mon', '2026-11-02', 'Lunch', [{ name: 'Mon', quantity: '1' }]),
        meal('sun', '2026-11-08', 'Lunch', [{ name: 'Sun', quantity: '1' }]),
        meal('mon-after', '2026-11-09', 'Lunch', [{ name: 'Next', quantity: '1' }]),
      ],
      noRecipes,
      {},
      TODAY
    );

    expect(weekly.weekStart).toBe('2026-11-02');
    expect(weekly.weekEnd).toBe('2026-11-08');
    expect(weekly.items.map((item) => item.name)).toEqual(['Mon', 'Sun']);
  });

  it('keeps an ingredient that another meal still needs when one meal is removed', () => {
    const before = getWeeklyGroceries([lunch, dinner], noRecipes, {}, TODAY);
    expect(before.items.map((item) => `${item.name}: ${item.quantity}`)).toEqual([
      'Garlic: 2 cloves',
      'Rice: 2 cups',
    ]);

    const afterRemovingDinner = getWeeklyGroceries([lunch], noRecipes, {}, TODAY);
    expect(afterRemovingDinner.items.map((item) => `${item.name}: ${item.quantity}`)).toEqual([
      'Rice: 1 cup',
    ]);

    const afterRemovingAll = getWeeklyGroceries([], noRecipes, {}, TODAY);
    expect(afterRemovingAll.items).toEqual([]);
    expect(afterRemovingAll.total).toBe(0);
  });

  it('counts purchased and remaining items', () => {
    const before = getWeeklyGroceries([lunch, dinner], noRecipes, {}, TODAY);
    const rice = before.items.find((item) => item.key === 'rice');

    const weekly = getWeeklyGroceries([lunch, dinner], noRecipes, purchase(rice), TODAY);

    expect(weekly.items.find((item) => item.key === 'rice').status).toBe('purchased');
    expect(weekly.total).toBe(2);
    expect(weekly.purchasedCount).toBe(1);
    expect(weekly.remaining).toBe(1);
  });

  it('marks a purchased item as "needs-more" when a new meal raises the requirement', () => {
    const lunchOnly = getWeeklyGroceries([lunch], noRecipes, {}, TODAY);
    const purchases = purchase(lunchOnly.items[0]); // bought 1 cup of rice

    const withDinner = getWeeklyGroceries([lunch, dinner], noRecipes, purchases, TODAY);
    const rice = withDinner.items.find((item) => item.key === 'rice');

    expect(rice.status).toBe('needs-more');
    expect(rice.quantity).toBe('2 cups');
    expect(withDinner.purchasedCount).toBe(0);
  });

  it('marks a purchased item as "needs-more" when a new unit is required', () => {
    const lunchOnly = getWeeklyGroceries([lunch], noRecipes, {}, TODAY);
    const purchases = purchase(lunchOnly.items[0]);
    const snack = meal('c', TODAY, 'Breakfast', [{ name: 'Rice', quantity: '200 g' }]);

    const weekly = getWeeklyGroceries([lunch, snack], noRecipes, purchases, TODAY);

    expect(weekly.items[0].status).toBe('needs-more');
  });

  it('ignores purchases recorded for a different week', () => {
    const lunchOnly = getWeeklyGroceries([lunch], noRecipes, {}, TODAY);
    const rice = lunchOnly.items[0];
    const lastWeek = {
      [getPurchaseKey('2026-10-26', rice.key)]: {
        totals: rice.totals,
        quantity: rice.quantity,
        purchasedAt: '2026-10-28T10:00:00.000Z',
      },
    };

    const weekly = getWeeklyGroceries([lunch], noRecipes, lastWeek, TODAY);

    expect(weekly.items[0].status).toBe('to-buy');
  });
});

describe('getTodayPrep', () => {
  const tomorrow = meal('t', '2026-11-06', 'Lunch', [{ name: 'Rice', quantity: '5 cups' }]);
  const breakfast = meal('a', TODAY, 'Breakfast', [{ name: 'Eggs', quantity: '2' }]);
  const dinner = meal('b', TODAY, 'Dinner', [
    { name: 'Eggs', quantity: '1' },
    { name: 'Rice', quantity: '1 cup' },
  ]);
  const meals = [tomorrow, breakfast, dinner];

  it("groups today's meals by category and combines today's quantities only", () => {
    const weekly = getWeeklyGroceries(meals, noRecipes, {}, TODAY);
    const prep = getTodayPrep(meals, noRecipes, weekly, TODAY);

    expect(prep.mealCount).toBe(2);
    expect(prep.mealsByCategory.Breakfast.map((m) => m.id)).toEqual(['a']);
    expect(prep.mealsByCategory.Lunch).toEqual([]);
    expect(prep.mealsByCategory.Dinner.map((m) => m.id)).toEqual(['b']);

    const rice = prep.groceries.find((item) => item.key === 'rice');
    expect(rice.quantity).toBe('1 cup');
    expect(rice.weeklyItem.quantity).toBe('6 cups');
    expect(prep.groceries.find((item) => item.key === 'eggs').quantity).toBe('3');
  });

  it('hides items already purchased for the week', () => {
    const before = getWeeklyGroceries(meals, noRecipes, {}, TODAY);
    const eggs = before.items.find((item) => item.key === 'eggs');
    const weekly = getWeeklyGroceries(meals, noRecipes, purchase(eggs), TODAY);

    const prep = getTodayPrep(meals, noRecipes, weekly, TODAY);

    expect(prep.groceries.map((item) => item.key)).toEqual(['rice']);
    expect(prep.ingredientCount).toBe(2);
  });

  it('is empty when nothing is planned for today', () => {
    const weekly = getWeeklyGroceries([tomorrow], noRecipes, {}, TODAY);
    const prep = getTodayPrep([tomorrow], noRecipes, weekly, TODAY);

    expect(prep.mealCount).toBe(0);
    expect(prep.groceries).toEqual([]);
  });
});
