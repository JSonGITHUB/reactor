import React, { useEffect, useMemo, useRef, useState } from 'react';
import icons from '../site/icons';

const MUSIC_DB_NAME = 'kfa-music-db';
const MUSIC_DB_VERSION = 1;
const MUSIC_STORE_NAME = 'tracks';
const MUSIC_SETTINGS_KEY = 'kfa-music-settings-v1';

const PLAYBACK_MODE_NORMAL = 'normal';
const PLAYBACK_MODE_CONTINUOUS = 'continuous';
const PLAYBACK_MODE_SHUFFLE = 'shuffle';

const openMusicDb = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(MUSIC_DB_NAME, MUSIC_DB_VERSION);

    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(MUSIC_STORE_NAME)) {
            db.createObjectStore(MUSIC_STORE_NAME, { keyPath: 'id' });
        }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open music database.'));
});

const getAllPersistedTracks = async () => {
    const db = await openMusicDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(MUSIC_STORE_NAME, 'readonly');
        const store = transaction.objectStore(MUSIC_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(Array.isArray(request.result) ? request.result : []);
        };
        request.onerror = () => reject(request.error || new Error('Failed to read tracks.'));
        transaction.oncomplete = () => db.close();
    });
};

const persistTrack = async (record) => {
    const db = await openMusicDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(MUSIC_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(MUSIC_STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to persist track.'));
        transaction.oncomplete = () => db.close();
    });
};

const removePersistedTrack = async (id) => {
    const db = await openMusicDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(MUSIC_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(MUSIC_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to remove track.'));
        transaction.oncomplete = () => db.close();
    });
};

const clearPersistedTracks = async () => {
    const db = await openMusicDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(MUSIC_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(MUSIC_STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error('Failed to clear tracks.'));
        transaction.oncomplete = () => db.close();
    });
};

