# SmartPrep Future Features

This document records the current integration between the Meal Planner,
Recipes, Grocery List, and Dashboard, along with remaining requirements for
unfinished features. Update it when implementation changes.

## Feature ownership

| Feature        | Owns                                                        | Current owner      |
| -------------- | ----------------------------------------------------------- | ------------------ |
| Meal Planner   | Scheduled meals, dates, meal categories                     | Philipp            |
| Recipes        | Recipe details, ingredients, quantities, cooking steps      | Katlyn             |
| Grocery List   | Consolidated grocery items and purchase status              | Caleb              |
| Cooking Tasks  | Per-step completion status for recipe instructions          | Runa (SCRUM-18)    |
| Dashboard      | Read-only summaries of the data above                       | Runa               |

The Dashboard must not keep its own copy of meal, recipe, grocery, or cooking
task data. It reads through shared selectors exposed by the owning features.

## Current project state (as of 2026-11-19)

### Meal Planner

- `App.jsx` owns planned meals, loaded from and saved to `localStorage` under
  `smartprep-meal-planner-meals` by `src/services/mealPlannerStorage.js`.
- Each planned meal has the shape:
  `{ id, recipeId?, name, date, category, ingredients, preparationTime, image }`.
- Only one meal is allowed per `date` + `category` slot.
- A meal can be linked to a recipe through optional `recipeId`; linked meals
  read ingredients live from the recipe, while free-form meals continue to use
  their own ingredients.
- `MealPlanner.jsx` receives the shared meal data from `App.jsx`; the Dashboard
  derives its week summary from the same meal collection.

### Recipes

- Recipes are static data in `src/data/recipes.js` (`RECIPES`), each with a
  stable string `id`, `title`, `mealType`, `servings`,
  `ingredients: [{ name, amount }]`, and `steps: string[]`.
- Ingredient quantities use the field name **`amount`**, while planned meals use
  **`quantity`**.
- Steps are plain strings with no stable IDs.
- `RecipeDetail.jsx` has ingredient and step checkboxes, but their state is
  local `useState` and is lost when the page changes.
- `RecipesPage.jsx` keeps the selected recipe in local state, so other pages
  cannot open a specific recipe yet.
- `origin/development` contains a newer Recipes commit (`1a219ff`, serving
  scaling with a third quantity parser) that is not yet on
  `fix/dashboard-meal-planner-flow`.

### Grocery List

- `src/selectors/grocery.js` derives the weekly list from planned meals and
  recipes. `buildGroceryItems()` consolidates duplicate ingredients and records
  their planned-meal sources; free-form meals without `recipeId` are included.
- Grocery items are never stored. Only purchase records are persisted under
  `smartprep-grocery-purchases` by `src/services/groceryStorage.js`.
- Purchase records use the Monday of each week plus the normalized ingredient
  key, so checkmarks survive a first-day-of-week preference change. A larger
  new requirement changes status to `needs-more`.
- The page shows all derived items, including purchased items, with controls to
  purchase or un-purchase them and source meals for each ingredient.
- **Manual add/delete choice: option (a), remove them.** Items must come from
  planned meals; the page directs users to add meals in the Meal Planner rather
  than offering prompt-based manual entries or deletions.
- The Meal Planner's Grocery List action opens this shared list. It no longer
  writes a separate generated grocery snapshot.

### Dashboard: Grocery Progress card

- The card reads the App-owned `weeklyGroceries` result for remaining items,
  weekly total, and progress. Clicking it opens the Grocery List page.
- With no derived items, it displays "No groceries needed yet."

### Dashboard: Today's Prep Tasks

- `getTodayPrep()` derives today's ingredients and meals from the same weekly
  grocery result used by the Grocery List.
- It shows today's unpurchased ingredients (checkable) and meals grouped by
  category. A check updates the shared purchase status immediately.
- Purchased items are omitted here but remain visible and reversible on the
  Grocery List page.

The remaining Dashboard work is opening a specific recipe from the Dashboard
and implementing Cooking Tasks. The "Prep Tasks" summary card stays "Coming
Soon" until Cooking Tasks exist.

## Automatic grocery list generation

### Current behavior

- When a recipe is selected in the Meal Planner, its ingredients are retrieved
  from the Recipes data automatically.
- Each grocery item records which planned meals require it.
- Show the ingredient name and combined quantity when available.
- Consolidate the same ingredient across planned meals into one item. Combine
  quantities when units are compatible; otherwise list the parts side by side
  (for example, `2 cloves + 1 tbsp`).
