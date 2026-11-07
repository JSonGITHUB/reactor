import React, { useEffect, useMemo, useState } from 'react';
import icons from '../site/icons';
import { useLayout } from '../utils/LayoutContext';
import {
    searchGooglePlacesNearby as requestGooglePlacesNearby,
    searchGooglePlacesText,
} from '../../services/providerApi';
// Utility: reverse geocode lat/lon to address using Nominatim
const reverseGeocode = async (lat, lon) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
        const response = await fetch(url);
        if (!response.ok) return '';
        const data = await response.json();
        const addr = data.address || {};
        // Compose a readable address
        return [addr.road, addr.city || addr.town || addr.village, addr.state, addr.country].filter(Boolean).join(', ');
    } catch {
        return '';
    }
};
// User-submitted venues (localStorage key)
const BILLIARDS_USER_VENUES_KEY = 'billiards-user-venues-v1';

const getUserVenues = () => {
    try {
        const stored = localStorage.getItem(BILLIARDS_USER_VENUES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {}
    return [];
};

const addUserVenue = (venue) => {
    const venues = getUserVenues();
    venues.push(venue);
    try { localStorage.setItem(BILLIARDS_USER_VENUES_KEY, JSON.stringify(venues)); } catch {}
};

const importVenuesFromJSON = (jsonString) => {
    try {
        const imported = JSON.parse(jsonString);
        if (Array.isArray(imported)) {
            const venues = getUserVenues().concat(imported);
            localStorage.setItem(BILLIARDS_USER_VENUES_KEY, JSON.stringify(venues));
            return true;
        }
    } catch {}
    return false;
};

// OpenStreetMap Overpass API: find bars/pubs with pool tables or billiards
const searchOverpassPoolVenues = async ({ lat, lon, radius = 10000 }) => {
    // radius in meters
    // Query for nodes/ways/relations with amenity=bar|pub and pool_table=yes or billiards=yes
    const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"bar|pub"]["pool_table"="yes"](around:${radius},${lat},${lon});
          node["amenity"~"bar|pub"]["billiards"="yes"](around:${radius},${lat},${lon});
          way["amenity"~"bar|pub"]["pool_table"="yes"](around:${radius},${lat},${lon});
          way["amenity"~"bar|pub"]["billiards"="yes"](around:${radius},${lat},${lon});
          relation["amenity"~"bar|pub"]["pool_table"="yes"](around:${radius},${lat},${lon});
          relation["amenity"~"bar|pub"]["billiards"="yes"](around:${radius},${lat},${lon});
        );
        out center tags;
    `;
    const url = 'https://overpass-api.de/api/interpreter';
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data?.elements)) return [];
    return data.elements.map(el => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        const name = el.tags?.name || 'Billiards Venue';
        const address = [el.tags?.addr_street, el.tags?.addr_city, el.tags?.addr_state].filter(Boolean).join(', ');
        return {
            id: `osm-overpass-${el.type}-${el.id}`,
            lat,
            lon,
            name,
            address,
            amenities: inferAmenityTags(name + ' ' + address),
            source: 'osm-overpass',
        };
    }).filter(v => v.lat && v.lon);
};
// Google Places Nearby Search for proximity-accurate results
// Paginated Google Places Nearby Search
const searchGooglePlacesNearby = async ({ lat, lon, radius, type, keyword, maxPages = 2 }) => {
    return requestGooglePlacesNearby({ lat, lon, radius, type, keyword, maxPages });
};

const normalizeNearbyPlace = (place) => {
    const lat = Number(place?.geometry?.location?.lat);
    const lon = Number(place?.geometry?.location?.lng);
    const name = String(place?.name || 'Billiards Venue').trim();
    const address = String(place?.vicinity || place?.formatted_address || '').trim();
    return {
        id: `nearby-${place?.place_id || `${lat}-${lon}`}`,
        lat,
        lon,
        name,
        address,
        amenities: inferAmenityTags(name + ' ' + address),
        source: 'google-nearby',
    };
};

// Google Places normalization and direct search (adapted from Water.js)
const normalizeGooglePlaceVenue = (place) => {
    const lat = Number(place?.location?.latitude);
    const lon = Number(place?.location?.longitude);
    const name = String(place?.displayName?.text || 'Billiards Venue').trim();
    const address = String(place?.formattedAddress || '').trim();
    return {
        id: `google-${place?.id || `${lat}-${lon}`}`,
        lat,
        lon,
        name,
        address,
        amenities: inferAmenityTags(name + ' ' + address),
        source: 'google',
    };
};

const shouldUseProxyForGooglePlaces = () => {
    if (typeof window === 'undefined') return true;
    const host = String(window.location.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
};

const searchGooglePlacesDirect = async ({ lat, lon, radius, textQuery }) => {
    const data = await searchGooglePlacesText({ lat, lon, radius, textQuery });
    return Array.isArray(data?.places) ? data.places : [];
};

const BILLIARDS_PREFS_KEY = 'billiards-preferences-v1';
const BILLIARDS_CACHE_KEY = 'billiards-cached-venues-v1';

const amenityIcons = {
    Bar: '🍺',
    Food: '🍽️',
    Music: '🎵',
    Tournaments: '🏆',
    Nearby: '🎱'
};

const amenityStyles = {
    Bar: { backgroundColor: '#2d1a1a', color: '#ffe8c2', border: '1px solid #bd8b43' },
    Food: { backgroundColor: '#3b2912', color: '#ffe8c2', border: '1px solid #bd8b43' },
    Music: { backgroundColor: '#1d2d3a', color: '#d0f2ff', border: '1px solid #4e92b2' },
    Tournaments: { backgroundColor: '#3b1430', color: '#ffd3ee', border: '1px solid #c4579a' },
    Nearby: { backgroundColor: '#2f2f2f', color: '#ededed', border: '1px solid #5d5d5d' }
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

const dedupeVenues = (venueList) => {
    const seen = new Set();
    return venueList.filter((venue) => {
        const key = `${venue.name}-${venue.lat.toFixed(4)}-${venue.lon.toFixed(4)}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const inferAmenityTags = (value) => {
    const text = String(value || '').toLowerCase();
    const inferred = [];
    if (/bar|pub|brewery|taproom/.test(text)) inferred.push('Bar');
    if (/food|restaurant|grill|kitchen|diner/.test(text)) inferred.push('Food');
    if (/music|dj|band|live/.test(text)) inferred.push('Music');
    if (/tournament|league|competition/.test(text)) inferred.push('Tournaments');
    return Array.from(new Set(inferred));
};

const Billiards = () => {
    const [position, setPosition] = useState(null);
    const [status, setStatus] = useState('Tap "Use My Location" to find nearby pool halls and bars.');
    const [preferredAmenity, setPreferredAmenity] = useState('Any');
    const [sortField, setSortField] = useState('distance');
    const [sortDirection, setSortDirection] = useState('asc');
    const [venues, setVenues] = useState([]);
    const [cachedVenues, setCachedVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // User venue form state
    const [showAddVenue, setShowAddVenue] = useState(false);
    const [addVenueData, setAddVenueData] = useState({ name: '', address: '', lat: '', lon: '' });
    const [importStatus, setImportStatus] = useState('');
    const [latLonMode, setLatLonMode] = useState('separate'); // 'separate' or 'combined'

    // Autofill for user venue form
    const autofillVenueLocation = async () => {
        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported by this browser.');
            return;
        }
        setStatus('Getting your location...');
        navigator.geolocation.getCurrentPosition(async (coords) => {
            const lat = coords.coords.latitude;
            const lon = coords.coords.longitude;
            let address = '';
            try {
                address = await reverseGeocode(lat, lon);
            } catch {}
            setAddVenueData((d) => ({ ...d, lat, lon, address }));
            setStatus('Location autofilled.');
        }, () => {
            setStatus('Unable to access your location.');
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    useEffect(() => {
        try {
            const stored = localStorage.getItem(BILLIARDS_PREFS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (typeof parsed.preferredAmenity === 'string') setPreferredAmenity(parsed.preferredAmenity);
                if (typeof parsed.sortField === 'string') setSortField(parsed.sortField);
                if (typeof parsed.sortDirection === 'string') setSortDirection(parsed.sortDirection);
            }
            const cached = localStorage.getItem(BILLIARDS_CACHE_KEY);
            let parsed = [];
            if (cached) {
                parsed = JSON.parse(cached);
                if (!Array.isArray(parsed)) parsed = [];
            }
            // Always merge in user venues (no distance filter, since no position yet)
            const userVenues = getUserVenues().map(v => ({ ...v, source: 'user' }));
            const merged = dedupeVenues(parsed.concat(userVenues));
            setCachedVenues(merged);
        } catch {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(BILLIARDS_PREFS_KEY, JSON.stringify({
                preferredAmenity,
                sortField,
                sortDirection
            }));
        } catch {}
    }, [preferredAmenity, sortField, sortDirection]);

    // Google Places first, fallback to Nominatim if needed
    const NOMINATIM_TERMS = [
        'pool hall',
        'billiards',
        'bar pool table',
        'sports bar',
        'pool table'
    ];

    const fetchVenues = async (lat, lon) => {
        setIsLoading(true);
        setStatus('Searching for pool halls, bars, and pool tables...');
        const radius = 10000; // 10km
        let venuesList = [];
        let googleError = '';
        let allVenues = [];
        // 1. Google Places Nearby Search (multiple types/keywords, paginated)
        try {
            let googleVenues = [];
            const nearbyTypes = [
                { type: 'bar', keyword: 'pool table' },
                { type: 'bar', keyword: 'billiards' },
                { type: 'night_club', keyword: 'pool table' },
                { type: 'night_club', keyword: 'billiards' },
                { type: 'point_of_interest', keyword: 'pool table' },
                { type: 'point_of_interest', keyword: 'billiards' },
            ];
            if (shouldUseProxyForGooglePlaces()) {
                // Use proxy endpoint for local dev (must support nearbysearch)
                const allResults = await Promise.all(nearbyTypes.map(({ type, keyword }) =>
                    fetch(`/api/google/places/nearbysearch?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radius=${radius}&type=${encodeURIComponent(type)}&keyword=${encodeURIComponent(keyword)}`)
                        .then(r => r.ok ? r.json() : { results: [] })
                ));
                googleVenues = allResults.flatMap(r => Array.isArray(r.results) ? r.results : []);
            } else {
                const allResults = await Promise.all(nearbyTypes.map(({ type, keyword }) => searchGooglePlacesNearby({ lat, lon, radius, type, keyword, maxPages: 2 })));
                googleVenues = allResults.flat();
            }
            allVenues = allVenues.concat(googleVenues.map(normalizeNearbyPlace).filter(v => v.lat && v.lon));
        } catch (err) {
            googleError = err?.message || 'Google Places Nearby error';
        }
        // 2. Google Places Text Search (broader queries, paginated)
        try {
            let googleVenues = [];
            const googleTextQueries = [
                'bar with pool table',
                'billiards bar',
                'cocktails pool',
                'darts pool',
                'sports bar pool',
                'pool hall',
                'billiards',
                'pool table',
            ];
            if (shouldUseProxyForGooglePlaces()) {
                const allResults = await Promise.all(googleTextQueries.map(q =>
                    fetch(`/api/google/places/billiards-nearby?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radius=${radius}&textQuery=${encodeURIComponent(q)}`)
                        .then(r => r.ok ? r.json() : { places: [] })
                ));
                googleVenues = allResults.flatMap(r => Array.isArray(r.places) ? r.places : []);
            } else {
                const allResults = await Promise.all(googleTextQueries.map(q => searchGooglePlacesDirect({ lat, lon, radius, textQuery: q })));
                googleVenues = allResults.flat();
            }
            allVenues = allVenues.concat(googleVenues.map(normalizeGooglePlaceVenue).filter(v => v.lat && v.lon));
        } catch (err) {
            googleError = err?.message || 'Google Places Text Search error';
        }
        // 3. Fallback to OpenStreetMap Overpass if Google fails or returns nothing
        if (allVenues.length === 0) {
            try {
                const overpassVenues = await searchOverpassPoolVenues({ lat, lon, radius });
                allVenues = overpassVenues;
            } catch {
                // ignore
            }
        }
        // 4. Fallback to Nominatim if all else fails
        if (allVenues.length === 0) {
            try {
                const fetches = NOMINATIM_TERMS.map(term => {
                    const query = new URLSearchParams({
                        q: term,
                        format: 'json',
                        addressdetails: '1',
                        limit: '20',
                        extratags: '1',
                        viewbox: `${lon-0.2},${lat+0.2},${lon+0.2},${lat-0.2}`
                    });
                    const url = `https://nominatim.openstreetmap.org/search?${query.toString()}`;
                    return fetch(url).then(r => r.ok ? r.json() : []);
                });
                const results = await Promise.all(fetches);
                allVenues = results.flat().map((venue) => ({
                    id: venue.place_id,
                    name: venue.display_name.split(',')[0],
                    lat: Number(venue.lat),
                    lon: Number(venue.lon),
                    address: venue.display_name,
                    amenities: inferAmenityTags(venue.display_name + ' ' + (venue.extratags ? JSON.stringify(venue.extratags) : '')),
                    source: 'osm',
                })).filter((v) => v.lat && v.lon);
            } catch {
                // ignore
            }
        }
        // Sort by actual distance (closest first)
        let deduped = dedupeVenues(allVenues);
        if (deduped.length > 0 && lat && lon) {
            deduped = deduped.map(v => ({ ...v, distanceMiles: milesBetween(lat, lon, v.lat, v.lon) }))
                .sort((a, b) => (a.distanceMiles ?? 1e9) - (b.distanceMiles ?? 1e9));
        }
        // Merge in user-submitted venues within 25 miles
        let userVenues = getUserVenues();
        if (lat && lon && userVenues.length > 0) {
            userVenues = userVenues.filter(v => {
                if (!v.lat || !v.lon) return false;
                return milesBetween(lat, lon, Number(v.lat), Number(v.lon)) <= 25;
            });
            deduped = dedupeVenues(deduped.concat(userVenues.map(v => ({ ...v, source: 'user' }))));
        }
        setVenues(deduped);
        setCachedVenues(deduped);
        try { localStorage.setItem(BILLIARDS_CACHE_KEY, JSON.stringify(deduped)); } catch {}
        setStatus(deduped.length > 0 ? 'Nearby pool halls and bars loaded.' : `No venues found nearby. ${googleError ? 'Google Places error: ' + googleError : 'Try Google Maps below.'}`);
        setIsLoading(false);
    };
    // Handle user venue form submit
    const handleAddVenueSubmit = (e) => {
        e.preventDefault();
        const { name, address, lat, lon } = addVenueData;
        if (!name || !lat || !lon) return;
        addUserVenue({
            id: `user-${Date.now()}`,
            name,
            address,
            lat: Number(lat),
            lon: Number(lon),
            amenities: inferAmenityTags(name + ' ' + address),
        });
        setAddVenueData({ name: '', address: '', lat: '', lon: '' });
        setShowAddVenue(false);
        setStatus('Venue submitted! It will appear in your local results.');
        if (position) fetchVenues(position.lat, position.lon);
    };

    // Handle import JSON
    const handleImportVenues = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const ok = importVenuesFromJSON(event.target.result);
            setImportStatus(ok ? 'Import successful!' : 'Import failed.');
            if (position) fetchVenues(position.lat, position.lon);
        };
        reader.readAsText(file);
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
                setStatus('Location found. Loading venues...');
                fetchVenues(nextPosition.lat, nextPosition.lon);
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

    // If no venues loaded (no search yet), show cachedVenues (which includes user venues)
    const venueResults = useMemo(() => {
        const base = venues.length > 0 ? venues : cachedVenues;
        const withDistance = base.map((venue) => {
            if (!position) return { ...venue, distanceMiles: null };
            return {
                ...venue,
                distanceMiles: milesBetween(position.lat, position.lon, venue.lat, venue.lon)
            };
        });
        const getSortValue = (venue) => {
            switch (sortField) {
                case 'name': return String(venue.name || '').toLowerCase();
                case 'amenities': return Array.isArray(venue.amenities) ? venue.amenities.length : 0;
                case 'distance':
                default:
                    return venue.distanceMiles == null ? Number.POSITIVE_INFINITY : venue.distanceMiles;
            }
        };
        const sortMultiplier = sortDirection === 'desc' ? -1 : 1;
        return withDistance.sort((a, b) => {
            if (preferredAmenity !== 'Any') {
                const aHas = Array.isArray(a.amenities) && a.amenities.includes(preferredAmenity);
                const bHas = Array.isArray(b.amenities) && b.amenities.includes(preferredAmenity);
                if (aHas !== bHas) return aHas ? -1 : 1;
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
    }, [venues, cachedVenues, position, preferredAmenity, sortDirection, sortField]);

    const renderAmenities = (amenities = []) => {
        const amenityList = amenities.length > 0 ? amenities : ['Nearby'];
        return amenityList.map((amenity) => {
            const amenityIcon = amenityIcons[amenity] || '🎱';
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

    const openVenueInMaps = (venue) => {
        if (!venue?.lat || !venue?.lon) return;
        const destination = `${venue.lat},${venue.lon}`;
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        window.open(mapUrl, '_blank', 'noopener,noreferrer');
    };

    const resetFilters = () => {
        setPreferredAmenity('Any');
        setSortField('distance');
        setSortDirection('asc');
        try { localStorage.removeItem(BILLIARDS_PREFS_KEY); } catch {}
        setStatus('Filters reset to defaults. Keeping current venue data.');
    };

    const layout = useLayout();
    const appBg = layout?.colors?.background;
    const appPrimaryColor = layout?.colors?.primary;
    const headerBackground = layout?.colors?.headerBackground;
    const appTextColor = layout?.colors?.text;

    return (
        <div className='containerDetail contentLeft bg-lite ml-5 mr-5 mt--25'>
            <div className='containerDetail bg-lite pl-15 pt-20 pb-20 color-yellow size25 mb-5'>
                <span className='mr-5'>{icons.billiards || '🎱'}</span>
                Billiards Finder
            </div>
            <div className='containerDetail bg-lite color-lite'>
                <div className='flexContainer mb-10 mt-5 width-100-percent'>
                    <button
                        className='containerDetail button bg-green color-yellow flex2Column p-10 mr-10 ml--1'
                        onClick={async () => {
                            if (!showAddVenue) await autofillVenueLocation();
                            setShowAddVenue(v => !v);
                        }}
                        aria-expanded={showAddVenue}
                        aria-controls='add-venue-form'
                    >
                        {showAddVenue ? 'Cancel' : 'Submit a Missing Venue'}
                    </button>
                    <label className='containerDetail button bg-blue color-yellow flex2Column p-10'>
                        Import Venues (JSON)
                        <input
                            type='file'
                            accept='.json,application/json'
                            style={{ display: 'none' }}
                            onChange={handleImportVenues}
                        />
                    </label>
                    {importStatus && <span className='color-orange ml-10'>{importStatus}</span>}
                </div>
                {showAddVenue && (
                    <form 
                        id='add-venue-form' 
                        className='containerDetail bg-lite p-10 mb-10 size20'
                        style={{ color: appPrimaryColor }} 
                        onSubmit={handleAddVenueSubmit}
                    >
                        <div className='mb-5'>
                            <label>Name:<br />
                                <input
                                    style={{ color: appTextColor }} className='containerDetail p-15 width-100-percent mt-10 mt-10'
                                    type='text'
                                    value={addVenueData.name}
                                    onChange={e => setAddVenueData(d => ({ ...d, name: e.target.value }))}
                                    required
                                />
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>Address:<br />
                                <input
                                    style={{ color: appTextColor }} className='containerDetail p-15 width-100-percent mt-10'
                                    type='text'
                                    value={addVenueData.address}
                                    onChange={e => setAddVenueData(d => ({ ...d, address: e.target.value }))}
                                />
                            </label>
                        </div>
                        <div className='mb-5'>
                            <label>
                                <span>Coordinates:</span>
                                <span className='ml-10'>
                                    <input
                                        type='checkbox'
                                        checked={latLonMode === 'combined'}
                                        onChange={() => setLatLonMode(latLonMode === 'combined' ? 'separate' : 'combined')}
                                        aria-label='Toggle between single and separate coordinate fields'
                                    />
                                    <span className='ml-5 size15'>{latLonMode === 'combined' ? 'Single field (lat,lon)' : 'Separate fields'}</span>
                                </span>
                            </label>
                        </div>
                        {latLonMode === 'combined' ? (
                            <div className='mb-5'>
                                <label>Latitude,Longitude:<br />
                                    <input
                                        style={{ color: appTextColor }} className='containerDetail p-15 width-100-percent mt-10'
                                        type='text'
                                        placeholder='e.g. 40.7128,-74.0060'
                                        value={addVenueData.lat && addVenueData.lon ? `${addVenueData.lat},${addVenueData.lon}` : ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            const [lat, lon] = val.split(',').map(s => s.trim());
                                            setAddVenueData(d => ({ ...d, lat, lon }));
                                        }}
                                        required
                                    />
                                </label>
                            </div>
                        ) : (
                            <>
                                <div className='mb-5'>
                                    <label>Latitude:<br />
                                        <input
                                            style={{ color: appTextColor }} className='containerDetail p-15 width-100-percent mt-10'
                                            type='number'
                                            step='any'
                                            value={addVenueData.lat}
                                            onChange={e => setAddVenueData(d => ({ ...d, lat: e.target.value }))}
                                            required
                                        />
                                    </label>
                                </div>
                                <div className='mb-5'>
                                    <label>Longitude:<br />
                                        <input
                                            style={{ color: appTextColor }} className='containerDetail p-15 width-100-percent mt-10'
                                            type='number'
                                            step='any'
                                            value={addVenueData.lon}
                                            onChange={e => setAddVenueData(d => ({ ...d, lon: e.target.value }))}
                                            required
                                        />
                                    </label>
                                </div>
                            </>
                        )}
                        <div className='flexContainer mt-10'>
                            <button
                                className='containerDetail button bg-blue color-yellow flex2Column p-10 mr-10 ml--1 size20'
                                onClick={autofillVenueLocation}
                                type='button'
                                aria-label='Autofill location fields'
                            >
                                Autofill Location
                            </button>
                            <button 
                                className='containerDetail button bg-green color-yellow flex2Column p-10 width-100-percent ml--1 size20 mr-5' 
                                type='submit'
                            >
                                Submit Venue
                            </button>
                        </div>
                    </form>
                )}
                <div className='flexContainer'>
                    <div className='containerDetail p-10 size15 bg-green contentCenter flex3Column button containerDetail mr-5 color-yellow brdr-yellow' onClick={locateUser}>
                        Use My Location
                    </div>
                </div>
                <div className='flexContainer mt--3'>
                    <label className='flex3Column'>
                        <select
                            className='containerDetail p-10 ml--1 bg-tintedMedium color-lite'
                            value={sortField}
                            onChange={(event) => setSortField(event.target.value)}
                        >
                            <option value='distance'>Distance</option>
                            <option value='name'>Name</option>
                            <option value='amenities'>Amenity Count</option>
                        </select>
                    </label>
                    <label className='flex3Column'>
                        <select
                            className='containerDetail p-10 ml-3 bg-tintedMedium color-lite width-100-percent'
                            value={sortDirection}
                            onChange={(event) => setSortDirection(event.target.value)}
                        >
                            <option value='asc'>Ascending</option>
                            <option value='desc'>Descending</option>
                        </select>
                    </label>
                    <label className='flex3Column'>
                        <select
                            className='containerDetail p-10 ml-3 bg-tintedMedium color-lite width-100-percent'
                            value={preferredAmenity}
                            onChange={(event) => setPreferredAmenity(event.target.value)}
                        >
                            <option value='Any'>Any</option>
                            <option value='Bar'>Bar</option>
                            <option value='Food'>Food</option>
                            <option value='Music'>Music</option>
                            <option value='Tournaments'>Tournaments</option>
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
                    isLoading
                        ? <div className='containerDetail color-yellow p-10 mt-5'>Loading venues...</div>
                        : null
                }
            </div>
            {
                (venueResults.length === 0 && cachedVenues.length > 0)
                ? (() => {
                    // Always merge in all user venues if no position; filter by distance if position is known
                    let userVenues = getUserVenues().map(v => ({ ...v, source: 'user' }));
                    let mergedVenues;
                    if (position && userVenues.length > 0) {
                        userVenues = userVenues.filter(v => {
                            if (!v.lat || !v.lon) return false;
                            return milesBetween(position.lat, position.lon, Number(v.lat), Number(v.lon)) <= 25;
                        });
                        mergedVenues = dedupeVenues(cachedVenues.concat(userVenues));
                    } else {
                        mergedVenues = dedupeVenues(cachedVenues.concat(userVenues));
                    }
                    return (
                        <div className='containerDetail color-lite size18 bg-lite mb-5 mt-10'>
                            <div className='containerDetail mt-5 color-orange'>
                                <div>No new venues found nearby. Showing last known results:</div>
                                <div className='mt-10'>
                                    <a
                                        href={position ? `https://www.google.com/maps/search/pool+table/@${position.lat},${position.lon},12z` : 'https://www.google.com/maps/search/pool+table/'}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='color-yellow underline'
                                    >
                                        Search "pool table" in Google Maps
                                    </a>
                                </div>
                            </div>
                            <div className='containerDetail mt-5'>
                                {mergedVenues.map((venue, idx) => (
                                    <div
                                        className={`containerDetail bg-lite ${(idx > 0) ? 'mt-5' : null} button`}
                                        key={venue.id}
                                        onClick={() => openVenueInMaps(venue)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                openVenueInMaps(venue);
                                            }
                                        }}
                                        role='button'
                                        tabIndex={0}
                                        aria-label={`Open ${venue.name} in Google Maps`}
                                    >
                                        <div className='containerDetail p-10'>
                                            <div className='color-yellow size20'>🎱 {venue.name}</div>
                                            <div className='color-orange size12'>{venue.address}</div>
                                            {venue.source === 'user' && <span className='color-green size12 ml-10'>🌟</span>}
                                        </div>
                                        <div className='color-orange size25 flexContainer'>
                                            <div className='containerDetail flexContainer flex2Column mt-5 mr-5'>
                                                {renderAmenities(venue.amenities)}
                                            </div>
                                            <div className='containerDetail flexColumn color-lite p-10 contentRight size15 mt-5'>
                                                {venue.distanceMiles == null ? '--' : `${venue.distanceMiles?.toFixed?.(1) ?? '--'}`}<span className='size10 color-yellow'>miles</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()
                : (venueResults.length === 0)
                ? <div className='containerDetail color-lite size18 bg-lite mb-5 mt-10'>
                    <div className='containerDetail mt-5 color-orange'>
                        <div>No venues found nearby.</div>
                        <div className='mt-10'>
                            <a
                                href={position ? `https://www.google.com/maps/search/pool+table/@${position.lat},${position.lon},12z` : 'https://www.google.com/maps/search/pool+table/'}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='color-yellow underline'
                            >
                                Search "pool table" in Google Maps
                            </a>
                        </div>
                    </div>
                </div>
                : <div className='containerDetail color-lite size20 bg-lite mb-5 mt-10'>
                    <div className='containerDetail mt-5'>
                    {
                        venueResults.map((venue, idx) => (
                            <div
                                className={`containerDetail bg-lite ${(idx > 0) ? 'mt-5' : null} button`}
                                key={venue.id}
                                onClick={() => openVenueInMaps(venue)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        openVenueInMaps(venue);
                                    }
                                }}
                                role='button'
                                tabIndex={0}
                                aria-label={`Open ${venue.name} in Google Maps`}
                            >
                                <div className='containerDetail p-10'>
                                    <div className='color-yellow size20'>🎱 {venue.name}</div>
                                    <div className='color-orange size12'>{venue.address}</div>
                                    {venue.source === 'user' && <span className='color-green size12 ml-10'>🌟</span>}
                                </div>
                                <div className='color-orange size25 flexContainer'>
                                    <div className='containerDetail flexContainer flex2Column mt-5 mr-5'>
                                        {renderAmenities(venue.amenities)}
                                    </div>
                                    <div className='containerDetail flexColumn color-lite p-10 contentRight size15 mt-5'>
                                        {venue.distanceMiles == null ? '--' : `${venue.distanceMiles.toFixed(1)}`}<span className='size10 color-yellow'>miles</span>
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

export default Billiards;
