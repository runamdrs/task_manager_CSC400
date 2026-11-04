import { useMemo, useState } from 'react';

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

function RecipeDetail({ recipe, onBack }) {
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
        ← Back to Recipes
      </button>

      <section className="recipe-detail-hero">
        <div className="recipe-detail-image">
          <img src={recipe.imageUrl} alt={recipe.title} />
        </div>

        <div className="recipe-detail-summary">
          <p className="eyebrow">04 — Recipe Details</p>
          <div className="recipe-detail-tags">
            {recipe.tags.map((tag) => (
              <span className="recipe-tag recipe-tag-inline" key={tag}>
                {tag}
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
                Prep
              </dt>
              <dd>{recipe.prepMinutes} min</dd>
            </div>
            <div>
              <dt>
                <StatIcon>
                  <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
                </StatIcon>
                Cook
              </dt>
              <dd>{recipe.cookMinutes} min</dd>
            </div>
            <div>
              <dt>
                <StatIcon>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </StatIcon>
                Total
              </dt>
              <dd>{totalMinutes} min</dd>
            </div>
            <div>
              <dt>
                <StatIcon>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="3" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </StatIcon>
                Serves
              </dt>
              <dd>{recipe.servings}</dd>
            </div>
          </dl>

          <button type="button" className="recipe-btn-primary recipe-add-to-plan" disabled title="Coming soon">
            Add to Meal Plan
          </button>
        </div>
      </section>

      <div className="recipe-detail-columns">
        <section className="recipe-detail-section" aria-labelledby="ingredients-heading">
          <p className="recipe-section-slogan">What you&apos;ll need</p>
          <div className="recipe-section-heading-row">
            <h2 id="ingredients-heading">Ingredients</h2>
            <div className="recipe-servings-toggle" aria-label="Adjust servings">
              <button type="button" onClick={() => adjustServings(-1)} aria-label="Decrease servings">
                −
              </button>
              <span>{servings} servings</span>
              <button type="button" onClick={() => adjustServings(1)} aria-label="Increase servings">
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
                  <span className="recipe-ingredient-amount">{ingredient.amount}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="recipe-detail-section" aria-labelledby="instructions-heading">
          <p className="recipe-section-slogan">Prep and Cook</p>
          <div className="recipe-section-heading-row">
            <h2 id="instructions-heading">Cooking Instructions</h2>
            <p className="recipe-step-progress">
              {completedStepCount} of {recipe.steps.length} complete
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
