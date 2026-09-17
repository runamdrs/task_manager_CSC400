// Import the reusable row component for individual tasks.
import TaskItem from './TaskItem.jsx';

function TaskList({ tasks, onEdit, onDelete, onToggleComplete }) {
  // Give users guidance when the collection is empty.
  if (tasks.length === 0) {
    return <p className="empty-message">No tasks yet. Add one above.</p>;
  }

  return (
    // Render one task row for every task while preserving its stable id as the key.
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </ul>
  );
}

export default TaskList;
