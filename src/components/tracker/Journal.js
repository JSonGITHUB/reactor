import React, { useState, useEffect, useRef, useMemo } from 'react';
import { persistAssistantPhoto, getAssistantPhotoBlob, removeAssistantPhoto, isAssistantPhotoDbAvailable } from '../utils/assistantPhotoDb';
import icons from '../site/icons';
import EditableTextField from '../utils/EditableTextField';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';
import GoalDialog from '../utils/GoalDialog';

// Utility functions
const ifUndefinedString = (value) => (validate(value) === null) ? 'empty...' : value;
const ifUndefinedArray = (value) => (validate(value) === null) ? [] : value;
const isVideoDbAvailable = () => typeof indexedDB !== 'undefined';

const JOURNAL_VIDEO_DB_NAME = 'kfa-journal-video-db';
const JOURNAL_VIDEO_DB_VERSION = 1;
const JOURNAL_VIDEO_STORE_NAME = 'journal-videos';

const openJournalVideoDb = () => new Promise((resolve, reject) => {
    if (!isVideoDbAvailable()) {
        reject(new Error('IndexedDB is not available in this browser context.'));
        return;
    }

    const request = indexedDB.open(JOURNAL_VIDEO_DB_NAME, JOURNAL_VIDEO_DB_VERSION);

    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(JOURNAL_VIDEO_STORE_NAME)) {
            db.createObjectStore(JOURNAL_VIDEO_STORE_NAME, { keyPath: 'id' });
        }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open journal video database.'));
});

