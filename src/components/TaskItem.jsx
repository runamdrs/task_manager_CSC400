import { useTranslation } from '../i18n/useTranslation.js';

function TaskItem({ task, onEdit, onDelete, onToggleComplete }) {
  const { t } = useTranslation();
  // Add a completion class so completed tasks receive distinct styling.
  return (
    <li className={task.completed ? 'task-item completed' : 'task-item'}>
      {/* Present the task details and omit the description when it is empty. */}
      <div className="task-info">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        {/* Show the task metadata and its current completion status. */}
        <p>
          {t('Due:')} {task.dueDate || t('None')} | {t('Priority')}: {t(task.priority[0].toUpperCase() + task.priority.slice(1))} | {t('Type')}:{' '}
          {t(task.taskType === 'cooking' ? 'Cooking' : 'General')} |{' '}
          {t(task.completed ? 'Completed' : 'Incomplete')}
        </p>
      </div>

      {/* Expose the task operations supplied by the parent component. */}
      <div className="task-actions">
        <button type="button" onClick={() => onToggleComplete(task.id)}>
          {t(task.completed ? 'Mark Incomplete' : 'Mark Complete')}
        </button>
        <button type="button" onClick={() => onEdit(task)}>
          {t('Edit')}
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id, t('Are you sure you want to delete this task?'))}
        >
          {t('Delete')}
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
