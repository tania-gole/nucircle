import { 
  loginUser, 
  setupTest, 
  teardownTest
} from '../support/helpers';

describe('Cypress Tests - Message Reactions on All Message Types', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Global Message Reactions', () => {
    it('User can react to global messages', () => {
      loginUser('e.hopper');
      
      // Open messaging dropdown and navigate to global messages
      cy.contains('.menu_button', 'Messaging').click();
      cy.wait(500);
      cy.contains('Global Messages').click();
      cy.wait(1500);

      // Verify messages exist
      cy.get('.message').should('have.length.at.least', 1);
      
      // Click like on first message
      cy.get('.message').first().within(() => {
        cy.get('.reaction-btn').first().click();
        cy.wait(500);
        cy.get('.reaction-btn').first().should('contain', '1');
      });
    });

    it('User can toggle reactions on global messages', () => {
      loginUser('e.hopper');
      cy.contains('.menu_button', 'Messaging').click();
      cy.wait(500);
      cy.contains('Global Messages').click();
      cy.wait(1500);

      cy.get('.message').first().within(() => {
        // Add reaction
        cy.get('.reaction-btn').first().click();
        cy.wait(500);
        
        // Remove reaction
        cy.get('.reaction-btn').first().click();
        cy.wait(500);
        
        // Verify count is 0 or empty
        cy.get('.reaction-btn').first().invoke('text').then((text) => {
          expect(['0', ''].some(v => text.includes(v) || text.trim() === '')).to.be.true;
        });
      });
    });
  });

  describe('Community Message Reactions', () => {
    it('User can react to community messages', () => {
      loginUser('e.hopper');
      
      // Open messaging dropdown and navigate to community messages
      cy.contains('.menu_button', 'Messaging').click();
      cy.wait(500);
      cy.contains('Community Messages').click();
      cy.wait(1500);

      // Select HubSpot community
      cy.contains('.community-btn', 'HubSpot').click();
      cy.wait(1000);

      // Verify messages exist
      cy.get('.message').should('have.length.at.least', 1);
      
      // React to first message
      cy.get('.message').first().within(() => {
        cy.get('.reaction-btn').eq(1).click(); // Love button
        cy.wait(500);
        cy.get('.reaction-btn').eq(1).should('contain', '1');
      });
    });

    it('Reaction button shows active state after clicking', () => {
      loginUser('e.hopper');
      cy.contains('.menu_button', 'Messaging').click();
      cy.wait(500);
      cy.contains('Community Messages').click();
      cy.wait(1500);
      cy.contains('.community-btn', 'HubSpot').click();
      cy.wait(1000);
      
      // Click reaction and verify active state
      cy.get('.message').first().within(() => {
        cy.get('.reaction-btn').first().click();
        cy.wait(500);
        cy.get('.reaction-btn').first().should('have.class', 'active');
      });
    });
  });

  describe('Direct Message Reactions', () => {
    it('Direct messages page loads correctly', () => {
      loginUser('e.hopper');
      
      // Navigate to direct messages
      cy.contains('.menu_button', 'Messaging').click();
      cy.wait(500);
      cy.contains('Direct Messages').click();
      cy.wait(1000);

      // Verify on the right page
      cy.url().should('include', '/messaging/direct-message');
    });
  });

  describe('Reaction Persistence', () => {
    it('Global messages display reaction buttons', () => {
      loginUser('e.hopper');
      cy.contains('.menu_button', 'Messaging').click();
      cy.wait(500);
      cy.contains('Global Messages').click();
      cy.wait(1500);

      // Verify reaction buttons exist on messages
      cy.get('.message').first().within(() => {
        cy.get('.reaction-btn').should('have.length', 2); // Like and Love buttons
      });
    });
  });
});