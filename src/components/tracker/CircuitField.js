import React, { useContext } from 'react';
import CircuitContainer from './CircuitContainer';
import validate from '../utils/validate';
import { CircuitContext } from '../context/CircuitContext';

const CircuitField = ({
    circuit,
    circuitGroupIndex,
    circuitIndex,
    editCircuit,
    isEdit,
    setEdited,
    edited,
    data,
    toggleEdit,
    category
}) => {

    const {
        circuits,
        setCircuits
    } = useContext(CircuitContext); 

    const ifUndefinedArray = (value) => (validate(value) === null) ? [] : value;

    const toggleCheckbox = (index) => {
        const newCircuits = [...circuits];
        const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
        const complete = selectedNewCircuit.excersizes[index].complete ?? false;
        selectedNewCircuit.excersizes[index].complete = !complete;
        localStorage.setItem('circuitTracking', JSON.stringify(newCircuits));
        setCircuits(newCircuits);
    }

    const deleteGoal = (category, index) => {
        const removeItemByIndex = (array) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error('Index out of range');
            }
        };
        const newCircuits = [...circuits];
        removeItemByIndex(newCircuits[circuitGroupIndex].circuits[circuitIndex].excersizes);
    }
    const searchTerm = localStorage.getItem('trackerSearch');
    const inSearch = (goal) => goal.title.toLowerCase().includes(searchTerm);
    return <div className=''>
            <div className='color-soft'>
                {
                    (isEdit)
                    ? <textarea
                        className='inputField size20 r-10 height-200 p-20 button'
                        onChange={(e) => setEdited(e.target.value)}
                        value={edited !== null ? edited : ifUndefinedArray(data)}
                        placeholder={edited}
                    >
                        {edited}
                    </textarea>
                    : (typeof data === 'string')
                        ? <div onClick={() => toggleEdit()}>
                            {ifUndefinedArray(data).split('\n').map((line, index) => (
                                <React.Fragment key={`circuit-data-${circuitGroupIndex}-${circuitIndex}-${index}`}>
                                    {line}
                                    {<br />}
                                </React.Fragment>
                            ))}
                        </div>
                        : ifUndefinedArray(data).map((goal, index) => {
                            return (inSearch(goal))
                                ? <div key={`circuit-goal-${circuitGroupIndex}-${circuitIndex}-${index}-${String(goal?.title || 'goal')}`} className=''>
                                    <CircuitContainer
                                        index={index}
                                        circuit={circuit}
                                        goal={goal}
                                        category={category}
                                        circuitIndex={circuitIndex}
                                        circuitGroupIndex={circuitGroupIndex}
                                        editCircuit={editCircuit}
                                        toggleCheckbox={toggleCheckbox}
                                        deleteGoal={deleteGoal}
                                    />
                                </div>
                                : null
                            })
                }
            </div>
        </div>
}
export default CircuitField;