const persistJournalVideoBlob = async (record) => {
    const db = await openJournalVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(JOURNAL_VIDEO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(JOURNAL_VIDEO_STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to persist journal video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Journal video transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Journal video transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const getJournalVideoBlob = async (id) => {
    const db = await openJournalVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(JOURNAL_VIDEO_STORE_NAME, 'readonly');
        const store = transaction.objectStore(JOURNAL_VIDEO_STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result?.blob || null);
        request.onerror = () => reject(request.error || new Error('Failed to read journal video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Journal video read transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Journal video read transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const removeJournalVideoBlob = async (id) => {
    const db = await openJournalVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(JOURNAL_VIDEO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(JOURNAL_VIDEO_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to remove journal video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Journal video delete transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Journal video delete transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const Journal = ({
    journals,
    setJournals,
    journalGroupIndex,
    journalIndex,
    journal
}) => {
    const [isCollapsed, setIsCollapsed] = useState();
    const [editTitle, setEditTitle] = useState();
    const [editJournal, setEditJournal] = useState();
    const [editFeelings, setEditFeelings] = useState();
    const [editTodaysGoals, setEditTodaysGoals] = useState();
    const [editFutureGoals, setEditFutureGoals] = useState();
    const [editGratefulFor, setEditGratefulFor] = useState();
    const [editedJournal, setEditedJournal] = useState('');
    const [editedJournalTitle, setEditedJournalTitle] = useState('');
    const [editedFeelings, setEditedFeelings] = useState(journal.feelings ?? '');
    const [editedTodaysGoals, setEditedTodaysGoals] = useState([]);
    const [editedFutureGoals, setEditedFutureGoals] = useState([]);
    const [editedGratefulFor, setEditedGratefulFor] = useState('');
    const [goalDialog, setGoalDialog] = useState();
    const [editCategory, setEditCategory] = useState();
    const [editIndex, setEditIndex] = useState();
    const [selectedGoal, setSelectedGoal] = useState();
    const [entryImages, setEntryImages] = useState([]);
    const [entryVideos, setEntryVideos] = useState([]);
    const [expandedImage, setExpandedImage] = useState(null);
    const [expandedVideo, setExpandedVideo] = useState(null);
    const [isImageEditMode, setIsImageEditMode] = useState(false);
    const [isVideoEditMode, setIsVideoEditMode] = useState(false);
    const [isImageRowCollapsed, setIsImageRowCollapsed] = useState(true);
    const [isVideoRowCollapsed, setIsVideoRowCollapsed] = useState(true);
    const [isPhotoDbAvailable, setIsPhotoDbAvailable] = useState(true);
    const [isVideoDbAvail, setIsVideoDbAvail] = useState(true);
    const imageFileInputRef = useRef(null);
    const videoFileInputRef = useRef(null);
    const entryImagesRef = useRef([]);
    const entryVideosRef = useRef([]);

    const templateJournal = {
        description: 'Empty...',
        journal: 'Empty...',
        feelings: 'Empty...',
        todaysGoals: [],
        futureGoals: [],
        gratefulFor: 'Empty...',
        entryImages: [],
        entryVideos: [],
        isCollapsed: false
    };

    const normalizeGoals = (value) => {
        if (!Array.isArray(value)) return [];
        return value
            .map(item => {
                if (Array.isArray(item)) {
                    return { goal: item[0] ?? '', completed: Boolean(item[1]) };
                }
                if (typeof item === 'string') {
                    return { goal: item, completed: false };
                }
                if (item && typeof item === 'object') {
                    return { goal: item.goal ?? '', completed: Boolean(item.completed) };
                }
                return null;
            })
            .filter(Boolean);
    };

    const buildImageId = ({ name, size, lastModified, webkitRelativePath, relativePath }) => {
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

    const formatBytes = (bytes) => {
        if (!Number.isFinite(bytes) || bytes <= 0) return '--';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex += 1;
        }
        return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
    };

    const toMediaMeta = (item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        type: item.type,
        lastModified: item.lastModified,
    });

    const mergeMediaMeta = (...lists) => {
        const merged = [];
        const seen = new Set();
        lists.forEach((list) => {
            if (!Array.isArray(list)) return;
            list.forEach((item) => {
                if (!item || !item.id || seen.has(item.id)) return;
                seen.add(item.id);
                merged.push(item);
            });
        });
        return merged;
    };

    const selectedJournalPrimary = journals?.[journalGroupIndex]?.journal?.[journalIndex];
    const selectedJournalMirror = journals?.[journalGroupIndex]?.journals?.[journalIndex];

    // Memoize image IDs to provide stable dependency for useEffect
    const imageIdsDep = useMemo(() => {
        const primary = journal?.entryImages?.map(i => i?.id) || [];
        const mirrorPrimary = selectedJournalPrimary?.entryImages?.map(i => i?.id) || [];
        const mirrorMirror = selectedJournalMirror?.entryImages?.map(i => i?.id) || [];
        return `${primary.join('|')}|${mirrorPrimary.join('|')}|${mirrorMirror.join('|')}`;
    }, [journal?.entryImages, selectedJournalPrimary?.entryImages, selectedJournalMirror?.entryImages]);

    // Memoize video IDs to provide stable dependency for useEffect
    const videoIdsDep = useMemo(() => {
        const primary = journal?.entryVideos?.map(v => v?.id) || [];
        const mirrorPrimary = selectedJournalPrimary?.entryVideos?.map(v => v?.id) || [];
        const mirrorMirror = selectedJournalMirror?.entryVideos?.map(v => v?.id) || [];
        return `${primary.join('|')}|${mirrorPrimary.join('|')}|${mirrorMirror.join('|')}`;
    }, [journal?.entryVideos, selectedJournalPrimary?.entryVideos, selectedJournalMirror?.entryVideos]);

    const updateJournalMedia = (field, value) => {
        const newJournals = [...journals];
        if (!newJournals[journalGroupIndex]) {
            return;
        }

        if (Array.isArray(newJournals[journalGroupIndex].journal) && newJournals[journalGroupIndex].journal[journalIndex]) {
            newJournals[journalGroupIndex].journal[journalIndex][field] = value;
        }

        if (Array.isArray(newJournals[journalGroupIndex].journals) && newJournals[journalGroupIndex].journals[journalIndex]) {
            newJournals[journalGroupIndex].journals[journalIndex][field] = value;
        }

        setJournals(newJournals);
    };

    const addEntryImages = async (fileList) => {
        const files = Array.from(fileList || []).filter(isImageLikeFile);
        if (files.length === 0) return;

        const prev = Array.isArray(entryImagesRef.current) ? entryImagesRef.current : [];
        const existing = new Set(prev.map((img) => img.id));
        const next = [...prev];

        files.forEach((file) => {
            const id = buildImageId(file);
            if (existing.has(id)) return;
            const image = {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                url: URL.createObjectURL(file),
                blob: file,
            };
            next.push(image);
            if (isPhotoDbAvailable) {
                persistAssistantPhoto(id, file).catch((error) => {
                    console.error('Unable to persist journal image:', error);
                });
            }
        });

        entryImagesRef.current = next;
        setEntryImages(next);
        updateJournalMedia('entryImages', next.map(toMediaMeta));
    };

    const removeEntryImage = (id) => {
        const prev = Array.isArray(entryImagesRef.current) ? entryImagesRef.current : [];
        const removed = prev.find((img) => img.id === id);
        const next = prev.filter((img) => img.id !== id);

        if (removed?.url) URL.revokeObjectURL(removed.url);
        if (expandedImage?.id === id) setExpandedImage(null);

        entryImagesRef.current = next;
        setEntryImages(next);
        updateJournalMedia('entryImages', next.map(toMediaMeta));

        if (isPhotoDbAvailable) {
            removeAssistantPhoto(id).catch((error) => {
                console.error('Unable to remove journal image:', error);
            });
        }
    };

    const toggleImageRow = () => {
        setIsImageRowCollapsed((prev) => !prev);
    };

    const toggleVideoRow = () => {
        setIsVideoRowCollapsed((prev) => !prev);
    };

    const addEntryVideos = (fileList) => {
        const files = Array.from(fileList || []).filter(isVideoLikeFile);
        if (files.length === 0) return;

        const prev = Array.isArray(entryVideosRef.current) ? entryVideosRef.current : [];
        const existing = new Set(prev.map((vid) => vid.id));
        const next = [...prev];

        files.forEach((file) => {
            const id = buildVideoId(file);
            if (existing.has(id)) return;
            const video = {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                url: URL.createObjectURL(file),
            };
            next.push(video);

            if (isVideoDbAvail) {
                persistJournalVideoBlob({
                    id: video.id,
                    name: video.name,
                    size: video.size,
                    type: video.type,
                    lastModified: video.lastModified,
                    blob: file,
                }).catch((error) => {
                    console.error('Unable to persist journal video:', error);
                });
            }
        });

        entryVideosRef.current = next;
        setEntryVideos(next);
        updateJournalMedia('entryVideos', next.map(toMediaMeta));
    };

    const removeEntryVideo = (id) => {
        const prev = Array.isArray(entryVideosRef.current) ? entryVideosRef.current : [];
        const removed = prev.find((vid) => vid.id === id);
        const next = prev.filter((vid) => vid.id !== id);

        if (removed?.url) URL.revokeObjectURL(removed.url);
        if (expandedVideo?.id === id) setExpandedVideo(null);

        entryVideosRef.current = next;
        setEntryVideos(next);
        updateJournalMedia('entryVideos', next.map(toMediaMeta));

        if (isVideoDbAvail) {
            removeJournalVideoBlob(id).catch((error) => {
                console.error('Unable to remove journal video:', error);
            });
        }
    };

    // Ensure journal fields are initialized
    useEffect(() => {
        const newJournals = [...journals];
        // Defensive: Make sure journalGroupIndex and journalIndex exist and are objects
        if (
            !newJournals[journalGroupIndex] ||
            !Array.isArray(newJournals[journalGroupIndex].journal)
        ) return;

        let selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];

        // If not an object, initialize it
        if (typeof selectedNewJournal !== 'object' || selectedNewJournal === null) {
            selectedNewJournal = { ...templateJournal };
            newJournals[journalGroupIndex].journal[journalIndex] = selectedNewJournal;
        }

        let dataUpdated = false;

        if (validate(selectedNewJournal.feelings) === null) {
            selectedNewJournal.feelings = '';
            dataUpdated = true;
        }
        if (validate(selectedNewJournal.todaysGoals) === null) {
            selectedNewJournal.todaysGoals = [];
            dataUpdated = true;
        } else {
            const normalized = normalizeGoals(selectedNewJournal.todaysGoals);
            if (JSON.stringify(normalized) !== JSON.stringify(selectedNewJournal.todaysGoals)) {
                selectedNewJournal.todaysGoals = normalized;
                dataUpdated = true;
            }
        }
        if (validate(selectedNewJournal.futureGoals) === null) {
            selectedNewJournal.futureGoals = [];
            dataUpdated = true;
        } else {
            const normalized = normalizeGoals(selectedNewJournal.futureGoals);
            if (JSON.stringify(normalized) !== JSON.stringify(selectedNewJournal.futureGoals)) {
                selectedNewJournal.futureGoals = normalized;
                dataUpdated = true;
            }
        }
        if (validate(selectedNewJournal.gratefulFor) === null) {
            selectedNewJournal.gratefulFor = '';
            dataUpdated = true;
        }
        if (!Array.isArray(selectedNewJournal.entryImages)) {
            selectedNewJournal.entryImages = [];
            dataUpdated = true;
        }
        if (!Array.isArray(selectedNewJournal.entryVideos)) {
            selectedNewJournal.entryVideos = [];
            dataUpdated = true;
        }
        if (dataUpdated) setJournals(newJournals);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setIsPhotoDbAvailable(isAssistantPhotoDbAvailable());
        setIsVideoDbAvail(isVideoDbAvailable());
    }, []);

    useEffect(() => {
        entryImagesRef.current = entryImages;
    }, [entryImages]);

    useEffect(() => {
        entryVideosRef.current = entryVideos;
    }, [entryVideos]);

    useEffect(() => {
        let active = true;
        const restoreImages = async () => {
            const raw = mergeMediaMeta(
                journal?.entryImages,
                selectedJournalPrimary?.entryImages,
                selectedJournalMirror?.entryImages,
            );
            if (raw.length === 0) {
                entryImagesRef.current.forEach((img) => {
                    if (img?.url) URL.revokeObjectURL(img.url);
                });
                if (entryImagesRef.current.length > 0) {
                    entryImagesRef.current = [];
                    setEntryImages([]);
                }
                return;
            }
            if (!isAssistantPhotoDbAvailable()) {
                entryImagesRef.current.forEach((img) => {
                    if (img?.url) URL.revokeObjectURL(img.url);
                });
                if (entryImagesRef.current.length > 0) {
                    entryImagesRef.current = [];
                    setEntryImages([]);
                }
                return;
            }

            const currentById = new Map(
                (entryImagesRef.current || []).map((img) => [img.id, img])
            );
            const restored = [];
            const createdUrls = [];
            for (const image of raw) {
                const existing = currentById.get(image.id);
                if (existing?.url) {
                    restored.push({
                        ...image,
                        url: existing.url,
                    });
                    continue;
                }
                try {
                    const blob = await getAssistantPhotoBlob(image.id);
                    if (!blob) continue;
                    const url = URL.createObjectURL(blob);
                    createdUrls.push(url);
                    restored.push({
                        ...image,
                        url,
                    });
                } catch (error) {
                    console.error('Unable to restore journal image:', error);
                }
            }

            if (!active) {
                createdUrls.forEach((url) => URL.revokeObjectURL(url));
                return;
            }

            const reusedUrls = new Set(restored.map((img) => img.url));
            entryImagesRef.current.forEach((img) => {
                if (img?.url && !reusedUrls.has(img.url)) {
                    URL.revokeObjectURL(img.url);
                }
            });

            // Only update state if IDs changed to prevent infinite loop
            const currentIds = (entryImagesRef.current || []).map(img => img.id).join(',');
            const newIds = restored.map(img => img.id).join(',');
            if (currentIds !== newIds) {
                entryImagesRef.current = restored;
                setEntryImages(restored);
            }
        };

        restoreImages();

        return () => {
            active = false;
        };
    }, [imageIdsDep]);

    useEffect(() => {
        let active = true;
        const restoreVideos = async () => {
            const raw = mergeMediaMeta(
                journal?.entryVideos,
                selectedJournalPrimary?.entryVideos,
                selectedJournalMirror?.entryVideos,
            );
            if (raw.length === 0) {
                entryVideosRef.current.forEach((vid) => {
                    if (vid?.url) URL.revokeObjectURL(vid.url);
                });
                if (entryVideosRef.current.length > 0) {
                    entryVideosRef.current = [];
                    setEntryVideos([]);
                }
                return;
            }
            if (!isVideoDbAvailable()) {
                entryVideosRef.current.forEach((vid) => {
                    if (vid?.url) URL.revokeObjectURL(vid.url);
                });
                if (entryVideosRef.current.length > 0) {
                    entryVideosRef.current = [];
                    setEntryVideos([]);
                }
                return;
            }

            const currentById = new Map(
                (entryVideosRef.current || []).map((vid) => [vid.id, vid])
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
                    const blob = await getJournalVideoBlob(video.id);
                    if (!blob) continue;
                    const url = URL.createObjectURL(blob);
                    createdUrls.push(url);
                    restored.push({
                        ...video,
                        url,
                    });
                } catch (error) {
                    console.error('Unable to restore journal video:', error);
                }
            }

            if (!active) {
                createdUrls.forEach((url) => URL.revokeObjectURL(url));
                return;
            }

            const reusedUrls = new Set(restored.map((vid) => vid.url));
            entryVideosRef.current.forEach((vid) => {
                if (vid?.url && !reusedUrls.has(vid.url)) {
                    URL.revokeObjectURL(vid.url);
                }
            });

            // Only update state if IDs changed to prevent infinite loop
            const currentIds = (entryVideosRef.current || []).map(vid => vid.id).join(',');
            const newIds = restored.map(vid => vid.id).join(',');
            if (currentIds !== newIds) {
                entryVideosRef.current = restored;
                setEntryVideos(restored);
            }
        };

        restoreVideos();

        return () => {
            active = false;
        };
    }, [videoIdsDep]);

    useEffect(() => {
        return () => {
            entryImagesRef.current.forEach((img) => {
                if (img?.url) URL.revokeObjectURL(img.url);
            });
            entryVideosRef.current.forEach((vid) => {
                if (vid?.url) URL.revokeObjectURL(vid.url);
            });
        };
    }, []);

    useEffect(() => {
        if (journals !== undefined && journals.length > 0) {
            localStorage.setItem('journalTracking', JSON.stringify(journals));
        }
    }, [journals]);
    useEffect(() => {
        if (editedFeelings !== undefined && editedFeelings.length > 0) {
        }
    }, [editedFeelings]);

    // Persist isCollapsed state
    useEffect(() => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex] ?? templateJournal;
        selectedNewJournal.isCollapsed = !isCollapsed;
        selectedNewJournal.isCollapsed = !isCollapsed;
        localStorage.setItem('journalTracking', JSON.stringify(newJournals));
        //setJournals(newJournals);
    }, [isCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

    // Toggle edit helpers
    //toggleEdit = (editFeelings, setEditFeelings, editedFeelings, setEditedFeelings, journal.feelings, 'feelings')
    const toggleEdit = (editState, setEditState, value, setValue, field, updateField) => {
        const toggled = (editState === undefined) ? true : !editState;
        setEditState(toggled);
        setValue(toggled ? value : '');
        if (!toggled && value !== field) {

            const newJournals = [...journals];
            if (!newJournals[journalGroupIndex] || !Array.isArray(newJournals[journalGroupIndex].journal)) {
                console.warn('toggleEdit: journal group or journal list missing');
                return;
            }
            const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];
            if (!selectedNewJournal) {
                console.warn('toggleEdit: selected journal missing');
                return;
            }
            selectedNewJournal[updateField] = value;
            setJournals(newJournals);
        }
    };

    // Goal helpers
    const addGoal = (title) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];
        const newGoal = prompt(`Add a ${title.toLowerCase().replace('goals','goal')}:`, '');
        if (newGoal) {
            const goalArray = title.toLowerCase().includes('today') ? 'todaysGoals' : 'futureGoals';
            selectedNewJournal[goalArray].push({ goal: newGoal, completed: false });
            setJournals(newJournals);
        }
    };

    const toggleCheckbox = (category, index) => {
        const newJournals = [...journals];
        const selectedNewJournal = { ...newJournals[journalGroupIndex].journal[journalIndex] };
        const goalsArray = [...selectedNewJournal[category]];

        // Defensive: Ensure the goal exists and has a completed property
        if (!goalsArray[index]) return;
        goalsArray[index] = {
            ...goalsArray[index],
            completed: !goalsArray[index].completed
        };

        selectedNewJournal[category] = goalsArray;
        newJournals[journalGroupIndex].journal[journalIndex] = {...selectedNewJournal};
        //newJournals[journalGroupIndex].isCollapsed = false;
        //newJournals[journalGroupIndex].isCollapsed = false;
        setJournals(newJournals);
    };

    const editGoal = (category, index) => {
        const newJournals = [...journals];
        const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];

        // Defensive: Ensure the goals array exists and is an array
        if (!Array.isArray(selectedNewJournal[category])) return;

        // Defensive: Ensure the goal exists at the index
        const goal = selectedNewJournal[category][index].goal;
        if (!goal) return;

        // If goal is an array [text, checked], use text, else use goal itself
        const goalText = Array.isArray(goal) ? goal : String(goal);

        const editPrompt = prompt(`Edit goal #${index + 1}:`, goalText);
        if (editPrompt != null && editPrompt.trim() !== '') {
            selectedNewJournal[category][index].goal = editPrompt;
            setJournals(newJournals);
        }
        setSelectedGoal(selectedNewJournal[category][index]);
        setEditCategory(category);
        setEditIndex(index);
        setGoalDialog(true);
    };

    const submitGoal = (updatedGoal) => {
        if (updatedGoal != null) {
            const newJournals = [...journals];
            const selectedNewJournal = newJournals[journalGroupIndex].journal[journalIndex];
            selectedNewJournal[editCategory][editIndex] = String(updatedGoal);
            setJournals(newJournals);
        }
        setSelectedGoal(null);
        setEditCategory(null);
        setEditIndex(null);
        setGoalDialog(false);
    };

    const deleteGoal = () => {
        const newJournals = [...journals];
        const arr = newJournals[journalGroupIndex].journal[journalIndex][editCategory];
        if (editIndex >= 0 && editIndex < arr.length) arr.splice(editIndex, 1);
        setJournals(newJournals);
        setEditCategory(null);
        setEditIndex(null);
        setGoalDialog(false);
        setSelectedGoal(null);
    };

    // UI helpers
    const journalHeader = (title, toggleFunction, isEdit) => (
        <div className='flexContainer containerDetail bg-lite centerVertical'>
            <div className='containerDetail p-20 flex2Column color-yellow'>{title}</div>
            <div className='flexContainer contentRight'>
                {title.toLowerCase().includes('goal') ? (
                    <div
                        title='add goal'
                        className='r-10 p-20 bg-lite button color-lite centeredContent'
                        onClick={() => addGoal(title)}
                    >
                        <div className='flexContainer'>
                            <div className='flex2Column text-outline-light size15'>{icons.plus}</div>
                            <div className='flex2Column size30 ml-5'>{icons.darts}</div>
                        </div>
                    </div>
                ) : (
                    <div
                        title={isEdit ? 'save' : 'edit'}
                        className='r-10 p-10 bg-lite button color-lite centeredContent'
                        onClick={toggleFunction}
                    >
                        {
                            isEdit
                            ? <div className='r-10 p-10 bg-lite color-neogreen button bold bg-blue'>save</div>
                            : <div className='r-10 p-10 bg-lite button'>{icons.edit}</div>
                        }
                    </div>
                )}
            </div>
        </div>
    );

    const journalField = (isEdit, setEdited, edited, data, toggleEdit, category) => {
        const renderJournalContent = () => {
            if (isEdit) {
                return (
                    <textarea
                        className='inputField size20 r-10 height-200 p-20'
                        onChange={e => setEdited(e.target.value)}
                        value={edited !== null ? edited : ifUndefinedArray(data)}
                        placeholder={edited}
                    />
                );
            }
            if (typeof data === 'string') {
                return (
                    <div onClick={toggleEdit}>
                        {ifUndefinedArray(data).split('\n').map((line, index) => (
                            <React.Fragment key={`journal-data-${journalGroupIndex}-${journalIndex}-${category}-${index}`}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </div>
                );
            }
            if (Array.isArray(data)) {
                return data.map((goal, index) => (
                    <div key={`journal-goal-${journalGroupIndex}-${journalIndex}-${category}-${index}-${String(goal?.goal || 'goal')}`} className={`containerDetail flexContainer centerVertical ${(goal.completed) ?'bg-lite':'bg-lite'}`}>
                        <div className='flexColumn contentRight'>
                            <div
                                key={`journal-goal-toggle-${journalGroupIndex}-${journalIndex}-${category}-${index}`}
                                title='toggle checkbox'
                                className='containerDetail bg-lite p-20 button'
                                onClick={() => {toggleCheckbox(category, index)}}
                            >
                                <input
                                    name='completed'
                                    className='regular-checkbox button'
                                    //checked={goal.completed}
                                    checked={journals[journalGroupIndex].journal[journalIndex][category][index].completed}
                                    type='checkbox'
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className='containerDetail flex2Column p-20'>
                            <div
                                title={goal && goal.goal ? String(goal.goal) : ''}
                                onClick={() => {
                                    // Defensive: Only call editGoal if goal exists
                                    if (goal) editGoal(category, index);
                                }}
                            >
                                {goal && goal.goal
                                ? `${index + 1}. ${journals[journalGroupIndex].journal[journalIndex][category][index].goal}`
                                : `${index + 1}. (empty goal)`
                                }
                            </div>
                        </div>
                    </div>
                ));
            }
            return null;
        };

        return (
            <div key={`journal-category-${journalGroupIndex}-${journalIndex}-${category}`}>
                <div className='color-soft button'>
                    {renderJournalContent()}
                </div>
            </div>
        );
    };

    const closeDialog = () => {
        setGoalDialog(false);
        setSelectedGoal(null);
    };
    const deleteJournal = () => {
        const toggle = window.confirm(`Are you sure you want to remove journal: ${journal.description}`)
        const removeItemByIndex = (array, index) => {
            if (index >= 0 && index < array.length) {
                array.splice(index, 1);
            } else {
                console.error('Index out of range');
            }
        };
        if (toggle) {
            const newJournals = [...journals];
            removeItemByIndex(newJournals[journalGroupIndex].journals, journalIndex);
            setJournals(newJournals);
        }
    }

    return (
        <div key={`journal${journalIndex}`} className='containerDetail lowerBorder contentLeft bg-lite'>
            <GoalDialog
                goal={selectedGoal}
                isOpen={goalDialog}
                onClose={closeDialog}
                submitGoal={submitGoal}
                deleteGoal={deleteGoal}
            />
            <div className='containerDetail bg-lite'>
                <div className='flexContainer'>
                    <div className='flex1Auto contentLeft'>
                        {
                            (editTitle)
                            ? <textarea
                                className='inputField ht-55 size20 r-10 bold color-lite'
                                onChange={e => setEditedJournalTitle(e.target.value)}
                                value={editedJournalTitle !== null ? editedJournalTitle : journal.description}
                                placeholder={journal.description}
                            />
                            : <div className='containerDetail bg-lite color-yellow centerVertical p-10 bold'>
                                <CollapseToggleButton
                                    title={journal.description}
                                    isCollapsed={isCollapsed}
                                    setCollapse={setIsCollapsed}
                                    align='left'
                                    editTitle={() => toggleEdit(editTitle, setEditTitle, editedJournalTitle, setEditedJournalTitle, journal.description, 'description')}
                                />
                            </div>
                        }
                    </div>
                    {editTitle && (
                        <div
                            title='save'
                            className='rt-25 t-0 ml-5 mt-5 r-10 size15 button pl-20 contentRight'
                            onClick={() => toggleEdit(editTitle, setEditTitle, editedJournalTitle, setEditedJournalTitle, journal.description, 'description')}
                        >
                            <div className='r-10 p-10 bg-neogreen color-dark bold'>save</div>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <div className='m-5 flexContainer contentRight'>
                        <div
                            title='delete'
                            className='r-10 p-10 bg-lite button ml-10'
                            onClick={deleteJournal}
                        >
                            {icons.delete}
                        </div>
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <div>
                    <div className='containerDetail m-5 bg-dark'>
                        {!isPhotoDbAvailable && (
                            <div className='pa-alert pa-alert-warning mb-10'>
                                Image persistence is unavailable in this browser context. Images can still be added for this session.
                            </div>
                        )}
                        <div className='containerDetail flexContainer'>
                            <label 
                                className='containerDetail flexColumn bg-yellow button bg-lite color-dark size12 p-10'
                            >                           
                                ➕📷
                                <input
                                    ref={imageFileInputRef}
                                    type='file'
                                    accept='image/*'
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        addEntryImages(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                            {entryImages.length > 0 && (
                                <div className='flex2Column ml-5 flexContainer' style={{ alignItems: 'center', gap: 8 }}>
                                    <div
                                        className='containerDetail button bg-lite color-yellow p-10 size12'
                                        onClick={() => setIsImageEditMode((prev) => !prev)}
                                        title={isImageEditMode ? 'Hide remove buttons' : 'Show remove buttons'}
                                        style={{ fontWeight: 600, minWidth: 48, textAlign: 'center' }}
                                    >
                                        ✏️
                                    </div>
                                    <div
                                        className='containerDetail button bg-lite color-yellow p-10 size12'
                                        onClick={() => toggleImageRow()}
                                        title='Toggle between wrapped grid and single-row horizontal scrolling'
                                        style={{ fontWeight: 600, letterSpacing: 0.5, maxWidth: 180 }}
                                    >
                                        {(isImageRowCollapsed ?? true) ? 'Expand Grid' : 'Collapse to Row'}
                                    </div>
                                    {expandedImage && (
                                        <div
                                            className='containerDetail button bg-lite color-yellow p-8 size12'
                                            onClick={() => setExpandedImage(null)}
                                            title='Close expanded image'
                                            style={{ marginLeft: 'auto', minWidth: 90, textAlign: 'center', fontWeight: 600 }}
                                        >
                                            Close ✕
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='color-soft size12 ml-10'>
                            {entryImages.length > 0 ? `${entryImages.length} image${entryImages.length > 1 ? 's' : ''}` : 'No images attached yet.'}
                        </div>
                        {entryImages.length > 0 && (
                            <div>
                                
                                {expandedImage && (() => {
                                    const expandedIndex = entryImages.findIndex((img) => img.id === expandedImage.id);
                                    const canGoPrev = expandedIndex > 0;
                                    const canGoNext = expandedIndex < entryImages.length - 1;

                                    return (
                                        <div className='containerDetail bg-dark mb-10' style={{ position: 'relative' }}>
                                            <div
                                                className='button p-10 size20 color-soft'
                                                onClick={() => canGoPrev && setExpandedImage(entryImages[expandedIndex - 1])}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0,
                                                    left: 8,
                                                    width: 44,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 2,
                                                    opacity: canGoPrev ? 1 : 0.3,
                                                    pointerEvents: canGoPrev ? 'auto' : 'none',
                                                }}
                                                title='Previous'
                                            >
                                                ◀
                                            </div>
                                            <div
                                                className='button p-10 size20 color-soft'
                                                onClick={() => canGoNext && setExpandedImage(entryImages[expandedIndex + 1])}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0,
                                                    right: 8,
                                                    width: 44,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 2,
                                                    opacity: canGoNext ? 1 : 0.3,
                                                    pointerEvents: canGoNext ? 'auto' : 'none',
                                                }}
                                                title='Next'
                                            >
                                                ▶
                                            </div>
                                            <img
                                                src={expandedImage.url}
                                                alt={expandedImage.name}
                                                style={{
                                                    width: 'calc(100% - 96px)',
                                                    maxWidth: 960,
                                                    height: 'auto',
                                                    margin: '0 auto',
                                                    display: 'block',
                                                    borderRadius: 4,
                                                }}
                                            />
                                            <div className='color-soft size12 p-5 contentCenter'>
                                                {expandedImage.name} ({expandedIndex + 1} / {entryImages.length})
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div
                                    className='flexContainer mt--15'
                                    style={{
                                        flexWrap: (isImageRowCollapsed ?? true) ? 'nowrap' : 'wrap',
                                        gap: 8,
                                        overflowX: (isImageRowCollapsed ?? true) ? 'auto' : 'visible',
                                        overflowY: 'hidden',
                                        paddingBottom: (isImageRowCollapsed ?? true) ? 6 : 0,
                                    }}
                                >
                                    {entryImages.map((img) => (
                                        <div key={img.id} style={{ position: 'relative', width: 64, height: 64, flex: '0 0 auto' }}>
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                title={`${img.name} (${formatBytes(img.size || 0)})`}
                                                onClick={() => {
                                                    setExpandedImage(expandedImage?.id === img.id ? null : img);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 4,
                                                    display: 'block',
                                                    cursor: 'pointer',
                                                    border: expandedImage?.id === img.id ? '2px solid #0f0' : '2px solid transparent'
                                                }}
                                            />
                                            {isImageEditMode && (
                                                <div
                                                    className='button'
                                                    onClick={() => removeEntryImage(img.id)}
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
                            </div>
                        )}
                    </div>

                    <div className='containerDetail m-5 bg-dark'>
                        {!isVideoDbAvail && (
                            <div className='pa-alert pa-alert-warning mb-10'>
                                Video persistence is unavailable in this browser context. Videos can still be added for this session.
                            </div>
                        )}
                        <div className='containerDetail flexContainer'>
                            <label 
                                className='containerDetail flexColumn bg-yellow button bg-lite color-dark size12 p-10'
                            >      
                                ➕🎥
                                <input
                                    ref={videoFileInputRef}
                                    type='file'
                                    accept='video/*'
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        addEntryVideos(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                            {entryVideos.length > 0 && (
                                <div className='flex2Column ml-5 flexContainer' style={{ alignItems: 'center', gap: 8 }}>
                                    <div
                                        className='containerDetail button bg-lite color-yellow p-10 size12'
                                        onClick={() => setIsVideoEditMode((prev) => !prev)}
                                        title={isVideoEditMode ? 'Hide remove buttons' : 'Show remove buttons'}
                                        style={{ fontWeight: 600, minWidth: 48, textAlign: 'center' }}
                                    >
                                        ✏️
                                    </div>
                                    <div
                                        className='containerDetail button bg-lite color-yellow p-10 size12'
                                        onClick={() => toggleVideoRow()}
                                        title='Toggle between wrapped grid and single-row horizontal scrolling'
                                        style={{ fontWeight: 600, letterSpacing: 0.5, maxWidth: 180 }}
                                    >
                                        {(isVideoRowCollapsed ?? true) ? 'Expand Grid' : 'Collapse to Row'}
                                    </div>
                                    {expandedVideo && (
                                        <div
                                            className='containerDetail button bg-lite color-yellow p-8 size12'
                                            onClick={() => setExpandedVideo(null)}
                                            title='Close expanded video'
                                            style={{ marginLeft: 'auto', minWidth: 90, textAlign: 'center', fontWeight: 600 }}
                                        >
                                            Close ✕
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='color-soft size12 ml-10'>
                            {entryVideos.length > 0 ? `${entryVideos.length} video${entryVideos.length > 1 ? 's' : ''}` : 'No videos attached yet.'}
                        </div>
                        {entryVideos.length > 0 && (
                            <div>
                                {expandedVideo && (() => {
                                    const expandedIndex = entryVideos.findIndex((vid) => vid.id === expandedVideo.id);
                                    const canGoPrev = expandedIndex > 0;
                                    const canGoNext = expandedIndex < entryVideos.length - 1;

                                    return (
                                        <div className='containerDetail bg-dark mb-10' style={{ position: 'relative' }}>
                                            <div
                                                className='button p-10 size20 color-soft'
                                                onClick={() => canGoPrev && setExpandedVideo(entryVideos[expandedIndex - 1])}
                                                style={{ position: 'absolute', top: 0, bottom: 0, left: 8, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, opacity: canGoPrev ? 1 : 0.3, pointerEvents: canGoPrev ? 'auto' : 'none' }}
                                                title='Previous'
                                            >
                                                ◀
                                            </div>
                                            <div
                                                className='button p-10 size20 color-soft'
                                                onClick={() => canGoNext && setExpandedVideo(entryVideos[expandedIndex + 1])}
                                                style={{ position: 'absolute', top: 0, bottom: 0, right: 8, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, opacity: canGoNext ? 1 : 0.3, pointerEvents: canGoNext ? 'auto' : 'none' }}
                                                title='Next'
                                            >
                                                ▶
                                            </div>
                                            <video
                                                src={expandedVideo.url}
                                                controls
                                                style={{ width: 'calc(100% - 96px)', maxWidth: 960, height: 'auto', margin: '0 auto', display: 'block', borderRadius: 4 }}
                                            />
                                            <div className='color-soft size12 p-5 contentCenter'>
                                                {expandedVideo.name} ({expandedIndex + 1} / {entryVideos.length})
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div
                                    className='flexContainer mt-5'
                                    style={{
                                        flexWrap: (isVideoRowCollapsed ?? true) ? 'nowrap' : 'wrap',
                                        gap: 8,
                                        overflowX: (isVideoRowCollapsed ?? true) ? 'auto' : 'visible',
                                        overflowY: 'hidden',
                                        paddingBottom: (isVideoRowCollapsed ?? true) ? 6 : 0,
                                    }}
                                >
                                    {entryVideos.map((vid) => (
                                        <div key={vid.id} style={{ position: 'relative', width: 64, height: 64, flex: '0 0 auto' }}>
                                            <video
                                                src={vid.url}
                                                title={`${vid.name} (${formatBytes(vid.size)})`}
                                                onClick={() => setExpandedVideo(expandedVideo?.id === vid.id ? null : vid)}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 4,
                                                    display: 'block',
                                                    cursor: 'pointer',
                                                    border: expandedVideo?.id === vid.id ? '2px solid #0f0' : '2px solid transparent'
                                                }}
                                                muted
                                            />
                                            {isVideoEditMode && (
                                                <div
                                                    className='button'
                                                    onClick={() => removeEntryVideo(vid.id)}
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
                            </div>
                        )}
                    </div>

                    <EditableTextField
                        title='Journal:'
                        data={journal.journal}
                        toggle={() => toggleEdit(editJournal, setEditJournal, editedJournal, setEditedJournal, journal.journal, 'journal')}
                        edit={editJournal}
                        setEdited={setEditedJournal}
                        edited={editedJournal}
                    />
                    <div className='flexContainer containerDetail bg-lite centerVertical'>
                        <div className='containerDetail flex2Column color-yellow p-20'>
                            I am...
                        </div>
                        <div className='r-10 p-10 bg-lite button color-lite centeredContent'>
                            <div
                                title={editFeelings ? 'save' : 'edit'}
                                className='button'
                                onClick={() => toggleEdit(editFeelings, setEditFeelings, editedFeelings, setEditedFeelings, journal.feelings, 'feelings')}
                            >
                                {
                                    (editFeelings)
                                    ? <div className='r-10 p-10 color-neogreen button'>
                                        save
                                    </div>
                                    : <div className='p-10 button'>
                                        {icons.edit}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className='containerDetail p-20 color-soft button'>
                        {
                            (editFeelings) 
                            ? <textarea
                                className="inputField size20 r-10 height-200"
                                onChange={e => setEditedFeelings(e.target.value)}
                                onBlur={() =>
                                    toggleEdit(
                                    editFeelings,
                                    setEditFeelings,
                                    editedFeelings,
                                    setEditedFeelings,
                                    journal.feelings,
                                    'feelings'
                                    )
                                }
                                value={editedFeelings}
                                placeholder="Enter your feelings..."
                            />
                            : <div onClick={() => toggleEdit(editFeelings, setEditFeelings, editedFeelings, setEditedFeelings, journal.feelings, 'feelings')}>
                                {ifUndefinedString(journal.feelings).split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                        }
                    </div>
                    {journalHeader('Goals for today:', () => toggleEdit(editTodaysGoals, setEditTodaysGoals, editedTodaysGoals, setEditedTodaysGoals, journal.todaysGoals, 'todaysGoals'), editTodaysGoals)}
                    {journalField(editTodaysGoals, setEditedTodaysGoals, editedTodaysGoals, journal.todaysGoals, () => toggleEdit(editTodaysGoals, setEditTodaysGoals, editedTodaysGoals, setEditedTodaysGoals, journal.todaysGoals, 'todaysGoals'), 'todaysGoals')}
                    {journalHeader('Goals for the future:', () => toggleEdit(editFutureGoals, setEditFutureGoals, editedFutureGoals, setEditedFutureGoals, journal.futureGoals, 'futureGoals'), editFutureGoals)}
                    {journalField(editFutureGoals, setEditedFutureGoals, editedFutureGoals, journal.futureGoals, () => toggleEdit(editFutureGoals, setEditFutureGoals, editedFutureGoals, setEditedFutureGoals, journal.futureGoals, 'futureGoals'), 'futureGoals')}
                    <div className='containerDetail bg-lite'>
                        <div className='flexContainer centerVertical'>
                            <div className='containerDetail p-20 flex2Column color-yellow'>I am grateful for...</div>
                            <div className='flexColumn contentRight'>
                                <div
                                    title={editGratefulFor ? 'save' : 'edit'}
                                    className='button'
                                    onClick={() => toggleEdit(editGratefulFor, setEditGratefulFor, editedGratefulFor, setEditedGratefulFor, journal.gratefulFor, 'gratefulFor')}
                                >
                                    {editGratefulFor
                                        ? <div className='r-10 p-20 bg-lite color-neogreen button bold'>save</div>
                                        : <div className='r-10 p-20 bg-lite'>{icons.edit}</div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='containerDetail'>
                        <div className='color-soft button'>
                            {editGratefulFor ? (
                                <textarea
                                    className='inputField size20 r-10 height-200 p-20'
                                    onChange={e => setEditedGratefulFor(e.target.value)}
                                    onBlur={() => toggleEdit(editGratefulFor, setEditGratefulFor, editedGratefulFor, setEditedGratefulFor, journal.gratefulFor, 'gratefulFor')}
                                    value={editedGratefulFor !== null ? editedGratefulFor : ifUndefinedString(journal.gratefulFor)}
                                    placeholder={editedGratefulFor}
                                />
                            ) : (
                                <div className='p-20' onClick={() => toggleEdit(editGratefulFor, setEditGratefulFor, editedGratefulFor, setEditedGratefulFor, journal.gratefulFor, 'gratefulFor')}>
                                    {ifUndefinedString(journal.gratefulFor).split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;