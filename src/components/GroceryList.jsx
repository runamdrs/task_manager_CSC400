import { useTranslation } from '../i18n/useTranslation.js';

function GroceryList({
  items,
  purchaseWeekKey,
  total,
  purchasedCount,
  remaining,
  onTogglePurchased,
}) {
  const { t } = useTranslation();
  const progress = total === 0 ? 0 : Math.round((purchasedCount / total) * 100);

  return (
    <div className="grocery-page">
      <header className="grocery-header">
        <div>
          <p className="grocery-label">{t('SMART GROCERY LIST')}</p>
          <h1>{t('Grocery List')}</h1>
          <p className="grocery-description">
            {t('Add meals in the Meal Planner to add their ingredients to this list.')}
          </p>
        </div>
      </header>

      <section className="shopping-progress" aria-label={t('Shopping progress')}>
        <div className="progress-top">
          <div>
            <p className="progress-label">{t('SHOPPING PROGRESS')}</p>
            <h2>{purchasedCount} {t('of')} {total} {t('items')} {t('purchased')}</h2>
          </div>

          <div className="progress-numbers">
            <div>
              <span>{t('Total')}</span>
              <strong>{total}</strong>
            </div>
            <div>
              <span>{t('Purchased')}</span>
              <strong>{purchasedCount}</strong>
            </div>
            <div>
              <span>{t('Remaining')}</span>
              <strong>{remaining}</strong>
            </div>
          </div>
        </div>

        <div
          className="progress-bar"
          role="progressbar"
          aria-label={t('Grocery items purchased')}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={purchasedCount}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="grocery-section" aria-labelledby="grocery-items-heading">
        <div className="section-header">
          <h2 id="grocery-items-heading">{t('Grocery Items')}</h2>
          <span>{total} {t('items')}</span>
        </div>

        {items.length === 0 ? (
          <div className="empty-grocery">
            <div className="empty-icon" aria-hidden="true">🛒</div>
            <h3>{t('No groceries needed yet')}</h3>
            <p>{t('Add meals in the Meal Planner to add their ingredients to this list.')}</p>
          </div>
        ) : (
          <ul className="grocery-items">
            {items.map((item) => {
              const isPurchased = item.status === 'purchased';
              const isNeedsMore = item.status === 'needs-more';

              return (
                <li
                  className={`grocery-item${isPurchased ? ' purchased' : ''}${isNeedsMore ? ' needs-more' : ''}`}
                  key={item.key}
                >
                  <input
                    className="purchase-check"
                    type="checkbox"
                    checked={isPurchased}
                    aria-label={t(
                      isPurchased ? 'Mark {name} as not purchased' : 'Mark {name} as purchased',
                      { name: item.name }
                    )}
                    onChange={() => onTogglePurchased(purchaseWeekKey, item)}
                  />

                  <div className="grocery-item-info">
                    <strong>{item.name}</strong>
                    {item.quantity && <span>{item.quantity}</span>}
                    <span className="grocery-source-label">{t('Needed for')}:</span>
                    <ul
                      className="grocery-source-list"
                      aria-label={t('Planned meals requiring {name}', { name: item.name })}
                    >
                      {item.sources.map((source) => (
                        <li key={`${source.mealId}-${source.category}`}>
                          {source.mealName} — {t(source.category)} ({source.date})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span
                    className={`grocery-status ${
                      isPurchased
                        ? 'status-purchased'
                        : isNeedsMore
                          ? 'status-needs-more'
                          : 'status-needed'
                    }`}
                  >
                    {isPurchased
                      ? t('Purchased')
                      : isNeedsMore
                        ? t('Needs more')
                        : t('To buy')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default GroceryList;
