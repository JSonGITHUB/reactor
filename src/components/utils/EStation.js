import React, { useEffect, useMemo, useState } from 'react';
import icons from '../site/icons';

const E_STATION_PREFS_KEY = 'estation-preferences-v1';
const E_STATION_CACHE_KEY = 'estation-cached-stations-v1';
const MAP_PREFERENCE_AUTO = 'auto';
const MAP_PREFERENCE_APPLE = 'apple';
const MAP_PREFERENCE_GOOGLE = 'google';

const stations = [
];

const toRad = (value) => (value * Math.PI) / 180;

const amenityIcons = {
    Restrooms: '🚻',
    Food: '🍽️',
    Shopping: '🛍️',
    Coffee: '☕️',
    'Wi-Fi': '📶',
    Nearby: '📍'
};

const amenityStyles = {
    Restrooms: { backgroundColor: '#153a53', color: '#d4efff', border: '1px solid #2f84b8' },
    Food: { backgroundColor: '#3b2912', color: '#ffe8c2', border: '1px solid #bd8b43' },
    Shopping: { backgroundColor: '#3b1430', color: '#ffd3ee', border: '1px solid #c4579a' },
    Coffee: { backgroundColor: '#2d201a', color: '#f2dccf', border: '1px solid #8d6a58' },
    'Wi-Fi': { backgroundColor: '#1d2d3a', color: '#d0f2ff', border: '1px solid #4e92b2' },
    Nearby: { backgroundColor: '#2f2f2f', color: '#ededed', border: '1px solid #5d5d5d' }
};

const inferAmenityTags = (value) => {
    const text = String(value || '').toLowerCase();
    const inferred = [];
    if (/restroom|bathroom|toilet/.test(text)) inferred.push('Restrooms');
    if (/food|restaurant|diner|eatery|kitchen/.test(text)) inferred.push('Food');
    if (/shop|shopping|mall|store|market|retail|plaza/.test(text)) inferred.push('Shopping');
    if (/coffee|espresso|cafe/.test(text)) inferred.push('Coffee');
    if (/wifi|wi-fi|internet/.test(text)) inferred.push('Wi-Fi');
    return Array.from(new Set(inferred));
};

const milesBetween = (lat1, lon1, lat2, lon2) => {
    const earthRadiusMiles = 3958.8;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusMiles * c;
};

