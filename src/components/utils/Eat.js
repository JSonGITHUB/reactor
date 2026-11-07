import React, { useState, useEffect, useMemo } from 'react';

import milesBetween from './miles.js';
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

// Normalizes Google Places result to Eat venue format
const normalizeGooglePlace = (place) => {
	const lat = Number(place?.geometry?.location?.lat);
	const lon = Number(place?.geometry?.location?.lng);
	const name = String(place?.name || 'Restaurant').trim();
	const address = String(place?.vicinity || place?.formatted_address || '').trim();
	return {
		id: `google-${place?.place_id || `${lat}-${lon}`}`,
		lat,
		lon,
		name,
		address,
		source: 'google',
	};
};

// Always call Google Places directly in production, use type and keyword for best coverage
const searchGooglePlacesNearbyRestaurants = async ({ lat, lon, radius = 5000, maxPages = 2 }) => {
	return searchGooglePlacesNearby({
		lat,
		lon,
		radius,
		type: 'restaurant',
		keyword: 'restaurant|diner|pizza|bar|pub|bakery|cafe|food|grill|bistro|eatery',
		maxPages,
	});
};

const searchOverpassRestaurants = async ({ lat, lon, radius = 10000 }) => {
	const query = `
		[out:json][timeout:25];
		(
			node["amenity"="restaurant"](around:${radius},${lat},${lon});
			way["amenity"="restaurant"](around:${radius},${lat},${lon});
			relation["amenity"="restaurant"](around:${radius},${lat},${lon});
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
		const name = el.tags?.name || 'Restaurant';
		const address = [el.tags?.addr_street, el.tags?.addr_city, el.tags?.addr_state].filter(Boolean).join(', ');
		return {
			id: el.id,
			name,
			address,
			lat,
			lon,
			source: 'overpass',
		};
	});
};

function dedupeVenues(venues) {
	const seen = new Map();
	for (const v of venues) {
		const key = v.name?.toLowerCase() + '|' + (v.address?.toLowerCase() || '') + '|' + (v.lat?.toFixed(4) || '') + '|' + (v.lon?.toFixed(4) || '');
		if (!seen.has(key)) seen.set(key, v);
	}
	return Array.from(seen.values());
}

const LOCAL_STORAGE_KEY = 'EatVenues';
const EAT_PREFS_KEY = 'eat-preferences-v1';



export default function Eat() {
	const [position, setPosition] = useState(null);
	const [status, setStatus] = useState('Tap "Use My Location" to locate nearby restaurants.');
	const [sortField, setSortField] = useState('distance');
	const [sortDirection, setSortDirection] = useState('asc');
	const [venues, setVenues] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [manualForm, setManualForm] = useState({ name: '', address: '', lat: '', lon: '', category: 'restaurant' });
	const [error, setError] = useState('');
	const [isAddFormOpen, setIsAddFormOpen] = useState(false);
	const [latLonMode, setLatLonMode] = useState('separate'); // 'separate' or 'combined'
	const [autofillStatus, setAutofillStatus] = useState('');
	const [style, setStyle] = useState('all');
	const [search, setSearch] = useState('');
	// Edit state for manual venues
	const [editVenueId, setEditVenueId] = useState(null);
	const [editForm, setEditForm] = useState({ name: '', address: '', lat: '', lon: '', category: 'restaurant' });
	const [showControlsId, setShowControlsId] = useState(null);

	// List of eatery styles/categories
	const EATERY_STYLES = [
		{ value: 'all', label: 'All' },
		{ value: 'restaurant', label: 'Restaurant' },
		{ value: 'cafe', label: 'Cafe' },
		{ value: 'bakery', label: 'Bakery' },
		{ value: 'fast_food', label: 'Fast Food' },
		{ value: 'bar', label: 'Bar' },
		{ value: 'pub', label: 'Pub' },
		{ value: 'pizza', label: 'Pizza' },
		{ value: 'diner', label: 'Diner' },
		{ value: 'ice_cream', label: 'Ice Cream' },
		{ value: 'food_court', label: 'Food Court' },
		{ value: 'steakhouse', label: 'Steakhouse' },
		{ value: 'sushi', label: 'Sushi' },
		{ value: 'seafood', label: 'Seafood' },
		{ value: 'sandwich', label: 'Sandwich' },
		{ value: 'chinese', label: 'Chinese' },
		{ value: 'mexican', label: 'Mexican' },
		{ value: 'indian', label: 'Indian' },
		{ value: 'thai', label: 'Thai' },
		{ value: 'vegan', label: 'Vegan' },
		{ value: 'vegetarian', label: 'Vegetarian' },
		{ value: 'other', label: 'Other' },
	];



	// Load preferences and venues from localStorage
	useEffect(() => {
		try {
			const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (saved) setVenues(JSON.parse(saved));
			const prefs = localStorage.getItem(EAT_PREFS_KEY);
			if (prefs) {
				const parsed = JSON.parse(prefs);
				if (typeof parsed.sortField === 'string') setSortField(parsed.sortField);
				if (typeof parsed.sortDirection === 'string') setSortDirection(parsed.sortDirection);
				if (typeof parsed.style === 'string') setStyle(parsed.style);
			}
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(venues));
			localStorage.setItem(EAT_PREFS_KEY, JSON.stringify({ sortField, sortDirection, style }));
		} catch {}
	}, [venues, sortField, sortDirection, style]);


	// Get user location (on button click)
	const getLocation = () => {
		if (!navigator.geolocation) {
			setStatus('Geolocation is not supported.');
			return;
		}
		setStatus('Getting your location...');
		setIsLoading(true);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
				setStatus('Location acquired.');
				setIsLoading(false);
			},
			(err) => {
				setStatus('Location error: ' + err.message);
				setIsLoading(false);
			}
		);
	};


	// Fetch venues automatically when position is set
	useEffect(() => {
		if (!position) return;
		setIsLoading(true);
		setStatus('Searching for restaurants...');
		(async () => {
			let googleVenues = [];
			let overpassVenues = [];
			try {
				const googleResults = await searchGooglePlacesNearbyRestaurants(position);
				googleVenues = googleResults.map(normalizeGooglePlace);
			} catch (err) {
				console.error('Google Places fetch error:', err);
			}
			try {
				overpassVenues = await searchOverpassRestaurants(position);
			} catch (err) {
				console.error('Overpass fetch error:', err);
			}
			// Merge with user venues
			let allVenues = dedupeVenues([
				...venues,
				...googleVenues,
				...overpassVenues,
			]);
			// Attach distance
			if (position) {
				allVenues = allVenues.map(v => ({ ...v, distance: milesBetween(position.lat, position.lon, v.lat, v.lon) }));
			}
			setVenues(allVenues);
			setIsLoading(false);
			setStatus(allVenues.length ? `Found ${allVenues.length} restaurants nearby.` : 'No restaurants found nearby.');
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [position]);


	const handleManualSubmit = e => {
		e.preventDefault();
		let lat = manualForm.lat, lon = manualForm.lon;
		if (latLonMode === 'combined' && typeof lat === 'string' && lat.includes(',')) {
			const [latStr, lonStr] = lat.split(',').map(s => s.trim());
			lat = latStr;
			lon = lonStr;
		}
		const { name, address, category } = manualForm;
		if (!name || !lat || !lon) {
			setError('Name, latitude, and longitude are required.');
			return;
		}
		const newVenue = {
			id: 'manual-' + Date.now(),
			name,
			address,
			lat: parseFloat(lat),
			lon: parseFloat(lon),
			category: category || 'restaurant',
			source: 'manual',
			distance: position ? milesBetween(position.lat, position.lon, parseFloat(lat), parseFloat(lon)) : null,
		};
		setVenues(dedupeVenues([newVenue, ...venues]));
		setManualForm({ name: '', address: '', lat: '', lon: '', category: 'restaurant' });
		setIsAddFormOpen(false);
		setError('');
	};

	// Edit manual venue
	const handleEditVenue = (venue) => {
		setEditVenueId(venue.id);
		setEditForm({
			name: venue.name || '',
			address: venue.address || '',
			lat: venue.lat,
			lon: venue.lon,
			category: venue.category || 'restaurant',
		});
	};

	const handleEditFormSubmit = (e) => {
		e.preventDefault();
		let lat = editForm.lat, lon = editForm.lon;
		if (latLonMode === 'combined' && typeof lat === 'string' && lat.includes(',')) {
			const [latStr, lonStr] = lat.split(',').map(s => s.trim());
			lat = latStr;
			lon = lonStr;
		}
		if (!editForm.name || !lat || !lon) {
			setError('Name, latitude, and longitude are required.');
			return;
		}
		setVenues(vs => vs.map(v => v.id === editVenueId ? {
			...v,
			name: editForm.name,
			address: editForm.address,
			lat: parseFloat(lat),
			lon: parseFloat(lon),
			category: editForm.category || 'restaurant',
			distance: position ? milesBetween(position.lat, position.lon, parseFloat(lat), parseFloat(lon)) : null,
		} : v));
		setEditVenueId(null);
		setEditForm({ name: '', address: '', lat: '', lon: '', category: 'restaurant' });
		setError('');
	};

	// Delete manual venue
	const handleDeleteVenue = (venueId) => {
		setVenues(vs => vs.filter(v => v.id !== venueId));
		if (editVenueId === venueId) {
			setEditVenueId(null);
			setEditForm({ name: '', address: '', lat: '', lon: '' });
		}
	};

	// Autofill for add form
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
			setManualForm((d) => ({ ...d, lat, lon, address }));
			setAutofillStatus('Location autofilled.');
		}, () => {
			setAutofillStatus('Unable to access your location.');
		}, {
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 0
		});
	};

	// Pre-populate address/coords when opening Add form if position is available
	useEffect(() => {
		if (isAddFormOpen && position) {
			(async () => {
				let address = '';
				try { address = await reverseGeocode(position.lat, position.lon); } catch {}
				setManualForm((d) => ({ ...d, lat: position.lat, lon: position.lon, address }));
			})();
		} else if (!isAddFormOpen) {
			setManualForm({ name: '', address: '', lat: '', lon: '' });
			setAutofillStatus('');
		}
	}, [isAddFormOpen, position]);

	// Helper to infer style/category from venue
	function inferVenueStyle(v) {
		// Try to infer from Google/Osm types or name/address
		const typeFields = [v.types, v.amenities, v.category, v.style];
		const text = [v.name, v.address].join(' ').toLowerCase();
		if (typeFields.flat().includes('cafe') || /cafe|coffee/.test(text)) return 'cafe';
		if (typeFields.flat().includes('bakery') || /bakery|pastry|bread/.test(text)) return 'bakery';
		if (typeFields.flat().includes('fast_food') || /fast.?food|burger|fries|mcdonald|wendy|kfc|taco/.test(text)) return 'fast_food';
		if (typeFields.flat().includes('bar') || /bar|pub|brewery|taproom/.test(text)) return 'bar';
		if (typeFields.flat().includes('pub')) return 'pub';
		if (typeFields.flat().includes('pizza') || /pizza/.test(text)) return 'pizza';
		if (typeFields.flat().includes('diner') || /diner/.test(text)) return 'diner';
		if (typeFields.flat().includes('ice_cream') || /ice.?cream|gelato|frozen yogurt/.test(text)) return 'ice_cream';
		if (typeFields.flat().includes('food_court') || /food.?court/.test(text)) return 'food_court';
		if (typeFields.flat().includes('steakhouse') || /steak/.test(text)) return 'steakhouse';
		if (typeFields.flat().includes('sushi') || /sushi/.test(text)) return 'sushi';
		if (typeFields.flat().includes('seafood') || /seafood|fish/.test(text)) return 'seafood';
		if (typeFields.flat().includes('sandwich') || /sandwich|subway/.test(text)) return 'sandwich';
		if (typeFields.flat().includes('chinese') || /chinese|china/.test(text)) return 'chinese';
		if (typeFields.flat().includes('mexican') || /mexican|taco|burrito/.test(text)) return 'mexican';
		if (typeFields.flat().includes('indian') || /indian|curry/.test(text)) return 'indian';
		if (typeFields.flat().includes('thai') || /thai/.test(text)) return 'thai';
		if (typeFields.flat().includes('vegan')) return 'vegan';
		if (typeFields.flat().includes('vegetarian')) return 'vegetarian';
		if (typeFields.flat().includes('restaurant') || /restaurant|eatery|bistro|grill|dining/.test(text)) return 'restaurant';
		return 'other';
	}

	// Sort, filter by style, and search venues
	const sortedVenues = useMemo(() => {
		const withDistance = venues.map((v) => ({
			...v,
			distance: position ? milesBetween(position.lat, position.lon, v.lat, v.lon) : null,
			_style: inferVenueStyle(v)
		}));
		// Filter by style
		let filtered = style === 'all' ? withDistance : withDistance.filter(v => v._style === style);
		// Filter by search
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			filtered = filtered.filter(v =>
				(v.name && v.name.toLowerCase().includes(q)) ||
				(v.address && v.address.toLowerCase().includes(q))
			);
		}
		const getSortValue = (v) => {
			switch (sortField) {
				case 'name': return String(v.name || '').toLowerCase();
				case 'distance':
				default: return v.distance == null ? Number.POSITIVE_INFINITY : v.distance;
			}
		};
		const sortMultiplier = sortDirection === 'desc' ? -1 : 1;
		return filtered.sort((a, b) => {
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
	}, [venues, position, sortField, sortDirection, style, search]);

	const openInMap = (venue) => {
		const url = `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lon}`;
		window.open(url, '_blank');
	};

	return (
		<div className='containerDetail bg-lite mt--25 ml-5 mr-5 contentLeft width--20'>
			<div className='containerDetail bg-lite color-yellow size25 p-20'>
				{icons.eat || '🍽️'} Eat Nearby
			</div>
			<div className='flexContainer mb-10 mt-5'>
				<div
					className='containerDetail flex2Column button bg-green brdr-green color-yellow p-20 size20'
					onClick={getLocation}
					disabled={isLoading}
					role='button'
					tabIndex={0}
					aria-label='Use My Location'
				>
					📍 Use Location
				</div>
				<div
                    className='containerDetail ml-5 flex2Column button bg-green brdr-green color-yellow p-20 size20'
					onClick={() => setIsAddFormOpen(true)}
					role='button'
					tabIndex={0}
					aria-label='Add Restaurant'
				>
					<span className='text-outline-yellow mr-5'>
                        {icons.plus}
                    </span>Add 🍽️
				</div>
			</div>
			<div className='pl-10 color-orange'>{status}</div>
			<div className='containerDetail bg-lite mt-10 mb-10 p-10'>
				<div className='mt--5 mb-5 ml-5 flexContainer'>
                    <div className='flexColumn pt-5'>
                        <label className='color-yellow'>Style:</label>
                    </div>
                    <div className='flexColumn'>
                        <select className='containerDetail color-lite mr-10' value={style} onChange={e => setStyle(e.target.value)}>
                            {EATERY_STYLES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flexColumn pt-5'>
                        <label className='color-yellow'>Sort:</label>
                    </div>
                    <div className='flexColumn'>
                        <select className='containerDetail color-lite mr-5' value={sortField} onChange={e => setSortField(e.target.value)}>
                            <option value='distance'>Distance</option>
                            <option value='name'>Name</option>
                        </select>
                    </div>
					<div className='flexColumn'>
                        <select className='containerDetail color-lite' value={sortDirection} onChange={e => setSortDirection(e.target.value)}>
                            <option value='asc'>Asc</option>
                            <option value='desc'>Desc</option>
                        </select>
                    </div>
				</div>
				<div className='mt-5 ml-5'>
					<input
						className='containerDetail p-10 bg-tintedMedium color-lite size15 width-100-percent'
						type='text'
						placeholder='Search by name or address...'
						value={search}
						onChange={e => setSearch(e.target.value)}
						aria-label='Search eateries'
					/>
				</div>
			</div>
			{isAddFormOpen && (
				<form onSubmit={handleManualSubmit} aria-label='Add a restaurant'>
					<fieldset className='containerDetail bg-lite p-10 mb-10'>
						<legend className='color-yellow'>Add a Restaurant</legend>
						<label className='color-yellow p-10'>
							Name
							<input className='containerDetail color-lite ml-5' value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} required aria-required='true' />
						</label>
						<label className='color-yellow p-10 ml-10'>
							Address
							<input className='containerDetail color-lite ml-5' value={manualForm.address} onChange={e => setManualForm(f => ({ ...f, address: e.target.value }))} />
						</label>
						<label className='color-yellow p-10 ml-10'>
							Category
							<select className='containerDetail color-lite ml-5' value={manualForm.category} onChange={e => setManualForm(f => ({ ...f, category: e.target.value }))}>
								{EATERY_STYLES.filter(opt => opt.value !== 'all').map(opt => (
									<option key={opt.value} value={opt.value}>{opt.label}</option>
								))}
							</select>
						</label>
						<div className='flexContainer mt-5'>
							<label className='color-yellow p-10 size12 mr-10'>
								<input type='radio' checked={latLonMode === 'separate'} onChange={() => setLatLonMode('separate')} /> Separate
							</label>
							<label className='color-yellow p-10 size12'>
								<input type='radio' checked={latLonMode === 'combined'} onChange={() => setLatLonMode('combined')} /> Lat, Lon
							</label>
							<button className='containerDetail button bg-blue color-yellow ml-10' style={{ minWidth: 90 }} type='button' onClick={autofillVenueLocation} aria-label='Autofill location'>Autofill</button>
						</div>
						{latLonMode === 'separate' ? (
							<>
								<input type='number' step='0.000001' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Latitude' value={manualForm.lat} onChange={e => setManualForm(f => ({ ...f, lat: e.target.value }))} />
								<input type='number' step='0.000001' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Longitude' value={manualForm.lon} onChange={e => setManualForm(f => ({ ...f, lon: e.target.value }))} />
							</>
						) : (
							<input type='text' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Lat, Lon (comma separated)' value={typeof manualForm.lat === 'string' && manualForm.lon ? `${manualForm.lat}, ${manualForm.lon}` : manualForm.lat} onChange={e => {
								setManualForm(f => ({ ...f, lat: e.target.value, lon: '' }));
							}} />
						)}
						{autofillStatus && <div className='color-yellow size12 mt-5'>{autofillStatus}</div>}
						<div className='flexContainer mt-10'>
							<button className='containerDetail flex3Column button bg-green color-yellow p-10' type='submit'>Add Restaurant</button>
							<button className='containerDetail flex3Column button bg-red color-yellow p-10 ml-5' type='button' onClick={() => setIsAddFormOpen(false)}>Cancel</button>
						</div>
					</fieldset>
				</form>
			)}
			<div className='height-400'>
				{isLoading ? <div className='color-yellow'>Loading...</div> : null}
				{sortedVenues.map((v, idx) => (
					<div
						key={v.id}
						className={`containerDetail bg-lite ${idx > 0 ? 'mt-5' : ''} button`}
						style={{ cursor: 'pointer', position: 'relative' }}
					>
						{editVenueId === v.id ? (
							<form onSubmit={handleEditFormSubmit} className='containerDetail bg-lite p-10 mb-10' style={{ border: '1px solid #ff0' }}>
								<legend className='color-yellow p-10 size20'>Edit Restaurant</legend>
								<label className='color-yellow p-10 mb-15'>
									Name
                                    <div>
                                        <input 
                                            className='containerDetail color-lite ml-5 p-10 size20 width-100-percent' 
                                            value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required aria-required='true' 
                                        />
                                    </div>
								</label>
                                <br/>
								<label className='color-yellow ml-10'>
									Address
                                    <div className='mt-5'>
                                        <input className='containerDetail color-lite p-10 ml-5 size20 width-100-percent' value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
                                    </div>
								</label>
                                <br />
								<label className='color-yellow ml-10'>
									Category
                                    <div className='mt--5'>
                                        <select className='containerDetail p-10 color-lite size20 width-100-percent' value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                                            {EATERY_STYLES.filter(opt => opt.value !== 'all').map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
								</label>
								<div className='flexContainer mt-5'>
									<label className='color-yellow p-10 size12 mr-10'>
										<input type='radio' checked={latLonMode === 'separate'} onChange={() => setLatLonMode('separate')} /> Separate
									</label>
									<label className='color-yellow p-10 size12'>
										<input type='radio' checked={latLonMode === 'combined'} onChange={() => setLatLonMode('combined')} /> Lat, Lon
									</label>
								</div>
								{latLonMode === 'separate' ? (
									<>
										<input type='number' step='0.000001' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Latitude' value={editForm.lat} onChange={e => setEditForm(f => ({ ...f, lat: e.target.value }))} />
										<input type='number' step='0.000001' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Longitude' value={editForm.lon} onChange={e => setEditForm(f => ({ ...f, lon: e.target.value }))} />
									</>
								) : (
									<input type='text' className='containerDetail p-10 bg-tintedMedium color-lite size20 width-100-percent mt-5' placeholder='Lat, Lon (comma separated)' value={typeof editForm.lat === 'string' && editForm.lon ? `${editForm.lat}, ${editForm.lon}` : editForm.lat} onChange={e => {
										setEditForm(f => ({ ...f, lat: e.target.value, lon: '' }));
									}} />
								)}
								<div className='flexContainer mt-10'>
									<button className='containerDetail flex3Column button bg-green color-yellow p-10' type='submit'>Save</button>
									<button className='containerDetail flex3Column button bg-red color-yellow p-10 ml-5' type='button' onClick={() => setEditVenueId(null)}>Cancel</button>
								</div>
							</form>
						) : (
							<>
								<div
									onClick={() => openInMap(v)}
									onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInMap(v); } }}
									role='button'
									tabIndex={0}
									aria-label={`Open ${v.name} in Maps`}
								>
									<div className='containerDetail flexContainer bg-lite p-10 mb-5'>
                                        <div className='flex2Column'>
                                            <div className='color-yellow size20'>{icons.eat || '🍽️'} {v.name}</div>
                                            <div className='color-orange size12 ml-25'>{v.address}</div>
										</div>
                                        <div className='flexColumn contentRight'>
                                            {v.source === 'manual' && (
                                                <button
                                                    className='containerDetail button bg-lite color-yellow pt-5 pb-5'
                                                    type='button'
                                                    aria-label={`Show edit/delete for ${v.name}`}
                                                    tabIndex={0}
                                                    onClick={e => { e.stopPropagation(); setShowControlsId(showControlsId === v.id ? null : v.id); }}
                                                    style={{ fontSize: 18 }}
                                                >
                                                    ✏️
                                                </button>
                                            )}
                                        </div>
									</div>
									<div className='containerDetail flexContainer'>
										<div className='flex2Column containerDetail p-10 size10 bg-lite color-yellow'>
											{v.source === 'google' ? 'Google' : v.source === 'overpass' ? 'OSM' : 'Manual'}
											{v.category ? ` • ${EATERY_STYLES.find(opt => opt.value === v.category)?.label || v.category}` : ''}
										</div>
										<div className='containerDetail ml-5 flex2Column color-lite p-10 brdr-yellow contentRight size12'>
											{v.distance == null ? '--' : `${v.distance.toFixed(1)}`}<span className='size10 color-yellow'> miles</span>
										</div>
									</div>
								</div>
								{v.source === 'manual' && showControlsId === v.id && (
									<div className='flexContainer mt-5 size20'>
										<button className='containerDetail button bg-blue color-yellow p-10 mr-5 m-1 flex2Column' type='button' onClick={() => handleEditVenue(v)} aria-label={`Edit ${v.name}`}>Edit</button>
										<button className='containerDetail button bg-red color-yellow p-10 ml-5 flex2Column' type='button' onClick={() => handleDeleteVenue(v.id)} aria-label={`Delete ${v.name}`}>Delete</button>
									</div>
								)}
							</>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
