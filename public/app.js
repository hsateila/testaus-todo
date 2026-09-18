/* eslint-env browser */
/* global document, window */

import {
  loadTasks,
  saveTasks,
  sortTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  escapeHtml,
  statusLabel,
} from './taskStore.js';

// DOM refs
const form = /** @type {HTMLFormElement} */ (
  document.getElementById('task-form')
);
const formTitle = /** @type {HTMLElement} */ (
  document.getElementById('form-title')
);
const inputId = /** @type {HTMLInputElement} */ (
  document.getElementById('task-id')
);
const inputTopic = /** @type {HTMLInputElement} */ (
  document.getElementById('topic')
);
const inputPriority = /** @type {HTMLSelectElement} */ (
  document.getElementById('priority')
);
const inputStatus = /** @type {HTMLSelectElement} */ (
  document.getElementById('status')
);
const inputDescription = /** @type {HTMLTextAreaElement} */ (
  document.getElementById('description')
);
const saveBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById('save-btn')
);
const resetBtn = /** @type {HTMLButtonElement} */ (
  document.getElementById('reset-btn')
);
const list = /** @type {HTMLUListElement} */ (
  document.getElementById('task-list')
);
const emptyState = /** @type {HTMLElement} */ (
  document.getElementById('empty-state')
);

// State
let tasks = loadTasks();

// Render
function render() {
  list.innerHTML = '';
  if (!tasks.length) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  sortTasks(tasks).forEach((t) => {
    const li = document.createElement('li');
    li.className = 'task' + (t.completed ? ' done' : '');
    li.dataset.id = t.id;
    li.innerHTML = `
					<div>
						<div class="title">${escapeHtml(t.topic)}</div>
						<div class="desc">${escapeHtml(t.description || '')}</div>
					</div>
					<div class="meta">
						<span class="badge prio-${t.priority}">
							<span class="dot"></span>
							${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
						</span>
					</div>
					<div class="meta">
						<span class="badge">${statusLabel(t.status)}</span>
					</div>
					<div class="controls">
						<button data-action="edit" class="secondary">Edit</button>
						<button data-action="complete" class="${t.completed ? 'secondary' : ''}">
							${t.completed ? 'Undo' : 'Complete'}
						</button>
						<button data-action="delete" class="danger">Delete</button>
					</div>
				`;
    list.appendChild(li);
  });
}

// Form handling
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const now = Date.now();
  const payload = {
    topic: inputTopic.value.trim(),
    priority: inputPriority.value,
    status: inputStatus.value,
    description: inputDescription.value.trim(),
  };
  if (!payload.topic) {
    inputTopic.focus();
    return;
  }

  if (inputId.value) {
    const idx = tasks.findIndex((t) => t.id === inputId.value);
    if (idx !== -1) {
      tasks[idx] = updateTask(tasks[idx], payload, now);
    }
  } else {
    tasks.push(createTask(payload, now));
  }
  saveTasks(tasks);
  resetForm();
  render();
});

resetBtn.addEventListener('click', () => {
  resetForm();
});

function resetForm() {
  formTitle.textContent = 'Create Task';
  inputId.value = '';
  form.reset();
  inputPriority.value = 'medium';
  inputStatus.value = 'todo';
  saveBtn.textContent = 'Save Task';
}

// List actions (event delegation)
list.addEventListener('click', (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  if (target.tagName !== 'BUTTON') return;
  const action = target.dataset.action;
  /** @type {HTMLElement | null} */
  const li = target.closest('.task');
  if (!li) return;
  const id = li.dataset.id;
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return;

  if (action === 'edit') {
    const t = tasks[idx];
    formTitle.textContent = 'Edit Task';
    inputId.value = t.id;
    inputTopic.value = t.topic;
    inputPriority.value = t.priority;
    inputStatus.value = t.status;
    inputDescription.value = t.description || '';
    saveBtn.textContent = 'Update Task';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (action === 'complete') {
    tasks[idx] = toggleTaskCompletion(tasks[idx], Date.now());
    saveTasks(tasks);
    render();
  }
  if (action === 'delete') {
    const confirmDelete = window.confirm('Delete this task?');
    if (!confirmDelete) return;
    tasks.splice(idx, 1);
    saveTasks(tasks);
    render();
  }
});

// Initial paint
render();
