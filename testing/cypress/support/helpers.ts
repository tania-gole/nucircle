/**
 * Test utility functions for Cypress tests
 * Provides shared helper functions for common test patterns like authentication, navigation, and data setup
 */

/**
 * Logs in a user by visiting the login page and entering credentials
 * @param username - The username to log in with
 * @param password - The password to log in with (defaults to 'password123')
 */
export const loginUser = (username: string, password: string = 'securePass123!') => {
  cy.visit('http://localhost:4530');
  cy.contains('Please login to continue to NUCircle');
  cy.get('#username-input').type(username);
  cy.get('#password-input').type(password);
  cy.contains('Log in').click();
  // Wait for redirect to home page
  cy.url().should('include', '/home');
  cy.get('.welcome-popup-button').click();
};

/**
 * Logs out the currently logged-in user
 */
export const logoutUser = () => {
  cy.get('.logout-button').click();
}

/**
 * Seeds the database with test data
 */
export const seedDatabase = () => {
  cy.exec('npx ts-node ../server/seedData/populateDB.ts ' + Cypress.env('MONGODB_URI'));
};

/**
 * Clears the database
 */
export const cleanDatabase = () => {
  cy.exec('npx ts-node ../server/seedData/deleteDB.ts ' + Cypress.env('MONGODB_URI'));
};

/**
 * Sets up the database before each test
 */
export const setupTest = () => {
  cleanDatabase();
  seedDatabase();
};

/**
 * Cleans up the database after each test
 */
export const teardownTest = () => {
  cleanDatabase();
};

/**
 * Navigates to the Ask Question page
 */
export const goToAskQuestion = () => {
  cy.contains('Ask Question').click();
  cy.url().should('include', '/new/question');
};

/**
 * Creates a new question with the provided details
 * @param title - Question title
 * @param text - Question content
 * @param tags - Space-separated tags
 */
export const createQuestion = (title: string, text: string, tags: string) => {
  goToAskQuestion();
  cy.get('#formTitleInput').type(title);
  cy.get('#formTextInput').type(text);
  cy.get('#formTagInput').type(tags);
  cy.contains('Post Question').click();
};

/**
 * Navigates to answer a specific question by clicking on its title
 * @param questionTitle - The title of the question to click on
 */
export const goToAnswerQuestion = (questionTitle: string) => {
  cy.contains(questionTitle).click();
  cy.contains('Answer Question').click();
  cy.url().should('include', '/new/answer');
};

/**
 * Creates an answer to the current question
 * @param answerText - The answer content
 */
export const createAnswer = (answerText: string) => {
  cy.get('#answerTextInput').type(answerText);
  cy.contains('Post Answer').click();
};

/**
 * Performs a search using the search bar
 * @param searchTerm - The term to search for
 */
export const performSearch = (searchTerm: string) => {
  cy.get('#searchBar').type(`${searchTerm}{enter}`);
};

/**
 * Clicks on a specific filter/order button
 * @param filterName - The name of the filter ("Newest", "Unanswered", "Active", "Most Viewed")
 */
export const clickFilter = (filterName: string) => {
  cy.contains(filterName).click();
};

/**
 * Navigates back to the Questions page
 */
export const goToQuestions = () => {
  cy.contains('Questions').click();
  cy.url().should('include', '/home');
};

/**
 * Navigates back to the Collections page
 */
export const goToCollections = () => {
  cy.contains('Collections').click();
};

/**
 * Creates a new question with the provided details
 * @param title - Question title
 * @param text - Question content
 * @param tags - Space-separated tags
 */
export const createCommunity = (title: string, desc: string, isPublic: boolean) => {
  cy.get('.new-community-button').click();
  cy.get('.new-community-input').type(title);
  cy.get('.new-community-textarea').type(desc);
  if (!isPublic) { cy.get('.checkbox-wrapper').click();};
  cy.get('.new-community-submit').click();
};

/**
 * Navigates back to the Communities page
 */
export const goToCommunities = () => {
  cy.contains('Communities').click();
};

/**
 * Navigate to a Community Card
 */
export const viewCommunityCard = (CommunityName:string) => {
  cy.contains('.community-card-title', CommunityName).closest('.community-card').contains('button', 'View Community').click();
};

