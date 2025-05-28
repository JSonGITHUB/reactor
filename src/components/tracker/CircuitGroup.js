import React, { useState, useEffect, useContext, useRef } from 'react';
import Circuit from './Circuit';
import getKey from '../utils/KeyGenerator';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import { CircuitContext } from '../context/CircuitContext';
import CircuitGroupNavigation from './CircuitGroupNavigation';
import CircuitGroupEditTitle from './CircuitGroupEditTitle';
import initCircuitTracking from './initCircuitTracking';
import initializeData from './initializeData';
import validate from '../utils/validate';

const CircuitGroup = () => {

    const {
        circuits,
        setCircuits,
        sort,
        targetElementRef,
        scrollToBottom,
        groupIndex,
        setGroupIndex,
        group,
        setGroup,
        deleteGroup,
        addCircuit
    } = useContext(CircuitContext);

    const [collapsed, setCollapsed] = useState();
    const [edit, setEdit] = useState(false);
    const isEditedCircuitGroupTitle = () => (edit) ? true : false;
    const [editedCircuitGroupTitle, setEditedCircuitGroupTitle] = useState(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    const [circuitGroup, setCircuitGroup] = useState(circuits[0].circuits[groupIndex]);

    const focusTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    };
    useEffect(() => {
        focusTextarea();
    }, [editedCircuitGroupTitle, cursorPosition]);
    useEffect(() => {
        console.log(`CircuitGroup => sort: ${sort}`);
        console.log(`CircuitGroup => groupIndex: ${groupIndex}`);
        console.log(`CircuitGroup => group: ${group}`);
    }, []);
    
    useEffect(() => {
        if (groupIndex >= 0 && circuits[0].circuits[groupIndex]) {
            const updatedCircuits = [...circuits];
            const selectedCircuitGroup = updatedCircuits[0].circuits[groupIndex];
            //console.log(`CircuitGroup => groupIndex: ${groupIndex} selectedCircuitGroup: ${JSON.stringify(selectedCircuitGroup, null, 2)} updatedCircuits: ${JSON.stringify(updatedCircuits, null, 2)}`);
            //updatedCircuits[0].circuits[groupIndex].isCollapsed = collapsed;
            //updatedCircuits[groupIndex].circuits.map((circuit, index) => circuit.isCollapsed = collapsed)
            //setCircuits(updatedCircuits);
            localStorage.setItem('circuitTracking', JSON.stringify(updatedCircuits))
            //console.log(`localStorage.setItem('circuitTracking')1`)
            //console.log(`setCollapsed => updatedCircuits: ${JSON.stringify(updatedCircuits, null, 2)}`);
            //console.log(`CircuitGroup => ${updatedCircuits[0].circuits[groupIndex].title} isCollapsed: ${updatedCircuits[0].circuits[groupIndex].isCollapsed}`);
        }
    }, [collapsed]);
    
    /* 
    useEffect(() => {
        const newCircuits = [...circuits];
        const updatedCircuits = newCircuits.map((circuitGroup, groupIndex) => {
            //if (groupIndex === groupIndex) {
            return {
                ...circuitGroup,
                isCollapsed: collapsed,
                circuits: circuitGroup.circuits.map((circuit) => ({
                    ...circuit,
                    isCollapsed: collapsed,
                }))
            };
            //}
            //return circuitGroup;
        });
        //console.log(`setCollapsed => updatedCircuits: ${updatedCircuits.map((circuitGroup, groupIndex) => circuitGroup.circuits.map((circuit) => (circuit.isCollapsed)))}`);
        localStorage.setItem('circuitTracking', JSON.stringify(updatedCircuits));
        //console.log(`setCollapsed => updatedCircuits: ${JSON.stringify(updatedCircuits, null, 2)}`);
    }, [collapsed]);
    */
    const toggleEdit = () => {
        const toggle = (edit)
            ? false
            : true;
        const wasCircuitGroupTitleEdited = (circuitGroup.title !== editedCircuitGroupTitle) ? true : false;
        setEdit(toggle);
        setEditedCircuitGroupTitle((toggle) ? circuitGroup.title : '');
        if (!toggle && wasCircuitGroupTitleEdited) {
            const updatedCircuits = [...circuits];
            const selectedNewCircuitGroup = updatedCircuits[0].circuits[groupIndex];
            selectedNewCircuitGroup.title = (wasCircuitGroupTitleEdited) ? editedCircuitGroupTitle : selectedNewCircuitGroup.title;
            setCircuits(updatedCircuits);
        }
    }
    const handleChange = (e) => {
        setEditedCircuitGroupTitle(e.target.value)
        setCursorPosition(e.target.selectionStart);
    };
    const addToGroup = (groupIndex, elementRef) => {
        addCircuit(groupIndex)
        scrollToBottom(elementRef);
    }
    //console.log(`CircuitGroup => ${circuitGroup.title} circuitGroup.display: ${circuitGroup.display}`);
    //console.log(`CircuitGroup => circuitGroup: ${JSON.stringify(circuitGroup, null, 2)}`);
    return (
        (circuitGroup)
        ? <div key={getKey(`circuit${groupIndex}`)} ref={targetElementRef}>
            <div className=''>
                <div className='containerBox flexContainer bg-lite'>
                    <div className='flex1Auto'>
                        {
                            (isEditedCircuitGroupTitle())
                            ? <CircuitGroupEditTitle
                                circuitGroup={circuitGroup}
                                groupIndex={groupIndex}
                                textareaRef={textareaRef}
                                handleChange={handleChange}
                                editedCircuitGroupTitle={editedCircuitGroupTitle}
                                toggleEdit={toggleEdit}
                            />
                            : (circuitGroup) 
                                ? <Circuit
                                    circuit={circuitGroup}
                                    circuitGroupIndex={0}
                                    circuitIndex={groupIndex}
                                />
                                : null
                        }
                    </div>
                </div>
                {
                    (collapsed)
                    ? null
                    : <CircuitGroupNavigation
                        groupIndex={groupIndex}
                        addToGroup={addToGroup}
                        deleteGroup={deleteGroup}
                    />
                }
                
            </div>
        </div>
        : null
    )
}
export default CircuitGroup;