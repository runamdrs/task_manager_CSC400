import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation.js';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner'];

function createIngredient() {
  return { name: '', quantity: '' };
}

function MealFormModal({
  meal,
  initialDate,
  initialCategory,
  recipes,
  occupiedMeal,
  onClose,
  onSave,
  onEditOccupied,
}) {
  const { t } = useTranslation();
  const [recipeId, setRecipeId] = useState(meal?.recipeId ?? '');
  const [name, setName] = useState(meal?.name ?? '');
  const [date, setDate] = useState(meal?.date ?? initialDate);
  const [category, setCategory] = useState(meal?.category ?? initialCategory);
  const [ingredients, setIngredients] = useState(
    meal?.ingredients?.length ? meal.ingredients : [createIngredient()]
  );
  const [preparationTime, setPreparationTime] = useState(
    meal ? String(meal.preparationTime) : ''
  );
  const [image, setImage] = useState(meal?.image ?? '');
  const [error, setError] = useState('');
  const availableRecipes = recipes ?? [];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  function updateIngredient(index, field, value) {
    setIngredients((current) =>
      current.map((ingredient, ingredientIndex) =>
        ingredientIndex === index
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    );
  }

  function handleRecipeSelection(event) {
    const selectedId = event.target.value;
    setRecipeId(selectedId);
    const recipe = availableRecipes.find((item) => item.id === selectedId);
    if (!recipe) return;

    setName(recipe.title);
    setIngredients(
      recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity ?? ingredient.amount ?? '',
      }))
    );
    setPreparationTime(String(recipe.prepMinutes + recipe.cookMinutes));
    setImage(recipe.imageUrl ?? '');
    if (CATEGORIES.includes(recipe.mealType)) setCategory(recipe.mealType);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('Choose an image file.'));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setError('');
      } else {
        setError(t('The selected image could not be read.'));
      }
    };
    reader.onerror = () => setError(t('The selected image could not be read.'));
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const time = Number(preparationTime);
    if (!trimmedName) {
      setError(t('Meal name is required.'));
      return;
    }
    if (!date) {
      setError(t('Choose a calendar date.'));
      return;
    }
    if (!CATEGORIES.includes(category)) {
      setError(t('Choose a meal category.'));
      return;
    }
    if (preparationTime.trim() === '' || !Number.isFinite(time) || time < 0) {
      setError(t('Preparation time must be a nonnegative number of minutes.'));
      return;
    }

    const result = onSave({
      ...(meal ? { id: meal.id } : {}),
      recipeId: recipeId || null,
      name: trimmedName,
      date,
      category,
      ingredients: ingredients
        .map(({ name: ingredientName, quantity }) => ({
          name: ingredientName.trim(),
          quantity: quantity.trim(),
        }))
        .filter((ingredient) => ingredient.name),
      preparationTime: time,
      image,
    });

    if (!result.ok && result.error) {
      setError(t('Meal could not be saved: {error}', { error: result.error }));
    }
  }

  return (
    <div
      className="mp-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="mp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mp-modal-title"
      >
        <header className="mp-modal-header">
          <div>
            <p className="mp-eyebrow">{meal ? t('UPDATE YOUR PLAN') : t('PLAN A MEAL')}</p>
            <h2 id="mp-modal-title">{meal ? t('Edit Meal') : t('Add Meal')}</h2>
          </div>
          <button type="button" className="mp-icon-button" aria-label={t('Close dialog')} onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form className="mp-meal-form" onSubmit={handleSubmit}>
          <label className="mp-form-field">
            <span>{t('Choose a recipe')}</span>
            <select value={recipeId} onChange={handleRecipeSelection}>
              <option value="">{t('Custom meal')}</option>
              {availableRecipes.length === 0 ? (
                <option value="" disabled>{t('No recipes available yet')}</option>
              ) : (
                availableRecipes.map((recipe) => (
                  <option value={recipe.id} key={recipe.id}>{recipe.title}</option>
                ))
              )}
            </select>
            <span className="mp-field-hint">
              {t('Selecting a recipe fills in its name, ingredients, prep time, and image.')}
            </span>
          </label>

          <label className="mp-form-field">
            <span>{t('Meal name')} <span className="mp-required">*</span></span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('e.g. Roasted vegetable bowl')}
              maxLength={120}
            />
          </label>

          <div className="mp-form-row">
            <label className="mp-form-field">
              <span>{t('Calendar date')} <span className="mp-required">*</span></span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label className="mp-form-field">
              <span>{t('Meal category')} <span className="mp-required">*</span></span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((item) => <option key={item} value={item}>{t(item)}</option>)}
              </select>
            </label>
          </div>

          <fieldset className="mp-ingredients-fieldset">
            <legend>{t('Ingredients')}</legend>
            <p className="mp-field-hint">{t('Add an ingredient name and an optional quantity.')}</p>
            <div className="mp-ingredient-list">
              {ingredients.map((ingredient, index) => (
                <div className="mp-ingredient-row" key={index}>
                  <input
                    type="text"
                    aria-label={t('Ingredient {number}', { number: index + 1 })}
                    value={ingredient.name}
                    onChange={(event) => updateIngredient(index, 'name', event.target.value)}
                    placeholder={t('Ingredient')}
                    maxLength={100}
                  />
                  <input
                    type="text"
                    aria-label={t('Quantity for ingredient {number}', { number: index + 1 })}
                    value={ingredient.quantity}
                    onChange={(event) => updateIngredient(index, 'quantity', event.target.value)}
                    placeholder={t('Quantity (optional)')}
                    maxLength={40}
                  />
                  <button
                    type="button"
                    className="mp-remove-ingredient"
                    aria-label={t('Remove ingredient {number}', { number: index + 1 })}
                    onClick={() => setIngredients((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="mp-add-ingredient" onClick={() => setIngredients((current) => [...current, createIngredient()])}>
              <span aria-hidden="true">+</span> {t('Add ingredient')}
            </button>
          </fieldset>

          <div className="mp-form-row">
            <label className="mp-form-field">
              <span>{t('Preparation time')} <span className="mp-required">*</span></span>
              <div className="mp-number-suffix">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={preparationTime}
                  onChange={(event) => setPreparationTime(event.target.value)}
                  placeholder="30"
                />
                <span>{t('min')}</span>
              </div>
            </label>
            <label className="mp-form-field">
              <span>{t('Food image')} <span className="mp-field-hint-inline">{t('(optional)')}</span></span>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          {image && (
            <div className="mp-image-preview">
              <img src={image} alt={t('Meal preview')} />
              <button type="button" className="mp-remove-image" onClick={() => setImage('')}>
                {t('Remove image')}
              </button>
            </div>
          )}

          {occupiedMeal && (
            <div className="mp-slot-conflict" role="alert">
              <p>
                {t('{category} on {date} already contains “{name}”. Edit the existing meal or choose another slot.', {
                  category: t(occupiedMeal.category),
                  date: occupiedMeal.date,
                  name: occupiedMeal.name,
                })}
              </p>
              <button type="button" onClick={() => onEditOccupied(occupiedMeal)}>
                {t('Edit existing meal')}
              </button>
            </div>
          )}
          {error && <p className="mp-error" role="alert">{error}</p>}

          <div className="mp-modal-actions">
            <button type="button" className="mp-button mp-button-secondary" onClick={onClose}>
              {t('Cancel')}
            </button>
            <button type="submit" className="mp-button mp-button-primary">
              {meal ? t('Save Changes') : t('Save Meal')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default MealFormModal;
