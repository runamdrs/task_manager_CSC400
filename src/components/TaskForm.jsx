// Import state for controlled fields and an effect for edit-mode synchronization.
import { useState, useEffect } from 'react';

function TaskForm({ onSubmit, editingTask, onCancel }) {
  // Store each form field so the inputs remain controlled by React.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [taskType, setTaskType] = useState('general');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load the selected task into the form when editing begins.
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
      setTaskType(editingTask.taskType || 'general');
      setError('');
    } else {
      // Reset every field when the form returns to add mode.
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setTaskType('general');
      setError('');
    }
  }, [editingTask]);

  function handleSubmit(event) {
    // Prevent the browser from reloading the page on form submission.
    event.preventDefault();

    // Trim the title before validation and before sending it to the parent.
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      // Show a local validation message instead of submitting invalid data.
      setError('Title is required.');
      return;
    }

    // Send normalized form data to App for creation or update.
    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      dueDate,
      priority,
      taskType,
    });

    // Clear the fields after a successful submission.
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setTaskType('general');
    setError('');
  }

  function handleCancel() {
    // Clear local values before asking the parent to leave edit mode.
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setTaskType('general');
    setError('');
    onCancel();
  }

  return (
    // The same form supports both adding a new task and editing an existing one.
    <form className="task-form" onSubmit={handleSubmit}>
      {/* Change the heading to reflect the current form mode. */}
      <h2>{editingTask ? 'Edit Task' : 'Add Task'}</h2>

      {/* Keep the title field associated with its visible label. */}
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      {/* Store optional details about the task. */}
      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows="3"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {/* Store an optional calendar date in the browser's date format. */}
      <div className="form-field">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      {/* Restrict priority to the three supported values. */}
      <div className="form-field">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="taskType">Task Type</label>
        <select
          id="taskType"
          value={taskType}
          onChange={(event) => setTaskType(event.target.value)}
        >
          <option value="general">General</option>
          <option value="cooking">Cooking</option>
        </select>
      </div>

      {/* Render validation feedback only when an error exists. */}
      {error && <p className="error">{error}</p>}

      {/* Show the cancel action only while editing an existing task. */}
      <div className="form-actions">
        <button className="primary-action" type="submit">
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
        {editingTask && (
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
