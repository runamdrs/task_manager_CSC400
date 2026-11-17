
function GroceryList({
  items,
  onAdd,
  onDelete,
  onTogglePurchased,
}) {
  // Add a new grocery item using simple browser prompts.
  function handleAddItem() {
    const name = window.prompt('Enter grocery item:');

    if (!name || name.trim() === '') {
      return;
    }

    const quantity = window.prompt('Enter quantity:');

    if (!quantity || quantity.trim() === '') {
      return;
    }

    onAdd({
      name: name.trim(),
      quantity: quantity.trim(),
    });
  }

  // Count purchased items.
  const purchasedCount = items.filter(
    (item) => item.purchased
  ).length;

  // Count total items.
  const totalCount = items.length;

  // Calculate the shopping progress percentage.
  const progress =
    totalCount === 0
      ? 0
      : Math.round((purchasedCount / totalCount) * 100);

  return (
    <div className="grocery-page">
      {/* Page header */}
      <div className="grocery-header">
        <div>
          <p className="grocery-label">SMART GROCERY LIST</p>
          <h2>Grocery List</h2>
          <p className="grocery-description">
            Keep track of the items you need to buy.
          </p>
        </div>

        <div className="grocery-header-buttons">
          <button
            className="clear-button"
            onClick={() => {
              const confirmed = window.confirm(
                'Remove all purchased items?'
              );

              if (confirmed) {
                items
                  .filter((item) => item.purchased)
                  .forEach((item) => onDelete(item.id));
              }
            }}
          >
            Clear Purchased
          </button>

          <button
            className="add-grocery-button"
            onClick={handleAddItem}
          >
            + Add Item
          </button>

          {/* This will be connected to the Meal Planner later. */}
          <button
            className="regenerate-button"
            onClick={() =>
              window.alert(
                'Recipe generation will be connected to the Meal Planner later.'
              )
            }
          >
            ↻ Regenerate from Plan
          </button>
        </div>
      </div>

      {/* Shopping progress */}
      <div className="shopping-progress">
        <div className="progress-top">
          <div>
            <p className="progress-label">SHOPPING PROGRESS</p>

            <h3>
              {purchasedCount} of {totalCount} items purchased
            </h3>
          </div>

          <div className="progress-numbers">
            <div>
              <span>Total</span>
              <strong>{totalCount}</strong>
            </div>

            <div>
              <span>Purchased</span>
              <strong>{purchasedCount}</strong>
            </div>

            <div>
              <span>Remaining</span>
              <strong>{totalCount - purchasedCount}</strong>
            </div>
          </div>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Information message */}
      <div className="grocery-info">
        <div className="info-icon">✦</div>

        <div>
          <strong>Shop smarter with one organized list.</strong>

          <p>
            Add your grocery items here. Later, planned recipes
            will automatically add their ingredients and combine
            duplicate items.
          </p>
        </div>
      </div>

      {/* Grocery items */}
      <div className="grocery-section">
        <div className="section-header">
          <h3>Grocery Items</h3>

          <span>
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="empty-grocery">
            <div className="empty-icon">🛒</div>

            <h3>Your grocery list is empty</h3>

            <p>
              Add your first grocery item to get started.
            </p>

            <button
              className="add-grocery-button"
              onClick={handleAddItem}
            >
              + Add Item
            </button>
          </div>
        ) : (
          <div className="grocery-items">
            {items.map((item) => (
              <div
                className={`grocery-item ${
                  item.purchased ? 'purchased' : ''
                }`}
                key={item.id}
              >
                {/* Checkbox */}
                <button
                  className={`purchase-check ${
                    item.purchased ? 'checked' : ''
                  }`}
                  onClick={() =>
                    onTogglePurchased(item.id)
                  }
                  aria-label={
                    item.purchased
                      ? 'Mark as not purchased'
                      : 'Mark as purchased'
                  }
                >
                  {item.purchased ? '✓' : ''}
                </button>

                {/* Item information */}
                <div className="grocery-item-info">
                  <strong>{item.name}</strong>

                  <span>
                    {item.quantity}
                  </span>
                </div>

                {/* Status */}
                <div
                  className={`grocery-status ${
                    item.purchased
                      ? 'status-purchased'
                      : 'status-needed'
                  }`}
                >
                  {item.purchased
                    ? 'Purchased'
                    : 'To Buy'}
                </div>

                {/* Actions */}
                <div className="grocery-actions">
                  <button
                    onClick={() =>
                      onTogglePurchased(item.id)
                    }
                  >
                    {item.purchased
                      ? 'Undo'
                      : 'Purchased'}
                  </button>

                  <button
                    className="delete-grocery"
                    onClick={() =>
                      onDelete(item.id)
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Future recipe section */}
      <div className="recipe-placeholder">
        <div>
          <strong>Planned Recipes</strong>

          <p>
            Recipe ingredients will appear here when the
            Meal Planner is connected.
          </p>
        </div>

        <span>Coming later</span>
      </div>
    </div>
  );
}

export default GroceryList;


      