- Users can mark or unmark items as purchased. Purchase status persists across
  page changes and refreshes.
- The list updates when planned meals or recipes change, including:
  removing a meal, switching a meal's recipe, adding another recipe that shares
  an ingredient, and planning meals on different days.
- Never create orphaned items, and never remove an item that another planned
  meal still needs.
- Grocery items come from real recipe or planned-meal ingredients only. No
  fictional or hardcoded items.

### Data flow

1. `App.jsx` loads planned meals and purchase records, computes
   `weeklyGroceries` with `getWeeklyGroceries()`, and passes that same result to
   the Dashboard and Grocery List. `getTodayPrep()` uses it for today's view.
2. `buildGroceryItems()` derives one item per normalized ingredient, combines
   quantities with `src/utils/ingredientQuantities.js`, and records each
   planned-meal source. Removing or changing a meal recomputes the list without
   orphaning ingredients still needed by another meal.
3. Only purchase status is persisted. Each record stores the covered quantity
   and is keyed by Monday + normalized ingredient name. A requirement above the
   recorded amount is `needs-more`, not `purchased`.
4. The Meal Planner's separate snapshot generator is retired; it navigates to
   the shared derived list instead.

Derived grocery item shape:

```js
{
  key: 'garlic',                // normalized ingredient name
  name: 'Garlic',
  quantity: '4 cloves',         // combined display quantity
  totals: { clove: 4 },
  sources: [                    // planned meals that need this ingredient
    { mealId, mealName, date, category, recipeId }
  ],
  status: 'to-buy',             // 'to-buy' | 'purchased' | 'needs-more'
}
```

## Dashboard: Prep Tasks summary card

The top-level **Prep Tasks** summary card should highlight upcoming recipe
preparation tasks that need attention, rather than serve as the Today's Prep
Tasks overview.

- Identify recipe preparation tasks scheduled soonest.
- Display a useful summary of upcoming preparation tasks.
- Make the card clickable and open the Recipes experience.
- Show task completion status when that functionality is available.

Use actual task data; do not add hardcoded or fictional tasks.

## SCRUM-18: Cooking Tasks integration with Recipes

Cooking Tasks belong inside the **Recipe Details** experience. Do not create a
separate Cooking Tasks page or a second recipe data structure. Selecting a
recipe opens its details, including ingredients and ordered cooking
instructions. Each instruction can be marked complete or incomplete.

### Keep grocery tasks and cooking tasks separate

- **Grocery tasks** are ingredients to buy. Owned by Grocery List. Status:
  purchased.
- **Cooking tasks** are recipe instructions to complete. Owned by Cooking
  Tasks. Status: completed.
- The ingredient checkboxes in Recipe Details are not grocery purchase status
  and must not be wired to it unless the team decides so explicitly.
- Both can appear in the Dashboard's daily overview, but each keeps its own
  data and completion status.

### Recipe information needed

- Stable recipe ID and display name (exists).
- Ingredients with name and quantity (exists, field `amount`).
- Ordered instructions with **stable IDs** (missing: steps are plain strings).

### Completion state

Completion belongs to the user's progress, not to the canonical recipe
instruction. Proposed storage key `smartprep-cooking-progress`, keyed by
planned meal ID + recipe ID + step ID, so cooking the same recipe on two days
tracks two separate runs. Store a completion boolean and, if useful, a
timestamp. The Dashboard reads this through a Cooking Tasks selector, never by
importing Recipe Details UI. Existing generic TaskFlow tasks are separate and
are not this store.

### Scheduling

A planned meal's `date` and `category` give each cooking run a scheduled day,
so "upcoming prep tasks" can be derived from planned meals that are linked to
recipes. Do not infer schedules from instruction text.

## Decisions needed before implementation

1. **Recipes:** allow opening a specific recipe from another page.
2. **Cooking Tasks:** confirm completion is tracked per planned meal rather
   than per recipe; add stable IDs to recipe steps.

## Development rules

- Grocery items must remain derived from real meal and recipe ingredients;
  persist purchase status only.
- Do not create fake data or hardcoded examples.
- Do not implement unfinished Cooking Tasks features before their data
  structures are agreed with the owning developer.
- Cooking Tasks must be integrated into Recipe Details, not built as a separate
  page or duplicate recipe system.
- Do not break existing Meal Planner functionality, including free-form meals
  without a recipe.
- Keep Dashboard integration modular and based on shared selectors.
- Update this document as the corresponding features are implemented.
