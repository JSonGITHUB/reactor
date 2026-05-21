
import React, { useEffect, useMemo, useRef, useState } from 'react';
import icons from '../site/icons';

// Easing function for smooth transitions
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

const PHOTO_DB_NAME = 'kfa-photo-db';
const PHOTO_DB_VERSION = 1;
const PHOTO_STORE_NAME = 'photos';
const PHOTO_SETTINGS_KEY = 'kfa-photo-settings-v1';

const PLAYBACK_MODE_NORMAL = 'normal';
const PLAYBACK_MODE_CONTINUOUS = 'continuous';
const PLAYBACK_MODE_SHUFFLE = 'shuffle';

const openPhotoDb = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB_NAME, PHOTO_DB_VERSION);

    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
            db.createObjectStore(PHOTO_STORE_NAME, { keyPath: 'id' });
        }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open photo database.'));
});

const getAllPersistedPhotos = async () => {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readonly');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(Array.isArray(request.result) ? request.result : []);
        };
        request.onerror = () => reject(request.error || new Error('Failed to read photos.'));
        transaction.oncomplete = () => db.close();
    });
};

const persistPhoto = async (record) => {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to persist photo.'));
        transaction.oncomplete = () => db.close();
    });
};

const removePersistedPhoto = async (id) => {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to remove photo.'));
        transaction.oncomplete = () => db.close();
    });
};

const clearPersistedPhotos = async () => {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to clear photos.'));
        transaction.oncomplete = () => db.close();
    });
};

