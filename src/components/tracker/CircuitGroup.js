import React, { useState, useEffect, useContext, useRef } from 'react';
import Circuit from './Circuit';
import { CircuitContext } from '../context/CircuitContext';
import CircuitGroupNavigation from './CircuitGroupNavigation';
import CircuitGroupEditTitle from './CircuitGroupEditTitle';

const CircuitGroup = () => {

    const {
        circuits,
        setCircuits,
        targetElementRef,
        scrollToBottom,
        groupIndex,
        deleteGroup,
        addCircuit
    } = useContext(CircuitContext);

    const [edit, setEdit] = useState(false);
    const isEditedCircuitGroupTitle = () => (edit) ? true : false;
    const [editedCircuitGroupTitle, setEditedCircuitGroupTitle] = useState(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);
    const [circuitGroup] = useState(circuits[0].circuits[groupIndex]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [editedCircuitGroupTitle, cursorPosition]);
    
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
        localStorage.setItem('circuitTracking', JSON.stringify(updatedCircuits));
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
    const collapsed = circuitGroup?.isCollapsed;
    return (
        (circuitGroup)
        ? <div key={`circuit-${groupIndex}-${String(circuitGroup?.title || 'group')}`} ref={targetElementRef}>
            <div className=''>
                <div className='flexContainer'>
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