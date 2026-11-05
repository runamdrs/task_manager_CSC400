// Ingredient name normalization and quantity consolidation.
//
// Quantities are free text such as "250 g", "1 1/2 cups", "2 cloves", "4" or
// "to taste". Identical units are added directly ("1 cup + 1/2 cup" becomes
// "1 1/2 cups"). Different but compatible units (cups and tbsp, g and lb) are
// converted to a base unit first. Anything that cannot be parsed is kept
// verbatim so no information is lost.

const UNITS = {
  tsp: { aliases: ['tsp', 'teaspoon', 'teaspoons'], group: 'volume', factor: 4.92892, singular: 'tsp', plural: 'tsp', fractions: true },
  tbsp: { aliases: ['tbsp', 'tablespoon', 'tablespoons'], group: 'volume', factor: 14.7868, singular: 'tbsp', plural: 'tbsp', fractions: true },
  cup: { aliases: ['c', 'cup', 'cups'], group: 'volume', factor: 236.588, singular: 'cup', plural: 'cups', fractions: true },
  ml: { aliases: ['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'], group: 'volume', factor: 1, singular: 'mL', plural: 'mL' },
  l: { aliases: ['l', 'liter', 'liters', 'litre', 'litres'], group: 'volume', factor: 1000, singular: 'L', plural: 'L' },
  g: { aliases: ['g', 'gram', 'grams'], group: 'weight', factor: 1, singular: 'g', plural: 'g' },
  kg: { aliases: ['kg', 'kilogram', 'kilograms'], group: 'weight', factor: 1000, singular: 'kg', plural: 'kg' },
  oz: { aliases: ['oz', 'ounce', 'ounces'], group: 'weight', factor: 28.3495, singular: 'oz', plural: 'oz', fractions: true },
  lb: { aliases: ['lb', 'lbs', 'pound', 'pounds'], group: 'weight', factor: 453.592, singular: 'lb', plural: 'lb', fractions: true },
  each: { aliases: ['', 'each', 'item', 'items', 'piece', 'pieces'], group: 'count', factor: 1, singular: '', plural: '', fractions: true },
  clove: { aliases: ['clove', 'cloves'], group: 'clove', factor: 1, singular: 'clove', plural: 'cloves', fractions: true },
  pinch: { aliases: ['pinch', 'pinches'], group: 'pinch', factor: 1, singular: 'pinch', plural: 'pinches', fractions: true },
  can: { aliases: ['can', 'cans'], group: 'can', factor: 1, singular: 'can', plural: 'cans', fractions: true },
  package: { aliases: ['package', 'packages', 'pkg', 'pkgs'], group: 'package', factor: 1, singular: 'package', plural: 'packages', fractions: true },
};

const UNIT_BY_ALIAS = new Map(
  Object.entries(UNITS).flatMap(([id, unit]) =>
    unit.aliases.map((alias) => [alias, { id, ...unit }])
  )
);

// Display units used when mixed units in one group are converted to a base.
const BASE_DISPLAY_UNITS = {
  volume: [{ min: 1000, id: 'l' }, { min: 0, id: 'ml' }],
  weight: [{ min: 1000, id: 'kg' }, { min: 0, id: 'g' }],
};

const COMMON_FRACTIONS = [
  [1 / 8, '1/8'], [1 / 4, '1/4'], [1 / 3, '1/3'], [3 / 8, '3/8'], [1 / 2, '1/2'],
  [5 / 8, '5/8'], [2 / 3, '2/3'], [3 / 4, '3/4'], [7 / 8, '7/8'],
];

const QUANTITY_PATTERN = /^(\d+\s+\d+\s*\/\s*\d+|\d+\s*\/\s*\d+|\d+(?:\.\d+)?)\s*(.*)$/;

