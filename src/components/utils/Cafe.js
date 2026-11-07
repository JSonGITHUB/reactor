import React, { useEffect, useMemo, useState } from 'react';
import icons from '../site/icons';
import { searchGooglePlacesNearby } from '../../services/providerApi';

// Utility: reverse geocode lat/lon to address using Nominatim
const reverseGeocode = async (lat, lon) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
        const response = await fetch(url);
        if (!response.ok) return '';
        const data = await response.json();
        const addr = data.address || {};
        return [addr.road, addr.city || addr.town || addr.village, addr.state, addr.country].filter(Boolean).join(', ');
    } catch {
        return '';
    }
};

const CAFE_USER_VENUES_KEY = 'cafe-user-venues-v1';

const getUserVenues = () => {
    try {
        const stored = localStorage.getItem(CAFE_USER_VENUES_KEY);
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
    try { localStorage.setItem(CAFE_USER_VENUES_KEY, JSON.stringify(venues)); } catch {}
};

const importVenuesFromJSON = (jsonString) => {
    try {
        const imported = JSON.parse(jsonString);
        if (Array.isArray(imported)) {
            const venues = getUserVenues().concat(imported);
            localStorage.setItem(CAFE_USER_VENUES_KEY, JSON.stringify(venues));
            return true;
        }
    } catch {}
    return false;
};

// Overpass API: find cafes, coffee shops, etc.
const searchOverpassCafeVenues = async ({ lat, lon, radius = 10000 }) => {
    const query = `
        [out:json][timeout:25];
        (
          node["amenity"="cafe"](around:${radius},${lat},${lon});
          node["amenity"="coffee_shop"](around:${radius},${lat},${lon});
          way["amenity"="cafe"](around:${radius},${lat},${lon});
          way["amenity"="coffee_shop"](around:${radius},${lat},${lon});
          relation["amenity"="cafe"](around:${radius},${lat},${lon});
          relation["amenity"="coffee_shop"](around:${radius},${lat},${lon});
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
        const name = el.tags?.name || 'Cafe';
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

const normalizeNearbyPlace = (place) => {
    const lat = Number(place?.geometry?.location?.lat);
    const lon = Number(place?.geometry?.location?.lng);
    const name = String(place?.name || 'Cafe').trim();
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

const shouldUseProxyForGooglePlaces = () => {
    if (typeof window === 'undefined') return true;
    const host = String(window.location.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1';
};

const inferAmenityTags = (value) => {
    const text = String(value || '').toLowerCase();
    const inferred = [];
    if (/cafe|coffee|espresso|latte|mocha|americano|barista/.test(text)) inferred.push('Cafe');
    if (/bakery|pastry|croissant|bagel|bread/.test(text)) inferred.push('Bakery');
    if (/wifi|wi-fi|internet/.test(text)) inferred.push('Wi-Fi');
    return Array.from(new Set(inferred));
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


const Cafe = () => {
    const [position, setPosition] = useState(null);
    const [status, setStatus] = useState('Tap "Find Cafes" to locate nearby coffee shops and cafes.');
    const [venues, setVenues] = useState([]);
    const [sortField, setSortField] = useState('distance');
    const [sortDirection, setSortDirection] = useState('asc');
    const [isLoading, setIsLoading] = useState(false);
    const [userVenues, setUserVenues] = useState(getUserVenues());
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newVenue, setNewVenue] = useState({ name: '', lat: '', lon: '', address: '', amenities: '' });
    const [importText, setImportText] = useState('');
    const [latLonMode, setLatLonMode] = useState('separate'); // 'separate' or 'combined'
    const [autofillStatus, setAutofillStatus] = useState('');

    // Calculate distance between two points
    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        return milesBetween(Number(lat1), Number(lon1), Number(lat2), Number(lon2));
    };

    // Merge, dedupe, and sort venues
    const mergedVenues = useMemo(() => {
        let all = [...venues, ...userVenues];
        all = dedupeVenues(all);
        if (position) {
            all = all.map(v => ({ ...v, distance: getDistance(position.lat, position.lon, v.lat, v.lon) }));
        }
        const getSortValue = (v) => {
            switch (sortField) {
                case 'name': return String(v.name || '').toLowerCase();
                case 'distance': return v.distance == null ? Number.POSITIVE_INFINITY : v.distance;
                default: return v.distance == null ? Number.POSITIVE_INFINITY : v.distance;
            }
        };
        const sortMultiplier = sortDirection === 'desc' ? -1 : 1;
        return all.sort((a, b) => {
            const aValue = getSortValue(a);
            const bValue = getSortValue(b);
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return aValue.localeCompare(bValue) * sortMultiplier;
            } else {
                return (aValue - bValue) * sortMultiplier;
            }
        });
    }, [venues, userVenues, position, sortField, sortDirection]);

    // Save user venues to localStorage
    useEffect(() => {
        try { localStorage.setItem(CAFE_USER_VENUES_KEY, JSON.stringify(userVenues)); } catch {}
    }, [userVenues]);

    // Geolocation
    const locateUser = () => {
        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported by this browser.');
            return;
        }
        setStatus('Finding your location...');
        navigator.geolocation.getCurrentPosition(
            (coords) => {
                const newPosition = { lat: coords.coords.latitude, lon: coords.coords.longitude };
                setPosition(newPosition);
                setStatus('Location found. Searching for cafes...');
                // Automatically fetch cafes after location is set
                setTimeout(() => {
                    fetchVenuesWithPosition(newPosition);
                }, 0);
            },
            () => setStatus('Unable to access your location. Check browser permissions.'),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Helper to fetch venues for a given position (so we don't use stale closure)
    const fetchVenuesWithPosition = async (pos) => {
        setIsLoading(true);
        setStatus('Loading nearby cafes...');
        const { lat, lon } = pos;
        let results = [];
        try {
            const googleResults = await searchGooglePlacesNearby({ lat, lon, radius: 5000, type: 'cafe', keyword: 'cafe|coffee|espresso|bakery', maxPages: 2 });
            results = results.concat(googleResults.map(normalizeNearbyPlace));
        } catch {}
        try {
            const overpassResults = await searchOverpassCafeVenues({ lat, lon, radius: 10000 });
            results = results.concat(overpassResults);
        } catch {}
        setVenues(results);
        setStatus(results.length ? `Found ${results.length} cafes nearby.` : 'No cafes found nearby.');
        setIsLoading(false);
    };

    // Fetch venues from APIs
    const fetchVenues = async () => {
        if (!position) {
            setStatus('Location required to search for nearby cafes.');
            return;
        }
        setIsLoading(true);
        setStatus('Loading nearby cafes...');
        const { lat, lon } = position;
        let results = [];
        // Google Places Nearby
        try {
            const googleResults = await searchGooglePlacesNearby({ lat, lon, radius: 5000, type: 'cafe', keyword: 'cafe|coffee|espresso|bakery', maxPages: 2 });
            results = results.concat(googleResults.map(normalizeNearbyPlace));
        } catch {}
        // Overpass
        try {
            const overpassResults = await searchOverpassCafeVenues({ lat, lon, radius: 10000 });
            results = results.concat(overpassResults);
        } catch {}
        setVenues(results);
        setStatus(results.length ? `Found ${results.length} cafes nearby.` : 'No cafes found nearby.');
        setIsLoading(false);
    };

    // Add user venue
    const handleAddVenue = () => {
        let lat = newVenue.lat, lon = newVenue.lon;
        if (latLonMode === 'combined' && typeof lat === 'string' && lat.includes(',')) {
            const [latStr, lonStr] = lat.split(',').map(s => s.trim());
            lat = latStr;
            lon = lonStr;
        }
        const { name, address } = newVenue;
        if (!name || !lat || !lon) {
            setStatus('Name, latitude, and longitude are required.');
            return;
        }
        setUserVenues(prev => [...prev, { id: `user-${Date.now()}`, name, lat: Number(lat), lon: Number(lon), address, source: 'user' }]);
        setIsAddDialogOpen(false);
        setNewVenue({ name: '', lat: '', lon: '', address: '', amenities: '' });
        setStatus('Venue added.');
    };

    // Autofill for user venue form
    const autofillVenueLocation = async () => {
        if (!navigator.geolocation) {
            setAutofillStatus('Geolocation is not supported by this browser.');
            return;
        }
        setAutofillStatus('Getting your location...');
        navigator.geolocation.getCurrentPosition(async (coords) => {
            const lat = coords.coords.latitude;
            const lon = coords.coords.longitude;
            let address = '';
            try {
                address = await reverseGeocode(lat, lon);
            } catch {}
            setNewVenue((d) => ({ ...d, lat, lon, address }));
            setAutofillStatus('Location autofilled.');
        }, () => {
            setAutofillStatus('Unable to access your location.');
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    // Pre-populate address/coords when opening Add dialog if position is available
    useEffect(() => {
        if (isAddDialogOpen && position) {
            (async () => {
                let address = '';
                try { address = await reverseGeocode(position.lat, position.lon); } catch {}
                setNewVenue((d) => ({ ...d, lat: position.lat, lon: position.lon, address }));
            })();
        } else if (!isAddDialogOpen) {
            setNewVenue({ name: '', lat: '', lon: '', address: '', amenities: '' });
            setAutofillStatus('');
        }
    }, [isAddDialogOpen, position]);

    // Import venues
    const handleImport = () => {
        if (importVenuesFromJSON(importText)) {
            setUserVenues(getUserVenues());
            setImportText('');
            setStatus('Venues imported.');
        } else {
            setStatus('Invalid JSON.');
        }
    };

    // UI rendering (advanced layout)
    return (
        <div className='containerDetail contentLeft bg-lite ml-5 mr-5 mt--25'>
            <div className='containerDetail bg-lite pl-15 pt-20 pb-20 color-yellow size25 mb-5'>
                <span className='mr-5'>{icons.Cafe || '☕️'}</span>
                Cafe Finder
            </div>
            <div className='containerDetail bg-lite color-lite'>
                <div className='flexContainer'>
                    <div className='containerDetail p-10 size15 bg-green contentCenter flex3Column button containerDetail mr-5 color-yellow brdr-yellow' onClick={locateUser} tabIndex={0} role='button' aria-label='Use My Location'>
                        📡 Use My Location
                    </div>
                    <div className='containerDetail p-10 size15 bg-green contentCenter flex3Column button containerDetail mr-5 color-yellow brdr-yellow' onClick={fetchVenues} tabIndex={0} role='button' aria-label='Find Cafes'>
                        ☕️ Find Cafes
                    </div>
                    <div className='containerDetail p-10 size15 bg-tinted contentCenter flex3Column button containerDetail color-yellow brdr-yellow' onClick={() => setIsAddDialogOpen(true)} tabIndex={0} role='button' aria-label='Add Cafe'>
                        ➕ Add Cafe
                    </div>
                </div>
                <div className='flexContainer mt--3'>
                    <label className='flex3Column'>
                        <select className='containerDetail p-10 ml--1 bg-tintedMedium color-lite' value={sortField} onChange={e => setSortField(e.target.value)}>
                            <option value='distance'>Distance</option>
                            <option value='name'>Name</option>
                        </select>
                    </label>
                    <label className='flex3Column'>
                        <select className='containerDetail p-10 ml-3 bg-tintedMedium color-lite' value={sortDirection} onChange={e => setSortDirection(e.target.value)}>
                            <option value='asc'>Ascending</option>
                            <option value='desc'>Descending</option>
                        </select>
                    </label>
                </div>
                <div className='containerDetail color-yellow p-10 mt-5'>{status}</div>
                {isLoading && <div className='containerDetail color-yellow p-10 mt-5'>Loading cafes...</div>}
                {position && (
                    <div className='containerDetail color-yellow p-10 mt-5'>You: {Number(position.lat).toFixed(4)}, {Number(position.lon).toFixed(4)}</div>
                )}
                {isAddDialogOpen && (
                    <div className='containerDetail mt-10 p-10 bg-dark' role='dialog' aria-modal='true' aria-label='Add Cafe dialog'>
                        <div className='color-yellow size15 mb-5 p-10 size20'>Add Cafe</div>
                        <input type='text' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent' placeholder='Cafe name' value={newVenue.name} onChange={e => setNewVenue({ ...newVenue, name: e.target.value })} />
                        <div className='flexContainer mt-5'>
                            <label className='color-yellow size12 mr-10'>
                                <input type='radio' checked={latLonMode === 'separate'} onChange={() => setLatLonMode('separate')} /> Separate
                            </label>
                            <label className='color-yellow size12'>
                                <input type='radio' checked={latLonMode === 'combined'} onChange={() => setLatLonMode('combined')} /> Lat, Lon
                            </label>
                            <button className='containerDetail button bg-blue color-yellow ml-10' style={{ minWidth: 90 }} onClick={autofillVenueLocation} aria-label='Autofill location'>Autofill</button>
                        </div>
                        {latLonMode === 'separate' ? (
                            <>
                                <input type='number' step='0.000001' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Latitude' value={newVenue.lat} onChange={e => setNewVenue({ ...newVenue, lat: e.target.value })} />
                                <input type='number' step='0.000001' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Longitude' value={newVenue.lon} onChange={e => setNewVenue({ ...newVenue, lon: e.target.value })} />
                            </>
                        ) : (
                            <input type='text' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Lat, Lon (comma separated)' value={typeof newVenue.lat === 'string' && newVenue.lon ? `${newVenue.lat}, ${newVenue.lon}` : newVenue.lat} onChange={e => {
                                setNewVenue({ ...newVenue, lat: e.target.value, lon: '' });
                            }} />
                        )}
                        <input type='text' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Address (optional)' value={newVenue.address} onChange={e => setNewVenue({ ...newVenue, address: e.target.value })} />
                        {autofillStatus && <div className='color-yellow size12 mt-5'>{autofillStatus}</div>}
                        <div className='flexContainer mt-10'>
                            <button className='containerDetail flex3Column button bg-green color-yellow p-10' onClick={handleAddVenue} aria-label='Add Cafe'>Add Cafe</button>
                            <button className='containerDetail flex3Column button bg-red color-yellow p-10 ml-5' onClick={() => setIsAddDialogOpen(false)} aria-label='Cancel'>Cancel</button>
                        </div>
                    </div>
                )}
                <div className='containerDetail mt-5 bg-dark'>
                    {mergedVenues.length === 0 ? (
                        <div className='color-soft size12'>No cafes found yet. Try "Find Cafes" or add your own.</div>
                    ) : (
                        <div className='containerDetail color-lite size20 bg-lite mb-5 mt-10'>
                            <div className='containerDetail mt-5 height-400'>
                                {mergedVenues.map((v, idx) => (
                                    <div
                                        className={`containerDetail bg-lite ${(idx) ? 'mt-5' : ''} button`}
                                        key={v.id}
                                        onClick={() => v.lat && v.lon && window.open(`https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lon}`, '_blank', 'noopener,noreferrer')}
                                        onKeyDown={event => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                v.lat && v.lon && window.open(`https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lon}`, '_blank', 'noopener,noreferrer');
                                            }
                                        }}
                                        role='button'
                                        tabIndex={0}
                                        aria-label={`Open ${v.name} in Maps`}
                                    >
                                        <div className='containerDetail p-10'>
                                            <div className='color-yellow size20'>{icons.Cafe || '☕️'} {v.name}</div>
                                            <div className='color-orange size12 ml-25'>{v.address}</div>
                                        </div>
                                        <div className='containerDetail flexContainer mt-5'>
                                            <div className='flexColumn'>
                                                <span className={`containerDetail p-10 mr-5 mt-5 size10 bg-lite color-yellow`}>{v.source === 'user' ? '📝 User' : '☕️ Cafe'}</span>
                                            </div>
                                            <div className='mb-15 flexColumn'>{Array.isArray(v.amenities) && v.amenities.length > 0 ? v.amenities.map(a => <span key={a}>{a}</span>) : null}</div>
                                            <div className='containerDetail ml-5 flex4Column color-lite p-5 brdr-yellow contentRight size12'>
                                                {v.distance == null ? '--' : `${v.distance.toFixed(1)}`}<span className='size10 color-yellow'>miles</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className='containerDetail mt-10'>
                    <textarea className='containerDetail p-10 bg-tintedMedium color-lite size15 width-100-percent' placeholder='Paste venues JSON to import' value={importText} onChange={e => setImportText(e.target.value)} rows={2} />
                    <button className='button bg-green color-yellow mt-5' onClick={handleImport} aria-label='Import Venues'>Import Venues</button>
                </div>
            </div>
        </div>
    );
};

export default Cafe;
