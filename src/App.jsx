// Import React state management for the task collection and active edit state.
import { useState } from 'react';
// Import the form responsible for creating and editing tasks.
import TaskForm from './components/TaskForm.jsx';
// Import the weekly breakfast, lunch, and dinner planner.
import MealPlanner from './components/MealPlanner.jsx';
// Import the list responsible for rendering all tasks.
import TaskList from './components/TaskList.jsx';
// Import the browser-storage helpers used to persist tasks between visits.
import { loadTasks, saveTasks } from './services/taskStorage.js';

// Provide starter data when the browser has no saved tasks yet.
const SAMPLE_TASKS = [
  {
    id: crypto.randomUUID(),
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, and coffee.',
    dueDate: '2026-07-20',
    priority: 'medium',
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'Finish project report',
    description: 'Write the summary section and proofread.',
    dueDate: '2026-07-18',
    priority: 'high',
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'Call the dentist',
    description: 'Schedule a cleaning appointment.',
    dueDate: '2026-07-25',
    priority: 'low',
    completed: true,
  },
];

function getInitialTasks() {
  // Read saved tasks before the first render so the app starts with current data.
  const stored = loadTasks();

  // Seed storage only for a first-time visitor.
  if (stored === null) {
    saveTasks(SAMPLE_TASKS);
    return SAMPLE_TASKS;
  }

  return stored;
}

function App() {
  // Keep the complete task collection in component state.
  const [tasks, setTasks] = useState(getInitialTasks);
  // Track the task currently being edited, or null while adding a task.
  const [editingTask, setEditingTask] = useState(null);

  function handleSave(taskData) {
    // Build one replacement array for both create and update operations.
    let updatedTasks;

    if (editingTask) {
      // Replace only the matching task while preserving its id and completion state.
      updatedTasks = tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: taskData.title,
              description: taskData.description,
              dueDate: taskData.dueDate,
              priority: taskData.priority,
            }
          : task
      );
      setEditingTask(null);
    } else {
      // New tasks receive a unique id and begin as incomplete.
      const newTask = {
        id: crypto.randomUUID(),
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        completed: false,
      };
      updatedTasks = [...tasks, newTask];
    }

    // Update the UI and browser storage together.
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function handleEdit(task) {
    // Pass the selected task to the form so its fields can be populated.
    setEditingTask(task);
  }

  function handleCancelEdit() {
    // Returning to add mode clears the active edit selection.
    setEditingTask(null);
  }

  function handleDelete(id) {
    // Ask for confirmation before permanently removing a task.
    const confirmed = window.confirm('Are you sure you want to delete this task?');

    if (!confirmed) {
      // Leave state unchanged when the user cancels the confirmation dialog.
      return;
    }

    // Remove the task with the requested id from the collection.
    const updatedTasks = tasks.filter((task) => task.id !== id);
    // Persist the deletion immediately so it survives a page reload.
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    if (editingTask && editingTask.id === id) {
      // Exit edit mode if the task being edited was deleted.
      setEditingTask(null);
    }
  }

  function handleToggleComplete(id) {
    // Toggle completion without mutating the existing task objects.
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    // Keep storage synchronized with the visible completion state.
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  return (
    <div className="app">
      {/* Display the application heading and its short description. */}
      <h1>SmartPrep</h1>
      <p>A simple task manager that stores data in your browser.</p>

      {/* Show a first slice of the weekly meal planner above the task tools. */}
      <MealPlanner />

      {/* The form switches between add and edit behavior through its props. */}
      <TaskForm
        onSubmit={handleSave}
        editingTask={editingTask}
        onCancel={handleCancelEdit}
      />

      {/* Render the current collection and actions for each task. */}
      <h2>Tasks</h2>
      <TaskList
        tasks={tasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}

export default App;
