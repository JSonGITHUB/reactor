import React, { useState, useEffect, useRef } from 'react';
import DropDown from '../forms/DropDown';
import AddProjectInterface from './AddProjectInterface';
import TrackJournal from './TrackJournal';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initProjects from './initProjects';
import trackables from './trackables';
import initJournalTracking from './initJournalTracking';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getKey from '../utils/KeyGenerator';
import initializeData from '../utils/InitializeData';
import icons from '../site/icons';

const Journals = () => {
    const [projects, setProjects] = useState(() => initializeData('projects', initProjects));
    const [journals, setJournals] = useState(() => initializeData('journalTracking', initJournalTracking));
    const [filteredJournals, setFilteredJournals] = useState(() => initializeData('journalTracking', initJournalTracking));
    const [tracking, setTracking] = useState('journals');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [currentGoalsCollapse, setCurrentGoalsCollapse] = useState(true);
    const [futureGoalsCollapse, setFutureGoalsCollapse] = useState(true);
    const [completedGoalsCollapse, setCompletedGoalsCollapse] = useState(true);
    const [collapseGoals, setCollapseGoals] = useState(true);

    const targetElementRef = useRef(null);

    // Persist projects and journals
    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);
    useEffect(() => {
        
        if (journals[0] !== undefined) {
            console.log(`Journals => useEffect => journals: ${journals[0]}`);
            localStorage.setItem('journalTracking', JSON.stringify(journals));
        }
        
    }, [journals]);
    useEffect(() => {
        localStorage.setItem('tracking', tracking);
    }, [tracking]);

    // Search/filter journals by project description or goal text
    useEffect(() => {
        if (!newProjectDescription) return;
        const searchTerm = newProjectDescription.toLowerCase();
        const newFilteredJournals = journals.map(journalGroup => {
            if (journalGroup) {
                let groupMatch = (journalGroup?.title) ? journalGroup?.title.toLowerCase().includes(searchTerm) : journalGroup?.description.toLowerCase().includes(searchTerm);
                let journalsMatch = false;
                if (journalGroup?.journals) {
                    journalsMatch = journalGroup.journals.some(journal => {
                        // Defensive checks for each property to avoid errors if undefined/null
                        return (
                            (journal?.title && journal.title.toLowerCase().includes(searchTerm)) ||
                            (journal?.description && journal.description.toLowerCase().includes(searchTerm)) ||
                            (journal?.journal && journal.journal.toLowerCase().includes(searchTerm)) ||
                            (journal?.feelings && journal.feelings.toLowerCase().includes(searchTerm)) ||
                            (journal?.todaysGoals && journal.todaysGoals.some(goal => goal[0] && goal[0].toLowerCase().includes(searchTerm))) ||
                            (journal?.futureGoals && journal.futureGoals.some(goal => goal[0] && goal[0].toLowerCase().includes(searchTerm))) ||
                            (journal?.gratefulFor && journal.gratefulFor.toLowerCase().includes(searchTerm))
                        );
                    });
                    // Remove or minimize logging for production
                    // console.log(`journalsMatch: ${journalsMatch} searchTerm: ${searchTerm} - journalGroup.journals: ${JSON.stringify(journalGroup.journals, null, 2)}`);
                }
                console.log(`journalsMatch: ${journalsMatch} searchTerm: ${searchTerm} - journalGroup: ${JSON.stringify(journalGroup, null, 2)}`);
                if (journalsMatch || journalGroup?.title.toLowerCase().includes(searchTerm)) {
                    return {
                        ...journalGroup,
                        display: groupMatch || journalsMatch || !searchTerm,
                        journals: journalGroup.journals
                            ? journalGroup.journals.map(journal => ({
                                ...journal,
                                display: groupMatch || journalsMatch || !searchTerm
                            }))
                            : []
                    };
                }
                return
            }
        });
        //console.log(`Journals => useEffect => filteredJournals: ${JSON.stringify(filteredJournals[0], null, 2)}`);
        if (newFilteredJournals[0] !== undefined) {
            setFilteredJournals(newFilteredJournals);
        } else {
            setFilteredJournals([]);
        }
    }, [newProjectDescription]);

    // Add a new journal group/project
    const addProject = () => {
        if (!newProjectDescription.trim()) return;
        const newJournalGroup = {
            title: newProjectDescription,
            createdDate: currentDate(),
            startTime: currentTime(),
            tasks: [],
            journal: [],
            journals: [],
            totalTime: 0,
            isCollapsed: false
        };
        setJournals(prev => [...prev, newJournalGroup]);
        setNewProjectDescription('');
    };

    // Toggle goal completion
    const toggleCheckbox = (category, journalGroupIndex, journalIndex, goalIndex) => {
        //console.log(`Journals => toggleCheckbox => journals[${journalGroupIndex}]: ${JSON.stringify(journals[journalGroupIndex], null, 2)}`);
        const newJournals = [...journals];
        const goal = newJournals[journalGroupIndex].journal[journalIndex][category][goalIndex];
        goal.completed = !goal.completed;
        console.log(`Journals => toggleCheckbox =>  goalIndex(${goalIndex})) newJournals[${journalGroupIndex}].journal[${journalIndex}][${category}]: ${JSON.stringify(newJournals[journalGroupIndex].journal[journalIndex][category], null, 2)}`);
        setJournals(newJournals);
    };

    // Render goal lists
        // ...existing code...
    const renderGoals = (type, collapseState, setCollapseState, filterFn) => {
        // Map goal type to journal property
        const typeKey = (() => {
            if (type.toLowerCase().includes('current')) return 'todaysGoals';
            if (type.toLowerCase().includes('future')) return 'futureGoals';
            if (type.toLowerCase().includes('completed')) return ['todaysGoals', 'futureGoals'];
            return type.toLowerCase().replace(' ', '');
        })();
    
        // Gather all matching goals
        let goalsList = [];
        journals.forEach((journalGroup, groupIdx) => {
            // Defensive: check for journal array
            const journalArr = journalGroup.journal || journalGroup.journals || [];
            journalArr.forEach((journal, journalIdx) => {
                if (Array.isArray(typeKey)) {
                    // For completed goals, check both arrays
                    typeKey.forEach(key => {
                        if (Array.isArray(journal[key])) {
                            journal[key].forEach((goal, goalIdx) => {
                                if (filterFn(goal) && !goal.completed) {
                                    goalsList.push({
                                        goal,
                                        groupIdx,
                                        journalIdx,
                                        goalIdx,
                                        category: key,
                                        completed: goal.completed || false
                                    });
                                }
                            });
                        }
                    });
                } else {
                    if (Array.isArray(journal[typeKey])) {
                        journal[typeKey].forEach((goal, goalIdx) => {
                            if (filterFn(goal)) {
                                goalsList.push({
                                    goal,
                                    groupIdx,
                                    journalIdx,
                                    goalIdx,
                                    category: typeKey,
                                    completed: goal.completed || false
                                });
                            }
                        });
                    }
                }
            });
        });
    
        return (
            <div className='containerDetail bg-lite m-5'>
                <div className='containerBox color-yellow'>
                    <CollapseToggleButton
                        title={type}
                        isCollapsed={collapseState}
                        setCollapse={setCollapseState}
                        align='left'
                    />
                </div>
                {!collapseState &&
                    <div className='containerDetail m-5 p-10'>
                        {goalsList.length > 0 ? goalsList.map(({ goal, groupIdx, journalIdx, goalIdx, category }, idx) => (
                            <div className='containerBox flexContainer centerVertical' key={getKey(`${type}${goal[0]}${idx}`)}>
                                <div className='flex2Column contentLeft pl-10'>{goal.goal}</div>
                                <div
                                    title='toggle checkbox'
                                    className='containerBox bg-lite p-20 button'
                                    onClick={() => toggleCheckbox(category, groupIdx, journalIdx, goalIdx)}
                                >
                                    <input
                                        id='completed'
                                        name='completed'
                                        className='regular-checkbox'
                                        checked={goal.completed || false}
                                        type='checkbox'
                                        readOnly
                                    />
                                </div>
                            </div>
                        )) : <div className='color-soft p-10'>No goals found.</div>}
                    </div>
                }
            </div>
        );
    };
    // ...existing code...
    
    return (
        <div className='mt--30'>
            <div className='containerDetail color-yellow p-20 m-5 size20 bg-lite contentLeft'>
                {icons.journals} Journals
            </div>
            <div className='containerDetail m-5 bg-lite'>
                <AddProjectInterface
                    newProjectDescription={newProjectDescription}
                    setNewProjectDescription={setNewProjectDescription}
                    addProject={addProject}
                    tracking={tracking}
                />
            </div>
            <div>
                {tracking === 'journals' &&
                    <div className='containerDetail m-5 bg-lite p-10 size20 color-lite'>
                        <div className='containerDetail'>
                            <CollapseToggleButton
                                title={'Goals'}
                                isCollapsed={collapseGoals}
                                setCollapse={setCollapseGoals}
                                align='left'
                            />
                        </div>
                        {!collapseGoals && (
                            <div>
                                {renderGoals('Current Goals', currentGoalsCollapse, setCurrentGoalsCollapse, goal => !goal[1])}
                                {renderGoals('Future Goals', futureGoalsCollapse, setFutureGoalsCollapse, goal => !goal[1])}
                                {renderGoals('Completed Goals', completedGoalsCollapse, setCompletedGoalsCollapse, goal => goal[1])}
                            </div>
                        )}
                        </div>
                }
                {tracking === 'journals' &&
                    <TrackJournal
                        journals={journals}
                        setJournals={setJournals}
                        targetElementRef={targetElementRef}
                        scrollToBottom={() => targetElementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
                    />
                }
            </div>
        </div>
    );
};

export default Journals;