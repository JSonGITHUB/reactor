import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CollapseToggleButton from './CollapseToggleButton';
import getKey from './KeyGenerator';


/**
 * HistoryPanel displays a list of submitted photo/video entries.
 *
 * Props:
 * - history: array of submission objects [{id, subject, mode, timestamp, settings, latitude, longitude}]
 * - onOpenLocation: function(lat, lng) => opens Google Maps
 * - onDelete: function(id) => deletes entry from history
 */
const HistoryPanel = ({ history = [], onOpenLocation, onDelete }) => {
    const [historyCollapsed, setHistoryCollapsed] = useState(true);
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
                                <div key={getKey(entry.id)} className='containerDetail m-5 bg-lite color-lite p-5'>
                                    <div className='containerDetail'>
                                        <div className='containerDetail flexContainer contentLeft p-5 bg-silver'>
                                            <div className='flexColumn containerDetail pl-10 pr-10 pt-35 pb-30 size50 r-10'>
                                                {entry.mode === 'video' ? '🎥' : '📷'}
                                            </div>
                                            <div className='containerDetail flex2Column ml-5 size20 mr-5'>
                                                <div className=' p-10 mr-5 mb-5 mr-5 mt-5 color-yellow'>
                                                    {entry.subject || 'Untitled'}
                                                </div>
                                                <div className='mr-5 mb-5 color-yellow'>
                                                    {entry.description && (
                                                        <div className='pl-10 mt--15 color-lite copyright mb--5'>
                                                            {entry.description}
                                                        </div>
                                                    )}
                                                    <div className='pl-10 color-lite copyright'>
                                                        📅 {new Date(entry.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flexColumn alignRight'>
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
                                        </div>
                                    )}
                                    </div>
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
    onDelete: PropTypes.func
};

export default HistoryPanel;