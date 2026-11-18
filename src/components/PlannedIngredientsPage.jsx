import { useMemo } from 'react';
import { useTranslation } from '../i18n/useTranslation.js';
import { buildGroceryItems, indexRecipes } from '../selectors/grocery.js';

function PlannedIngredientsPage({ plannedMeals, recipes }) {
  const { t } = useTranslation();
  const items = useMemo(
    () => buildGroceryItems(plannedMeals, indexRecipes(recipes)),
    [plannedMeals, recipes]
  );

  return (
    <div className="app planned-ingredients-page">
      <header className="planned-ingredients-header">
        <p className="eyebrow">{t('Your planned meals')}</p>
        <h1>{t('Grocery List')}</h1>
        <p>{t('Ingredients from planned meals')}</p>
      </header>

      {plannedMeals.length === 0 ? (
        <p className="empty-message">
          {t('No planned meals yet. Add meals in the Meal Planner to build your grocery list.')}
        </p>
      ) : items.length === 0 ? (
        <p className="empty-message">{t('No ingredients listed for planned meals yet.')}</p>
      ) : (
        <ul className="planned-ingredients-list">
          {items.map((item) => (
            <li key={item.key}>
              <span>{item.name}</span>
              {item.quantity && <span className="planned-ingredient-quantity">{item.quantity}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlannedIngredientsPage;
