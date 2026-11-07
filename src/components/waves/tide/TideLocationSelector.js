import React, { useState } from 'react';
import { TIDE_STATIONS } from '../api';

/**
 * TideLocationSelector
 * Allows user to select a NOAA tide station or enter custom coordinates for global tide data.
 * @param {Object} props
 * @param {function} props.onSelect - Called with {station, lat, lon, isCustom} when selection changes
 */
const TideLocationSelector = ({ onSelect }) => {
    const [customLat, setCustomLat] = useState('');
    const [customLon, setCustomLon] = useState('');
    const [selectedId, setSelectedId] = useState(TIDE_STATIONS[0].id);
    const [useCustom, setUseCustom] = useState(false);

    const handleStationChange = (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            setUseCustom(true);
            onSelect({ station: null, lat: customLat, lon: customLon, isCustom: true });
        } else {
            setUseCustom(false);
            setSelectedId(val);
            const station = TIDE_STATIONS.find(s => s.id === val);
            onSelect({ station, lat: station.lat, lon: station.lon, isCustom: false });
        }
    };

    const handleCustomLat = (e) => {
        setCustomLat(e.target.value);
        onSelect({ station: null, lat: e.target.value, lon: customLon, isCustom: true });
    };
    const handleCustomLon = (e) => {
        setCustomLon(e.target.value);
        onSelect({ station: null, lat: customLat, lon: e.target.value, isCustom: true });
    };

    return (
        <div className="containerDetail p-10 mb-10 bg-tinted r-10">
            <label className="size18 bold mb-5">Tide Location:</label>
            <select value={useCustom ? 'custom' : selectedId} onChange={handleStationChange} className="size16 p-5 r-5 mb-5">
                {TIDE_STATIONS.map(station => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                ))}
                <option value="custom">Other (enter coordinates)</option>
            </select>
            {useCustom && (
                <div className="mt-5">
                    <input
                        type="number"
                        step="0.0001"
                        placeholder="Latitude"
                        value={customLat}
                        onChange={handleCustomLat}
                        className="size16 p-5 r-5 mr-5"
                    />
                    <input
                        type="number"
                        step="0.0001"
                        placeholder="Longitude"
                        value={customLon}
                        onChange={handleCustomLon}
                        className="size16 p-5 r-5"
                    />
                </div>
            )}
        </div>
    );
};

export default TideLocationSelector;
