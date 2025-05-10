import React, { useState, useContext } from 'react';
import icons from '../site/icons';
import initCircuitTracking from './initCircuitTracking';
import initializeData from './initializeData';
import { CircuitContext } from '../context/CircuitContext';

const CircuitCheckBox = ({
    index, 
    goal, 
    category,
    circuitIndex,
    circuitGroupIndex,
    editCircuit,
    toggleCheckbox,
    deleteGoal,
}) => {

    const {
        circuits,
        setCircuits,
        activeIndex,
        setActiveIndex,
        setActivated,
        edit, 
        setEdit
    } = useContext(CircuitContext);

    const [editedGoalTitle, setEditedGoalTitle] = useState();
    const [editedGoalLink, setEditedGoalLink] = useState();

    const editGoal = (category, index) => {
        const newCircuits = [...circuits];
        const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
        if (category === 'todaysGoals') {
            const editTodayGoal = prompt(`Edit goal #${index + 1}:`, selectedNewCircuit.excersizes[index][0]);
            selectedNewCircuit.excersizes[index][0] = editTodayGoal;
            setCircuits(newCircuits);
        } else if (category === 'futureGoals') {
            const editFutureGoal = prompt(`Edit goal #${index + 1}:`, selectedNewCircuit.futureGoals[index][0]);
            selectedNewCircuit.futureGoals[index][0] = editFutureGoal;
            setCircuits(newCircuits);
        }
    }
    /*
    const toggleComplete = () => {
        const newCircuits = [...circuits];
        const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
        selectedNewCircuit.excersizes[index][0] = editTodayGoal;
        setCircuits(newCircuits);
    }
    */
    const toggleEditGoal = () => {
        const toggleTitle = (edit) ? false : true;
        const wasGoalTitleEdited = (goal.title !== editedGoalTitle) ? true : false;
        const wasGoalLinkEdited = (goal.link !== editedGoalLink) ? true : false;
        setEdit(toggleTitle);
        setEditedGoalTitle((toggleTitle) ? goal.title : '');
        setEditedGoalLink((toggleTitle) ? goal.link : '');
        const newCircuits = [...circuits];
        const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
        if (!toggleTitle && wasGoalTitleEdited) {
            selectedNewCircuit.excersizes[index].title = (wasGoalTitleEdited) ? editedGoalTitle : selectedNewCircuit.excersizes[index].title;
        }
        if (!toggleTitle && wasGoalLinkEdited) {
            selectedNewCircuit.excersizes[index].link = (wasGoalLinkEdited) ? editedGoalLink : selectedNewCircuit.excersizes[index].link;
        }
        if (!toggleTitle && (wasGoalTitleEdited || wasGoalLinkEdited)) {
            setCircuits(newCircuits);
        }
    }
    const swapItems = (array, index1, index2) => {
        if (
            index1 >= 0 && index1 < array.length &&
            index2 >= 0 && index2 < array.length &&
            index1 !== index2
        ) {
            const temp = array[index1];
            array[index1] = array[index2];
            array[index2] = temp;
        }
        return array;
    }
    const shiftCircuitUp = (index) => {
        const newCircuits = [...circuits];
        const excercises = newCircuits[circuitIndex].circuits[circuitGroupIndex].excersizes;
        console.log(`CircuitCheckBox => shiftCircuitUp = (${index}) => excercises: ${JSON.stringify(excercises, null, 2)}`);
        const updateCircuits = swapItems(newCircuits[circuitIndex].circuits[circuitGroupIndex].excersizes, index, (index - 1));
        console.log(`CircuitCheckBox => shiftCircuitUp = (${index}) => updateCircuits: ${JSON.stringify(updateCircuits, null, 2)}`);
        newCircuits[circuitIndex].circuits[circuitGroupIndex].excersizes = updateCircuits;
        setCircuits(newCircuits);
    };
    const shiftCircuitDown = (index) => {
        const newCircuits = [...circuits];
        const excercises = newCircuits[circuitIndex].circuits[circuitGroupIndex].excersizes;
        console.log(`CircuitCheckBox => shiftCircuitUp = (${index}) => excercises: ${JSON.stringify(excercises, null, 2)}`);
        const updateCircuits = swapItems(newCircuits[circuitIndex].circuits[circuitGroupIndex].excersizes, index, (index + 1));
        console.log(`CircuitCheckBox => shiftCircuitUp = (${index}) => updateCircuits: ${JSON.stringify(updateCircuits, null, 2)}`);
        newCircuits[circuitIndex].circuits[circuitGroupIndex].excersizes = updateCircuits;
        setCircuits(newCircuits);
    };
    return <div>
            {
                (!editCircuit)
                ? <div
                    className='containerBox flexContainer bg-lite p-20'
                        //toggleCheckbox(index)}
                >
                    {
                        (!edit || editCircuit)
                        ? <div>
                            <span 
                                title='shift up' 
                                className='button flex2Column mr-10' 
                                onClick={() => shiftCircuitUp(index)}
                            >
                                {icons.upArrow}
                            </span>
                            <span 
                                title='shift down' 
                                className='button flex2Column mr-10' 
                                onClick={() => shiftCircuitDown(index)}
                            >
                                {icons.downArrow}
                            </span>
                        </div>
                        : null
                    }
                    <input
                        id='completed'
                        name='completed'
                        title={goal.title}
                        className='flexColumn regular-checkbox button'
                        checked={goal.complete}
                        type='checkbox'
                        onChange={() => !goal.complete}
                        onClick={() => toggleCheckbox(index, circuitIndex, circuitGroupIndex)}
                    />
                    <div className='flex2Column pl-10' onClick={() => editGoal(category, index)}>
                        {index + 1}. {goal.title}
                    </div>
                </div>
                : <div className=''>
                    <div className='containerBox bg-lite contentLeft'>
                    {
                        (edit)
                        ? <div>
                            <textarea
                                className='inputField ht-55 size20 r-10 color-lite'
                                onChange={(e) => setEditedGoalTitle(e.target.value)}
                                value={(editedGoalTitle !== null) ? editedGoalTitle : goal.title}
                                placeholder={goal.title}
                            >
                                {goal.title}
                            </textarea>
                            <textarea
                                className='inputField ht-55 size20 r-10 color-lite'
                                onChange={(e) => setEditedGoalLink(e.target.value)}
                                value={(editedGoalLink !== null) ? editedGoalLink : goal.link}
                                placeholder={goal.link}
                            >
                                {goal.link}
                            </textarea>
                        </div>
                        : <span>{index + 1}. {goal.title}</span>
                    } 
                    </div>
                    <div className='containerBox flexContainer'>
                        <div 
                            title='delete' 
                            className='containerBox flex2Column bg-lite button contentCenter' 
                            onClick={() => deleteGoal(category, index)}
                        >
                            {icons.delete}
                        </div>
                        <div title={(edit) ? 'Save' : 'Edit'} onClick={() => toggleEditGoal()} className='containerBox flex2Column bg-lite button contentCenter'>
                            {
                                (edit)
                                ? <div className='color-neogreen bold'>save</div>
                                : icons.edit
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
}
export default CircuitCheckBox;