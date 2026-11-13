function MetaIcon({ children }) {
  return (
    <svg
      className="recipe-meta-icon"
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

function RecipeCard({ recipe, onView }) {
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  const primaryTag = recipe.tags[0];

  return (
    <article className="recipe-card">
      <div className="recipe-card-media">
        <img src={recipe.imageUrl} alt={recipe.title} loading="lazy" />
        {primaryTag && <span className="recipe-tag">{primaryTag}</span>}
      </div>

      <div className="recipe-card-body">
        <h3>{recipe.title}</h3>

        <ul className="recipe-card-meta">
          <li>
            <MetaIcon>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </MetaIcon>
            <span>{totalMinutes} min</span>
          </li>
          <li>
            <MetaIcon>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="3" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </MetaIcon>
            <span>
              {recipe.servings} serving{recipe.servings === 1 ? '' : 's'}
            </span>
          </li>
          <li>
            <MetaIcon>
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </MetaIcon>
            <span>{recipe.ingredients.length} ingredients</span>
          </li>
        </ul>

        <p className="recipe-card-steps">
          <MetaIcon>
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </MetaIcon>
          <span>
            {recipe.steps.length} prep step{recipe.steps.length === 1 ? '' : 's'}
          </span>
        </p>

        <div className="recipe-card-actions">
          <button type="button" className="recipe-btn-secondary" onClick={() => onView(recipe.id)}>
            View Recipe
          </button>
          <button type="button" className="recipe-btn-primary" disabled title="Coming soon">
            Add to Plan
          </button>
        </div>
      </div>
    </article>
  );
}

export default RecipeCard;