/**
 * Navigates to the Community Messages page
 */
export const goToCommunityMessages = () => {
  cy.contains('Messaging').click();
  cy.contains('Community Messages').click();
}

/**
 * Waits for questions to load and verifies the page is ready
 */
export const waitForQuestionsToLoad = () => {
  cy.get('.postTitle').should('exist');
};

/**
 * Open save question to collection modal
 * @param questionTitle - The title of the question to click on
 */
export const openSaveToCollectionModal = (questionTitle: string) => {
  cy.contains('.postTitle', questionTitle).closest('.question').find('.collections-btn').click();
};

/**
 * Toggle save question modal
 * @param collectionTitle - The title of the question to click on
 */
export const toggleSaveQuestion = (collectionTitle: string) => {
  cy.get('.collection-list').contains('.collection-name', collectionTitle).parents('.collection-row').find('.save-btn').click();
};

/**
 * Saves a question to a collection
 * @param questionTitle - The title of the question to click on
 * @param collectionTitle - The title of the collection to save to
 */
export const toggleSaveQuestionToCollection = (questionTitle:string, collectionTitle: string) => {
  openSaveToCollectionModal(questionTitle);
  toggleSaveQuestion(collectionTitle);
};

/**
 * Verify community details are displayed
 * @param communityName - The name of the community
 * @param communityDesc - The description of the community
 * @param communityMembers - The members of the community
 */
export const verifyCommunityDetailsDisplayed = (communityName: string, communityDesc: string, communityMembers: Array<string>) => {
  cy.contains('.community-title', communityName).should('be.visible');
  cy.contains('.community-description', communityDesc).should('be.visible');
  cy.get('.member-item').each(($el, index, $list) => {
      cy.wrap($el).should("contain", communityMembers[index]);});
};

/**
 * Verify community details are displayed
 * @param communityName - The name of the community
 * @param communityDesc - The description of the community
 * @param communityMembers - The members of the community
 */
export const verifyCommunityDetailsNotDisplayed = (communityName: string, communityDesc: string, communityMembers: Array<string>) => {
  cy.contains('.community-title', communityName).should('not.exist');
  cy.contains('.community-description', communityDesc).should('not.exist');
  cy.get('.member-item').should('not.exist');
};

/**
 * Verify question is saved to collection
 * @param collectionTitle - The title of the collection to click on
 */
export const verifyQuestionSaved = (collectionTitle: string) => {
  cy.get('.collection-list').contains('.collection-name', collectionTitle).parents('.collection-row').get('.status-tag').should('have.class', 'saved');
};

/**
 * Verify question is unsaved to collection
 * @param collectionTitle - The title of the collection to click on
 */
export const verifyQuestionUnsaved = (collectionTitle: string) => {
  cy.get('.collection-list').contains('.collection-name', collectionTitle).parents('.collection-row').get('.status-tag').should('have.class', 'unsaved');
};

/**
 * Verifies the order of questions on the page
 * @param expectedTitles - Array of question titles in expected order
 */
export const verifyQuestionOrder = (expectedTitles: string[]) => {
  cy.get('.postTitle').should('have.length', expectedTitles.length);
  cy.get('.postTitle').each(($el, index) => {
    cy.wrap($el).should('contain', expectedTitles[index]);
  });
};

/**
 * Verifies the stats (answers/views) for questions
 * @param expectedAnswers - Array of expected answer counts
 * @param expectedViews - Array of expected view counts
 */
export const verifyQuestionStats = (expectedAnswers: string[], expectedViews: string[]) => {
  cy.get('.postStats').each(($el, index) => {
    if (index < expectedAnswers.length) {
      cy.wrap($el).should('contain', expectedAnswers[index]);
    }
    if (index < expectedViews.length) {
      cy.wrap($el).should('contain', expectedViews[index]);
    }
  });
};

/**
 * Verifies error messages are displayed
 * @param errorMessage - The error message to check for
 */
export const verifyErrorMessage = (errorMessage: string) => {
  cy.contains(errorMessage).should('be.visible');
};

/**
 * Verifies that the question count is displayed correctly
 * @param count - Expected number of questions
 */
export const verifyQuestionCount = (count: number) => {
  cy.get('#question_count').should('contain', `${count} question${count !== 1 ? 's' : ''}`);
};

