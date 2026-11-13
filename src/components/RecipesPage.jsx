import { useMemo, useState } from 'react';
import { RECIPES } from '../data/recipes.js';
import RecipeCard from './RecipeCard.jsx';
import RecipeDetail from './RecipeDetail.jsx';

const PREP_LIMITS = {
  all: null,
  under15: (minutes) => minutes < 15,
  '15-30': (minutes) => minutes >= 15 && minutes <= 30,
  over30: (minutes) => minutes > 30,
};

function filterAndSortRecipes(recipes, filters) {
  const query = filters.search.trim().toLowerCase();
  const prepFilter = PREP_LIMITS[filters.prepTime];

  let results = recipes.filter((recipe) => {
    if (filters.mealType !== 'all' && recipe.mealType !== filters.mealType) {
      return false;
    }

    if (prepFilter && !prepFilter(recipe.prepMinutes)) {
      return false;
    }

    if (filters.dietary !== 'all' && !recipe.tags.includes(filters.dietary)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const ingredientText = recipe.ingredients.map((item) => item.name).join(' ');
    const haystack = `${recipe.title} ${recipe.description} ${ingredientText} ${recipe.tags.join(' ')}`.toLowerCase();
    return haystack.includes(query);
  });

  results = [...results].sort((a, b) => {
    if (filters.sortBy === 'prep') {
      return a.prepMinutes - b.prepMinutes;
    }

    if (filters.sortBy === 'total') {
      return a.prepMinutes + a.cookMinutes - (b.prepMinutes + b.cookMinutes);
    }

    return a.title.localeCompare(b.title);
  });

  return results;
}

function RecipesPage() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('all');
  const [prepTime, setPrepTime] = useState('all');
  const [dietary, setDietary] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const selectedRecipe = useMemo(
    () => RECIPES.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [selectedRecipeId]
  );

  const visibleRecipes = useMemo(
    () =>
      filterAndSortRecipes(RECIPES, {
        search,
        mealType,
        prepTime,
        dietary,
        sortBy,
      }),
    [search, mealType, prepTime, dietary, sortBy]
  );

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipeId(null)}
      />
    );
  }

  return (
    <div className="app recipes-page">
      <header className="recipes-header">
        <div className="recipes-header-copy">
          <p className="eyebrow">03 — Recipe Library</p>
          <h1>Recipes</h1>
          <p>Find something delicious to make.</p>
        </div>
        <button type="button" className="recipe-add-btn" disabled title="Coming soon">
          + Add Recipe
        </button>
      </header>

      <section className="recipe-filters" aria-label="Search and filter recipes">
        <div className="recipe-search">
          <svg
            className="recipe-search-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <label className="visually-hidden" htmlFor="recipe-search">
            Search recipes
          </label>
          <input
            id="recipe-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search recipes or ingredients..."
          />
        </div>

        <div className="recipe-filter-group">
          <label htmlFor="recipe-meal-type">Meal type</label>
          <select
            id="recipe-meal-type"
            value={mealType}
            onChange={(event) => setMealType(event.target.value)}
          >
            <option value="all">All</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>

        <div className="recipe-filter-group">
          <label htmlFor="recipe-prep-time">Prep time</label>
          <select
            id="recipe-prep-time"
            value={prepTime}
            onChange={(event) => setPrepTime(event.target.value)}
          >
            <option value="all">All</option>
            <option value="under15">Under 15 mins</option>
            <option value="15-30">15-30 mins</option>
            <option value="over30">Over 30 mins</option>
          </select>
        </div>

        <div className="recipe-filter-group">
          <label htmlFor="recipe-dietary">Dietary</label>
          <select
            id="recipe-dietary"
            value={dietary}
            onChange={(event) => setDietary(event.target.value)}
          >
            <option value="all">All</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="High Protein">High Protein</option>
            <option value="Vegan">Vegan</option>
            <option value="Gluten-Free">Gluten-Free</option>
          </select>
        </div>

        <div className="recipe-filter-group">
          <label htmlFor="recipe-sort">Sort by</label>
          <select
            id="recipe-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="name">Name</option>
            <option value="prep">Prep time</option>
            <option value="total">Total time</option>
          </select>
        </div>
      </section>

      <p className="recipe-results-count">
        {visibleRecipes.length} recipe{visibleRecipes.length === 1 ? '' : 's'} — Showing recipes
        for your current filters.
      </p>

      {visibleRecipes.length === 0 ? (
        <p className="empty-message">No recipes match your search or filters.</p>
      ) : (
        <div className="recipe-grid">
          {visibleRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={setSelectedRecipeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipesPage;
