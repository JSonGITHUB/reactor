import React from 'react';
import { formatDateTime } from '../../utils/date';
import { GlobeIcon, CameraIcon, VideoIcon } from '../../utils/icons';

/**
 * EntryCard - Displays a single shot entry
 * Props:
 * - entry: object containing { id, subject, mode, timestamp, settings, location }
 * - onOpenLocation: function(lat, lng) to open Google Maps
 */
const EntryCard = ({ entry, onOpenLocation }) => {
    if (!entry) return null;

    const { subject, mode, timestamp, settings, location } = entry;

    const handleLocationClick = () => {
        if (location && onOpenLocation) {
            onOpenLocation(location.lat, location.lng);
        }
    };

    return (
        <div className='entry-card containerBox flexRow justify-between align-center p-10 r-5 bg-dark-lite color-white shadow-sm'>
            <div className='entry-left flexColumn'>
                <div className='flexRow align-center gap-5'>
                    {mode === 'photo' ? <CameraIcon /> : <VideoIcon />}
                    <span className='bold'>{subject || 'Untitled'}</span>
                </div>
                <div className='size14 color-light'>
                    {formatDateTime(timestamp)}
                </div>
                <div className='size14 color-light mt-5'>
                    {settings && Object.keys(settings).length > 0
                        ? Object.entries(settings).map(([key, value]) => (
                            <span key={key} className='mr-10'>
                                {key}: {value}
                            </span>
                        ))
                        : 'No settings recorded'}
                </div>
            </div>

            {location && (
                <div className='entry-right'>
                    <button
                        className='icon-button'
                        onClick={handleLocationClick}
                        title='View Location on Map'
                    >
                        <GlobeIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

export default EntryCard;