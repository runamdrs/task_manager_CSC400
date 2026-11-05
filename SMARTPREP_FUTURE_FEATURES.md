# SmartPrep Future Features

This document records future integration requirements between the Meal Planner,
Recipes, Grocery List, Cooking Tasks, and Dashboard features. These are
specifications only and must not be treated as implemented functionality.
Update this document when the corresponding features are implemented.

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

## Current project state (as of 2026-11-05)

### Meal Planner

- Planned meals are stored in `localStorage` under
  `smartprep-meal-planner-meals` by `src/services/mealPlannerStorage.js`.
- Each planned meal has the shape:
  `{ id, name, date: 'YYYY-MM-DD', category: 'Breakfast' | 'Lunch' | 'Dinner',
  ingredients: [{ name, quantity }], preparationTime, image }`.
- Only one meal is allowed per `date` + `category` slot.
- Meals are free-form: the user types the name and ingredients by hand. A
  planned meal has **no `recipeId`** and no link to the Recipes library.
- `MealPlanner.jsx` owns the meal list in its own component state. It pushes a
  legacy seven-day string grid (`{ Breakfast, Lunch, Dinner }` names) to
  `App` through `onPlanChange`, only while the current week is displayed. The
  Dashboard's "Planned Meals" count reads this legacy grid.
- `MealPlanner.jsx` already contains ingredient consolidation logic
  (`normalizeIngredientName`, `parseQuantity`, `normalizeUnit`,
  `aggregateIngredients`). It merges by normalized name and converts compatible
  units to a base unit (mL for volume, g for weight, count).
- A "Generate grocery list" button writes a one-off snapshot to
  `smartprep-generated-grocery-list` and fires a
  `smartprep:grocery-list-generated` event. No feature consumes this yet, and
  the snapshot does not track purchase status or update when meals change.

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

- The Grocery List route renders `PlaceholderPage`. `origin/caleb/smart-grocery-list`
  contains no grocery code. There is no grocery item schema and no purchase
  status storage.

### Dashboard (implemented on `fix/dashboard-meal-planner-flow`)

Built without modifying Meal Planner, Recipes, or Grocery List code:

- `src/utils/ingredientQuantities.js`: shared name normalization and quantity
  consolidation. It duplicates the private logic in `MealPlanner.jsx` for now;
  the planner can switch to it once Philipp agrees.
- `src/selectors/grocery.js`: derives weekly grocery items, progress, and
  today's prep from planned meals + recipes. Supports an optional `recipeId`
  on meals so linked recipes work as soon as the planner adds them.
- `src/services/groceryStorage.js`: provisional purchase status store
  (`smartprep-grocery-purchases`), pending Caleb's review.
- `App.jsx` reads planned meals through `loadPlannedMeals()` and reloads them
  when the planner calls its existing `onPlanChange` callback, on page
  navigation, and on cross-tab `storage` events. The legacy `mealPlan` grid and
  `src/data/mealPlan.js` were removed.
- Grocery Progress card shows real weekly counts and a progress bar.
- Today's Prep Tasks shows today's unpurchased ingredients (checkable) and
  today's meals by category.

Still pending other features: the Grocery List page (purchases can't be undone
from the Dashboard yet, since purchased items are hidden there), opening a
specific recipe from the Dashboard, recipe-linked meals, and Cooking Tasks.
The "Prep Tasks" summary card stays "Coming Soon" until Cooking Tasks exist.

## Automatic grocery list generation

### Requirements

- When a recipe is added to the Meal Planner, its ingredients are retrieved
  from the Recipes data automatically.
- Each grocery item records which planned meals require it.
- Show the ingredient name and quantity when available.
- Consolidate the same ingredient across planned meals into one item. Combine
  quantities when units are compatible; otherwise list the parts side by side
  (for example, `2 cloves + 1 tbsp`).
- Users can mark items as purchased. Purchase status persists across page
  changes and refreshes.
- The list updates when planned meals or recipes change, including:
  removing a meal, switching a meal's recipe, adding another recipe that shares
  an ingredient, and planning meals on different days.
- Never create orphaned items, and never remove an item that another planned
  meal still needs.
- Grocery items come from real recipe or planned-meal ingredients only. No
  fictional or hardcoded items.

### Proposed design (pending team agreement)

