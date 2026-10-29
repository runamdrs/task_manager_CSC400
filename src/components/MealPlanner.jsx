// Import React state so each meal slot can be typed independently.
import { useState } from 'react';

// Days and meal times form the first slice of the weekly planner grid.
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

function createEmptyPlan() {
  // Start every day with blank breakfast, lunch, and dinner slots.
  return DAYS.map(() => ({
    Breakfast: '',
    Lunch: '',
    Dinner: '',
  }));
}

function MealPlanner() {
  // Keep the current week's meal names in local component state.
  const [plan, setPlan] = useState(createEmptyPlan);

  function handleMealChange(dayIndex, meal, value) {
    // Replace only the edited slot so the rest of the week stays unchanged.
    setPlan((currentPlan) =>
      currentPlan.map((day, index) =>
        index === dayIndex ? { ...day, [meal]: value } : day
      )
    );
  }

  return (
    <section className="meal-planner">
      {/* Introduce the weekly planner as a distinct SmartPrep area. */}
      <h2>Weekly Meal Planner</h2>
      <p>Plan breakfast, lunch, and dinner for each day of the week.</p>

      <div className="meal-planner-table-wrap">
        <table className="meal-planner-table">
          <thead>
            <tr>
              <th scope="col">Meal</th>
              {DAYS.map((day) => (
                <th key={day} scope="col">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((meal) => (
              <tr key={meal}>
                <th scope="row">{meal}</th>
                {DAYS.map((day, dayIndex) => (
                  <td key={`${day}-${meal}`}>
                    <label className="visually-hidden" htmlFor={`${day}-${meal}`}>
                      {meal} for {day}
                    </label>
                    <input
                      id={`${day}-${meal}`}
                      type="text"
                      value={plan[dayIndex][meal]}
                      onChange={(event) =>
                        handleMealChange(dayIndex, meal, event.target.value)
                      }
                      placeholder="Add meal"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MealPlanner;
