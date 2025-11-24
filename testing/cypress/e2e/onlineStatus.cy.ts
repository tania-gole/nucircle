import { 
  loginUser, 
  setupTest, 
  teardownTest, 
  goToUsers,
  verifyUserOnlineStatus,
  verifyLastSeenDisplayed,
  logoutUser
} from '../support/helpers';

describe('Cypress Tests to verify user online status', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  it('User shows as online after login', () => {
    loginUser('test_user');
    goToUsers();

    verifyUserOnlineStatus('test_user', 'Online');
    
    cy.get('.user-card').contains('.username', 'test_user').parents('.user-card').within(() => {
      cy.get('.online-indicator').should('have.class', 'online');
    });
  });

  it('User shows as offline after logout', () => {
    loginUser('test_user');
    logoutUser();

    loginUser('test_user1');
    goToUsers();

    verifyUserOnlineStatus('test_user', 'Offline');
    
    cy.get('.user-card').contains('.username', 'test_user').parents('.user-card').within(() => {
      cy.get('.online-indicator').should('have.class', 'offline');
    });
  });

  it('Offline user displays last seen timestamp', () => {
    loginUser('test_user');
    logoutUser();

    loginUser('test_user1');
    goToUsers();

    verifyLastSeenDisplayed('test_user');
  });

  it('Multiple users show correct online status', () => {
    loginUser('test_user');
    goToUsers();

    verifyUserOnlineStatus('test_user', 'Online');

    cy.get('.user-card').each(($card) => {
      const username = $card.find('.username').text();
      if (username !== 'test_user') {
        cy.wrap($card).within(() => {
          cy.get('.online-status').should('contain', 'Offline');
        });
      }
    });
  });

  it('Online indicator updates when user reconnects', () => {
    loginUser('test_user');
    goToUsers();

    verifyUserOnlineStatus('test_user', 'Online');

    cy.reload();

    verifyUserOnlineStatus('test_user', 'Online');
  });
});