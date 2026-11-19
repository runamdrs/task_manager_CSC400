// Import the reusable row component for individual tasks.
import TaskItem from './TaskItem.jsx';
import { useTranslation } from '../i18n/useTranslation.js';

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
  const { t } = useTranslation();
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
      <div className="task-filters" role="group" aria-label={t('Filter tasks by status')}>
        {TASK_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className="task-filter"
            type="button"
            aria-pressed={taskFilter === filter.value}
            onClick={() => onTaskFilterChange(filter.value)}
          >
            {t(filter.label)}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <p className="empty-message">{t('No tasks yet! Add your first task above.')}</p>
      ) : filteredTasks.length === 0 ? (
        <p className="empty-message">
          {t(taskFilter === 'completed' ? 'No completed tasks.' : 'No active tasks.')}
        </p>
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
