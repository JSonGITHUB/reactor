/// <reference types="cypress" />

describe('VotingForm E2E Flow', () => {
    const baseUrl = 'http://localhost:3000'; // Adjust if your app runs elsewhere

    beforeEach(() => {
        cy.visit(baseUrl);
    });

    it('renders all form elements', () => {
        cy.get('[data-testid="voting-form"]').should('exist');
        cy.get('[data-testid="name-input"]').should('exist');
        cy.get('[data-testid="email-input"]').should('exist');
        cy.get('[data-testid="password-input"]').should('exist');
        cy.get('[data-testid="vote-select"]').should('exist');
        cy.get('[data-testid="submit-btn"]').should('exist');
        cy.get('[data-testid="reset-btn"]').should('exist');
    });

    it('validates email input on blur', () => {
        cy.get('[data-testid="email-input"]').type('user@disposable.com').blur();
        cy.contains('Disposable email not allowed').should('be.visible');

        cy.get('[data-testid="email-input"]').clear().type('user@example.com').blur();
        cy.contains('Valid email').should('be.visible');
    });

    it('checks password strength updates as user types', () => {
        cy.get('[data-testid="password-input"]').type('abc');
        cy.get('[data-testid="password-strength"]').should('contain.text', 'Weak');

        cy.get('[data-testid="password-input"]').clear().type('Abc123!');
        cy.get('[data-testid="password-strength"]').should('contain.text', 'Strong');
    });

    it('submits the form successfully', () => {
        cy.intercept('POST', '**/vote', { statusCode: 200, body: { success: true } }).as('submitVote');

        cy.get('[data-testid="name-input"]').type('John Doe');
        cy.get('[data-testid="email-input"]').type('john@example.com');
        cy.get('[data-testid="password-input"]').type('Abc123!');
        cy.get('[data-testid="vote-select"]').select('candidateA');

        cy.get('[data-testid="submit-btn"]').click();
        cy.wait('@submitVote');

        cy.get('[data-testid="submit-success"]').should('contain.text', 'Submitted successfully');
    });

    it('handles failed submission gracefully', () => {
        cy.intercept('POST', '**/vote', { statusCode: 500 }).as('submitFail');

        cy.get('[data-testid="name-input"]').type('Jane Doe');
        cy.get('[data-testid="email-input"]').type('jane@example.com');
        cy.get('[data-testid="password-input"]').type('Abc123!');
        cy.get('[data-testid="vote-select"]').select('candidateB');

        cy.get('[data-testid="submit-btn"]').click();
        cy.wait('@submitFail');

        cy.get('[data-testid="submit-error"]').should('be.visible');
    });

    it('resets the form correctly', () => {
        cy.get('[data-testid="name-input"]').type('John Doe');
        cy.get('[data-testid="reset-btn"]').click();
        cy.get('[data-testid="name-input"]').should('have.value', '');
    });
});