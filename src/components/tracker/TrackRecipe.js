import React, { useEffect, useState, useContext } from 'react';
import mobileRecipeTracking from './data_mobile'; 
import RecipeGroup from './RecipeGroup';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import Ingredient from './Ingredient';
import { IngredientContext } from '../context/IngredientContext';
import { useKitchenInventory } from '../context/KitchenInventoryContext';
import Selector from '../forms/FunctionalSelector.js';
import { parseIngredientLine } from './ingredientParsing';
import AddProjectInterface from './AddProjectInterface';

const TrackRecipe = ({

    targetElementRef,
    scrollToBottom,
    recipes,
    setRecipes,
    getIngredients
    
}) => {

    const {
        ingredients,
        setIngredients,
        ingredientStatus,
        toggleIngredientStatus,
        clearIngredientStatuses
    } = useContext(IngredientContext);
    
    const { upsertInventoryFromIngredients } = useKitchenInventory();
    
    const [ingredientsCollapse, setIngredientsCollapse] = useState(true);
    const [category, setCategory] = useState('all');
    const [collapseAll, setCollapseAll] = useState();
    const [migrationFeedback, setMigrationFeedback] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    const createIngredientRowId = () => `ingredient-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    const normalizeIngredientRow = (row) => {
        if (!Array.isArray(row)) {
            return { row, changed: false };
        }

        const quantity = String(row[0] ?? '').trim();
        const unit = String(row[1] ?? '').trim();
        const name = String(row[2] ?? '').trim();
        const checked = typeof row[3] === 'boolean' ? row[3] : Boolean(row[3]);
        const id = row[4] || createIngredientRowId();

        const mergedLabel = `${quantity} ${unit} ${name}`.replace(/\s+/g, ' ').trim();
        const parsed = parseIngredientLine(mergedLabel) || parseIngredientLine(name);

        const normalizedQuantity = parsed?.quantity ?? quantity;
        const normalizedUnit = parsed?.unit ?? unit;
        const normalizedName = parsed?.name ?? name;

        const nextRow = [normalizedQuantity, normalizedUnit, normalizedName, checked, id];

        const changed =
            String(row[0] ?? '') !== String(nextRow[0] ?? '')
            || String(row[1] ?? '') !== String(nextRow[1] ?? '')
            || String(row[2] ?? '') !== String(nextRow[2] ?? '')
            || Boolean(row[3]) !== Boolean(nextRow[3])
            || String(row[4] || '') !== String(nextRow[4] || '');

        return { row: nextRow, changed };
    };

    const migrateExistingRecipeData = (showFeedback = false) => {
        if (!Array.isArray(recipes) || recipes.length === 0) {
            if (showFeedback) {
                setMigrationFeedback('No recipes found to repair');
            }
            return;
        }

        let changedRowsCount = 0;
        const normalizedRecipes = recipes.map((recipeGroup) => {
            if (!recipeGroup || !Array.isArray(recipeGroup.recipes)) {
                return recipeGroup;
            }

            const normalizedGroupRecipes = recipeGroup.recipes.map((recipe) => {
                if (!recipe || typeof recipe !== 'object') {
                    return recipe;
                }

                let recipeChanged = false;

                const normalizedIngredients = Array.isArray(recipe.ingredients)
                    ? recipe.ingredients.map((row) => {
                        const result = normalizeIngredientRow(row);
                        if (result.changed) {
                            recipeChanged = true;
                            changedRowsCount += 1;
                        }
                        return result.row;
                    })
                    : recipe.ingredients;

                const normalizedInstructions = Array.isArray(recipe.instructions)
                    ? recipe.instructions.map((instruction) => {
                        if (!instruction || typeof instruction !== 'object' || !Array.isArray(instruction.ingredients)) {
                            return instruction;
                        }

                        let instructionChanged = false;
                        const normalizedInstructionIngredients = instruction.ingredients.map((row) => {
                            const result = normalizeIngredientRow(row);
                            if (result.changed) {
                                instructionChanged = true;
                                changedRowsCount += 1;
                            }
                            return result.row;
                        });

                        if (instructionChanged) {
                            recipeChanged = true;
                            return {
                                ...instruction,
                                ingredients: normalizedInstructionIngredients
                            };
                        }

                        return instruction;
                    })
                    : recipe.instructions;

                if (recipeChanged) {
                    return {
                        ...recipe,
                        ingredients: normalizedIngredients,
                        instructions: normalizedInstructions
                    };
                }

                return recipe;
            });

            return {
                ...recipeGroup,
                recipes: normalizedGroupRecipes
            };
        });

        if (changedRowsCount > 0) {
            setRecipes(normalizedRecipes);
            localStorage.setItem('recipeTracking', JSON.stringify(normalizedRecipes));
            if (showFeedback) {
                setMigrationFeedback(`Repaired ${changedRowsCount} recipe ingredient row${changedRowsCount === 1 ? '' : 's'}`);
            }
            return;
        }

        if (showFeedback) {
            setMigrationFeedback('Recipe data is already clean');
        }
    };
    const refreshPage = () => {
        window.location.reload();
    };
    const addProject = () => {
        if (!newProjectDescription || newProjectDescription.trim() === '') {
            alert('Please enter a category name');
            return;
        }

        const recipe = {
            category: newProjectDescription.trim(),
            recipes: [],
            display: true,
            collapsed: true,
            isCollapsed: true
        };
        const updatedRecipes = [...recipes, recipe];
        setRecipes(updatedRecipes);

        // Use setTimeout to ensure display updates after state is set
        setTimeout(() => {
            refreshPage();
        }, 100);
    };

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

    const getUniqueIngredientLabels = (ingredientValues) => {
        const labels = Array.isArray(ingredientValues)
            ? ingredientValues.map((item) => String(item || '').trim()).filter(Boolean)
            : [];
        const uniqueByNormalizedKey = new Map();

        labels.forEach((label) => {
            const key = normalizeIngredientKey(label);
            if (!uniqueByNormalizedKey.has(key)) {
                uniqueByNormalizedKey.set(key, label);
            }
        });

        return Array.from(uniqueByNormalizedKey.values());
    };

    const getCheckedIngredientKeys = () => {
        const isCheckedValue = (value) => value === true || value === 'true';
        const statusEntries = Object.entries(ingredientStatus || {});
        return new Set(
            statusEntries
                .filter(([, checked]) => isCheckedValue(checked))
                .map(([ingredientName]) => normalizeIngredientKey(ingredientName))
        );
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
        //const activeIngredients = getIngredients();
        const activeIngredients = ingredients;
        if (!Array.isArray(activeIngredients) || activeIngredients.length === 0) {
            return;
        }

        // Support legacy and mixed ingredient shapes by extracting a stable display label.
        const ingredientValueToLabel = (ingredientValue) => {
            if (typeof ingredientValue === 'string') {
                return ingredientValue.trim();
            }

            if (Array.isArray(ingredientValue)) {
                const quantity = String(ingredientValue[0] ?? '').trim();
                const unit = String(ingredientValue[1] ?? '').trim();
                const name = String(ingredientValue[2] ?? '').trim();
                return `${quantity} ${unit} ${name}`.replace(/\s+/g, ' ').trim();
            }

            if (ingredientValue && typeof ingredientValue === 'object') {
                const preferredLabel = [
                    ingredientValue.title,
                    ingredientValue.name,
                    ingredientValue.ingredient,
                    ingredientValue.label
                ].find((value) => typeof value === 'string' && value.trim() !== '');
                return preferredLabel ? preferredLabel.trim() : '';
            }

            return '';
        };

        const activeIngredientLabels = activeIngredients
            .map(ingredientValueToLabel)
            .filter(Boolean);

        if (activeIngredientLabels.length === 0) {
            return;
        }

        const normalizedActiveIngredients = getUniqueIngredientLabels(activeIngredientLabels);
        
        if (normalizedActiveIngredients.length === 0) {
            return;
        }

        const checkedIngredientKeys = getCheckedIngredientKeys();

        const uncheckedActiveIngredients = normalizedActiveIngredients.filter(
            (ingredientName) => !checkedIngredientKeys.has(normalizeIngredientKey(ingredientName))
        );

        if (uncheckedActiveIngredients.length === 0) {
            return;
        }

        const nowIso = new Date().toISOString();
        const normalizedActiveIngredientsToList = uncheckedActiveIngredients.map((ingredientTitle) => ({
            title: ingredientTitle,
            aisle: 'Recipe',
            price: '0.00',
            quantity: 1,
            tax: false,
            cart: true,
            select: true,
            lastPurchase: nowIso,
            days: 1,
            color: '#b8e522',
            display: true
        }));

        const existingTodos = (() => {
            try {
                const parsed = JSON.parse(localStorage.getItem('vueTodos') || '[]');
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                return [];
            }
        })();

        const existingTitles = new Set(existingTodos.map((todo) => String(todo?.title || '').trim().toLowerCase()));
        const newRecipeTodos = normalizedActiveIngredientsToList.filter((todo) => !existingTitles.has(todo.title.toLowerCase()));

        if (newRecipeTodos.length > 0) {
            const updatedTodos = [...existingTodos, ...newRecipeTodos];
            localStorage.setItem('vueTodos', JSON.stringify(updatedTodos));
            localStorage.setItem('vueTodosSaved', JSON.stringify(updatedTodos));
        }

        //setIngredients((previousIngredients) => mergeIngredients(previousIngredients, uncheckedActiveIngredients));

        // Avoid stale persisted status values auto-checking newly added ingredients.
        uncheckedActiveIngredients.forEach((ingredientName) => {
            toggleIngredientStatus(ingredientName, false);
        });

        setIngredientsCollapse(false);
    };

    const clearAllIngredientChecks = () => {
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return;
        }

        ingredients.forEach((ingredientName) => {
            toggleIngredientStatus(ingredientName, false);
        });
    };

    const deleteAllIngredients = () => {
        setIngredients([]);
        clearIngredientStatuses();
    };

    const uncheckedIngredientCount = (() => {
        const activeIngredients = getUniqueIngredientLabels(ingredients);
        if (activeIngredients.length === 0) {
            return 0;
        }

        const checkedIngredientKeys = getCheckedIngredientKeys();
        return activeIngredients.filter(
            (ingredientName) => !checkedIngredientKeys.has(normalizeIngredientKey(ingredientName))
        ).length;
    })();
    
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
        setTimeout(() => {
            setNewProjectDescription('');
        }, 1000);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(() => {
        if (newProjectDescription === undefined) return;

        const debounceTimer = setTimeout(() => {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('trackerSearch', searchTerm);
            if (recipes !== undefined) {
                const inRecipeTitle = (recipe) => recipe.dish.toLowerCase().includes(searchTerm);
                const inDescription = (recipe) => recipe.description.toLowerCase().includes(searchTerm);
                const inIngredients = (recipe) => {
                    if (recipe.ingredients && recipe.ingredients.length > 0) {
                        return recipe.ingredients.some((ingredient) => {
                            return ingredient[2] && ingredient[2].toLowerCase().includes(searchTerm);
                        });
                    }
                    return false;
                };
                const inInstructions = (recipe) => {
                    if (recipe.instructions && recipe.instructions.length > 0) {
                        return recipe.instructions.some((instruction) => {
                            if (instruction.step && instruction.step.toLowerCase().includes(searchTerm)) {
                                return true;
                            }
                            if (instruction.ingredients && instruction.ingredients.length > 0) {
                                return instruction.ingredients.some((ingredient) =>
                                    ingredient[2] && ingredient[2].toLowerCase().includes(searchTerm)
                                );
                            }
                            return false;
                        });
                    }
                    return false;
                };
                const category = localStorage.getItem('recipeCategory') || 'all';
                const filteredRecipes = [...recipes];
                filteredRecipes.forEach((recipeGroup) => {
                    recipeGroup.display = false;
                    if (recipeGroup.recipes && recipeGroup.recipes.length > 0) {
                        recipeGroup.recipes.forEach((recipe) => {
                            if ((inInstructions(recipe) || inIngredients(recipe) || inDescription(recipe) || inRecipeTitle(recipe) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) && (category === 'all' || recipeGroup.category === category)) {
                                recipe.display = true;
                                recipeGroup.display = true;
                            } else {
                                recipe.display = false;
                            }
                        });
                    }
                });
                setRecipes(filteredRecipes);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [newProjectDescription]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!migrationFeedback) return;
        const timer = setTimeout(() => setMigrationFeedback(''), 2200);
        return () => clearTimeout(timer);
    }, [migrationFeedback]);

    useEffect(() => {
        migrateExistingRecipeData(false);
    }, [recipes, setRecipes]);

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
            const hasVisibleRecipe = Array.isArray(recipeGroup.recipes)
                && recipeGroup.recipes.some((recipe) => recipe?.display === true || recipe?.display === 'true');
            const shouldDisplay = (category === 'all' || recipeGroup.category === category) && hasVisibleRecipe;
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
                                    <span className='pl-5 color-yellow size12'>{ingredients.length}</span>
                                </span>
                            </div>;
    return (
        <div>
            {
                migrationFeedback
                    ? <div className='containerDetail p-10 size12 color-neogreen m-5'>{migrationFeedback}</div>
                    : null
            }
            <div className='containerDetail p-20 size30 color-yellow m-5 bg-lite contentLeft'>
                👩🏼‍🍳 Recipes
            </div>
             <div className=''>
                <AddProjectInterface
                    newProjectDescription={newProjectDescription}
                    setNewProjectDescription={setNewProjectDescription}
                    addProject={addProject}
                    tracking={'recipes'}
                />
            </div>
            <div className='containerDetail p-10 size20 color-lite m-5 color-yellow bg-lite'>
                <CollapseToggleButton
                    title={ingredientHeader}
                    isCollapsed={ingredientsCollapse}
                    setCollapse={setIngredientsCollapse}
                    align='left'
                />
            </div>
            {
                (ingredientsCollapse)
                    ? null
                    : <div title='Add Ingredients to Grocery List' className='containerDetail p-20 bg-green size20 color-lite m-5 contentLeft button' onClick={addActiveIngredientsToList}>
                        <span className='size30 text-outline-lite mr-5'>➕</span>Add <span className='color-yellow'>{uncheckedIngredientCount}</span> Ingredients to Grocery List
                    </div>
            }
            {
                (ingredientsCollapse)
                    ? null
                    : <div className='containerDetail flexContainer bg-lite color-lite m-5'>
                        <div
                            className='containerDetail bg-lite flex2Column p-10 size20 color-lite m-5 button'
                            title='Uncheck all ingredient items'
                            onClick={clearAllIngredientChecks}
                        >
                            ✅ clear all
                        </div>
                        <div
                            className='containerDetail bg-lite flex2Column p-10 size20 color-lite m-5 button'
                            title='Remove all ingredient items'
                            onClick={deleteAllIngredients}
                        >
                            🗑️ delete all
                        </div>
                    </div>
            }
            {
                (ingredientsCollapse)
                    ? null
                    : (ingredients === null || ingredients.length === 0)
                        ? <div className='containerDetail p-10 size20 color-lite m-5'>No ingredients in list. Use Add Ingredients to Grocery List.</div>
                        : <div className='height-400'>
                            {
                                ingredients.map(ingredient => <div key={String(ingredient)}>
                                    <Ingredient
                                        ingredient={ingredient}
                                    />
                                </div>)}
                        </div>
            }
            <div className='containerDetail p-10 size20 color-lite m-5 bg-lite'>
                <CollapseToggleButton
                    title={collapseAll ? `Expand All` : `Collapse All`}
                    isCollapsed={collapseAll}
                    setCollapse={setCollapseAll}
                    align='left'
                />
            </div>
            <div className='ml-5 mt--5 pr-10'>
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
            <div
                className='containerDetail pt-10 pb-10 size15 color-yellow bg-green m-5 button contentLeft pl-30'
                title='Repair existing recipe ingredient rows in local storage'
                onClick={() => migrateExistingRecipeData(true)}
            >
                🛠️ Repair Existing Recipe Data
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