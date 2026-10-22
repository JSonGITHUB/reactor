import React, { useState, useEffect, useRef } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackJournal from './TrackJournal';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initProjects from './initProjects';
import initJournalTracking from './initJournalTracking';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';
import icons from '../site/icons';

const Journals = () => {
    const normalizeJournalGroups = (groups) => {
        if (!Array.isArray(groups)) return [];

        return groups.map((group) => ({
            ...group,
            display: group?.display !== false,
            journals: Array.isArray(group?.journals) ? group.journals : Array.isArray(group?.journal) ? group.journal : [],
            journal: Array.isArray(group?.journal) ? group.journal : Array.isArray(group?.journals) ? group.journals : [],
            isCollapsed: Boolean(group?.isCollapsed),
        }));
    };

    const [projects] = useState(() => initializeData('projects', initProjects));
    const [journals, setJournals] = useState(() => normalizeJournalGroups(initializeData('journalTracking', initJournalTracking)));
    const [, setFilteredJournals] = useState(() => normalizeJournalGroups(initializeData('journalTracking', initJournalTracking)));
    const [tracking] = useState('journals');
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
            localStorage.setItem('journalTracking', JSON.stringify(normalizeJournalGroups(journals)));
        }
    }, [journals]);
    useEffect(() => {
        localStorage.setItem('tracking', tracking);
    }, [tracking]);

    // Search/filter journals by project description or goal text
    useEffect(() => {
        if (!newProjectDescription) return;
        const searchTerm = newProjectDescription.toLowerCase();
        const newFilteredJournals = normalizeJournalGroups(journals).map(journalGroup => {
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
                }
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
                return null;
            }
            return null;
        });
        if (newFilteredJournals[0] !== undefined) {
            setFilteredJournals(newFilteredJournals);
        } else {
            setFilteredJournals([]);
        }
    }, [journals, newProjectDescription]);

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
            isCollapsed: false,
            display: true,
        };
        setJournals(prev => normalizeJournalGroups([...prev, newJournalGroup]));
        setNewProjectDescription('');
    };

    // Toggle goal completion
    const toggleCheckbox = (category, journalGroupIndex, journalIndex, goalIndex) => {
        const newJournals = [...journals];
        const goal = newJournals[journalGroupIndex].journal[journalIndex][category][goalIndex];
        goal.completed = !goal.completed;
        setJournals(normalizeJournalGroups(newJournals));
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
                <div className='containerDetail color-yellow'>
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
                            <div className='containerDetail flexContainer centerVertical' key={`journals-goal-${type}-${groupIdx}-${journalIdx}-${goalIdx}-${idx}-${String(goal?.goal || 'goal')}`}>
                                <div className='flex2Column contentLeft pl-10'>{goal.goal}</div>
                                <div
                                    title='toggle checkbox'
                                    className='containerDetail bg-lite p-20 button'
                                    onClick={() => toggleCheckbox(category, groupIdx, journalIdx, goalIdx)}
                                >
                                    <input
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
            <div className='containerDetail color-yellow p-20 m-5 size25 bg-lite contentLeft'>
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
                    <div className='containerDetail m-5 bg-lite size20 color-lite'>
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