import React from 'react';
import EntryCard from './EntryCard';

/**
 * ShotLog displays all submitted shots in a scrollable log.
 * Props:
 * - shots: array of shot objects [{ id, subject, mode, timestamp, settings, location }]
 * - onOpenLocation: function(lat, lng) to open Google Maps
 */
const ShotLog = ({ shots = [], onOpenLocation }) => {
    if (!shots || shots.length === 0) {
        return (
            <div className='shot-log containerBox p-10 r-10 bg-dark color-white'>
                <h3 className='size18 bold'>Shot Log</h3>
                <p className='p-10'>No shots logged yet.</p>
            </div>
        );
    }

    return (
        <div className='shot-log containerBox p-10 r-10 bg-dark color-white'>
            <h3 className='size18 bold'>Shot Log</h3>
            <div className='log-list flexColumn gap-10 overflow-auto max-height-400'>
                {shots.map((shot) => (
                    <EntryCard
                        key={shot.id}
                        entry={shot}
                        onOpenLocation={onOpenLocation}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShotLog;