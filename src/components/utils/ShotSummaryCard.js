// src/components/PhotoAssistant/ShotSummaryCard.js
import React from 'react';
import { FaGlobe } from 'react-icons/fa';
import { formatDateTime } from '../../utils/date';
import { getIconForMediaType } from '../../utils/icons'; // placeholder for photo/video icons
import './photoAssistant.css';

const ShotSummaryCard = ({ shot }) => {
    if (!shot) return null;

    const {
        type, // 'photo' or 'video'
        subject,
        description,
        settings, // { aperture, shutter, ISO, focalLength, ... }
        dateTime,
        location, // { lat, lng, placeName }
    } = shot;

    const handleLocationClick = () => {
        if (location && location.lat && location.lng) {
            const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className='shot-summary-card dark-bg color-white r-10 p-10 mb-10 flexColumn shadow-sm'>
            <div className='flexRow alignCenter justifyBetween mb-5'>
                <div className='flexRow alignCenter'>
                    <span className='media-type-icon mr-10'>
                        {getIconForMediaType(type)}
                    </span>
                    <h3 className='size16 bold'>{subject || 'Untitled'}</h3>
                </div>
                {location && location.lat && location.lng && (
                    <button
                        className='icon-button'
                        onClick={handleLocationClick}
                        title={`Open location: ${location.placeName || 'Unknown'}`}
                    >
                        <FaGlobe />
                    </button>
                )}
            </div>

            {description && <p className='size14 mb-5'>{description}</p>}

            {settings && (
                <div className='flexColumn mb-5'>
                    {Object.entries(settings).map(([key, value]) => (
                        <div key={key} className='size14'>
                            <strong>{key}:</strong> {value}
                        </div>
                    ))}
                </div>
            )}

            {dateTime && (
                <div className='size12 color-gray'>
                    Captured: {formatDateTime(dateTime)}
                </div>
            )}
        </div>
    );
};

export default ShotSummaryCard;