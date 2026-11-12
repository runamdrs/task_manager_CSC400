// Import React state management for the task collection and active edit state.
import { useState } from 'react';

// Import the form responsible for creating and editing tasks.
import TaskForm from './components/TaskForm.jsx';

// Import the list responsible for rendering all tasks.
import TaskList from './components/TaskList.jsx';

// Import the browser-storage helpers used to persist tasks between visits.
import { loadTasks, saveTasks } from './services/taskStorage.js';

// Import the Smart Grocery List component.
import GroceryList from './components/GroceryList.jsx';


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
  // Read saved tasks before the first render.
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

  // Track the task currently being edited.
  const [editingTask, setEditingTask] = useState(null);

  // Store all grocery items.
  const [groceryItems, setGroceryItems] = useState([]);

  // Track which main page the user is viewing.
  const [currentPage, setCurrentPage] = useState('tasks');


  function handleSave(taskData) {
    let updatedTasks;

    if (editingTask) {
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

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }


  function handleEdit(task) {
    setEditingTask(task);
  }


  function handleCancelEdit() {
    setEditingTask(null);
  }


  function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) {
      return;
    }

    const updatedTasks = tasks.filter((task) => task.id !== id);

    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    if (editingTask && editingTask.id === id) {
      setEditingTask(null);
    }
  }


  function handleToggleComplete(id) {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    );

    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }


  // -----------------------------
  // SMART GROCERY LIST FUNCTIONS
  // -----------------------------

  function handleAddGroceryItem(itemData) {
    const existingItem = groceryItems.find(
      (item) =>
        item.name.toLowerCase() === itemData.name.toLowerCase()
    );

    // If the item already exists, combine the quantities.
    if (existingItem) {
      const updatedItems = groceryItems.map((item) =>
        item.id === existingItem.id
          ? {
              ...item,
              quantity: `${item.quantity} + ${itemData.quantity}`,
            }
          : item
      );

      setGroceryItems(updatedItems);
      return;
    }

    // Add a new grocery item.
    const newItem = {
      id: crypto.randomUUID(),
      name: itemData.name,
      quantity: itemData.quantity,
      purchased: false,
    };

    setGroceryItems([...groceryItems, newItem]);
  }


  function handleDeleteGroceryItem(id) {
    const updatedItems = groceryItems.filter(
      (item) => item.id !== id
    );

    setGroceryItems(updatedItems);
  }


  function handleTogglePurchased(id) {
    const updatedItems = groceryItems.map((item) =>
      item.id === id
        ? {
            ...item,
            purchased: !item.purchased,
          }
        : item
    );

    setGroceryItems(updatedItems);
  }


  return (
    <div className="app">

      {/* Main navigation */}
      <nav className="main-navigation">
        <div className="app-logo">
          TaskFlow
        </div>

        <div className="navigation-buttons">
          <button
            className={`nav-button ${
              currentPage === 'tasks' ? 'active' : ''
            }`}
            onClick={() => setCurrentPage('tasks')}
          >
            Tasks
          </button>

          <button
            className={`nav-button ${
              currentPage === 'grocery' ? 'active' : ''
            }`}
            onClick={() => setCurrentPage('grocery')}
          >
            Grocery List
          </button>
        </div>
      </nav>


      {/* Tasks Page */}
      {currentPage === 'tasks' && (
        <main className="page-content">

          <h1>TaskFlow</h1>

          <p>
            A simple task manager that stores data in your browser.
          </p>

          <TaskForm
            onSubmit={handleSave}
            editingTask={editingTask}
            onCancel={handleCancelEdit}
          />

          <h2>Tasks</h2>

          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />

        </main>
      )}


      {/* Grocery List Page */}
      {currentPage === 'grocery' && (
        <main className="page-content">

          <GroceryList
            items={groceryItems}
            onAdd={handleAddGroceryItem}
            onDelete={handleDeleteGroceryItem}
            onTogglePurchased={handleTogglePurchased}
          />

        </main>
      )}

    </div>
  );
}

export default App;
      