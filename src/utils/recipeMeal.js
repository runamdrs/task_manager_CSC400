export function createMealFromRecipe(recipe, date, category, id) {
  return {
    ...(id ? { id } : {}),
    recipeId: recipe.id,
    name: recipe.title,
    date,
    category,
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity ?? ingredient.amount ?? '',
    })),
    preparationTime: recipe.prepMinutes + recipe.cookMinutes,
    image: recipe.imageUrl ?? '',
  };
}
