import { 
  loginUser, 
  setupTest, 
  teardownTest, 
  goToUsers,
  sendQuizInvite,
  verifyChallengeButtonState,
  acceptQuizInvite,
  declineQuizInvite,
  verifyQuizInviteModal
} from '../support/helpers';

describe('Cypress Tests to verify quiz invitation system', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  it('Challenge button appears for online users', () => {
    loginUser('test_user');
    goToUsers();

    cy.get('.user-card').contains('.username', 'azad').parents('.user-card').within(() => {
      cy.get('.challenge-button').should('be.visible');
    });
  });

  it('Challenge button disabled for offline users', () => {
    loginUser('test_user');
    goToUsers();

    cy.get('.user-card').each(($card) => {
      cy.wrap($card).then(($el) => {
        if ($el.find('.online-indicator.offline').length > 0) {
          cy.wrap($el).within(() => {
            cy.get('.challenge-button').should('be.disabled');
          });
        }
      });
    });
  });

  it('Sending quiz invitation shows success message', () => {
    loginUser('test_user');
    goToUsers();

    sendQuizInvite('test_user1');

    cy.contains('Quiz invitation sent').should('be.visible');
  });

  it('Cannot send duplicate invitation to same user', () => {
    loginUser('test_user');
    goToUsers();

    sendQuizInvite('test_user1');
    cy.contains('Quiz invitation sent');

    sendQuizInvite('test_user1');
    cy.contains('Invitation already sent');
  });

  it('Received invitation shows modal with accept and decline buttons', () => {
    loginUser('test_user1');

    cy.window().then((win) => {
      win.postMessage({
        type: 'quizInviteReceived',
        data: {
          id: 'test-invite-123',
          challengerUsername: 'test_user',
          recipientUsername: 'test_user1',
        },
      }, '*');
    });

    verifyQuizInviteModal('test_user');
  });

  it('Accepting invitation navigates to game page', () => {
    loginUser('test_user1');

    cy.window().then((win) => {
      win.postMessage({
        type: 'quizInviteReceived',
        data: {
          id: 'test-invite-123',
          challengerUsername: 'test_user',
          recipientUsername: 'test_user1',
        },
      }, '*');
    });

    acceptQuizInvite();

    cy.url().should('include', '/game');
    cy.contains('test_user');
  });

  it('Declining invitation closes modal', () => {
    loginUser('test_user1');

    cy.window().then((win) => {
      win.postMessage({
        type: 'quizInviteReceived',
        data: {
          id: 'test-invite-123',
          challengerUsername: 'test_user',
          recipientUsername: 'test_user1',
        },
      }, '*');
    });

    declineQuizInvite();

    cy.get('.quiz-invite-modal').should('not.exist');
    cy.url().should('not.include', '/game');
  });

  it('Challenge button shows pending state after sending invitation', () => {
    loginUser('test_user');
    goToUsers();

    sendQuizInvite('test_user1');

    cy.get('.user-card').contains('.username', 'test_user1').parents('.user-card').within(() => {
      cy.get('.challenge-button').should('be.disabled');
      cy.get('.challenge-button').should('contain', 'Pending');
    });
  });

  it('Cannot challenge yourself', () => {
    loginUser('test_user');
    goToUsers();

    cy.get('.user-card').contains('.username', 'test_user').parents('.user-card').within(() => {
      cy.get('.challenge-button').should('not.exist');
    });
  });
});