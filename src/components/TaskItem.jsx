function TaskItem({ task, onEdit, onDelete, onToggleComplete }) {
  // Add a completion class so completed tasks receive distinct styling.
  return (
    <li className={task.completed ? 'task-item completed' : 'task-item'}>
      {/* Present the task details and omit the description when it is empty. */}
      <div className="task-info">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        {/* Show the task metadata and its current completion status. */}
        <p>
          Due: {task.dueDate || 'None'} | Priority: {task.priority} |{' '}
          {task.completed ? 'Completed' : 'Incomplete'}
        </p>
      </div>

      {/* Expose the task operations supplied by the parent component. */}
      <div className="task-actions">
        <button type="button" onClick={() => onToggleComplete(task.id)}>
          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
        <button type="button" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
