// testien teossa on käytetty tekoälyä ja testit ovat tarkistettu onko järkeviä ja toimivia.

describe('Todo-sovellus', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.reload();
  });

  function createTask({
    topic,
    description = '',
    priority = 'medium',
    status = 'todo',
  }) {
    cy.get('#topic').type(topic);
    if (description) {
      cy.get('#description').type(description);
    }
    cy.get('#priority').select(priority);
    cy.get('#status').select(status);
    cy.get('#save-btn').click();
  }

  it('luo tehtävän pakollisilla ja valinnaisilla tiedoilla sekä tallentaa sen', () => {
    createTask({
      topic: 'Aja automaattiset testit',
      description: 'Varmista GitHub Actions -asetukset',
      priority: 'high',
      status: 'in-progress',
    });

    cy.get('#task-list .task')
      .should('have.length', 1)
      .first()
      .within(() => {
        cy.get('.title').should('have.text', 'Aja automaattiset testit');
        cy.get('.desc').should(
          'have.text',
          'Varmista GitHub Actions -asetukset',
        );
        cy.get('.prio-high').should('contain.text', 'High');
        cy.get('.badge').last().should('have.text', 'In progress');
      });
    cy.window().then((window) => {
      const tasks = JSON.parse(window.localStorage.getItem('todo_tasks_v1'));
      expect(tasks).to.have.length(1);
      expect(tasks[0]).to.include({
        topic: 'Aja automaattiset testit',
        description: 'Varmista GitHub Actions -asetukset',
        priority: 'high',
        status: 'in-progress',
      });
    });
  });

  // käyttöliittymä rikkoutuu jos otsikko on liian pitkä eikä anna virhettä.
  it('vaatii otsikon ja noudattaa otsikon enimmäispituutta', () => {
    cy.get('#save-btn').click();
    cy.get('#topic:invalid').should('exist');
    cy.get('#task-list .task').should('not.exist');

    cy.get('#topic').type('a'.repeat(121));
    cy.get('#topic').invoke('val').should('have.length', 120);
    cy.get('#save-btn').click();
    cy.get('#task-list .task').should('have.length', 1);
  });

  it('palauttaa lomakkeen oletusarvoihin', () => {
    cy.get('#topic').type('Tallentamaton tehtävä');
    cy.get('#description').type('Väliaikainen kuvaus');
    cy.get('#priority').select('high');
    cy.get('#status').select('blocked');
    cy.get('#reset-btn').click();

    cy.get('#form-title').should('have.text', 'Create Task');
    cy.get('#topic').should('have.value', '');
    cy.get('#description').should('have.value', '');
    cy.get('#priority').should('have.value', 'medium');
    cy.get('#status').should('have.value', 'todo');
  });

  it('päivittää tehtävän ja näyttää uudet arvot', () => {
    createTask({ topic: 'Vanha otsikko', description: 'Vanha kuvaus' });
    cy.get('.task [data-action="edit"]').click();

    cy.get('#topic').clear().type('Uusi otsikko');
    cy.get('#description').clear().type('Uusi kuvaus');
    cy.get('#priority').select('low');
    cy.get('#status').select('done');
    cy.get('#save-btn').click();

    cy.get('#task-list .task')
      .should('have.class', 'done')
      .within(() => {
        cy.get('.title').should('have.text', 'Uusi otsikko');
        cy.get('.desc').should('have.text', 'Uusi kuvaus');
        cy.get('.prio-low').should('contain.text', 'Low');
        cy.get('.badge').last().should('have.text', 'Done');
      });
  });

  it('poistaa tehtävän listasta ja localStoragesta', () => {
    createTask({ topic: 'Poista minut' });
    cy.on('window:confirm', () => true);
    cy.get('.task [data-action="delete"]').click();

    cy.get('#task-list .task').should('not.exist');
    cy.get('#empty-state').should('be.visible');
    cy.window().then((window) => {
      expect(
        JSON.parse(window.localStorage.getItem('todo_tasks_v1')),
      ).to.deep.equal([]);
    });
  });

  it('merkitsee tehtävän suoritetuksi ja sallii toiminnon perumisen', () => {
    createTask({ topic: 'Suorita minut' });
    cy.get('.task [data-action="complete"]').click();

    cy.get('.task').should('have.class', 'done');
    cy.get('.task .title').should(
      'have.css',
      'text-decoration-line',
      'line-through',
    );
    cy.get('.task .badge').last().should('have.text', 'Done');
    cy.get('.task [data-action="complete"]').should('contain.text', 'Undo');
    cy.window().then((window) => {
      expect(
        JSON.parse(window.localStorage.getItem('todo_tasks_v1'))[0].completed,
      ).to.equal(true);
    });

    cy.get('.task [data-action="complete"]').click();
    cy.get('.task').should('not.have.class', 'done');
    cy.get('.task [data-action="complete"]').should('contain.text', 'Complete');
  });

  it('järjestää keskeneräiset ennen suoritettuja, prioriteetin ja iän mukaan', () => {
    cy.clock();
    createTask({ topic: 'Keskitasoinen vanha' });
    cy.tick(1000);
    createTask({ topic: 'Keskitasoinen uusi' });
    cy.tick(1000);
    createTask({
      topic: 'Korkean prioriteetin keskeneräinen',
      priority: 'high',
    });
    cy.tick(1000);
    createTask({
      topic: 'Korkean prioriteetin suoritettu',
      priority: 'high',
      status: 'done',
    });

    cy.get('#task-list .title').then(($titles) => {
      expect([...$titles].map((title) => title.textContent)).to.deep.equal([
        'Korkean prioriteetin keskeneräinen',
        'Keskitasoinen uusi',
        'Keskitasoinen vanha',
        'Korkean prioriteetin suoritettu',
      ]);
    });
  });

  it('säilyttää tehtävät sivun päivityksen jälkeen', () => {
    createTask({
      topic: 'Säilyvä tehtävä',
      description: 'Säilytä tämä tehtävä',
    });
    cy.reload();

    cy.get('#task-list .task')
      .should('have.length', 1)
      .and('contain.text', 'Säilyvä tehtävä');
    cy.get('#task-list .desc').should('have.text', 'Säilytä tämä tehtävä');
  });

  it('käsittelee virheelliset localStorage-tiedot rikkomatta sivua', () => {
    cy.window().then((window) => {
      window.localStorage.setItem('todo_tasks_v1', '{invalid json');
    });
    cy.reload();

    cy.get('#empty-state').should('be.visible');
    cy.get('#task-list .task').should('not.exist');
  });
});
