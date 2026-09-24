// Keep the storage key in one place so reads and writes always match.
const STORAGE_KEY = 'taskflow-tasks';

export function loadTasks() {
  // Retrieve the serialized task collection from browser storage.
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === null) {
    // Null indicates that this is the first visit and no data exists yet.
    return null;
  }

  // Convert the stored JSON string back into JavaScript task objects.
  return JSON.parse(stored);
}

export function saveTasks(tasks) {
  // Serialize the latest task collection before saving it in the browser.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
