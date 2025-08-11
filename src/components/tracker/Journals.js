import React, { useState, useEffect, useRef, useContext } from 'react';
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

const Journals = () => {

    const [projects, setProjects] = useState(initializeData('projects', initProjects));
    const [journals, setJournals] = useState();
    const [tracking, setTracking] = useState('journals');
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [currentGoalsCollapse, setCurrentGoalsCollapse] = useState(true);
    const [futureGoalsCollapse, setFutureGoalsCollapse] = useState(true);
    const [completedGoalsCollapse, setCompletedGoalsCollapse] = useState(true);

    const targetElementRef = useRef(null);

    const scrollToBottom = () => {
        //alert(`scrollToBottom`);
        if (targetElementRef.current) {
            //targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    const trackingMap = {
        'journals': [journals, setJournals],
    };

    useEffect(() => {
        if (journals === null) {
            console.log(`Journals => useEffect journals: ${JSON.stringify(journals, null, 2)}`);
            const initJournals = initializeData('journalTracking', initJournalTracking);
            const updatedJournals = [...initJournals];
            setJournals(updatedJournals);
        }
    }, []);

    useEffect(() => {
        if (projects !== undefined || projects !== '') {
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }, [projects]);

    useEffect(() => {

        if (initialized) {
            let updatedTrackingData = [...projects];
            if (tracking === 'journals') {
                updatedTrackingData = [...journals];
            }
            updatedTrackingData.map((group, groupIndex) => group.isCollapsed = isCollapsed);
            if (tracking === 'journals') {
                setJournals(updatedTrackingData);
            }
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]);

    useEffect(() => {
        if (journals !== 'undefined' && journals !== undefined && journals !== '') {
            console.log(`Journals => useEffect => journals: ${JSON.stringify(journals, null, 2)}`);
            localStorage.setItem('journalTracking', JSON.stringify(journals));
        }
    }, [journals]);

    useEffect(() => {
        if (tracking !== undefined || tracking !== '') {
            localStorage.setItem('tracking', tracking);
        }
    }, [tracking]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('WorkOutSearch', searchTerm);
            if (tracking === 'journals' && journals !== undefined) {
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
                    if (journalGroup.journals && journalGroup?.journals.length > 0) {
                        journalGroup.display = false;
                        journalGroup.journals.map((journal) => {
                            if (inJournalGroupTitle(journalGroup) || inJournalDescription(journal) || inJournal(journal) || inFeelings(journal) || inTodaysGoals(journal) || inFutureGoals(journal) || inGratefulFor(journal) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) {
                                journal.display = true;
                                journalGroup.display = true;
                            }
                        });
                    }
                });
                setJournals(filteredJournals);
            }
        }
    }, [newProjectDescription]);

    const selectTracking = (event) => {
        setTracking(event.target.value);
    };
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

        if (tracking === 'journals') {
            addJournalGroup();
        }
        setNewProjectDescription('');
    };

    const toggleCheckbox = (category, journalGroupIndex, journalIndex, currentGoalIndex) => {
        const newJournals = [...journals];
        const selectedGoal = newJournals[journalGroupIndex].journals[journalIndex][category][currentGoalIndex];
        const goalComplete = (selectedGoal[1]) ? false : true;
        selectedGoal[1] = goalComplete;
        setJournals(newJournals);
    }

    return <div className='mt--30'>
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
            </div>
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
                                        (journals && journals.length > 0)
                                            ? journals.map((journalGroup, journalGroupIndex) => (
                                                (journalGroup.journals && journalGroup.journals.length > 0)
                                                    ? journalGroup.journals.map((journal, journalIndex) => (
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
                                                    : null
                                            ))
                                            : null
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
                                        (journals && journals.length > 0)
                                            ? journals.map((journalGroup, journalGroupIndex) => (
                                                (journalGroup.journals && journalGroup.journals.length > 0)
                                                    ? journalGroup.journals.map((journal, journalIndex) => (
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
                                                    : null
                                            ))
                                            : null
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
                                        (journals && journals.length > 0)
                                            ? journals.map((journalGroup, journalGroupIndex) => (
                                                (journalGroup.journals && journalGroup.journals.length > 0)
                                                    ? journalGroup.journals.map((journal, journalIndex) => (
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
                                                    : null
                                            ))
                                            : null
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
                (tracking === 'journals')
                    ? <TrackJournal
                        journals={journals}
                        setJournals={setJournals}
                        targetElementRef={targetElementRef}
                        scrollToBottom={scrollToBottom}
                    />
                    : <React.Fragment></React.Fragment>
            }
        </div>
    </div>
};

export default Journals