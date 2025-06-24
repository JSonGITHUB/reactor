import React, { useState, useEffect, useRef, useContext } from 'react';
import DropDown from '../forms/DropDown';
import AddProjectInterface from './AddProjectInterface';
//import TimerComponent from '../hooks/TimerComponent';
import TrackTasks from './TrackTasks';
import TrackEvents from './TrackEvents';
import TrackCharge from './TrackCharge';
import TrackWaves from './TrackWaves';
import TrackNote from './TrackNote';
import TrackJournal from './TrackJournal';
import TrackCircuit from './TrackCircuit';
import TrackRecipe from './TrackRecipe';
import LinkSaver from './LinkSaver';
import Sounds from '../sound/Sounds';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initSession from './initSession';
import initProjects from './initProjects';
import initWaves from './initWaves';
import initTasks from './initTasks';
import initCharges from './initCharges';
import initEvents from './initEvents';
import trackables from './trackables';
import initLinkTracking from './initLinkTracking';
import initNoteTracking from './initNoteTracking';
import initJournalTracking from './initJournalTracking';
import initCircuitTracking from './initCircuitTracking';
import initRecipeTracking from './initRecipeTracking';
import mobileRecipeTracking from './data_mobile';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getKey from '../utils/KeyGenerator';
import CircuitsParent from '../context/CircuitContext';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';
import IngredientParent from '../context/IngredientContext';
import validate from '../utils/validate';