const dedupeStations = (stationList) => {
    const seen = new Set();
    return stationList.filter((station) => {
        const key = `${station.name}-${station.lat.toFixed(4)}-${station.lon.toFixed(4)}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const isIPhoneDevice = () => {
    if (typeof navigator === 'undefined') return false;
    return /iphone/i.test(navigator.userAgent || '');
};

const EStation = () => {
    const [position, setPosition] = useState(null);
    const [status, setStatus] = useState(`Tap "Use My Location" to find nearest charging stations.`);
    const [onlyFast, setOnlyFast] = useState(false);
    const [preferredAmenity, setPreferredAmenity] = useState('Any');
    const [sortField, setSortField] = useState('distance');
    const [sortDirection, setSortDirection] = useState('asc');
    const [mapPreference, setMapPreference] = useState(MAP_PREFERENCE_AUTO);
    const [liveStations, setLiveStations] = useState([]);
    const [cachedLiveStations, setCachedLiveStations] = useState([]);
    const [isLoadingStations, setIsLoadingStations] = useState(false);
    const openChargeMapApiKey = process.env.REACT_APP_OCM_API_KEY;
    const nrelApiKey = process.env.REACT_APP_NREL_API_KEY || 'DEMO_KEY';

    useEffect(() => {
        try {
            const stored = localStorage.getItem(E_STATION_PREFS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (typeof parsed.onlyFast === 'boolean') setOnlyFast(parsed.onlyFast);
                if (typeof parsed.preferredAmenity === 'string') setPreferredAmenity(parsed.preferredAmenity);
                if (typeof parsed.sortField === 'string') setSortField(parsed.sortField);
                if (typeof parsed.sortDirection === 'string') setSortDirection(parsed.sortDirection);
                if (typeof parsed.mapPreference === 'string') setMapPreference(parsed.mapPreference);
            }

            const cachedStations = localStorage.getItem(E_STATION_CACHE_KEY);
            if (cachedStations) {
                const parsed = JSON.parse(cachedStations);
                if (Array.isArray(parsed)) setCachedLiveStations(parsed);
            }
        } catch (error) {
            // Ignore malformed payloads.
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(E_STATION_PREFS_KEY, JSON.stringify({
                onlyFast,
                preferredAmenity,
                sortField,
                sortDirection,
                mapPreference
            }));
        } catch (error) {
            // Ignore storage failures in restricted browser modes.
        }
    }, [onlyFast, preferredAmenity, sortField, sortDirection, mapPreference]);

    const inferAmenities = (station) => {
        const text = [
            station?.AddressInfo?.Title,
            station?.AddressInfo?.AddressLine1,
            station?.AddressInfo?.AddressLine2,
            station?.AddressInfo?.Town,
            station?.AddressInfo?.AccessComments,
            station?.GeneralComments,
            station?.UsageType?.Title,
            station?.OperatorInfo?.Title,
            station?.UsageCost
        ]
            .filter(Boolean)
            .join(' ');

        return inferAmenityTags(text);
    };

    const toLocalStation = (station) => {
        const connections = Array.isArray(station?.Connections) ? station.Connections : [];
        const connectorSet = connections
            .map((connection) => connection?.ConnectionType?.Title)
            .filter(Boolean);
        const maxPowerKw = connections.reduce((max, connection) => {
            const kw = Number(connection?.PowerKW) || 0;
            return Math.max(max, kw);
        }, 0);
        const connectorText = connectorSet.join(' ').toLowerCase();
        const fastCharge = maxPowerKw >= 100 || /dc|supercharge|ultra|rapid/.test(connectorText);

        return {
            id: `live-${station?.ID || Math.random()}`,
            name: station?.AddressInfo?.Title || 'Charging Station',
            network: station?.OperatorInfo?.Title || 'Unknown Network',
            lat: Number(station?.AddressInfo?.Latitude) || 0,
            lon: Number(station?.AddressInfo?.Longitude) || 0,
            powerKw: maxPowerKw || 0,
            connectors: connectorSet.length > 0 ? connectorSet : ['Unknown'],
            open24h: String(station?.UsageType?.Title || '').toLowerCase().includes('24'),
            amenities: inferAmenities(station),
            fastCharge
        };
    };

    const toLocalStationFromNrel = (station) => {
        const connectors = Array.isArray(station?.ev_connector_types) && station.ev_connector_types.length > 0
            ? station.ev_connector_types
            : ['Unknown'];
        const fastCharge = Number(station?.ev_dc_fast_num) > 0;
        const fallbackPower = fastCharge ? 150 : 19;
        return {
            id: `nrel-${station?.id || Math.random()}`,
            name: station?.station_name || 'Charging Station',
            network: station?.ev_network || 'Unknown Network',
            lat: Number(station?.latitude) || 0,
            lon: Number(station?.longitude) || 0,
            powerKw: fallbackPower,
            connectors,
            open24h: /24/.test(String(station?.access_days_time || '')),
            amenities: inferAmenityTags([
                station?.station_name,
                station?.intersection_directions,
                station?.access_days_time,
                station?.facility_type,
                station?.ev_network,
                station?.street_address,
                station?.city
            ].filter(Boolean).join(' ')),
            fastCharge
        };
    };

    const fetchFromOpenChargeMap = async (lat, lon) => {
        const query = new URLSearchParams({
            output: 'json',
            countrycode: 'US',
            latitude: String(lat),
            longitude: String(lon),
            distance: '50',
            distanceunit: 'KM',
            maxresults: '30',
            compact: 'true',
            verbose: 'false'
        });

        const headers = openChargeMapApiKey
            ? { 'X-API-Key': openChargeMapApiKey }
            : undefined;
        const response = await fetch(`https://api.openchargemap.io/v3/poi/?${query.toString()}`, { headers });
        if (!response.ok) {
            throw new Error(`Open Charge Map request failed with ${response.status}`);
        }
        const payload = await response.json();
        return Array.isArray(payload)
            ? payload.map(toLocalStation).filter((station) => station.lat && station.lon)
            : [];
    };

    const fetchFromNrelNearest = async (lat, lon) => {
        const query = new URLSearchParams({
            api_key: nrelApiKey,
            fuel_type: 'ELEC',
            latitude: String(lat),
            longitude: String(lon),
            radius: '50',
            limit: '40',
            status: 'E'
        });
        const response = await fetch(`https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?${query.toString()}`);
        if (!response.ok) {
            throw new Error(`NREL nearest request failed with ${response.status}`);
        }
        const payload = await response.json();
        const stationsPayload = Array.isArray(payload?.fuel_stations) ? payload.fuel_stations : [];
        return stationsPayload.map(toLocalStationFromNrel).filter((station) => station.lat && station.lon);
    };

    const fetchFromNrelState = async (stateCode) => {
        const query = new URLSearchParams({
            api_key: nrelApiKey,
            fuel_type: 'ELEC',
            state: stateCode,
            limit: '80',
            status: 'E'
        });
        const response = await fetch(`https://developer.nrel.gov/api/alt-fuel-stations/v1.json?${query.toString()}`);
        if (!response.ok) {
            throw new Error(`NREL state request failed with ${response.status}`);
        }
        const payload = await response.json();
        const stationsPayload = Array.isArray(payload?.fuel_stations) ? payload.fuel_stations : [];
        return stationsPayload.map(toLocalStationFromNrel).filter((station) => station.lat && station.lon);
    };

    const fetchLiveStations = async (lat, lon) => {
        setIsLoadingStations(true);
        try {
            let mapped = [];

            try {
                mapped = await fetchFromOpenChargeMap(lat, lon);
                if (mapped.length > 0) {
                    const deduped = dedupeStations(mapped);
                    setLiveStations(deduped);
                    setCachedLiveStations(deduped);
                    try {
                        localStorage.setItem(E_STATION_CACHE_KEY, JSON.stringify(deduped));
                    } catch (cacheError) {
                        // Ignore storage failures.
                    }
                    setStatus('Live charging stations loaded (Open Charge Map).');
                    return;
                }
            } catch (error) {
                // Continue to secondary providers if Open Charge Map is unavailable.
            }

            try {
                mapped = await fetchFromNrelNearest(lat, lon);
                if (mapped.length > 0) {
                    const deduped = dedupeStations(mapped);
                    setLiveStations(deduped);
                    setCachedLiveStations(deduped);
                    try {
                        localStorage.setItem(E_STATION_CACHE_KEY, JSON.stringify(deduped));
                    } catch (cacheError) {
                        // Ignore storage failures.
                    }
                    setStatus('Live charging stations loaded (NREL).');
                    return;
                }
            } catch (error) {
                // Continue to state-level fallback feeds.
            }

            try {
                const [caStations, ncStations] = await Promise.all([
                    fetchFromNrelState('CA'),
                    fetchFromNrelState('NC')
                ]);
                const statewide = dedupeStations([...caStations, ...ncStations]);
                if (statewide.length > 0) {
                    setLiveStations(statewide);
                    setCachedLiveStations(statewide);
                    try {
                        localStorage.setItem(E_STATION_CACHE_KEY, JSON.stringify(statewide));
                    } catch (cacheError) {
                        // Ignore storage failures.
                    }
                    setStatus('Live charging stations loaded (NREL California + North Carolina feeds).');
                    return;
                }
            } catch (error) {
                // Falls through to cache/sample data message below.
            }

            if (cachedLiveStations.length > 0) {
                setLiveStations(cachedLiveStations);
                setStatus('APIs unavailable. Showing previously cached stations.');
            } else {
                setLiveStations([]);
                setStatus('Unable to load live station data from Open Charge Map or NREL. Showing sample stations.');
            }
        } catch (error) {
            if (cachedLiveStations.length > 0) {
                setLiveStations(cachedLiveStations);
                setStatus('APIs unavailable. Showing previously cached stations.');
            } else {
                setLiveStations([]);
                setStatus('Unable to load live station data from Open Charge Map or NREL. Showing sample stations.');
            }
        } finally {
            setIsLoadingStations(false);
        }
    };

    const locateUser = () => {
        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported by this browser.');
            return;
        }

        setStatus('Finding your location...');
        navigator.geolocation.getCurrentPosition(
            (coords) => {
                const nextPosition = {
                    lat: coords.coords.latitude,
                    lon: coords.coords.longitude
                };
                setPosition(nextPosition);
                setStatus('Location found. Loading live charging stations...');
                fetchLiveStations(nextPosition.lat, nextPosition.lon);
            },
            () => {
                setStatus('Unable to access your location. Check browser permissions.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const stationResults = useMemo(() => {
        const sourceStations = liveStations.length > 0 ? liveStations : stations;
        const base = onlyFast ? sourceStations.filter((station) => station.fastCharge) : sourceStations;

        const withDistance = base.map((station) => {
            if (!position) {
                return {
                    ...station,
                    distanceMiles: null
                };
            }
            return {
                ...station,
                distanceMiles: milesBetween(position.lat, position.lon, station.lat, station.lon)
            };
        });

        const getSortValue = (station) => {
            switch (sortField) {
            case 'name':
                return String(station.name || '').toLowerCase();
            case 'network':
                return String(station.network || '').toLowerCase();
            case 'powerKw':
                return Number(station.powerKw) || 0;
            case 'connectors':
                return Array.isArray(station.connectors) ? station.connectors.length : 0;
            case 'open24h':
                return station.open24h ? 1 : 0;
            case 'fastCharge':
                return station.fastCharge ? 1 : 0;
            case 'amenities':
                return Array.isArray(station.amenities) ? station.amenities.length : 0;
            case 'distance':
            default:
                return station.distanceMiles == null ? Number.POSITIVE_INFINITY : station.distanceMiles;
            }
        };

        const sortMultiplier = sortDirection === 'desc' ? -1 : 1;

        return withDistance.sort((a, b) => {
            if (preferredAmenity !== 'Any') {
                const aHasAmenity = Array.isArray(a.amenities) && a.amenities.includes(preferredAmenity);
                const bHasAmenity = Array.isArray(b.amenities) && b.amenities.includes(preferredAmenity);
                if (aHasAmenity !== bHasAmenity) {
                    return aHasAmenity ? -1 : 1;
                }
            }

            const aValue = getSortValue(a);
            const bValue = getSortValue(b);

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const result = aValue.localeCompare(bValue);
                if (result !== 0) return result * sortMultiplier;
            } else {
                const result = Number(aValue) - Number(bValue);
                if (result !== 0) return result * sortMultiplier;
            }

            return String(a.name || '').localeCompare(String(b.name || ''));
        });
    }, [liveStations, onlyFast, position, preferredAmenity, sortDirection, sortField]);

    const renderAmenities = (amenities = []) => {
        const amenityList = amenities.length > 0 ? amenities : ['Nearby'];
        return amenityList.map((amenity) => {
            const amenityIcon = amenityIcons[amenity] || '📍';
            const amenityStyle = amenityStyles[amenity] || amenityStyles.Nearby;
            return (
                <span
                    className='containerDetail pl-10 pr-10 mr-5 size10'
                    key={amenity}
                    title={amenity}
                    style={amenityStyle}
                >
                    <span>{amenityIcon}</span>
                    <span className='ml-5'>{amenity}</span>
                </span>
            );
        });
    };

    const openStationInMaps = (station) => {
        if (!station?.lat || !station?.lon) return;
        const destination = `${station.lat},${station.lon}`;
        const resolvedPreference = mapPreference === MAP_PREFERENCE_AUTO
            ? (isIPhoneDevice() ? MAP_PREFERENCE_APPLE : MAP_PREFERENCE_GOOGLE)
            : mapPreference;
        const mapUrl = resolvedPreference === MAP_PREFERENCE_APPLE
            ? `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&dirflg=d`
            : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        window.open(mapUrl, '_blank', 'noopener,noreferrer');
    };

    const resetFilters = () => {
        setOnlyFast(false);
        setPreferredAmenity('Any');
        setSortField('distance');
        setSortDirection('asc');
        setMapPreference(MAP_PREFERENCE_AUTO);
        try {
            localStorage.removeItem(E_STATION_PREFS_KEY);
        } catch (error) {
            // Ignore storage failures in restricted browser modes.
        }
        setStatus('Filters reset to defaults. Keeping current station data.');
    };

    return (
        <div className='containerDetail contentLeft bg-lite ml-5 mr-5 mt--25'>
            <div className='containerDetail bg-lite pl-15 pt-20 pb-20 color-yellow size25 mb-5'>
                <span className='mr-5'>{icons.estation || '⚡️'}</span>
                EStation
            </div>

            <div className='containerDetail bg-lite color-lite'>
                <div className='flexContainer'>
                    <div className='containerDetail p-10 size15 bg-green contentCenter flex3Column button containerDetail mr-5 color-yellow brdr-yellow' onClick={locateUser}>
                        Use My Location
                    </div>
                    <label className='flex3Column button containerDetail bg-green brdr-green size15 color-yellow'>
                        <input
                            className='ml-10 mt-18'
                            type='checkbox'
                            checked={onlyFast}
                            onChange={(event) => setOnlyFast(event.target.checked)}
                        />
                        Fast Charge
                    </label>
                    <label className='button ml-2 flex3Column'>
                        <select
                            className='containerDetail size15 pt-25 pb-20 bg-tintedMedium color-lite mt--1 width-100-percent'
                            value={mapPreference}
                            onChange={(event) => setMapPreference(event.target.value)}
                        >
                            <option value={MAP_PREFERENCE_AUTO}>Maps: Auto</option>
                            <option value={MAP_PREFERENCE_APPLE}>Apple Maps</option>
                            <option value={MAP_PREFERENCE_GOOGLE}>Google Maps</option>
                        </select>
                    </label>
                </div>
                <div className='flexContainer mt--3'>
                    <label className='flex3Column'>
                        {/*Sort By:*/}
                        <select
                            className='containerDetail p-10 ml--1 bg-tintedMedium color-lite'
                            value={sortField}
                            onChange={(event) => setSortField(event.target.value)}
                        >
                            <option value='distance'>Distance</option>
                            <option value='name'>Name</option>
                            <option value='network'>Network</option>
                            <option value='powerKw'>Power (kW)</option>
                            <option value='connectors'>Connector Count</option>
                            <option value='open24h'>24/7 Availability</option>
                            <option value='fastCharge'>Fast Charge</option>
                            <option value='amenities'>Amenity Count</option>
                        </select>
                    </label>

                    <label className='flex3Column'>
                        {/*Direction:*/}
                        <select
                            className='containerDetail p-10 ml-3 bg-tintedMedium color-lite'
                            value={sortDirection}
                            onChange={(event) => setSortDirection(event.target.value)}
                        >
                            <option value='asc'>Ascending</option>
                            <option value='desc'>Descending</option>
                        </select>
                    </label>

                    <label className='flex3Column'>
                        {/*Amenity:*/}
                        <select
                            className='containerDetail p-10 ml-3 bg-tintedMedium color-lite width-100-percent'
                            value={preferredAmenity}
                            onChange={(event) => setPreferredAmenity(event.target.value)}
                        >
                            <option value='Any'>Any</option>
                            <option value='Restrooms'>Restrooms</option>
                            <option value='Food'>Food</option>
                            <option value='Shopping'>Shopping</option>
                            <option value='Coffee'>Coffee</option>
                            <option value='Wi-Fi'>Wi-Fi</option>
                        </select>
                    </label>
                </div>
                <button
                    type='button'
                    className='containerDetail flexColumn button bg-green ml-5 color-yellow width-100-percent mt-5 p-10'
                    onClick={resetFilters}
                >
                    Reset Filters
                </button>
                <div className='containerDetail color-orange p-10 mt-5'>
                    {status}
                </div>
                {
                    isLoadingStations
                        ? <div className='containerDetail color-yellow p-10 mt-5'>Loading live station feed...</div>
                        : null
                }
            </div>
            {
                (stationResults.length === 0)
                ? null
                : <div className='containerDetail color-lite size20 bg-lite mb-5 mt-10'>
                    {
                        liveStations.length > 0
                            ? <div className='containerDetail color-neogreen brdr-green p-10 bg-dkGreen'>⚡️ Data source: Live API</div>
                            : null
                    }
                    <div className='containerDetail mt-5'>
                    {
                        stationResults.map((station, idx) => (
                            <div
                                className={`containerDetail bg-lite ${(idx > 0) ? 'mt-5' : null} button`}
                                key={station.id}
                                onClick={() => openStationInMaps(station)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        openStationInMaps(station);
                                    }
                                }}
                                role='button'
                                tabIndex={0}
                                aria-label={`Open ${station.name} in Google Maps`}
                            >
                                <div className='containerDetail p-10'>
                                    <div className='color-yellow size20'>🌎 {station.name}</div>
                                    <div className='color-orange size12'>{station.network} | {station.powerKw}kW</div>
                                </div>

                                <div className='containerDetail bg-lite flexContainer mt-5 size10'>
                                    <div className={`containerDetail p-10 mr-5 ${station.fastCharge ? 'bg-dkGreen brdr-green color-yellow' : 'bg-lite color-orange'}`}>
                                        {station.fastCharge ? '⚡️ Fast Charge' : '🐌 Standard Charge'}
                                    </div>
                                    <div className='containerDetail p-10 mr-5 bg-lite color-lite'>
                                        {station.open24h ? '🕛 24/7' : '🕘🕔 Limited Hours'}
                                    </div>
                                    <div className='containerDetail p-10 bg-lite color-lite'>
                                        🔌{station.connectors.join(' | ')}
                                    </div>
                                </div>

                                <div className='color-orange size25 flexContainer'>
                                    <div className='containerDetail flexContainer flex2Column mt-5 mr-5'>
                                        {renderAmenities(station.amenities)}
                                    </div>
                                    <div className='containerDetail flexColumn color-lite p-10 contentRight size15 mt-5'>
                                        {station.distanceMiles == null ? '--' : `${station.distanceMiles.toFixed(1)}`}<span className='size10 color-yellow'>miles</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                    </div>
                </div>
            }
            </div>
    );
};

export default EStation;
