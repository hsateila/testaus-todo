# Testing in web applications -course: Basic CRUD ToDo web app (JS + localStorage)

A minimal full-stack JavaScript Todo application intended for learning unit testing with Vitest and end-to-end testing with Cypress (added later). This version has no database; tasks are stored in the browser's localStorage.

## Technology stack

- **Backend**: Node.js (Express) serving static files and simple health/version endpoints
- **Frontend**: Vanilla JavaScript, HTML, CSS (no framework)
- **Storage**: `localStorage` in the browser (`todo_tasks_v1`)
- **Dev tooling**: None required initially (tests will be added in a later phase: this is the exercise)

### Features

- Create a task (topic, priority, status, description)
- Update a task (edit all fields)
- Mark task as complete (toggle complete/undo)
- Delete a task
- Sorted list: not-done first, higher priority first, newest first

### Getting started

1. Ensure Node.js 18+ is installed.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the server:

   ```bash
   npm start
   ```

4. Open the app at `http://localhost:5173`

### Project structure

```text
.
├─ public/
│  ├─ index.html     # UI markup
│  ├─ styles.css     # styling
│  ├─ taskStore.js   # pure task logic (no DOM) - unit test this
│  └─ app.js         # DOM wiring: event listeners, rendering
├─ tests/            # Vitest unit tests
├─ server.js         # Express static server + health/version
├─ vitest.config.js
├─ package.json
└─ README.md
```

### Notes for the testing phase

- Unit tests (Vitest): the functions in `public/taskStore.js` (`createTask`, `updateTask`,
  `toggleTaskCompletion`, `sortTasks`, `escapeHtml`, `statusLabel`, `loadTasks`, `saveTasks`)
  are plain, exported, DOM-independent functions - import them directly in a
  `tests/taskStore.test.js` file and test them with Vitest, following the same
  "it should ..." / Arrange-Act-Assert style as the course instructions.
  `public/app.js` only wires the DOM to `taskStore.js` and is intentionally left out of
  unit test scope.
- Run tests with `npm test` (single run) or `npm run test:watch` (watch mode).
- E2E tests (Cypress): target user flows—create, update, complete/undo, delete; use `/health` to check server readiness.
