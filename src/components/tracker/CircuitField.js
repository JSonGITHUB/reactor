import React, { useContext } from 'react';
import getKey from '../utils/KeyGenerator';
import CircuitContainer from './CircuitContainer';
import initCircuitTracking from './initCircuitTracking';
import initializeData from './initializeData';
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
        setCircuits,
        edit,
        setEdit
    } = useContext(CircuitContext); 

    const ifUndefinedArray = (value) => (validate(value) === null) ? [] : value;

    const toggleCheckbox = (index) => {
        const newCircuits = [...circuits];
        const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
        const complete = selectedNewCircuit.excersizes[index].complete ?? false;
        selectedNewCircuit.excersizes[index].complete = !complete;
        localStorage.setItem('circuitTracking', JSON.stringify(newCircuits));
        console.log(`localStorage.setItem('circuitTracking')5`)
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
    const key = () => {
       const theKeyIs = getKey(`circuitGroup${circuitGroupIndex}Circuit${circuitIndex}${Math.random()*100}`);
       return theKeyIs;
    }
    const searchTerm = localStorage.getItem('trackerSearch');
    const inSearch = (goal) => goal.title.toLowerCase().includes(searchTerm);
    return <div key={key()} className=''>
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
                                <React.Fragment key={getKey(`data${index}`)}>
                                    {line}
                                    {<br />}
                                </React.Fragment>
                            ))}
                        </div>
                        : ifUndefinedArray(data).map((goal, index) => {
                            return (inSearch(goal))
                                ? <div key={key()}>
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