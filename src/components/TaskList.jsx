// Import the reusable row component for individual tasks.
import TaskItem from './TaskItem.jsx';

const TASK_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function TaskList({
  tasks,
  taskFilter,
  onTaskFilterChange,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === 'active') {
      return !task.completed;
    }

    if (taskFilter === 'completed') {
      return task.completed;
    }

    return true;
  });

  return (
    <>
      <div className="task-filters" role="group" aria-label="Filter tasks by status">
        {TASK_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className="task-filter"
            type="button"
            aria-pressed={taskFilter === filter.value}
            onClick={() => onTaskFilterChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <p className="empty-message">No tasks yet! Add your first task above.</p>
      ) : filteredTasks.length === 0 ? (
        <p className="empty-message">No {taskFilter} tasks.</p>
      ) : (
        // Render matching task rows while preserving each task's stable id as the key.
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </ul>
      )}
    </>
  );
}

export default TaskList;
