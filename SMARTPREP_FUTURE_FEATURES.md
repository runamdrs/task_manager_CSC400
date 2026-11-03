# SmartPrep Future Features

This document records future Dashboard integration requirements. These features
are specifications only and must not be treated as implemented functionality.
Update this document when the corresponding features are implemented.

## Dashboard: Today's Prep Tasks

The **Today's Prep Tasks** section should combine outstanding grocery shopping
reminders with the meals scheduled for the selected day.

### Grocery items to purchase

- Display grocery items that still need to be purchased.
- Show each item's name and its quantity when available.
- Do not display items that have already been purchased.

### Meals planned for today

- Display only meals or recipes scheduled for the selected day.
- Show the meal or recipe name and its category: Breakfast, Lunch, or Dinner.
- Organize meals clearly by category.

The section should present shopping reminders and that day's planned meals in one
convenient overview. It should use real data from the relevant features and must
not invent items or meals.

## Dashboard: Prep Tasks Summary Card

The top-level **Prep Tasks** summary card should highlight upcoming recipe
preparation tasks that need attention, rather than serve as the Today's Prep
Tasks overview.

- Identify recipe preparation tasks scheduled soonest.
- Display a useful summary of upcoming preparation tasks.
- Make the card clickable.
- Open a detailed view of all recipes that have preparation tasks when clicked.
- Organize the detailed view by recipe and list each recipe's associated tasks.
- Show task completion status when that functionality is available.

Use actual task data; do not add hardcoded or fictional tasks.

## Future data integration

The Dashboard should aggregate information from the feature that owns it, without
duplicating feature data or creating a separate Dashboard data store:

- **Meal Planner** provides scheduled meals, dates, and meal categories.
- **Recipes** provides recipe information and ingredients.
- **Grocery List** provides shopping items, quantities, and purchase status.
- **Cooking Tasks** provides recipe preparation instructions, scheduled tasks,
  and completion status.
- **Dashboard** combines this information into summaries and daily overviews.

## SCRUM-18: Cooking Tasks integration with Recipes

Cooking Tasks belong inside the **Recipe Details** experience being developed
with the Recipes feature. Do not create a separate Cooking Tasks page or a
second recipe data structure. Selecting a recipe should open its details,
including its ingredients and ordered cooking instructions. Each instruction
should be individually actionable so the user can mark it complete or
incomplete.

### Current project findings

- The Recipes route currently renders a generic placeholder; there is no recipe
  list, recipe details view, recipe schema, or recipe data source in this
  project yet.
- The Meal Planner currently holds seven in-memory days of Breakfast, Lunch,
  and Dinner strings. It has no scheduled dates, recipe IDs, or links to recipe
  records.
- The existing TaskFlow task model has generic task IDs, titles, descriptions,
  due dates, priorities, task types, and completion flags. It is not associated
  with recipe instructions and must not be repurposed as the Cooking Tasks
  source of truth.

Coordinate the integration contract with the Recipes team before implementation.
The Recipes feature owns recipe content and should provide stable recipe and
instruction identifiers for Cooking Tasks to reference.

### Recipe information needed

Cooking Tasks and Recipe Details will need access to:

- A stable recipe ID and display name.
- Recipe ingredients, including ingredient name and quantity/unit when
  available.
- An ordered list of cooking instructions. Each instruction needs a stable ID,
  its order, and instruction text.
- A recipe association for each instruction, either through its parent recipe
  or an explicit recipe ID.

Optional preparation duration or scheduled preparation date/time can support
upcoming-task summaries when those capabilities are designed. Such scheduling
metadata should not be inferred from the instruction text or fabricated.

### Completion state

Completion belongs to the user's progress through a recipe, not to the
canonical recipe instruction itself. Associate each completion record with
both the stable recipe ID and stable instruction ID (and the applicable user
or profile if the application adds accounts). Store a completion boolean and,
if useful, a completion timestamp. Toggling an instruction should update that
specific association without changing recipe content or the status of the
same instruction in another recipe.

Use the Cooking Tasks feature's agreed persistence/state mechanism as the
source of truth. Do not create duplicate completion state in the Dashboard or
mutate the Recipes feature's canonical instruction records. Existing generic
TaskFlow tasks are separate and are not this completion store.

### Dashboard integration

The Dashboard should read progress through a shared Cooking Tasks data
interface or selector, rather than importing or parsing Recipe Details UI
components. That interface should provide the upcoming incomplete instruction
tasks with their recipe ID/name, instruction ID/text, completion status, and
scheduled date/time when scheduling exists.

The top **Prep Tasks** summary card should summarize the soonest upcoming
incomplete recipe instructions. Clicking it should take the user into the
Recipes experience; the detailed instructions and completion controls remain
in each recipe's Recipe Details view. If an aggregate list of recipes with
pending instructions is provided, it should link to those recipe details,
not introduce a separate Cooking Tasks page. The Dashboard must show an
appropriate empty state when no real task data is available.

### Dependencies and implementation sequence

1. Agree with the Recipes team on recipe/instruction IDs, ingredient fields,
   instruction ordering, and the Recipe Details navigation contract.
2. The Recipes feature implements the recipe list and Recipe Details view,
   including real ingredients and ordered instructions.
3. Cooking Tasks associates user completion state with recipe and instruction
   IDs and exposes a shared read/update interface for the instruction controls.
4. If the Dashboard is to show scheduled tasks in soonest-first order, define
   the source and lifecycle of each preparation task's scheduled date/time.
5. Meal Planner integration requires extending its data contract to associate
   scheduled meals with recipe IDs and actual dates; its current string-only
   weekly grid cannot identify recipes or determine today's recipes.
6. Dashboard consumes the agreed Meal Planner and Cooking Tasks interfaces
   and links into Recipes-owned details. It must not duplicate recipe,
   scheduling, ingredient, or completion data.

## Development rules

- These requirements describe future work; they are not current functionality.
- Do not create fake data or hardcoded examples.
- Do not implement unfinished Recipes, Grocery List, or Cooking Tasks features
  prematurely.
- Cooking Tasks must be integrated into Recipe Details, not built as a separate
  page or duplicate recipe system.
- Keep existing placeholder components until their features are implemented.
- Keep Dashboard integration modular so real feature data can be connected
  without rebuilding the page.
- Update this document as the corresponding features are implemented.
