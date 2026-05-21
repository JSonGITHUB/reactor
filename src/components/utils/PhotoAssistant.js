import React, { useState, useEffect, useRef } from 'react';
import HistoryPanel from './HistoryPanel';
import CollapseToggleButton from './CollapseToggleButton';
import SubjectForm from './SubjectForm';
import ModeSelector from './ModeSelector';
import ConditionSelectors from './ConditionSelectors';
import PhotoSettingResults from './PhotoSettingResults';
import VideoSettingResults from './VideoSettingResults';
import calculatePhotoSettings from './calculatePhotoSettings';
import calculateVideoSettings from './calculateVideoSettings';
import useLocation from './useLocation';
import { persistAssistantPhoto, getAssistantPhotoBlob, removeAssistantPhoto, isAssistantPhotoDbAvailable } from './assistantPhotoDb';
//import './photoAssistant.css';

const PhotoAssistant = () => {
    // Mode state: 'photo' or 'video'
    const [mode, setMode] = useState('photo');
    
    // Subject details
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    
    // Conditions
    const [lighting, setLighting] = useState('');
    const [motion, setMotion] = useState('');
    const [effect, setEffect] = useState('');
    const [scene, setScene] = useState('');
    
    // Additional video options
    const [resolution, setResolution] = useState('1080p');
    const [frameRate, setFrameRate] = useState(30);
    
    // Results
    const [photoResult, setPhotoResult] = useState(null);
    const [videoResult, setVideoResult] = useState(null);
    
    // History & UI
    const [history, setHistory] = useState([]);
    const [captureSettingsCollapsed, setCaptureSettingsCollapsed] = useState(true);

    // Photos attached to current entry being submitted
    const [entryPhotos, setEntryPhotos] = useState([]);
    const [expandedPhoto, setExpandedPhoto] = useState(null);
    const [isPhotoRowCollapsed, setIsPhotoRowCollapsed] = useState(true);
    const entryPhotoFileInputRef = useRef(null);
    const entryPhotoFolderInputRef = useRef(null);
    const isPhotoDbAvailable = isAssistantPhotoDbAvailable();
    
    // Get current location
    const { latitude, longitude, error: locationError } = useLocation();

    // Load persisted history from localStorage on mount, restoring photo blobs from IndexedDB
    useEffect(() => {
        const saved = localStorage.getItem('photoAssistantHistory');
        if (!saved) return;
        let parsed;
        try {
            parsed = JSON.parse(saved);
        } catch (err) {
            console.error('Failed to parse history:', err);
            return;
        }
        Promise.all(parsed.map(async (entry) => {
            if (!entry.photos || entry.photos.length === 0) return entry;
            const photosWithUrls = await Promise.all(entry.photos.map(async (photo) => {
                const blob = await getAssistantPhotoBlob(photo.id).catch(() => null);
                if (!blob) return { ...photo, url: null };
                return { ...photo, url: URL.createObjectURL(blob) };
            }));
            return { ...entry, photos: photosWithUrls };
        })).then(setHistory);
    }, []);

    const isImageLikeFile = (file) => {
        const mime = String(file?.type || '').toLowerCase();
        if (mime.startsWith('image/')) return true;
        const name = String(file?.name || '');
        return /\.(png|jpe?g|gif|webp|bmp|heic|heif|avif|tiff?)$/i.test(name);
    };

    const buildPhotoId = (file) => {
        const relativePath = String(file?.webkitRelativePath || file?.relativePath || '').replace(/\\/g, '/');
        return `${relativePath || file.name}-${file.size}-${file.lastModified}`;
    };

    const formatBytes = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Strip object URLs before serialising to localStorage
    const historyForStorage = (hist) => hist.map(e => ({
        ...e,
        photos: (e.photos || []).map(({ url, ...rest }) => rest),
    }));

    const addEntryPhotos = (fileList) => {
        const rawFiles = Array.from(fileList || []);
        const filteredFiles = rawFiles.filter(isImageLikeFile);
        // Some mobile pickers return files with missing/opaque type metadata.
        const files = filteredFiles.length > 0 ? filteredFiles : rawFiles;
        if (files.length === 0) return;

        const newPhotos = files.map((file) => {
            const id = buildPhotoId(file);
            return {
                id,
                name: file.name,
                size: file.size,
                relativePath: String(file.webkitRelativePath || '').replace(/\\/g, '/'),
                url: URL.createObjectURL(file),
                file,
            };
        });

        setEntryPhotos(prev => {
            const existingIds = new Set(prev.map(p => p.id));

            newPhotos.forEach((photo) => {
                if (existingIds.has(photo.id)) {
                    if (photo.url) URL.revokeObjectURL(photo.url);
                    return;
                }

                persistAssistantPhoto(photo.id, photo.file).catch((err) => {
                    console.error('Unable to persist assistant photo:', err);
                });
            });

            return [
                ...prev,
                ...newPhotos
                    .filter(p => !existingIds.has(p.id))
                    .map(({ file, ...photo }) => photo),
            ];
        });
    };

    const removeEntryPhoto = (id) => {
        setEntryPhotos(prev => {
            const photo = prev.find(p => p.id === id);
            if (photo?.url) URL.revokeObjectURL(photo.url);
            return prev.filter(p => p.id !== id);
        });
        if (expandedPhoto?.id === id) setExpandedPhoto(null);
        removeAssistantPhoto(id).catch(() => {});
    };

    const updateEntryPhotos = (entryId, updatedPhotos) => {
        const updated = history.map(e => e.id === entryId ? { ...e, photos: updatedPhotos } : e);
        setHistory(updated);
        localStorage.setItem('photoAssistantHistory', JSON.stringify(historyForStorage(updated)));
    };

    const resetForm = () => {
        entryPhotos.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
        setEntryPhotos([]);
        setExpandedPhoto(null);
        setIsPhotoRowCollapsed(true);
        setSubject('');
        setDescription('');
        setLighting('');
        setMotion('');
        setEffect('');
        setScene('');
        setPhotoResult(null);
        setVideoResult(null);
        setMode('photo');
    };

    // Calculate settings when inputs change
    const handleCalculate = () => {
        const commonParams = {
            subject,
            description,
            lighting,
            motion,
            effect,
            scene
        };

        if (mode === 'photo') {
            const result = calculatePhotoSettings(commonParams);
            setPhotoResult(result);
            setVideoResult(null);
        } else {
            const result = calculateVideoSettings({
                ...commonParams,
                resolution,
                frameRate
            });
            setVideoResult(result);
            setPhotoResult(null);
        }
    };

    // Save entry to history
    const handleSave = () => {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mode,
            subject,
            description,
            lighting,
            motion,
            effect,
            scene,
            latitude,
            longitude,
            settings: mode === 'photo' ? photoResult : videoResult,
            photos: entryPhotos,
        };

        const updatedHistory = [entry, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('photoAssistantHistory', JSON.stringify(historyForStorage(updatedHistory)));
        
        // Reset form
        resetForm();
    };
    const openLocation = (lat, lng) => {
        if (!lat || !lng) return;
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        window.open(url, '_blank');
    };

    const deleteHistoryEntry = (id) => {
        const entry = history.find(e => e.id === id);
        if (entry?.photos) {
            entry.photos.forEach(p => {
                if (p.url) URL.revokeObjectURL(p.url);
                removeAssistantPhoto(p.id).catch(() => {});
            });
        }
        const updatedHistory = history.filter(e => e.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('photoAssistantHistory', JSON.stringify(historyForStorage(updatedHistory)));
    };

    const captureSettingsTitle = (
        <div className='color-yellow size20'>
            Capture Settings
        </div>
    );

    return (
        <div className='mt--25'>
            <div className='containerDetail flexContainer size20 p-20 m-5 bg-lite contentLeft'>
                <div className='color-yellow flexColumn'>
                    <span className='size50 mr-5'>📷</span>
                </div>
                <div className='flex2Column copyright color-lite'>
                    <div className='color-yellow size20'>Photo Assistant</div>
                    Get camera settings recommendations for your shots
                </div>
            </div>

            <div className='containerDetail bg-silver m-5'>
                <CollapseToggleButton
                    title={captureSettingsTitle}
                    isCollapsed={captureSettingsCollapsed}
                    setCollapse={setCaptureSettingsCollapsed}
                    align='left'
                />
            </div>

            {!captureSettingsCollapsed && (
                <>
                    {/* Mode Selector */}
                    <ModeSelector mode={mode} setMode={setMode} />

                    {/* Subject Form */}
                    <SubjectForm 
                        subject={subject}
                        setSubject={setSubject}
                        description={description}
                        setDescription={setDescription}
                        mode={mode}
                    />

                    {/* Condition Selectors */}
                    <ConditionSelectors
                        lighting={lighting}
                        setLighting={setLighting}
                        motion={motion}
                        setMotion={setMotion}
                        effect={effect}
                        setEffect={setEffect}
                        scene={scene}
                        setScene={setScene}
                        mode={mode}
                    />

                    {/* Video-specific options */}
                    {mode === 'video' && (
                        <div className=''>
                            <div className='containerDetail flexContainer m-5'>
                                <label className='flex2Column size20 contentRight p-15 color-yellow'>
                                    Resolution
                                </label>
                                <select
                                    className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                >
                                    <option value='720p'>720p</option>
                                    <option value='1080p'>1080p</option>
                                    <option value='4K'>4K</option>
                                    <option value='8K'>8K</option>
                                </select>
                            </div>

                            <div className='containerDetail flexContainer m-5'>
                                <label className='flex2Column size20 contentRight p-15 color-yellow'>
                                    Frame Rate
                                </label>
                                <select
                                    className='containerDetail flex2Column size20 contentLeft p-10 bg-dark color-lite'
                                    value={frameRate}
                                    onChange={(e) => setFrameRate(Number(e.target.value))}
                                >
                                    <option value='24'>24 fps</option>
                                    <option value='30'>30 fps</option>
                                    <option value='60'>60 fps</option>
                                    <option value='120'>120 fps</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {
                        mode !== '' && (
                        <div className='flexContainer'>
                            <div 
                                className='containerDetail m-5 bg-green flex2Column button color-lite p-20 size20'
                                onClick={handleCalculate}
                            >
                                Calculate Settings
                            </div>
                            
                            <div 
                                className='containerDetail m-5 bg-green flex2Column button color-lite p-20 size20'
                                onClick={resetForm}
                            >
                                Reset
                            </div>
                        </div>
                        )
                    }

                    {/* Location Info */}
                    {mode !== '' && locationError && (
                        <div className='pa-alert pa-alert-warning'>
                            Location: {locationError}
                        </div>
                    )}
                    
                    {latitude && longitude && (
                        <div className='containerDetail color-lite contentLeft m-5 p-20 bg-dark size14'>
                            📍 Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </div>
                    )}

                    {/* Results */}
                    {mode === 'photo' && photoResult && (
                        <PhotoSettingResults
                            result={photoResult}
                            onSave={handleSave}
                            subject={subject}
                            description={description}
                        />
                    )}

                    {mode === 'video' && videoResult && (
                        <VideoSettingResults
                            result={videoResult}
                            onSave={handleSave}
                            subject={subject}
                            description={description}
                            settings={videoResult}
                        />
                    )}

                    {/* Photo Picker for current entry */}
                    <div className='containerDetail m-5 bg-dark p-10'>
                        <div className='flexContainer mb-10' style={{ alignItems: 'center' }}>
                            <div className='flex2Column color-yellow size20'>📎 Attach Photos</div>
                        </div>
                        {!isPhotoDbAvailable && (
                            <div className='pa-alert pa-alert-warning mb-10'>
                                Photo persistence is unavailable in this browser context. Photos can still be added for this session.
                            </div>
                        )}
                        {/* Top controls row */}
                        {entryPhotos.length > 0 && (
                            <div className='flexContainer mb-10' style={{ alignItems: 'center', gap: 8 }}>
                                <div
                                    className='containerDetail flex1Column button bg-lite color-yellow p-10 size14'
                                    onClick={() => setIsPhotoRowCollapsed((prev) => !prev)}
                                    title='Toggle between wrapped grid and single-row horizontal scrolling'
                                    style={{ maxWidth: 220, fontWeight: 600, letterSpacing: 0.5 }}
                                >
                                    {isPhotoRowCollapsed ? 'Expand Grid' : 'Collapse to Row'}
                                </div>
                                {expandedPhoto && (
                                    <div
                                        className='containerDetail flexColumn button bg-lite color-yellow p-10 size14 w-30'
                                        onClick={() => setExpandedPhoto(null)}
                                        title='Close expanded image'
                                    >
                                        ❌
                                    </div>
                                )}
                            </div>
                        )}
                        <div className='flexContainer mb-10'>
                            <label className='containerDetail flex2Column button bg-green color-yellow p-10 mr-5'>
                                📷 Add Images
                                <input
                                    ref={entryPhotoFileInputRef}
                                    type='file'
                                    accept='image/*'
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => { addEntryPhotos(e.target.files); e.target.value = ''; }}
                                />
                            </label>
                            <label className='containerDetail flex2Column button bg-blue color-yellow p-10'>
                                📁 Add Folder
                                <input
                                    ref={entryPhotoFolderInputRef}
                                    type='file'
                                    accept='image/*'
                                    multiple
                                    webkitdirectory='true'
                                    directory='true'
                                    style={{ display: 'none' }}
                                    onChange={(e) => { addEntryPhotos(e.target.files); e.target.value = ''; }}
                                />
                            </label>
                        </div>
                            {entryPhotos.length > 0 && (
                                <div style={{ flexWrap: 'wrap', gap: 8 }}>
                                    {/* Full-width expanded view */}
                                    {expandedPhoto && (() => {
                                        const expandedIndex = entryPhotos.findIndex(p => p.id === expandedPhoto.id);
                                        const canGoPrev = expandedIndex > 0;
                                        const canGoNext = expandedIndex < entryPhotos.length - 1;
                                        return (
                                            <div className='containerDetail bg-dark mb-10' style={{ position: 'relative' }}>
                                                <div
                                                    className='button p-10 size20'
                                                    onClick={() => canGoPrev && setExpandedPhoto(entryPhotos[expandedIndex - 1])}
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
                                                    className='button p-10 size20'
                                                    onClick={() => canGoNext && setExpandedPhoto(entryPhotos[expandedIndex + 1])}
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
                                                    src={expandedPhoto.url}
                                                    alt={expandedPhoto.name}
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
                                                    {expandedPhoto.name} ({expandedIndex + 1} / {entryPhotos.length})
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {/* Thumbnail strip */}
                                    <div
                                        className='flexContainer'
                                        style={{
                                            flexWrap: isPhotoRowCollapsed ? 'nowrap' : 'wrap',
                                            gap: 8,
                                            overflowX: isPhotoRowCollapsed ? 'auto' : 'visible',
                                            overflowY: 'hidden',
                                            paddingBottom: isPhotoRowCollapsed ? 6 : 0,
                                        }}
                                    >
                                        {entryPhotos.map((photo) => (
                                            <div key={photo.id} style={{ position: 'relative', width: 80, height: 80, flex: '0 0 auto' }}>
                                                <img
                                                    src={photo.url}
                                                    alt={photo.name}
                                                    title={`${photo.name} (${formatBytes(photo.size)})`}
                                                    onClick={() => setExpandedPhoto(expandedPhoto?.id === photo.id ? null : photo)}
                                                    style={{
                                                        width: '100%', height: '100%', objectFit: 'cover',
                                                        borderRadius: 4, display: 'block', cursor: 'pointer',
                                                        border: expandedPhoto?.id === photo.id ? '2px solid #0f0' : '2px solid transparent'
                                                    }}
                                                />
                                                <div
                                                    className='button'
                                                    onClick={() => removeEntryPhoto(photo.id)}
                                                    title='Remove photo'
                                                    style={{
                                                        position: 'absolute', top: 2, right: 2,
                                                        background: 'rgba(0,0,0,0.65)', color: '#fff',
                                                        borderRadius: '50%', width: 22, height: 22,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 14, lineHeight: 1
                                                    }}
                                                >
                                                    ✕
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {entryPhotos.length === 0 && (
                                <div className='color-soft size12'>No photos attached yet.</div>
                            )}
                        </div>

                    {/* Save Button (when results exist) */}
                    {(photoResult || videoResult) && (
                        <div className='pa-actions'>
                            <div 
                                className='button containerDetail bg-green color-lite p-20 m-5 size20'
                                onClick={handleSave}
                            >
                                💾 Save to History
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* History Panel */}
            <HistoryPanel 
                history={history} 
                onOpenLocation={openLocation}
                onDelete={deleteHistoryEntry}
                onUpdatePhotos={updateEntryPhotos}
            />
        </div>
    );
};

export default PhotoAssistant;