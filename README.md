# SmartPrep

SmartPrep is a React and Vite meal-planning application. Planned meals, tasks,
grocery purchase progress, and language preferences are stored in the browser's
`localStorage`; there is no backend.

## Run locally

```bash
npm ci
npm run dev
```

## Project checks

| Command | Description |
| --- | --- |
| `npm run lint` | Lint the project with Oxlint |
| `npm test` | Run the Vitest unit tests |
| `npm run build` | Create the production build |
| `npm run preview` | Preview the production build locally |

GitHub Actions runs dependency installation, linting, tests, and the production
build on branch pushes and pull requests. It can also be started manually.

## Current features

- Plan, edit, and remove dated meals in the weekly planner
- Browse the recipe library from a meal dialog; choosing a recipe adds it to
  that dialog's selected day and meal category
- View shared planned meals on the dashboard and recipe library
- Derive a combined grocery ingredient list from planned meals and recipes
- Track cooking tasks and grocery purchase progress
- Switch the interface between English, Spanish, and German; the preference is
  saved between visits

Recipe names, descriptions, ingredients, task details, and other user content
are kept as entered and are not translated.
