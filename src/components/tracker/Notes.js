import { useState, useEffect, useRef } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackNote from './TrackNote';
import initNoteTracking from './initNoteTracking';
import mobileRecipeTracking from './data_mobile';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';

const Notes = () => {

    const [notes, setNotes] = useState(initializeData('noteTracking', initNoteTracking));
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [recipes] = useState(initializeData('recipeTracking', mobileRecipeTracking));

    const targetElementRef = useRef(null);

    const scrollToBottom = () => {
        //alert(`scrollToBottom`);
        if (targetElementRef.current) {
            //targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };
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
        setNotes(initNoteTracking);
    }, []);

    useEffect(() => {
        if (initialized) {
            const updatedTrackingData = Array.isArray(notes)
                ? notes.map((group) => ({
                    ...group,
                    isCollapsed: isCollapsed
                }))
                : notes;
            setNotes(updatedTrackingData);
        } else {
            setInitialized(true);
        }
    }, [isCollapsed, initialized]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (notes !== undefined || notes !== '') {
            localStorage.setItem('noteTracking', JSON.stringify(notes));
        }
    }, [notes]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('WorkOutSearch', searchTerm);
            if (notes && notes !== undefined) {
                const inNoteGroupTitle = (noteGroup) => noteGroup.title.toLowerCase().includes(searchTerm);
                const inNotes = (noteGroup) => {
                    if (noteGroup.notes && noteGroup.notes.length > 0) {
                        return noteGroup.notes.some((note) => {
                            return (
                                (note.description && note.description.toLowerCase().includes(searchTerm)) ||
                                (note.note && note.note.toLowerCase().includes(searchTerm))
                            );
                        });
                    }
                    return false;
                };
                const filteredNotes = [...notes];
                filteredNotes.forEach((noteGroup) => {
                    noteGroup.display = false;
                    if ((inNoteGroupTitle(noteGroup) || inNotes(noteGroup) || searchTerm === '' || searchTerm === ' ' || searchTerm === null)) {
                        noteGroup.display = true;
                    }
                });
                setNotes(filteredNotes);
            }
        }
    }, [newProjectDescription]); // eslint-disable-line react-hooks/exhaustive-deps

    const addProject = () => {
        const addNoteGroup = () => {
            const updatedNotes = [...notes];
            const title = newProjectDescription;
            if (title) {
                const noteGroup = {
                    title: title,
                    notes: [],
                    isCollapsed: false
                };
                updatedNotes.push(noteGroup)
                setNotes(updatedNotes);
            }
        };
        addNoteGroup();
        setNewProjectDescription('');
    };

    return <div className='mt--30'>
        <div className='containerDetail color-lite bg-lite m-5 p-22 size30 contentLeft'>
            <span className='size40 m-5'>{icons.notes}</span> Notes
        </div>
        <div className='pt-5'>
            <AddProjectInterface
                newProjectDescription={newProjectDescription}
                setNewProjectDescription={setNewProjectDescription}
                addProject={addProject}
                tracking={'notes'}
            />
        </div>
        <div className=''>
            <div className='containerDetail mb-5 size20 color-yellow p-10 bg-lite m-5'>
                <CollapseToggleButton
                    title={isCollapsed ? `Expand All` : `Collapse All`}
                    isCollapsed={isCollapsed}
                    setCollapse={setIsCollapsed}
                    align='left'
                />
            </div>
            <TrackNote
                notes={notes}
                setNotes={setNotes}
                targetElementRef={targetElementRef}
                scrollToBottom={scrollToBottom}
            />
        </div>
    </div>
};

export default Notes