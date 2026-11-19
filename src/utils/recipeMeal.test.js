import { describe, expect, it } from 'vitest';
import { createMealFromRecipe } from './recipeMeal.js';

describe('createMealFromRecipe', () => {
  const recipe = {
    id: 'overnight-oats',
    title: 'Overnight Oats',
    prepMinutes: 5,
    cookMinutes: 0,
    imageUrl: '/oats.jpg',
    ingredients: [
      { name: 'Rolled oats', amount: '1/2 cup' },
      { name: 'Milk', quantity: '1 cup' },
    ],
  };

  it('uses the selected date and category instead of the recipe meal type', () => {
    expect(createMealFromRecipe(recipe, '2026-11-23', 'Dinner')).toEqual({
      recipeId: 'overnight-oats',
      name: 'Overnight Oats',
      date: '2026-11-23',
      category: 'Dinner',
      ingredients: [
        { name: 'Rolled oats', quantity: '1/2 cup' },
        { name: 'Milk', quantity: '1 cup' },
      ],
      preparationTime: 5,
      image: '/oats.jpg',
    });
  });

  it('preserves an existing meal id when replacing its recipe', () => {
    expect(
      createMealFromRecipe(recipe, '2026-11-23', 'Lunch', 'meal-1').id
    ).toBe('meal-1');
  });
});
