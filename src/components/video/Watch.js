import React, { useEffect, useMemo, useRef, useState } from 'react';
import icons from '../site/icons';

const VIDEO_DB_NAME = 'kfa-video-db';
const VIDEO_DB_VERSION = 1;
const VIDEO_STORE_NAME = 'videos';
const VIDEO_SETTINGS_KEY = 'kfa-video-settings-v1';

const PLAYBACK_MODE_NORMAL = 'normal';
const PLAYBACK_MODE_CONTINUOUS = 'continuous';
const PLAYBACK_MODE_SHUFFLE = 'shuffle';

const isVideoDbAvailable = () => typeof indexedDB !== 'undefined';

const openVideoDb = () => new Promise((resolve, reject) => {
    if (!isVideoDbAvailable()) {
        reject(new Error('IndexedDB is not available in this browser context.'));
        return;
    }

    const request = indexedDB.open(VIDEO_DB_NAME, VIDEO_DB_VERSION);

    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(VIDEO_STORE_NAME)) {
            db.createObjectStore(VIDEO_STORE_NAME, { keyPath: 'id' });
        }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open video database.'));
});

const getAllPersistedVideos = async () => {
    const db = await openVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(VIDEO_STORE_NAME, 'readonly');
        const store = transaction.objectStore(VIDEO_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(Array.isArray(request.result) ? request.result : []);
        };
        request.onerror = () => reject(request.error || new Error('Failed to read videos.'));
        transaction.onerror = () => reject(transaction.error || new Error('Video read transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Video read transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const persistVideo = async (record) => {
    const db = await openVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(VIDEO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(VIDEO_STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to persist video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Video write transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Video write transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const removePersistedVideo = async (id) => {
    const db = await openVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(VIDEO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(VIDEO_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to remove video.'));
        transaction.onerror = () => reject(transaction.error || new Error('Video delete transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Video delete transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const clearPersistedVideos = async () => {
    const db = await openVideoDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(VIDEO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(VIDEO_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to clear videos.'));
        transaction.onerror = () => reject(transaction.error || new Error('Video clear transaction failed.'));
        transaction.onabort = () => reject(transaction.error || new Error('Video clear transaction aborted.'));
        transaction.oncomplete = () => db.close();
    });
};

const buildVideoId = ({ name, size, lastModified, webkitRelativePath, relativePath }) => {
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

const isVideoLikeFile = (file) => {
    const mime = String(file?.type || '').toLowerCase();
    if (mime.startsWith('video/')) return true;
    const name = String(file?.name || '');
    return /\.(mp4|m4v|mov|webm|ogv|avi|mkv|3gp|3g2)$/i.test(name);
};

const Watch = () => {
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [playbackMode, setPlaybackMode] = useState(PLAYBACK_MODE_NORMAL);
    const [isLoadingPersisted, setIsLoadingPersisted] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [playWithinFolder, setPlayWithinFolder] = useState(false);
    const [showFolderPaths, setShowFolderPaths] = useState(true);
    const [collapsedFolders, setCollapsedFolders] = useState({});
    const [isPlayerOnlyMode, setIsPlayerOnlyMode] = useState(false);
    const [isVideoDbWarningVisible, setIsVideoDbWarningVisible] = useState(false);
    const videosRef = useRef([]);
    const videoRef = useRef(null);
    // For resize animation
    const [videoHeight, setVideoHeight] = useState(0);
    const [displayedHeight, setDisplayedHeight] = useState(0);
    const animationRef = useRef(null);
    // Easing function for smooth transitions
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    // Animate the displayedHeight to match videoHeight with easing when videoHeight changes
    useEffect(() => {
        let rafId = null;
        let start = null;
        const duration = 400;
        const initial = displayedHeight;
        const delta = videoHeight - initial;
        if (Math.abs(delta) < 2) {
            setDisplayedHeight(videoHeight + 50);
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
                setDisplayedHeight(videoHeight+50);
            }
        }
        rafId = requestAnimationFrame(animate);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [videoHeight, selectedVideoId]);

    const filteredVideos = useMemo(() => {
        if (!searchTerm.trim()) return videos;
        const lower = searchTerm.trim().toLowerCase();
        return videos.filter((video) => {
            const name = String(video.name || '').toLowerCase();
            const relativePath = String(video.relativePath || '').toLowerCase();
            return name.includes(lower) || relativePath.includes(lower);
        });
    }, [videos, searchTerm]);

    const selectedVideo = useMemo(() => (
        videos.find((video) => video.id === selectedVideoId) || null
    ), [videos, selectedVideoId]);

    const groupedFilteredVideos = useMemo(() => {
        const normalized = [...filteredVideos].sort((a, b) => {
            const aFolder = String(a.relativePath || '').split('/').slice(0, -1).join('/');
            const bFolder = String(b.relativePath || '').split('/').slice(0, -1).join('/');
            const folderCompare = aFolder.localeCompare(bFolder, undefined, { numeric: true, sensitivity: 'base' });
            if (folderCompare !== 0) return folderCompare;
            return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' });
        });

        const grouped = new Map();
        normalized.forEach((video) => {
            const folder = String(video.relativePath || '').split('/').slice(0, -1).join('/');
            const key = folder || 'No Folder';
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(video);
        });

        return Array.from(grouped.entries()).map(([folder, groupedVideos]) => ({
            folder,
            videos: groupedVideos,
        }));
    }, [filteredVideos]);

    const allVisibleFoldersCollapsed = useMemo(() => (
        groupedFilteredVideos.length > 0
        && groupedFilteredVideos.every((group) => Boolean(collapsedFolders[group.folder]))
    ), [groupedFilteredVideos, collapsedFolders]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(VIDEO_SETTINGS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (typeof parsed.selectedVideoId === 'string') {
                setSelectedVideoId(parsed.selectedVideoId);
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
                const persisted = await getAllPersistedVideos();
                if (!active) return;

                const restoredVideos = persisted
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

                setVideos(restoredVideos);
                setSelectedVideoId((prevSelectedId) => {
                    if (prevSelectedId && restoredVideos.some((video) => video.id === prevSelectedId)) {
                        return prevSelectedId;
                    }
                    return restoredVideos[0]?.id || null;
                });
            } catch (error) {
                console.error('Unable to restore video playlist:', error);
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
            localStorage.setItem(VIDEO_SETTINGS_KEY, JSON.stringify({
                selectedVideoId,
                playbackMode,
                playWithinFolder,
                showFolderPaths,
                collapsedFolders,
            }));
        } catch {
            // Ignore storage failures.
        }
    }, [playbackMode, selectedVideoId, playWithinFolder, showFolderPaths, collapsedFolders]);

    useEffect(() => {
        videosRef.current = videos;
    }, [videos]);

    useEffect(() => () => {
        videosRef.current.forEach((video) => {
            if (video.url) URL.revokeObjectURL(video.url);
        });
    }, []);

    const addVideos = (fileList) => {
        const files = Array.from(fileList || []).filter(isVideoLikeFile);
        if (files.length === 0) return;

        const candidateVideos = files.map((file) => ({
            id: buildVideoId(file),
            name: file.name,
            relativePath: String(file.webkitRelativePath || file.relativePath || '').replace(/\\/g, '/'),
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            url: URL.createObjectURL(file),
            blob: file,
        }));

        let firstAddedVideoId = null;
        setVideos((prev) => {
            const existingIds = new Set(prev.map((video) => video.id));
            const nextVideos = [...prev];

            candidateVideos.forEach((video) => {
                if (existingIds.has(video.id)) {
                    if (video.url) URL.revokeObjectURL(video.url);
                    return;
                }

                if (!firstAddedVideoId) firstAddedVideoId = video.id;
                nextVideos.push(video);
                persistVideo({
                    id: video.id,
                    name: video.name,
                    relativePath: video.relativePath,
                    size: video.size,
                    type: video.type,
                    lastModified: video.lastModified,
                    blob: video.blob,
                }).catch((error) => {
                    console.error('Unable to persist added video:', error);
                });
            });

            return nextVideos;
        });

        if (!selectedVideoId && firstAddedVideoId) {
            setSelectedVideoId(firstAddedVideoId);
        }
    };

    const handleFileSelect = (event) => {
        addVideos(event.target.files);
        event.target.value = '';
    };

    const handleFolderSelect = (event) => {
        addVideos(event.target.files);
        event.target.value = '';
    };

    useEffect(() => {
        setIsVideoDbWarningVisible(!isVideoDbAvailable());
    }, []);

    const removeVideo = (id) => {
        setVideos((prev) => {
            const next = prev.filter((video) => video.id !== id);
            const removed = prev.find((video) => video.id === id);
            if (removed?.url) {
                URL.revokeObjectURL(removed.url);
            }
            if (selectedVideoId === id) {
                setSelectedVideoId(next[0]?.id || null);
            }
            return next;
        });
        removePersistedVideo(id).catch((error) => {
            console.error('Unable to remove persisted video:', error);
        });
    };

    const clearVideos = () => {
        videosRef.current.forEach((video) => {
            if (video.url) URL.revokeObjectURL(video.url);
        });
        setVideos([]);
        setSelectedVideoId(null);
        clearPersistedVideos().catch((error) => {
            console.error('Unable to clear persisted videos:', error);
        });
    };

    const getVideoFolder = (video) => String(video?.relativePath || '').split('/').slice(0, -1).join('/');

    const getPlayableVideos = () => {
        if (!playWithinFolder || !selectedVideoId) return videos;
        const currentVideo = videos.find((video) => video.id === selectedVideoId);
        if (!currentVideo) return videos;
        const currentFolder = getVideoFolder(currentVideo);
        const sameFolderVideos = videos.filter((video) => getVideoFolder(video) === currentFolder);
        return sameFolderVideos.length > 0 ? sameFolderVideos : videos;
    };

    const getSequentialNextVideoId = () => {
        const pool = getPlayableVideos();
        if (!selectedVideoId || pool.length === 0) return pool[0]?.id || null;
        const currentIndex = pool.findIndex((video) => video.id === selectedVideoId);
        if (currentIndex < 0) return pool[0]?.id || null;
        return pool[(currentIndex + 1) % pool.length]?.id || null;
    };

    const getRandomNextVideoId = () => {
        const pool = getPlayableVideos();
        if (pool.length === 0) return null;
        if (pool.length === 1) return pool[0].id;

        const otherVideos = pool.filter((video) => video.id !== selectedVideoId);
        if (otherVideos.length === 0) return pool[0].id;
        const randomIndex = Math.floor(Math.random() * otherVideos.length);
        return otherVideos[randomIndex]?.id || pool[0].id;
    };

    const handleVideoEnded = () => {
        if (playbackMode === PLAYBACK_MODE_NORMAL) return;

        const nextVideoId = playbackMode === PLAYBACK_MODE_SHUFFLE
            ? getRandomNextVideoId()
            : getSequentialNextVideoId();

        if (!nextVideoId) return;
        setSelectedVideoId(nextVideoId);
    };

    const handlePlaybackModeChange = (mode) => {
        setPlaybackMode(mode);
        if (videosRef.current.length === 0) return;

        if (!selectedVideoId) {
            setSelectedVideoId(videosRef.current[0].id);
            return;
        }

        const video = videoRef.current;
        if (!video) return;
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
            playAttempt.catch(() => {
                // Ignore autoplay failures; browser may require stronger user gesture contexts.
            });
        }
    };

    const toggleAllVisibleFolders = () => {
        if (groupedFilteredVideos.length === 0) return;
        const shouldCollapse = !allVisibleFoldersCollapsed;
        setCollapsedFolders((prev) => {
            const next = { ...prev };
            groupedFilteredVideos.forEach((group) => {
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

    return (
        <div className='containerDetail p-10 mt--30'>
            {!isPlayerOnlyMode ? (
                <>
                    <div className='containerDetail size20 color-yellow mb-5 p-20 bg-dark contentLeft'>
                        {icons.film || '🎬'} Watch
                        <div className='ml-25 mt--5 mb--5 color-blue copyright'>
                            Select videos on your device.
                        </div>
                    </div>

                    <div className='containerDetail flexContainer bg-dark mb-5'>
                        <label className='containerDetail flex2Column button bg-green color-yellow p-10'>
                            {icons.plus || '➕'} Add Video Files
                            <input
                                type='file'
                                accept='video/*'
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <label className='containerDetail flex2Column button bg-blue color-yellow p-10 ml-5'>
                            {icons.folder || '📁'} Add Folder
                            <input
                                type='file'
                                accept='video/*'
                                multiple
                                webkitdirectory='true'
                                directory='true'
                                onChange={handleFolderSelect}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <div
                            className='containerDetail flex2Column button bg-red color-yellow p-10 ml-5'
                            onClick={clearVideos}
                            disabled={videos.length === 0}
                        >
                            {icons.delete || '🗑️'} Clear Playlist
                        </div>
                    </div>

                    {isVideoDbWarningVisible ? (
                        <div className='pa-alert pa-alert-warning mb-10'>
                            Video persistence is unavailable in this browser context. Added videos are session-only.
                        </div>
                    ) : null}

                    <div className='containerDetail bg-dark mb-5 contentLeft'>
                        <div className='containerDetail color-yellow size15 bg-lite mb-5 flexContainer'>
                            <div className='containerDetail flex2Column p-10'>
                                Playback Mode
                            </div>
                            <div
                                className={`containerDetail flexColumn button p-10 size12 ${playWithinFolder ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                                style={{ maxWidth: 280 }}
                                onClick={() => setPlayWithinFolder((prev) => !prev)}
                                title='Limit Continuous and Random playback to current folder'
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
                                Continuous
                            </div>
                            <div
                                className={`containerDetail flex3Column button p-10 ${playbackMode === PLAYBACK_MODE_SHUFFLE ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                                onClick={() => handlePlaybackModeChange(PLAYBACK_MODE_SHUFFLE)}
                            >
                                Random
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

            {!isPlayerOnlyMode && isLoadingPersisted ? (
                <div className='containerDetail color-lite size12 mb-10'>Loading saved playlist...</div>
            ) : null}

            {selectedVideo ? (
                <div>
                    <div className='containerDetail bg-dark mb-5 contentLeft' style={{ position: 'relative' }}>
                        <div
                            className={`containerDetail button p-10 size20`}
                            style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
                            onClick={() => setIsPlayerOnlyMode((prev) => !prev)}
                            title={isPlayerOnlyMode ? 'Show all panels' : 'Hide all panels except player'}
                        >
                            {isPlayerOnlyMode ? '🔻' : '🔺'}
                        </div>
                        <div
                            style={{
                                width: '100%',
                                overflow: 'hidden',
                                height: displayedHeight + 50 ? `${displayedHeight + 50}px` : 0,
                                transition: 'height 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                                background: '#181818',
                                borderRadius: 8,
                                margin: '0 auto',
                                boxShadow: '0 2px 12px #0002',
                                position: 'relative',
                            }}
                        >
                            <video
                                ref={videoRef}
                                key={selectedVideo.id}
                                controls
                                autoPlay
                                preload='metadata'
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: 'none',
                                    background: '#000',
                                }}
                                className='width-100-percent mt-50'
                                src={selectedVideo.url}
                                onEnded={handleVideoEnded}
                                onLoadedMetadata={e => {
                                    // Calculate the scaled height based on container width
                                    const video = e.target;
                                    const container = video.parentElement;
                                    if (container && video.videoWidth && video.videoHeight) {
                                        const width = container.offsetWidth;
                                        const scale = width / video.videoWidth;
                                        setVideoHeight(video.videoHeight * scale);
                                    }
                                }}
                            >
                                Your browser does not support the video element.
                            </video>
                            {/* Navigation and control bar (replicated from Pics.js) */}
                            <div
                                className='containerDetail flexContainer bg-lite color-yellow p-5'
                                style={{ position: 'absolute', left: 10, bottom: 0, zIndex: 2 }}
                            >
                                <div
                                    className='containerDetail button p-10 size20'
                                    onClick={() => {
                                        const idx = filteredVideos.findIndex(v => v.id === selectedVideo.id);
                                        if (idx > 0) setSelectedVideoId(filteredVideos[idx - 1].id);
                                    }}
                                    disabled={filteredVideos.length <= 1 || filteredVideos.findIndex(v => v.id === selectedVideo.id) === 0}
                                    title='Back'
                                >
                                    ◀
                                </div>
                                <div
                                    className={`${playbackMode !== PLAYBACK_MODE_NORMAL ? 'containerDetail' : ''} button pt-10`}
                                    onClick={() => {
                                        if (playbackMode === PLAYBACK_MODE_NORMAL) {
                                            // Play/pause the video directly
                                            const video = videoRef.current;
                                            if (video) {
                                                if (video.paused) video.play();
                                                else video.pause();
                                            }
                                        } else {
                                            setPlaybackMode(PLAYBACK_MODE_NORMAL);
                                        }
                                    }}
                                    title={playbackMode !== PLAYBACK_MODE_NORMAL ? 'Switch to Normal Mode' : 'Play/Pause'}
                                >
                                    <span className='size35'>{playbackMode !== PLAYBACK_MODE_NORMAL ? (videoRef.current && videoRef.current.paused ? '▶️' : '⏸') : (videoRef.current && videoRef.current.paused ? '▶️' : '⏸')}</span>
                                </div>
                                <div
                                    className='containerDetail button p-10 size20'
                                    onClick={() => {
                                        const idx = filteredVideos.findIndex(v => v.id === selectedVideo.id);
                                        if (idx >= 0 && idx < filteredVideos.length - 1) setSelectedVideoId(filteredVideos[idx + 1].id);
                                    }}
                                    disabled={filteredVideos.length <= 1 || filteredVideos.findIndex(v => v.id === selectedVideo.id) === filteredVideos.length - 1}
                                    title='Next'
                                >
                                    ▶
                                </div>
                            </div>
                        </div>
                    </div>
                    {!isPlayerOnlyMode ? (
                        <div className='containerDetail color-lite size10 contentLeft mb-5'>
                            <span className='ml-10'>
                                🎬
                            </span>
                            <span className='mt-5 ml-10'>
                                {selectedVideo.name}
                            </span>
                            {selectedVideo.relativePath ? (
                                <div className='size12 color-lite ml-55'>
                                    {selectedVideo.relativePath}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            ) : (
                <div className='containerDetail color-lite size15 mb-5'>No video selected.</div>
            )}

            {!isPlayerOnlyMode ? (
                <div className='containerDetail bg-dark p-10 contentLeft'>
                    <div className='containerDetail color-yellow size20 mb-5'>
                        Videos: {filteredVideos.length}
                    </div>
                    <input
                        className='containerDetail mb-10 p-10 color-lite size25 mt-50'
                        style={{ width: '100%', maxWidth: 400 }}
                        type='text'
                        placeholder='Search videos...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className='containerDetail flexContainer'>
                        <div
                            className={`containerDetail flex2column button p-20 mb-10 size25 ${showFolderPaths ? 'bg-green color-yellow' : 'bg-lite color-yellow'}`}
                            onClick={() => setShowFolderPaths((prev) => !prev)}
                            title='Toggle folder paths in playlist'
                        >
                            {showFolderPaths ? '📂' : '📁'}
                        </div>
                        <div
                            className='containerDetail flex2column button p-20 mb-10 size25 bg-lite ml-5'
                            onClick={toggleAllVisibleFolders}
                            title='Collapse/Expand Folders'
                        >
                            {allVisibleFoldersCollapsed ? '🔺' : '🔻'}
                        </div>
                    </div>
                    {videos.length === 0 ? (
                        <div className='containerDetail color-lite size12'>Select one or more video files to begin.</div>
                    ) : filteredVideos.length === 0 ? (
                        <div className='containerDetail color-lite size12'>No videos match your search.</div>
                    ) : (
                        <div className='containerDetail ht-300 scroll mt-5 mb-5 mr--5'>
                            {groupedFilteredVideos.map((group, id) => (
                                <div key={group.folder} className={`containerDetail ${(id === groupedFilteredVideos.length - 1) ? 'mb-20' : ''} mb-5`}>
                                    <div
                                        className='containerDetail button size12 color-blue mt-10 p-5'
                                        onClick={() => toggleFolderCollapse(group.folder)}
                                        title='Expand or collapse folder group'
                                    >
                                        {collapsedFolders[group.folder] ? '▶' : '▼'} {group.folder} ({group.videos.length})
                                    </div>
                                    {!collapsedFolders[group.folder] ? group.videos.map((video) => (
                                        <div key={video.id} className='containerDetail flexContainer bg-lite mt-5 p-5'>
                                            <div
                                                className='containerDetail button flex4Column color-yellow p-10 contentLeft size15'
                                                onClick={() => setSelectedVideoId(video.id)}
                                                title='Play selected video'
                                            >
                                                <span className='size30 mr-5'>
                                                    {video.id === selectedVideoId ? '▶️' : '🎬'}
                                                </span>
                                                {video.name.toString().split('.').slice(0, -1).join('.') || video.name}
                                                {showFolderPaths && video.relativePath ? (
                                                    <div className='size10 color-lite'>
                                                        {video.relativePath}
                                                    </div>
                                                ) : null}
                                                <div className='size10 color-lite'>
                                                    {formatBytes(video.size)}
                                                </div>
                                            </div>
                                            <div
                                                className='containerDetail button bg-dark p-20 size20 ml-5 contentCenter'
                                                onClick={() => removeVideo(video.id)}
                                                title='Remove video'
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

export default Watch;
