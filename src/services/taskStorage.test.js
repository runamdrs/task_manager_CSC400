import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTasks, saveTasks } from './taskStorage.js';

// Minimal in-memory stand-in for the browser's localStorage.
function createStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

describe('taskStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null on a first visit so sample tasks can be seeded', () => {
    expect(loadTasks()).toBeNull();
  });

  it('round-trips saved tasks', () => {
    const tasks = [{ id: '1', title: 'Test', completed: false }];
    saveTasks(tasks);
    expect(loadTasks()).toEqual(tasks);
  });

  it('returns an empty list instead of throwing on corrupted JSON', () => {
    localStorage.setItem('taskflow-tasks', '{not valid json');
    expect(() => loadTasks()).not.toThrow();
    expect(loadTasks()).toEqual([]);
  });

  it('returns an empty list when the saved value is not an array', () => {
    localStorage.setItem('taskflow-tasks', JSON.stringify({ id: '1' }));
    expect(loadTasks()).toEqual([]);
  });

  it('drops malformed entries but keeps valid tasks', () => {
    localStorage.setItem(
      'taskflow-tasks',
      JSON.stringify([null, 'oops', { title: 'no id' }, { id: '2', title: 'Kept' }])
    );
    expect(loadTasks()).toEqual([{ id: '2', title: 'Kept' }]);
  });
});
