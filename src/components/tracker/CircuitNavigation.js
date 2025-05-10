import React, { useContext } from 'react';
import icons from '../site/icons';
import { CircuitContext } from '../context/CircuitContext';
import initCircuitTracking from './initCircuitTracking';
import initializeData from './initializeData';

const CircuitNavigation = ({
    circuit,
    circuitGroupIndex,
    circuitIndex,
    toggleEditCircuit,
    editCircuit
}) => {

    const {
        circuits,
        setCircuits,
        setActiveIndex,
        setActivated,
        setExcersizeTime,
        setRestTime,
        edit,
        setEdit
    } = useContext(CircuitContext);

    const deleteCircuit = () => {
        const toggle = window.confirm(`Are you sure you want to remove circuit: ${circuit.title}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error('Index out of range');
            }
        };
        if (toggle) {
            const newCircuits = [...circuits];
            removeItemByIndex(newCircuits[circuitGroupIndex].circuits, circuitIndex);
            setCircuits(newCircuits);
        }
    }
    const resetCircuitGroup = () => {
        const newCircuits = [...circuits];
        const totalTime = Number(newCircuits[circuitGroupIndex].circuits[circuitIndex].time);
        const totalRestTime = Number(newCircuits[circuitGroupIndex].circuits[circuitIndex].restTime);
        console.log(`setExcersizeTime(totalTime: ${totalTime}, circuitGroupIndex: ${circuitGroupIndex}, circuitIndex: ${circuitIndex})`)
        setExcersizeTime(
            totalTime,
            circuitGroupIndex,
            circuitIndex
        )
        console.log(`setRestTime(totalRestTime: ${totalRestTime}, circuitGroupIndex: ${circuitGroupIndex}, circuitIndex: ${circuitIndex})`)
        setRestTime(
            totalRestTime,
            circuitGroupIndex,
            circuitIndex
        );
    }
    const playCircuitGroup = () => {
        setActiveIndex(`sessionindex${0}groupIndex${circuitGroupIndex}subgroupIndex${circuitIndex}`);
        setActivated(true);
    }

    return <div>
        <div className='flexContainer'>
            <div className='containerBox flex4Column p-20 button contentCenter'>
                <div 
                    title='start'
                    onClick={
                    () => playCircuitGroup()
                }>
                    {icons.play}
                </div>
            </div>
            <div className='containerBox flex4Column p-20 button contentCenter'>
                <div 
                    title='restart' 
                    onClick={
                        () => resetCircuitGroup()
                    }
                >
                    {icons.restart}
                </div>
            </div>
            <div className='containerBox flex4Column p-20 button contentCenter'>
                <div title={(editCircuit) ? 'save' : 'edit'} onClick={() => toggleEditCircuit()}>
                    {
                        (editCircuit)
                            ? <div className='color-neogreen bold'>save</div>
                            : icons.edit
                    }
                </div>
            </div>
            <div
                title='delete' 
                className='containerBox flex4Column p-20 button contentCenter'
                onClick={() => deleteCircuit()}
            >
                {icons.delete}
            </div>
        </div>
    </div>
}

export default CircuitNavigation;