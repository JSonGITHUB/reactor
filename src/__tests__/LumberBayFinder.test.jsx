import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Lumber from '../components/HomeDepot/Lumber';

describe('Lumber Product Finder', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('renders the Product Finder section with product selection controls', () => {
        render(<Lumber />);

        expect(screen.getByText(/Product Finder/i)).toBeTruthy();
        expect(screen.getByLabelText(/Select product/i)).toBeTruthy();
        expect(screen.getByLabelText(/Product name/i)).toBeTruthy();
        expect(screen.getByLabelText(/Aisle number/i)).toBeTruthy();
        expect(screen.getByLabelText(/Bay number/i)).toBeTruthy();
        expect(screen.getByLabelText(/Sort products by/i)).toBeTruthy();
        expect(screen.getByLabelText(/Filter products by/i)).toBeTruthy();
    });

    test('allows clearing the active product filter', () => {
        render(<Lumber />);

        fireEvent.change(screen.getByLabelText(/Filter products by/i), { target: { value: 'aisle' } });
        fireEvent.change(screen.getByLabelText(/Filter by value/i), { target: { value: '21' } });

        const clearFiltersButton = screen.getByText(/clear filters/i);
        expect(clearFiltersButton).toBeTruthy();

        fireEvent.click(clearFiltersButton);

        expect(screen.getByLabelText(/Filter products by/i).value).toBe('all');
        expect(screen.getByLabelText(/Filter products by/i)).toBeTruthy();
    });

    test('deletes the selected product from the inventory list', () => {
        render(<Lumber />);

        const deleteButton = screen.getByRole('button', { name: /delete product/i });
        fireEvent.click(deleteButton);

        expect(screen.queryByText(/2X4X6/i)).toBeNull();
        expect(screen.getByLabelText(/Select product/i)).toBeTruthy();
    });

    test('sorts product selector values in numeric dimension order', () => {
        render(<Lumber />);

        const productSelect = screen.getByLabelText(/Select product/i);
        const optionTexts = Array.from(productSelect.options).map((option) => option.textContent);

        expect(optionTexts).toEqual(['2X4X6', '2X4X8', '2X4X10']);
    });
});
