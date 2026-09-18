/* global localStorage */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} topic
 * @property {string} priority
 * @property {string} status
 * @property {string} description
 * @property {boolean} completed
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} TaskInput
 * @property {string} topic
 * @property {string} priority
 * @property {string} status
 * @property {string} description
 */

const STORAGE_KEY = 'todo_tasks_v1';

/**
 * Loads the task list from localStorage.
 * Returns an empty array if nothing is stored or the stored value is invalid.
 * @returns {Task[]}
 */
export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists the given task list to localStorage.
 * @param {Task[]} tasks
 * @returns {void}
 */
export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Generates a pseudo-unique id for a new task.
 * @returns {string}
 */
export function generateId() {
  return (
    't_' +
    Math.random().toString(36).slice(2, 8) +
    Date.now().toString(36).slice(-4)
  );
}

/**
 * Escapes HTML special characters in a string, so it is safe to insert
 * into innerHTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Returns the human-readable label for a task status.
 * Unknown statuses are returned unchanged.
 * @param {string} status
 * @returns {string}
 */
export function statusLabel(status) {
  const labels = {
    todo: 'To do',
    'in-progress': 'In progress',
    blocked: 'Blocked',
    done: 'Done',
  };
  return labels[status] || status;
}

/**
 * Returns a new array of tasks ordered: not-done before done, then
 * higher priority before lower, then newest before oldest. Does not
 * mutate the input array.
 * @param {Task[]} tasks
 * @returns {Task[]}
 */
export function sortTasks(tasks) {
  const prioRank = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (prioRank[a.priority] !== prioRank[b.priority]) {
      return prioRank[a.priority] - prioRank[b.priority];
    }
    return b.createdAt - a.createdAt;
  });
}

/**
 * Builds a new task from form input.
 * @param {TaskInput} payload
 * @param {number} now - timestamp to use for createdAt/updatedAt
 * @returns {Task}
 */
export function createTask(payload, now) {
  return {
    id: generateId(),
    ...payload,
    completed: payload.status === 'done',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Returns a new task with the given payload merged onto an existing task.
 * Setting status to 'done' marks the task completed; any other status
 * leaves the existing completed flag untouched.
 * @param {Task} existingTask
 * @param {TaskInput} payload
 * @param {number} now - timestamp to use for updatedAt
 * @returns {Task}
 */
export function updateTask(existingTask, payload, now) {
  return {
    ...existingTask,
    ...payload,
    completed: payload.status === 'done' ? true : existingTask.completed,
    updatedAt: now,
  };
}

/**
 * Returns a new task with completed toggled. Toggling on sets status to
 * 'done'; toggling off resets a 'done' status back to 'todo' (any other
 * status is left as-is).
 * @param {Task} task
 * @param {number} now - timestamp to use for updatedAt
 * @returns {Task}
 */
export function toggleTaskCompletion(task, now) {
  const nextCompleted = !task.completed;
  return {
    ...task,
    completed: nextCompleted,
    status: nextCompleted
      ? 'done'
      : task.status === 'done'
      ? 'todo'
      : task.status,
    updatedAt: now,
  };
}