export function normalizeIngredientName(name) {
  return name.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function parseAmount(text) {
  const parts = text.trim().split(/\s+(?=\d+\s*\/)/);
  return parts.reduce((total, part) => {
    const [numerator, denominator] = part.replace(/\s/g, '').split('/');
    return total + (denominator ? Number(numerator) / Number(denominator) : Number(numerator));
  }, 0);
}

function parseQuantity(text) {
  const match = text.match(QUANTITY_PATTERN);
  if (!match) return null;

  const amount = parseAmount(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const unitText = match[2].trim().toLocaleLowerCase().replace(/\.$/, '');
  const unit = UNIT_BY_ALIAS.get(unitText) ?? {
    // Unknown units ("medium", "cups cooked") only combine with themselves.
    id: `custom:${unitText}`,
    group: `custom:${unitText}`,
    factor: 1,
    singular: match[2].trim(),
    plural: match[2].trim(),
    fractions: true,
  };

  return { amount, unit };
}

function formatDecimal(amount) {
  return Number(amount.toFixed(amount >= 100 ? 0 : 2)).toString();
}

function formatFraction(amount) {
  const whole = Math.floor(amount);
  const remainder = amount - whole;
  if (remainder < 0.02) return String(whole);
  if (remainder > 0.98) return String(whole + 1);

  const fraction = COMMON_FRACTIONS.find(([value]) => Math.abs(remainder - value) < 0.02);
  if (!fraction) return formatDecimal(amount);
  return whole ? `${whole} ${fraction[1]}` : fraction[1];
}

function formatWithUnit(amount, unit) {
  const amountText = unit.fractions ? formatFraction(amount) : formatDecimal(amount);
  const label = amount > 1 ? unit.plural : unit.singular;
  return label ? `${amountText} ${label}` : amountText;
}

/**
 * Combines quantity texts for one ingredient.
 *
 * Returns `display`, a readable combined quantity, and `totals`, a plain
 * object keyed by unit group with base-unit amounts. Unparseable or missing
 * quantities are recorded with a null amount. `totals` is JSON-safe so it can
 * be stored and compared later with `isRequirementCovered`.
 */
export function summarizeQuantities(quantityTexts) {
  const groups = new Map();
  const rawParts = [];
  const totals = {};
  let hasUnspecified = false;

  quantityTexts.forEach((value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) {
      hasUnspecified = true;
      return;
    }

    const parsed = parseQuantity(text);
    if (!parsed) {
      const key = `raw:${text.toLocaleLowerCase()}`;
      if (!(key in totals)) {
        totals[key] = null;
        rawParts.push(text);
      }
      return;
    }

    const { amount, unit } = parsed;
    if (!groups.has(unit.group)) groups.set(unit.group, new Map());
    const byUnit = groups.get(unit.group);
    const existing = byUnit.get(unit.id);
    byUnit.set(unit.id, { unit, amount: (existing?.amount ?? 0) + amount });
  });

  const parts = [];
  groups.forEach((byUnit, group) => {
    const entries = [...byUnit.values()];
    const baseAmount = entries.reduce((sum, { unit, amount }) => sum + amount * unit.factor, 0);
    totals[group] = baseAmount;

    if (entries.length === 1) {
      parts.push(formatWithUnit(entries[0].amount, entries[0].unit));
      return;
    }

    const displayUnits = BASE_DISPLAY_UNITS[group];
    if (displayUnits) {
      const { id } = displayUnits.find(({ min }) => baseAmount >= min);
      parts.push(formatWithUnit(baseAmount / UNITS[id].factor, UNITS[id]));
    } else {
      // Only the count group can reach here ("4" and "4 each" both mean items).
      parts.push(formatWithUnit(baseAmount, UNITS.each));
    }
  });

  parts.push(...rawParts);
  if (hasUnspecified) {
    totals.unspecified = null;
    if (parts.length > 0) parts.push('quantity unspecified');
  }

  return { display: parts.join(' + '), totals };
}

/**
 * True when a purchased amount satisfies the current requirement: every unit
 * group needed now was purchased, in at least the required amount.
 */
export function isRequirementCovered(required, purchased) {
  return Object.entries(required).every(([group, amount]) => {
    if (!purchased || !(group in purchased)) return false;
    if (amount === null) return true;
    return typeof purchased[group] === 'number' && amount <= purchased[group] + 1e-6;
  });
}
