import React, { useState, useEffect, useRef, useMemo } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
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
    const [expandedImage, setExpandedImage] = useState(null);
    const [expandedVideo, setExpandedVideo] = useState(null);
    const [isImageEditMode, setIsImageEditMode] = useState(false);
    const [isVideoEditMode, setIsVideoEditMode] = useState(false);
    const [isImageRowCollapsed, setIsImageRowCollapsed] = useState(true);
    const [isVideoRowCollapsed, setIsVideoRowCollapsed] = useState(true);
    const [isPhotoPanelCollapsed, setIsPhotoPanelCollapsed] = useState(true);
    const [isVideoPanelCollapsed, setIsVideoPanelCollapsed] = useState(true);
    const [isSlideshow, setIsSlideshow] = useState(false);
    const [slideshowDelay, setSlideshowDelay] = useState(2);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const photoRef = useRef([]);
    const videoRef = useRef([]);

    const notePhotos = Array.isArray(note?.photos) ? note.photos : [];
    const noteVideos = Array.isArray(note?.videos) ? note.videos : [];
    if (!note.photos) {
        note.photos = [];
    }
    if (!note.videos) {
        note.videos = [];
    }

    // Memoize photo IDs to provide stable dependency for useEffect
    const photoIdsDep = useMemo(() => {
        const current = note?.photos?.map(p => p?.id) || [];
        return current.join('|');
    }, [note?.photos]);

    // Memoize video IDs to provide stable dependency for useEffect
    const videoIdsDep = useMemo(() => {
        const current = note?.videos?.map(v => v?.id) || [];
        return current.join('|');
    }, [note?.videos]);

    const photoInputId = `note-photo-${noteGroupIndex}-${noteIndex}`;
    const videoInputId = `note-video-${noteGroupIndex}-${noteIndex}`;

    const safeCreateObjectUrl = (file) => {
        if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
            return '';
        }
        return URL.createObjectURL(file);
    };

    const safeRevokeObjectUrl = (url) => {
        if (url && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(url);
        }
    };

    const buildPhotoId = ({ name, size, lastModified, webkitRelativePath, relativePath }) => {
        const path = String(webkitRelativePath || relativePath || '').replace(/\\/g, '/');
        return `${path || name}-${size}-${lastModified}`;
    };

    const buildVideoId = ({ name, size, lastModified, webkitRelativePath, relativePath }) => {
        const path = String(webkitRelativePath || relativePath || '').replace(/\\/g, '/');
        return `${path || name}-${size}-${lastModified}`;
    };

    const isImageLikeFile = (file) => {
        const mime = String(file?.type || '').toLowerCase();
        if (mime.startsWith('image/')) return true;
        return /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i.test(String(file?.name || ''));
    };

    const isVideoLikeFile = (file) => {
        const mime = String(file?.type || '').toLowerCase();
        if (mime.startsWith('video/')) return true;
        return /\.(mp4|m4v|mov|webm|ogv|avi|mkv|3gp|3g2)$/i.test(String(file?.name || ''));
    };

    const handlePhotoFiles = async (fileList) => {
        const files = Array.from(fileList || []).filter(isImageLikeFile);
        if (files.length === 0) return;

        const nextPhotos = [...notePhotos];
        const existing = new Set(nextPhotos.map((photo) => photo.id));

        files.forEach((file) => {
            const id = buildPhotoId(file);
            if (existing.has(id)) return;

            const photo = {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                url: safeCreateObjectUrl(file),
                blob: file,
            };

            nextPhotos.push(photo);

            if (isAssistantPhotoDbAvailable()) {
                persistAssistantPhoto(id, file).catch((error) => {
                    console.error('Unable to persist note photo:', error);
                });
            }
        });

        const newNotes = [...notes];
        newNotes[noteGroupIndex].notes[noteIndex].photos = nextPhotos;
        setNotes(newNotes);
    };

    const removePhoto = (photoId) => {
        const nextPhotos = notePhotos.filter((photo) => photo.id !== photoId);
        const newNotes = [...notes];
        const selectedNote = newNotes[noteGroupIndex].notes[noteIndex];
        const removed = selectedNote.photos?.find((photo) => photo.id === photoId);
        if (removed?.url) {
            safeRevokeObjectUrl(removed.url);
        }
        selectedNote.photos = nextPhotos;
        if (expandedImage?.id === photoId) {
            setExpandedImage(null);
        }
        setNotes(newNotes);

        if (isAssistantPhotoDbAvailable()) {
            removeAssistantPhoto(photoId).catch((error) => {
                console.error('Unable to remove note photo:', error);
            });
        }
    };

    const handleVideoFiles = async (fileList) => {
        const files = Array.from(fileList || []).filter(isVideoLikeFile);
        if (files.length === 0) return;

        const nextVideos = [...noteVideos];
        const existing = new Set(nextVideos.map((video) => video.id));

        files.forEach((file) => {
            const id = buildVideoId(file);
            if (existing.has(id)) return;

            const video = {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                url: safeCreateObjectUrl(file),
            };

            nextVideos.push(video);

            if (isVideoDbAvailable()) {
                persistNoteVideoBlob({
                    id: video.id,
                    name: video.name,
                    size: video.size,
                    type: video.type,
                    lastModified: video.lastModified,
                    blob: file,
                }).catch((error) => {
                    console.error('Unable to persist note video:', error);
                });
            }
        });

        const newNotes = [...notes];
        newNotes[noteGroupIndex].notes[noteIndex].videos = nextVideos;
        videoRef.current = nextVideos;
        setNotes(newNotes);
    };

    const removeVideo = (videoId) => {
        const nextVideos = noteVideos.filter((video) => video.id !== videoId);
        const newNotes = [...notes];
        const selectedNote = newNotes[noteGroupIndex].notes[noteIndex];
        const removed = selectedNote.videos?.find((video) => video.id === videoId);
        if (removed?.url) {
            safeRevokeObjectUrl(removed.url);
        }
        selectedNote.videos = nextVideos;
        if (expandedVideo?.id === videoId) {
            setExpandedVideo(null);
        }
        videoRef.current = nextVideos;
        setNotes(newNotes);

        if (isVideoDbAvailable()) {
            removeNoteVideoBlob(videoId).catch((error) => {
                console.error('Unable to remove note video:', error);
            });
        }
    };

    const toggleImageRow = () => {
        setIsImageRowCollapsed((prev) => !prev);
    };

    const toggleVideoRow = () => {
        setIsVideoRowCollapsed((prev) => !prev);
    };

    useEffect(() => {
        if (note.note === '') {
            toggleEditNote();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const newNotes = [...notes];
        newNotes[noteGroupIndex].notes[noteIndex].isCollapsed = collapsed;
        const dataToString = JSON.stringify(newNotes);
        localStorage.setItem('noteTracking', dataToString);
    }, [collapsed, noteGroupIndex, noteIndex, notes]);

    useEffect(() => {
        let active = true;
        const restorePhotos = async () => {
            const raw = notePhotos.filter(p => p && p.id);
            if (raw.length === 0) {
                photoRef.current.forEach((photo) => {
                    if (photo?.url) URL.revokeObjectURL(photo.url);
                });
                if (photoRef.current.length > 0) {
                    photoRef.current = [];
                }
                return;
            }
            if (!isAssistantPhotoDbAvailable()) {
                photoRef.current.forEach((photo) => {
                    if (photo?.url) URL.revokeObjectURL(photo.url);
                });
                if (photoRef.current.length > 0) {
                    photoRef.current = [];
                }
                return;
            }

            const currentById = new Map(
                (photoRef.current || []).map((photo) => [photo.id, photo])
            );
            const restored = [];
            const createdUrls = [];
            for (const photo of raw) {
                const existing = currentById.get(photo.id);
                if (existing?.url) {
                    restored.push({
                        ...photo,
                        url: existing.url,
                    });
                    continue;
                }
                try {
                    const blob = await getAssistantPhotoBlob(photo.id);
                    if (!blob) continue;
                    const url = URL.createObjectURL(blob);
                    createdUrls.push(url);
                    restored.push({
                        ...photo,
                        url,
                    });
                } catch (error) {
                    console.error('Unable to restore note photo:', error);
                }
            }

            if (!active) {
                createdUrls.forEach((url) => URL.revokeObjectURL(url));
                return;
            }

            const reusedUrls = new Set(restored.map((photo) => photo.url));
            photoRef.current.forEach((photo) => {
                if (photo?.url && !reusedUrls.has(photo.url)) {
                    URL.revokeObjectURL(photo.url);
                }
            });

            // Only update state if IDs changed to prevent infinite loop
            const currentIds = (photoRef.current || []).map(photo => photo.id).join(',');
            const newIds = restored.map(photo => photo.id).join(',');
            if (currentIds !== newIds) {
                photoRef.current = restored;
                const newNotes = [...notes];
                newNotes[noteGroupIndex].notes[noteIndex].photos = restored;
                setNotes(newNotes);
            }
        };

        restorePhotos();

        return () => {
            active = false;
        };
    }, [photoIdsDep, noteGroupIndex, noteIndex, notes]);

    useEffect(() => {
        let active = true;
        const restoreVideos = async () => {
            const raw = noteVideos.filter(v => v && v.id);
            if (raw.length === 0) {
                videoRef.current.forEach((video) => {
                    if (video?.url) URL.revokeObjectURL(video.url);
                });
                if (videoRef.current.length > 0) {
                    videoRef.current = [];
                }
                return;
            }
            if (!isVideoDbAvailable()) {
                videoRef.current.forEach((video) => {
                    if (video?.url) URL.revokeObjectURL(video.url);
                });
                if (videoRef.current.length > 0) {
                    videoRef.current = [];
                }
                return;
            }

            const currentById = new Map(
                (videoRef.current || []).map((video) => [video.id, video])
            );
            const restored = [];
            const createdUrls = [];
            for (const video of raw) {
                const existing = currentById.get(video.id);
                if (existing?.url) {
                    restored.push({
                        ...video,
                        url: existing.url,
                    });
                    continue;
                }
                try {
                    const blob = await getNoteVideoBlob(video.id);
                    if (!blob) continue;
                    const url = URL.createObjectURL(blob);
                    createdUrls.push(url);
                    restored.push({
                        ...video,
                        url,
                    });
                } catch (error) {
                    console.error('Unable to restore note video:', error);
                }
            }

            if (!active) {
                createdUrls.forEach((url) => URL.revokeObjectURL(url));
                return;
            }

            const reusedUrls = new Set(restored.map((video) => video.url));
            videoRef.current.forEach((video) => {
                if (video?.url && !reusedUrls.has(video.url)) {
                    URL.revokeObjectURL(video.url);
                }
            });

            // Only update state if IDs changed to prevent infinite loop
            const currentIds = (videoRef.current || []).map(video => video.id).join(',');
            const newIds = restored.map(video => video.id).join(',');
            if (currentIds !== newIds) {
                videoRef.current = restored;
                const newNotes = [...notes];
                newNotes[noteGroupIndex].notes[noteIndex].videos = restored;
                setNotes(newNotes);
            }
        };

        restoreVideos();

        return () => {
            active = false;
        };
    }, [videoIdsDep, noteGroupIndex, noteIndex, notes]);

    useEffect(() => {
        if (!isSlideshow || !expandedImage || notePhotos.length === 0) {
            return;
        }

        const currentIndex = notePhotos.findIndex((photo) => photo.id === expandedImage.id);
        const isLastPhoto = currentIndex === notePhotos.length - 1;

        const timer = setInterval(() => {
            const updatedIndex = notePhotos.findIndex((photo) => photo.id === expandedImage.id);
            const updatedIsLast = updatedIndex === notePhotos.length - 1;
            
            if (updatedIsLast) {
                // Auto-close slideshow and fullscreen when reaching the last photo
                setIsSlideshow(false);
                setIsFullscreen(false);
            } else {
                const nextIndex = (updatedIndex + 1) % notePhotos.length;
                setExpandedImage(notePhotos[nextIndex]);
            }
        }, slideshowDelay * 1000);

        return () => clearInterval(timer);
    }, [isSlideshow, expandedImage, slideshowDelay, notePhotos]);

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
                            <div className='containerDetail mt-10 bg-lite'>
                                <CollapseToggleButton
                                    component={(
                                        <div className='flexContainer'>
                                            <label htmlFor={photoInputId} className='flexColumn containerDetail bg-yellow button bg-lite color-dark size12 p-10' data-collapse-ignore='true'>
                                                ➕📷
                                                <input
                                                    id={photoInputId}
                                                    type='file'
                                                    accept='image/*'
                                                    multiple
                                                    aria-label='Add note photo'
                                                    style={{ display: 'none' }}
                                                    onChange={(event) => {
                                                        handlePhotoFiles(event.target.files);
                                                        event.target.value = '';
                                                    }}
                                                />
                                            </label>
                                            {notePhotos.length > 0 && (
                                                <div className='flexColumn ml-5'>
                                                    <div
                                                        className='containerDetail button bg-lite color-yellow p-10 size12'
                                                        onClick={() => setIsImageEditMode((prev) => !prev)}
                                                        title={isImageEditMode ? 'Hide remove buttons' : 'Show remove buttons'}
                                                        style={{ fontWeight: 600, minWidth: 48, textAlign: 'center' }}
                                                    >
                                                        ✏️
                                                    </div>
                                                </div>
                                            )}
                                            <div className='flex2Column p-10'>{`Photos (${notePhotos.length})`}</div>
                                        </div>
                                    )}
                                    isCollapsed={isPhotoPanelCollapsed}
                                    setCollapse={setIsPhotoPanelCollapsed}
                                    align='left'
                                />
                                {!isPhotoPanelCollapsed && (
                                    <div className='p-10 pt-0'>
                                        {notePhotos.length > 0 && (
                                            <>
                                                {expandedImage && (() => {
                                                    const expandedIndex = notePhotos.findIndex((photo) => photo.id === expandedImage.id);
                                                    const canGoPrev = expandedIndex > 0;
                                                    const canGoNext = expandedIndex < notePhotos.length - 1;

                                                    return (
                                                        <div 
                                                            className={`containerDetail ${isFullscreen ? '' : 'bg-dark mb-10'}`}
                                                            style={isFullscreen ? {
                                                                position: 'fixed',
                                                                top: 50,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                width: '100%',
                                                                height: 'calc(100% - 50px)',
                                                                backgroundColor: '#000',
                                                                zIndex: 10000,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                overflow: 'hidden',
                                                            } : {
                                                                width: '100%',
                                                                boxSizing: 'border-box',
                                                            }}
                                                            onClick={(e) => {
                                                                if (isFullscreen && e.target === e.currentTarget) {
                                                                    setIsFullscreen(false);
                                                                }
                                                            }}
                                                        >
                                                            {!isFullscreen && (
                                                                <div className='flexContainer centerVertical p-5'>
                                                                    <div
                                                                        className='button p-10 size20 color-soft'
                                                                        onClick={() => canGoPrev && setExpandedImage(notePhotos[expandedIndex - 1])}
                                                                        style={{
                                                                            opacity: canGoPrev ? 1 : 0.3,
                                                                            pointerEvents: canGoPrev ? 'auto' : 'none',
                                                                            minWidth: 48,
                                                                            textAlign: 'center',
                                                                        }}
                                                                        title='Previous'
                                                                    >
                                                                        ◀
                                                                    </div>
                                                                    <div className='color-soft size12 contentCenter' style={{ flex: 1 }}>
                                                                        {expandedImage.name} ({expandedIndex + 1} / {notePhotos.length})
                                                                    </div>
                                                                    <div
                                                                        className='button p-10 size20 color-soft'
                                                                        onClick={() => canGoNext && setExpandedImage(notePhotos[expandedIndex + 1])}
                                                                        style={{
                                                                            opacity: canGoNext ? 1 : 0.3,
                                                                            pointerEvents: canGoNext ? 'auto' : 'none',
                                                                            minWidth: 48,
                                                                            textAlign: 'center',
                                                                        }}
                                                                        title='Next'
                                                                    >
                                                                        ▶
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {!isFullscreen && (
                                                                <div className='flexContainer centerVertical p-5' style={{ gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                                    <div
                                                                        className={`containerDetail button p-8 size12 ${isSlideshow ? 'bg-dark color-lite' : 'bg-dark color-lite'}`}
                                                                        onClick={() => {
                                                                            setIsSlideshow(!isSlideshow);
                                                                            if (!isSlideshow) {
                                                                                setIsFullscreen(true);
                                                                            }
                                                                        }}
                                                                        title={isSlideshow ? 'Stop slideshow' : 'Start slideshow'}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        {isSlideshow ? '⏸ Slideshow' : '▶ Slideshow'}
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        <label htmlFor='slideshow-delay' className='color-soft size12' style={{ margin: 0 }}>
                                                                            Delay:
                                                                        </label>
                                                                        <select
                                                                            id='slideshow-delay'
                                                                            value={slideshowDelay}
                                                                            onChange={(e) => setSlideshowDelay(Number(e.target.value))}
                                                                            className='size12 p-5'
                                                                            style={{
                                                                                backgroundColor: '#2a2a2a',
                                                                                color: '#ccc',
                                                                                border: '1px solid #555',
                                                                                borderRadius: 4,
                                                                                padding: 6,
                                                                                cursor: 'pointer',
                                                                            }}
                                                                        >
                                                                            <option value={1}>1s</option>
                                                                            <option value={2}>2s</option>
                                                                            <option value={3}>3s</option>
                                                                            <option value={4}>4s</option>
                                                                            <option value={5}>5s</option>
                                                                            <option value={8}>8s</option>
                                                                            <option value={10}>10s</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <img
                                                                src={expandedImage.url}
                                                                alt={expandedImage.name || 'Expanded note photo'}
                                                                className={`${isFullscreen ? '' : 'mb-20 mt-10 width-100-percent'}`}
                                                                onClick={() => {
                                                                    if (isFullscreen) {
                                                                        setIsFullscreen(false);
                                                                    }
                                                                }}
                                                                style={{
                                                                    ...(isFullscreen ? {
                                                                        maxWidth: '90vw',
                                                                        maxHeight: '90vh',
                                                                        width: 'auto',
                                                                        height: 'auto',
                                                                        objectFit: 'contain',
                                                                        cursor: 'pointer',
                                                                    } : {
                                                                        width: '100%',
                                                                        maxWidth: '100%',
                                                                        height: 'auto',
                                                                        display: 'block',
                                                                        margin: '0 auto',
                                                                    }),
                                                                    transition: 'opacity 0.6s ease-in-out',
                                                                    opacity: 1,
                                                                }}
                                                            />
                                                            {isFullscreen && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: 10,
                                                                    right: 10,
                                                                    color: '#fff',
                                                                    fontSize: 28,
                                                                    cursor: 'pointer',
                                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                                    width: 40,
                                                                    height: 40,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    borderRadius: 4,
                                                                    zIndex: 10001,
                                                                }}
                                                                    onClick={() => setIsFullscreen(false)}
                                                                    title='Close fullscreen (ESC)'
                                                                >
                                                                    ✕
                                                                </div>
                                                            )}
                                                            {isFullscreen && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    bottom: 12,
                                                                    left: 142,
                                                                    color: '#fff',
                                                                    fontSize: 14,
                                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                                    padding: '8px 12px',
                                                                    borderRadius: 4,
                                                                    zIndex: 10001,
                                                                }}>
                                                                    {expandedImage.name} ({expandedIndex + 1} / {notePhotos.length})
                                                                </div>
                                                            )}
                                                            {isFullscreen && (
                                                                <>
                                                                    <div
                                                                        className='button'
                                                                        onClick={() => canGoPrev && setExpandedImage(notePhotos[expandedIndex - 1])}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            left: 10,
                                                                            bottom: 10,
                                                                            fontSize: 28,
                                                                            color: '#fff',
                                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                                            width: 40,
                                                                            height: 40,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            borderRadius: 4,
                                                                            cursor: canGoPrev ? 'pointer' : 'default',
                                                                            opacity: canGoPrev ? 1 : 0.3,
                                                                            pointerEvents: canGoPrev ? 'auto' : 'none',
                                                                            zIndex: 10001,
                                                                        }}
                                                                        title='Previous'
                                                                    >
                                                                        ◀
                                                                    </div>
                                                                    <div
                                                                        className={`containerDetail button ${isSlideshow ? 'bg-neogreen' : 'bg-dark'}`}
                                                                        onClick={() => {
                                                                            setIsSlideshow(!isSlideshow);
                                                                        }}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            left: 100,
                                                                            bottom: 12,
                                                                            transform: 'translateX(-50%)',
                                                                            fontSize: 14,
                                                                            color: isSlideshow ? '#ccc' : '#ccc',
                                                                            backgroundColor: isSlideshow ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.5)',
                                                                            padding: '8px 16px',
                                                                            borderRadius: 4,
                                                                            cursor: 'pointer',
                                                                            zIndex: 10001,
                                                                            fontWeight: 'bold',
                                                                        }}
                                                                        title={isSlideshow ? 'Stop slideshow' : 'Start slideshow'}
                                                                    >
                                                                        {isSlideshow ? '⏸ Slideshow' : '▶ Slideshow'}
                                                                    </div>
                                                                    <div
                                                                        className='button'
                                                                        onClick={() => canGoNext && setExpandedImage(notePhotos[expandedIndex + 1])}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            right: 10,
                                                                            bottom: 10,
                                                                            fontSize: 28,
                                                                            color: '#fff',
                                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                                            width: 40,
                                                                            height: 40,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            borderRadius: 4,
                                                                            cursor: canGoNext ? 'pointer' : 'default',
                                                                            opacity: canGoNext ? 1 : 0.3,
                                                                            pointerEvents: canGoNext ? 'auto' : 'none',
                                                                            zIndex: 10001,
                                                                        }}
                                                                        title='Next'
                                                                    >
                                                                        ▶
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                                <div
                                                    className='flexContainer mt--5'
                                                    style={{
                                                        flexWrap: (isImageRowCollapsed ?? true) ? 'nowrap' : 'wrap',
                                                        gap: 8,
                                                        overflowX: (isImageRowCollapsed ?? true) ? 'auto' : 'visible',
                                                        overflowY: 'hidden',
                                                        paddingBottom: (isImageRowCollapsed ?? true) ? 6 : 0,
                                                    }}
                                                >
                                                    {notePhotos.map((photo, index) => (
                                                        <div key={`${photo.id || index}`} style={{ position: 'relative', width: 64, height: 64, flex: '0 0 auto' }}>
                                                            <img
                                                                src={photo.url}
                                                                alt={photo.name || `Note photo ${index + 1}`}
                                                                title={`${photo.name || 'Photo'}${photo.size ? ` (${Math.round(photo.size / 1024)} KB)` : ''}`}
                                                                onClick={() => {
                                                                    if (expandedImage?.id === photo.id) {
                                                                        setExpandedImage(null);
                                                                        setIsFullscreen(false);
                                                                        setIsSlideshow(false);
                                                                    } else {
                                                                        setExpandedImage(photo);
                                                                        setIsFullscreen(true);
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    borderRadius: 4,
                                                                    display: 'block',
                                                                    cursor: 'pointer',
                                                                    border: expandedImage?.id === photo.id ? '2px solid #0f0' : '2px solid transparent',
                                                                }}
                                                            />
                                                            {isImageEditMode && (
                                                                <div
                                                                    className='button'
                                                                    onClick={() => removePhoto(photo.id)}
                                                                    title='Remove image'
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: 2,
                                                                        right: 2,
                                                                        background: 'rgba(0,0,0,0.65)',
                                                                        color: '#fff',
                                                                        borderRadius: '50%',
                                                                        width: 20,
                                                                        height: 20,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: 12,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    ✕
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className='containerDetail mt-10 bg-lite'>
                                <CollapseToggleButton
                                    component={(
                                        <div className='flexContainer centerVertical contentLeft'>
                                            <div className='flexColumn contentLeft'>
                                                <label htmlFor={videoInputId} className='flexColumn containerDetail bg-yellow button bg-lite color-dark size12 p-10' data-collapse-ignore='true'>
                                                    ➕🎥
                                                    <input
                                                        id={videoInputId}
                                                        type='file'
                                                        accept='video/*'
                                                        multiple
                                                        aria-label='Add note video'
                                                        style={{ display: 'none' }}
                                                        onChange={(event) => {
                                                            handleVideoFiles(event.target.files);
                                                            event.target.value = '';
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            {noteVideos.length > 0 && (
                                                <div className='flexColumn ml-5 flexContainer' style={{ alignItems: 'center', gap: 8 }}>
                                                    <div
                                                        className='containerDetail button bg-lite color-yellow p-10 size12'
                                                        onClick={() => setIsVideoEditMode((prev) => !prev)}
                                                        title={isVideoEditMode ? 'Hide remove buttons' : 'Show remove buttons'}
                                                        style={{ fontWeight: 600, minWidth: 48, textAlign: 'center' }}
                                                    >
                                                        ✏️
                                                    </div>
                                                </div>
                                            )}
                                            <div className='flex2Column ml-10 mr-10'>
                                                {`Videos (${noteVideos.length})`}
                                            </div>
                                        </div>
                                    )}
                                    isCollapsed={isVideoPanelCollapsed}
                                    setCollapse={setIsVideoPanelCollapsed}
                                    align='left'
                                />
                                {!isVideoPanelCollapsed && (
                                    <div className='p-10 pt-0'>
                                        {noteVideos.length > 0 && (
                                            <>
                                                {expandedVideo && (() => {
                                                    const expandedIndex = noteVideos.findIndex((video) => video.id === expandedVideo.id);
                                                    const canGoPrev = expandedIndex > 0;
                                                    const canGoNext = expandedIndex < noteVideos.length - 1;

                                                    return (
                                                        <div className='containerDetail bg-dark mb-10' style={{ width: '100%', boxSizing: 'border-box' }}>
                                                            <div className='flexContainer centerVertical p-5'>
                                                                <div
                                                                    className='button p-10 size20 color-soft'
                                                                    onClick={() => canGoPrev && setExpandedVideo(noteVideos[expandedIndex - 1])}
                                                                    style={{
                                                                        opacity: canGoPrev ? 1 : 0.3,
                                                                        pointerEvents: canGoPrev ? 'auto' : 'none',
                                                                        minWidth: 48,
                                                                        textAlign: 'center',
                                                                    }}
                                                                    title='Previous'
                                                                >
                                                                    ◀
                                                                </div>
                                                                <div className='color-soft size12 contentCenter' style={{ flex: 1 }}>
                                                                    {expandedVideo.name} ({expandedIndex + 1} / {noteVideos.length})
                                                                </div>
                                                                <div
                                                                    className='button p-10 size20 color-soft'
                                                                    onClick={() => canGoNext && setExpandedVideo(noteVideos[expandedIndex + 1])}
                                                                    style={{
                                                                        opacity: canGoNext ? 1 : 0.3,
                                                                        pointerEvents: canGoNext ? 'auto' : 'none',
                                                                        minWidth: 48,
                                                                        textAlign: 'center',
                                                                    }}
                                                                    title='Next'
                                                                >
                                                                    ▶
                                                                </div>
                                                            </div>
                                                            <video
                                                                src={expandedVideo.url}
                                                                controls
                                                                playsInline
                                                                autoPlay
                                                                preload='metadata'
                                                                className='mb-20 mt-10 width-100-percent'
                                                                style={{
                                                                    width: '100%',
                                                                    maxWidth: '100%',
                                                                    height: 'auto',
                                                                    display: 'block',
                                                                    margin: '0 auto',
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })()}

                                                <div
                                                    className='flexContainer mt--5'
                                                    style={{
                                                        flexWrap: (isVideoRowCollapsed ?? true) ? 'nowrap' : 'wrap',
                                                        gap: 8,
                                                        overflowX: (isVideoRowCollapsed ?? true) ? 'auto' : 'visible',
                                                        overflowY: 'hidden',
                                                        paddingBottom: (isVideoRowCollapsed ?? true) ? 6 : 0,
                                                    }}
                                                >
                                                    {noteVideos.map((video, index) => (
                                                        <div
                                                            key={`${video.id || index}`}
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                event.stopPropagation();
                                                                setExpandedVideo(expandedVideo?.id === video.id ? null : video);
                                                            }}
                                                            style={{
                                                                position: 'relative',
                                                                width: 72,
                                                                height: 72,
                                                                flex: '0 0 auto',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <video
                                                                src={video.url}
                                                                title={video.name}
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    event.stopPropagation();
                                                                    setExpandedVideo(expandedVideo?.id === video.id ? null : video);
                                                                }}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    borderRadius: 4,
                                                                    display: 'block',
                                                                    border: expandedVideo?.id === video.id ? '2px solid #0f0' : '2px solid transparent',
                                                                    cursor: 'pointer',
                                                                }}
                                                                muted
                                                            />
                                                            {isVideoEditMode && (
                                                                <div
                                                                    className='button'
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        removeVideo(video.id);
                                                                    }}
                                                                    title='Remove video'
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: 2,
                                                                        right: 2,
                                                                        background: 'rgba(0,0,0,0.65)',
                                                                        color: '#fff',
                                                                        borderRadius: '50%',
                                                                        width: 20,
                                                                        height: 20,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: 12,
                                                                        lineHeight: 1,
                                                                    }}
                                                                >
                                                                    ✕
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='containerDetail m-5 size20 flexContainer contentRight'>
                            <div
                                title={(isEditedNote())?'save':'edit'}
                                className={`rt-25 t-0 ml-5 r-10 size20 button pl-20 contentRight ${(isEditedNote()) ? '' : 'pt-10 pr-20 bg-lite'}`}
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
                                className='rt-25 t-0 ml-5 r-10 size20 button pl-20 pb-10 contentRight pt-10 pr-20 bg-lite bold' 
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