1. **Link planned meals to recipes.** Add an optional `recipeId` to planned
   meals. When `recipeId` is set, ingredients are read live from the recipe so
   recipe edits flow through. When it is not set, the meal's own hand-entered
   `ingredients` are used, so existing free-form meals keep working.
2. **Derive grocery items; do not store them.** Grocery items are computed by a
   pure selector from planned meals + recipes for a date range. Because the list
   is recomputed from source data every time, removing or changing a meal can
   never leave orphans or delete an ingredient another meal still needs.
3. **Store only purchase status.** The Grocery List feature persists purchase
   records in `localStorage` (proposed key `smartprep-grocery-purchases`),
   keyed by week start + normalized ingredient name, with the quantity that was
   required when the item was marked purchased. If a newly planned meal raises
   the requirement above what was purchased, the item shows as needing more
   instead of staying silently checked.
4. **Share one quantity module.** Move ingredient normalization, unit parsing,
   and consolidation out of `MealPlanner.jsx` into a shared utility used by the
   Meal Planner, Grocery List, Dashboard, and (optionally) recipe scaling.
   Combine identical units directly (`1 cup + 1/2 cup = 1 1/2 cups`) and only
   convert to a base unit when units differ.

Proposed derived grocery item shape:

```js
{
  key: 'garlic',                // normalized ingredient name
  name: 'Garlic',
  quantity: '4 cloves',         // combined display quantity
  sources: [                    // planned meals that need this ingredient
    { mealId, date, category, recipeId }
  ],
  purchased: false,
}
```

## Dashboard: Grocery Progress card

- Show the number of items still to buy for the current week, e.g. "3 items
  left to buy".
- Show the total number of grocery items for the week.
- Show a progress bar of purchased versus remaining items.
- Update automatically when items are purchased or planned meals change.
- Clicking the card opens the Grocery List page.
- With no grocery items, show: "No groceries needed yet."
- All numbers come from the shared grocery selector. Nothing is hardcoded.

The current week runs Monday to Sunday, matching the Meal Planner.

## Dashboard: Today's Prep Tasks

The Today's Prep Tasks section combines the grocery items needed for today with
the meals scheduled for today.

### Grocery items to purchase today

- Include only ingredients needed by meals planned for today.
- Exclude items already marked purchased.
- If several meals today need the same ingredient, show it once with today's
  combined quantity.
- Purchase status is read from the same weekly purchase record used by the
  Grocery List, so checking an item in either place updates both.

### Meals planned for today

- Read from the Meal Planner; show only today's meals.
- Group by actual category: Breakfast, Lunch, Dinner.
- When a meal is linked to a recipe, the meal name links to that recipe's
  details.
- Do not display fictional meals.

Show an appropriate empty state when there are no meals or grocery items for
today.

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

1. **Meal Planner (Philipp):** add an optional `recipeId` to planned meals and a
   "choose from Recipes" option in the meal form. Decide whether linked meals
   read ingredients live from the recipe (proposed) or copy them in.
2. **Meal Planner (Philipp):** move planned-meal state from `MealPlanner.jsx`
   into `App` (or a shared hook) so the Dashboard and Grocery List read the same
   data, replacing the legacy `mealPlan` grid and `onPlanChange`.
3. **Meal Planner + Grocery List (Philipp, Caleb):** replace the one-off
   "Generate grocery list" snapshot with the derived grocery selector.
4. **Recipes (Katlyn):** agree on one ingredient quantity field name
   (`quantity` vs `amount`), add stable step IDs, and allow opening a specific
   recipe from another page.
5. **Grocery List (Caleb):** agree on the derived item shape, the purchase
   record key, and how a purchased item behaves when its required quantity
   increases.
6. **Cooking Tasks:** confirm completion is tracked per planned meal rather
   than per recipe.

## Development rules

- These requirements describe future work; they are not current functionality.
- Do not create fake data or hardcoded examples.
- Do not implement unfinished Recipes, Grocery List, or Cooking Tasks features
  before their data structures are agreed with the owning developer.
- Cooking Tasks must be integrated into Recipe Details, not built as a separate
  page or duplicate recipe system.
- Do not break existing Meal Planner functionality, including free-form meals
  without a recipe.
- Keep existing placeholder components until their features are implemented.
- Keep Dashboard integration modular so real feature data can be connected
  without rebuilding the page.
- Update this document as the corresponding features are implemented.
