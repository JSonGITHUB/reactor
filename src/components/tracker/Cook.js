import React, { useState, useEffect, useRef, useContext } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackRecipe from './TrackRecipe';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initProjects from './initProjects';
import initWaves from './initWaves';
import initTasks from './initTasks';
import initCharges from './initCharges';
import initEvents from './initEvents';
import initLinkTracking from './initLinkTracking';
import initNoteTracking from './initNoteTracking';
import initJournalTracking from './initJournalTracking';
import mobileRecipeTracking from './data_mobile';
import initializeData from '../utils/InitializeData';
import IngredientParent from '../context/IngredientContext';
import validate from '../utils/validate';

const Cook = () => {

    const [projects, setProjects] = useState(initializeData('projects', initProjects));
    const [events, setEvents] = useState(initializeData('eventTracking', initEvents));
    const [waves, setWaves] = useState(initializeData('waveTracking', initWaves));
    const [links, setLinks] = useState(initializeData('linkTracking', initLinkTracking));
    const [notes, setNotes] = useState(initializeData('noteTracking', initNoteTracking));
    const [journals, setJournals] = useState(initializeData('journalTracking', initJournalTracking));
    const [circuits, setCircuits] = useState();
    const [tasks, setTasks] = useState(initializeData('taskTracking', initTasks));
    const [charges, setCharges] = useState(initializeData('chargeTracking', initCharges));
    const [tracking, setTracking] = useState('recipes');
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [recipes, setRecipes] = useState(initializeData('recipeTracking', mobileRecipeTracking));
    const targetElementRef = useRef(null);

    const scrollToBottom = () => {
        //alert(`scrollToBottom`);
        if (targetElementRef.current) {
            //targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    const trackingMap = {
        'projects': [projects, setProjects],
        'tasks': [tasks, setTasks],
        'waves': [waves, setWaves],
        'events': [events, setEvents],
        'charges': [charges, setCharges],
        'links': [links, setLinks],
        'notes': [notes, setNotes],
        'journals': [journals, setJournals],
        'circuits': [circuits, setCircuits],
        'recipes': [recipes, setRecipes],
    };
    const getIngredients = () => {
        const newIngredients = [];
        recipes.forEach((recipeGroup) => {
            if (!recipeGroup.isCollapsed) {
                recipeGroup.recipes.forEach((recipe) => {
                    if (!recipe.isCollapsed && recipe.ingredients && recipe.ingredients.length > 0) {
                        //console.log(`getIngredient => recipe: ${JSON.stringify(recipe, null, 2)}`);
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
            //console.log(`TrackRecipe => removeExtraStuff => cleanIngredient: ${cleanIngredient}`);
            return cleanIngredient;
        }
        //console.log(`ingredients: ${JSON.stringify(getAllIngredients(), null, 2)}`);
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
        const removeAnds = (arr) => {
            return arr.filter(item => item !== 'and');
        };
        const removeSingularIfPluralExists = (words) => {
            const wordSet = new Set(words);
            return words.filter(word => {
                const pluralForm = word.endsWith('s') ? word : word + 's';
                return !(wordSet.has(pluralForm) && !word.endsWith('s'));
            });
        };
        //console.log(`sterilIngredients: ${JSON.stringify(sterilIngredients, null, 2)}`);
        const pluralPriority = removeSingularIfPluralExists(sterilIngredients);
        const noAnd = removeAndItems(pluralPriority);
        const sortAlphabetically = (arr) => {
            return arr.sort((a, b) => a.localeCompare(b));
        };
        const parenthesisStart = removeParenthesisStart(noAnd);
        const andsRemoved = removeAnds(pluralPriority);
        const empty = removeEmpty(parenthesisStart)
        const number1 = remove1InBeginning(empty)
        const aStart = removeAInBeginning(number1)
        const sorted = sortAlphabetically(aStart);
        return sorted;
    }

    useEffect(() => {
        if (recipes !== undefined) {
            const ingredients = getIngredients();
            if ((validate(ingredients) !== null) && (ingredients !== undefined)) {
                localStorage.setItem('ingredients', JSON.stringify(ingredients));
            }
            localStorage.setItem('recipeTracking', JSON.stringify(recipes));
        }
    }, [recipes]);

    useEffect(() => {
        if (recipes === null) setRecipes(mobileRecipeTracking);
        if (tracking === 'recipes') {
            const timer = setTimeout(() => {
                setNewProjectDescription('');
            }, 1000);
        }
    }, []);

    useEffect(() => {

        if (initialized) {
            let updatedTrackingData = [...projects];
            if (tracking === 'recipes') {
                updatedTrackingData = [...recipes];
            }
            updatedTrackingData.map((group, groupIndex) => group.isCollapsed = isCollapsed);
            if (tracking === 'recipes') {
                setRecipes(updatedTrackingData);
            }
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]);


    useEffect(() => {
        if (tracking !== undefined || tracking !== '') {
            localStorage.setItem('tracking', tracking);
        }
    }, [tracking]);

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
                console.log(`Cook => searchTerm: '${searchTerm}'`);
                filteredRecipes.map((recipeGroup) => {
                    recipeGroup.display = false;
                    recipeGroup.recipes.map((recipe) => {
                        if ((inInstructions(recipe) || inIngredients(recipe) || inDescription(recipe) || inRecipeTitle(recipe) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) && (category === 'all' || recipeGroup.category === category)) {
                            recipe.display = true;
                            recipeGroup.display = true;
                        } else {
                            recipe.display = false;
                        }
                    });
                });
                setRecipes(filteredRecipes);
            } 
        }
    }, [newProjectDescription]);

    const addProject = () => {
        const project = {
            description: newProjectDescription,
            createdDate: currentDate(),
            startTime: currentTime(),
            tasks: [],
            journals: [],
            totalTime: 0,
            isCollapsed: false
        };

        if ((tracking !== 'links' || tracking !== 'notes' || tracking !== 'journals' || tracking !== 'circuits' || tracking !== 'recipes') && trackingMap.hasOwnProperty(tracking)) {
            trackingMap[tracking][1](prev => [project, ...prev]);
        }
        setNewProjectDescription('');
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
                    ? <IngredientParent targetElementRef={targetElementRef}>
                        <TrackRecipe
                            targetElementRef={targetElementRef}
                            scrollToBottom={scrollToBottom}
                            recipes={recipes}
                            setRecipes={setRecipes}
                            getIngredients={getIngredients}
                        />
                    </IngredientParent>
                    : <React.Fragment></React.Fragment>
            }
        </div>
    </div>
};

export default Cook