import React, { useEffect, useState, useContext } from 'react';
import mobileRecipeTracking from './data_mobile'; 
import RecipeGroup from './RecipeGroup';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import Ingredient from './Ingredient';
import { IngredientContext } from '../context/IngredientContext';
import { useKitchenInventory } from '../context/KitchenInventoryContext';
import Selector from '../forms/FunctionalSelector.js';

const TrackRecipe = ({

    targetElementRef,
    scrollToBottom,
    recipes,
    setRecipes,
    getIngredients
    
}) => {

    const {
        ingredients,
        setIngredients
    } = useContext(IngredientContext);
    const { upsertInventoryFromIngredients } = useKitchenInventory();
    
    const [ingredientsCollapse, setIngredientsCollapse] = useState(true);
    const [category, setCategory] = useState('all');
    const [collapseAll, setCollapseAll] = useState();

    const normalizeIngredientKey = (ingredientValue) => {
        const unitAliases = {
            tsp: 'teaspoon',
            tsps: 'teaspoon',
            teaspoon: 'teaspoon',
            teaspoons: 'teaspoon',
            tbsp: 'tablespoon',
            tbsps: 'tablespoon',
            tablespoon: 'tablespoon',
            tablespoons: 'tablespoon',
            cup: 'cup',
            cups: 'cup',
            oz: 'ounce',
            ounce: 'ounce',
            ounces: 'ounce',
            lb: 'pound',
            lbs: 'pound',
            pound: 'pound',
            pounds: 'pound',
            g: 'gram',
            gram: 'gram',
            grams: 'gram',
            kg: 'kilogram',
            kilogram: 'kilogram',
            kilograms: 'kilogram',
            ml: 'milliliter',
            milliliter: 'milliliter',
            milliliters: 'milliliter',
            l: 'liter',
            liter: 'liter',
            liters: 'liter',
            bunch: 'bunch',
            bunches: 'bunch',
            handful: 'handful',
            handfull: 'handful',
            handfuls: 'handful',
            handfulls: 'handful',
            clove: 'clove',
            cloves: 'clove',
            stalk: 'stalk',
            stalks: 'stalk',
            pinch: 'pinch',
            pinches: 'pinch'
        };
        const unitLabels = new Set(Object.values(unitAliases));
        const descriptorWords = new Set([
            'and',
            'or',
            'coarse',
            'ground',
            'fresh',
            'freshly',
            'finely',
            'thinly',
            'chopped',
            'minced',
            'diced',
            'sliced',
            'optional',
            'to',
            'taste'
        ]);

        const normalized = String(ingredientValue || '')
            .toLowerCase()
            .replace(/[_-]/g, ' ')
            .replace(/[^a-z0-9\s/.,⁄-]/g, ' ')
            .trim();

        const sanitized = normalized
            .replace(/\b\d+([.,]\d+)?\b/g, ' ')
            .replace(/\b\d+[/⁄]\d+\b/g, ' ')
            .replace(/[¼½¾⅓⅔⅛⅜⅝⅞]/g, ' ');

        const tokens = normalized
            .split(/\s+/)
            .map(token => token.replace(/^[.,]+|[.,]+$/g, ''))
            .map(token => unitAliases[token] || token)
            .filter(Boolean);
        const isNumberToken = (token) => {
            return /^\d*\.?\d+$/.test(token)
                || /^\d+\/\d+$/.test(token)
                || /^[¼½¾⅓⅔⅛⅜⅝⅞]$/.test(token);
        };

        const sanitizedTokens = sanitized
            .split(/\s+/)
            .map(token => token.replace(/^[.,]+|[.,]+$/g, ''))
            .map(token => unitAliases[token] || token)
            .filter(Boolean);

        const ingredientNameTokens = sanitizedTokens.filter(
            token => !isNumberToken(token) && !unitLabels.has(token) && !descriptorWords.has(token)
        );
        const normalizedName = ingredientNameTokens.join(' ').replace(/\s+/g, ' ').trim();
        return normalizedName || tokens
            .filter(token => !isNumberToken(token) && !unitLabels.has(token) && !descriptorWords.has(token))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim() || normalized;
    };

    const mergeIngredients = (previousIngredients, nextIngredients) => {
        const current = Array.isArray(previousIngredients) ? previousIngredients : [];
        const incoming = Array.isArray(nextIngredients) ? nextIngredients : [];
        const merged = [...current, ...incoming];
        const uniqueByIngredient = new Map();

        merged.forEach(item => {
            const key = normalizeIngredientKey(item);
            if (!uniqueByIngredient.has(key)) {
                uniqueByIngredient.set(key, item);
            }
        });

        return Array.from(uniqueByIngredient.values());
    };

    useEffect(() => {
        if (!Array.isArray(ingredients)) {
            return;
        }
        const dedupedIngredients = mergeIngredients([], ingredients);
        const hasChanged = dedupedIngredients.length !== ingredients.length
            || dedupedIngredients.some((item, index) => item !== ingredients[index]);

        if (hasChanged) {
            setIngredients(dedupedIngredients);
        }
        upsertInventoryFromIngredients(dedupedIngredients);
    }, [ingredients]); // eslint-disable-line react-hooks/exhaustive-deps

    const addActiveIngredientsToList = () => {
        const activeIngredients = getIngredients();
        setIngredients(previousIngredients => mergeIngredients(previousIngredients, activeIngredients));
        setIngredientsCollapse(false);
    };
    
    useEffect(() => {
        if (collapseAll === undefined) return; // Don't run on initial mount
        const nextCollapsedState = !!collapseAll;

        setRecipes((previousRecipes) => {
            if (!Array.isArray(previousRecipes)) return previousRecipes;

            const hasAnyChange = previousRecipes.some((recipeGroup) => {
                const groupChanged = recipeGroup.isCollapsed !== nextCollapsedState || recipeGroup.collapsed !== nextCollapsedState;
                const recipeChanged = Array.isArray(recipeGroup.recipes)
                    ? recipeGroup.recipes.some((recipe) => recipe.isCollapsed !== nextCollapsedState || recipe.collapsed !== nextCollapsedState)
                    : false;
                return groupChanged || recipeChanged;
            });

            if (!hasAnyChange) {
                return previousRecipes;
            }

            const newRecipes = previousRecipes.map(recipeGroup => ({
                ...recipeGroup,
                isCollapsed: nextCollapsedState,
                collapsed: nextCollapsedState,
                recipes: Array.isArray(recipeGroup.recipes)
                    ? recipeGroup.recipes.map(recipe => ({
                        ...recipe,
                        isCollapsed: nextCollapsedState,
                        collapsed: nextCollapsedState
                    }))
                    : recipeGroup.recipes
            }));

            localStorage.setItem('recipeTracking', JSON.stringify(newRecipes));
            return newRecipes;
        });
    }, [collapseAll, setRecipes]);

    useEffect(() => {
        if (recipes === null) {
            const storedRecipes = JSON.parse(localStorage.getItem('recipeTracking')) || mobileRecipeTracking;
            setRecipes(storedRecipes);
        }
        const storedCategory = localStorage.getItem('recipeCategory');
        if (storedCategory !== null) {
            setCategory(storedCategory);
        } else {
            setCategory('all');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if ((category === null) || (category === '') || (category === undefined)) {
            localStorage.setItem('recipeCategory', 'all');
        } else {
            localStorage.setItem('recipeCategory', category);
        }
        if (!Array.isArray(recipes) || recipes.length === 0) {
            return;
        }

        let hasAnyChange = false;
        const newRecipes = recipes.map((recipeGroup) => {
            const shouldDisplay = category === 'all' || recipeGroup.category === category;
            const currentDisplay = recipeGroup.display === true || recipeGroup.display === 'true';
            if (currentDisplay !== shouldDisplay) {
                hasAnyChange = true;
                return {
                    ...recipeGroup,
                    display: shouldDisplay
                };
            }
            return recipeGroup;
        });

        if (hasAnyChange) {
            setRecipes(newRecipes);
        }
    }, [category, recipes, setRecipes]);    
    const notNull = (value) => (value !== null) ? true : false;
    const notEmpty = (value) => (value !== "") ? true : false;
    const isGood = (value) => (notNull(value) && notEmpty(value)) ? true : false;

    const addRecipe = (recipeGroupIndex, recipeIndex) => {
        const updatedRecipes = [...recipes];
        const recipeDescription = prompt('Dish name:', '');
        const newRecipe = {
            dish: recipeDescription,
            //recipe: recipe
            description: '',
            display: true
        }
        if (isGood(recipeDescription)/* || isGood(recipe)*/) {
            updatedRecipes[recipeGroupIndex].recipes.push(newRecipe)
            setRecipes(updatedRecipes);
        }

    };
    const deleteGroup = (recipeGroupIndex) => {
        const toggle = window.confirm(`Are you sure you want to remove recipe group ${recipes[recipeGroupIndex].category}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error("Index out of range");
            }
        };
        if (toggle) {
            const newRecipes = [...recipes];
            removeItemByIndex(newRecipes, recipeGroupIndex);
            setRecipes(newRecipes);
        }
    }
    const getCategories = () => {
        const categories = ['all'];
        recipes.forEach((recipeGroup) => {
            if (recipeGroup.category !== undefined && recipeGroup.category !== null) {
                categories.push(recipeGroup.category);
            }
        });
        return categories;
    }
    const updateCategory = (a, b, selected) => {
        setCategory(selected);
    }
    
    const ingredientHeader = <div>
                                <span className='size30 mr-10'>
                                    🛒
                                </span> 
                                <span className='size25'>
                                    Ingredients
                                </span>
                            </div>;
    return (
        <div>
            <div className='pr-10'>
                <Selector
                    groupTitle='Category'
                    selected={category}
                    label={'Category'}
                    items={getCategories()}
                    onChange={updateCategory}
                    padding='5px'
                    fontSize='15'
                />
            </div>
            <div className='containerBox color-yellow bg-lite'>
                <CollapseToggleButton
                    title={ingredientHeader}
                    isCollapsed={ingredientsCollapse}
                    setCollapse={setIngredientsCollapse}
                    align='left'
                />
            </div>
            <div className='containerBox bg-lite'>
                <button className='button p-10 size20' onClick={addActiveIngredientsToList}>
                    Add Active Ingredients to Grocery List
                </button>
            </div>
            {
                (ingredientsCollapse)
                ? null
                : (ingredients === null || ingredients.length === 0)
                    ? <div className='containerBox'>No ingredients in list. Use Add Active Ingredients to Grocery List.</div>
                    : <div className='height-400'>
                        {
                        ingredients.map(ingredient => <div key={String(ingredient)}>
                                                    <Ingredient
                                                        ingredient={ingredient}
                                                    />
                                                </div>)}
                    </div>
            }
            <div className='containerBox bg-lite'>
                <CollapseToggleButton
                    title={collapseAll ? `Expand All` : `Collapse All`}
                    isCollapsed={collapseAll}
                    setCollapse={setCollapseAll}
                    align='left'
                />
            </div>
            {
                recipes.map((recipeGroup, recipeGroupIndex) => {
                    if (recipeGroup.display === true || recipeGroup.display === 'true') {
                        return <div key={`${recipeGroup?.category || 'recipe-group'}-${recipeGroupIndex}`}>
                            <RecipeGroup
                                recipes={recipes}
                                setRecipes={setRecipes}
                                setCollapseAll={setCollapseAll}
                                recipeGroup={recipeGroup}
                                recipeGroupIndex={recipeGroupIndex}
                                deleteGroup={deleteGroup}
                                addRecipe={addRecipe}
                                //setScroll={setScroll}
                                targetElementRef={targetElementRef}
                                scrollToBottom={scrollToBottom}
                            />
                        </div>
                    }
                    return null;
                })
            }
        </div>
    )
}

export default TrackRecipe