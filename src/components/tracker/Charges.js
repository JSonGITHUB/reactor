import React, { useState, useEffect } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackCharge from './TrackCharge';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initCharges from './initCharges';
import mobileRecipeTracking from './data_mobile';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';

const Charges = () => {

    const [charges, setCharges] = useState(initializeData('chargeTracking', initCharges));
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [recipes] = useState(initializeData('recipeTracking', mobileRecipeTracking));
    const getIngredients = () => {
        const newIngredients = [];
        recipes.forEach((recipeGroup) => {
            if (!recipeGroup.isCollapsed) {
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
        //setIngredients(sorted);
        //localStorage.setItem('ingredients', JSON.stringify(ingredients));
        //setIngredients(ingredients);
        return sorted;
    }

    useEffect(() => {
        if (recipes !== undefined) {
            const ingredients = getIngredients();
            if ((validate(ingredients) !== null) && (ingredients !== undefined)) {
                localStorage.setItem('ingredients', JSON.stringify(ingredients));
            }
        }
    }, [recipes]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (charges === null) setCharges(initCharges);
    }, [charges]);

    useEffect(() => {

        if (initialized) {
            let updatedTrackingData = [...charges];
            updatedTrackingData.forEach((group) => {
                group.isCollapsed = isCollapsed;
            });
            setCharges(updatedTrackingData);
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (charges !== undefined || charges !== '') {
            localStorage.setItem('chargeTracking', JSON.stringify(charges));
        }
    }, [charges]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('WorkOutSearch', searchTerm);
            if (charges !== undefined) {
                const inChargeGoupDescription = (chargeGroup) => String(chargeGroup.description).toLowerCase().includes(searchTerm);
                const inChargeDescription = (charge) => {
                    const result = charge.description.toLowerCase().includes(searchTerm);
                    return result;
                }
                const filteredCharges = [...charges];
                filteredCharges.forEach((chargeGroup) => {
                    chargeGroup.display = false;
                    chargeGroup.tasks.forEach((task) => {
                        if ((inChargeGoupDescription(chargeGroup) || inChargeDescription(task) || searchTerm === '' || searchTerm === ' ' || searchTerm === null)) {
                            task.display = true;
                            chargeGroup.display = true;
                        }
                    });
                });
                setCharges(filteredCharges);
            }
        }
    }, [newProjectDescription]); // eslint-disable-line react-hooks/exhaustive-deps

    const addProject = () => {
        const addChargeGroup = () => {
            const updatedCharges = [...charges];
            const title = newProjectDescription;
            if (title) {
                const chargeGroup = {
                    description: title,
                    createdDate: currentDate(),
                    startTime: currentTime(),
                    display: true,
                    tasks: [],
                    isCollapsed: false
                };
                updatedCharges.push(chargeGroup)
                setCharges(updatedCharges);
            }
        };
        addChargeGroup();
        setNewProjectDescription('');
    };

    const getProjectTime = (project) => {
        let projectTotal = 0;
        charges.forEach((event) => {
            projectTotal += event.runningTime;
        });
        project.totalTime = projectTotal;
        return projectTotal;
    };

    return <div className='mt--30'>
        <div className='containerDetail color-lite bg-lite m-5 p-22 size30 contentLeft'>
            <span className='m-5'>{icons.charges}</span> Charges
        </div>
        <div className=''>
                <AddProjectInterface
                    newProjectDescription={newProjectDescription}
                    setNewProjectDescription={setNewProjectDescription}
                    addProject={addProject}
                    tracking={'charges'}
                />
        </div>
        <div className=''>
            <TrackCharge
                charges={charges}
                setCharges={setCharges}
                newProjectDescription={newProjectDescription}
                getProjectTime={getProjectTime}
                searchTerm={newProjectDescription}
            />
        </div>
    </div>
};

export default Charges