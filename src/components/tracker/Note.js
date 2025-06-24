
import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const Note = ({
    notes,
    setNotes,
    noteGroupIndex,
    noteIndex,
    note
}) => {

    const [collapsed, setCollapsed] = useState(note.isCollapsed);
    const [editTitle, setEditTitle] = useState(false);
    const [editNote, setEditNote] = useState(false);
    const [editedNote, setEditedNote] = useState(null);
    const [editedNoteTitle, setEditedNoteTitle] = useState(null);

    useEffect(() => {
        if (note.note === '') {
            toggleEditNote();
        }
    }, []);

    useEffect(() => {
        const newNotes = [...notes];
        newNotes[noteGroupIndex].notes[noteIndex].isCollapsed = collapsed;
        const dataToString = JSON.stringify(newNotes);
        localStorage.setItem('noteTracking', dataToString);
    }, [collapsed]);

    const isEditedTitle = () => (editTitle) ? true : false;
    const isEditedNote = () => (editNote) ? true : false;
    const toggleEditTitle = () => {
        const toggleTitle = (editTitle)
            ? false
            : true;
        const wasNoteTitleEdited = (note.title !== editedNoteTitle) ? true : false;
        setEditTitle(toggleTitle);
        setEditedNoteTitle((toggleTitle) ? note.title : '');
        if (!toggleTitle && wasNoteTitleEdited) {
            const newNotes = [...notes];
            const selectedNewNote = newNotes[noteGroupIndex].notes[noteIndex];
            selectedNewNote.description = (wasNoteTitleEdited) ? editedNoteTitle : selectedNewNote.description;
            setNotes(newNotes);
        }
    }
    const toggleEditNote = () => {
        const toggleNote = (editNote)
            ? false
            : true;
        const wasNoteEdited = (note.note !== editedNote) ? true : false;
        setEditNote(toggleNote);
        setEditedNote((toggleNote) ? note.note : '');
        if (!toggleNote && wasNoteEdited) {
            const newNotes = [...notes];
            const selectedNewNote = newNotes[noteGroupIndex].notes[noteIndex];
            selectedNewNote.note = (wasNoteEdited) ? editedNote : selectedNewNote.note;   
            setNotes(newNotes);
        }
    }
    const deleteNote = () => {
        const toggle = window.confirm(`Are you sure you want to remove note: ${note.description}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error("Index out of range");
            }
        };
        if (toggle) {
            const newNotes = [...notes];
            removeItemByIndex(newNotes[noteGroupIndex].notes, noteIndex);
            setNotes(newNotes);
        }
    }

    return <div key={`note${noteIndex}`} className='containerBox lowerBorder contentLeft'>
                <div className='containerBox flexContainer bg-lite'>
                    <div className='flex1Auto contentLeft'>
                        {
                            (isEditedTitle())
                                ? <textarea
                                    className='inputField ht-55 size20 r-10 bold color-lite'
                                    onChange={(e) => setEditedNoteTitle(e.target.value)}
                                    value={(editedNoteTitle !== null) ? editedNoteTitle : note.description}
                                    placeholder={note.description}
                                >
                                    {note.description}
                                </textarea>
                                : <div className='containerBox bg-lite centerVertical p-20'>
                                        <CollapseToggleButton
                                            title={note.description}
                                            isCollapsed={collapsed}
                                            setCollapse={setCollapsed}
                                            align='left'
                                            editTitle={toggleEditTitle}
                                        />
                                    </div>
                        }
                    </div>
                    {
                        (isEditedTitle())
                        ? <div
                                title='save' 
                                className='containerBox p-15 bg-neogreen color-dark bold size15' 
                                onClick={() => toggleEditTitle()}
                            >
                                save
                            </div>
                        : null
                    }
                </div>
                {
                    (collapsed)
                    ? null
                    : <div>
                        <div className='containerBox'>
                            <div className='containerBox p-20 mt-10 color-soft button'>
                                {
                                    (isEditedNote())
                                    ? <textarea
                                        className='inputField size20 r-10 height-200'
                                        onChange={(e) => setEditedNote(e.target.value)}
                                        value={(editedNote !== null) ? editedNote : note.note}
                                        placeholder={editedNote}
                                    >
                                        {editedNote}
                                    </textarea>
                                    : <div onClick={() => toggleEditNote()}>
                                            {note.note.split('\n').map((line, index) => (
                                                <React.Fragment key={`note${index}`}>
                                                    {line}
                                                    {<br />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                }
                            </div>
                        </div>
                        <div className='containerBox flexContainer contentRight'>
                            <div
                                title={(isEditedNote())?'save':'edit'}
                                className={`rt-25 t-0 ml-5 mt-5 r-10 size20 button pl-20 contentRight ${(isEditedNote()) ? '' : 'pt-10 pr-20 bg-lite'}`}
                                onClick={() => toggleEditNote()}
                            >
                                {
                                    (isEditedNote())
                                    ? <div className='r-10 p-10 bg-neogreen color-dark bold'>save</div>
                                    : <div className='mb-10 size20'>{icons.edit}</div>
                                }
                            </div>
                            <div 
                                title='delete'
                                className='rt-25 t-0 ml-5 mt-5 r-10 size20 button pl-20 pb-10 contentRight pt-10 pr-20 bg-lite bold' 
                                onClick={() => deleteNote()}
                            >
                                {icons.delete}
                            </div>
                        </div>
                    </div>
                }
            </div>
}
export default Note;