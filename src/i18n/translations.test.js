import { describe, expect, it } from 'vitest';
import { translate } from './translations.js';

describe('translations', () => {
  it('provides Spanish and German interface text', () => {
    expect(translate('es', 'Settings')).toBe('Configuración');
    expect(translate('de', 'Settings')).toBe('Einstellungen');
  });

  it('keeps English as the default and falls back for untranslated text', () => {
    expect(translate('en', 'Meal Planner')).toBe('Meal Planner');
    expect(translate('es', 'A user-created recipe')).toBe('A user-created recipe');
  });

  it('interpolates dynamic labels without changing custom content', () => {
    expect(translate('es', '“{name}” will be removed from your weekly plan.', {
      name: 'Mi receta',
    })).toBe('“Mi receta” se quitará de tu plan semanal.');
  });
});