const buildTrackId = ({ name, size, lastModified, webkitRelativePath, relativePath }) => {
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

const Music = () => {
    const [tracks, setTracks] = useState([]);
    const [selectedTrackId, setSelectedTrackId] = useState(null);
    const [playbackMode, setPlaybackMode] = useState(PLAYBACK_MODE_NORMAL);
    const [isLoadingPersisted, setIsLoadingPersisted] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [playWithinFolder, setPlayWithinFolder] = useState(false);
    const [showFolderPaths, setShowFolderPaths] = useState(true);
    const [collapsedFolders, setCollapsedFolders] = useState({});
    const [isPlayerOnlyMode, setIsPlayerOnlyMode] = useState(false);
    const tracksRef = useRef([]);
    const audioRef = useRef(null);

    const filteredTracks = useMemo(() => {
        if (!searchTerm.trim()) return tracks;
        const lower = searchTerm.trim().toLowerCase();
        return tracks.filter((track) => {
            const name = String(track.name || '').toLowerCase();
            const relativePath = String(track.relativePath || '').toLowerCase();
            return name.includes(lower) || relativePath.includes(lower);
        });
    }, [tracks, searchTerm]);

    const selectedTrack = useMemo(() => (
        tracks.find((track) => track.id === selectedTrackId) || null
    ), [tracks, selectedTrackId]);

    const groupedFilteredTracks = useMemo(() => {
        const normalized = [...filteredTracks].sort((a, b) => {
            const aFolder = String(a.relativePath || '').split('/').slice(0, -1).join('/');
            const bFolder = String(b.relativePath || '').split('/').slice(0, -1).join('/');
            const folderCompare = aFolder.localeCompare(bFolder, undefined, { numeric: true, sensitivity: 'base' });
            if (folderCompare !== 0) return folderCompare;
            return String(a.name || '').localeCompare(String(b.name || ''), undefined, { numeric: true, sensitivity: 'base' });
        });

        const grouped = new Map();
        normalized.forEach((track) => {
            const folder = String(track.relativePath || '').split('/').slice(0, -1).join('/');
            const key = folder || 'No Folder';
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(track);
        });

        return Array.from(grouped.entries()).map(([folder, groupedTracks]) => ({
            folder,
            tracks: groupedTracks,
        }));
    }, [filteredTracks]);

    const allVisibleFoldersCollapsed = useMemo(() => (
        groupedFilteredTracks.length > 0
        && groupedFilteredTracks.every((group) => Boolean(collapsedFolders[group.folder]))
    ), [groupedFilteredTracks, collapsedFolders]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(MUSIC_SETTINGS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (typeof parsed.selectedTrackId === 'string') {
                setSelectedTrackId(parsed.selectedTrackId);
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
                const persisted = await getAllPersistedTracks();
                if (!active) return;

                const restoredTracks = persisted
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

                setTracks(restoredTracks);
                setSelectedTrackId((prevSelectedId) => {
                    if (prevSelectedId && restoredTracks.some((track) => track.id === prevSelectedId)) {
                        return prevSelectedId;
                    }
                    return restoredTracks[0]?.id || null;
                });
            } catch (error) {
                console.error('Unable to restore music playlist:', error);
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
            localStorage.setItem(MUSIC_SETTINGS_KEY, JSON.stringify({
                selectedTrackId,
                playbackMode,
                playWithinFolder,
                showFolderPaths,
                collapsedFolders,
            }));
        } catch {
            // Ignore storage failures.
        }
    }, [playbackMode, selectedTrackId, playWithinFolder, showFolderPaths, collapsedFolders]);

    useEffect(() => {
        tracksRef.current = tracks;
    }, [tracks]);

    useEffect(() => () => {
        tracksRef.current.forEach((track) => {
            if (track.url) URL.revokeObjectURL(track.url);
        });
    }, []);

    const addTracks = (fileList) => {
        const files = Array.from(fileList || []).filter((file) => String(file.type || '').startsWith('audio/'));
        if (files.length === 0) return;

        const candidateTracks = files.map((file) => ({
            id: buildTrackId(file),
            name: file.name,
            relativePath: String(file.webkitRelativePath || '').replace(/\\/g, '/'),
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            url: URL.createObjectURL(file),
            blob: file,
        }));

        let firstAddedTrackId = null;
        setTracks((prev) => {
            const existingIds = new Set(prev.map((track) => track.id));
            const nextTracks = [...prev];

            candidateTracks.forEach((track) => {
                if (existingIds.has(track.id)) {
                    if (track.url) URL.revokeObjectURL(track.url);
                    return;
                }

                if (!firstAddedTrackId) firstAddedTrackId = track.id;
                nextTracks.push(track);
                persistTrack({
                    id: track.id,
                    name: track.name,
                    relativePath: track.relativePath,
                    size: track.size,
                    type: track.type,
                    lastModified: track.lastModified,
                    blob: track.blob,
                }).catch((error) => {
                    console.error('Unable to persist added track:', error);
                });
            });

            return nextTracks;
        });

        if (!selectedTrackId && firstAddedTrackId) {
            setSelectedTrackId(firstAddedTrackId);
        }
    };

    const handleFileSelect = (event) => {
        addTracks(event.target.files);
        event.target.value = '';
    };

    const handleFolderSelect = (event) => {
        addTracks(event.target.files);
        event.target.value = '';
    };

    const removeTrack = (id) => {
        setTracks((prev) => {
            const next = prev.filter((track) => track.id !== id);
            const removed = prev.find((track) => track.id === id);
            if (removed?.url) {
                URL.revokeObjectURL(removed.url);
            }
            if (selectedTrackId === id) {
                setSelectedTrackId(next[0]?.id || null);
            }
            return next;
        });
        removePersistedTrack(id).catch((error) => {
            console.error('Unable to remove persisted track:', error);
        });
    };

    const clearTracks = () => {
        tracksRef.current.forEach((track) => {
            if (track.url) URL.revokeObjectURL(track.url);
        });
        setTracks([]);
        setSelectedTrackId(null);
        clearPersistedTracks().catch((error) => {
            console.error('Unable to clear persisted tracks:', error);
        });
    };

    const getTrackFolder = (track) => String(track?.relativePath || '').split('/').slice(0, -1).join('/');

    const getPlayableTracks = () => {
        if (!playWithinFolder || !selectedTrackId) return tracks;
        const currentTrack = tracks.find((track) => track.id === selectedTrackId);
        if (!currentTrack) return tracks;
        const currentFolder = getTrackFolder(currentTrack);
        const sameFolderTracks = tracks.filter((track) => getTrackFolder(track) === currentFolder);
        return sameFolderTracks.length > 0 ? sameFolderTracks : tracks;
    };

    const getSequentialNextTrackId = () => {
        const pool = getPlayableTracks();
        if (!selectedTrackId || pool.length === 0) return pool[0]?.id || null;
        const currentIndex = pool.findIndex((track) => track.id === selectedTrackId);
        if (currentIndex < 0) return pool[0]?.id || null;
        return pool[(currentIndex + 1) % pool.length]?.id || null;
    };

    const getRandomNextTrackId = () => {
        const pool = getPlayableTracks();
        if (pool.length === 0) return null;
        if (pool.length === 1) return pool[0].id;

        const otherTracks = pool.filter((track) => track.id !== selectedTrackId);
        if (otherTracks.length === 0) return pool[0].id;
        const randomIndex = Math.floor(Math.random() * otherTracks.length);
        return otherTracks[randomIndex]?.id || pool[0].id;
    };

    const handleTrackEnded = () => {
        if (playbackMode === PLAYBACK_MODE_NORMAL) return;

        const nextTrackId = playbackMode === PLAYBACK_MODE_SHUFFLE
            ? getRandomNextTrackId()
            : getSequentialNextTrackId();

        if (!nextTrackId) return;
        setSelectedTrackId(nextTrackId);
    };

    const handlePlaybackModeChange = (mode) => {
        setPlaybackMode(mode);
        if (tracksRef.current.length === 0) return;

        if (!selectedTrackId) {
            setSelectedTrackId(tracksRef.current[0].id);
            return;
        }

        const audio = audioRef.current;
        if (!audio) return;
        const playAttempt = audio.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
            playAttempt.catch(() => {
                // Ignore autoplay failures; browser may require stronger user gesture contexts.
            });
        }
    };

    const toggleAllVisibleFolders = () => {
        if (groupedFilteredTracks.length === 0) return;
        const shouldCollapse = !allVisibleFoldersCollapsed;
        setCollapsedFolders((prev) => {
            const next = { ...prev };
            groupedFilteredTracks.forEach((group) => {
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
                        {icons.music || '🎵'} Music
                        <div className='ml-25 mt--5 mb--5 color-blue copyright'>
                            Select music on your device.
                        </div>
                    </div>
                    <div className='containerDetail flexContainer bg-dark mb-5'>
                        <label className='containerDetail flex2Column button bg-green color-yellow p-10'>
                            {icons.plus || '➕'} Add Audio Files
                            <input
                                type='file'
                                accept='audio/*'
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <label className='containerDetail flex2Column button bg-blue color-yellow p-10 ml-5'>
                            {icons.folder || '📁'} Add Folder
                            <input
                                type='file'
                                accept='audio/*'
                                multiple
                                webkitdirectory='true'
                                directory='true'
                                onChange={handleFolderSelect}
                                style={{ display: 'none' }}
                            />
                        </label>
                        <div
                            className='containerDetail flex2Column button bg-red color-yellow p-10 ml-5'
                            onClick={clearTracks}
                            disabled={tracks.length === 0}
                        >
                            {icons.delete || '🗑️'} Clear Playlist
                        </div>
                    </div>
                    <div className='containerDetail bg-dark p-10 mb-5 contentLeft'>
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

            {selectedTrack ? (
                <div className='containerDetail bg-dark mb-5 contentLeft' style={{ position: 'relative' }}>
                    {/* Navigation and control bar (replicated from Watch.js) */}
                    
                    <div
                        className={`containerDetail button p-10 size20`}
                        style={{ position: 'absolute', top: 20, right: 10, zIndex: 2 }}
                        onClick={() => setIsPlayerOnlyMode((prev) => !prev)}
                        title={isPlayerOnlyMode ? 'Show all panels' : 'Hide all panels except player'}
                    >
                        {isPlayerOnlyMode ? '🔻' : '🔺'}
                    </div>
                    <div className='containerDetail color-lite size25 pt-20 pb-20'>
                        <span className='ml-10'>
                            🎧
                        </span>
                        <span className='mt-5 ml-10'>
                            {selectedTrack.name.toString().split('.').slice(0, -1).join('.') || selectedTrack.name}
                        </span>
                        {selectedTrack.relativePath ? (
                            <div className='size12 color-lite ml-55 mb--5'>
                                {selectedTrack.relativePath.split('.').slice(0, -1).join('.')}
                            </div>
                        ) : null}
                    </div>
                    <audio
                        ref={audioRef}
                        key={selectedTrack.id}
                        controls
                        autoPlay
                        preload='metadata'
                        className='width--20 ml-10 mr-10 mb-5'
                        src={selectedTrack.url}
                        onEnded={handleTrackEnded}
                    >
                        Your browser does not support the audio element.
                    </audio>
                    <div
                        className='containerDetail flexContainer bg-lite color-yellow p-5'
                    >
                        <div
                            className='containerDetail button p-10 size20'
                            onClick={() => {
                                const idx = filteredTracks.findIndex(t => t.id === selectedTrack.id);
                                if (idx > 0) setSelectedTrackId(filteredTracks[idx - 1].id);
                            }}
                            disabled={filteredTracks.length <= 1 || filteredTracks.findIndex(t => t.id === selectedTrack.id) === 0}
                            title='Back'
                        >
                            ◀
                        </div>
                        <div
                            className='containerDetail button pt-10'
                            onClick={() => {
                                const audio = audioRef.current;
                                if (audio) {
                                    if (audio.paused) audio.play();
                                    else audio.pause();
                                }
                            }}
                            title='Play/Pause'
                        >
                            <span className='size35'>{audioRef.current && audioRef.current.paused ? '▶️' : '⏸'}</span>
                        </div>
                        <div
                            className='containerDetail button p-10 size20'
                            onClick={() => {
                                const idx = filteredTracks.findIndex(t => t.id === selectedTrack.id);
                                if (idx >= 0 && idx < filteredTracks.length - 1) setSelectedTrackId(filteredTracks[idx + 1].id);
                            }}
                            disabled={filteredTracks.length <= 1 || filteredTracks.findIndex(t => t.id === selectedTrack.id) === filteredTracks.length - 1}
                            title='Next'
                        >
                            ▶
                        </div>
                    </div>
                </div>
            ) : (
                <div className='containerDetail color-lite size15 mb-5'>No track selected.</div>
            )}

            {!isPlayerOnlyMode ? (
                <div className='containerDetail bg-dark p-10 contentLeft'>
                    <div className='containerDetail color-yellow size20 mb-5'>
                        Tracks: {filteredTracks.length}
                    </div>
                    <input
                        className='containerDetail mb-10 p-10 color-lite size25'
                        style={{ width: '100%', maxWidth: 400 }}
                        type='text'
                        placeholder='Search songs...'
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
                    {tracks.length === 0 ? (
                        <div className='containerDetail color-lite size12'>Select one or more audio files to begin.</div>
                    ) : filteredTracks.length === 0 ? (
                        <div className='containerDetail color-lite size12'>No songs match your search.</div>
                    ) : (
                        <div className='containerDetail ht-300 scroll mt-5 mb-5 mr--5'>
                            {groupedFilteredTracks.map((group, id) => (
                                <div key={group.folder} className={`containerDetail ${(id === groupedFilteredTracks.length - 1) ? 'mb-20' : ''} mb-5`}>
                                    <div
                                        className='containerDetail button size12 color-blue mt-10 p-5'
                                        onClick={() => toggleFolderCollapse(group.folder)}
                                        title='Expand or collapse folder group'
                                    >
                                        {collapsedFolders[group.folder] ? '▶' : '▼'} {group.folder} ({group.tracks.length})
                                    </div>
                                    {!collapsedFolders[group.folder] ? group.tracks.map((track) => (
                                        <div key={track.id} className='containerDetail flexContainer bg-lite mt-5 p-5'>
                                            <div
                                                className='containerDetail button flex4Column color-yellow p-10 contentLeft size15'
                                                onClick={() => setSelectedTrackId(track.id)}
                                                title='Play selected track'
                                            >
                                                <span className='size30 mr-5'>
                                                    {track.id === selectedTrackId ? '▶️' : '🎵'}
                                                </span>
                                                {track.name.toString().split('.').slice(0, -1).join('.') || track.name}
                                                {showFolderPaths && track.relativePath ? (
                                                    <div className='size10 color-lite'>
                                                        {track.relativePath}
                                                    </div>
                                                ) : null}
                                                <div className='size10 color-lite'>
                                                    {formatBytes(track.size)}
                                                </div>
                                            </div>
                                            <div
                                                className='containerDetail button bg-dark p-20 size20 ml-5 contentCenter'
                                                onClick={() => removeTrack(track.id)}
                                                title='Remove track'
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

export default Music;
