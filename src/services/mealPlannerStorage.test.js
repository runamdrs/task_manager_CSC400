import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadPlannedMeals,
  savePlannedMeals,
} from './mealPlannerStorage.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

const linkedMeal = {
  id: 'meal-1',
  recipeId: 'recipe-1',
  name: 'Example recipe',
  date: '2026-11-17',
  category: 'Dinner',
  ingredients: [{ name: 'Tomato', quantity: '2' }],
  preparationTime: 20,
  image: '',
};

describe('mealPlannerStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists recipe-linked planned meals in the shared storage format', () => {
    savePlannedMeals([linkedMeal]);
    expect(loadPlannedMeals()).toEqual([linkedMeal]);
  });

  it('rejects invalid recipe references without losing the saved plan', () => {
    savePlannedMeals([linkedMeal]);
    expect(() => savePlannedMeals([{ ...linkedMeal, recipeId: {} }])).toThrow(
      'Meal data could not be saved because its format is invalid.'
    );
    expect(loadPlannedMeals()).toEqual([linkedMeal]);
  });
});
