// Keep the storage key in one place so reads and writes always match.
const STORAGE_KEY = 'taskflow-tasks';

export function loadTasks() {
  // Retrieve the serialized task collection from browser storage.
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === null) {
    // Null indicates that this is the first visit and no data exists yet.
    return null;
  }

  try {
    // Convert the stored JSON string back into JavaScript task objects.
    const tasks = JSON.parse(stored);
    // Keep only well-formed tasks so one bad entry can't break the list.
    return Array.isArray(tasks)
      ? tasks.filter((task) => task && typeof task === 'object' && typeof task.id === 'string')
      : [];
  } catch {
    // Corrupted data starts the app with an empty list instead of crashing.
    // An empty list (not null) avoids re-seeding sample tasks over it.
    return [];
  }
}

export function saveTasks(tasks) {
  // Serialize the latest task collection before saving it in the browser.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
