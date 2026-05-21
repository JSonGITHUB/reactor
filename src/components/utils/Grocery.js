import React, { useEffect, useRef, useState, useMemo } from 'react';
import icons from '../site/icons';

const GROCERY_PREFS_KEY = 'groceries-preferences-v1';
const GROCERY_CACHE_KEY = 'groceries-cached-stores-v1';
const MAP_PREFERENCE_AUTO = 'auto';
const MAP_PREFERENCE_APPLE = 'apple';
const MAP_PREFERENCE_GOOGLE = 'google';
const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY || '';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

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

const Grocery = () => {
    const [position, setPosition] = useState(null);
    const [status, setStatus] = useState('Tap "Use My Location" to locate nearby grocery stores.');
    const [sortField, setSortField] = useState('distance');
    const [sortDirection, setSortDirection] = useState('asc');
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mapPreference, setMapPreference] = useState(MAP_PREFERENCE_AUTO);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(GROCERY_PREFS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (typeof parsed.sortField === 'string') setSortField(parsed.sortField);
                if (typeof parsed.sortDirection === 'string') setSortDirection(parsed.sortDirection);
                if (typeof parsed.mapPreference === 'string') setMapPreference(parsed.mapPreference);
            }
        } catch {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(GROCERY_PREFS_KEY, JSON.stringify({
                sortField,
                sortDirection,
                mapPreference
            }));
        } catch {}
    }, [sortField, sortDirection, mapPreference]);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported.');
            return;
        }
        setStatus('Getting your location...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                setStatus('Location acquired.');
            },
            (err) => {
                setStatus('Location error: ' + err.message);
            }
        );
    };

    // Fetch groceries automatically when position is set
    useEffect(() => {
        if (position) {
            fetchGroceries();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position]);

    const fetchGroceries = async () => {
        if (!position) {
            setStatus('Location required to search for nearby grocery stores.');
            return;
        }
        setIsLoading(true);
        setStatus('Searching for grocery stores...');
        const radiusMeters = 5000;
        const { lat, lon } = position;
        let foundStores = [];
        // Try Google Places API first
        if (GOOGLE_PLACES_API_KEY) {
            try {
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
                        textQuery: 'grocery store',
                        maxResultCount: 20,
                        locationBias: {
                            circle: {
                                center: { latitude: lat, longitude: lon },
                                radius: radiusMeters,
                            },
                        },
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    foundStores = (data?.places || []).map((place) => ({
                        id: `google-${place.id}`,
                        lat: Number(place?.location?.latitude),
                        lon: Number(place?.location?.longitude),
                        name: String(place?.displayName?.text || 'Grocery Store').trim(),
                        address: String(place?.formattedAddress || '').trim(),
                        openNow: Boolean(place?.regularOpeningHours?.openNow),
                        types: place?.types || [],
                        source: 'Google',
                    }));
                }
            } catch (e) {
                setStatus('Google Places API failed, trying OpenStreetMap...');
            }
        }
        // Fallback to Overpass API (OpenStreetMap)
        if (!foundStores.length) {
            try {
                const query = `
[out:json][timeout:25];
(
  node["shop"="supermarket"](around:${radiusMeters},${lat},${lon});
  node["shop"="grocery"](around:${radiusMeters},${lat},${lon});
  node["shop"="convenience"](around:${radiusMeters},${lat},${lon});
);
out body;
`;
                const response = await fetch(OVERPASS_API, {
                    method: 'POST',
                    body: query,
                    headers: { 'Content-Type': 'text/plain' },
                });
                if (response.ok) {
                    const data = await response.json();
                    foundStores = (data?.elements || []).map((el) => ({
                        id: `osm-${el.id}`,
                        lat: Number(el.lat),
                        lon: Number(el.lon),
                        name: el.tags?.name || 'Grocery Store',
                        address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', '),
                        openNow: false,
                        types: [el.tags?.shop],
                        source: 'OSM',
                    }));
                }
            } catch (e) {
                setStatus('Failed to fetch grocery stores.');
            }
        }
        setStores(foundStores);
        setIsLoading(false);
        setStatus(foundStores.length ? `Found ${foundStores.length} grocery stores nearby.` : 'No grocery stores found nearby.');
    };

    const sortedStores = useMemo(() => {
        const withDistance = stores.map((store) => ({
            ...store,
            distanceMiles: position ? milesBetween(position.lat, position.lon, store.lat, store.lon) : null
        }));
        const getSortValue = (store) => {
            switch (sortField) {
                case 'name': return String(store.name || '').toLowerCase();
                case 'openNow': return store.openNow ? 1 : 0;
                case 'distance':
                default: return store.distanceMiles == null ? Number.POSITIVE_INFINITY : store.distanceMiles;
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
            return String(a.name || '').localeCompare(String(b.name || ''));
        });
    }, [stores, position, sortField, sortDirection]);

    const openInMap = (store) => {
        const url = mapPreference === MAP_PREFERENCE_APPLE
            ? `http://maps.apple.com/?ll=${store.lat},${store.lon}`
            : `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lon}`;
        window.open(url, '_blank');
    };

    return (
        <div className='containerDetail bg-lite mt--25 ml-5 mr-5 contentLeft width--20'>
            <div className='containerDetail bg-lite color-yellow size25 p-20'>
                {icons.grocery || '🛒'} Groceries
            </div>
            <div className='flexContainer mb-10 mt-5'>
                <div 
                    className='containerDetail flex2Column button bg-green brdr-green color-yellow p-20 size20' 
                    onClick={getLocation} 
                    disabled={isLoading}
                >
                    📍 Use My Location
                </div>
                {/*}
                <button 
                    className='flex2Column button bg-green color-lite mr--5 p-20' 
                    onClick={fetchGroceries} 
                    disabled={isLoading || !position}
                >
                    🛒 Find Grocery
                </button>
                */}
            </div>
            <div className='pl-10 color-orange'>{status}</div>
            <div className='containerDetail bg-lite mt-10 mb-10 p-10'>
                <div className='mt--5 mb-5 ml-5'>
                    <label className='color-yellow'>Sort by:</label>
                    <select className='containerDetail color-lite mr-5' value={sortField} onChange={e => setSortField(e.target.value)}>
                        <option value='distance'>Distance</option>
                        <option value='name'>Name</option>
                        <option value='openNow'>Open Now</option>
                    </select>
                    <select className='containerDetail color-lite' value={sortDirection} onChange={e => setSortDirection(e.target.value)}>
                        <option value='asc'>Asc</option>
                        <option value='desc'>Desc</option>
                    </select>
                    <label className='color-yellow ml-10'>Map:</label>
                    <select className='containerDetail color-lite' value={mapPreference} onChange={e => setMapPreference(e.target.value)}>
                        <option value={MAP_PREFERENCE_AUTO}>Auto</option>
                        <option value={MAP_PREFERENCE_GOOGLE}>Google</option>
                        <option value={MAP_PREFERENCE_APPLE}>Apple</option>
                    </select>
                </div>
            </div>
            <div>
                {isLoading ? <div className='color-yellow'>Loading...</div> : null}
                {sortedStores.map((store, idx) => (
                    <div
                        key={store.id}
                        className={`containerDetail bg-lite ${idx ? 'mt-5' : ''} button`}
                        onClick={() => openInMap(store)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInMap(store); } }}
                        role='button'
                        tabIndex={0}
                        aria-label={`Open ${store.name} in Maps`}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='containerDetail p-10'>
                            <div className='color-yellow size20'>{icons.grocery || '🛒'} {store.name}</div>
                            <div className='color-orange size12 ml-25'>{store.address}</div>
                        </div>
                        <div className='containerDetail flexContainer'>
                            <div className={`flex2Column containerDetail p-10 size10 ${store.openNow ? 'bg-dkGreen brdr-green color-yellow' : 'bg-lite color-yellow'}`}>
                                {store.openNow ? '🕛 Open Now' : '🕘❓'}
                            </div>
                            <div className='containerDetail ml-5 flex2Column color-lite p-10 brdr-yellow contentRight size12'>
                                {store.distanceMiles == null ? '--' : `${store.distanceMiles.toFixed(1)}`}<span className='size10 color-yellow'> miles</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Grocery;
