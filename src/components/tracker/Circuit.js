import React, { useState, useEffect, useContext } from 'react';
import EditableTextField from '../utils/EditableTextField';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import { CircuitContext } from '../context/CircuitContext';
import CircuitHeader from './CircuitHeader';
import CircuitEditTitleNav from './CircuitEditTitleNav';
import CircuitEditTitle from './CircuitEditTitle';
import CircuitNavigation from './CircuitNavigation';
import CircuitField from './CircuitField';
import TimeSelectors from '../utils/TimeSelectors';
import initCircuitTracking from './initCircuitTracking';
import initializeData from './initializeData';

const Circuit = ({
    circuitGroupIndex,
    circuitIndex,
    circuit
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

    const [collapsed, setCollapsed] = useState();
    const [editTitle, setEditTitle] = useState(false);
    const [editCircuit, setEditCircuit] = useState(false);
    const [editTodaysGoals, setEditTodaysGoals] = useState(false);
    const [editedCircuit, setEditedCircuit] = useState(null);
    const [editedCircuitTitle, setEditedCircuitTitle] = useState(null);
    const [editedTodaysGoals, setEditedTodaysGoals] = useState(null);

    const templateCircuit = {
        title: 'Empty...',
        description: 'Empty...',
        circuit: 'Empty...',
        excersizes: [],
        isCollapsed: false
    }
    /* 
    useEffect(() => {
        if (collapsed) {
            const newCircuits = [...circuits];
            const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex] ?? templateCircuit;
            selectedNewCircuit.isCollapsed = collapsed;
            const stringifiedData = JSON.stringify(newCircuits);
            localStorage.setItem('circuitTracking', stringifiedData);
            //alert(`Circuit => title: ${selectedNewCircuit.title} collapsed: ${collapsed}`);
            //setCircuits(newCircuits);
        }
    }, [collapsed]);
    */
    useEffect(() => {
        const newCircuits = [...circuits];
        const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
        console.log(`Circuit => ${selectedNewCircuit.title}.isCollapsed: ${JSON.stringify(selectedNewCircuit.isCollapsed)}`);
        //setCollapsed((selectedNewCircuit.isCollapsed == {}) ? false : selectedNewCircuit.isCollapsed);
        setCollapsed(false);
    }, []);
    const toggleEditTitle = () => {
        const toggleTitle = (editTitle) ? false : true;
        const wasCircuitTitleEdited = (circuit.title !== editedCircuitTitle) ? true : false;
        setEditTitle(toggleTitle);
        setEditedCircuitTitle((toggleTitle) ? circuit.title : '');
        if (!toggleTitle && wasCircuitTitleEdited) {
            const newCircuits = [...circuits];
            const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
            selectedNewCircuit.title = (wasCircuitTitleEdited) ? editedCircuitTitle : selectedNewCircuit.title;
            setCircuits(newCircuits);
        }
    }
    const toggleEditCircuit = () => {
        setActivated(false);
        const toggleCircuit = (editCircuit) ? false : true;
        const wasCircuitEdited = (circuit.description !== editedCircuit) ? true : false;
        setEditCircuit(toggleCircuit);
        setEditedCircuit((toggleCircuit) ? circuit.description : '');
        if (!toggleCircuit && wasCircuitEdited) {
            const newCircuits = [...circuits];
            const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
            selectedNewCircuit.description = (wasCircuitEdited) ? editedCircuit : selectedNewCircuit.description;
            setCircuits(newCircuits);
        }
    }
    const toggleEditTodaysGoals = () => {
        const toggleTodaysGoals = (editTodaysGoals) ? false : true;
        const wasTodaysGoalsEdited = (circuit.excersizes !== editedTodaysGoals) ? true : false;
        setEditTodaysGoals(toggleTodaysGoals);
        setEditedTodaysGoals((toggleTodaysGoals) ? circuit.excersizes : '');
        if (!toggleTodaysGoals && wasTodaysGoalsEdited) {
            const newCircuits = [...circuits];
            const selectedNewCircuit = newCircuits[circuitGroupIndex].circuits[circuitIndex];
            selectedNewCircuit.excersizes = (wasTodaysGoalsEdited) ? editedTodaysGoals : selectedNewCircuit.excersizes;
            setCircuits(newCircuits);
        }
    }

    return <div key={`circuit${circuitIndex}`} className='containerBox lowerBorder contentLeft'>
        <div className='containerBox bg-lite'>
            <div className='flexContainer'>
                <div className='flex1Auto contentLeft'>
                    {
                        (editTitle)
                            ? <CircuitEditTitle
                                circuit={circuit}
                                editedCircuitTitle={editedCircuitTitle}
                                setEditedCircuitTitle={setEditedCircuitTitle}
                            />
                            : <div className='containerBox bg-lite centerVertical p-20 bold color-yellow'>
                                <CollapseToggleButton
                                    title={`${circuit.title}`}
                                    isCollapsed={collapsed}
                                    setCollapse={setCollapsed}
                                    align='left'
                                    editTitle={toggleEditTitle}
                                />
                            </div>
                    }
                </div>
                <CircuitEditTitleNav
                    editTitle={editTitle}
                    toggleEditTitle={toggleEditTitle}
                />
            </div>
            {
                (collapsed)
                ? null
                : <EditableTextField
                    data={circuit.description}
                    toggle={toggleEditCircuit}
                    edit={editCircuit}
                    setEdited={setEditedCircuit}
                    edited={editedCircuit}
                />
            }
            {
                (collapsed)
                ? null
                : <CircuitNavigation
                    circuit={circuit}
                    circuitGroupIndex={circuitGroupIndex}
                    circuitIndex={circuitIndex}
                    toggleEditCircuit={toggleEditCircuit}
                    editCircuit={editCircuit}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    setActivated={setActivated}
                />
            }
        </div>
        {
            (collapsed)
            ? null
            : <div>
                <CircuitHeader
                    header='Goals for today:'
                    circuits={circuits}
                    setCircuits={setCircuits}
                    circuitGroupIndex={circuitGroupIndex}
                    circuitIndex={circuitIndex}
                />
                <TimeSelectors
                    circuit={circuit}
                    circuitGroupIndex={circuitGroupIndex}
                    circuitIndex={circuitIndex}
                />
                <CircuitField
                    circuit={circuit}
                    circuitGroupIndex={circuitGroupIndex}
                    circuitIndex={circuitIndex}
                    editCircuit={editCircuit}
                    isEdit={editTodaysGoals}
                    setEdited={setEditedTodaysGoals}
                    edited={editedTodaysGoals}
                    data={circuit.excersizes}
                    toggleEdit={toggleEditTodaysGoals}
                    category='excercises'
                />
            </div>
        }
    </div>
}
export default Circuit;