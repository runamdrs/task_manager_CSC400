import TaskForm from './TaskForm.jsx';
import TaskList from './TaskList.jsx';

function DashboardPage({
  tasks,
  taskFilter,
  onTaskFilterChange,
  onSave,
  editingTask,
  onCancelEdit,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  return (
    <div className="app">
      <h1>SmartPrep</h1>
      <p>A simple task manager that stores data in your browser.</p>

      <TaskForm
        onSubmit={onSave}
        editingTask={editingTask}
        onCancel={onCancelEdit}
      />

      <h2>Tasks</h2>
      <TaskList
        tasks={tasks}
        taskFilter={taskFilter}
        onTaskFilterChange={onTaskFilterChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
      />
    </div>
  );
}

export default DashboardPage;
