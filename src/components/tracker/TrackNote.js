import React, { useEffect } from 'react';
import initNoteTracking from './initNoteTracking';
import NoteGroup from './NoteGroup';
import getKey from '../utils/KeyGenerator';
import initializeData from '../utils/InitializeData';

const TrackNote = ({
    notes,
    setNotes,
    targetElementRef,
    scrollToBottom
}) => {

    useEffect(() => {
        if ((notes === null) && (initializeData('noteTracking', null) === null)) {
            setNotes(initNoteTracking);
        }
        localStorage.setItem('noteTracking', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        console.log(`notes1: ${JSON.stringify(notes, null, 2)}`)
        console.log(`notes2: ${localStorage.getItem('noteTracking')}`)
        const storedNotes = (notes !== null) ? notes : initializeData('noteTracking', initNoteTracking);
        console.log(`storedNotes: ${JSON.stringify(storedNotes, null, 2)}`)
        if (storedNotes) {
            setNotes(storedNotes);
        } else {
            setNotes(initNoteTracking);
        }
    }, []);

    const notNull = (value) => (value !== null) ? true : false;
    const notEmpty = (value) => (value !== "") ? true : false;
    const isGood = (value) => (notNull(value) && notEmpty(value)) ? true : false;

    const addNote = (noteGroupIndex, noteIndex) => {
        const updatedNotes = [...notes];
        const noteDescription = prompt('Note description:', '');
        //const note = prompt('Note:', '');
        const newNote = {
            description: noteDescription,
            //note: note
            note: ''
        }
        if (isGood(noteDescription)/* || isGood(note)*/) {
            updatedNotes[noteGroupIndex].notes.push(newNote)
            setNotes(updatedNotes);
        }

    };

    const deleteGroup = (noteGroupIndex) => {
        const toggle = window.confirm(`Are you sure you want to remove note group ${notes[noteGroupIndex].title}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error("Index out of range");
            }
        };
        if (toggle) {
            const newNotes = [...notes];
            removeItemByIndex(newNotes, noteGroupIndex);
            setNotes(newNotes);
        }
    }

    return (
            <div>
                {notes.map((noteGroup, noteGroupIndex) => (
                    <div key={getKey(`noteGroup${noteGroupIndex}`)}>
                        <NoteGroup
                            notes={notes}
                            setNotes={setNotes}
                            noteGroup={noteGroup}
                            noteGroupIndex={noteGroupIndex}
                            deleteGroup={deleteGroup}
                            addNote={addNote}
                            //setScroll={setScroll}
                            targetElementRef={targetElementRef}
                            scrollToBottom={scrollToBottom}
                        />
                    </div>
                ))}
            </div>
    )
}

export default TrackNote