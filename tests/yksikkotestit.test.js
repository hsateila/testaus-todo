// yksikkötesteissä on käytetty tekoälyä.

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createTask,
  loadTasks,
  saveTasks,
  generateId,
  escapeHtml,
  statusLabel,
  updateTask,
  toggleTaskCompletion,
} from '../public/taskStore.js';

describe('createTask', () => {
  it('luo keskeneräisen tehtävän lomakkeen tiedoista', () => {
    const task = createTask(
      {
        topic: 'Kirjoita yksikkötesti',
        priority: 'high',
        status: 'todo',
        description: 'Tarkista, että Vitest käynnistyy',
      },
      123,
    );

    expect(task).toMatchObject({
      topic: 'Kirjoita yksikkötesti',
      priority: 'high',
      status: 'todo',
      description: 'Tarkista, että Vitest käynnistyy',
      completed: false,
      createdAt: 123,
      updatedAt: 123,
    });
    expect(task.id).toMatch(/^t_/);
  });
});

describe('loadTasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('palauttaa tyhjän taulukon, kun tehtäviä ei ole tallennettu', () => {
    expect(loadTasks()).toEqual([]);
  });

  it('lataa JSON-taulukkona tallennetut tehtävät', () => {
    const tasks = [{ id: 't_1', topic: 'Tallennettu tehtävä' }];
    localStorage.setItem('todo_tasks_v1', JSON.stringify(tasks));

    expect(loadTasks()).toEqual(tasks);
  });

  it('palauttaa tyhjän taulukon, kun tallennettu tieto ei ole kelvollista JSONia', () => {
    localStorage.setItem('todo_tasks_v1', '{virheellinen json');

    expect(loadTasks()).toEqual([]);
  });

  it('palauttaa tyhjän taulukon, kun tallennettu JSON ei ole taulukko', () => {
    localStorage.setItem(
      'todo_tasks_v1',
      JSON.stringify({ topic: 'Ei taulukko' }),
    );

    expect(loadTasks()).toEqual([]);
  });
});

describe('taskin tallennus', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tallentaa ja näyttää taskin oikein', () => {
    saveTasks([{ id: 't_1', topic: 'Tallennettu taski' }]);

    expect(loadTasks()).toEqual([{ id: 't_1', topic: 'Tallennettu taski' }]);
  });
});

describe('id:n generointi', () => {
  it('generoi uniikin id:n', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('Htmlin escape', () => {
  it('pakenee HTML erikoismerkit', () => {
    const input = '<div>Test & "escape" this!</div>';
    const escaped = escapeHtml(input);
    expect(escaped).toBe(
      '&lt;div&gt;Test &amp; &quot;escape&quot; this!&lt;/div&gt;',
    );
  });
});

describe('statusLabel', () => {
  it('palauttaa oikean labelin tunnetulle statukselle', () => {
    expect(statusLabel('todo')).toBe('To do');
    expect(statusLabel('in-progress')).toBe('In progress');
    expect(statusLabel('done')).toBe('Done');
  });
});

describe('Taskin päivitys', () => {
  it('päivittää taskin oikein', () => {
    const originalTask = {
      id: 't_1',
      topic: 'Alkuperäinen taski',
      priority: 'medium',
      status: 'todo',
      description: 'Alkuperäinen kuvaus',
      completed: false,
      createdAt: 123,
      updatedAt: 123,
    };

    const updatedTask = updateTask(
      originalTask,
      {
        topic: 'päivitetty taski',
        priority: 'high',
        status: 'in-progress',
        description: 'uusi kuvaus',
      },
      456,
    );

    expect(updatedTask).toMatchObject({
      id: 't_1',
      topic: 'päivitetty taski',
      priority: 'high',
      status: 'in-progress',
      description: 'uusi kuvaus',
    });
  });
});

describe('Taskin valmistuminen', () => {
  it('vaihtaa taskin valmistumisen tilan oikein', () => {
    const task = {
      id: 't_1',
      topic: 'Testaa valmistuminen',
      priority: 'medium',
      status: 'todo',
      description: 'Testataan valmistumista',
      completed: false,
      createdAt: 123,
      updatedAt: 123,
    };

    const updatedTask = toggleTaskCompletion(task);

    expect(updatedTask.completed).toBe(true);
  });
});
