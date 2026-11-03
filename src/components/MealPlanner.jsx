import { DAYS, MEALS } from '../data/mealPlan.js';

function MealPlanner({ plan, onPlanChange }) {
  function handleMealChange(dayIndex, meal, value) {
    onPlanChange((currentPlan) =>
      currentPlan.map((day, index) =>
        index === dayIndex ? { ...day, [meal]: value } : day
      )
    );
  }

  return (
    <div className="app meal-planner-page">
      <header className="meal-planner-header">
        <p className="eyebrow">Plan your week</p>
        <h1>Weekly Meal Planner</h1>
        <p>Plan breakfast, lunch, and dinner for each day of the week.</p>
      </header>

      <div className="meal-planner-days">
        {DAYS.map((day, dayIndex) => {
          const hasMeals = MEALS.some((meal) => plan[dayIndex][meal].trim());

          return (
            <section className="meal-day-card" key={day}>
              <h2>{day}</h2>
              {!hasMeals && <p className="meal-empty">No meals planned yet</p>}
              <div className="meal-day-fields">
                {MEALS.map((meal) => {
                  const inputId = `${day.toLowerCase()}-${meal.toLowerCase()}`;

                  return (
                    <div className="meal-field" key={meal}>
                      <label htmlFor={inputId}>{meal}</label>
                      <input
                        id={inputId}
                        type="text"
                        value={plan[dayIndex][meal]}
                        onChange={(event) =>
                          handleMealChange(dayIndex, meal, event.target.value)
                        }
                        placeholder={`Add ${meal.toLowerCase()}`}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default MealPlanner;
