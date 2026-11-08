import React, { useState, useEffect, useRef } from 'react';

/**
 * MediaPhotoGallery - Reusable photo gallery component with edit mode, delete, fullscreen, and slideshow
 * 
 * Props:
 *   photos: Array of photo objects [{id, name, size, type, lastModified, url, blob}]
 *   onPhotosChange: Callback when photos are modified (added/removed)
 *   onPhotoSelect: Optional callback when a photo is selected
 *   onPhotoDeselect: Optional callback when a photo is deselected
 *   onAddPhotos: Optional callback for custom file handling (default: internal handling)
 *   title: Display title (default: "Photos")
 *   showAddButton: Whether to show add photo button (default: true)
 *   allowSlideshow: Enable slideshow mode (default: true)
 *   allowFullscreen: Enable fullscreen mode (default: true)
 *   isCollapsed: Panel collapse state
 *   onCollapsedChange: Callback for collapse state changes
 *   inputId: Unique ID for file input
 *   onPersistPhoto: Optional callback to persist photo (receives: id, file)
 *   onRemovePhoto: Optional callback to remove photo from storage (receives: id)
 *   onGetPhotoBlob: Optional callback to retrieve blob for a photo ID (receives: id, returns: Promise<blob>)
 */
const MediaPhotoGallery = ({
    photos = [],
    onPhotosChange,
    onPhotoSelect,
    onPhotoDeselect,
    onAddPhotos,
    title = 'Photos',
    showAddButton = true,
    allowSlideshow = true,
    allowFullscreen = true,
    isCollapsed = true,
    onCollapsedChange,
    inputId = 'media-photo-input',
    onPersistPhoto,
    onRemovePhoto,
    onGetPhotoBlob,
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [expandedPhoto, setExpandedPhoto] = useState(null);
    const [isRowCollapsed, setIsRowCollapsed] = useState(true);
    const [isSlideshow, setIsSlideshow] = useState(false);
    const [slideshowDelay, setSlideshowDelay] = useState(2);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const blobUrlCacheRef = useRef(new Map()); // Cache blob URLs by photo ID
    const loadedPhotoIdsRef = useRef(new Set()); // Track which photos have been loaded
    const [, setRefresh] = useState(0); // Force re-render when URLs are loaded

    // Load blob URLs for persisted photos and cache them
    useEffect(() => {
        const loadPhotoUrls = async () => {
            const cache = blobUrlCacheRef.current;
            const loaded = loadedPhotoIdsRef.current;
            let hasNewUrls = false;

            await Promise.all(
                photos.map(async (photo) => {
                    // Skip if already loaded, has inline URL, or no callback
                    if (loaded.has(photo.id)) {
                        console.log(`[MediaPhotoGallery] Photo ${photo.id} already loaded, skipping`);
                        return;
                    }
                    if (photo.url) {
                        console.log(`[MediaPhotoGallery] Photo ${photo.id} has inline URL, skipping blob load`);
                        loaded.add(photo.id);
                        return;
                    }
                    if (!onGetPhotoBlob) {
                        console.log(`[MediaPhotoGallery] Photo ${photo.id} has no onGetPhotoBlob callback, skipping`);
                        return;
                    }

                    console.log(`[MediaPhotoGallery] Attempting to load blob for photo ${photo.id}`);
                    try {
                        const blob = await onGetPhotoBlob(photo.id);
                        if (blob) {
                            console.log(`[MediaPhotoGallery] Successfully retrieved blob for photo ${photo.id}, creating URL`);
                            const blobUrl = URL.createObjectURL(blob);
                            cache.set(photo.id, blobUrl);
                            hasNewUrls = true;
                        } else {
                            console.warn(`[MediaPhotoGallery] onGetPhotoBlob returned null/falsy for photo ${photo.id}`);
                        }
                        // Mark as loaded regardless of success (prevent retry loop)
                        loaded.add(photo.id);
                        console.log(`[MediaPhotoGallery] Marked photo ${photo.id} as loaded`);
                    } catch (error) {
                        console.error(`[MediaPhotoGallery] Failed to load photo ${photo.id}:`, error);
                        // Still mark as attempted to avoid infinite retry
                        loaded.add(photo.id);
                    }
                })
            );

            // Trigger re-render if new URLs were loaded
            if (hasNewUrls) {
                console.log('[MediaPhotoGallery] Triggering re-render due to new URLs');
                setRefresh((prev) => prev + 1);
            }
        };

        console.log(`[MediaPhotoGallery] useEffect triggered, photos count: ${photos.length}`);
        loadPhotoUrls();

        // Cleanup: revoke URLs for photos that no longer exist
        return () => {
            const cache = blobUrlCacheRef.current;
            const loaded = loadedPhotoIdsRef.current;
            const currentPhotoIds = new Set(photos.map((p) => p.id));
            
            for (const [photoId, blobUrl] of cache.entries()) {
                if (!currentPhotoIds.has(photoId)) {
                    URL.revokeObjectURL(blobUrl);
                    cache.delete(photoId);
                    loaded.delete(photoId);
                }
            }
        };
    }, [photos, onGetPhotoBlob]);

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

    const isImageLikeFile = (file) => {
        const mime = String(file?.type || '').toLowerCase();
        if (mime.startsWith('image/')) return true;
        return /\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i.test(String(file?.name || ''));
    };

    const formatBytes = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleAddPhotos = async (fileList) => {
        if (onAddPhotos) {
            onAddPhotos(fileList);
            return;
        }

        const files = Array.from(fileList || []).filter(isImageLikeFile);
        if (files.length === 0) return;

        const nextPhotos = [...photos];
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

            if (onPersistPhoto) {
                onPersistPhoto(id, file).catch((error) => {
                    console.error('[MediaPhotoGallery] Unable to persist photo:', error);
                });
            }
        });

        onPhotosChange(nextPhotos);
    };

    const handleRemovePhoto = (photoId) => {
        const nextPhotos = photos.filter((photo) => photo.id !== photoId);
        const removed = photos.find((photo) => photo.id === photoId);

        if (removed?.url) {
            safeRevokeObjectUrl(removed.url);
        }

        if (expandedPhoto?.id === photoId) {
            setExpandedPhoto(null);
        }

        onPhotosChange(nextPhotos);

        if (onRemovePhoto) {
            onRemovePhoto(photoId).catch((error) => {
                console.error('[MediaPhotoGallery] Unable to remove photo:', error);
            });
        }
    };

    // Slideshow timer effect
    useEffect(() => {
        if (!isSlideshow || !expandedPhoto || photos.length === 0) {
            return;
        }

        const currentIndex = photos.findIndex((photo) => photo.id === expandedPhoto.id);
        const isLastPhoto = currentIndex === photos.length - 1;

        const timer = setTimeout(() => {
            const updatedIndex = photos.findIndex((photo) => photo.id === expandedPhoto.id);
            const updatedIsLast = updatedIndex === photos.length - 1;

            if (updatedIsLast) {
                setIsSlideshow(false);
                setIsFullscreen(false);
            } else {
                const nextIndex = (updatedIndex + 1) % photos.length;
                setExpandedPhoto(photos[nextIndex]);
            }
        }, slideshowDelay * 1000);

        return () => clearTimeout(timer);
    }, [isSlideshow, expandedPhoto, slideshowDelay, photos]);

    const handlePhotoClick = (photo) => {
        if (expandedPhoto?.id === photo.id) {
            setExpandedPhoto(null);
            setIsFullscreen(false);
            setIsSlideshow(false);
            if (onPhotoDeselect) onPhotoDeselect(photo);
        } else {
            setExpandedPhoto(photo);
            if (allowFullscreen) setIsFullscreen(true);
            if (onPhotoSelect) onPhotoSelect(photo);
        }
    };

    const handlePhotoClickInGrid = (photo) => {
        if (expandedPhoto?.id === photo.id) {
            setExpandedPhoto(null);
            setIsFullscreen(false);
            setIsSlideshow(false);
        } else {
            setExpandedPhoto(photo);
            setIsFullscreen(true);
        }
    };

    const getPhotoUrl = (photo) => {
        if (photo.url) return photo.url;
        const cachedUrl = blobUrlCacheRef.current.get(photo.id);
        return cachedUrl || null; // Return null if URL not ready yet
    };

    const hasPhotos = photos.length > 0;
    const expandedIndex = expandedPhoto ? photos.findIndex((photo) => photo.id === expandedPhoto.id) : -1;
    const canGoPrev = expandedIndex > 0;
    const canGoNext = expandedIndex < photos.length - 1;

    return (
        <div className='containerDetail mt-10 bg-lite'>
            {/* Expanded Photo View */}
            {expandedPhoto && hasPhotos && (
                <div 
                    className={`containerDetail ${isFullscreen ? '' : 'bg-dark mb-10'}`}
                    style={isFullscreen ? {
                        position: 'fixed',
                        top: 60,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: 'calc(100% - 60px)',
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
                    {/* Normal View Navigation */}
                    {!isFullscreen && (
                        <div className='flexContainer centerVertical p-5'>
                            <div
                                className='button p-10 size20 color-soft'
                                onClick={() => canGoPrev && setExpandedPhoto(photos[expandedIndex - 1])}
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
                                {expandedPhoto.name} ({expandedIndex + 1} / {photos.length})
                            </div>
                            <div
                                className='button p-10 size20 color-soft'
                                onClick={() => canGoNext && setExpandedPhoto(photos[expandedIndex + 1])}
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

                    {/* Normal View Slideshow Controls */}
                    {!isFullscreen && allowSlideshow && (
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
                                style={{ minWidth: 120 }}
                            >
                                {isSlideshow ? '⏸ Slideshow' : '▶ Slideshow'}
                            </div>
                            {isSlideshow && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <label style={{ fontSize: 12, color: '#999' }}>Delay (s):</label>
                                    <input
                                        type='number'
                                        min='0.5'
                                        max='10'
                                        step='0.5'
                                        value={slideshowDelay}
                                        onChange={(e) => setSlideshowDelay(parseFloat(e.target.value) || 2)}
                                        style={{
                                            width: 50,
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            border: '1px solid #666',
                                            backgroundColor: '#222',
                                            color: '#fff',
                                            fontSize: 12,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Photo Image - Only render if URL is available */}
                    {(() => {
                        const photoUrl = getPhotoUrl(expandedPhoto);
                        return photoUrl ? (
                            <img
                                src={photoUrl}
                                alt={expandedPhoto.name || 'Photo'}
                                onClick={() => {
                                    if (isFullscreen) setIsFullscreen(false);
                                }}
                                style={isFullscreen ? {
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    width: 'auto',
                                    height: 'auto',
                                    cursor: 'pointer',
                                } : {
                                    width: '100%',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    margin: '0 auto',
                                }}
                            />
                        ) : (
                            <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                                Loading photo...
                            </div>
                        );
                    })()}

                    {/* Fullscreen Info Badge */}
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

                    {/* Fullscreen Photo Info */}
                    {isFullscreen && (
                        <div style={{
                            position: 'absolute',
                            bottom: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#fff',
                            fontSize: 14,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            padding: '8px 12px',
                            borderRadius: 4,
                            zIndex: 10001,
                        }}>
                            {expandedPhoto.name} ({expandedIndex + 1} / {photos.length})
                        </div>
                    )}

                    {/* Fullscreen Navigation */}
                    {isFullscreen && (
                        <>
                            <div
                                className='button'
                                onClick={() => canGoPrev && setExpandedPhoto(photos[expandedIndex - 1])}
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

                            {allowSlideshow && (
                                <div
                                    className={`containerDetail button ${isSlideshow ? 'bg-neogreen' : 'bg-dark'}`}
                                    onClick={() => setIsSlideshow(!isSlideshow)}
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        bottom: 12,
                                        fontSize: 14,
                                        color: '#ccc',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
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
                            )}

                            <div
                                className='button'
                                onClick={() => canGoNext && setExpandedPhoto(photos[expandedIndex + 1])}
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
            )}

            {/* Photo Grid/Row */}
            {hasPhotos && (
            <div
                className='flexContainer mt--5'
                style={{
                    flexWrap: (isRowCollapsed ?? true) ? 'nowrap' : 'wrap',
                    gap: 8,
                    overflowX: (isRowCollapsed ?? true) ? 'auto' : 'visible',
                    overflowY: 'hidden',
                    paddingBottom: (isRowCollapsed ?? true) ? 6 : 0,
                }}
            >
                {photos.map((photo, index) => {
                    const photoUrl = getPhotoUrl(photo);
                    // Skip rendering photos without loaded URLs to avoid broken img tags
                    if (!photoUrl) return null;
                    
                    return (
                    <div key={`${photo.id || index}`} style={{ position: 'relative', width: 64, height: 64, flex: '0 0 auto' }}>
                        <img
                            src={photoUrl}
                            alt={photo.name || `Photo ${index + 1}`}
                            title={`${photo.name || 'Photo'}${photo.size ? ` (${formatBytes(photo.size)})` : ''}`}
                            onClick={() => handlePhotoClickInGrid(photo)}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 4,
                                display: 'block',
                                cursor: 'pointer',
                                border: expandedPhoto?.id === photo.id ? '2px solid #0f0' : '2px solid transparent',
                            }}
                        />
                        {isEditMode && (
                            <div
                                className='button'
                                onClick={() => handleRemovePhoto(photo.id)}
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
                    );
                })}
            </div>
            )}

            {/* Header with Add Button and Edit Toggle */}
            {showAddButton && (
                <div className='containerDetail flexContainer centerVertical p-10 bg-dark'>
                    <label 
                        htmlFor={inputId}
                        className='containerDetail flexColumn bg-yellow button bg-lite color-dark size12 p-10'
                    >
                        ➕📷
                        <input
                            id={inputId}
                            type='file'
                            accept='image/*'
                            multiple
                            aria-label={`Add ${title.toLowerCase()}`}
                            style={{ display: 'none' }}
                            onChange={(event) => {
                                handleAddPhotos(event.target.files);
                                event.target.value = '';
                            }}
                        />
                    </label>
                    <div
                        className='containerDetail button bg-lite color-yellow p-10 size12'
                        onClick={() => setIsEditMode((prev) => !prev)}
                        title={isEditMode ? 'Hide remove buttons' : 'Show remove buttons'}
                        style={{ fontWeight: 600, minWidth: 48, textAlign: 'center', marginLeft: 8 }}
                    >
                        ✏️
                    </div>
                    <div className='flex2Column ml-10'>{`${title} (${photos.length})`}</div>
                </div>
            )}
        </div>
    );
};

export default MediaPhotoGallery;
