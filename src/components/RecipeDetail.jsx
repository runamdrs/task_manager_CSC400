import { useMemo, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation.js';

const QUANTITY_PATTERN = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(?=\s|$)/;
const COMMON_FRACTIONS = [
  { value: 1 / 8, label: '1/8' },
  { value: 1 / 6, label: '1/6' },
  { value: 1 / 4, label: '1/4' },
  { value: 1 / 3, label: '1/3' },
  { value: 3 / 8, label: '3/8' },
  { value: 1 / 2, label: '1/2' },
  { value: 5 / 8, label: '5/8' },
  { value: 2 / 3, label: '2/3' },
  { value: 3 / 4, label: '3/4' },
  { value: 7 / 8, label: '7/8' },
];

function parseQuantity(quantity) {
  if (quantity.includes(' ')) {
    const [whole, fraction] = quantity.split(' ');
    const [numerator, denominator] = fraction.split('/').map(Number);
    return Number(whole) + numerator / denominator;
  }

  if (quantity.includes('/')) {
    const [numerator, denominator] = quantity.split('/').map(Number);
    return numerator / denominator;
  }

  return Number(quantity);
}

function formatQuantity(value) {
  const whole = Math.floor(value);
  const fraction = value - whole;
  const nearestFraction = COMMON_FRACTIONS.find(
    ({ value: fractionValue }) => Math.abs(fraction - fractionValue) < 0.02
  );

  if (!nearestFraction) {
    return Number(value.toFixed(2)).toString();
  }

  if (whole === 0) {
    return nearestFraction.label;
  }

  return `${whole} ${nearestFraction.label}`;
}

function scaleIngredientAmount(amount, originalServings, servings) {
  const match = amount.match(QUANTITY_PATTERN);

  if (!match || servings === originalServings) {
    return amount;
  }

  const scaledQuantity = parseQuantity(match[1]) * (servings / originalServings);
  return `${formatQuantity(scaledQuantity)}${amount.slice(match[0].length)}`;
}

function StatIcon({ children }) {
  return (
    <svg
      className="recipe-stat-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function RecipeDetail({
  recipe,
  onBack,
  selectionMode = false,
  onChooseRecipe,
  onCancelRecipeSelection,
}) {
  const { t } = useTranslation();
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  const [checkedIngredients, setCheckedIngredients] = useState(() =>
    recipe.ingredients.map(() => false)
  );
  const [completedSteps, setCompletedSteps] = useState(() => recipe.steps.map(() => false));
  const [servings, setServings] = useState(recipe.servings);

  const completedStepCount = useMemo(
    () => completedSteps.filter(Boolean).length,
    [completedSteps]
  );

  function toggleIngredient(index) {
    setCheckedIngredients((current) =>
      current.map((checked, i) => (i === index ? !checked : checked))
    );
  }

  function toggleStep(index) {
    setCompletedSteps((current) =>
      current.map((done, i) => (i === index ? !done : done))
    );
  }

  function adjustServings(delta) {
    setServings((current) => Math.max(1, current + delta));
  }

  return (
    <div className="app recipes-page recipe-detail-page">
      <button type="button" className="recipe-back-link" onClick={onBack}>
        {t('← Back to Recipes')}
      </button>
      {selectionMode && (
        <button
          type="button"
          className="recipe-cancel-selection"
          onClick={onCancelRecipeSelection}
        >
          {t('Cancel selection')}
        </button>
      )}

      <section className="recipe-detail-hero">
        <div className="recipe-detail-image">
          <img src={recipe.imageUrl} alt={recipe.title} />
        </div>

        <div className="recipe-detail-summary">
          <p className="eyebrow">{t('04 — Recipe Details')}</p>
          <div className="recipe-detail-tags">
            {recipe.tags.map((tag) => (
              <span className="recipe-tag recipe-tag-inline" key={tag}>
                {t(tag)}
              </span>
            ))}
          </div>
          <h1>{recipe.title}</h1>
          <p className="recipe-detail-description">{recipe.description}</p>

          <dl className="recipe-stats">
            <div>
              <dt>
                <StatIcon>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </StatIcon>
                {t('Prep')}
              </dt>
              <dd>{recipe.prepMinutes} {t('min')}</dd>
            </div>
            <div>
              <dt>
                <StatIcon>
                  <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
                </StatIcon>
                {t('Cook')}
              </dt>
              <dd>{recipe.cookMinutes} {t('min')}</dd>
            </div>
            <div>
              <dt>
                <StatIcon>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </StatIcon>
                {t('Total')}
              </dt>
              <dd>{totalMinutes} {t('min')}</dd>
            </div>
            <div>
              <dt>
                <StatIcon>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="3" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </StatIcon>
                {t('Serves')}
              </dt>
              <dd>{servings}</dd>
            </div>
          </dl>

          {selectionMode ? (
            <button
              type="button"
              className="recipe-btn-primary recipe-add-to-plan"
              onClick={() => onChooseRecipe(recipe.id)}
            >
              {t('Select recipe')}
            </button>
          ) : (
            <button type="button" className="recipe-btn-primary recipe-add-to-plan" disabled title={t('Coming soon')}>
              {t('Add to Meal Plan')}
            </button>
          )}
        </div>
      </section>

      <div className="recipe-detail-columns">
        <section className="recipe-detail-section" aria-labelledby="ingredients-heading">
          <p className="recipe-section-slogan">{t("What you'll need")}</p>
          <div className="recipe-section-heading-row">
            <h2 id="ingredients-heading">{t('Ingredients')}</h2>
            <div className="recipe-servings-toggle" aria-label={t('Adjust servings')}>
              <button type="button" onClick={() => adjustServings(-1)} aria-label={t('Decrease servings')}>
                −
              </button>
              <span>{servings} {t('servings')}</span>
              <button type="button" onClick={() => adjustServings(1)} aria-label={t('Increase servings')}>
                +
              </button>
            </div>
          </div>

          <ul className="recipe-ingredient-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={ingredient.name}>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedIngredients[index]}
                    onChange={() => toggleIngredient(index)}
                  />
                  <span className="recipe-ingredient-name">{ingredient.name}</span>
                  <span className="recipe-ingredient-amount">
                    {scaleIngredientAmount(ingredient.amount, recipe.servings, servings)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="recipe-detail-section" aria-labelledby="instructions-heading">
          <p className="recipe-section-slogan">{t('Prep and Cook')}</p>
          <div className="recipe-section-heading-row">
            <h2 id="instructions-heading">{t('Cooking Instructions')}</h2>
            <p className="recipe-step-progress">
              {completedStepCount} {t('of {count} complete', { count: recipe.steps.length })}
            </p>
          </div>

          <ol className="recipe-step-list">
            {recipe.steps.map((step, index) => (
              <li key={step} className={completedSteps[index] ? 'complete' : ''}>
                <button
                  type="button"
                  className="recipe-step-number"
                  aria-pressed={completedSteps[index]}
                  onClick={() => toggleStep(index)}
                >
                  {index + 1}
                </button>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default RecipeDetail;
