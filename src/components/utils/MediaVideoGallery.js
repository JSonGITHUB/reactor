import React, { useState, useEffect, useRef } from 'react';

/**
 * MediaVideoGallery - Reusable video gallery component with edit mode and delete
 * 
 * Props:
 *   videos: Array of video objects [{id, name, size, type, lastModified, url}]
 *   onVideosChange: Callback when videos are modified (added/removed)
 *   onVideoSelect: Optional callback when a video is selected
 *   onVideoDeselect: Optional callback when a video is deselected
 *   onAddVideos: Optional callback for custom file handling (default: internal handling)
 *   title: Display title (default: "Videos")
 *   showAddButton: Whether to show add video button (default: true)
 *   isCollapsed: Panel collapse state
 *   onCollapsedChange: Callback for collapse state changes
 *   inputId: Unique ID for file input
 *   onPersistVideo: Optional callback to persist video (receives: id, file, metadata)
 *   onRemoveVideo: Optional callback to remove video from storage (receives: id)
 *   onGetVideoBlob: Optional callback to retrieve blob for a video ID (receives: id, returns: Promise<blob>)
 */
const MediaVideoGallery = ({
    videos = [],
    onVideosChange,
    onVideoSelect,
    onVideoDeselect,
    onAddVideos,
    title = 'Videos',
    showAddButton = true,
    isCollapsed = true,
    onCollapsedChange,
    inputId = 'media-video-input',
    onPersistVideo,
    onRemoveVideo,
    onGetVideoBlob,
}) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [expandedVideo, setExpandedVideo] = useState(null);
    const [isRowCollapsed, setIsRowCollapsed] = useState(true);
    const blobUrlCacheRef = useRef(new Map()); // Cache blob URLs by video ID
    const [, setRefresh] = useState(0); // Force re-render when URLs are loaded

    // Load blob URLs for persisted videos and cache them
    useEffect(() => {
        const loadVideoUrls = async () => {
            const cache = blobUrlCacheRef.current;
            let hasNewUrls = false;

            await Promise.all(
                videos.map(async (video) => {
                    // Skip if URL already cached or video has inline URL
                    if (video.url || cache.has(video.id)) return;
                    if (!onGetVideoBlob) return;

                    try {
                        const blob = await onGetVideoBlob(video.id);
                        if (blob) {
                            const blobUrl = URL.createObjectURL(blob);
                            cache.set(video.id, blobUrl);
                            hasNewUrls = true;
                        }
                    } catch (error) {
                        console.error(`Failed to load video ${video.id}:`, error);
                    }
                })
            );

            // Trigger re-render if new URLs were loaded
            if (hasNewUrls) {
                setRefresh((prev) => prev + 1);
            }
        };

        loadVideoUrls();

        // Cleanup: revoke URLs for videos that no longer exist
        return () => {
            const cache = blobUrlCacheRef.current;
            const currentVideoIds = new Set(videos.map((v) => v.id));
            
            for (const [videoId, blobUrl] of cache.entries()) {
                if (!currentVideoIds.has(videoId)) {
                    URL.revokeObjectURL(blobUrl);
                    cache.delete(videoId);
                }
            }
        };
    }, [videos, onGetVideoBlob]);

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

    const buildVideoId = ({ name, size, lastModified, webkitRelativePath, relativePath }) => {
        const path = String(webkitRelativePath || relativePath || '').replace(/\\/g, '/');
        return `${path || name}-${size}-${lastModified}`;
    };

    const isVideoLikeFile = (file) => {
        const mime = String(file?.type || '').toLowerCase();
        if (mime.startsWith('video/')) return true;
        return /\.(mp4|m4v|mov|webm|ogv|avi|mkv|3gp|3g2)$/i.test(String(file?.name || ''));
    };

    const formatBytes = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleAddVideos = async (fileList) => {
        if (onAddVideos) {
            onAddVideos(fileList);
            return;
        }

        const files = Array.from(fileList || []).filter(isVideoLikeFile);
        if (files.length === 0) return;

        const nextVideos = [...videos];
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

            if (onPersistVideo) {
                onPersistVideo(id, file, {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                }).catch((error) => {
                    console.error('[MediaVideoGallery] Unable to persist video:', error);
                });
            }
        });

        onVideosChange(nextVideos);
    };

    const handleRemoveVideo = (videoId) => {
        const nextVideos = videos.filter((video) => video.id !== videoId);
        const removed = videos.find((video) => video.id === videoId);

        if (removed?.url) {
            safeRevokeObjectUrl(removed.url);
        }

        if (expandedVideo?.id === videoId) {
            setExpandedVideo(null);
        }

        onVideosChange(nextVideos);

        if (onRemoveVideo) {
            onRemoveVideo(videoId).catch((error) => {
                console.error('[MediaVideoGallery] Unable to remove video:', error);
            });
        }
    };

    const handleVideoClick = (video) => {
        if (expandedVideo?.id === video.id) {
            setExpandedVideo(null);
            if (onVideoDeselect) onVideoDeselect(video);
        } else {
            setExpandedVideo(video);
            if (onVideoSelect) onVideoSelect(video);
        }
    };

    const getVideoUrl = (video) => {
        if (video.url) return video.url;
        return blobUrlCacheRef.current.get(video.id) || '';
    };

    const hasVideos = videos.length > 0;
    const expandedIndex = expandedVideo ? videos.findIndex((video) => video.id === expandedVideo.id) : -1;
    const canGoPrev = expandedIndex > 0;
    const canGoNext = expandedIndex < videos.length - 1;

    return (
        <div className='containerDetail mt-10 bg-lite'>
            {/* Expanded Video View */}
            {expandedVideo && hasVideos && (
                <div className='containerDetail bg-dark mb-10' style={{ width: '100%', boxSizing: 'border-box' }}>
                    {/* Video Controls */}
                    <div className='flexContainer centerVertical p-5'>
                        <div
                            className='button p-10 size20 color-soft'
                            onClick={() => canGoPrev && setExpandedVideo(videos[expandedIndex - 1])}
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
                            {expandedVideo.name} ({expandedIndex + 1} / {videos.length})
                        </div>
                        <div
                            className='button p-10 size20 color-soft'
                            onClick={() => canGoNext && setExpandedVideo(videos[expandedIndex + 1])}
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

                    {/* Video Player */}
                    <video
                        src={getVideoUrl(expandedVideo)}
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
            )}

            {/* Video Grid/Row */}
            {hasVideos && (
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
                {videos.map((video, index) => (
                    <div
                        key={`${video.id || index}`}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleVideoClick(video);
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
                            src={getVideoUrl(video)}
                            title={video.name}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                handleVideoClick(video);
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
                        {isEditMode && (
                            <div
                                className='button'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemoveVideo(video.id);
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
            )}

            {/* Header with Add Button and Edit Toggle */}
            {showAddButton && (
                <div className='containerDetail flexContainer centerVertical p-10 bg-dark'>
                    <label 
                        htmlFor={inputId}
                        className='containerDetail flexColumn bg-yellow button bg-lite color-dark size12 p-10'
                    >
                        ➕🎥
                        <input
                            id={inputId}
                            type='file'
                            accept='video/*'
                            multiple
                            aria-label={`Add ${title.toLowerCase()}`}
                            style={{ display: 'none' }}
                            onChange={(event) => {
                                handleAddVideos(event.target.files);
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
                    <div className='flex2Column ml-10'>{`${title} (${videos.length})`}</div>
                </div>
            )}
        </div>
    );
};

export default MediaVideoGallery;
