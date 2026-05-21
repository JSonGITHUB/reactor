import React, { useEffect, useMemo, useRef, useState } from 'react';
import icons from '../site/icons';

const createLocationId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const WATER_STATION_PREFS_KEY = 'waterstation-preferences-v1';
const WATER_STATION_CACHE_KEY = 'waterstation-cached-stations-v1';
const WATER_SAVED_LOCATIONS_KEY = 'waterstation-saved-locations-v1';
const MAP_PREFERENCE_AUTO = 'auto';
const MAP_PREFERENCE_APPLE = 'apple';
const MAP_PREFERENCE_GOOGLE = 'google';
const LIVE_QUERY_MODE_PRIMO = 'primo';
const LIVE_QUERY_MODE_GLACIER = 'glacier';
const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '';

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

const amenityIcons = {
    Filtered: '⛲️',
    'Bottle Refill': '🫙',
    'Water Point': '🚰',
    water_point: '🚰',
    drinking_water: '🥛',
    Alkaline: '🧪',
    Nearby: '📍',
    'Saved Location': '⭐',
};

const amenityStyles = {
    Filtered: { backgroundColor: '#1d2d3a', color: '#d0f2ff', border: '1px solid #4e92b2' },
    'Bottle Refill': { backgroundColor: '#3b2912', color: '#ffe8c2', border: '1px solid #bd8b43' },
    'Water Point': { backgroundColor: '#2a3b4c', color: '#cce7ff', border: '1px solid #4e92b2' },
    water_point: { backgroundColor: '#2a3b4c', color: '#cce7ff', border: '1px solid #4e92b2' },
    drinking_water: { backgroundColor: '#2a3b4c', color: '#cce7ff', border: '1px solid #4e92b2' },
    Alkaline: { backgroundColor: '#3b1430', color: '#ffd3ee', border: '1px solid #c4579a' },
    Nearby: { backgroundColor: '#2f2f2f', color: '#ededed', border: '1px solid #5d5d5d' },
    'Saved Location': { backgroundColor: '#2d223f', color: '#efe0ff', border: '1px solid #8a67c7' },
};

const toRad = (value) => (value * Math.PI) / 180;

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

const isIPhoneDevice = () => {
    if (typeof navigator === 'undefined') return false;
    return /iphone/i.test(navigator.userAgent || '');
};

const normalizeOverpassStation = (element) => {
    const tags = element?.tags || {};
    const lat = Number(element?.lat);
    const lon = Number(element?.lon);
    const name =
        tags.name ||
        tags['name:en'] ||
        tags.brand ||
        tags.operator ||
        'Water Refill';

    const addressBits = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
        tags['addr:state'],
    ].filter(Boolean);

    return {
        id: `osm-${element.id}`,
        lat,
        lon,
        name,
        address: addressBits.join(' ').trim(),
        city: tags['addr:city'] || '',
        state_province: tags['addr:state'] || '',
        open24h: String(tags.opening_hours || '').toLowerCase().includes('24/7'),
        amenities: ['Water Point'],
        water_type: tags['drinking_water:refill'] === 'yes' ? 'Refill' : '',
        tags: { amenity: tags.amenity || 'drinking_water' },
    };
};

const normalizeGooglePlaceStation = (place) => {
    const lat = Number(place?.location?.latitude);
    const lon = Number(place?.location?.longitude);
    const name = String(place?.displayName?.text || 'Primo Water Refill').trim();
    const address = String(place?.formattedAddress || '').trim();

    return {
        id: `google-${place?.id || `${lat}-${lon}`}`,
        lat,
        lon,
        name,
        address,
        city: '',
        state_province: '',
        open24h: Boolean(place?.regularOpeningHours?.openNow),
        amenities: ['Bottle Refill'],
        water_type: 'Primo',
        tags: { amenity: 'bottle_refill' },
        network: 'Primo Water',
    };
};