const buildPhotoId = ({ name, size, lastModified, webkitRelativePath, relativePath }) => {
    const path = String(webkitRelativePath || relativePath || '');
    const relativePathValue = path.replace(/\\/g, '/');
    const normalizedRelativePath = String(relativePathValue || '');
    return `${normalizedRelativePath || name}-${size}-${lastModified}`;
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

const Pics = () => {
    const [photos, setPhotos] = useState([]);
    const [selectedPhotoId, setSelectedPhotoId] = useState(null);
    // For delayed transition
    const [pendingPhotoId, setPendingPhotoId] = useState(null);
    const [isSwapping, setIsSwapping] = useState(false);
    const [playbackMode, setPlaybackMode] = useState(PLAYBACK_MODE_NORMAL);
    const [isLoadingPersisted, setIsLoadingPersisted] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [playWithinFolder, setPlayWithinFolder] = useState(false);
    const [showFolderPaths, setShowFolderPaths] = useState(true);
    const [collapsedFolders, setCollapsedFolders] = useState({});
    const [isImageOnlyMode, setIsImageOnlyMode] = useState(false);
    const [imageScale, setImageScale] = useState(1);
    const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
    const [isImageInteracting, setIsImageInteracting] = useState(false);
    const [timerDelay, setTimerDelay] = useState(3000); // 3 seconds in milliseconds
    const [timerCountdown, setTimerCountdown] = useState(0); // countdown in milliseconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const photosRef = useRef([]);
    const imgRef = useRef(null);
    const [imageHeight, setImageHeight] = useState(0);
    const [displayedHeight, setDisplayedHeight] = useState(0);
    const [currentPhotoId, setCurrentPhotoId] = useState(null); // The photo actually being shown
    const animationRef = useRef(null);
    const swapTimeoutRef = useRef(null);

    // When selectedPhotoId changes, start the delay/swap logic
    useEffect(() => {
        if (selectedPhotoId === currentPhotoId) return;
        if (!selectedPhotoId) {
            setCurrentPhotoId(null);
            setPendingPhotoId(null);
            setIsSwapping(false);
            return;
        }
        setPendingPhotoId(selectedPhotoId);
        setIsSwapping(true);
        // After 1s, swap to new image
        if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
        swapTimeoutRef.current = setTimeout(() => {
            setCurrentPhotoId(selectedPhotoId);
            setIsSwapping(false);
        }, 1000);
        return () => {
            if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
        };
    }, [selectedPhotoId]);

    // Animate the displayedHeight to match imageHeight with easing when currentPhotoId changes
    useEffect(() => {
        let rafId = null;
        let start = null;
        const duration = 400;
        const initial = displayedHeight;
        const delta = imageHeight - initial;
        if (Math.abs(delta) < 2) {
            setDisplayedHeight(imageHeight);
            return;
        }
        function animate(ts) {
            if (!start) start = ts;
            const elapsed = ts - start;
            const t = Math.min(1, elapsed / duration);
            setDisplayedHeight(initial + delta * easeOutCubic(t));
            if (t < 1) {
                rafId = requestAnimationFrame(animate);
            } else {
                setDisplayedHeight(imageHeight);
            }
        }
        rafId = requestAnimationFrame(animate);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [imageHeight, currentPhotoId]);

    // When a new image is swapped in, reset displayedHeight to previous height (for smooth transition)
    useEffect(() => {
        // No-op if first load
        if (!currentPhotoId) return;
        // The imageHeight will update on image load, triggering the animation
    }, [currentPhotoId]);
    const playOnModeSelectRef = useRef(false);
    const timerIntervalRef = useRef(null);
    const interactionResetTimeoutRef = useRef(null);
    const activePointersRef = useRef(new Map());
    const gestureRef = useRef(null);
    const imageScaleRef = useRef(1);
    const imagePanRef = useRef({ x: 0, y: 0 });
    const lastTapRef = useRef({ time: 0, x: 0, y: 0 });

    // Filtered photos based on search term (case-insensitive)
    const filteredPhotos = useMemo(() => {
        if (!searchTerm.trim()) return photos;
        const lower = searchTerm.trim().toLowerCase();
        return photos.filter((photo) => {
            const name = String(photo.name || '').toLowerCase();
            const relativePath = String(photo.relativePath || '').toLowerCase();
            return name.includes(lower) || relativePath.includes(lower);
        });
    }, [photos, searchTerm]);

    // The photo currently being shown (delayed swap)
    const currentPhoto = useMemo(() => (
        photos.find((photo) => photo.id === currentPhotoId) || null
    ), [photos, currentPhotoId]);

    // The photo that will be shown after the delay
    const pendingPhoto = useMemo(() => (
        photos.find((photo) => photo.id === pendingPhotoId) || null
    ), [photos, pendingPhotoId]);

    const groupedFilteredPhotos = useMemo(() => {
        const normalized = [...filteredPhotos].sort((a, b) => {
            const aFolder = String(a.relativePath || '').split('/').slice(0, -1).join('/');
            const bFolder = String(b.relativePath || '').split('/').slice(0, -1).join('/');
            const folderCompare = aFolder.localeCompare(bFolder, undefined, { numeric: true, sensitivity: 'base' });
            if (folderCompare !== 0) return folderCompare;
            return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' });
        });

        const grouped = new Map();
        normalized.forEach((photo) => {
            const folder = String(photo.relativePath || '').split('/').slice(0, -1).join('/');
            const key = folder || 'No Folder';
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(photo);
        });

        return Array.from(grouped.entries()).map(([folder, groupedPhotos]) => ({
            folder,
            photos: groupedPhotos,
        }));
    }, [filteredPhotos]);

    const allVisibleFoldersCollapsed = useMemo(() => (
        groupedFilteredPhotos.length > 0
        && groupedFilteredPhotos.every((group) => Boolean(collapsedFolders[group.folder]))
    ), [groupedFilteredPhotos, collapsedFolders]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(PHOTO_SETTINGS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (typeof parsed.selectedPhotoId === 'string') {
                setSelectedPhotoId(parsed.selectedPhotoId);
            }
            if ([PLAYBACK_MODE_NORMAL, PLAYBACK_MODE_CONTINUOUS, PLAYBACK_MODE_SHUFFLE].includes(parsed.playbackMode)) {
                setPlaybackMode(parsed.playbackMode);
            }
            if (typeof parsed.playWithinFolder === 'boolean') {
                setPlayWithinFolder(parsed.playWithinFolder);
            }
            if (typeof parsed.showFolderPaths === 'boolean') {
                setShowFolderPaths(parsed.showFolderPaths);
            }
            if (parsed.collapsedFolders && typeof parsed.collapsedFolders === 'object') {
                setCollapsedFolders(parsed.collapsedFolders);
            }
        } catch {
            // Ignore malformed settings.
        }
    }, []);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const persisted = await getAllPersistedPhotos();
                if (!active) return;

                const restoredPhotos = persisted
                    .map((item) => {
                        if (!(item?.blob instanceof Blob)) return null;
                        return {
                            id: String(item.id),
                            name: String(item.name || 'Untitled'),
                            relativePath: String(item.relativePath || ''),
                            size: Number(item.size || item.blob.size || 0),
                            type: String(item.type || item.blob.type || ''),
                            lastModified: Number(item.lastModified || Date.now()),
                            url: URL.createObjectURL(item.blob),
                        };
                    })
                    .filter(Boolean);

                setPhotos(restoredPhotos);
                setSelectedPhotoId((prevSelectedId) => {
                    if (prevSelectedId && restoredPhotos.some((photo) => photo.id === prevSelectedId)) {
                        return prevSelectedId;
                    }
                    return restoredPhotos[0]?.id || null;
                });
            } catch (error) {
                console.error('Unable to restore photo gallery:', error);
            } finally {
                if (active) setIsLoadingPersisted(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(PHOTO_SETTINGS_KEY, JSON.stringify({
                selectedPhotoId,
                playbackMode,
                playWithinFolder,
                showFolderPaths,
                collapsedFolders,
            }));
        } catch {
            // Ignore storage failures.
        }
    }, [playbackMode, selectedPhotoId, playWithinFolder, showFolderPaths, collapsedFolders]);

    useEffect(() => {
        photosRef.current = photos;
    }, [photos]);

    useEffect(() => {
        imageScaleRef.current = imageScale;
    }, [imageScale]);

    useEffect(() => {
        imagePanRef.current = imagePan;
    }, [imagePan]);

    useEffect(() => () => {
        photosRef.current.forEach((photo) => {
            if (photo.url) URL.revokeObjectURL(photo.url);
        });
        if (interactionResetTimeoutRef.current) {
            clearTimeout(interactionResetTimeoutRef.current);
            interactionResetTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        setImageScale(1);
        setImagePan({ x: 0, y: 0 });
        activePointersRef.current.clear();
        gestureRef.current = null;
    }, [currentPhotoId]);

    // Timer effect for slideshow/random mode
    useEffect(() => {
        if (!isTimerRunning || (playbackMode !== PLAYBACK_MODE_CONTINUOUS && playbackMode !== PLAYBACK_MODE_SHUFFLE)) {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            return;
        }

        // Set initial countdown if not already running
        if (timerCountdown === 0) {
            setTimerCountdown(timerDelay);
            return;
        }

        // Run countdown timer
        timerIntervalRef.current = setInterval(() => {
            setTimerCountdown((prev) => {
                if (prev <= 100) {
                    // Time's up - advance to next photo
                    const nextPhotoId = playbackMode === PLAYBACK_MODE_SHUFFLE
                        ? getRandomNextPhotoId()
                        : getSequentialNextPhotoId();
                    if (nextPhotoId) {
                        setSelectedPhotoId(nextPhotoId);
                    }
                    return timerDelay;
                }
                return prev - 100;
            });
        }, 100);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [isTimerRunning, playbackMode, timerDelay, timerCountdown]);

    // Auto-start timer when switching to slideshow/random mode
    useEffect(() => {
        if (playbackMode === PLAYBACK_MODE_CONTINUOUS || playbackMode === PLAYBACK_MODE_SHUFFLE) {
            setIsTimerRunning(true);
            setTimerCountdown(timerDelay);
        } else {
            setIsTimerRunning(false);
        }
    }, [playbackMode]);

    const addPhotos = (fileList) => {
        const files = Array.from(fileList || []).filter((file) => String(file.type || '').startsWith('image/'));
        if (files.length === 0) return;

        const candidatePhotos = files.map((file) => ({
            id: buildPhotoId(file),
            name: file.name,
            relativePath: String(file.webkitRelativePath || '').replace(/\\/g, '/'),
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            url: URL.createObjectURL(file),
            blob: file,
        }));

        let firstAddedPhotoId = null;
        setPhotos((prev) => {
            const existingIds = new Set(prev.map((photo) => photo.id));
            const nextPhotos = [...prev];

            candidatePhotos.forEach((photo) => {
                if (existingIds.has(photo.id)) {
                    if (photo.url) URL.revokeObjectURL(photo.url);
                    return;
                }

                if (!firstAddedPhotoId) firstAddedPhotoId = photo.id;
                nextPhotos.push(photo);
                persistPhoto({
                    id: photo.id,
                    name: photo.name,
                    relativePath: photo.relativePath,
                    size: photo.size,
                    type: photo.type,
                    lastModified: photo.lastModified,
                    blob: photo.blob,
                }).catch((error) => {
                    console.error('Unable to persist added photo:', error);
                });
            });

            return nextPhotos;
        });

        if (!selectedPhotoId && firstAddedPhotoId) {
            setSelectedPhotoId(firstAddedPhotoId);
        }
    };

    const handleFileSelect = (event) => {
        addPhotos(event.target.files);
        event.target.value = '';
    };

    const handleFolderSelect = (event) => {
        addPhotos(event.target.files);
        event.target.value = '';
    };

    const removePhoto = (id) => {
        setPhotos((prev) => {
            const next = prev.filter((photo) => photo.id !== id);
            const removed = prev.find((photo) => photo.id === id);
            if (removed?.url) {
                URL.revokeObjectURL(removed.url);
            }
            if (selectedPhotoId === id) {
                setSelectedPhotoId(next[0]?.id || null);
            }
            return next;
        });
        removePersistedPhoto(id).catch((error) => {
            console.error('Unable to remove persisted photo:', error);
        });
    };

    const clearPhotos = () => {
        photosRef.current.forEach((photo) => {
            if (photo.url) URL.revokeObjectURL(photo.url);
        });
        setPhotos([]);
        setSelectedPhotoId(null);
        clearPersistedPhotos().catch((error) => {
            console.error('Unable to clear persisted photos:', error);
        });
    };

    const getPhotoFolder = (photo) => String(photo?.relativePath || '').split('/').slice(0, -1).join('/');

    const getPlayablePhotos = () => {
        if (!playWithinFolder || !selectedPhotoId) return photos;
        const currentPhoto = photos.find((photo) => photo.id === selectedPhotoId);
        if (!currentPhoto) return photos;
        const currentFolder = getPhotoFolder(currentPhoto);
        const sameFolderPhotos = photos.filter((photo) => getPhotoFolder(photo) === currentFolder);
        return sameFolderPhotos.length > 0 ? sameFolderPhotos : photos;
    };

    const getSequentialNextPhotoId = () => {
        const pool = getPlayablePhotos();
        if (!selectedPhotoId || pool.length === 0) return pool[0]?.id || null;
        const currentIndex = pool.findIndex((photo) => photo.id === selectedPhotoId);
        if (currentIndex < 0) return pool[0]?.id || null;
        return pool[(currentIndex + 1) % pool.length]?.id || null;
    };

    const getRandomNextPhotoId = () => {
        const pool = getPlayablePhotos();
        if (pool.length === 0) return null;
        if (pool.length === 1) return pool[0].id;

        const otherPhotos = pool.filter((photo) => photo.id !== selectedPhotoId);
        if (otherPhotos.length === 0) return pool[0].id;
        const randomIndex = Math.floor(Math.random() * otherPhotos.length);
        return otherPhotos[randomIndex]?.id || pool[0].id;
    };

    const handlePhotoChanged = () => {
        if (playbackMode === PLAYBACK_MODE_NORMAL) return;

        const nextPhotoId = playbackMode === PLAYBACK_MODE_SHUFFLE
            ? getRandomNextPhotoId()
            : getSequentialNextPhotoId();

        if (!nextPhotoId) return;
        setSelectedPhotoId(nextPhotoId);
    };

    const handlePlaybackModeChange = (mode) => {
        setPlaybackMode(mode);
        if (photosRef.current.length === 0) return;

        playOnModeSelectRef.current = true;
        if (!selectedPhotoId) {
            setSelectedPhotoId(photosRef.current[0].id);
        }
    };

    const handleNextPhoto = () => {
        const nextPhotoId = playbackMode === PLAYBACK_MODE_SHUFFLE
            ? getRandomNextPhotoId()
            : getSequentialNextPhotoId();

        if (!nextPhotoId) return;
        setSelectedPhotoId(nextPhotoId);

        if (playbackMode === PLAYBACK_MODE_CONTINUOUS || playbackMode === PLAYBACK_MODE_SHUFFLE) {
            setTimerCountdown(timerDelay);
        }
    };

    const toggleAllVisibleFolders = () => {
        if (groupedFilteredPhotos.length === 0) return;
        const shouldCollapse = !allVisibleFoldersCollapsed;
        setCollapsedFolders((prev) => {
            const next = { ...prev };
            groupedFilteredPhotos.forEach((group) => {
                next[group.folder] = shouldCollapse;
            });
            return next;
        });
    };

    const toggleFolderCollapse = (folderName) => {
        setCollapsedFolders((prev) => ({
            ...prev,
            [folderName]: !prev[folderName],
        }));
    };

    const clampScale = (value) => Math.min(6, Math.max(1, value));

    const clampPan = (pan, scale) => {
        const imageEl = imgRef.current;
        if (!imageEl) return pan;

        const baseWidth = imageEl.offsetWidth || 0;
        const baseHeight = imageEl.offsetHeight || 0;
        if (baseWidth <= 0 || baseHeight <= 0) return pan;

        const maxX = Math.max(0, ((baseWidth * scale) - baseWidth) / 2);
        const maxY = Math.max(0, ((baseHeight * scale) - baseHeight) / 2);

        return {
            x: Math.min(maxX, Math.max(-maxX, pan.x)),
            y: Math.min(maxY, Math.max(-maxY, pan.y)),
        };
    };

    const applyImageTransform = (requestedScale, requestedPan) => {
        const nextScale = clampScale(requestedScale);
        const boundedPan = nextScale <= 1
            ? { x: 0, y: 0 }
            : clampPan(requestedPan, nextScale);

        setImageScale(nextScale);
        setImagePan(boundedPan);
    };

    const zoomAroundPoint = (clientX, clientY, requestedScale) => {
        const nextScale = clampScale(requestedScale);
        const imageEl = imgRef.current;

        if (!imageEl) {
            applyImageTransform(nextScale, { x: 0, y: 0 });
            return;
        }

        const rect = imageEl.getBoundingClientRect();
        const currentScale = imageScaleRef.current || 1;
        const currentPan = imagePanRef.current || { x: 0, y: 0 };
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;

        const contentX = (localX - centerX - currentPan.x) / currentScale;
        const contentY = (localY - centerY - currentPan.y) / currentScale;

        const nextPan = nextScale <= 1
            ? { x: 0, y: 0 }
            : {
                x: localX - centerX - (contentX * nextScale),
                y: localY - centerY - (contentY * nextScale),
            };

        applyImageTransform(nextScale, nextPan);
    };

    const beginImageInteraction = () => {
        setIsImageInteracting(true);
        if (interactionResetTimeoutRef.current) {
            clearTimeout(interactionResetTimeoutRef.current);
            interactionResetTimeoutRef.current = null;
        }
        if (playbackMode === PLAYBACK_MODE_CONTINUOUS || playbackMode === PLAYBACK_MODE_SHUFFLE) {
            setIsTimerRunning(false);
        }
    };

    const endImageInteraction = () => {
        setIsImageInteracting(false);
        if (playbackMode === PLAYBACK_MODE_CONTINUOUS || playbackMode === PLAYBACK_MODE_SHUFFLE) {
            setTimerCountdown(timerDelay);
            setIsTimerRunning(true);
        }
    };

    const scheduleImageInteractionEnd = (delay = 250) => {
        if (interactionResetTimeoutRef.current) {
            clearTimeout(interactionResetTimeoutRef.current);
        }
        interactionResetTimeoutRef.current = setTimeout(() => {
            interactionResetTimeoutRef.current = null;
            if (activePointersRef.current.size === 0) {
                endImageInteraction();
            }
        }, delay);
    };

    const handleImagePointerDown = (event) => {
        if (!currentPhoto) return;
        beginImageInteraction();
        activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (event.currentTarget?.setPointerCapture) {
            try {
                event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
                // Ignore capture failures.
            }
        }

        const pointers = Array.from(activePointersRef.current.values());
        if (pointers.length >= 2) {
            const [p1, p2] = pointers;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.hypot(dx, dy) || 1;
            gestureRef.current = {
                type: 'pinch',
                startDistance: distance,
                startScale: imageScaleRef.current,
                startCenter: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
                startPan: { ...imagePanRef.current },
            };
            return;
        }

        const [pointer] = pointers;
        gestureRef.current = {
            type: 'pan',
            startPoint: pointer,
            startPan: { ...imagePanRef.current },
        };
    };

    const handleImagePointerMove = (event) => {
        if (!currentPhoto) return;
        if (!activePointersRef.current.has(event.pointerId)) return;

        beginImageInteraction();
        activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const pointers = Array.from(activePointersRef.current.values());

        if (pointers.length >= 2) {
            const [p1, p2] = pointers;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.hypot(dx, dy) || 1;

            const currentGesture = gestureRef.current;
            if (!currentGesture || currentGesture.type !== 'pinch') {
                gestureRef.current = {
                    type: 'pinch',
                    startDistance: distance,
                    startScale: imageScaleRef.current,
                    startCenter: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
                    startPan: { ...imagePanRef.current },
                };
                return;
            }

            const nextScale = clampScale((currentGesture.startScale || 1) * (distance / (currentGesture.startDistance || 1)));
            const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            const nextPan = {
                x: currentGesture.startPan.x + (center.x - currentGesture.startCenter.x),
                y: currentGesture.startPan.y + (center.y - currentGesture.startCenter.y),
            };

            applyImageTransform(nextScale, nextPan);
            return;
        }

        const currentGesture = gestureRef.current;
        if (!currentGesture || currentGesture.type !== 'pan' || imageScaleRef.current <= 1) return;
        const pointer = pointers[0];
        if (!pointer || !currentGesture.startPoint) return;

        const nextPan = {
            x: currentGesture.startPan.x + (pointer.x - currentGesture.startPoint.x),
            y: currentGesture.startPan.y + (pointer.y - currentGesture.startPoint.y),
        };
        applyImageTransform(imageScaleRef.current, nextPan);
    };

    const handleImagePointerUp = (event) => {
        const pointerType = event.pointerType;
        const pointX = event.clientX;
        const pointY = event.clientY;
        activePointersRef.current.delete(event.pointerId);
        if (event.currentTarget?.releasePointerCapture) {
            try {
                event.currentTarget.releasePointerCapture(event.pointerId);
            } catch {
                // Ignore capture failures.
            }
        }

        const pointers = Array.from(activePointersRef.current.values());
        if (pointers.length === 1) {
            gestureRef.current = {
                type: 'pan',
                startPoint: pointers[0],
                startPan: { ...imagePanRef.current },
            };
        } else if (pointers.length === 0) {
            gestureRef.current = null;

            if (pointerType === 'touch') {
                const now = Date.now();
                const sinceLastTap = now - lastTapRef.current.time;
                const dx = pointX - lastTapRef.current.x;
                const dy = pointY - lastTapRef.current.y;
                const moved = Math.hypot(dx, dy);

                if (sinceLastTap > 0 && sinceLastTap < 300 && moved < 30) {
                    beginImageInteraction();
                    const targetScale = imageScaleRef.current <= 1 ? 2 : 1;
                    zoomAroundPoint(pointX, pointY, targetScale);
                    scheduleImageInteractionEnd(180);
                    lastTapRef.current = { time: 0, x: 0, y: 0 };
                    return;
                }

                lastTapRef.current = { time: now, x: pointX, y: pointY };
            }

            scheduleImageInteractionEnd();
        }
    };

    const handleImageWheel = (event) => {
        if (!currentPhoto) return;
        // Use requestAnimationFrame to avoid passive event warning
        if (event.cancelable) event.preventDefault();
        beginImageInteraction();

        const scaleFactor = Math.exp(-event.deltaY * 0.0015);
        zoomAroundPoint(event.clientX, event.clientY, imageScaleRef.current * scaleFactor);

        scheduleImageInteractionEnd(300);
    };

    const handleResetImageView = () => {
        beginImageInteraction();
        applyImageTransform(1, { x: 0, y: 0 });
        scheduleImageInteractionEnd(150);
    };

    const handleStepZoom = (direction) => {
        beginImageInteraction();
        const imageEl = imgRef.current;
        if (imageEl) {
            const rect = imageEl.getBoundingClientRect();
            zoomAroundPoint(rect.left + (rect.width / 2), rect.top + (rect.height / 2), imageScaleRef.current + (direction * 0.25));
        } else {
            const nextScale = clampScale(imageScaleRef.current + (direction * 0.25));
            applyImageTransform(nextScale, imagePanRef.current);
        }
        scheduleImageInteractionEnd(150);
    };

    const handleImageDoubleClick = (event) => {
        if (!currentPhoto) return;
        beginImageInteraction();
        const targetScale = imageScaleRef.current <= 1 ? 2 : 1;
        zoomAroundPoint(event.clientX, event.clientY, targetScale);
        scheduleImageInteractionEnd(180);
    };

    return (
        <div className='containerDetail p-10 mt--30'>
            {!isImageOnlyMode ? (
                <div className='containerDetail size20 color-yellow mb-5 p-20 bg-dark contentLeft'>
                    {icons.pics || '📷'} Pics
                    <div className='ml-25 mt--5 mb--5 color-blue copyright'>
                        Select photos on your device.
                    </div>
                </div>
            ) : null}

            {!isImageOnlyMode ? (
                <div className='containerDetail flexContainer bg-dark mb-5'>
                    <label className='containerDetail flex2Column button bg-green color-yellow p-10'>
                        {icons.plus || '➕'} Add Image Files
                        <input
                            type='file'
                            accept='image/*'
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <label className='containerDetail flex2Column button bg-blue color-yellow p-10 ml-5'>
                        {icons.folder || '📁'} Add Folder
                        <input
                            type='file'
                            accept='image/*'
                            multiple
                            webkitdirectory='true'
                            directory='true'
                            onChange={handleFolderSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <div
                        className='containerDetail flex2Column button bg-red color-yellow p-10 ml-5'
                        onClick={clearPhotos}
                        disabled={photos.length === 0}
                    >
                        {icons.delete || '🗑️'} Clear Gallery
                    </div>
                </div>
            ) : null}

            {!isImageOnlyMode ? (
                <div className='containerDetail bg-dark p-10 mb-5 contentLeft'>
                <div className='containerDetail color-yellow size15 bg-lite mb-5 flexContainer'>
                    <div className={`containerDetail flex2Column p-10`}>
                        Browse Mode
                    </div>
                    <div
                        className={`containerDetail flexColumn button p-10 size12 ${playWithinFolder ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                        style={{ maxWidth: 280 }}
                        onClick={() => setPlayWithinFolder((prev) => !prev)}
                        title='Limit browsing to current folder'
                    >
                        {playWithinFolder ? 'Folder: ✅' : 'Folder: ☑️'}
                    </div>
                </div>
                <div className='flexContainer'>
                    <div
                        className={`containerDetail flex3Column button p-10 mr-5 ${playbackMode === PLAYBACK_MODE_NORMAL ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                        onClick={() => handlePlaybackModeChange(PLAYBACK_MODE_NORMAL)}
                    >
                        Normal
                    </div>
                    <div
                        className={`containerDetail flex3Column button p-10 mr-5 ${playbackMode === PLAYBACK_MODE_CONTINUOUS ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                        onClick={() => handlePlaybackModeChange(PLAYBACK_MODE_CONTINUOUS)}
                    >
                        Slideshow
                    </div>
                    <div
                        className={`containerDetail flex3Column button p-10 ${playbackMode === PLAYBACK_MODE_SHUFFLE ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                        onClick={() => handlePlaybackModeChange(PLAYBACK_MODE_SHUFFLE)}
                    >
                        Random
                    </div>
                </div>

                {(playbackMode === PLAYBACK_MODE_CONTINUOUS || playbackMode === PLAYBACK_MODE_SHUFFLE) ? (
                    <div className='containerDetail mt-10 bg-lite contentLeft'>
                        <div className='containerDetail color-yellow size15 mb-5 flexContainer'>
                            <div className='flex2Column p-10 color-yellow size20'>
                                Slideshow Timer
                                <span className='containerDetail flex2Column p-10 ml-5 color-yellow contentRight'>
                                    {(timerCountdown / 1000).toFixed(0)}s
                                </span>
                            </div>
                            <select
                                className='containerDetail flexColumn p-10 size15 ml-5 color-lite'
                                style={{ maxWidth: 120 }}
                                value={timerDelay}
                                onChange={(e) => {
                                    const newDelay = Number(e.target.value);
                                    setTimerDelay(newDelay);
                                    setTimerCountdown(newDelay);
                                }}
                            >
                                <option value={1000}>1 second</option>
                                <option value={2000}>2 seconds</option>
                                <option value={3000}>3 seconds</option>
                                <option value={5000}>5 seconds</option>
                                <option value={10000}>10 seconds</option>
                                <option value={15000}>15 seconds</option>
                            </select>
                        </div>
                    </div>
                ) : null}
                </div>
            ) : null}

            {!isImageOnlyMode && isLoadingPersisted ? (
                <div className='containerDetail color-lite size12 mb-10'>Loading saved gallery...</div>
            ) : null}

            {currentPhoto ? (
                <div>
                    <div className='containerDetail bg-dark mb-5 contentCenter' style={{ position: 'relative' }}>
                        <div
                            className={`containerDetail button p-10 size20 mt-20`}
                            style={{ position: 'absolute', top: -10, right: 10, zIndex: 2 }}
                            onClick={() => setIsImageOnlyMode((prev) => !prev)}
                            title={isImageOnlyMode ? 'Show all panels' : 'Hide all panels except image'}
                        >
                            {isImageOnlyMode ? '🔻' : '🔺'}
                        </div>
                        <div
                            style={{
                                width: '100%',
                                overflow: 'hidden',
                                height: displayedHeight + 100 ? `${displayedHeight + 100}px` : 0,
                                transition: 'height 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                                background: '#181818',
                                borderRadius: 8,
                                margin: '0 auto',
                                boxShadow: '0 2px 12px #0002',
                                position: 'relative',
                            }}
                        >
                            {/* Show the current image always, and if swapping, fade in the pending image on top after 1s */}
                            {currentPhoto && (
                                <img
                                    ref={imgRef}
                                    key={currentPhoto.id}
                                    style={{
                                        display: isSwapping ? 'block' : 'block',
                                        width: '100%',
                                        height: 'auto',
                                        maxWidth: '100%',
                                        maxHeight: 'none',
                                        transform: `translate(${imagePan.x}px, ${imagePan.y}px) scale(${imageScale})`,
                                        transformOrigin: 'center center',
                                        touchAction: 'none',
                                        cursor: imageScale > 1 ? 'grab' : 'zoom-in',
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 1,
                                        marginTop: 50,
                                        opacity: isSwapping ? 1 : 1,
                                        transition: isSwapping ? 'opacity 0.2s' : undefined,
                                    }}
                                    className='mr-10 picsLuxuryFade'
                                    src={currentPhoto.url}
                                    alt={currentPhoto.name}
                                    onLoad={e => {
                                        setImageHeight(e.target.naturalHeight * (imgRef.current ? imgRef.current.offsetWidth / e.target.naturalWidth : 1));
                                    }}
                                    onPointerDown={handleImagePointerDown}
                                    onPointerMove={handleImagePointerMove}
                                    onPointerUp={handleImagePointerUp}
                                    onPointerCancel={handleImagePointerUp}
                                    onWheel={handleImageWheel}
                                    onDoubleClick={handleImageDoubleClick}
                                    {...{
                                        onWheelCapture: (e) => {
                                            if (e.cancelable) e.preventDefault();
                                        }
                                    }}
                                />
                            )}
                            <div
                                className='containerDetail flexContainer bg-lite color-yellow p-5'
                                style={{ position: 'absolute', left: 10, bottom: 0, zIndex: 2 }}
                            >
                                <div
                                    className='containerDetail button p-10 size20'
                                    onClick={() => {
                                        const idx = filteredPhotos.findIndex(p => p.id === currentPhoto.id);
                                        if (idx > 0) setSelectedPhotoId(filteredPhotos[idx - 1].id);
                                        // Pause and reset timer on manual navigation
                                        setIsTimerRunning(false);
                                        setTimerCountdown(timerDelay);
                                    }}
                                    disabled={filteredPhotos.length <= 1 || filteredPhotos.findIndex(p => p.id === currentPhoto.id) === 0}
                                    title='Back'
                                >
                                    ◀
                                </div>
                                <div
                                    className={`${isTimerRunning ? 'containerDetail' : ''} button pt-10`}
                                    onClick={() => {
                                        setIsTimerRunning((prev) => !prev);
                                    }}
                                    title={isTimerRunning ? 'Pause Slideshow' : 'Play Slideshow'}
                                >
                                    <span className={`${isTimerRunning ? 'size35' : 'size35'}`}>{isTimerRunning ? '⏸' : '▶️'}</span>
                                </div>
                                <div
                                    className='containerDetail button p-10 size20'
                                    onClick={() => {
                                        const idx = filteredPhotos.findIndex(p => p.id === currentPhoto.id);
                                        if (idx >= 0 && idx < filteredPhotos.length - 1) setSelectedPhotoId(filteredPhotos[idx + 1].id);
                                        // Pause and reset timer on manual navigation
                                        setIsTimerRunning(false);
                                        setTimerCountdown(timerDelay);
                                    }}
                                    disabled={filteredPhotos.length <= 1 || filteredPhotos.findIndex(p => p.id === currentPhoto.id) === filteredPhotos.length - 1}
                                    title='Next'
                                >
                                    ▶
                                </div>
                                <div
                                    className='containerDetail button p-10 size20'
                                    onClick={() => handleStepZoom(-1)}
                                    title='Zoom out'
                                >
                                    −
                                </div>
                                <div
                                    className='containerDetail button p-10 size20 ml-5'
                                    onClick={() => handleStepZoom(1)}
                                    title='Zoom in'
                                >
                                    +
                                </div>
                                <div
                                    className='containerDetail button p-10 size12 ml-5'
                                    onClick={handleResetImageView}
                                    title='Reset zoom and position'
                                >
                                    Reset
                                </div>
                                <div className='containerDetail p-10 size12 ml-5 color-yellow'>
                                    {Math.round(imageScale * 100)}%
                                    {isImageInteracting ? ' • Paused' : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    {!isImageOnlyMode ? (
                        <>
                        <div className='containerDetail color-lite size10 contentLeft mb-5'>
                            <span className='ml-10'>📷</span>
                            <span className='mt-5 ml-10'>{currentPhoto.name}</span>
                            {currentPhoto.relativePath ? (
                                <div className='size12 color-lite ml-55'>
                                    {currentPhoto.relativePath}
                                </div>
                            ) : null}
                        </div>
                        </>
                    ) : null}
                </div>
            ) : (
                <div className='containerDetail color-lite size15 mb-5'>No photo selected.</div>
            )}

            {!isImageOnlyMode ? (
                <div className='containerDetail bg-dark p-10 contentLeft'>
                <div className='containerDetail color-yellow size20 mb-5'>
                    Photos: {filteredPhotos.length}
                </div>
                <input
                    className='containerDetail mb-10 p-10 color-lite size25'
                    style={{ width: '100%', maxWidth: 400 }}
                    type='text'
                    placeholder='Search photos...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <div className='containerDetail flexContainer'>
                    <div
                        className={`containerDetail flex2column button p-20 mb-10 size25 ${showFolderPaths ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                        onClick={() => setShowFolderPaths((prev) => !prev)}
                        title='Toggle folder paths in gallery'
                    >
                        {showFolderPaths ? '📂' : '📁'}
                    </div>
                    <div
                        className={`containerDetail flex2column button p-20 mb-10 size25 bg-lite ml-5`}
                        onClick={toggleAllVisibleFolders}
                        title='Collapse/Expand Folders'
                    >
                        {allVisibleFoldersCollapsed ? '🔺' : '🔻'}
                    </div>
                </div>
                {photos.length === 0 ? (
                    <div className='containerDetail color-lite size12'>Select one or more image files to begin.</div>
                ) : filteredPhotos.length === 0 ? (
                    <div className='containerDetail color-lite size12'>No photos match your search.</div>
                ) : (
                    <div className='containerDetail ht-300 scroll mt-5 mb-5 mr--5'>
                        {groupedFilteredPhotos.map((group, id) => (
                            <div key={group.folder} className={`containerDetail ${(id === groupedFilteredPhotos.length - 1) ? 'mb-20' : ''} mb-5`}>
                                <div
                                    className='containerDetail button size12 color-blue mt-10 p-5'
                                    onClick={() => toggleFolderCollapse(group.folder)}
                                    title='Expand or collapse folder group'
                                >
                                    {collapsedFolders[group.folder] ? '▶' : '▼'} {group.folder} ({group.photos.length})
                                </div>
                                {!collapsedFolders[group.folder] ? group.photos.map((photo) => (
                                    <div key={photo.id} className='containerDetail flexContainer bg-lite mt-5 p-5'>
                                        <div
                                            className='containerDetail button flex4Column color-yellow p-10 contentLeft flexContainer size15'
                                            onClick={() => setSelectedPhotoId(photo.id)}
                                            title='View selected photo'
                                        >
                                            <div 
                                                className='flexColumn  mr-10'
                                                style={{
                                                    position: 'relative',
                                                    width: 50,
                                                    height: 50,
                                                    marginRight: 10,
                                                    minWidth: 50,
                                                    overflow: 'hidden',
                                                    borderRadius: 4,
                                                    border: photo.id === selectedPhotoId ? '2px solid #0f0' : 'none'
                                                }}
                                            >
                                                <img 
                                                    src={photo.url} 
                                                    alt={photo.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                {photo.id === selectedPhotoId && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        fontSize: 24
                                                    }}>
                                                        ▶️
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex2Column contentLeft'>
                                                {photo.name}
                                                {showFolderPaths && photo.relativePath ? (
                                                    <div className='size10 color-lite'>
                                                        {photo.relativePath}
                                                    </div>
                                                ) : null}
                                                <div className='size10 color-lite'>
                                                    {formatBytes(photo.size)}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className='containerDetail button bg-dark size30 p-30 ml-5 contentCenter'
                                            onClick={() => removePhoto(photo.id)}
                                            title='Remove photo'
                                        >
                                            {icons.delete || '🗑️'}
                                        </div>
                                    </div>
                                )) : null}
                            </div>
                        ))}
                    </div>
                )}
                </div>
            ) : null}
        </div>
    );
};

export default Pics;
