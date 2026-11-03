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

## Development rules

- These requirements describe future work; they are not current functionality.
- Do not create fake data or hardcoded examples.
- Do not implement unfinished Recipes, Grocery List, or Cooking Tasks features
  prematurely.
- Keep existing placeholder components until their features are implemented.
- Keep Dashboard integration modular so real feature data can be connected
  without rebuilding the page.
- Update this document as the corresponding features are implemented.
