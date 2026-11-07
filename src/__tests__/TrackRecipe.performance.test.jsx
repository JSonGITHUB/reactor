import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrackRecipe from '../components/tracker/TrackRecipe';
import { IngredientContext } from '../components/context/IngredientContext';
import { KitchenInventoryContext } from '../components/context/KitchenInventoryContext';

describe('TrackRecipe performance', () => {
    beforeEach(() => {
        window.ResizeObserver = class {
            observe() {}
            disconnect() {}
        };
    });

    test('does not mutate the recipe source data while filtering by search term', () => {
        const recipes = [{
            category: 'Dinner',
            display: true,
            recipes: [
                {
                    dish: 'Pasta',
                    description: 'A simple dinner with garlic and olive oil.',
                    ingredients: [['2', 'cloves', 'garlic', false]],
                    instructions: [{ step: 'Saute garlic', ingredients: [['2', 'cloves', 'garlic', false]] }],
                    display: true,
                },
                {
                    dish: 'Salad',
                    description: 'A crisp side salad.',
                    ingredients: [['1', 'bunch', 'spinach', false]],
                    instructions: [{ step: 'Wash greens', ingredients: [['1', 'bunch', 'spinach', false]] }],
                    display: true,
                },
            ],
        }];

        const setRecipes = jest.fn();
        const ingredientValue = {
            ingredients: ['garlic'],
            setIngredients: jest.fn(),
            ingredientStatus: {},
            toggleIngredientStatus: jest.fn(),
            clearIngredientStatuses: jest.fn(),
        };
        const kitchenValue = {
            upsertInventoryFromIngredients: jest.fn(),
        };

        render(
            <IngredientContext.Provider value={ingredientValue}>
                <KitchenInventoryContext.Provider value={kitchenValue}>
                    <TrackRecipe
                        targetElementRef={{ current: null }}
                        scrollToBottom={() => {}}
                        recipes={recipes}
                        setRecipes={setRecipes}
                        getIngredients={() => ['garlic']}
                    />
                </KitchenInventoryContext.Provider>
            </IngredientContext.Provider>
        );

        const searchInput = screen.getByPlaceholderText('+ Add new category / Search');
        fireEvent.change(searchInput, { target: { value: 'garlic' } });

        expect(recipes[0].display).toBe(true);
        expect(recipes[0].recipes[0].display).toBe(true);
        expect(recipes[0].recipes[1].display).toBe(true);
    });

    test('virtualizes large recipe groups instead of rendering every group at once', () => {
        const recipes = Array.from({ length: 60 }, (_, index) => ({
            category: `Dinner ${index + 1}`,
            display: true,
            recipes: [{
                dish: `Dish ${index + 1}`,
                description: `Recipe ${index + 1}`,
                ingredients: [['1', 'cup', 'rice', false]],
                instructions: [{ step: 'Cook rice', ingredients: [['1', 'cup', 'rice', false]] }],
                display: true,
            }],
        }));

        const setRecipes = jest.fn();
        const ingredientValue = {
            ingredients: [],
            setIngredients: jest.fn(),
            ingredientStatus: {},
            toggleIngredientStatus: jest.fn(),
            clearIngredientStatuses: jest.fn(),
        };
        const kitchenValue = {
            upsertInventoryFromIngredients: jest.fn(),
        };

        const { container } = render(
            <IngredientContext.Provider value={ingredientValue}>
                <KitchenInventoryContext.Provider value={kitchenValue}>
                    <TrackRecipe
                        targetElementRef={{ current: null }}
                        scrollToBottom={() => {}}
                        recipes={recipes}
                        setRecipes={setRecipes}
                        getIngredients={() => []}
                    />
                </KitchenInventoryContext.Provider>
            </IngredientContext.Provider>
        );

        expect(screen.queryByText('Dish 1')).toBeInTheDocument();
        expect(screen.queryByText('Dish 60')).not.toBeInTheDocument();

        const scrollContainer = container.querySelector('div[style*="overflow-y: auto"]');
        expect(scrollContainer).not.toBeNull();

        fireEvent.scroll(scrollContainer, { target: { scrollTop: 4000 } });

        expect(screen.queryByText('Dish 60')).toBeInTheDocument();
    });
});