const searchGooglePlacesDirect = async ({ lat, lon, radius, textQuery = 'Primo Water refill' }) => {
    if (!GOOGLE_PLACES_API_KEY) return [];

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': [
                'places.id',
                'places.displayName',
                'places.formattedAddress',
                'places.location',
                'places.regularOpeningHours.openNow',
                'places.businessStatus',
                'places.types',
            ].join(','),
        },
        body: JSON.stringify({
            textQuery,
            maxResultCount: 20,
            locationBias: {
                circle: {
                    center: { latitude: lat, longitude: lon },
                    radius,
                },
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Direct Google Places failed: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data?.places) ? data.places : [];
};

const shouldUseProxyForGooglePlaces = () => {
    if (typeof window === 'undefined') return true;
    const host = String(window.location.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
};

const Water = () => {
    const skipNextAutoFetchRef = useRef(false);
    const [position, setPosition] = useState(null);
    const [status, setStatus] = useState(`Tap "Find Water" to locate nearby water refill stations.`);
    const [sortField, setSortField] = useState('distance');
    const [sortDirection, setSortDirection] = useState('asc');
    const [liveQueryMode, setLiveQueryMode] = useState(LIVE_QUERY_MODE_PRIMO);
    const [mapPreference, setMapPreference] = useState(MAP_PREFERENCE_AUTO);
    const [stations, setStations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [savedLocations, setSavedLocations] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(WATER_SAVED_LOCATIONS_KEY) || '[]');
            if (!Array.isArray(stored)) return [];
            return stored
                .map((loc) => ({
                    id: String(loc.id || createLocationId()),
                    name: String(loc.name || '').trim(),
                    lat: Number(loc.lat),
                    lon: Number(loc.lon),
                    address: String(loc.address || '').trim(),
                    city: String(loc.city || '').trim(),
                    state_province: String(loc.state_province || '').trim(),
                    category: String(loc.category || 'Saved').trim() || 'Saved',
                    network: String(loc.network || '').trim(),
                    icon: String(loc.icon || '📍').trim() || '📍',
                }))
                .filter((loc) => loc.name && Number.isFinite(loc.lat) && Number.isFinite(loc.lon));
        } catch {
            return [];
        }
    });
    const [newLocationName, setNewLocationName] = useState('');
    const [newLocationLat, setNewLocationLat] = useState('');
    const [newLocationLon, setNewLocationLon] = useState('');
    const [newLocationCategory, setNewLocationCategory] = useState('Saved');
    const [newLocationIcon, setNewLocationIcon] = useState('💧');
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const [locationsCollapsed, setLocationsCollapsed] = useState(true);
    const [locationsSortMode, setLocationsSortMode] = useState('distance');
    const [editingLocationId, setEditingLocationId] = useState(null);
    const [editingLocationName, setEditingLocationName] = useState('');
    const [editingLocationLat, setEditingLocationLat] = useState('');
    const [editingLocationLon, setEditingLocationLon] = useState('');
    const [editingLocationCategory, setEditingLocationCategory] = useState('Saved');
    const [editingLocationIcon, setEditingLocationIcon] = useState('📍');
    const [recentlyEditedLocationId, setRecentlyEditedLocationId] = useState(null);

    const stationResults = useMemo(() => {
        const liveStations = stations.map((station) => ({
            ...station,
            sourceType: 'live',
            displayIcon: '💧',
        }));

        const savedAsStations = savedLocations.reduce((acc, location) => {
            const locLat = Number(location.lat);
            const locLon = Number(location.lon);
            const matchedLive = liveStations.find((station) => {
                const stationLat = Number(station.latitude || station.lat);
                const stationLon = Number(station.longitude || station.lon);
                if (!Number.isFinite(stationLat) || !Number.isFinite(stationLon)) return false;
                return milesBetween(locLat, locLon, stationLat, stationLon) < 0.01;
            });

            // Do not render duplicate rows when a saved location overlaps
            // with a currently loaded live station.
            if (matchedLive) {
                return acc;
            }

            acc.push({
                id: `saved-${location.id}`,
                lat: locLat,
                lon: locLon,
                name: location.name,
                address: location.address || 'Saved location',
                city: location.city || '',
                state_province: location.state_province || '',
                open24h: false,
                amenities: ['Saved Location'],
                tags: { amenity: 'Saved Location' },
                network: location.network || location.category || 'Saved',
                sourceType: 'saved',
                displayIcon: location.icon || '📍',
            });

            return acc;
        }, []);

        const mergedStations = [...liveStations, ...savedAsStations];

        const withDistance = mergedStations.map((station) => {
            const lat = Number(station.latitude || station.lat);
            const lon = Number(station.longitude || station.lon);
            return {
                ...station,
                distanceMiles: (position && lat && lon) ? milesBetween(position.lat, position.lon, lat, lon) : null
            };
        });

        const getSortValue = (station) => {
            switch (sortField) {
                case 'name':
                    return String(station.name || station.title || '').toLowerCase();
                case 'network':
                    return String(station.network || '').toLowerCase();
                case 'open24h':
                    return station.open24h ? 1 : 0;
                case 'distance':
                default:
                    return station.distanceMiles == null ? Number.POSITIVE_INFINITY : station.distanceMiles;
            }
        };
        const sortMultiplier = sortDirection === 'desc' ? -1 : 1;
        return withDistance.sort((a, b) => {
            const aValue = getSortValue(a);
            const bValue = getSortValue(b);
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const result = aValue.localeCompare(bValue);
                if (result !== 0) return result * sortMultiplier;
            } else {
                const result = Number(aValue) - Number(bValue);
                if (result !== 0) return result * sortMultiplier;
            }
            return String(a.name || a.title || '').localeCompare(String(b.name || b.title || ''));
        });
    }, [position, savedLocations, sortDirection, sortField, stations]);

    const sortedSavedLocations = useMemo(() => {
        const items = [...savedLocations];
        if (locationsSortMode === 'name') {
            return items.sort((a, b) => a.name.localeCompare(b.name));
        }
        return items.sort((a, b) => {
            if (!position) return a.name.localeCompare(b.name);
            const aDist = milesBetween(position.lat, position.lon, Number(a.lat), Number(a.lon));
            const bDist = milesBetween(position.lat, position.lon, Number(b.lat), Number(b.lon));
            const diff = aDist - bDist;
            return diff !== 0 ? diff : a.name.localeCompare(b.name);
        });
    }, [locationsSortMode, position, savedLocations]);

    const mergeStationsIntoSavedLocations = (incomingStations, mode) => {
        if (!Array.isArray(incomingStations) || incomingStations.length === 0) return;

        setSavedLocations((prevLocations) => {
            const merged = [...prevLocations];

            for (const station of incomingStations) {
                const stationLat = Number(station?.lat ?? station?.latitude);
                const stationLon = Number(station?.lon ?? station?.longitude);
                if (!Number.isFinite(stationLat) || !Number.isFinite(stationLon)) continue;

                const duplicateIndex = merged.findIndex((existing) => {
                    const existingLat = Number(existing.lat);
                    const existingLon = Number(existing.lon);
                    if (!Number.isFinite(existingLat) || !Number.isFinite(existingLon)) return false;
                    return milesBetween(existingLat, existingLon, stationLat, stationLon) < 0.01;
                });

                const modeLabel = mode === LIVE_QUERY_MODE_GLACIER ? 'Glacier API' : 'Primo API';
                const nextLocation = {
                    id: String(station.id || createLocationId()),
                    name: String(station.name || station.title || 'Water Refill').trim() || 'Water Refill',
                    lat: stationLat,
                    lon: stationLon,
                    address: String(station.address || station.address_line_1 || '').trim(),
                    city: String(station.city || station.town || station.village || station.hamlet || station.county || '').trim(),
                    state_province: String(station.state_province || station.state || '').trim(),
                    category: modeLabel,
                    network: String(station.network || '').trim() || modeLabel,
                    icon: (station.tags?.amenity === 'bottle_refill' || station.network === 'Primo Water') ? '🫙' : '⛲️',
                };

                if (duplicateIndex === -1) {
                    merged.unshift(nextLocation);
                } else {
                    const existingLocation = merged[duplicateIndex];
                    // Preserve user edits (name/category/icon/address fields) when
                    // a station is re-merged from cache or live API by proximity.
                    merged[duplicateIndex] = {
                        ...nextLocation,
                        ...existingLocation,
                        lat: stationLat,
                        lon: stationLon,
                        network: nextLocation.network || existingLocation.network,
                        id: existingLocation.id || nextLocation.id,
                    };
                }
            }

            return merged;
        });
    };

    const fetchStations = async (mode = liveQueryMode) => {
        if (!position) {
            setStatus('Location required to search for nearby stations.');
            return;
        }

        // Check cache first: if cached data exists within 5 miles and mode matches, use it
        try {
            const cached = localStorage.getItem(WATER_STATION_CACHE_KEY);
            if (cached) {
                const cacheData = JSON.parse(cached);
                if (
                    cacheData.stations &&
                    cacheData.lat &&
                    cacheData.lon &&
                    cacheData.mode === mode
                ) {
                    const distFromCache = milesBetween(
                        position.lat,
                        position.lon,
                        cacheData.lat,
                        cacheData.lon
                    );
                    if (distFromCache < 5) {
                        // Use cached data
                        setStations(cacheData.stations);
                        mergeStationsIntoSavedLocations(cacheData.stations, mode);
                        setStatus(
                            mode === LIVE_QUERY_MODE_PRIMO
                                ? `Primo Water refill stations loaded (from cache, ${distFromCache.toFixed(1)} miles from last search).`
                                : `Glacier water refill stations loaded (from cache, ${distFromCache.toFixed(1)} miles from last search).`
                        );
                        return;
                    }
                }
            }
        } catch (e) {
            // Ignore cache errors and proceed with fresh fetch
        }

        setIsLoading(true);
        setStatus(
            mode === LIVE_QUERY_MODE_PRIMO
                ? 'Loading nearby Primo Water refill stations...'
                : 'Loading nearby Glacier water refill stations...'
        );
        const radiusMeters = 5000;
        const { lat, lon } = position;
        let stations = [];
        let googleDeniedReason = '';
        let googleDebugInfo = {};
        let usedPrimoBroadFallback = false;
        let fetched = false;
        try {
            const primoQuery = `
[out:json][timeout:25];
(
    node["name"~"Primo",i](around:${radiusMeters},${lat},${lon});
    node["brand"~"Primo",i](around:${radiusMeters},${lat},${lon});
    node["operator"~"Primo",i](around:${radiusMeters},${lat},${lon});
    node["shop"="water"]["name"~"Primo",i](around:${radiusMeters},${lat},${lon});
    node["amenity"="drinking_water"]["name"~"Primo",i](around:${radiusMeters},${lat},${lon});
    node["drinking_water:refill"="yes"]["name"~"Primo",i](around:${radiusMeters},${lat},${lon});
);
out body;
`;
            const tapQuery = `
[out:json][timeout:25];
(
    node["amenity"="drinking_water"](around:${radiusMeters},${lat},${lon});
    node["shop"="water"](around:${radiusMeters},${lat},${lon});
    node["vending"="water"](around:${radiusMeters},${lat},${lon});
    node["drinking_water:refill"="yes"](around:${radiusMeters},${lat},${lon});
);
out body;
`;
            const glacierQuery = `
[out:json][timeout:25];
(
    node["name"~"Glacier",i](around:${radiusMeters},${lat},${lon});
    node["brand"~"Glacier",i](around:${radiusMeters},${lat},${lon});
    node["operator"~"Glacier",i](around:${radiusMeters},${lat},${lon});
    node["shop"="water"]["name"~"Glacier",i](around:${radiusMeters},${lat},${lon});
    node["amenity"="drinking_water"]["name"~"Glacier",i](around:${radiusMeters},${lat},${lon});
    node["drinking_water:refill"="yes"]["name"~"Glacier",i](around:${radiusMeters},${lat},${lon});
);
out body;
`;
            if (mode === LIVE_QUERY_MODE_PRIMO) {
                // Prefer Google Places for branded business accuracy; fallback to Overpass on failures.
                let places = [];
                if (shouldUseProxyForGooglePlaces()) {
                    try {
                        const googleResponse = await fetch(`/api/google/places/primo-nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radius=${radiusMeters}`);
                        if (googleResponse.ok) {
                            const googleData = await googleResponse.json();
                            places = Array.isArray(googleData?.places) ? googleData.places : [];
                            googleDebugInfo = googleData?.debug || {};

                            // Log proxy response for debugging
                            if (!places.length) {
                                console.warn('[Water Primo] Proxy returned empty places array', {
                                    source: googleData?.source,
                                    debug: googleDebugInfo,
                                });
                            }

                            const legacyStatus = googleData?.debug?.lastLegacyApiStatus;
                            if (!places.length && legacyStatus === 'REQUEST_DENIED') {
                                googleDeniedReason = String(
                                    googleData?.debug?.lastLegacyErrorMessage ||
                                    'Google Places access denied for this API key/project.'
                                );
                            }
                        } else {
                            console.error('[Water Primo] Proxy returned error status', {
                                status: googleResponse.status,
                                statusText: googleResponse.statusText,
                            });

                            // Proxy unavailable path: attempt direct browser call.
                            try {
                                places = await searchGooglePlacesDirect({ lat, lon, radius: radiusMeters });
                                googleDebugInfo = { source: 'places-api-new-direct-browser' };
                            } catch (directError) {
                                const directErrorMessage = String(directError?.message || directError || '');
                                googleDeniedReason = directErrorMessage || googleDeniedReason;
                                googleDebugInfo = {
                                    source: 'places-api-new-direct-browser-error',
                                    directErrorMessage,
                                };
                                console.warn('[Water Primo] Direct Google Places fallback failed', directErrorMessage);
                            }
                        }
                    } catch (error) {
                        console.error('[Water Primo] Proxy request failed', error?.message);

                        // Network/proxy failure path: attempt direct browser call as fallback.
                        try {
                            places = await searchGooglePlacesDirect({ lat, lon, radius: radiusMeters });
                            googleDebugInfo = { source: 'places-api-new-direct-browser' };
                        } catch (directError) {
                            const directErrorMessage = String(directError?.message || directError || '');
                            googleDeniedReason = directErrorMessage || googleDeniedReason;
                            googleDebugInfo = {
                                source: 'places-api-new-direct-browser-error',
                                directErrorMessage,
                            };
                            console.warn('[Water Primo] Direct Google Places fallback failed', directErrorMessage);
                        }
                        // Ignore and fallback below.
                    }
                } else {
                    try {
                        places = await searchGooglePlacesDirect({ lat, lon, radius: radiusMeters });
                        googleDebugInfo = { source: 'places-api-new-direct-browser' };
                    } catch (directError) {
                        const directErrorMessage = String(directError?.message || directError || '');
                        googleDeniedReason = directErrorMessage || googleDeniedReason;
                        googleDebugInfo = {
                            source: 'places-api-new-direct-browser-error',
                            directErrorMessage,
                        };
                        console.warn('[Water Primo] Direct Google Places (static host) failed', directErrorMessage);
                    }
                }

                if (places.length > 0) {
                    stations = places
                        .map(normalizeGooglePlaceStation)
                        .filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon))
                        .map((station) => ({
                            ...station,
                            _distance: milesBetween(lat, lon, station.lat, station.lon),
                        }))
                        .sort((a, b) => a._distance - b._distance)
                        .slice(0, 120)
                        .map(({ _distance, ...station }) => station);
                } else {
                    const response = await fetch(OVERPASS_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                        body: `data=${encodeURIComponent(primoQuery)}`,
                    });
                    if (!response.ok) {
                        throw new Error(`Overpass request failed: ${response.status}`);
                    }
                    const data = await response.json();
                    const elements = Array.isArray(data?.elements) ? data.elements : [];

                    stations = elements
                        .map(normalizeOverpassStation)
                        .filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon))
                        .filter((station) => {
                            const nameText = `${station.name || ''} ${station.address || ''}`.toLowerCase();
                            return nameText.includes('primo');
                        })
                        .map((station) => ({
                            ...station,
                            _distance: milesBetween(lat, lon, station.lat, station.lon),
                        }))
                        .sort((a, b) => a._distance - b._distance)
                        .slice(0, 120)
                        .map(({ _distance, ...station }) => station);

                    // If branded Primo tags are sparse, fallback to general refill points for this area.
                    if (stations.length === 0) {
                        const broadResponse = await fetch(OVERPASS_API, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                            body: `data=${encodeURIComponent(tapQuery)}`,
                        });
                        if (broadResponse.ok) {
                            const broadData = await broadResponse.json();
                            const broadElements = Array.isArray(broadData?.elements) ? broadData.elements : [];
                            stations = broadElements
                                .map(normalizeOverpassStation)
                                .filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon))
                                .map((station) => ({
                                    ...station,
                                    _distance: milesBetween(lat, lon, station.lat, station.lon),
                                }))
                                .sort((a, b) => a._distance - b._distance)
                                .slice(0, 120)
                                .map(({ _distance, ...station }) => station);
                            usedPrimoBroadFallback = stations.length > 0;
                        }
                    }
                }
            } else if (mode === LIVE_QUERY_MODE_GLACIER) {
                let places = [];
                try {
                    places = await searchGooglePlacesDirect({
                        lat,
                        lon,
                        radius: radiusMeters,
                        textQuery: 'Glacier water refill',
                    });
                    googleDebugInfo = { source: 'places-api-new-direct-browser-glacier' };
                } catch (directError) {
                    const directErrorMessage = String(directError?.message || directError || '');
                    googleDeniedReason = directErrorMessage || googleDeniedReason;
                    googleDebugInfo = {
                        source: 'places-api-new-direct-browser-glacier-error',
                        directErrorMessage,
                    };
                    console.warn('[Water Glacier] Direct Google Places failed', directErrorMessage);
                }

                if (places.length > 0) {
                    stations = places
                        .map(normalizeGooglePlaceStation)
                        .filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon))
                        .map((station) => ({
                            ...station,
                            _distance: milesBetween(lat, lon, station.lat, station.lon),
                        }))
                        .sort((a, b) => a._distance - b._distance)
                        .slice(0, 120)
                        .map(({ _distance, ...station }) => station);
                } else {
                    const response = await fetch(OVERPASS_API, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                        body: `data=${encodeURIComponent(glacierQuery)}`,
                    });
                    if (!response.ok) {
                        throw new Error(`Overpass request failed: ${response.status}`);
                    }
                    const data = await response.json();
                    const elements = Array.isArray(data?.elements) ? data.elements : [];

                    stations = elements
                        .map(normalizeOverpassStation)
                        .filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lon))
                        .filter((station) => {
                            const nameText = `${station.name || ''} ${station.address || ''}`.toLowerCase();
                            return nameText.includes('glacier');
                        })
                        .map((station) => ({
                            ...station,
                            _distance: milesBetween(lat, lon, station.lat, station.lon),
                        }))
                        .sort((a, b) => a._distance - b._distance)
                        .slice(0, 120)
                        .map(({ _distance, ...station }) => station);
                }
            }

            setStations(stations);
            mergeStationsIntoSavedLocations(stations, mode);

            setStatus(
                stations.length
                    ? (mode === LIVE_QUERY_MODE_PRIMO
                        ? (usedPrimoBroadFallback
                            ? `Nearby refill points loaded (Primo fallback - ${googleDebugInfo?.newApiErrorMessage ? 'Google API unavailable' : 'no Primo results in area'}).`
                            : 'Primo Water refill stations loaded.')
                        : 'Glacier water refill stations loaded.')
                    : (mode === LIVE_QUERY_MODE_PRIMO
                        ? (googleDeniedReason
                            ? `No Primo Water refill stations found nearby. ${googleDeniedReason}`
                            : 'No Primo Water refill stations found nearby.')
                        : 'No Glacier water refill stations found nearby.')
            );
            // Save to localStorage with position and mode
            try {
                localStorage.setItem(WATER_STATION_CACHE_KEY, JSON.stringify({
                    lat,
                    lon,
                    mode,
                    timestamp: Date.now(),
                    stations
                }));
            } catch (e) {
                // Ignore storage errors
            }
            fetched = true;
        } catch (error) {
            // On error, try to load from cache
            let cache = null;
            try {
                const cached = localStorage.getItem(WATER_STATION_CACHE_KEY);
                if (cached) {
                    cache = JSON.parse(cached);
                }
            } catch (e) {
                // Ignore parse errors
            }
            if (cache && cache.mode === mode && cache.stations && cache.lat && cache.lon) {
                // Only use cache if within 10 miles of cached location
                const dist = milesBetween(lat, lon, cache.lat, cache.lon);
                if (dist < 10) {
                    setStations(cache.stations);
                    mergeStationsIntoSavedLocations(cache.stations, mode);
                    setStatus(
                        mode === LIVE_QUERY_MODE_PRIMO
                            ? 'Loaded cached Primo water refill points (live source unavailable).'
                            : 'Loaded cached Glacier water refill points (live source unavailable).'
                    );
                    fetched = true;
                }
            }
            if (!fetched) {
                setStatus(
                    mode === LIVE_QUERY_MODE_PRIMO
                        ? 'Unable to load live or cached Primo Water refill data.'
                        : 'Unable to load live or cached Glacier water refill data.'
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        try {
            const stored = localStorage.getItem(WATER_STATION_PREFS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (typeof parsed.sortField === 'string') setSortField(parsed.sortField);
                if (typeof parsed.sortDirection === 'string') setSortDirection(parsed.sortDirection);
                if (typeof parsed.liveQueryMode === 'string') setLiveQueryMode(parsed.liveQueryMode);
                if (typeof parsed.mapPreference === 'string') setMapPreference(parsed.mapPreference);
            }
        } catch (error) {
            // Ignore malformed payloads.
        }
    }, []);

    useEffect(() => {
        try {
            const cachedRaw = localStorage.getItem(WATER_STATION_CACHE_KEY);
            if (!cachedRaw) return;
            const cache = JSON.parse(cachedRaw);
            const cachedStations = Array.isArray(cache?.stations) ? cache.stations : [];
            if (!cachedStations.length) return;
            const cachedMode = cache?.mode === LIVE_QUERY_MODE_GLACIER ? LIVE_QUERY_MODE_GLACIER : LIVE_QUERY_MODE_PRIMO;
            mergeStationsIntoSavedLocations(cachedStations, cachedMode);
        } catch {
            // Ignore cache parse failures.
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(WATER_STATION_PREFS_KEY, JSON.stringify({
                sortField,
                sortDirection,
                liveQueryMode,
                mapPreference
            }));
        } catch (error) {
            // Ignore storage failures in restricted browser modes.
        }
    }, [liveQueryMode, sortField, sortDirection, mapPreference]);

    useEffect(() => {
        try {
            localStorage.setItem(WATER_SAVED_LOCATIONS_KEY, JSON.stringify(savedLocations));
        } catch (error) {
            // Ignore storage failures in restricted browser modes.
        }
    }, [savedLocations]);

    useEffect(() => {
        if (!recentlyEditedLocationId) return undefined;
        const timeoutId = setTimeout(() => setRecentlyEditedLocationId(null), 3000);
        return () => clearTimeout(timeoutId);
    }, [recentlyEditedLocationId]);

    const resetLocationForm = () => {
        setNewLocationName('');
        setNewLocationLat('');
        setNewLocationLon('');
        setNewLocationCategory('Saved');
        setNewLocationIcon('💧');
    };

    const closeLocationDialog = () => {
        setIsLocationDialogOpen(false);
        resetLocationForm();
    };

    const addSavedLocation = () => {
        const name = String(newLocationName || '').trim();
        const lat = Number(newLocationLat);
        const lon = Number(newLocationLon);

        if (!name) {
            setStatus('Enter a location name.');
            return;
        }

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            setStatus('Enter valid latitude and longitude.');
            return;
        }

        const nextLocation = {
            id: createLocationId(),
            name,
            lat,
            lon,
            category: String(newLocationCategory || 'Saved').trim() || 'Saved',
            icon: String(newLocationIcon || '📍').trim() || '📍',
        };

        setSavedLocations((prev) => {
            const existingIndex = prev.findIndex((loc) => loc.name.toLowerCase() === name.toLowerCase());
            if (existingIndex === -1) return [nextLocation, ...prev];
            const next = [...prev];
            next[existingIndex] = {
                ...next[existingIndex],
                lat,
                lon,
                category: nextLocation.category,
                icon: nextLocation.icon,
            };
            return next;
        });

        setStatus(`Saved location: ${name}.`);
        closeLocationDialog();
    };

    const saveCurrentLocation = () => {
        if (!position) {
            setStatus('Use My Location first, then save it.');
            return;
        }

        const fallbackName = `Location ${savedLocations.length + 1}`;
        const name = String(newLocationName || fallbackName).trim();
        const nextLocation = {
            id: createLocationId(),
            name,
            lat: Number(position.lat),
            lon: Number(position.lon),
            category: String(newLocationCategory || 'Saved').trim() || 'Saved',
            icon: String(newLocationIcon || '📍').trim() || '📍',
        };

        setSavedLocations((prev) => {
            const existingIndex = prev.findIndex((loc) => loc.name.toLowerCase() === name.toLowerCase());
            if (existingIndex === -1) return [nextLocation, ...prev];
            const next = [...prev];
            next[existingIndex] = {
                ...next[existingIndex],
                lat: nextLocation.lat,
                lon: nextLocation.lon,
                category: nextLocation.category,
                icon: nextLocation.icon,
            };
            return next;
        });

        setStatus(`Saved current location as ${name}.`);
        closeLocationDialog();
    };

    const removeSavedLocation = (id) => {
        setSavedLocations((prev) => prev.filter((loc) => loc.id !== id));
    };

    const startEditSavedLocation = (location) => {
        setEditingLocationId(location.id);
        setEditingLocationName(location.name);
        setEditingLocationLat(String(location.lat));
        setEditingLocationLon(String(location.lon));
        setEditingLocationCategory(String(location.category || 'Saved'));
        setEditingLocationIcon(String(location.icon || '📍'));
    };

    const cancelEditSavedLocation = () => {
        setEditingLocationId(null);
        setEditingLocationName('');
        setEditingLocationLat('');
        setEditingLocationLon('');
        setEditingLocationCategory('Saved');
        setEditingLocationIcon('💧');
    };

    const saveEditedSavedLocation = () => {
        const name = String(editingLocationName || '').trim();
        const lat = Number(editingLocationLat);
        const lon = Number(editingLocationLon);
        const category = String(editingLocationCategory || 'Saved').trim() || 'Saved';
        const icon = String(editingLocationIcon || '📍').trim() || '📍';
        const editedId = editingLocationId;

        if (!editedId) return;
        if (!name) {
            setStatus('Enter a location name.');
            return;
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            setStatus('Enter valid latitude and longitude.');
            return;
        }

        setSavedLocations((prev) => prev.map((loc) => (
            loc.id === editedId
                ? { ...loc, name, lat, lon, category, icon }
                : loc
        )));
        setLocationsCollapsed(false);
        setRecentlyEditedLocationId(editedId);
        setStatus(`Updated location: ${name}.`);
        cancelEditSavedLocation();
    };

    const selectSavedLocation = (location) => {
        setPosition({ lat: Number(location.lat), lon: Number(location.lon) });
        setStatus(`Using saved location: ${location.name}. Loading water refill stations...`);
    };

    const locateUserOnly = () => {
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
                // Use My Location updates local position context only for distance calculations.
                skipNextAutoFetchRef.current = true;
                setPosition(nextPosition);
                setStatus('Location found. Saved location distances updated.');
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

    const locateUserAndFetch = (mode = LIVE_QUERY_MODE_PRIMO) => {
        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported by this browser.');
            return;
        }
        setLiveQueryMode(mode);
        setStatus('Finding your location...');
        navigator.geolocation.getCurrentPosition(
            (coords) => {
                const nextPosition = {
                    lat: coords.coords.latitude,
                    lon: coords.coords.longitude
                };
                skipNextAutoFetchRef.current = false;
                setPosition(nextPosition);
                setStatus(
                    mode === LIVE_QUERY_MODE_PRIMO
                        ? 'Location found. Loading Primo Water refill stations...'
                        : 'Location found. Loading Glacier water refill stations...'
                );
                // fetchStations will be called by useEffect when position changes
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

    // Fetch stations when position changes
    useEffect(() => {
        if (position) {
            if (skipNextAutoFetchRef.current) {
                skipNextAutoFetchRef.current = false;
                return;
            }
            fetchStations(liveQueryMode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, liveQueryMode]);

    const renderAmenities = (amenities) => {
        const list = Array.isArray(amenities)
            ? amenities
            : (amenities ? [amenities] : ['Nearby']);

        return list.map((amenity) => {
            const amenityIcon = amenityIcons[amenity] || '📍';
            const amenityStyle = amenityStyles[amenity] || amenityStyles.Nearby;
            return (
                <span
                    className='containerDetail p-10 mr-5 mb-15 size10 flexColumn'
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
        const lat = Number(station.latitude || station.lat);
        const lon = Number(station.longitude || station.lon);
        if (!lat || !lon) return;
        const destination = `${lat},${lon}`;
        const resolvedPreference = mapPreference === MAP_PREFERENCE_AUTO
            ? (isIPhoneDevice() ? MAP_PREFERENCE_APPLE : MAP_PREFERENCE_GOOGLE)
            : mapPreference;
        const mapUrl = resolvedPreference === MAP_PREFERENCE_APPLE
            ? `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&dirflg=d`
            : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        window.open(mapUrl, '_blank', 'noopener,noreferrer');
    };

    const resetFilters = () => {
        setSortField('distance');
        setSortDirection('asc');
        setLiveQueryMode(LIVE_QUERY_MODE_PRIMO);
        setMapPreference(MAP_PREFERENCE_AUTO);
        try {
            localStorage.removeItem(WATER_STATION_PREFS_KEY);
        } catch (error) {
            // Ignore storage failures in restricted browser modes.
        }
        setStatus('Filters reset to defaults.');
    };

    const clearPrimoCache = () => {
        try {
            localStorage.removeItem(WATER_STATION_CACHE_KEY);
        } catch (error) {
            // Ignore storage failures in restricted browser modes.
        }

        setStations([]);
        setSavedLocations((prev) => prev.filter((loc) => {
            const category = String(loc.category || '').toLowerCase();
            const network = String(loc.network || '').toLowerCase();
            const isPrimoApiSaved = category.includes('primo api') || network.includes('primo api');
            return !isPrimoApiSaved;
        }));

        setStatus('Cleared cache and auto-saved Primo entries.');
    };

    return (
        <div className='containerDetail contentLeft bg-lite ml-5 mr-5 mt--25'>
            <div className='containerDetail bg-lite pl-15 pt-20 pb-20 color-yellow size25 mb-5'>
                <span className='mr-5'>{icons.water || '⛲️'}</span>
                Water Refill Stations
            </div>

            <div className='containerDetail bg-lite color-lite'>
                <div className='flexContainer'>
                    <div className='containerDetail pt-15 size20 contentCenter flex2Column button containerDetail bg-blue mr-5 color-yellow mt-5' onClick={locateUserOnly}>
                        📡 Use My Location
                    </div>
                    
                    <label className='button flex2Column mt--5'>
                        <select
                            className='containerDetail p-20 size20 bg-tintedMedium color-lite'
                            value={mapPreference}
                            onChange={(event) => setMapPreference(event.target.value)}
                        >
                            <option value={MAP_PREFERENCE_AUTO}>🗺️ Maps: Auto</option>
                            <option value={MAP_PREFERENCE_APPLE}>🍎 Apple Maps</option>
                            <option value={MAP_PREFERENCE_GOOGLE}>🟢 Google Maps</option>
                        </select>
                    </label>
                </div>
                <div
                    className='containerDetail p-20 size20 contentCenter flex2Column button bg-green  color-yellow mt-5'
                    onClick={() => setIsLocationDialogOpen(true)}
                >
                    ➕ Add Location
                </div>
                <div
                    className='containerDetail p-20 size20 contentCenter flex2Column button bg-dkBlue brdr-blue color-yellow mt-5'
                    onClick={() => locateUserAndFetch(LIVE_QUERY_MODE_PRIMO)}
                >
                    💧 Find Water
                </div>

                {isLocationDialogOpen ? (
                    <div className='containerDetail mt-10 p-10 bg-dark'>
                        <div className='color-yellow size15 mb-5 p-10 size20'>Add / Save Location</div>
                        <div>
                            <input
                                type='text'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Location name (Home, Office...)'
                                value={newLocationName}
                                onChange={(event) => setNewLocationName(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='number'
                                step='0.000001'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Latitude'
                                value={newLocationLat}
                                onChange={(event) => setNewLocationLat(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='number'
                                step='0.000001'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Longitude'
                                value={newLocationLon}
                                onChange={(event) => setNewLocationLon(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='text'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Category (Home, Office, Trail...)'
                                value={newLocationCategory}
                                onChange={(event) => setNewLocationCategory(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='text'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Icon'
                                value={newLocationIcon}
                                onChange={(event) => setNewLocationIcon(event.target.value)}
                            />
                        </div>
                        <div className='flexContainer mt-10'>
                            <div
                                className='containerDetail flex3Column button bg-green color-yellow p-10'
                                onClick={addSavedLocation}
                            >
                                Add Location
                            </div>
                            <div
                                className='containerDetail flex3Column button bg-blue color-yellow p-10 ml-5'
                                onClick={saveCurrentLocation}
                            >
                                Save Current
                            </div>
                            <div
                                className='containerDetail flex3Column button bg-red color-yellow p-10 ml-5'
                                onClick={closeLocationDialog}
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className='flexContainer mt--5'>
                    <label className='flex4Column ml--5'>
                        <select
                            className='containerDetail p-10 ml-5 bg-tintedMedium color-lite width--5'
                            value={sortField}
                            onChange={(event) => setSortField(event.target.value)}
                        >
                            <option value='distance'>Distance</option>
                            <option value='name'>Name</option>
                            <option value='network'>Network</option>
                            <option value='open24h'>24/7 Availability</option>
                        </select>
                    </label>

                    <label className='color-yellow flex4Column'>
                        <select
                            className='containerDetail p-10 bg-tintedMedium color-lite width--5'
                            value={sortDirection}
                            onChange={(event) => setSortDirection(event.target.value)}
                        >
                            <option value='asc'>Ascending</option>
                            <option value='desc'>Descending</option>
                        </select>
                    </label>

                    <div
                        className='containerDetail flex4Column button bg-yellow ml-5 mr-5 color-dark flexColumn pt-5 pb-10 pl-10 mt-10'
                        onClick={resetFilters}
                    >
                        Reset Filters
                    </div>
                </div>

                <div className='containerDetail color-yellow p-10 mt-5'>{status}</div>

                <div className='containerDetail mt-5 bg-dark'>
                    <div
                        className='containerDetail button p-10 bg-tinted color-yellow size20 contentLeft'
                        onClick={() => setLocationsCollapsed((prev) => !prev)}
                    >
                        {locationsCollapsed ? '▸' : '▾'} Saved Locations ({savedLocations.length})
                    </div>
                    {locationsCollapsed ? null : (
                        <div className='containerDetail p-10'>
                            <div
                                className='containerDetail flex4Column button bg-red color-yellow flexColumn p-10'
                                onClick={clearPrimoCache}
                            >
                                Clear Saved
                            </div>
                            <label>
                                <select
                                    className='containerDetail p-10 bg-tintedMedium color-lite mt-5'
                                    value={locationsSortMode}
                                    onChange={(event) => setLocationsSortMode(event.target.value)}
                                >
                                    <option value='distance'>Saved Sort: Distance</option>
                                    <option value='name'>Saved Sort: Name</option>
                                </select>
                            </label>

                            <div className='mt-10'>
                                {savedLocations.length === 0 ? (
                                    <div className='color-soft size12'>No saved locations yet.</div>
                                ) : (
                                    sortedSavedLocations.map((location) => (
                                        <div
                                            key={location.id}
                                            className='containerDetail flexContainer mt-5 bg-soft'
                                            style={location.id === recentlyEditedLocationId ? { border: '2px solid #f5d95c' } : undefined}
                                        >
                                            <div
                                                className='containerDetail button color-yellow p-10 flex2Column contentLeft mr-5'
                                                onClick={() => selectSavedLocation(location)}
                                                title='Use this location'
                                            >
                                                {location.icon || '📍'} {location.name}
                                                {' '}
                                                ({location.lat.toFixed(4)}, {location.lon.toFixed(4)})
                                                {location.category ? ` • ${location.category}` : ''}
                                                {position ? ` • ${milesBetween(position.lat, position.lon, Number(location.lat), Number(location.lon)).toFixed(1)} miles` : ''}
                                            </div>
                                            <div className='flexContainer flexColumn'>
                                                <div
                                                    className='containerDetail button bg-dark flexColumn p-20 size15 m-2'
                                                    onClick={() => startEditSavedLocation(location)}
                                                    title='Edit saved location'
                                                >
                                                    ✏️
                                                </div>
                                                <div
                                                    className='containerDetail button bg-dark flexColumn p-20 size15 m-2'
                                                    onClick={() => removeSavedLocation(location.id)}
                                                    title='Remove saved location'
                                                >
                                                    🗑️
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {
                    position
                        ? <div className='containerDetail color-yellow p-10 mt-5'>
                            You: {position.lat.toFixed(4)}, {position.lon.toFixed(4)}
                        </div>
                        : null
                }
                
            </div>
            <div className='containerDetail color-lite size20 bg-lite mt-5'>
                {
                    stationResults.map((station, idx) => (
                        <div
                            className={`containerDetail bg-lite ${(idx) ? 'mt-5' : ''} button`}
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
                            aria-label={`Open ${station.name} in Maps`}
                        >
                            <div className='containerDetail p-10'>
                                <div className='color-yellow size20'>{station.displayIcon || '⛲️'} {station.name || station.title}</div>
                                <div className='color-orange size12 ml-25'>{station.address || station.address_line_1}</div>
                                {/*
                                    <div className='color-lite size12'>
                                        { Fallback logic for city and state_province if not provided by API }
                                        {(() => {
                                            let city = station.city;
                                            let state = station.state_province;
                                            if (!city) {
                                                city = station.town || station.village || station.hamlet || station.county || '';
                                            }
                                            if (!state) {
                                                state = station.state || '';
                                            }
                                            if (!city && !state) {
                                                return station.address || station.address_line_1 || '';
                                            }
                                            return `${city}${city && state ? ', ' : ''}${state}`;
                                        })()}
                                    </div>
                                */}
                            </div>

                            <div className='containerDetail flexContainer mt-5'>
                                <div className={`flexColumn`}>
                                    <span className={`containerDetail p-10 mr-5 mt-5 size10 ${station.open24h ? 'bg-dkGreen brdr-green color-yellow' : 'bg-lite color-yellow'}`}>{station.open24h ? '🕛 24/7' : '🕘❓'}</span>
                                </div>
                                <div className='mb-15 flexColumn'>{renderAmenities(station.amenities || station.tags.amenity)}</div>
                                <div className='containerDetail ml-5 flex4Column color-lite p-5 brdr-yellow contentRight size12'>
                                    {station.distanceMiles == null ? '--' : `${station.distanceMiles.toFixed(1)}`}<span className='size10 color-yellow'>miles</span>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            {editingLocationId ? (
                <div
                    className='containerDetail'
                    role='dialog'
                    aria-modal='true'
                    aria-label='Edit saved location dialog'
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px',
                    }}
                    onClick={cancelEditSavedLocation}
                >
                    <div
                        className='containerDetail p-10 bg-dark'
                        style={{ width: '100%', maxWidth: '520px', border: '1px solid #5d5d5d' }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className='color-yellow size20 mb-5 p-10'>Edit Saved Location</div>
                        <div>
                            <input
                                type='text'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Location name'
                                value={editingLocationName}
                                onChange={(event) => setEditingLocationName(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='number'
                                step='0.000001'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Latitude'
                                value={editingLocationLat}
                                onChange={(event) => setEditingLocationLat(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='number'
                                step='0.000001'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Longitude'
                                value={editingLocationLon}
                                onChange={(event) => setEditingLocationLon(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='text'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Category'
                                value={editingLocationCategory}
                                onChange={(event) => setEditingLocationCategory(event.target.value)}
                            />
                        </div>
                        <div className='mt-5'>
                            <input
                                type='text'
                                className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent'
                                placeholder='Icon'
                                value={editingLocationIcon}
                                onChange={(event) => setEditingLocationIcon(event.target.value)}
                            />
                        </div>
                        <div className='flexContainer mt-10'>
                            <button
                                type='button'
                                className='containerDetail flex2Column button bg-green color-yellow p-10'
                                onClick={saveEditedSavedLocation}
                            >
                                Save
                            </button>
                            <button
                                type='button'
                                className='containerDetail flex2Column button bg-red color-yellow p-10 ml-5'
                                onClick={cancelEditSavedLocation}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            
        </div>
    );
};

export default Water;
