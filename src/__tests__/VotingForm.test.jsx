// src/__tests__/VotingForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VotingForm from '../components/VotingForm/VotingForm';

// Mock fetch globally
global.fetch = jest.fn();

describe('VotingForm Component', () => {

    beforeEach(() => {
        fetch.mockClear();
    });

    test('renders all form fields correctly', () => {
        render(<VotingForm />);
        expect(screen.getByTestId('form-title')).toBeInTheDocument();
        expect(screen.getByTestId('name-input')).toBeInTheDocument();
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
        expect(screen.getByTestId('vote-select')).toBeInTheDocument();
        expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
        expect(screen.getByTestId('reset-btn')).toBeInTheDocument();
    });

    test('validates email successfully (mocked validation)', async () => {
        render(<VotingForm />);
        const emailInput = screen.getByTestId('email-input');

        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.blur(emailInput);

        await waitFor(() => expect(screen.getByText(/Valid email/i)).toBeInTheDocument());
    });

    test('displays email validation error for disposable domains', async () => {
        render(<VotingForm />);
        const emailInput = screen.getByTestId('email-input');

        fireEvent.change(emailInput, { target: { value: 'test@disposable.com' } });
        fireEvent.blur(emailInput);

        await waitFor(() =>
            expect(screen.getByText(/Disposable email not allowed/i)).toBeInTheDocument()
        );
    });

    test('calculates password strength correctly', async () => {
        render(<VotingForm />);
        const passwordInput = screen.getByTestId('password-input');

        fireEvent.change(passwordInput, { target: { value: 'abc' } });

        await waitFor(() =>
            expect(screen.getByTestId('password-strength')).toHaveTextContent(/Weak/i)
        );

        fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });

        await waitFor(() =>
            expect(screen.getByTestId('password-strength')).toHaveTextContent(/Very strong/i)
        );
    });

    test('submits form successfully with mock URL', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

        render(<VotingForm submitUrl="/mock-submit" />);
        fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John' } });
        fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'StrongPass123!' } });
        fireEvent.change(screen.getByTestId('vote-select'), { target: { value: 'candidateA' } });

        fireEvent.click(screen.getByTestId('submit-btn'));

        await waitFor(() =>
            expect(screen.getByText(/Submitted successfully!/i)).toBeInTheDocument()
        );
    });

    test('shows error message on failed submission', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<VotingForm submitUrl="/mock-submit" />);
        fireEvent.click(screen.getByTestId('submit-btn'));

        await waitFor(() =>
            expect(screen.getByText(/Network error/i)).toBeInTheDocument()
        );
    });

    test('resets form successfully', async () => {
        render(<VotingForm />);
        const nameInput = screen.getByTestId('name-input');
        const emailInput = screen.getByTestId('email-input');
        const passwordInput = screen.getByTestId('password-input');
        const voteSelect = screen.getByTestId('vote-select');

        fireEvent.change(nameInput, { target: { value: 'John' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
        fireEvent.change(voteSelect, { target: { value: 'candidateA' } });

        fireEvent.click(screen.getByTestId('reset-btn'));

        await waitFor(() => {
            expect(nameInput.value).toBe('');
            expect(emailInput.value).toBe('');
            expect(passwordInput.value).toBe('');
            expect(voteSelect.value).toBe('');
        });
    });
});