/**
 * Custom assertion to check that elements contain text in order
 * @param selector - CSS selector for elements
 * @param texts - Array of texts in expected order
 */
export const verifyElementsInOrder = (selector: string, texts: string[]) => {
  cy.get(selector).should('have.length', texts.length);
  texts.forEach((text, index) => {
    cy.get(selector).eq(index).should('contain', text);
  });
};

// New methods added below

/**
 * Navigates to the My Collections page
 */
export const goToMyCollections = () => {
  cy.contains('My Collections').click();
  cy.url().should('include', '/collections');
};

/**
 * Navigates to the new collection creation page from My Collections.
 */
export const goToCreateCollection = () => {
  cy.get('.collections-create-btn').click({ force: true });
  cy.url().should('include', '/new/collection');
  cy.get('.new-collection-page').should('exist');
};

/**
 * Fills out the new collection form.
 */
export const createNewCollection = (
  name: string,
  description: string,
  isPrivate: boolean = false
) => {
  // Fill using expected classnames instead of placeholders
  cy.get('.new-collection-input')
    .should('exist')
    .clear()
    .type(name);

  cy.get('.new-collection-textarea')
    .should('exist')
    .clear()
    .type(description);

  // Handle privacy checkbox
  const checkboxSelector = '.checkbox-wrapper';
  cy.get(checkboxSelector).then(($checkbox) => {
    if (isPrivate) {
      cy.wrap($checkbox).click({ force: true });
    } 
  });

  // Submit the form
  cy.get('.new-collection-submit').should('exist').click({ force: true });
};

/**
 *  Deletes a collection by name
 * @param name - name of the collection to delete
 */
export const deleteCollection = (name: string) => {
  goToMyCollections();
  cy.get('.collection-card').contains('.main-collection-name', name).click();
  cy.get('.delete-collection-button').click({ force: true });
  cy.contains('Are you sure you want to delete this collection? This action cannot be undone.').should('exist');
  cy.get('.button-danger').click({ force: true });
};

/**
 * Verifies that a collection with the specified name is visible on the page.
 * @param name - name of the collection to verify
 */
export const verifyCollectionVisible = (name: string) => {
  cy.contains(name).should('exist');
};

/**
 * Verifies that a collection card with the specified name is visible on the page.
 * @param collectionName - Name of the collection to verify.
 */
export const verifyCollectionExists = (collectionName: string) => {
  cy.get('.collections-list').should('exist');
  cy.get('.collection-card').should('exist');
  cy.get('.main-collection-name').contains(collectionName).should('be.visible');
};

/**
 * Opens a collection by clicking on its name on the My Collections page.
 * @param name - Name of the collection to open
 */
export const goToCollection = (name: string) => {
  cy.get('.collection-card').contains('.main-collection-name', name).click({ force: true });
  cy.url().should('include', '/collections/');
  cy.get('.collection-page').should('exist');
};

/**
 * Verifies that a collection page shows required details
 * (name, description, meta, and questions list).
 * @param name - Expected collection name
 * @param username - Expected username (optional)
 */
export const verifyCollectionPageDetails = (name: string, username?: string) => {
  cy.get('.collection-title').should('contain', name);
  cy.get('.collection-description').should('exist');
  cy.get('.collection-meta').should('exist');
  cy.get('.questions-list').should('exist');
  if (username) {
    cy.get('.collection-meta').should('contain', username);
  }
};

/**
 * Adds a new work experience entry using the work experience form.
 */
export const addWorkExperience = () => {
  cy.contains("+ Add").click();
    cy.get('input[name="title"]').type("Software Engineering Co-op");
    cy.get('input[name="company"]').type("OpenAI");
    cy.get('select[name="type"]').select("Co-op");
    cy.get('input[name="location"]').type("Boston, MA");
    cy.get('input[name="startDate"]').type("2024-01-10");
    cy.get('textarea[name="description"]').type("Worked on machine learning infrastructure.");
    cy.contains("Save").click();
}

export const editWorkExperience = (field: string, value: string) => {
  cy.get('.work-experience-card').contains('Worked on machine learning infrastructure.').parents('.work-experience-card').find('.edit-button').click();
  cy.get(field).clear().type(value);
  cy.contains("Save").click();
}
