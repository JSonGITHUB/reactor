import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import getKey from '../utils/KeyGenerator';
import EditableTextField from '../utils/EditableTextField';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';
import GoalDialog from '../utils/GoalDialog';

const Journal = ({

    journals,
    setJournals,
    journalGroupIndex,
    journalIndex,
    journal

}) => {

    const [collapsed, setCollapsed] = useState(journal.isCollapsed ?? false);
    const [editTitle, setEditTitle] = useState(false);
    const [editJournal, setEditJournal] = useState(false);
    const [editFeelings, setEditFeelings] = useState(false);
    const [editTodaysGoals, setEditTodaysGoals] = useState(false);
    const [editFutureGoals, setEditFutureGoals] = useState(false);
    const [editGratefulFor, setEditGratefulFor] = useState(false);

    const [editedJournal, setEditedJournal] = useState(null);
    const [editedJournalTitle, setEditedJournalTitle] = useState(null);
    const [editedFeelings, setEditedFeelings] = useState(null);
    const [editedTodaysGoals, setEditedTodaysGoals] = useState(null);
    const [editedFutureGoals, setEditedFutureGoals] = useState(null);
    const [editedGratefulFor, setEditedGratefulFor] = useState(null);
    const [goalDialog, setGoalDialog] = useState(false);
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
    }
    useEffect(() => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex] ?? templateJournal;
        console.log(`selectedNewJournal: ${JSON.stringify(selectedNewJournal,null, 2)}`)
        let dataUpdated = false;
        //if (selectedNewJournal?.feelings === undefined || selectedNewJournal?.feelings === null) {
        if (validate(selectedNewJournal?.feelings) === null) {
            selectedNewJournal.feelings = '';
            dataUpdated = true;
        }
        //if (selectedNewJournal?.todaysGoals === undefined || selectedNewJournal?.todaysGoals === null) {
        if (validate(selectedNewJournal?.todaysGoals) === null) {
            selectedNewJournal.todaysGoals = [];
            dataUpdated = true;
        } else if (typeof selectedNewJournal?.todaysGoals === 'string') {
            selectedNewJournal.todaysGoals = [selectedNewJournal.todaysGoals];
            dataUpdated = true;
        }
        //if (selectedNewJournal?.futureGoals === undefined || selectedNewJournal?.futureGoals === null) {
        if (validate(selectedNewJournal?.futureGoals) === null) {
            selectedNewJournal.futureGoals = [];
            dataUpdated = true;
        } else if (typeof selectedNewJournal?.futureGoals === 'string') {
            selectedNewJournal.futureGoals = [selectedNewJournal.futureGoals];
            dataUpdated = true;
        }
        //if (selectedNewJournal?.gratefulFor === undefined || selectedNewJournal?.gratefulFor === null) {
        if (validate(selectedNewJournal?.gratefulFor) === null) {
            selectedNewJournal.gratefulFor = '';
            dataUpdated = true;
        }
        if (dataUpdated) {
            setJournals(newJournals);
        }
        /*
        if (selectedNewJournal.feelings === '') {
            toggleEditFeelings();
        }
        if (selectedNewJournal.gratefulFor === '') {
            toggleEditGratefulFor();
        }
        if (selectedNewJournal.journal === '') {
            toggleEditJournal();
        }
        */
        //console.log(`Journal => journals: ${JSON.stringify(journals,null,2)}`)
    }, []);

    useEffect(() => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex] ?? templateJournal;
        console.log(`Journal => collapsed: ${collapsed}`)
        console.log(`Journal => selectedNewJournal: ${JSON.stringify(selectedNewJournal,null,2)}`);
        console.log(`Journal => selectedNewJournal.isCollapsed: ${selectedNewJournal.isCollapsed}`);
        selectedNewJournal.isCollapsed = collapsed;
        const stringifiedData = JSON.stringify(newJournals);
        //console.log(`Journal => stringifiedData: ${stringifiedData}`);
        localStorage.setItem('journalTracking', stringifiedData);
    }, [collapsed]);

    const toggleEditTitle = () => {
        const toggleTitle = (editTitle)
            ? false
            : true;
        const wasJournalTitleEdited = (journal.title !== editedJournalTitle) ? true : false;
        setEditTitle(toggleTitle);
        setEditedJournalTitle((toggleTitle) ? journal.title : '');
        if (!toggleTitle && wasJournalTitleEdited) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
            selectedNewJournal.description = (wasJournalTitleEdited) ? editedJournalTitle : selectedNewJournal.description;
            setJournals(newJournals);
        }
    }
    const toggleEditJournal = () => {
        const toggleJournal = (editJournal)
            ? false
            : true;
        const wasJournalEdited = (journal.journal !== editedJournal) ? true : false;
        setEditJournal(toggleJournal);
        setEditedJournal((toggleJournal) ? journal.journal : '');
        if (!toggleJournal && wasJournalEdited) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
            selectedNewJournal.journal = (wasJournalEdited) ? editedJournal : selectedNewJournal.journal;   
            setJournals(newJournals);
        }
    }
    const toggleEditFeelings = () => {
        const toggleFeelings = (editFeelings)
            ? false
            : true;
        const wasFeelingsEdited = (journal.feelings !== editedFeelings) ? true : false;
        setEditFeelings(toggleFeelings);
        setEditedFeelings((toggleFeelings) ? journal.feelings : '');
        if (!toggleFeelings && wasFeelingsEdited) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
            selectedNewJournal.feelings = (wasFeelingsEdited) ? editedFeelings : selectedNewJournal.feelings;   
            setJournals(newJournals);
        }
    }
    const toggleEditTodaysGoals = () => {
        const toggleTodaysGoals = (editTodaysGoals)
            ? false
            : true;
        const wasTodaysGoalsEdited = (journal.todaysGoals !== editedTodaysGoals) ? true : false;
        setEditTodaysGoals(toggleTodaysGoals);
        setEditedTodaysGoals((toggleTodaysGoals) ? journal.todaysGoals : '');
        if (!toggleTodaysGoals && wasTodaysGoalsEdited) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
            selectedNewJournal.todaysGoals = (wasTodaysGoalsEdited) ? editedTodaysGoals : selectedNewJournal.todaysGoals;   
            setJournals(newJournals);
        }
    }
    const toggleEditFutureGoals = () => {
        const toggleFutureGoals = (editFutureGoals)
            ? false
            : true;
        const wasFutureGoalsEdited = (journal.futureGoals !== editedFutureGoals) ? true : false;
        setEditFutureGoals(toggleFutureGoals);
        setEditedFutureGoals((toggleFutureGoals) ? journal.futureGoals : '');
        if (!toggleFutureGoals && wasFutureGoalsEdited) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
            selectedNewJournal.futureGoals = (wasFutureGoalsEdited) ? editedFutureGoals : selectedNewJournal.futureGoals;   
            setJournals(newJournals);
        }
    }
    const toggleEditGratefulFor = () => {
        const toggleGratefulFor = (editGratefulFor)
            ? false
            : true;
        const wasGratefulForEdited = (journal.gratefulFor !== editedGratefulFor) ? true : false;
        setEditGratefulFor(toggleGratefulFor);
        setEditedGratefulFor((toggleGratefulFor) ? journal.gratefulFor : '');
        if (!toggleGratefulFor && wasGratefulForEdited) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
            selectedNewJournal.gratefulFor = (wasGratefulForEdited) ? editedGratefulFor : selectedNewJournal.gratefulFor;   
            setJournals(newJournals);
        }
    }
    
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
    //const ifUndefinedString = (value) => (value === undefined) ? 'empty...' : value;
    const ifUndefinedString = (value) => (validate(value) === null) ? 'empty...' : value;
    //const ifUndefinedArray = (value) => (value === undefined) ? [] : value;
    const ifUndefinedArray = (value) => (validate(value) === null) ? [] : value;

    const addGoal = (title) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
        const newGoal = prompt(`Add a ${title.toLowerCase().replace('goals','goal')}:`, '');
        if (newGoal != null) {
            if (title.toLowerCase().includes('today')) {
                selectedNewJournal.todaysGoals.push([newGoal,false]);
                setJournals(newJournals);
            } else if (title.toLowerCase().includes('future')) {
                selectedNewJournal.futureGoals.push([newGoal,false]);
                setJournals(newJournals);
            }
        }
    }
    const toggleCheckbox = (category, index) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
        if (category === 'todaysGoals') {
            const todayGoalComplete = (selectedNewJournal.todaysGoals[index][1]) ? false : true;
            selectedNewJournal.todaysGoals[index][1] = todayGoalComplete;
            setJournals(newJournals);
        } else if (category === 'futureGoals') {
            const futureGoalComplete = (selectedNewJournal.futureGoals[index][1]) ? false : true;
            selectedNewJournal.futureGoals[index][1] = futureGoalComplete;
            setJournals(newJournals);
        }
    }
    const editGoal = (category, index) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
        if (category === 'todaysGoals') {
            /*
                const editTodayGoal = prompt(`Edit goal #${index+1}:`, selectedNewJournal.todaysGoals[index][0]);
                if (editTodayGoal != null) {
                    selectedNewJournal.todaysGoals[index][0] = editTodayGoal;
                    setJournals(newJournals);
                }
            */
            setSelectedGoal(selectedNewJournal.todaysGoals[index][0]);
        } else if (category === 'futureGoals') {
            /*
                const editFutureGoal = prompt(`Edit goal #${index+1}:`, selectedNewJournal.futureGoals[index][0]);
                if (editFutureGoal != null) {
                    selectedNewJournal.futureGoals[index][0] = editFutureGoal;
                    setJournals(newJournals);
                }
            */
           setSelectedGoal(selectedNewJournal.futureGoals[index][0]);
        }
        setEditCategory(category);
        setEditIndex(index);
        setGoalDialog(true);
    }

    const submitGoal = (updatedGoal) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journals[journalIndex];
        
        if (updatedGoal != null) {
            if (editCategory === 'todaysGoals') {
                selectedNewJournal.todaysGoals[editIndex][0] = updatedGoal;
            } else if (editCategory === 'futureGoals') {
                selectedNewJournal.futureGoals[editIndex][0] = updatedGoal;
            }
            setJournals(newJournals);
        }
        setSelectedGoal(null);
        setEditCategory(null);
        setEditIndex(null);
        setGoalDialog(false);
    }

    const deleteGoal = () => {
        const removeItemByIndex = (array) => {
            if (editIndex >= 0 && editIndex < array.length) {
                array.splice(editIndex, 1);
            } else {
                console.error('Index out of range');
            }
        };
        const newJournals = [...journals];
        removeItemByIndex(newJournals[journalGroupIndex].journals[journalIndex][editCategory]);
        setJournals(newJournals);
        setEditCategory(null);
        setEditIndex(null);
        setGoalDialog(false);
        setSelectedGoal(null);
    }

    const journalHeader = (title, toggleFunction, isEdit) => {

        return <div className='flexContainer containerBox bg-lite centerVertical '>
                    <div className='containerBox p-20 flex2Column color-yellow'>
                        {title}
                    </div>
                    {
                        (title.toLowerCase().includes('goal'))
                        ? <div className='flexContainer contentRight'>
                            <div
                                title='add goal'
                                className='r-10 p-20 bg-lite button color-lite centeredContent'
                                onClick={() => addGoal(title)}
                            >
                                <div className='flexContainer'>
                                    <div className='flex2Column text-outline-light size15'>
                                        {icons.plus}
                                    </div>
                                    <div className='flex2Column size30 ml-5'>
                                        {icons.darts}
                                    </div>
                                </div>
                            </div>
                        </div>
                        : <div className='flexContainer contentRight'>
                            <div
                                title={(isEdit)?'save':'edit'}
                                className='r-10 p-10 bg-lite button color-lite centeredContent'
                                onClick={() => toggleFunction()}
                            >
                                {
                                    (isEdit)
                                    ? <div className='r-10 p-10 bg-lite color-neogreen button bold'>save</div>
                                    : <div className='r-10 p-10 bg-lite button'>{icons.edit}</div>
                                }
                            </div>
                        </div>
                    }
                    
                </div>
    }
    const journalField = (isEdit, setEdited, edited, data, toggleEdit, category) => {
        return <div className=''>
                    <div className='color-soft button'>
                        {
                            (isEdit)
                                ? <textarea
                                        className='inputField size20 r-10 height-200 p-20'
                                        onChange={(e) => setEdited(e.target.value)}
                                        value={edited !== null ? edited : ifUndefinedArray(data)}
                                        placeholder={edited}
                                    >
                                        {edited}
                                    </textarea>
                                : (typeof data === 'string')
                                    ? <div 
                                        onClick={() => toggleEdit()}>
                                        {ifUndefinedArray(data).split('\n').map((line, index) => (
                                            <React.Fragment key={getKey(`data${index}`)}>
                                                {line}
                                                {<br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    : ifUndefinedArray(data).map((goal, index) => <div key={getKey(`goal${index}`)} className='containerBox flexContainer centerVertical'>
                                            <div className='flexColumn contentRight'>
                                                <div
                                                    title='toggle checkbox'
                                                    className='containerBox bg-lite p-20 button'
                                                    onClick={() => toggleCheckbox(category, index)}
                                                >
                                                    <input
                                                        id='completed'
                                                        name='completed'
                                                        className='regular-checkbox button'
                                                        checked={goal[1]}
                                                        type='checkbox'
                                                        onChange={() => console.log(`checkbox => category: ${category} index: ${index}`)}
                                                    />
                                                </div>
                                            </div>
                                            <div className='containerBox flex2Column p-20'>
                                                <div
                                                    title={goal[0]}
                                                    onClick={() => editGoal(category, index)}
                                                >
                                                    {index+1}. {goal[0]}
                                                </div>
                                            </div>
                                            {/*
                                                <div className='flexColumn contentRight'>
                                                    <div 
                                                        className='containerBox bg-lite button centeredContent' 
                                                        onClick={() => deleteGoal(category, index)}
                                                    >
                                                        {icons.delete}
                                                    </div>
                                                </div>
                                            */}
                                        </div>
                                    )                  
                        }
                    </div>
                </div>
    }
    const closeDialog = () => {
        setGoalDialog(false);
        setSelectedGoal(null);
    }
    return <div key={`journal${journalIndex}`} className='containerBox lowerBorder contentLeft'>
                <GoalDialog
                    goal={selectedGoal}
                    isOpen={goalDialog}
                    onClose={closeDialog}
                    submitGoal={submitGoal}
                    deleteGoal={deleteGoal}
                />
                <div className='containerBox bg-lite'>
                    <div className='flexContainer'>
                        <div className='flex1Auto contentLeft'>
                            {
                                (editTitle)
                                ? <textarea
                                    className='inputField ht-55 size20 r-10 bold color-lite'
                                    onChange={(e) => setEditedJournalTitle(e.target.value)}
                                    value={(editedJournalTitle !== null) ? editedJournalTitle : journal.description}
                                    placeholder={journal.description}
                                >
                                    {journal.description}
                                </textarea>
                                : <div className='containerBox bg-lite centerVertical p-20 bold'>
                                    <CollapseToggleButton
                                        title={journal.description}
                                        isCollapsed={collapsed}
                                        setCollapse={setCollapsed}
                                        align='left'
                                        editTitle={toggleEditTitle}
                                    />
                                </div>
                            }
                        </div>
                        {
                            (editTitle)
                            ? <div
                                    title='save'
                                    className={`rt-25 t-0 ml-5 mt-5 r-10 size15 button pl-20 contentRight`}
                                    onClick={() => toggleEditTitle()}
                                >
                                    <div className='r-10 p-10 bg-neogreen color-dark bold'>
                                        save
                                    </div>
                                </div>
                            : null
                        }
                    </div>
                    {
                        (collapsed)
                        ? null
                        : <div className='m-10 flexContainer contentRight'>
                            <div 
                                title='delete'
                                className='r-10 p-10 bg-lite button ml-10' 
                                onClick={() => deleteJournal()}
                            >
                                {icons.delete}
                            </div>
                        </div>
                    }
                </div>
            {
                (collapsed)
                ? null
                : <div>
                    <EditableTextField
                        title='Journal:'
                        data={journal.journal}
                        toggle={toggleEditJournal}
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
                                title={(editFeelings)?'save':'edit'}
                                className={`button`}
                                onClick={() => toggleEditFeelings()}
                            >
                                {
                                    (editFeelings)
                                    ? <div className='r-10 p-10 bg-lite color-neogreen button bold'>save</div>
                                    : <div className='p-10 button'>{icons.edit}</div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='containerBox p-20'>
                        <div className='containerBox p-20 color-soft button'>
                            {
                                (editFeelings)
                                ? <textarea
                                    className='inputField size20 r-10 height-200'
                                    onChange={(e) => setEditedFeelings(e.target.value)}
                                    onBlur={() => toggleEditFeelings()}
                                    value={(editedFeelings !== null) ? editedFeelings : ifUndefinedString(journal.feelings)}
                                    placeholder={editedFeelings}
                                >
                                    {editedFeelings}
                                </textarea>
                                : <div onClick={() => toggleEditFeelings()}>
                                        {ifUndefinedString(journal.feelings).split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                {<br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                            }
                        </div>
                    </div>
                    {journalHeader('Goals for today:', toggleEditTodaysGoals, editTodaysGoals)}
                    {journalField(editTodaysGoals, setEditedTodaysGoals, editedTodaysGoals, journal.todaysGoals, toggleEditTodaysGoals, 'todaysGoals')}
                    {journalHeader('Goals for the future:', toggleEditFutureGoals, editFutureGoals)}
                    {journalField(editFutureGoals, setEditedFutureGoals, editedFutureGoals, journal.futureGoals, toggleEditFutureGoals, 'futureGoals')}
                    <div className='containerBox bg-lite'>
                        <div className='flexContainer centerVertical'>
                            <div className='containerBox p-20 flex2Column color-yellow'>
                                I am grateful for...
                            </div>
                            <div className='flexColumn contentRight'>
                                <div
                                    title={(editGratefulFor) ? 'save' : 'edit'}
                                    className={`button`}
                                    onClick={() => toggleEditGratefulFor()}
                                >
                                    {
                                        (editGratefulFor)
                                            ? <div className='r-10 p-20 bg-lite color-neogreen button bold'>save</div>
                                            : <div className='r-10 p-20 bg-lite'>{icons.edit}</div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='containerBox'>
                        <div className='color-soft button'>
                            {
                                (editGratefulFor)
                                ? <textarea
                                    className='inputField size20 r-10 height-200 p-20'
                                    onChange={(e) => setEditedGratefulFor(e.target.value)}
                                    onBlur={() => toggleEditGratefulFor()}
                                    value={(editedGratefulFor !== null) ? editedGratefulFor : ifUndefinedString(journal.gratefulFor)}
                                    placeholder={editedGratefulFor}
                                >
                                    {editedGratefulFor}
                                </textarea>
                                : <div className='p-20' onClick={() => toggleEditGratefulFor()}>
                                        {ifUndefinedString(journal.gratefulFor).split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                {<br />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
}
export default Journal;