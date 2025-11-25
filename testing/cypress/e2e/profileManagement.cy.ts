import {
  loginUser,
  setupTest,
  teardownTest,
  goToUsers,
  goToOwnProfile,
  dismissWelcomePopup,
} from '../support/helpers';

/**
 * Cypress Tests for Profile Management
 * Tests:
 * - Creating/viewing/editing profile (name, major, graduation year, co-op interests, bio)
 * - External links (LinkedIn, GitHub, Portfolio)
 */

describe('Cypress Tests for Profile Management', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  /**
   * Test: View user profile
   * Verifies that profile information is displayed correctly
   */
  it('Should display user profile information', () => {
    loginUser('e.hopper');

    // Navigate to profile page
    goToOwnProfile();
    cy.url().should('include', '/user/e.hopper');

    // Verify profile elements are displayed and scroll into view to check
    cy.contains('e.hopper', { timeout: 5000 }).scrollIntoView().should('exist');
    cy.contains('Eleven Hopper', { timeout: 5000 }).scrollIntoView().should('exist');
  });

  /**
   * Test: Edit profile information (name, major, graduation year, co-op interests)
   */
  it('Should allow editing profile information', () => {
    loginUser('e.hopper');
    goToOwnProfile();

    // Wait for profile page to fully load
    cy.url().should('include', '/user/e.hopper');

    // Intercept the updateProfile API call to verify the request payload
    cy.intercept('PATCH', '/api/user/updateProfile').as('updateProfile');

    // Click Edit Profile Info button and scroll into view first then click
    cy.contains('button', 'Edit Profile Info', { timeout: 5000 }).scrollIntoView().click({ force: true });

    // Wait for edit mode to be active
    cy.get('.profile-edit', { timeout: 5000 }).should('exist');

    // Edit first name
    cy.get('label').contains('First Name').parent().find('input').clear().type('UpdatedFirstName');

    // Edit last name
    cy.get('label').contains('Last Name').parent().find('input').clear().type('UpdatedLastName');

    // Edit major
    cy.get('label').contains('Major').parent().find('input').clear().type('Computer Science');

    // Edit graduation year
    cy.get('label').contains('Graduation Year').parent().find('input').clear().type('2025');

    // Edit co-op interests
    cy.get('label').contains('Co-op Interests').parent().find('select').should('exist').as('coopSelect');
    
    // Scroll select into view and ensure it's visible
    cy.get('@coopSelect').scrollIntoView().should('be.visible');
    
    // Verify the option exists
    cy.get('@coopSelect').find('option[value="Searching for co-op"]').should('exist');
    
    cy.get('@coopSelect').select('Searching for co-op');
    
    // Verify the value is set on the DOM element
    cy.get('@coopSelect').should('have.value', 'Searching for co-op');
    
    // Verify the selected option text
    cy.get('@coopSelect').find('option:selected').should('have.text', 'Searching for co-op');

    // edit the biography
    cy.get('label').contains('Biography').parent().find('textarea').clear().type('new biography');
    
    cy.wait(500);
    
    // Verify again
    cy.get('@coopSelect').should('have.value', 'Searching for co-op');

    // Find and click the Save button in the profile-edit section
    cy.get('.profile-edit').within(() => {
      cy.get('.edit-profile-button').contains('Save', { timeout: 5000 })
        .should('exist')
        .should('be.visible')
        .should('not.be.disabled')
        .scrollIntoView()
        .click({ force: true });
    });

    // Wait for the API call to complete and verify the request payload
    cy.wait('@updateProfile').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      
      // Verify the request body includes coopInterests
      const requestBody = interception.request.body;
      expect(requestBody).to.have.property('coopInterests', 'Searching for co-op');
      expect(requestBody).to.have.property('username', 'e.hopper');
      expect(requestBody).to.have.property('firstName', 'UpdatedFirstName');
      expect(requestBody).to.have.property('lastName', 'UpdatedLastName');
      expect(requestBody).to.have.property('major', 'Computer Science');
      expect(requestBody).to.have.property('graduationYear', 2025);
      
      // Verify the response includes the updated coopInterests
      const responseBody = interception.response?.body;
      expect(responseBody).to.have.property('coopInterests', 'Searching for co-op');
    });

    // Wait for success message to appear
    cy.contains('Profile updated successfully', { timeout: 10000 })
      .scrollIntoView()
      .should('exist')
      .should('be.visible');

    // Wait for edit mode to close 
    cy.get('.profile-edit', { timeout: 5000 }).should('not.exist');

    // Wait for the UI to update with the new values
    cy.wait(1000);

    // Verify changes are saved and scroll into view to check visibility
    cy.contains('UpdatedFirstName UpdatedLastName').scrollIntoView().should('exist');
    cy.contains('Computer Science').scrollIntoView().should('exist');
    cy.contains('2025').scrollIntoView().should('exist');
    
    // Verify co-op interests
    cy.contains('Co-op Interests:', { timeout: 5000 }).scrollIntoView().should('exist');
    
    // Wait for the text to render
    cy.wait(500);
    
    // Find the paragraph containing "Co-op Interests:" and verify it contains the new value
    cy.contains('Co-op Interests:').parent().should('exist').then(($p) => {
      const text = $p.text();
      // Verify it doesn't say "Not specified" anymore
      expect(text).to.not.include('Not specified');
      // Verify it contains "Searching for co-op"
      expect(text).to.include('Searching for co-op');
    });
    
    // Check actual displayed text
    cy.contains('Co-op Interests:').parent().should('contain.text', 'Searching for co-op');
    cy.contains('Co-op Interests:').parent().should('not.contain.text', 'Not specified');
  });

  /**
   * Test: Add external links (LinkedIn, GitHub, Portfolio)
   */
  it('Should allow adding external links', () => {
    loginUser('e.hopper');
    goToOwnProfile();

    // Wait for profile page to fully load
    cy.url().should('include', '/user/e.hopper');

    // Click Add Links button and scroll into view first
    cy.contains('button', 'Add Links', { timeout: 5000 }).scrollIntoView().click({ force: true });

    // Add LinkedIn URL
    cy.get('label').contains('LinkedIn').parent().find('input').type('https://linkedin.com/in/testuser');

    // Add GitHub URL
    cy.get('label').contains('GitHub').parent().find('input').type('https://github.com/testuser');

    // Add Portfolio URL
    cy.get('label').contains('Portfolio').parent().find('input').type('https://testuser.com');

    // Save links and scroll into view first
    cy.contains('button', 'Save').scrollIntoView().click({ force: true });

    // Verify links are saved and scroll into view to check
    cy.contains('External links updated successfully', { timeout: 5000 }).scrollIntoView().should('exist');
    cy.contains('LinkedIn:').scrollIntoView().should('exist');
    cy.contains('https://linkedin.com/in/testuser').scrollIntoView().should('exist');
    cy.contains('GitHub:').scrollIntoView().should('exist');
    cy.contains('https://github.com/testuser').scrollIntoView().should('exist');
    cy.contains('Portfolio:').scrollIntoView().should('exist');
    cy.contains('https://testuser.com').scrollIntoView().should('exist');
  });

  /**
   * Test: Edit existing external links
   */
  it('Should allow editing existing external links', () => {
    loginUser('e.hopper');
    goToOwnProfile();

    // Wait for profile page to fully load
    cy.url().should('include', '/user/e.hopper');

    // First add links and scroll into view first
    cy.contains('button', 'Add Links', { timeout: 5000 }).scrollIntoView().click({ force: true });
    cy.get('label').contains('LinkedIn').parent().find('input').type('https://linkedin.com/in/old');
    cy.get('label').contains('GitHub').parent().find('input').type('https://github.com/old');
    cy.contains('button', 'Save').click();
    cy.wait(1000);

    // Edit links and scroll into view first
    cy.contains('button', 'Edit Links').scrollIntoView().click({ force: true });
    cy.get('label').contains('LinkedIn').parent().find('input').clear().type('https://linkedin.com/in/new');
    cy.contains('button', 'Save').scrollIntoView().click({ force: true });

    // Verify updated links and scroll into view to check
    cy.contains('External links updated successfully', { timeout: 5000 }).scrollIntoView().should('exist');
    cy.contains('https://linkedin.com/in/new').scrollIntoView().should('exist');
  });

  /**
   * Test: Validate external link URLs
   */
  it('Should validate external link URLs format', () => {
    loginUser('e.hopper');
    goToOwnProfile();

    // Wait for profile page to fully load
    cy.url().should('include', '/user/e.hopper');

    cy.contains('button', 'Add Links', { timeout: 5000 }).scrollIntoView().click({ force: true });

    // Try to save invalid URL
    cy.get('label').contains('LinkedIn').parent().find('input').type('invalid-url');
    cy.contains('button', 'Save').scrollIntoView().click({ force: true });

    // Verify error message appears and scroll into view to check
    cy.contains('URLs must start with http:// or https://', { timeout: 5000 }).scrollIntoView().should('exist');
  });

  /**
   * Test: External links are clickable
   */
  it('Should make external links clickable', () => {
    loginUser('e.hopper');
    goToOwnProfile();

    // Wait for profile page to fully load
    cy.url().should('include', '/user/e.hopper');

    // Add links and scroll into view first
    cy.contains('button', 'Add Links', { timeout: 5000 }).scrollIntoView().click({ force: true });
    cy.get('label').contains('LinkedIn').parent().find('input').type('https://linkedin.com/in/testuser');
    cy.contains('button', 'Save').scrollIntoView().click({ force: true });
    cy.wait(1000);

    // Verify links are clickable
    cy.contains('a', 'https://linkedin.com/in/testuser').should('have.attr', 'href', 'https://linkedin.com/in/testuser');
    cy.contains('a', 'https://linkedin.com/in/testuser').should('have.attr', 'target', '_blank');
  });

  /**
   * Test: View another user's profile
   */
  it('Should allow viewing another user\'s profile', () => {
    loginUser('e.hopper');
    goToUsers();

    // Click on another user's card and scroll into view first
    cy.get('.user_card').contains('.userUsername', 'm.wheeler').scrollIntoView().click({ force: true });

    // Verify profile page loads
    cy.url().should('include', '/user/m.wheeler');
    cy.contains('m.wheeler', { timeout: 5000 }).scrollIntoView().should('exist');

    // Verify edit buttons are not visible for other users
    cy.contains('button', 'Edit Profile Info').should('not.exist');
  });

  /**
   * Test: Profile displays all information fields
   */
  it('Should display all profile information fields', () => {
    loginUser('e.hopper');
    goToOwnProfile();

    // Wait for profile page to fully load
    cy.url().should('include', '/user/e.hopper');

    // Verify all sections exist and scroll into view to check visibility
    cy.contains('Major:').scrollIntoView().should('exist');
    cy.contains('Graduation Year:').scrollIntoView().should('exist');
    cy.contains('Co-op Interests:').scrollIntoView().should('exist');
    cy.contains('Biography:').scrollIntoView().should('exist');
    cy.contains('External Links').scrollIntoView().should('exist');
  });
});

