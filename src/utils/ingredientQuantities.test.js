import { describe, expect, it } from 'vitest';
import {
  isRequirementCovered,
  normalizeIngredientName,
  summarizeQuantities,
} from './ingredientQuantities.js';

describe('normalizeIngredientName', () => {
  it('ignores case and extra whitespace', () => {
    expect(normalizeIngredientName('  Olive   Oil ')).toBe('olive oil');
  });
});

describe('summarizeQuantities', () => {
  it('adds identical units directly: 1 cup + 1/2 cup = 1 1/2 cups', () => {
    expect(summarizeQuantities(['1 cup', '1/2 cup']).display).toBe('1 1/2 cups');
  });

  it('parses mixed numbers such as "1 1/2 cups"', () => {
    expect(summarizeQuantities(['1 1/2 cups', '1/2 cup']).display).toBe('2 cups');
  });

  it('converts compatible units to a base unit', () => {
    const { display, totals } = summarizeQuantities(['500 g', '1 kg']);
    expect(display).toBe('1.5 kg');
    expect(totals.weight).toBe(1500);
  });

  it('lists incompatible units side by side', () => {
    expect(summarizeQuantities(['2 cloves', '1 tbsp']).display).toBe('2 cloves + 1 tbsp');
  });

  it('keeps unparseable quantities verbatim, once', () => {
    expect(summarizeQuantities(['to taste', 'To Taste', '1 tsp']).display).toBe(
      '1 tsp + to taste'
    );
  });

  it('notes missing quantities without inventing an amount', () => {
    expect(summarizeQuantities(['2', '']).display).toBe('2 + quantity unspecified');
    expect(summarizeQuantities(['']).display).toBe('');
  });
});

describe('isRequirementCovered', () => {
  it('is covered when the purchase meets the requirement', () => {
    expect(isRequirementCovered({ weight: 500 }, { weight: 500 })).toBe(true);
  });

  it('is not covered when more is needed than was purchased', () => {
    expect(isRequirementCovered({ weight: 750 }, { weight: 500 })).toBe(false);
  });

  it('is not covered when a new unit group is needed', () => {
    expect(isRequirementCovered({ weight: 500, clove: 2 }, { weight: 500 })).toBe(false);
  });
});
