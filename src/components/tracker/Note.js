import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import MediaPhotoGallery from '../utils/MediaPhotoGallery';
import MediaVideoGallery from '../utils/MediaVideoGallery';
import {
    persistAssistantPhoto,
    removeAssistantPhoto,
    getAssistantPhotoBlob,
    isAssistantPhotoDbAvailable,
} from '../utils/assistantPhotoDb';

const isVideoDbAvailable = () => typeof indexedDB !== 'undefined';

const NOTE_VIDEO_DB_NAME = 'kfa-note-video-db';
const NOTE_VIDEO_DB_VERSION = 1;
const NOTE_VIDEO_STORE_NAME = 'note-videos';

const openNoteVideoDb = () => new Promise((resolve, reject) => {
    if (!isVideoDbAvailable()) {
        reject(new Error('IndexedDB is not available in this browser context.'));
        return;
    }

    const request = indexedDB.open(NOTE_VIDEO_DB_NAME, NOTE_VIDEO_DB_VERSION);

    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(NOTE_VIDEO_STORE_NAME)) {
            db.createObjectStore(NOTE_VIDEO_STORE_NAME, { keyPath: 'id' });
        }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open note video database.'));
});

const persistNoteVideoBlob = async (record) => {
    const db = await openNoteVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(NOTE_VIDEO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(NOTE_VIDEO_STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to persist note video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Note video transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Note video transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const removeNoteVideoBlob = async (id) => {
    const db = await openNoteVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(NOTE_VIDEO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(NOTE_VIDEO_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to remove note video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Note video delete transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Note video delete transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const getNoteVideoBlob = async (id) => {
    const db = await openNoteVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(NOTE_VIDEO_STORE_NAME, 'readonly');
        const store = transaction.objectStore(NOTE_VIDEO_STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result?.blob || null);
        request.onerror = () => reject(request.error || new Error('Failed to read note video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Note video read transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Note video read transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

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

    const notePhotos = Array.isArray(note?.photos) ? note.photos : [];
    const noteVideos = Array.isArray(note?.videos) ? note.videos : [];
    if (!note.photos) {
        note.photos = [];
    }
    if (!note.videos) {
        note.videos = [];
    }

    const photoInputId = `note-photo-${noteGroupIndex}-${noteIndex}`;
    const videoInputId = `note-video-${noteGroupIndex}-${noteIndex}`;

    const isEditedTitle = () => editTitle;
    const isEditedNote = () => editNote;

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

    return <div key={`note${noteIndex}`} className='containerDetail m-5 size20 lowerBorder contentLeft bg-lite'>
                <div className='containerDetail m-5 size20 flexContainer'>
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
                                : <div className='size20 p-10 color-orange'>
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
                                className='containerDetail m-5 size20 p-15 bg-neogreen color-dark bold size15' 
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
                        <div className='containerDetail m-5 size20 p-20 color-soft button'>
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
                        <div className='containerDetail m-5 size20 pl-10 pr-10 pb-10'>
                            <MediaPhotoGallery
                                photos={notePhotos}
                                onPhotosChange={(nextPhotos) => {
                                    const newNotes = [...notes];
                                    newNotes[noteGroupIndex].notes[noteIndex].photos = nextPhotos;
                                    setNotes(newNotes);
                                }}
                                onPersistPhoto={(id, file) =>
                                    persistAssistantPhoto(id, file).catch((error) => {
                                        console.error('Unable to persist note photo:', error);
                                    })
                                }
                                onRemovePhoto={(id) =>
                                    removeAssistantPhoto(id).catch((error) => {
                                        console.error('Unable to remove note photo:', error);
                                    })
                                }
                                onGetPhotoBlob={(id) =>
                                    getAssistantPhotoBlob(id).catch((error) => {
                                        console.error('Unable to retrieve note photo:', error);
                                        return null;
                                    })
                                }
                                inputId={photoInputId}
                            />
                            <MediaVideoGallery
                                videos={noteVideos}
                                onVideosChange={(nextVideos) => {
                                    const newNotes = [...notes];
                                    newNotes[noteGroupIndex].notes[noteIndex].videos = nextVideos;
                                    setNotes(newNotes);
                                }}
                                onPersistVideo={(id, file, metadata) =>
                                    persistNoteVideoBlob({
                                        id,
                                        name: metadata.name,
                                        size: metadata.size,
                                        type: metadata.type,
                                        lastModified: metadata.lastModified,
                                        blob: file,
                                    }).catch((error) => {
                                        console.error('Unable to persist note video:', error);
                                    })
                                }
                                onRemoveVideo={(id) =>
                                    removeNoteVideoBlob(id).catch((error) => {
                                        console.error('Unable to remove note video:', error);
                                    })
                                }
                                onGetVideoBlob={(id) =>
                                    getNoteVideoBlob(id).catch((error) => {
                                        console.error('Unable to retrieve note video:', error);
                                        return null;
                                    })
                                }
                                inputId={videoInputId}
                            />
                        </div>
                    </div>
                }
            </div>
}
export default Note;