import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import CollapseToggleButton from './CollapseToggleButton';
import { persistAssistantPhoto, removeAssistantPhoto, isAssistantPhotoDbAvailable } from './assistantPhotoDb';

const HISTORY_ITEM_COLLAPSE_KEY = 'kfa-history-item-collapsed-v1';


/**
 * HistoryPanel displays a list of submitted photo/video entries.
 *
 * Props:
 * - history: array of submission objects [{id, subject, mode, timestamp, settings, latitude, longitude}]
 * - onOpenLocation: function(lat, lng) => opens Google Maps
 * - onDelete: function(id) => deletes entry from history
 */
const HistoryPanel = ({ history = [], onOpenLocation, onDelete, onUpdatePhotos }) => {
    const [historyCollapsed, setHistoryCollapsed] = useState(true);
    const [editingPhotosId, setEditingPhotosId] = useState(null);
    const [expandedPhotoKey, setExpandedPhotoKey] = useState(null); // `${entryId}:${photoId}`
    const [collapsedRows, setCollapsedRows] = useState({}); // entryId -> collapsed/row mode
    const [collapsedItems, setCollapsedItems] = useState(() => {
        try {
            const raw = localStorage.getItem(HISTORY_ITEM_COLLAPSE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    });
    const editFileInputRef = useRef(null);
    const editFolderInputRef = useRef(null);
    const isPhotoDbAvailable = isAssistantPhotoDbAvailable();

    React.useEffect(() => {
        try {
            localStorage.setItem(HISTORY_ITEM_COLLAPSE_KEY, JSON.stringify(collapsedItems));
        } catch {
            // Ignore storage failures.
        }
    }, [collapsedItems]);

    const isItemCollapsed = (entryId) => collapsedItems[entryId] ?? true;

    const toggleItemCollapsed = (entryId) => {
        setCollapsedItems((prev) => ({
            ...prev,
            [entryId]: !(prev[entryId] ?? true),
        }));
        setEditingPhotosId((prev) => (prev === entryId ? null : prev));
        setExpandedPhotoKey((prev) => (String(prev || '').startsWith(`${entryId}:`) ? null : prev));
    };

    const toggleRow = (entryId) => {
        setCollapsedRows((prev) => {
            const isCollapsed = prev[entryId] ?? true;
            return { ...prev, [entryId]: !isCollapsed };
        });
    };

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

    const handleAddPhotosToEntry = (entry, fileList) => {
        const rawFiles = Array.from(fileList || []);
        const filteredFiles = rawFiles.filter(isImageLikeFile);
        // Some mobile pickers return files with missing/opaque type metadata.
        const files = filteredFiles.length > 0 ? filteredFiles : rawFiles;
        if (files.length === 0 || !onUpdatePhotos) return;

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

        const existingPhotos = entry.photos || [];
        const existingIds = new Set(existingPhotos.map(p => p.id));

        newPhotos.forEach((photo) => {
            if (existingIds.has(photo.id)) {
                if (photo.url) URL.revokeObjectURL(photo.url);
                return;
            }

            persistAssistantPhoto(photo.id, photo.file).catch((err) => {
                console.error('Unable to persist history photo:', err);
            });
        });

        const merged = [
            ...existingPhotos,
            ...newPhotos
                .filter(p => !existingIds.has(p.id))
                .map(({ file, ...photo }) => photo),
        ];
        onUpdatePhotos(entry.id, merged);
    };

    const handleRemovePhotoFromEntry = (entry, photoId) => {
        if (!onUpdatePhotos) return;
        const photo = (entry.photos || []).find(p => p.id === photoId);
        if (photo?.url) URL.revokeObjectURL(photo.url);
        removeAssistantPhoto(photoId).catch(() => {});
        if (expandedPhotoKey === `${entry.id}:${photoId}`) setExpandedPhotoKey(null);
        onUpdatePhotos(entry.id, (entry.photos || []).filter(p => p.id !== photoId));
    };
    const getSettingIcon = (settingKey) => {
        const key = settingKey.toLowerCase();
        if (key.includes('iso')) return '📶';
        if (key.includes('shutter')) return '⏱️';
        if (key.includes('aperture')) return '🔆';
        if (key.includes('frame')) return '🎞️';
        if (key.includes('focal')) return '🔍';
        if (key.includes('white')) return '☀️';
        return '⚙️';
    };

    const formatSettingValue = (key, value) => {
        if (typeof value === 'object') return null;
        if (key === 'notes') return null; // Display notes separately
        const label = typeof key === 'string' && key.length
            ? key.charAt(0).toUpperCase() + key.slice(1)
            : key;
        return (
            <div key={key} className=''>
                <span className='ml-75 mr-5'>{getSettingIcon(key)}</span>
                <span className=''>{label}: </span>
                <span className=''>{value}</span>
            </div>
        );
    };
    const title = <div className='color-yellow size20'>
                📋 History ({history.length})
            </div>
    return (
        <div className=''>
            <div className='containerDetail bg-silver m-5'>
                <CollapseToggleButton
                    title={title}
                    isCollapsed={historyCollapsed}
                    setCollapse={setHistoryCollapsed}
                    align='left'
                />
            </div>
            
            {
                !historyCollapsed ? (
                    history.length === 0 ? (
                        <div className=''>
                            No submissions yet. Calculate and save your first shot!
                        </div>
                    ) : (
                        <div className=''>
                            {history.map((entry) => (
                                <div key={entry.id} className='containerDetail m-5 bg-lite color-lite p-5'>
                                    {(() => {
                                        const collapsed = isItemCollapsed(entry.id);
                                        return (
                                    <div className='containerDetail'>
                                        <div className='containerDetail flexContainer contentLeft p-5 bg-silver'>
                                            <div 
                                                className='flexColumn containerDetail pt-50 pb-60 size50 r-10 button noScroll'
                                                        onClick={() => toggleItemCollapsed(entry.id)}
                                            >
                                                {entry.mode === 'video' ? '🎥' : '📷'}
                                            </div>
                                            <div 
                                                className='containerDetail flex2Column ml-5 size25 mr-5 p-25 button'
                                                onClick={() => toggleItemCollapsed(entry.id)}
                                            >
                                                <div className=' p-10 mr-5 mb-5 mr-5 mt-5 color-yellow'>
                                                    {entry.subject || 'Untitled'}
                                                </div>
                                                <div className='mr-5 mb-5 color-yellow'>
                                                    {entry.description && (
                                                        <div className='pl-10 mt--15 color-orange size20'>
                                                            {entry.description}
                                                        </div>
                                                    )}
                                                    <div className='pl-10 color-lite size15'>
                                                        📅 {new Date(entry.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flexColumn alignRight'>
                                                <div
                                                    className='button p-10 size20 bg-tintedMedium r-10 mb-5'
                                                    title={collapsed ? 'Expand item' : 'Collapse item'}
                                                    onClick={() => toggleItemCollapsed(entry.id)}
                                                >
                                                    {collapsed ? '▶' : '▼'}
                                                </div>
                                                {entry.latitude && entry.longitude && onOpenLocation && (
                                                    <div
                                                        className='button p-10 size20 bg-tintedMedium r-10 mb-5'
                                                        title='Open Location in Google Maps'
                                                        onClick={() => onOpenLocation(entry.latitude, entry.longitude)}
                                                    >
                                                        🌍
                                                    </div>
                                                )}
                                                
                                                {onDelete && (
                                                    <div
                                                        className='button p-10 size20 r-10 bg-tintedMedium'
                                                        title='Delete Entry'
                                                        onClick={() => {
                                                            if (window.confirm('Delete this entry?')) {
                                                                onDelete(entry.id);
                                                            }
                                                        }}
                                                    >
                                                        🗑️
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!collapsed && (
                                            <>
                                        {entry.settings && (
                                        <div className='containerDetail bg-lite mt-5 contentLeft pt-10 pb-10'>
                                            {Object.entries(entry.settings).map(([k, v]) => 
                                                formatSettingValue(k, v)
                                            )}
                                            {entry.settings.notes && (
                                                <div className='ml-75'>
                                                    <span className='mr-5'>
                                                        📝
                                                    </span>
                                                    {entry.settings.notes.split('=>')[0]}:
                                                    <span className='color-neogreen'>{entry.settings.notes.split('=>')[1]}</span>
                                                </div>
                                            )}
                                                <div className='containerDetail p-10 flex3Column flexContainer contentLeft mt-10'>
                                                    <div
                                                        className='containerDetail bg-yellow button bg-lite color-yellow pr-10 size12'
                                                        onClick={() => (entry.mode === 'video') ? null : setEditingPhotosId(editingPhotosId === entry.id ? null : entry.id)}
                                                        title='Toggle between wrapped grid and single-row horizontal scrolling'
                                                        style={{ maxWidth: 180, fontWeight: 600, letterSpacing: 0.5 }}
                                                    >
                                                        ➕📷
                                                    </div>
                                                    {editingPhotosId === entry.id && (
                                                        <div className='flexColumn flexContainer mb-10' style={{ gap: 8 }}>
                                                            <label className='containerDetail button bg-green color-yellow pl-10 pr-10 size12 mr-5 flexColumn'>
                                                                + Images
                                                                <input
                                                                    ref={editFileInputRef}
                                                                    type='file'
                                                                    accept='image/*'
                                                                    multiple
                                                                    style={{ display: 'none' }}
                                                                    onChange={(e) => { handleAddPhotosToEntry(entry, e.target.files); e.target.value = ''; }}
                                                                />
                                                            </label>
                                                            <label className='containerDetail button bg-blue color-yellow pl-10 pr-10 size12 flexColumn'>
                                                                + Folder
                                                                <input
                                                                    ref={editFolderInputRef}
                                                                    type='file'
                                                                    accept='image/*'
                                                                    multiple
                                                                    webkitdirectory='true'
                                                                    directory='true'
                                                                    style={{ display: 'none' }}
                                                                    onChange={(e) => { handleAddPhotosToEntry(entry, e.target.files); e.target.value = ''; }}
                                                                />
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                        </div>
                                    )}
                                        {/* Photos strip */}
                                        {((entry.photos && entry.photos.length > 0)) && (
                                            <div className='containerDetail bg-dark p-10 mt-5'>
                                                {!isPhotoDbAvailable && (
                                                    <div className='pa-alert pa-alert-warning mb-10'>
                                                        Photo persistence is unavailable in this browser context. Added photos are session-only.
                                                    </div>
                                                )}
                                                <div>
                                                    <div className='flexContainer mb-15 mt-5' style={{ alignItems: 'center', gap: 8 }}>
                                                        <div
                                                            className='containerDetail button bg-lite color-yellow p-10 size12'
                                                            onClick={() => toggleRow(entry.id)}
                                                            title='Toggle between wrapped grid and single-row horizontal scrolling'
                                                            style={{ fontWeight: 600, letterSpacing: 0.5, maxWidth: 180 }}
                                                        >
                                                            {(collapsedRows[entry.id] ?? true) ? 'Expand Grid' : 'Collapse to Row'}
                                                        </div>
                                                        {expandedPhotoKey && expandedPhotoKey.startsWith(`${entry.id}:`) && (
                                                            <div
                                                                className='containerDetail button bg-lite color-yellow p-8 size12'
                                                                onClick={() => setExpandedPhotoKey(null)}
                                                                title='Close expanded image'
                                                                style={{ marginLeft: 'auto', minWidth: 90, textAlign: 'center', fontWeight: 600 }}
                                                            >
                                                                Close ✕
                                                            </div>
                                                        )}
                                                    </div>
                                                        {/* Full-width expanded view */}
                                                        {(() => {
                                                            const photos = entry.photos || [];
                                                            const expandedIdx = expandedPhotoKey
                                                                ? photos.findIndex(p => expandedPhotoKey === `${entry.id}:${p.id}`)
                                                                : -1;
                                                            const expandedPhoto = expandedIdx >= 0 ? photos[expandedIdx] : null;
                                                            const canGoPrev = expandedIdx > 0;
                                                            const canGoNext = expandedIdx < photos.length - 1;
                                                            return expandedPhoto ? (
                                                                <div className='containerDetail bg-dark mb-10' style={{ position: 'relative' }}>
                                                                    <div
                                                                        className='button p-10 size20'
                                                                        onClick={() => canGoPrev && setExpandedPhotoKey(`${entry.id}:${photos[expandedIdx - 1].id}`)}
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
                                                                        onClick={() => canGoNext && setExpandedPhotoKey(`${entry.id}:${photos[expandedIdx + 1].id}`)}
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
                                                                        {expandedPhoto.name} ({expandedIdx + 1} / {photos.length})
                                                                    </div>
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                        {/* Thumbnail strip */}
                                                        <div
                                                            className='flexContainer'
                                                            style={{
                                                                flexWrap: (collapsedRows[entry.id] ?? true) ? 'nowrap' : 'wrap',
                                                                gap: 8,
                                                                overflowX: (collapsedRows[entry.id] ?? true) ? 'auto' : 'visible',
                                                                overflowY: 'hidden',
                                                                paddingBottom: (collapsedRows[entry.id] ?? true) ? 6 : 0,
                                                            }}
                                                        >
                                                            {(entry.photos || []).map((photo) => (
                                                                <div key={photo.id} style={{ position: 'relative', width: 64, height: 64, flex: '0 0 auto' }}>
                                                                    <img
                                                                        src={photo.url}
                                                                        alt={photo.name}
                                                                        title={`${photo.name} (${formatBytes(photo.size || 0)})`}
                                                                        onClick={() => {
                                                                            const key = `${entry.id}:${photo.id}`;
                                                                            setExpandedPhotoKey(expandedPhotoKey === key ? null : key);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover',
                                                                            borderRadius: 4,
                                                                            display: 'block',
                                                                            cursor: 'pointer',
                                                                            border: expandedPhotoKey === `${entry.id}:${photo.id}` ? '2px solid #0f0' : '2px solid transparent'
                                                                        }}
                                                                    />
                                                                    {editingPhotosId === entry.id && (
                                                                        <div
                                                                            className='button'
                                                                            onClick={() => handleRemovePhotoFromEntry(entry, photo.id)}
                                                                            title='Remove photo'
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
                                            </div>
                                        )}
                                            </>
                                        )}
                                    </div>
                                        );
                                    })()}
                                </div>
                            ))}
                        </div>
                    )
                ) : null
            }
        </div>
    );
};

HistoryPanel.propTypes = {
    history: PropTypes.array,
    onOpenLocation: PropTypes.func,
    onDelete: PropTypes.func,
    onUpdatePhotos: PropTypes.func,
};

export default HistoryPanel;