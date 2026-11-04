import { useEffect, useMemo, useState } from 'react';
import MealFormModal from './MealFormModal.jsx';
import {
  loadPlannedMeals,
  publishGeneratedGroceryList,
  savePlannedMeals,
} from '../services/mealPlannerStorage.js';

const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function getMonday(date) {
  const monday = new Date(date);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function shiftDate(date, days) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

function formatWeekRange(start, end) {
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (start.getFullYear() !== year) {
    return `${startMonth} ${startDay}, ${start.getFullYear()} – ${endMonth} ${endDay}, ${year}`;
  }
  if (start.getMonth() !== end.getMonth()) {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay}–${endDay}, ${year}`;
}

function getWeekDates(weekStart) {
  return WEEKDAY_NAMES.map((weekday, index) => {
    const date = shiftDate(weekStart, index);
    return { weekday, date, dateKey: toDateKey(date) };
  });
}

function normalizeIngredientName(name) {
  return name.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

const UNIT_ALIASES = {
  tsp: ['tsp', 'teaspoon', 'teaspoons'],
  tbsp: ['tbsp', 'tablespoon', 'tablespoons'],
  cup: ['c', 'cup', 'cups'],
  ml: ['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'],
  l: ['l', 'liter', 'liters', 'litre', 'litres'],
  g: ['g', 'gram', 'grams'],
  kg: ['kg', 'kilogram', 'kilograms'],
  oz: ['oz', 'ounce', 'ounces'],
  lb: ['lb', 'lbs', 'pound', 'pounds'],
  each: ['each', 'item', 'items', 'piece', 'pieces'],
  clove: ['clove', 'cloves'],
  pinch: ['pinch', 'pinches'],
  can: ['can', 'cans'],
  package: ['package', 'packages', 'pkg', 'pkgs'],
};

const UNIT_FACTORS = {
  tsp: { group: 'volume', factor: 4.92892, label: 'mL' },
  tbsp: { group: 'volume', factor: 14.7868, label: 'mL' },
  cup: { group: 'volume', factor: 236.588, label: 'mL' },
  ml: { group: 'volume', factor: 1, label: 'mL' },
  l: { group: 'volume', factor: 1000, label: 'mL' },
  g: { group: 'weight', factor: 1, label: 'g' },
  kg: { group: 'weight', factor: 1000, label: 'g' },
  oz: { group: 'weight', factor: 28.3495, label: 'g' },
  lb: { group: 'weight', factor: 453.592, label: 'g' },
  each: { group: 'count', factor: 1, label: 'each' },
  '': { group: 'count', factor: 1, label: 'each' },
};

function normalizeUnit(unit) {
  const normalized = unit.toLocaleLowerCase().replace(/\.$/, '');
  return Object.entries(UNIT_ALIASES).find(([, aliases]) =>
    aliases.includes(normalized)
  )?.[0] ?? normalized;
}

function parseQuantity(quantity) {
  const match = quantity.trim().match(/^((?:\d+\s*\/\s*\d+)|(?:\d+(?:\.\d+)?))\s*(.*)$/);
  if (!match) return null;

  const amountText = match[1].replace(/\s/g, '');
  const [numerator, denominator] = amountText.split('/');
  const amount = denominator
    ? Number(numerator) / Number(denominator)
    : Number(amountText);
  if (!Number.isFinite(amount)) return null;

  const unit = normalizeUnit(match[2].trim());
  return { amount, unit };
}

function formatAmount(amount) {
  return Number(amount.toFixed(2)).toString();
}

function aggregateIngredients(meals) {
  const grouped = new Map();

  meals.forEach((meal) => {
    meal.ingredients.forEach((ingredient) => {
      const name = ingredient.name.trim();
      if (!name) return;

      const nameKey = normalizeIngredientName(name);
      if (!grouped.has(nameKey)) {
        grouped.set(nameKey, { name, quantities: new Map(), unspecified: 0 });
      }

      const aggregate = grouped.get(nameKey);
      const quantity = ingredient.quantity.trim();
      if (!quantity) {
        aggregate.unspecified += 1;
        return;
      }

      const parsed = parseQuantity(quantity);
      if (!parsed) {
        aggregate.quantities.set(
          `raw:${quantity.toLocaleLowerCase()}`,
          { amount: null, display: quantity }
        );
        return;
      }

      const unitInfo = UNIT_FACTORS[parsed.unit];
      const group = unitInfo?.group ?? `unit:${parsed.unit}`;
      const key = group.startsWith('unit:') ? `${group}:${parsed.unit}` : group;
      const convertedAmount = unitInfo ? parsed.amount * unitInfo.factor : parsed.amount;
      const existing = aggregate.quantities.get(key);
      aggregate.quantities.set(key, {
        amount: (existing?.amount ?? 0) + convertedAmount,
        label: unitInfo?.label ?? parsed.unit,
        isUnitless: !parsed.unit,
      });
    });
  });

  return [...grouped.values()].map(({ name, quantities, unspecified }) => {
    const quantityParts = [...quantities.values()].map((quantity) => {
      if (quantity.amount === null) return quantity.display;
      const amount = formatAmount(quantity.amount);
      return quantity.label ? `${amount} ${quantity.label}` : amount;
    });
    if (unspecified) quantityParts.push('quantity unspecified');
    return {
      name,
      quantity: quantityParts.join(' + '),
    };
  });
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (name === 'plus') {
    return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  }
  if (name === 'cart') {
    return <svg {...common}><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
  }
  if (name === 'calendar') {
    return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
  }
  if (name === 'clock') {
    return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  }
  if (name === 'left') {
    return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
  }
  if (name === 'right') {
    return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
  }
  if (name === 'close') {
    return <svg {...common}><path d="m18 6-12 12M6 6l12 12" /></svg>;
  }
  if (name === 'food') {
    return <svg {...common}><path d="M4 13h16a8 8 0 0 1-16 0Z" /><path d="M12 5v3M7 7l2 2M17 7l-2 2" /></svg>;
  }
  if (name === 'edit') {
    return <svg {...common}><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></svg>;
  }
  return <svg {...common}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>;
}

function MealCard({ meal, onEdit, onRemove }) {
  return (
    <article className="mp-meal-card">
      {meal.image ? (
        <img className="mp-meal-image" src={meal.image} alt="" />
      ) : (
        <div className="mp-meal-image mp-meal-image-placeholder" aria-hidden="true">
          <Icon name="food" size={27} />
        </div>
      )}
      <h4 className="mp-meal-name">{meal.name}</h4>
      <p className="mp-meal-time">
        <Icon name="clock" size={14} />
        <span>{meal.preparationTime} min</span>
      </p>
      <div className="mp-meal-actions">
        <button type="button" className="mp-edit-button" onClick={() => onEdit(meal)}>
          <Icon name="edit" size={13} />
          Edit
        </button>
        <button type="button" className="mp-remove-button" onClick={() => onRemove(meal)}>
          <Icon name="remove" size={13} />
          Remove
        </button>
      </div>
    </article>
  );
}

function MealPlanner({ onPlanChange }) {
  const [meals, setMeals] = useState([]);
  const [storageError, setStorageError] = useState('');
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [weekPickerOpen, setWeekPickerOpen] = useState(false);
  const [modalState, setModalState] = useState(null);
  const [generatedList, setGeneratedList] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    try {
      setMeals(loadPlannedMeals());
    } catch (error) {
      setStorageError(`Saved meals could not be loaded: ${error.message}`);
    }
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekEnd = weekDates[6].date;
  const visibleMeals = useMemo(() => {
    const dateKeys = new Set(weekDates.map(({ dateKey }) => dateKey));
    return meals.filter((meal) => dateKeys.has(meal.date));
  }, [meals, weekDates]);
  const mealBySlot = useMemo(() => {
    const slots = new Map();
    visibleMeals.forEach((meal) => slots.set(`${meal.date}:${meal.category}`, meal));
    return slots;
  }, [visibleMeals]);

  useEffect(() => {
    if (!onPlanChange) return;

    const currentWeekStart = getMonday(new Date());
    if (toDateKey(currentWeekStart) !== toDateKey(weekStart)) return;

    onPlanChange(
      weekDates.map(({ dateKey }) => {
        const dayPlan = { Breakfast: '', Lunch: '', Dinner: '' };
        visibleMeals
          .filter((meal) => meal.date === dateKey)
          .forEach((meal) => {
            dayPlan[meal.category] = meal.name;
          });
        return dayPlan;
      })
    );
  }, [onPlanChange, visibleMeals, weekDates, weekStart]);

  function openAddMeal(date = toDateKey(weekStart), category = 'Breakfast') {
    setActionError('');
    setModalState({
      meal: null,
      initialDate: date,
      initialCategory: category,
      occupiedMeal: null,
    });
  }

  function openEditMeal(meal) {
    setActionError('');
    setModalState({
      meal,
      initialDate: meal.date,
      initialCategory: meal.category,
      occupiedMeal: null,
    });
  }

  function handleSaveMeal(mealData) {
    const occupiedMeal = meals.find(
      (meal) =>
        meal.id !== mealData.id &&
        meal.date === mealData.date &&
        meal.category === mealData.category
    );

    if (occupiedMeal) {
      setModalState((current) => ({ ...current, occupiedMeal }));
      return { ok: false, occupiedMeal };
    }

    const updatedMeals = mealData.id
      ? meals.map((meal) => meal.id === mealData.id ? mealData : meal)
      : [...meals, { ...mealData, id: crypto.randomUUID() }];

    try {
      savePlannedMeals(updatedMeals);
      setMeals(updatedMeals);
      setActionError('');
      setModalState(null);
      return { ok: true };
    } catch (error) {
      const message = `Meal could not be saved: ${error.message}`;
      setActionError(message);
      return { ok: false, error: message };
    }
  }

  function handleRemoveMeal(meal) {
    if (!window.confirm(`Remove "${meal.name}" from the meal plan?`)) return;

    const updatedMeals = meals.filter((savedMeal) => savedMeal.id !== meal.id);
    try {
      savePlannedMeals(updatedMeals);
      setMeals(updatedMeals);
      setActionError('');
    } catch (error) {
      setActionError(`Meal could not be removed: ${error.message}`);
    }
  }

  function handleGenerateGroceries() {
    const groceryList = {
      weekStart: toDateKey(weekStart),
      weekEnd: toDateKey(weekEnd),
      generatedAt: new Date().toISOString(),
      items: aggregateIngredients(visibleMeals),
    };

    try {
      publishGeneratedGroceryList(groceryList);
      setGeneratedList(groceryList);
      setActionError('');
    } catch (error) {
      setActionError(`Grocery list could not be generated: ${error.message}`);
    }
  }

  function changeWeek(dateKey) {
    if (!dateKey) return;
    setWeekStart(getMonday(fromDateKey(dateKey)));
    setWeekPickerOpen(false);
  }

  return (
    <section className="app meal-planner-page meal-planner" aria-labelledby="mp-heading">
      <header className="mp-page-header">
        <div className="mp-heading-copy">
          <p className="mp-eyebrow">02 — WEEKLY PLAN</p>
          <h2 id="mp-heading" className="mp-page-title">Meal Planner</h2>
          <p className="mp-subtitle">Build a weekly plan that works for you.</p>
        </div>
        <div className="mp-header-actions">
          <button type="button" className="mp-button mp-button-secondary" onClick={handleGenerateGroceries}>
            <Icon name="cart" />
            Generate Grocery List
          </button>
          <button type="button" className="mp-button mp-button-primary" onClick={() => openAddMeal()}>
            <Icon name="plus" />
            Add Meal
          </button>
        </div>
      </header>

      <div className="mp-week-toolbar">
        <div className="mp-week-arrows" aria-label="Change week">
          <button
            type="button"
            className="mp-icon-button"
            aria-label="Previous week"
            onClick={() => setWeekStart((current) => shiftDate(current, -7))}
          >
            <Icon name="left" />
          </button>
          <button
            type="button"
            className="mp-icon-button"
            aria-label="Next week"
            onClick={() => setWeekStart((current) => shiftDate(current, 7))}
          >
            <Icon name="right" />
          </button>
        </div>

        <div className="mp-week-picker-wrap">
          <Icon name="calendar" />
          <span className="mp-week-range">{formatWeekRange(weekStart, weekEnd)}</span>
          <button
            type="button"
            className="mp-change-week"
            aria-expanded={weekPickerOpen}
            onClick={() => setWeekPickerOpen((open) => !open)}
          >
            CHANGE WEEK
          </button>
          {weekPickerOpen && (
            <div className="mp-week-picker">
              <label htmlFor="mp-week-date">Choose any date in the week</label>
              <input
                id="mp-week-date"
                type="date"
                value={toDateKey(weekStart)}
                onChange={(event) => changeWeek(event.target.value)}
              />
            </div>
          )}
        </div>

        <p className="mp-meal-count">
          <strong>{visibleMeals.length}</strong> {visibleMeals.length === 1 ? 'meal' : 'meals'} planned
        </p>
      </div>

      {(storageError || actionError) && (
        <p className="mp-error" role="alert">{storageError || actionError}</p>
      )}

      {generatedList && (
        <section className="mp-grocery-result" aria-labelledby="mp-grocery-heading">
          <div className="mp-grocery-heading">
            <div>
              <p className="mp-eyebrow">GENERATED FOR THIS WEEK</p>
              <h3 id="mp-grocery-heading">Grocery list</h3>
            </div>
            <button type="button" className="mp-icon-button" aria-label="Close grocery list" onClick={() => setGeneratedList(null)}>
              <Icon name="close" />
            </button>
          </div>
          {generatedList.items.length === 0 ? (
            <p className="mp-grocery-empty">Add ingredients to this week’s meals to build your grocery list.</p>
          ) : (
            <ul className="mp-grocery-items">
              {generatedList.items.map((item) => (
                <li key={normalizeIngredientName(item.name)}>
                  <span>{item.name}</span>
                  {item.quantity && <span className="mp-grocery-quantity">{item.quantity}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mp-calendar-scroll" aria-label="Weekly meal calendar">
        <div className="mp-calendar-grid">
          {weekDates.map(({ weekday, date, dateKey }) => (
            <section className="mp-day-column" key={dateKey} aria-label={`${weekday}, ${dateKey}`}>
              <header className="mp-day-header">
                <span className="mp-day-name">{weekday.slice(0, 3)}</span>
                <time className="mp-day-date" dateTime={dateKey}>
                  {date.toLocaleDateString('en-US', { month: 'short' })} {date.getDate()}
                </time>
              </header>
              <div className="mp-day-meals">
                {MEAL_CATEGORIES.map((category) => {
                  const meal = mealBySlot.get(`${dateKey}:${category}`);
                  return (
                    <section className="mp-meal-slot" key={category} aria-label={category}>
                      <h3 className="mp-category-label">{category}</h3>
                      {meal ? (
                        <MealCard meal={meal} onEdit={openEditMeal} onRemove={handleRemoveMeal} />
                      ) : (
                        <button
                          type="button"
                          className="mp-empty-slot"
                          aria-label={`Add ${category.toLowerCase()} for ${weekday}, ${dateKey}`}
                          onClick={() => openAddMeal(dateKey, category)}
                        >
                          <Icon name="plus" size={17} />
                          <span>Add meal</span>
                        </button>
                      )}
                    </section>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {modalState && (
        <MealFormModal
          key={modalState.meal?.id ?? `${modalState.initialDate}:${modalState.initialCategory}`}
          meal={modalState.meal}
          initialDate={modalState.initialDate}
          initialCategory={modalState.initialCategory}
          occupiedMeal={modalState.occupiedMeal}
          onClose={() => setModalState(null)}
          onSave={handleSaveMeal}
          onEditOccupied={openEditMeal}
        />
      )}
    </section>
  );
}

export default MealPlanner;
