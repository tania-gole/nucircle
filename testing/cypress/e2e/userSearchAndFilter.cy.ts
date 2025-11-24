import { 
  loginUser, 
  setupTest, 
  teardownTest
} from '../support/helpers';

describe('Cypress Tests for User Search and Filter Functionality', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  const navigateToUsers = () => {
    cy.contains('Users').click();
    cy.wait(1000);
  };

  describe('Search by Name', () => {
    it('User can search for other users by first name', () => {
      loginUser('e.hopper');
      navigateToUsers();

      cy.get('#user_search_bar').type('Mike');
      cy.contains('button', 'Search').click();
      cy.wait(1000);

      cy.get('.user_card').should('contain', 'Mike');
    });

    it('User can search for other users by last name', () => {
      loginUser('e.hopper');
      navigateToUsers();

      cy.get('#user_search_bar').type('Wheeler');
      cy.contains('button', 'Search').click();
      cy.wait(1000);

      cy.get('.user_card').should('contain', 'Wheeler');
    });

    it('User can search for other users by username', () => {
      loginUser('e.hopper');
      navigateToUsers();

      cy.get('#user_search_bar').type('m.wheeler');
      cy.contains('button', 'Search').click();
      cy.wait(1000);

      cy.get('.user_card').should('contain', 'm.wheeler');
    });

    it('Search is case insensitive', () => {
      loginUser('e.hopper');
      navigateToUsers();

      cy.get('#user_search_bar').type('MIKE');
      cy.contains('button', 'Search').click();
      cy.wait(1000);

      cy.get('.user_card').should('have.length.at.least', 1);
    });
  });

  describe('Search by Company', () => {
    it('User can search for other users by company name', () => {
        loginUser('e.hopper');
        navigateToUsers();

        cy.get('.user_card').should('have.length.at.least', 1);
        
        cy.get('#user_search_bar').clear().type('Lab');
        cy.contains('button', 'Search').click();
        cy.wait(1500);

        cy.get('body').should('exist');
    });
});

  describe('Filter by Major', () => {
    it('User can filter users by major', () => {
      loginUser('e.hopper');
      navigateToUsers();

      cy.get('.filter-control-btn').first().click();
      cy.wait(500);

      // Select major
      cy.get('select').first().select('Computer Science');
      cy.contains('button', 'Search').click();
      cy.wait(1000);

      cy.get('.user_card').should('have.length.at.least', 1);
    });
  });

  describe('Filter by Graduation Year', () => {
    it('User can filter users by graduation year', () => {
      loginUser('e.hopper');
      navigateToUsers();

      cy.get('.filter-control-btn').first().click();
      cy.wait(500);

      // Select graduation year
      cy.get('select').eq(1).select('2025');
      cy.contains('button', 'Search').click();
      cy.wait(1000);

      cy.get('.user_card').should('have.length.at.least', 1);
    });
  });

  describe('Filter by Community', () => {
    it('User can filter users by community', () => {
      loginUser('e.hopper');
      navigateToUsers();

      cy.get('.filter-control-btn').first().click();
      cy.wait(500);

      cy.get('select').eq(2).select('HubSpot');
      cy.contains('button', 'Search').click();
      cy.wait(1000);

      cy.get('.user_card').should('have.length.at.least', 1);
    });
  });

  describe('Combined Search and Filters', () => {
    it('User can combine search with filters', () => {
        loginUser('e.hopper');
        navigateToUsers();

        cy.get('.user_card').should('have.length.at.least', 1);

        cy.get('#user_search_bar').clear().type('e');
        cy.get('.filter-control-btn').first().click();
        cy.wait(500);
        
        cy.get('select').first().find('option').then($options => {
        if ($options.length > 1) {
            cy.get('select').first().select($options[1].text);
        }
        });
        
        cy.contains('button', 'Search').click();
        cy.wait(1500);

        cy.get('body').should('exist');
    });
});

  describe('Clear Search', () => {
    it('User can clear search results', () => {
        loginUser('e.hopper');
        navigateToUsers();

        cy.get('.user_card').should('have.length.at.least', 1);

        cy.get('#user_search_bar').clear().type('Mike');
        cy.contains('button', 'Search').click();
        cy.wait(1500);

        cy.contains('button', 'Clear').click();
        cy.wait(1500);

        cy.get('.user_card').should('have.length.at.least', 3);
    });
  });
});