const Tracker = () => {

    const [projects, setProjects] = useState(initializeData('projects', initProjects));
    const [events, setEvents] = useState(initializeData('eventTracking', initEvents));
    const [waves, setWaves] = useState(initializeData('waveTracking', initWaves));
    const [links, setLinks] = useState(initializeData('linkTracking', initLinkTracking));
    const [notes, setNotes] = useState(initializeData('noteTracking', initNoteTracking));
    const [journals, setJournals] = useState(initializeData('journalTracking', initJournalTracking));
    const [circuits, setCircuits] = useState();
    const [tasks, setTasks] = useState(initializeData('taskTracking', initTasks));
    const [charges, setCharges] = useState(initializeData('chargeTracking', initCharges));
    //const [scroll, setScroll] = useState();
    const [tracking, setTracking] = useState(initializeData('tracking', 'links'));
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [activated, setActivated] = useState(true);
    const [currentGoalsCollapse, setCurrentGoalsCollapse] = useState(true);
    const [futureGoalsCollapse, setFutureGoalsCollapse] = useState(true);
    const [completedGoalsCollapse, setCompletedGoalsCollapse] = useState(true);
    //const [recipes, setRecipes] = useState(initializeData('recipeTracking', initRecipeTracking));
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
        //console.log(`Tracker => ingredients sorted: ${JSON.stringify(sorted, null, 2)}`);
        //setIngredients(sorted);
        //localStorage.setItem('ingredients', JSON.stringify(ingredients));
        //setIngredients(ingredients);
        return sorted;
    }

    useEffect(() => {
        if (recipes !== undefined) {
            const ingredients = getIngredients();
            if (validate(ingredients) !== null && (ingredients === undefined)) {
                localStorage.setItem('ingredients', JSON.stringify(ingredients));
            }
        }
    }, [recipes]);

    useEffect(() => {
        const storedEvents = initializeData('eventTracking', initEvents)
        if (storedEvents) {
            setEvents(storedEvents);
        } else {
            setEvents([initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0)]);
        }
        //console.log(`local Projects: ${JSON.stringify(localProjects(), null, 2)}`)
        if (projects === null) setProjects(initProjects);
        if (tasks === null) setTasks(initTasks);
        if (waves === null) setWaves(initWaves);
        if (events === null) setEvents(initEvents);
        if (charges === null) setCharges(initCharges);
        if (links === null) setLinks(initLinkTracking);
        if (notes === null) setNotes(initNoteTracking);
        if (journals === null) setJournals(initJournalTracking);
        if (circuits === null) setCircuits(initCircuitTracking);
        //if (recipes === null) setRecipes(initRecipeTracking);
        if (recipes === null) setRecipes(mobileRecipeTracking);
        //console.log(`Tracker =>  notes: ${JSON.stringify(notes, null, 2)}`)
        //setTracking('recipes')
        // alert(`tracking: ${tracking}`)
        if (tracking === 'recipes') {
            const timer = setTimeout(() => {
                setNewProjectDescription('');
            }, 1000);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);

    useEffect(() => {

        if (initialized) {
            let updatedTrackingData = [...projects];
            if (tracking === 'recipes') {
                updatedTrackingData = [...recipes];
            } else if (tracking === 'links') {
                updatedTrackingData = [...links];
            } else if (tracking === 'notes') {
                updatedTrackingData = [...notes];
            } else if (tracking === 'journals') {
                updatedTrackingData = [...journals];
            } else if (tracking === 'circuits') {
                updatedTrackingData = [...circuits];
            } else if (tracking === 'events') {
                updatedTrackingData = [...events];
            } else if (tracking === 'waves') {
                updatedTrackingData = [...waves];
            } else if (tracking === 'tasks') {
                updatedTrackingData = [...tasks];
            } else if (tracking === 'charges') {
                updatedTrackingData = [...charges];
            }

            updatedTrackingData.map((group, groupIndex) => group.isCollapsed = isCollapsed);

            if (tracking === 'recipes') {
                setRecipes(updatedTrackingData);
            } else if (tracking === 'links') {
                setLinks(updatedTrackingData);
            } else if (tracking === 'notes') {
                setNotes(updatedTrackingData);
            } else if (tracking === 'journals') {
                setJournals(updatedTrackingData);
            } else if (tracking === 'circuits') {
                console.log(`updatedTrackingData: circuits => ${JSON.stringify(updatedTrackingData, null, 2)}`);
                setCircuits(updatedTrackingData);
            } else if (tracking === 'events') {
                setEvents(updatedTrackingData);
            } else if (tracking === 'waves') {
                setWaves(updatedTrackingData);
            } else if (tracking === 'tasks') {
                setTasks(updatedTrackingData);
            } else if (tracking === 'charges') {
                setCharges(updatedTrackingData);
            } else if (tracking === 'projects') {
                setProjects(updatedTrackingData);
            }
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]);

    useEffect(() => {
        localStorage.setItem('waveTracking', JSON.stringify(waves));
    }, [waves]);

    useEffect(() => {
        //console.log(`Tracker => links: ${JSON.stringify(links, null, 2)}`);
        localStorage.setItem('linkTracking', JSON.stringify(links));
    }, [links]);

    useEffect(() => {
        console.log(`Tracker => tasks: ${JSON.stringify(tasks, null, 2)}`);
        localStorage.setItem('taskTracking', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        console.log(`charges: ${JSON.stringify(charges, null, 2)}`);
        localStorage.setItem('chargeTracking', JSON.stringify(charges));
    }, [charges]);

    useEffect(() => {
        localStorage.setItem('eventTracking', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('noteTracking', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        localStorage.setItem('journalTracking', JSON.stringify(journals));
    }, [journals]);

    useEffect(() => {
        localStorage.setItem('tracking', tracking);
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
                console.log(`Tracker => searchTerm: '${searchTerm}'`);
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
            } else if (tracking === 'tasks' && tasks !== undefined) {
                const inTaskGoupDescription = (taskGroup) => {
                    const result = taskGroup.description.toLowerCase().includes(searchTerm);
                    console.log(`Tracker => inTaskGoupDescription => task.description: ${taskGroup.description} searchTerm: ${searchTerm} result: ${result}`);
                    return result;
                }
                const inTaskDescription = (task) => {
                    const result = task.description.toLowerCase().includes(searchTerm);
                    console.log(`Tracker => inTaskDescription => task.description: ${task.description} searchTerm: ${searchTerm} result: ${result}`);
                    return result;
                }
                const inTaskSessionDescription = (task) => {
                    if (task.sessions && task.sessions.length > 0) {
                        return task.sessions.some(
                            (session) =>
                                session.description &&
                                session.description.toLowerCase().includes(searchTerm)
                        );
                    }
                    return false;
                };
                const category = localStorage.getItem('tasksCategory') || 'all';
                const filteredTasks = [...tasks];
                
                filteredTasks.map((taskGroup) => {
                    taskGroup.display = inTaskGoupDescription(taskGroup);
                    taskGroup.tasks.map((task) => {
                        if ((inTaskGoupDescription(taskGroup) || inTaskDescription(task) || inTaskSessionDescription(task) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) && (category === 'all' || taskGroup.category === category)) {
                            task.display = true;
                            taskGroup.display = true;
                            console.log(`Tracker => category: ${category} searchTerm: '${searchTerm}' true`);
                            console.log(`Tracker taskGroup: ${JSON.stringify(taskGroup, null, 2)}`);
                        }
                    });
                });
                setTasks(filteredTasks);
            } else if (tracking === 'waves' && waves !== undefined) {
                const inWaveDescription = (wave) => wave.description.toLowerCase().includes(searchTerm);
                const filteredWaves = [...waves];
                filteredWaves.map((wave) => {
                    wave.display = false;
                    if (inWaveDescription(wave) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) {
                        wave.display = true;
                    }
                });
                setWaves(filteredWaves);
            } else if (tracking === 'charges' && charges !== undefined) {
                const inChargeGoupDescription = (chargeGroup) => String(chargeGroup.description).toLowerCase().includes(searchTerm);
                const inChargeDescription = (charge) => {
                    const result = charge.description.toLowerCase().includes(searchTerm);
                    console.log(`Tracker => inChargeDescription => charge.description: ${charge.description} searchTerm: ${searchTerm} result: ${result}`);
                    return result;
                }
                const filteredCharges = [...charges];
                filteredCharges.map((chargeGroup) => {
                    chargeGroup.display = false;
                    chargeGroup.tasks.map((task) => {
                        if ((inChargeGoupDescription(chargeGroup) || inChargeDescription(task) || searchTerm === '' || searchTerm === ' ' || searchTerm === null)) {
                            task.display = true;
                            chargeGroup.display = true;
                        }
                    });
                });
                setCharges(filteredCharges);
            } else if (tracking === 'links' && links !== undefined) {
                const inLinkGroupTitle = (linkGroup) => linkGroup.title.toLowerCase().includes(searchTerm);
                const inLinkDescription = (link) => {
                    const result = link.description.toLowerCase().includes(searchTerm);
                    console.log(`Tracker => inLinkDescription => link.description: ${link.description} searchTerm: ${searchTerm} result: ${result}`);
                    return result;
                }
                const filteredLinks = [...links];
                filteredLinks.map((linkGroup) => {
                    linkGroup.display = false;
                    if (linkGroup.links !== undefined) {
                        linkGroup.links.map((link) => {
                            if ((inLinkGroupTitle(linkGroup) || inLinkDescription(link) || searchTerm === '' || searchTerm === ' ' || searchTerm === null)) {
                                link.display = true;
                                linkGroup.display = true;
                            }
                        });
                    }
                });
                setLinks(filteredLinks);
            } else if (tracking === 'notes' && notes !== undefined) {
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
                const category = localStorage.getItem('notesCategory') || 'all';
                const filteredNotes = [...notes];
                filteredNotes.map((noteGroup) => {
                    noteGroup.display = false;
                    if ((inNoteGroupTitle(noteGroup) || inNotes(noteGroup) || searchTerm === '' || searchTerm === ' ' || searchTerm === null)) {
                        noteGroup.display = true;
                    }
                });
                setNotes(filteredNotes);
            } else if (tracking === 'journals' && journals !== undefined) {
                const inJournalGroupTitle = (journal) => journal.title.toLowerCase().includes(searchTerm);
                const inJournalDescription = (journal) => journal.description.toLowerCase().includes(searchTerm);
                const inJournal = (journal) => journal.journal.toLowerCase().includes(searchTerm);
                const inFeelings = (journal) => journal.feelings.toLowerCase().includes(searchTerm);
                const inTodaysGoals = (journal) => {
                    if (journal.todaysGoals && journal.todaysGoals.length > 0) {
                        return journal.todaysGoals.some((goal) => {
                            return goal[0].toLowerCase().includes(searchTerm);
                        });
                    }
                    return false;
                }
                const inFutureGoals = (journal) => {
                    if (journal.futureGoals && journal.futureGoals.length > 0) {
                        return journal.futureGoals.some((goal) => {
                            return goal[0].toLowerCase().includes(searchTerm);
                        });
                    }
                    return false;
                }
                const inGratefulFor = (journal) => journal.gratefulFor.toLowerCase().includes(searchTerm);
                const filteredJournals = [...journals];
                filteredJournals.map((journalGroup) => {
                    journalGroup.display = false;
                    journalGroup.journals.map((journal) => {
                        if (inJournalGroupTitle(journalGroup) || inJournalDescription(journal) || inJournal(journal) || inFeelings(journal) || inTodaysGoals(journal) || inFutureGoals(journal) || inGratefulFor(journal) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) {
                            journal.display = true;
                            journalGroup.display = true;
                        }
                    });
                });
                setJournals(filteredJournals);
            }
        }
    }, [newProjectDescription]);

    const toggleTimer = () => {
        Sounds.boop(0, 1);
        setActivated(!activated);
    }

    const toggleParentTimer = () => toggleTimer();

    const selectTracking = (event) => {
        setTracking(event.target.value);
    };
    const addProject = () => {
        const project = {
            description: newProjectDescription,
            createdDate: currentDate(),
            startTime: currentTime(),
            tasks: [],
            totalTime: 0,
            isCollapsed: false
        };
        const addLinkGroup = () => {
            const updatedLinks = [...links];
            const title = newProjectDescription;
            if (title) {
                const linkDescription = prompt('Link description:');
                const linkURL = prompt('Link url:');
                const firstLink = {
                    description: linkDescription || 'New Link',
                    link: linkURL || 'https://',
                    display: true
                }
                const linkGroup = {
                    title: title,
                    links: [firstLink],
                    isCollapsed: false
                };
                updatedLinks.push(linkGroup)
                setLinks(updatedLinks);
            }
        };
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
        const addRecipeGroup = () => {
            const updatedRecipes = [...recipes];
            const title = newProjectDescription;
            console.log(`addRecipeGroup => newProjectDescription: ${title}`);
            if (title) {
                const recipeGroup = {
                    category: title,
                    recipes: [],
                    isCollapsed: false,
                    display: true
                };
                updatedRecipes.push(recipeGroup)
                setRecipes(updatedRecipes);
            }
        };
        const addJournalGroup = () => {
            const updatedJournals = [...journals];
            const title = newProjectDescription;
            if (title) {
                const journalGroup = {
                    title: title,
                    journals: [],
                    isCollapsed: false
                };
                updatedJournals.push(journalGroup)
                setJournals(updatedJournals);
            }
        };
        const addCircuitGroup = () => {
            const updatedCircuits = [...circuits];
            const title = newProjectDescription;
            if (title) {
                const circuitGroup = {
                    title: title,
                    circuits: [],
                    isCollapsed: false
                };
                updatedCircuits.push(circuitGroup)
                setCircuits(updatedCircuits);
            }
        };
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

        /*
        if (tracking === 'project') 
            setProjects(prevProjects => [project, ...prevProjects]);
        if (tracking === 'events')
            setEvents(prevEvents => [project, ...prevEvents]);
        if (tracking === 'waves') 
            setProjects(prevProjects => [project, ...prevProjects]);
        */

        if ((tracking !== 'links' || tracking !== 'notes' || tracking !== 'journals' || tracking !== 'circuits' || tracking !== 'recipes') && trackingMap.hasOwnProperty(tracking)) {
            trackingMap[tracking][1](prev => [project, ...prev]);
        }
        if (tracking === 'links') {
            addLinkGroup();
        }
        if (tracking === 'notes') {
            addNoteGroup();
        }
        if (tracking === 'journals') {
            addJournalGroup();
        }
        if (tracking === 'circuits') {
            addCircuitGroup();
        }
        if (tracking === 'recipes') {
            addRecipeGroup();
        }
        if (tracking === 'charges') {
            addChargeGroup();
        }
        setNewProjectDescription('');
    };

    const deleteProject = (index) => {
        let updatedTrackingData = [...projects];
        if (trackingMap.hasOwnProperty(tracking)) {
            updatedTrackingData = [...trackingMap[tracking][0]];
            updatedTrackingData.splice(index, 1);
            trackingMap[tracking][1](updatedTrackingData);
        }
    };
    const deleteGroup = (index) => {
        let updatedTrackingData = [...projects];
        if (trackingMap.hasOwnProperty(tracking)) {
            updatedTrackingData = [...trackingMap[tracking][0]];
            updatedTrackingData.splice(index, 1);
            trackingMap[tracking][1](updatedTrackingData);
        }
    };
    const toggleCollapseSubmenu = (projectIndex) => {
        //setIsCollapsed(!isCollapsed);
        const updatedProjects = [...projects];
        const project = updatedProjects[projectIndex];
        project.isCollapsed = !project.isCollapsed;

        setProjects(updatedProjects);
        //return (!project.isCollapsed) ? setIsCollapsed(false) : null;
        if (!project.isCollapsed) {
            console.log(`toggleCollapseSubmenu => projectIndex(${projectIndex}): setIsCollapsed(false)`);
            setIsCollapsed(false);
        } else {
            console.log(`toggleCollapseSubmenu => projectIndex(${projectIndex}): setIsCollapsed(true)`);
            setIsCollapsed(true);
        }
    };

    const getProjectTime = (project) => {
        let projectTotal = 0;
        trackingMap[tracking][0].forEach((event) => {
            projectTotal += event.runningTime;
        });
        project.totalTime = projectTotal;
        return projectTotal;
    };

    const toggleCheckbox = (category, journalGroupIndex, journalIndex, currentGoalIndex) => {
        const newJournals = [...journals];
        const selectedGoal = newJournals[journalGroupIndex].journals[journalIndex][category][currentGoalIndex];
        const goalComplete = (selectedGoal[1]) ? false : true;
        selectedGoal[1] = goalComplete;
        setJournals(newJournals);
    }
    const deleteLocalData = (tracking) => {
        if (tracking === 'recipes') {
            localStorage.removeItem('recipeTracking');
        } else if (tracking === 'links') {
            localStorage.removeItem('linkTracking');
        } else if (tracking === 'notes') {
            localStorage.removeItem('noteTracking');
        } else if (tracking === 'journals') {
            localStorage.removeItem('journalTracking');
        } else if (tracking === 'circuits') {
            localStorage.removeItem('circuitTracking');
        } else if (tracking === 'events') {
            localStorage.removeItem('eventTracking');
        } else if (tracking === 'waves') {
            localStorage.removeItem('waveTracking');
        } else if (tracking === 'tasks') {
            localStorage.removeItem('taskTracking');
        } else if (tracking === 'charges') {
            localStorage.removeItem('chargeTracking')
        }
        window.location.reload();
    }

    return <div className='mt--30 containerDetail bg-lite'>
        <div className='pt-5'>
            <div className='flexContainer containerBox'>
                <div className='flex2Column containerBox p-15 columnRightAlign width-50-percent size25 r-5 bold color-soft'>
                    Tracking:
                </div>
                <div className='flex2Column columnLeftAlign width-50-percent'>
                    <DropDown
                        value={tracking}
                        options={trackables}
                        onChange={selectTracking}
                        classes='containerBox width-100-percent'
                    />
                </div>
                {
                    /*
                    <div
                        className='containerBox flex1Auto button bg-lite centeredContent'
                        onClick={() => deleteLocalData(tracking)}
                    >
                        {icons.delete}
                    </div>
                    */
                }
            </div>
            {//(tracking === 'tasks' || tracking === 'events')
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
        <div className='containerBox'>
            {
                (tracking === 'journals')
                ? <div>
                    <div className='containerBox color-yellow'>
                        <CollapseToggleButton
                            title={`Current Goals`}
                            isCollapsed={currentGoalsCollapse}
                            setCollapse={setCurrentGoalsCollapse}
                            align='left'
                        />
                    </div>
                    {
                        (!currentGoalsCollapse)
                        ? <div className='containerBox'>
                            {
                                journals.map((journalGroup, journalGroupIndex) => (
                                    journalGroup.journals.map((journal, journalIndex) => (
                                        journal.todaysGoals.map((currentGoal, currentGoalIndex) => (
                                            (!currentGoal[1])
                                                ? <div className='containerBox flexContainer centerVertical' key={getKey(`currentGoal${currentGoal}`)}>
                                                    <div className='flex2Column contentLeft'>
                                                        {currentGoal[0]}
                                                    </div>
                                                    <div className='flexColumn contentRight'>
                                                        <div
                                                            title='toggle checkbox'
                                                            className='containerBox bg-lite p-20 button'
                                                            onClick={() => toggleCheckbox('todaysGoals', journalGroupIndex, journalIndex, currentGoalIndex)}
                                                        >
                                                            <input
                                                                id='completed'
                                                                name='completed'
                                                                className='regular-checkbox'
                                                                checked={currentGoal[1]}
                                                                type='checkbox'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                : null
                                        ))
                                    ))
                                ))
                            }
                        </div>
                        : null
                    }
                    <div className='containerBox color-yellow'>
                        <CollapseToggleButton
                            title={'Future Goals'}
                            isCollapsed={futureGoalsCollapse}
                            setCollapse={setFutureGoalsCollapse}
                            align='left'
                        />
                    </div>
                    {
                        (!futureGoalsCollapse)
                        ? <div className='containerBox'>
                            {
                                journals.map((journalGroup, journalGroupIndex) => (
                                    journalGroup.journals.map((journal, journalIndex) => (
                                        journal.futureGoals.map((futureGoal, futureGoalIndex) => (
                                            (!futureGoal[1])
                                            ? <div className='containerBox flexContainer centerVertical' key={getKey(`futureGoal${futureGoal}`)}>
                                                <div className='flex2Column contentLeft'>
                                                    {futureGoal[0]}
                                                </div>
                                                <div
                                                    title='toggle checkbox'
                                                    className='containerBox bg-lite p-20 button'
                                                    onClick={() => toggleCheckbox('futureGoals', journalGroupIndex, journalIndex, futureGoalIndex)}
                                                >
                                                    <input
                                                        id='completed'
                                                        name='completed'
                                                        className='regular-checkbox button'
                                                        checked={futureGoal[1]}
                                                        type='checkbox'
                                                    />
                                                </div>
                                            </div>
                                            : null
                                        ))
                                    ))
                                ))
                            }
                        </div>
                        : null
                    }
                    <div className='containerBox color-yellow'>
                        <CollapseToggleButton
                            title={'Completed Goals'}
                            isCollapsed={completedGoalsCollapse}
                            setCollapse={setCompletedGoalsCollapse}
                            align='left'
                        />
                    </div>
                    {
                        (!completedGoalsCollapse)
                        ? <div className='containerBox'>
                            {
                                journals.map((journalGroup, journalGroupIndex) => (
                                    journalGroup.journals.map((journal, journalIndex) => (
                                        journal.todaysGoals.map((todaysGoal, todaysGoalIndex) => (
                                            (todaysGoal[1])
                                            ? <div className='containerBox flexContainer centerVertical' key={getKey(`todaysGoal${todaysGoal}`)}>
                                                <div className='flex2Column contentLeft'>
                                                    {todaysGoal[0]}
                                                </div>
                                                <div
                                                    title='toggle checkbox'
                                                    className='containerBox bg-lite p-20 button'
                                                    onClick={() => toggleCheckbox('todaysGoals', journalGroupIndex, journalIndex, todaysGoalIndex)}
                                                >
                                                    <input
                                                        id='completed'
                                                        name='completed'
                                                        className='regular-checkbox button'
                                                        checked={todaysGoal[1]}
                                                        type='checkbox'
                                                    />
                                                </div>
                                            </div>
                                            : null
                                        ))
                                    ))
                                ))
                            }
                            {
                                journals.map((journalGroup, journalGroupIndex) => {
                                    if (journalGroup.journals && journalGroup.journals.length > 0) {
                                        return journalGroup.journals.map((journal, journalIndex) => (
                                            journal.futureGoals.map((futureGoal, futureGoalIndex) => (
                                                (futureGoal[1])
                                                ? <div className='containerBox flexContainer centerVertical' key={getKey(`futureGoal${futureGoal}`)}>
                                                    <div className='flex2Column contentLeft'>
                                                        {futureGoal[0]}
                                                    </div>
                                                    <div
                                                        title='toggle checkbox'
                                                        className='containerBox bg-lite p-20 button'
                                                        onClick={() => toggleCheckbox('futureGoals', journalGroupIndex, journalIndex, futureGoalIndex)}
                                                    >
                                                        <input
                                                            id='completed'
                                                            name='completed'
                                                            className='regular-checkbox button'
                                                            checked={futureGoal[1]}
                                                            type='checkbox'
                                                        />
                                                    </div>
                                                </div>
                                                : null
                                            ))
                                        ))
                                    }
                                })
                            }
                        </div>
                        : null
                    }
                </div>
                : null
            }
            {
                (tracking === 'circuits')
                ? null
                : <div className='containerBox'>
                    <CollapseToggleButton
                        title={isCollapsed ? `Expand All` : `Collapse All`}
                        isCollapsed={isCollapsed}
                        setCollapse={setIsCollapsed}
                        align='left'
                    />
                </div>
            }
            {
                (tracking === 'tasks')
                ? <TrackTasks
                    tracking={tracking}
                    tasks={tasks}
                    setTasks={setTasks}
                    deleteProject={deleteProject}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'projects')
                ? <TrackTasks
                    tracking={tracking}
                    tasks={projects}
                    setTasks={setProjects}
                    deleteProject={deleteProject}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'events')
                ? <TrackEvents
                    events={events}
                    setEvents={setEvents}
                    getProjectTime={getProjectTime}
                    deleteProject={deleteProject}
                    toggleCollapseSubmenu={toggleCollapseSubmenu}
                    toggleParentTimer={toggleParentTimer}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'charges')
                ? <TrackCharge
                    charges={charges}
                    setCharges={setCharges}
                    newProjectDescription={newProjectDescription}
                    getProjectTime={getProjectTime}
                    searchTerm={newProjectDescription}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'waves')
                ? <TrackWaves
                    waves={waves}
                    setWaves={setWaves}
                    getProjectTime={getProjectTime}
                    deleteProject={deleteProject}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'links')
                ? <LinkSaver
                    links={links}
                    setLinks={setLinks}
                    deleteGroup={deleteGroup}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'notes')
                ? <TrackNote
                    notes={notes}
                    setNotes={setNotes}
                    targetElementRef={targetElementRef}
                    scrollToBottom={scrollToBottom}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'journals')
                ? <TrackJournal
                    journals={journals}
                    setJournals={setJournals}
                    targetElementRef={targetElementRef}
                    scrollToBottom={scrollToBottom}
                />
                : <React.Fragment></React.Fragment>
            }
            {
                (tracking === 'circuits')
                ? <CircuitsParent targetElementRef={targetElementRef} scrollToBottom={scrollToBottom}>
                    <TrackCircuit
                    //circuits={circuits}
                    //setCircuits={setCircuits}
                    //targetElementRef={targetElementRef}
                    //scrollToBottom={scrollToBottom}
                    //isCollapsed={isCollapsed}
                    />
                </CircuitsParent>
                : <React.Fragment></React.Fragment>
            }
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

export default Tracker
