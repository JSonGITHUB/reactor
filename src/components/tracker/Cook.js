import React, { useState, useEffect, useRef } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackRecipe from './TrackRecipe';
import initProjects from './initProjects';
import mobileRecipeTracking from './data_mobile';
import initializeData from '../utils/InitializeData';
import IngredientParent from '../context/IngredientContext';
import KitchenInventoryProvider from '../context/KitchenInventoryContext';

const Cook = () => {
    const tracking='recipes';
    const [projects] = useState(initializeData('projects', initProjects));
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [recipes, setRecipes] = useState(initializeData('recipeTracking', mobileRecipeTracking));
    const targetElementRef = useRef(null);

    const scrollToBottom = () => {
        //alert(`scrollToBottom`);
        if (targetElementRef.current) {
            //targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };
    const refreshPage = () => {
        window.location.reload();
    };
    const getIngredients = () => {
        const newIngredients = [];
        recipes.forEach((recipeGroup) => {
            if (!recipeGroup.isCollapsed && recipeGroup.recipes && recipeGroup.recipes.length > 0) {
                recipeGroup.recipes.forEach((recipe) => {
                    if (!recipe.isCollapsed && recipe.ingredients && recipe.ingredients.length > 0) {
                        recipe.ingredients.forEach((ingredient) => {
                            newIngredients.push(ingredient);
                        });
                    }
                });
            }
        });
        const removeDuplicates = (array) => [...new Set(array)];
        //const getAllIngredients = () => initializeData('ingredients', [['salt', 'salt', 'salt']]);
        const removeables = [
            'peeled',
            'for',
            'halved',
            'garnish',
            'optional',
            'seeded',
            //' and ', 
            'sliced',
            'warm',
            'bruised',
            'chopped',
            'minced',
            'boiling',
            'thinly',
            'sliced',
            'head of',
            'of ',
            'or ',
            'into ',
            'chunks',
            'mashed',
            'crushed',
            'crumbled',
            'creamy',
            'cooked',
            'juiced',
            'ribs removed',
            'to your taste',
            'leaves',
            'stemmed',
            'to taste',
            'finely',
            'take',
            'whitesoft',
            'part',
            'squeezed its water',
            'rinsed',
            'pitted',
            'and diced',
            'diced',
            'freshly',
            'fresh',
            '(grated)',
            'grated',
            'shredded)',
            'shredded',
            'quartered',
            '(cut in half)',
            'divided',
            'adjust',
            'head',
            ':',
            'ground',
            '( )',
            ' ()',
            '()',
            ',',
            ' ,'
        ]
        const removeIt = (ingredient, extraWord) => {
            return String(ingredient).replace(extraWord, '');
        }
        const removeExtraStuff = (ingredient) => {
            const cleanIngredient = removeables.reduce((acc, word) => removeIt(acc, word), ingredient);
            return cleanIngredient;
        }
        const ingredientLabel = (ingredient, index) => (ingredient[index] && (ingredient[index] !== '') && (ingredient[index] !== undefined)) ? String(ingredient[index]).toLowerCase() : '';
        //const allIngredients = newIngredients.map(ingredient => (ingredientLabel(ingredient, 2) !== null) ? ingredientLabel(ingredient, 2) : (ingredientLabel(ingredient, 1) !== null) ? ingredientLabel(ingredient, 1) : (ingredientLabel(ingredient, 0) !== null) ? ingredientLabel(ingredient, 0) : 'salt');
        const allIngredients = newIngredients.map(ingredient => `${ingredientLabel(ingredient, 2)} ${ingredientLabel(ingredient, 0)} ${ingredientLabel(ingredient, 1)}`);
        const cleanedUpIngredients = allIngredients.map(ingredient => removeExtraStuff(ingredient));
        const whiteSpace = cleanedUpIngredients.map(ingredient => ingredient.trim());
        const sterilIngredients = removeDuplicates(whiteSpace);
        const removeAndItems = (arr) => {
            return arr.filter(item => !item.toLowerCase().startsWith('and'));
        };
        const removeParenthesisStart = (arr) => {
            return arr.filter(item => !item.toLowerCase().startsWith('('));
        };
        const remove1InBeginning = (arr) => {
            return arr.filter(item => !item.startsWith('1'));
        };
        const removeAInBeginning = (arr) => {
            return arr.filter(item => !item.startsWith('a '));
        };
        const removeEmpty = (arr) => {
            return arr.filter(item => item !== '');
        };
        const removeSingularIfPluralExists = (words) => {
            const wordSet = new Set(words);
            return words.filter(word => {
                const pluralForm = word.endsWith('s') ? word : word + 's';
                return !(wordSet.has(pluralForm) && !word.endsWith('s'));
            });
        };
        const pluralPriority = removeSingularIfPluralExists(sterilIngredients);
        const noAnd = removeAndItems(pluralPriority);
        const sortAlphabetically = (arr) => {
            return arr.sort((a, b) => a.localeCompare(b));
        };
        const parenthesisStart = removeParenthesisStart(noAnd);
        const empty = removeEmpty(parenthesisStart)
        const number1 = remove1InBeginning(empty)
        const aStart = removeAInBeginning(number1)
        const sorted = sortAlphabetically(aStart);
        return sorted;
    }

    useEffect(() => {
        if (recipes !== undefined) {
            localStorage.setItem('recipeTracking', JSON.stringify(recipes));
        }
    }, [recipes]);
    useEffect(() => {
        if (projects !== undefined) {
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }, [projects]);

    useEffect(() => {
        if (recipes === null) setRecipes(mobileRecipeTracking);
        if (tracking === 'recipes') {
            setTimeout(() => {
                setNewProjectDescription('');
            }, 1000);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {

        if (initialized) {
            let updatedTrackingData = [...projects];
            if (tracking === 'recipes') {
                updatedTrackingData = [...recipes];
            }
            updatedTrackingData.forEach((group) => {
                group.isCollapsed = isCollapsed;
            });
            if (tracking === 'recipes') {
                setRecipes(updatedTrackingData);
            }
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps


    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('trackerSearch', searchTerm);
            if (tracking === 'recipes' && recipes !== undefined) {
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
        }
    }, [newProjectDescription]); // eslint-disable-line react-hooks/exhaustive-deps

    const addProject = () => {
        if (!newProjectDescription || newProjectDescription.trim() === '') {
            alert('Please enter a category name');
            return;
        }
        
        const recipe = {
            category: newProjectDescription.trim(),
            recipes:[],
            display: true,
            collapsed:true,
            isCollapsed:true
        };
        const updatedRecipes = [...recipes, recipe];
        setRecipes(updatedRecipes);
        
        // Use setTimeout to ensure display updates after state is set
        setTimeout(() => {
            refreshPage();
        }, 100);
    };

    return <div className='mt--30'>
        <div className='containerDetail color-dark bg-yellow m-5 p-20 size30 contentLeft'>
            <span className='size40 m-5'>🧑‍🍳</span> Cooking
        </div>
        <div className=''>
            {
                (tracking !== '')
                ? <AddProjectInterface
                    newProjectDescription={newProjectDescription}
                    setNewProjectDescription={setNewProjectDescription}
                    addProject={addProject}
                    tracking={tracking}
                />
                : <React.Fragment></React.Fragment>
            }
        </div>
        <div className=''>
            {
                (tracking === 'recipes')
                    ? <KitchenInventoryProvider>
                        <IngredientParent targetElementRef={targetElementRef}>
                            <TrackRecipe
                                targetElementRef={targetElementRef}
                                scrollToBottom={scrollToBottom}
                                recipes={recipes}
                                setRecipes={setRecipes}
                                getIngredients={getIngredients}
                            />
                        </IngredientParent>
                    </KitchenInventoryProvider>
                    : <React.Fragment></React.Fragment>
            }
        </div>
    </div>
};

export default Cook