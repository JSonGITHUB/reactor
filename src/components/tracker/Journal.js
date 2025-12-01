import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import getKey from '../utils/KeyGenerator';
import EditableTextField from '../utils/EditableTextField';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';
import GoalDialog from '../utils/GoalDialog';

// Utility functions
const ifUndefinedString = (value) => (validate(value) === null) ? 'empty...' : value;
const ifUndefinedArray = (value) => (validate(value) === null) ? [] : value;

const Journal = ({
    journals,
    setJournals,
    journalGroupIndex,
    journalIndex,
    journal
}) => {
    const [isCollapsed, setIsCollapsed] = useState();
    const [editTitle, setEditTitle] = useState();
    const [editJournal, setEditJournal] = useState();
    const [editFeelings, setEditFeelings] = useState();
    const [editTodaysGoals, setEditTodaysGoals] = useState();
    const [editFutureGoals, setEditFutureGoals] = useState();
    const [editGratefulFor, setEditGratefulFor] = useState();
    const [editedJournal, setEditedJournal] = useState('');
    const [editedJournalTitle, setEditedJournalTitle] = useState('');
    const [editedFeelings, setEditedFeelings] = useState(journal.feelings ?? '');
    const [editedTodaysGoals, setEditedTodaysGoals] = useState([]);
    const [editedFutureGoals, setEditedFutureGoals] = useState([]);
    const [editedGratefulFor, setEditedGratefulFor] = useState('');
    const [goalDialog, setGoalDialog] = useState();
    const [editCategory, setEditCategory] = useState();
    const [editIndex, setEditIndex] = useState();
    const [selectedGoal, setSelectedGoal] = useState();

    const templateJournal = {
        description: 'Empty...',
        journal: 'Empty...',
        feelings: 'Empty...',
        todaysGoals: [],
        futureGoals: [],
        gratefulFor: 'Empty...',
        isCollapsed: false
    };

    // Ensure journal fields are initialized
    useEffect(() => {
        const newJournals = [...journals];
        // Defensive: Make sure journalGroupIndex and journalIndex exist and are objects
        if (
            !newJournals[journalGroupIndex] ||
            !Array.isArray(newJournals[journalGroupIndex].journal)
        ) return;

        let selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];

        // If not an object, initialize it
        if (typeof selectedNewJournal !== 'object' || selectedNewJournal === null) {
            selectedNewJournal = { ...templateJournal };
            newJournals[journalGroupIndex].journal[journalIndex] = selectedNewJournal;
        }

        let dataUpdated = false;

        if (validate(selectedNewJournal.feelings) === null) {
            selectedNewJournal.feelings = '';
            dataUpdated = true;
        }
        if (validate(selectedNewJournal.todaysGoals) === null) {
            selectedNewJournal.todaysGoals = [];
            dataUpdated = true;
        } else if (typeof selectedNewJournal.todaysGoals === 'string') {
            selectedNewJournal.todaysGoals = [selectedNewJournal.todaysGoals];
            dataUpdated = true;
        }
        if (validate(selectedNewJournal.futureGoals) === null) {
            selectedNewJournal.futureGoals = [];
            dataUpdated = true;
        } else if (typeof selectedNewJournal.futureGoals === 'string') {
            selectedNewJournal.futureGoals = [selectedNewJournal.futureGoals];
            dataUpdated = true;
        }
        if (validate(selectedNewJournal.gratefulFor) === null) {
            selectedNewJournal.gratefulFor = '';
            dataUpdated = true;
        }
        if (dataUpdated) setJournals(newJournals);
    }, []);
    useEffect(() => {
        if (journals !== undefined && journals.length > 0) {
            //console.log(`Journal => useEffect => journals[${journalIndex}].isCollapsed: ${journals[journalIndex].isCollapsed}`);
            //console.log(`Journal => useEffect => journals[${journalIndex}].isCollapsed: ${journals[journalIndex].isCollapsed}`);
            console.log(`Journal => useEffect => journals[${journalGroupIndex}].isCollapsed: ${JSON.stringify(journals[journalGroupIndex].isCollapsed, null, 2)}`);
            localStorage.setItem('journalTracking', JSON.stringify(journals));
        }
    }, [journals]);
    useEffect(() => {
        if (editedFeelings !== undefined && editedFeelings.length > 0) {
            //console.log(`Journal => useEffect => journals[${journalIndex}].isCollapsed: ${journals[journalIndex].isCollapsed}`);
            //console.log(`Journal => useEffect => journals[${journalIndex}].isCollapsed: ${journals[journalIndex].isCollapsed}`);
            console.log(`Journal => useEffect => editedFeelings: ${editedFeelings}`);
        }
    }, [editedFeelings]);

    // Persist isCollapsed state
    useEffect(() => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex] ?? templateJournal;
        selectedNewJournal.isCollapsed = !isCollapsed;
        selectedNewJournal.isCollapsed = !isCollapsed;
        localStorage.setItem('journalTracking', JSON.stringify(newJournals));
        //setJournals(newJournals);
    }, [isCollapsed]);

    // Toggle edit helpers
    //toggleEdit = (editFeelings, setEditFeelings, editedFeelings, setEditedFeelings, journal.feelings, 'feelings')
    const toggleEdit = (editState, setEditState, value, setValue, field, updateField) => {
        const toggled = (editState === undefined) ? true : !editState;
        console.log(`Journal => toggleEdit => toggled: ${toggled}`);
        console.log(`Journal => toggleEdit => editState: ${editState}`);
        console.log(`Journal => toggleEdit => setEditState: ${setEditState}`);
        console.log(`Journal => toggleEdit => value: ${value}`);
        console.log(`Journal => toggleEdit => setValue: ${setValue}`);
        console.log(`Journal => toggleEdit => field: ${field}`);
        console.log(`Journal => toggleEdit => updateField: ${updateField}`);
        setEditState(toggled);
        setValue(toggled ? value : '');
        if (!toggled && value !== field) {
            console.log(`Journal => toggleEdit => field: ${JSON.stringify(field, null, 2)} editFeelings: ${editFeelings} editedFeelings: ${editedFeelings} value: ${value}`);
            console.log(`Journal => toggleEdit => field: ${JSON.stringify(field, null, 2)} editJournal: ${editJournal} editedJournal: ${editedJournal} value: ${value}`);

            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journal[(journals.length - journalIndex)];
            selectedNewJournal[updateField] = value;
            console.log(`Journal => toggleEdit => selectedNewJournal[${updateField}]: ${JSON.stringify(selectedNewJournal[updateField], null, 2)}`);
            setJournals(newJournals);
        }
    };

    // Goal helpers
    const addGoal = (title) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];
        const newGoal = prompt(`Add a ${title.toLowerCase().replace('goals','goal')}:`, '');
        if (newGoal) {
            const goalArray = title.toLowerCase().includes('today') ? 'todaysGoals' : 'futureGoals';
            selectedNewJournal[goalArray].push([newGoal, false]);
            setJournals(newJournals);
        }
    };

    const toggleCheckbox = (category, index) => {
        const newJournals = [...journals];
        const selectedNewJournal = { ...newJournals[journalGroupIndex].journal[journalIndex] };
        const goalsArray = [...selectedNewJournal[category]];

        // Defensive: Ensure the goal exists and has a completed property
        if (!goalsArray[index]) return;
        goalsArray[index] = {
            ...goalsArray[index],
            completed: !goalsArray[index].completed
        };

        selectedNewJournal[category] = goalsArray;
        newJournals[journalGroupIndex].journal[journalIndex] = {...selectedNewJournal};
        //newJournals[journalGroupIndex].isCollapsed = false;
        //newJournals[journalGroupIndex].isCollapsed = false;
        console.log(`Journal => toggleCheckbox => newJournals[${journalGroupIndex}].isCollapsed: ${newJournals[journalGroupIndex].isCollapsed}`);
        setJournals(newJournals);
    };

    const editGoal = (category, index) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];

        // Defensive: Ensure the goals array exists and is an array
        if (!Array.isArray(selectedNewJournal[category])) return;

        // Defensive: Ensure the goal exists at the index
        const goal = selectedNewJournal[category][index].goal;
        if (!goal) return;

        // If goal is an array [text, checked], use text, else use goal itself
        const goalText = Array.isArray(goal) ? goal : String(goal);

        const editPrompt = prompt(`Edit goal #${index + 1}:`, goalText);
        if (editPrompt != null && editPrompt.trim() !== '') {
            selectedNewJournal[category][index].goal = editPrompt;
            setJournals(newJournals);
        }
        setSelectedGoal(selectedNewJournal[category][index]);
        setEditCategory(category);
        setEditIndex(index);
        setGoalDialog(true);
    };

    const submitGoal = (updatedGoal) => {
        if (updatedGoal != null) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];
            selectedNewJournal[editCategory][editIndex] = String(updatedGoal);
            setJournals(newJournals);
        }
        setSelectedGoal(null);
        setEditCategory(null);
        setEditIndex(null);
        setGoalDialog(false);
    };

    const deleteGoal = () => {
        const newJournals = [...journals];
        const arr = newJournals[journalGroupIndex].journal[journalIndex][editCategory];
        if (editIndex >= 0 && editIndex < arr.length) arr.splice(editIndex, 1);
        setJournals(newJournals);
        setEditCategory(null);
        setEditIndex(null);
        setGoalDialog(false);
        setSelectedGoal(null);
    };

    // UI helpers
    const journalHeader = (title, toggleFunction, isEdit) => (
        <div className='flexContainer containerBox bg-lite centerVertical'>
            <div className='containerBox p-20 flex2Column color-yellow'>{title}</div>
            <div className='flexContainer contentRight'>
                {title.toLowerCase().includes('goal') ? (
                    <div
                        title='add goal'
                        className='r-10 p-20 bg-lite button color-lite centeredContent'
                        onClick={() => addGoal(title)}
                    >
                        <div className='flexContainer'>
                            <div className='flex2Column text-outline-light size15'>{icons.plus}</div>
                            <div className='flex2Column size30 ml-5'>{icons.darts}</div>
                        </div>
                    </div>
                ) : (
                    <div
                        title={isEdit ? 'save' : 'edit'}
                        className='r-10 p-10 bg-lite button color-lite centeredContent'
                        onClick={toggleFunction}
                    >
                        {
                            isEdit
                            ? <div className='r-10 p-10 bg-lite color-neogreen button bold bg-blue'>save</div>
                            : <div className='r-10 p-10 bg-lite button'>{icons.edit}</div>
                        }
                    </div>
                )}
            </div>
        </div>
    );

    const journalField = (isEdit, setEdited, edited, data, toggleEdit, category) => (
        <div key={getKey(category)}>
            <div className='color-soft button'>
                {
                    isEdit 
                    ? <textarea
                        className='inputField size20 r-10 height-200 p-20'
                        onChange={e => setEdited(e.target.value)}
                        value={edited !== null ? edited : ifUndefinedArray(data)}
                        placeholder={edited}
                    />
                    : typeof data === 'string' 
                        ? <div onClick={toggleEdit}>
                            {ifUndefinedArray(data).split('\n').map((line, index) => (
                                <React.Fragment key={getKey(`data${index}`)}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </div>
                        :  data.map((goal, index) => (
                            <div key={getKey(`goal${index}`)} className={`containerBox flexContainer centerVertical ${(goal.completed) ?'bg-lite':'bg-lite'}`}>
                                <div className='flexColumn contentRight'>
                                    <div
                                        key={getKey(`goalToggle${index}`)}
                                        title='toggle checkbox'
                                        className='containerBox bg-lite p-20 button'
                                        onClick={() => {toggleCheckbox(category, index)}}
                                    >
                                        <input
                                            id='completed'
                                            name='completed'
                                            className='regular-checkbox button'
                                            //checked={goal.completed}
                                            checked={journals[journalGroupIndex].journal[journalIndex][category][index].completed}
                                            type='checkbox'
                                            //onChange={() => console.log(`goal: ${JSON.stringify(goal, null, 2)}`)}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className='containerBox flex2Column p-20'>
                                    <div
                                        title={goal && goal.goal ? String(goal.goal) : ''}
                                        onClick={() => {
                                            // Defensive: Only call editGoal if goal exists
                                            if (goal) editGoal(category, index);
                                        }}
                                    >
                                        {goal && goal.goal
                                        ? `${index + 1}. ${journals[journalGroupIndex].journal[journalIndex][category][index].goal}`
                                        : `${index + 1}. (empty goal)`
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                )}
            </div>
        </div>
    );

    const closeDialog = () => {
        setGoalDialog(false);
        setSelectedGoal(null);
    };
    const deleteJournal = () => {
        const toggle = window.confirm(`Are you sure you want to remove journal: ${journal.description}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error('Index out of range');
            }
        };
        if (toggle) {
            const newJournals = [...journals];
            removeItemByIndex(newJournals[journalGroupIndex].journals, journalIndex);
            setJournals(newJournals);
        }
    }

    return (
        <div key={`journal${journalIndex}`} className='containerDetail lowerBorder contentLeft bg-lite'>
            <GoalDialog
                goal={selectedGoal}
                isOpen={goalDialog}
                onClose={closeDialog}
                submitGoal={submitGoal}
                deleteGoal={deleteGoal}
            />
            <div className='containerDetail bg-lite'>
                <div className='flexContainer'>
                    <div className='flex1Auto contentLeft'>
                        {
                            (editTitle)
                            ? <textarea
                                className='inputField ht-55 size20 r-10 bold color-lite'
                                onChange={e => setEditedJournalTitle(e.target.value)}
                                value={editedJournalTitle !== null ? editedJournalTitle : journal.description}
                                placeholder={journal.description}
                            />
                            : <div className='containerBox bg-lite centerVertical p-20 bold'>
                                <CollapseToggleButton
                                    title={journal.description}
                                    isCollapsed={isCollapsed}
                                    setCollapse={setIsCollapsed}
                                    align='left'
                                    editTitle={() => toggleEdit(editTitle, setEditTitle, editedJournalTitle, setEditedJournalTitle, journal.description, 'description')}
                                />
                            </div>
                        }
                    </div>
                    {editTitle && (
                        <div
                            title='save'
                            className='rt-25 t-0 ml-5 mt-5 r-10 size15 button pl-20 contentRight'
                            onClick={() => toggleEdit(editTitle, setEditTitle, editedJournalTitle, setEditedJournalTitle, journal.description, 'description')}
                        >
                            <div className='r-10 p-10 bg-neogreen color-dark bold'>save</div>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <div className='m-10 flexContainer contentRight'>
                        <div
                            title='delete'
                            className='r-10 p-10 bg-lite button ml-10'
                            onClick={deleteJournal}
                        >
                            {icons.delete}
                        </div>
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <div>
                    <EditableTextField
                        title='Journal:'
                        data={journal.journal}
                        toggle={() => toggleEdit(editJournal, setEditJournal, editedJournal, setEditedJournal, journal.journal, 'journal')}
                        edit={editJournal}
                        setEdited={setEditedJournal}
                        edited={editedJournal}
                    />
                    <div className='flexContainer containerBox bg-lite centerVertical'>
                        <div className='containerBox flex2Column color-yellow p-20'>
                            I am...
                        </div>
                        <div className='r-10 p-10 bg-lite button color-lite centeredContent'>
                            <div
                                title={editFeelings ? 'save' : 'edit'}
                                className='button'
                                onClick={() => toggleEdit(editFeelings, setEditFeelings, editedFeelings, setEditedFeelings, journal.feelings, 'feelings')}
                            >
                                {
                                    (editFeelings)
                                    ? <div className='r-10 p-10 color-neogreen button'>
                                        save
                                    </div>
                                    : <div className='p-10 button'>
                                        {icons.edit}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='containerBox p-20 color-soft button'>
                        {
                            (editFeelings) 
                            ? <textarea
                                className="inputField size20 r-10 height-200"
                                onChange={e => setEditedFeelings(e.target.value)}
                                onBlur={() =>
                                    toggleEdit(
                                    editFeelings,
                                    setEditFeelings,
                                    editedFeelings,
                                    setEditedFeelings,
                                    journal.feelings,
                                    'feelings'
                                    )
                                }
                                value={editedFeelings}
                                placeholder="Enter your feelings..."
                            />
                            : <div onClick={() => toggleEdit(editFeelings, setEditFeelings, editedFeelings, setEditedFeelings, journal.feelings, 'feelings')}>
                                {ifUndefinedString(journal.feelings).split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                        }
                    </div>
                    {journalHeader('Goals for today:', () => toggleEdit(editTodaysGoals, setEditTodaysGoals, editedTodaysGoals, setEditedTodaysGoals, journal.todaysGoals, 'todaysGoals'), editTodaysGoals)}
                    {journalField(editTodaysGoals, setEditedTodaysGoals, editedTodaysGoals, journal.todaysGoals, () => toggleEdit(editTodaysGoals, setEditTodaysGoals, editedTodaysGoals, setEditedTodaysGoals, journal.todaysGoals, 'todaysGoals'), 'todaysGoals')}
                    {journalHeader('Goals for the future:', () => toggleEdit(editFutureGoals, setEditFutureGoals, editedFutureGoals, setEditedFutureGoals, journal.futureGoals, 'futureGoals'), editFutureGoals)}
                    {journalField(editFutureGoals, setEditedFutureGoals, editedFutureGoals, journal.futureGoals, () => toggleEdit(editFutureGoals, setEditFutureGoals, editedFutureGoals, setEditedFutureGoals, journal.futureGoals, 'futureGoals'), 'futureGoals')}
                    <div className='containerBox bg-lite'>
                        <div className='flexContainer centerVertical'>
                            <div className='containerBox p-20 flex2Column color-yellow'>I am grateful for...</div>
                            <div className='flexColumn contentRight'>
                                <div
                                    title={editGratefulFor ? 'save' : 'edit'}
                                    className='button'
                                    onClick={() => toggleEdit(editGratefulFor, setEditGratefulFor, editedGratefulFor, setEditedGratefulFor, journal.gratefulFor, 'gratefulFor')}
                                >
                                    {editGratefulFor
                                        ? <div className='r-10 p-20 bg-lite color-neogreen button bold'>save</div>
                                        : <div className='r-10 p-20 bg-lite'>{icons.edit}</div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='containerBox'>
                        <div className='color-soft button'>
                            {editGratefulFor ? (
                                <textarea
                                    className='inputField size20 r-10 height-200 p-20'
                                    onChange={e => setEditedGratefulFor(e.target.value)}
                                    onBlur={() => toggleEdit(editGratefulFor, setEditGratefulFor, editedGratefulFor, setEditedGratefulFor, journal.gratefulFor, 'gratefulFor')}
                                    value={editedGratefulFor !== null ? editedGratefulFor : ifUndefinedString(journal.gratefulFor)}
                                    placeholder={editedGratefulFor}
                                />
                            ) : (
                                <div className='p-20' onClick={() => toggleEdit(editGratefulFor, setEditGratefulFor, editedGratefulFor, setEditedGratefulFor, journal.gratefulFor, 'gratefulFor')}>
                                    {ifUndefinedString(journal.gratefulFor).split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;