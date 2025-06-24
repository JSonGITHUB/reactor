import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import Note from './Note';
import getKey from '../utils/KeyGenerator';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const NoteGroup = ({
    notes,
    setNotes,
    noteGroup,
    noteGroupIndex,
    deleteGroup,
    addNote,
    targetElementRef,
    scrollToBottom
}) => {
    const [collapsed, setCollapsed] = useState(noteGroup.isCollapsed);
    const [edit, setEdit] = useState(false);
    const isEditedNoteGroupTitle = () => (edit) ? true : false;
    const [editedNoteGroupTitle, setEditedNoteGroupTitle] = useState(null);

    useEffect(() => {
        const newNotes = [...notes];
        newNotes[noteGroupIndex].isCollapsed = collapsed;
        let dataToString = JSON.stringify(newNotes);
        localStorage.setItem('projects', dataToString);
    }, [collapsed]);

    const toggleEdit = () => {
        const toggle = (edit)
            ? false
            : true;
        const wasNoteGroupTitleEdited = (noteGroup.title !== editedNoteGroupTitle) ? true : false;
        setEdit(toggle);
        setEditedNoteGroupTitle((toggle) ? noteGroup.title : '');
        if (!toggle && wasNoteGroupTitleEdited) {
            const newNotes = [...notes];
            const selectedNewNoteGroup = newNotes[noteGroupIndex];
            selectedNewNoteGroup.title = (wasNoteGroupTitleEdited) ? editedNoteGroupTitle : selectedNewNoteGroup.title;
            setNotes(newNotes);
        }
    }
    const toggleCollapse = () => {
        const collapse = !collapsed;
        const newNotes = [...notes];
        const selectedNewNoteGroup = newNotes[noteGroupIndex];
        selectedNewNoteGroup.isCollapsed = collapse;
        setNotes(newNotes);
        setCollapsed(collapse);
    }
    const addToGroup = (noteGroupIndex, elementRef) => {
        if (collapsed) {
            toggleCollapse();
        }
        addNote(noteGroupIndex)
        //setScroll(noteGroupIndex * 50);
        scrollToBottom(elementRef);
    }
    return (
        (noteGroup.display && noteGroup.display === true)
        ? <div key={`note${noteGroupIndex}`} className='containerBox' ref={targetElementRef}>
                <div className='containerBox'>
                    <div className='containerBox bg-lite'>
                        <div className='bold size25 color-yellow'>
                            {
                                (isEditedNoteGroupTitle())
                                    ? <div className='containerBox flexContainer'>
                                            <div className='flex2Column'>
                                                <textarea
                                                    className='inputField ht-55 size25 r-10 color-yellow bold'
                                                    onChange={(e) => setEditedNoteGroupTitle(e.target.value)}
                                                    value={(editedNoteGroupTitle !== null) ? editedNoteGroupTitle : noteGroup.title}
                                                    placeholder={editedNoteGroupTitle}
                                                >
                                                    {editedNoteGroupTitle}
                                                </textarea>
                                            </div>
                                            <div
                                                title='save' 
                                                className='containerBox flexColumn p-15 bg-neogreen color-dark bold button' 
                                                onClick={() => toggleEdit(noteGroupIndex)}
                                            >
                                                save
                                            </div>
                                        </div>
                                    : <div className='containerBox bg-lite centerVertical p-20 bold size25 color-yellow'>
                                        <CollapseToggleButton
                                            title={noteGroup.title}
                                            isCollapsed={collapsed}
                                            setCollapse={setCollapsed}
                                            align='left'
                                            editTitle={toggleEdit}
                                        />
                                    </div>
                            }
                        </div>
                    </div>
                    {
                        (collapsed) 
                        ? null 
                        : <div className='containerBox'>
                            <div className='flexContainer contentRight'>
                                <div
                                    title='add to group'
                                    className='r-10 p-10 bg-lite button color-lite centeredContent'
                                    onClick={() => addToGroup(noteGroupIndex, targetElementRef)}
                                >
                                    <div className='flexContainer'>
                                        <div className='flex2Column text-outline-light size20 mt-5'>
                                            {icons.plus}
                                        </div>
                                        <div className='flex2Column p-5 size25'>
                                            {icons.session}
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    title='delete group'
                                    className='pt-15 pb-15 pr-20 pl-20 rt-25 t-0 ml-5 r-10 size20 bg-lite bold button width50px centeredContent' 
                                    onClick={() => deleteGroup(noteGroupIndex)}
                                >
                                    {icons.delete}
                                </div>
                            </div>
                        </div>
                    }
                    <div>
                        {
                            (collapsed) 
                            ? null 
                            : noteGroup.notes.map((note, noteIndex) => (
                                <div key={getKey(`note${noteIndex}`)}>
                                    <Note
                                        notes={notes}
                                        setNotes={setNotes}
                                        noteGroupIndex={noteGroupIndex} 
                                        noteIndex={noteIndex}
                                        note={note}
                                    />
                                </div>
                        ))}
                    </div>
                </div>
        </div>
        : null
    )
}
export default NoteGroup;