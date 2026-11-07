import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Todos from '../components/hooks/Todos';

describe('Todos productTodo type', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('todoCategories', JSON.stringify(['General']));
        localStorage.setItem('selectedTodoCategory', 'General');
    });

    test('shows the product sku under the product name', () => {
        const productTodo = {
            description: 'Widget',
            category: 'General',
            type: 'productTodo',
            sku: 'SKU-123',
            completed: false,
            time: 0,
            currentTime: 0,
            counterValue: 2,
            counterTarget: 0,
            activated: false,
        };

        localStorage.setItem('todos', JSON.stringify([productTodo]));

        render(<Todos />);

        expect(screen.getByText(/widget/i)).toBeTruthy();
        expect(screen.getByText(/sku-123/i)).toBeTruthy();
        expect(screen.getByText('2')).toBeTruthy();
    });

    test('does not block underlying todo interaction when edit mode is active', () => {
        const productTodo = {
            description: 'Widget',
            category: 'General',
            type: 'productTodo',
            sku: 'SKU-123',
            completed: false,
            time: 0,
            currentTime: 0,
            counterValue: 2,
            counterTarget: 0,
            activated: false,
        };

        localStorage.setItem('todos', JSON.stringify([productTodo]));

        const { container } = render(<Todos />);
        screen.getByTitle('EDIT').click();

        const editToolbar = [...container.querySelectorAll('div')].find((element) => {
            const style = element.getAttribute('style') || '';
            return style.includes('pointer-events: none');
        });

        expect(editToolbar).toBeTruthy();
        expect(editToolbar.style.pointerEvents).toBe('none');
        expect(editToolbar.style.display).toBe('flex');
        expect(editToolbar.style.flexDirection).toBe('row');
        expect(editToolbar.style.overflowX).toBe('auto');

        const actionButtons = [...container.querySelectorAll('[style*="pointer-events: auto"]')];
        expect(actionButtons.length).toBeGreaterThan(0);
    });
});
