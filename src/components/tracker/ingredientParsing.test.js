import { parseIngredientLine } from './ingredientParsing';

describe('parseIngredientLine', () => {
    test.each([
        {
            line: '1 onion chopped',
            expected: { quantity: '1', unit: '', name: 'onion chopped' }
        },
        {
            line: '2 tbsp olive oil',
            expected: { quantity: '2', unit: 'tablespoon', name: 'olive oil' }
        },
        {
            line: '1 cups flour',
            expected: { quantity: '1', unit: 'cup', name: 'flour' }
        },
        {
            line: 'salt to taste',
            expected: { quantity: '', unit: '', name: 'salt to taste' }
        },
        {
            line: '1 bay leaves',
            expected: { quantity: '1', unit: '', name: 'bay leaves' }
        },
        {
            line: '1 clove garlic',
            expected: { quantity: '1', unit: 'clove', name: 'garlic' }
        },
        {
            line: '1 1/2 onion chopped',
            expected: { quantity: '1 1/2', unit: '', name: 'onion chopped' }
        },
        {
            line: '1 1/2 cups flour',
            expected: { quantity: '1 1/2', unit: 'cup', name: 'flour' }
        },
        {
            line: '½ onion chopped',
            expected: { quantity: '1/2', unit: '', name: 'onion chopped' }
        },
        {
            line: '1½ cups flour',
            expected: { quantity: '1 1/2', unit: 'cup', name: 'flour' }
        },
        {
            line: '1 ½ cups flour',
            expected: { quantity: '1 1/2', unit: 'cup', name: 'flour' }
        },
        {
            line: '2 ⅓ tbsp sugar',
            expected: { quantity: '2 1/3', unit: 'tablespoon', name: 'sugar' }
        },
        {
            line: '1-2 tbsp sugar',
            expected: { quantity: '1-2', unit: 'tablespoon', name: 'sugar' }
        },
        {
            line: '1 to 2 tbsp sugar',
            expected: { quantity: '1 to 2', unit: 'tablespoon', name: 'sugar' }
        },
        {
            line: '1 - 2 tbsp sugar',
            expected: { quantity: '1-2', unit: 'tablespoon', name: 'sugar' }
        }
    ])('parses "$line" correctly', ({ line, expected }) => {
        expect(parseIngredientLine(line)).toEqual(expected);
    });

    test.each([
        'undefined',
        'ingredient-1234',
        'true',
        'false',
        ''
    ])('returns null for invalid token line: "$line"', (line) => {
        expect(parseIngredientLine(line)).toBeNull();
    });
});
