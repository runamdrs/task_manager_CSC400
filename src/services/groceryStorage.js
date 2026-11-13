// Persists grocery purchase status only. Grocery items themselves are derived
// from planned meals and recipes (see src/selectors/grocery.js), so they are
// never stored and cannot become orphaned or duplicated.
//
// Provisional: the record format still needs to be confirmed with the Grocery
// List owner. See SMARTPREP_FUTURE_FEATURES.md.

const PURCHASES_STORAGE_KEY = 'smartprep-grocery-purchases';

export function getPurchaseKey(weekStart, itemKey) {
  return `${weekStart}|${itemKey}`;
}

function isValidRecord(record) {
  return Boolean(
    record &&
    typeof record === 'object' &&
    record.totals &&
    typeof record.totals === 'object' &&
    Object.values(record.totals).every((amount) => amount === null || Number.isFinite(amount)) &&
    typeof record.purchasedAt === 'string'
  );
}

/**
 * Returns `{ [purchaseKey]: { totals, quantity, purchasedAt } }`. `totals` is
 * the requirement that was covered when the item was marked purchased.
 */
export function loadGroceryPurchases() {
  try {
    const stored = JSON.parse(localStorage.getItem(PURCHASES_STORAGE_KEY) ?? '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    return Object.fromEntries(
      Object.entries(stored).filter(([, record]) => isValidRecord(record))
    );
  } catch {
    return {};
  }
}

export function saveGroceryPurchases(purchases) {
  localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchases));
}
