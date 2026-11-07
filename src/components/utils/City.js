import React, { useEffect, useMemo, useState } from 'react';
import icons from '../site/icons';

const MAP_PREFERENCE_AUTO = 'auto';
const MAP_PREFERENCE_APPLE = 'apple';
const MAP_PREFERENCE_GOOGLE = 'google';

const CITY_PROGRESS_KEY = 'cityChecklistProgressV1';
const CITY_PREFS_KEY = 'cityPrefsV1';
const CITY_SCHEDULE_PROGRESS_KEY = 'cityScheduleProgressV1';
const CITY_SCHEDULE_PREFS_KEY = 'citySchedulePrefsV1';
const CITY_USER_POIS_KEY = 'cityUserPoisV1';
const ALL_SECTION_ID = 'sf-all';

const CATEGORY_ICON_BY_TYPE = {
	poi: '📍',
	restaurant: '🍽️',
	cafe: '☕️',
	bar: '🍺',
	shop: '🛍️',
	transport: '🚋',
};

const CATEGORY_BACKGROUND_BY_TYPE = {
	poi: 'rgba(87, 153, 239, 0.14)',
	restaurant: 'rgba(255, 170, 66, 0.18)',
	cafe: 'rgba(122, 195, 112, 0.16)',
	bar: 'rgba(232, 202, 110, 0.16)',
	shop: 'rgba(176, 142, 255, 0.16)',
	transport: 'rgba(83, 213, 200, 0.16)',
};

function getCategoryItemStyle(category) {
	const normalized = CATEGORY_BACKGROUND_BY_TYPE[category] ? category : 'poi';
	return {
		backgroundColor: CATEGORY_BACKGROUND_BY_TYPE[normalized],
		borderRadius: '8px',
		padding: '4px 6px',
	};
}

function inferPoiCategory(name, sectionId) {
	const text = String(name || '').toLowerCase();
	if (/cafe|coffee|bakery/.test(text)) return 'cafe';
	if (/bar|pub|vesuvio/.test(text)) return 'bar';
	if (/restaurant|bistro|eatery|diner/.test(text)) return 'restaurant';
	if (/bookstore|market|factory|lane|shopping|shop|mall|retail/.test(text)) return 'shop';
	if (sectionId === 'sf-transport-depots') return 'transport';
	if (sectionId === 'sf-car-rentals') return 'shop';
	if (sectionId === 'sf-union-square-area' || sectionId === 'sf-chinatown' || sectionId === 'sf-north-beach-little-italy') return 'shop';
	return 'poi';
}

function isIPhoneDevice() {
	return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openPoiInMaps({ lat, lng }, mapPreference) {
	if (!lat || !lng) return;
	const destination = `${lat},${lng}`;
	const resolvedPreference = mapPreference === MAP_PREFERENCE_AUTO
		? (isIPhoneDevice() ? MAP_PREFERENCE_APPLE : MAP_PREFERENCE_GOOGLE)
		: mapPreference;

	const mapUrl = resolvedPreference === MAP_PREFERENCE_APPLE
		? `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&dirflg=d`
		: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

	window.open(mapUrl, '_blank', 'noopener,noreferrer');
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
	const R = 6371e3;
	const p1 = (lat1 * Math.PI) / 180;
	const p2 = (lat2 * Math.PI) / 180;
	const dp = ((lat2 - lat1) * Math.PI) / 180;
	const dl = ((lon2 - lon1) * Math.PI) / 180;

	const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
		Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);

	return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function metersToMiles(meters) {
	return meters / 1609.344;
}

function formatMilesDisplay(miles) {
	const fixed = Number(miles || 0).toFixed(2);
	return fixed.startsWith('0.') ? fixed.slice(1) : fixed;
}

async function reverseGeocode(lat, lng) {
	const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
	const response = await fetch(url, {
		headers: {
			Accept: 'application/json',
		},
	});
	if (!response.ok) throw new Error('Reverse geocode failed');
	const data = await response.json();
	return String(data?.display_name || '').trim();
}

function useLiveLocation() {
	const [location, setLocation] = useState(null);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!navigator.geolocation) {
			setError('Geolocation not supported by this browser.');
			return;
		}

		const watcher = navigator.geolocation.watchPosition(
			(pos) => {
				setLocation({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				});
			},
			(err) => setError(err.message || 'Unable to get location.'),
			{ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
		);

		return () => navigator.geolocation.clearWatch(watcher);
	}, []);

	return { location, error };
}

const CITY_DATA = [
	{
		id: 'san-francisco',
		name: 'San Francisco',
		sections: [
			{
				id: 'sf-sites',
				name: 'Sites',
				lat: 37.8199,
				lng: -122.4783,
				pois: [
					{ id: 'golden-gate-bridge', name: 'Golden Gate Bridge', lat: 37.8199, lng: -122.4783 },
					{ id: 'golden-gate-welcome-center', name: 'Golden Gate Bridge Welcome Center', lat: 37.8078, lng: -122.4750 },
					{ id: 'palace-of-fine-arts', name: 'Palace of Fine Arts', lat: 37.8024, lng: -122.4483 },
					{ id: 'crissy-field', name: 'Crissy Field', lat: 37.8036, lng: -122.4647 },
					{ id: 'painted-ladies', name: 'Painted Ladies', lat: 37.7760, lng: -122.4325 },
					{ id: 'haight-ashbury', name: 'Haight-Ashbury', lat: 37.7692, lng: -122.4481 },
					{ id: 'lombard-street', name: 'Lombard Street', lat: 37.8021, lng: -122.4187 },
					{ id: 'prisidio-tunnel-tops', name: 'Prisidio Tunnel Tops', lat: 37.8017, lng: -122.4596 },
					{ id: 'wave-organ', name: 'The Wave Organ', lat: 37.8086, lng: -122.4324 },
					{ id: 'ocean-beach', name: 'Ocean Beach', lat: 37.7596, lng: -122.5111 },
					{ id: 'baker-beach', name: 'Baker Beach', lat: 37.7936, lng: -122.4836 },
					{ id: 'lands-end', name: 'Lands End', lat: 37.7802, lng: -122.5136 },
					{ id: 'sutro-baths', name: 'Sutro Baths', lat: 37.7803, lng: -122.5130 },
					{ id: 'stow-lake', name: 'Stow Lake', lat: 37.7686, lng: -122.4750 },
					{ id: 'point-reyes-sea-shore', name: 'Point Reyes National Sea Shore', lat: 38.0700, lng: -122.9400 },
					{ id: 'cypress-tree-tunnel', name: 'Cypress Tree Tunnel', lat: 38.0654, lng: -122.8065 },
					{ id: 'point-reyes-light-house', name: 'Point Reyes Light House', lat: 37.9963, lng: -123.0200 },
				],
			},
			{
				id: 'sf-attractions',
				name: 'Attractions',
				lat: 37.8087,
				lng: -122.4098,
				pois: [
					{ id: 'fishermans-wharf', name: "Fisherman's Wharf", lat: 37.8080, lng: -122.4177 },
					{ id: 'ghirardelli-square', name: 'Ghirardelli Square', lat: 37.8058, lng: -122.4228 },
					{ id: 'hyde-street-corridor', name: 'Hyde Street cable car corridor', lat: 37.8047, lng: -122.4206 },
					{ id: 'pier-39', name: 'Pier 39', lat: 37.8087, lng: -122.4098 },
					{ id: 'alcatraz', name: 'Alcatraz', lat: 37.8267, lng: -122.4230 },
					{ id: 'battery-spencer', name: 'Battery Spencer', lat: 37.8276, lng: -122.4817 },
					{ id: 'marin-headlands', name: 'Marin Headlands', lat: 37.8263, lng: -122.4993 },
					{ id: 'sausalito', name: 'Sausalito', lat: 37.8591, lng: -122.4853 },
					{ id: 'muir-woods', name: 'Muir Woods National Monument', lat: 37.8954, lng: -122.5780 },
					{ id: 'muir-woods-visitor-center', name: 'Muir Woods Visitor Center', lat: 37.8913, lng: -122.5729 },
					{ id: 'aquatic-park-cove', name: 'Aquatic Park Cove', lat: 37.8062, lng: -122.4235 },
				],
			},
			{
				id: 'sf-museums',
				name: 'Museums',
				lat: 37.8008,
				lng: -122.4580,
				pois: [
					{ id: 'japanese-tea-garden', name: 'Japanese Tea Garden', lat: 37.7701, lng: -122.4702 },
					{ id: 'sf-botanical', name: 'SF Botanical', lat: 37.7677, lng: -122.4672 },
					{ id: 'conservetory-of-flowers', name: 'Conservetory of Flowers', lat: 37.7726, lng: -122.4604 },
					{ id: 'sf-maritime-park', name: 'SF Maritime National Historic Park', lat: 37.8066, lng: -122.4269 },
					{ id: 'deyoung', name: 'de Young Museum', lat: 37.7715, lng: -122.4687 },
					{ id: 'academy-sciences', name: 'California Academy of Sciences', lat: 37.7699, lng: -122.4661 },
					{ id: 'sfmoma', name: 'SFMOMA', lat: 37.7857, lng: -122.4011 },
				],
			},
			{
				id: 'sf-car-rentals',
				name: 'Car Rentals',
				lat: 37.6213,
				lng: -122.3790,
				pois: [
					{ id: 'sfo-rental-center', name: 'SFO Rental Car Center', lat: 37.6227, lng: -122.3929 },
					{ id: 'hertz-fishermans-wharf', name: "Hertz - Fisherman's Wharf", lat: 37.8061, lng: -122.4171 },
					{ id: 'enterprise-union-square', name: 'Enterprise - Union Square', lat: 37.7873, lng: -122.4086 },
				],
			},
			{
				id: 'sf-transport-depots',
				name: 'Transportation Depots (Trolleys & Trains)',
				lat: 37.7764,
				lng: -122.3949,
				pois: [
					{ id: 'powell-street-station', name: 'Powell Street Station', lat: 37.7840, lng: -122.4075 },
					{ id: 'powell-market-cable-car-turnaround', name: 'Powell & Market Cable Car Turnaround', lat: 37.7844, lng: -122.4078 },
					{ id: 'hyde-beach-cable-car-turnaround', name: 'Hyde & Beach Cable Car Turnaround', lat: 37.8066, lng: -122.4200 },
					{ id: 'caltrain-4th-king', name: 'Caltrain 4th & King', lat: 37.7764, lng: -122.3949 },
					{ id: 'f-line-embarcadero', name: 'F-Line Embarcadero Trolley Stop', lat: 37.7946, lng: -122.3962 },
					{ id: 'f-market-wharves', name: 'F Market & Wharves Streetcar Terminal', lat: 37.8075, lng: -122.4148 },
				],
			},
			{
				id: 'sf-union-square-area',
				name: 'Union Square Area',
				lat: 37.7879,
				lng: -122.4075,
				pois: [
					{ id: 'union-square-plaza', name: 'Union Square Plaza', lat: 37.7879, lng: -122.4075 },
					{ id: 'maiden-lane', name: 'Maiden Lane', lat: 37.7885, lng: -122.4058 },
					{ id: 'st-francis-hotel', name: 'Westin St. Francis', lat: 37.7877, lng: -122.4082 },
					{ id: 'palace-hotel-garden-court', name: 'Palace Hotel - Garden Court', lat: 37.7881, lng: -122.4011 },
					{ id: 'lottas-fountain', name: "Lotta's Fountain", lat: 37.7896, lng: -122.4014 },
					{ id: 'dragon-gate', name: 'Dragon Gate', lat: 37.7909, lng: -122.4050 },
				],
			},
			{
				id: 'sf-chinatown',
				name: 'Chinatown',
				lat: 37.7941,
				lng: -122.4078,
				pois: [
					{ id: 'chinatown-grant-ave', name: 'Grant Avenue Chinatown corridor', lat: 37.7932, lng: -122.4062 },
					{ id: 'portsmouth-square', name: 'Portsmouth Square', lat: 37.7948, lng: -122.4049 },
					{ id: 'old-st-marys-cathedral', name: "Old St. Mary's Cathedral", lat: 37.7920, lng: -122.4058 },
					{ id: 'fortune-cookie-factory', name: 'Golden Gate Fortune Cookie Factory', lat: 37.7939, lng: -122.4072 },
					{ id: 'waverly-place', name: 'Waverly Place', lat: 37.7930, lng: -122.4067 },
					{ id: 'stockton-street-bakeries', name: 'Stockton Street bakeries and markets', lat: 37.7956, lng: -122.4074 },
				],
			},
			{
				id: 'sf-north-beach-little-italy',
				name: 'North Beach / Little Italy',
				lat: 37.8005,
				lng: -122.4101,
				pois: [
					{ id: 'washington-square-park', name: 'Washington Square Park', lat: 37.8008, lng: -122.4101 },
					{ id: 'saints-peter-paul', name: 'Saints Peter and Paul Church', lat: 37.8013, lng: -122.4103 },
					{ id: 'city-lights-bookstore', name: 'City Lights Bookstore', lat: 37.7975, lng: -122.4066 },
					{ id: 'vesuvio-cafe', name: 'Vesuvio Cafe', lat: 37.7976, lng: -122.4067 },
					{ id: 'columbus-avenue-corridor', name: 'Columbus Avenue corridor', lat: 37.7990, lng: -122.4076 },
					{ id: 'coit-tower', name: 'Coit Tower', lat: 37.8024, lng: -122.4058 },
					{ id: 'filbert-steps', name: 'Filbert Steps', lat: 37.8013, lng: -122.4039 },
				],
			},
			{
				id: 'sf-golden-gate-park-area',
				name: 'Golden Gate Park Area',
				lat: 37.7694,
				lng: -122.4862,
				pois: [
					{ id: 'golden-gate-park-main', name: 'Golden Gate Park', lat: 37.7694, lng: -122.4862 },
					{ id: 'music-concourse', name: 'Music Concourse', lat: 37.7691, lng: -122.4661 },
					{ id: 'hellman-hollow', name: 'Hellman Hollow', lat: 37.7697, lng: -122.4729 },
					{ id: 'bison-paddock', name: 'Bison Paddock', lat: 37.7697, lng: -122.4986 },
					{ id: 'strawberry-hill', name: 'Strawberry Hill', lat: 37.7689, lng: -122.4749 },
					{ id: 'japanese-tea-garden', name: 'Japanese Tea Garden', lat: 37.7701, lng: -122.4702 },
					{ id: 'sf-botanical', name: 'SF Botanical', lat: 37.7677, lng: -122.4672 },
					{ id: 'conservetory-of-flowers', name: 'Conservetory of Flowers', lat: 37.7726, lng: -122.4604 },
					{ id: 'deyoung', name: 'de Young Museum', lat: 37.7715, lng: -122.4687 },
					{ id: 'academy-sciences', name: 'California Academy of Sciences', lat: 37.7699, lng: -122.4661 },
					{ id: 'stow-lake', name: 'Stow Lake', lat: 37.7686, lng: -122.4750 },
				],
			},
			{
				id: 'sf-haight-ashbury-area',
				name: 'Haight-Ashbury Area',
				lat: 37.7692,
				lng: -122.4481,
				pois: [
					{ id: 'haight-ashbury-intersection', name: 'Haight-Ashbury', lat: 37.7692, lng: -122.4481, category: 'poi' },
					{ id: 'haight-street-corridor', name: 'Haight Street corridor', lat: 37.7700, lng: -122.4469, category: 'shop' },
					{ id: 'coffee-to-the-people', name: 'Coffee To The People', lat: 37.7700, lng: -122.4462, category: 'cafe' },
					{ id: 'cha-cha-cha', name: 'Cha Cha Cha', lat: 37.7690, lng: -122.4503, category: 'restaurant' },
					{ id: 'magnolia-brewing', name: 'Magnolia Brewing', lat: 37.7692, lng: -122.4490, category: 'bar' },
					{ id: 'ameoba-music', name: 'Amoeba Music', lat: 37.7697, lng: -122.4488, category: 'shop' },
					{ id: 'recycled-records', name: 'Recycled Records', lat: 37.7693, lng: -122.4476, category: 'shop' },
					{ id: 'piedmont-boutique', name: 'Piedmont Boutique', lat: 37.7701, lng: -122.4458, category: 'shop' },
					{ id: 'love-on-haight', name: 'Love On Haight', lat: 37.7696, lng: -122.4465, category: 'shop' },
					{ id: 'wasteland-haight', name: 'Wasteland', lat: 37.7699, lng: -122.4452, category: 'shop' },
					{ id: 'booksmith', name: 'Booksmith', lat: 37.7691, lng: -122.4508, category: 'shop' },
					{ id: 'held-over-haight', name: 'Held Over', lat: 37.7698, lng: -122.4470, category: 'shop' },
				],
			},
			{
				id: 'sf-overlooked-locations',
				name: 'Overlooked SF Locations',
				lat: 37.7879,
				lng: -122.4009,
				pois: [
					{ id: 'ferry-building', name: 'Ferry Building', lat: 37.7955, lng: -122.3937 },
					{ id: 'salesforce-park', name: 'Salesforce Park', lat: 37.7890, lng: -122.3969 },
					{ id: 'japantown-peace-plaza', name: 'Japantown Peace Plaza', lat: 37.7851, lng: -122.4293 },
					{ id: 'hayes-valley', name: 'Hayes Valley', lat: 37.7764, lng: -122.4242 },
					{ id: 'dolores-park', name: 'Mission Dolores Park', lat: 37.7596, lng: -122.4269 },
					{ id: 'mission-dolores', name: 'Mission Dolores', lat: 37.7647, lng: -122.4269 },
					{ id: 'valencia-street-corridor', name: 'Valencia Street corridor', lat: 37.7605, lng: -122.4210 },
					{ id: 'castro-district', name: 'Castro District', lat: 37.7609, lng: -122.4350 },
					{ id: 'twin-peaks', name: 'Twin Peaks', lat: 37.7544, lng: -122.4477 },
					{ id: 'corona-heights', name: 'Corona Heights', lat: 37.7655, lng: -122.4386 },
					{ id: 'bernal-heights-park', name: 'Bernal Heights Park', lat: 37.7435, lng: -122.4149 },
					{ id: 'legion-of-honor', name: 'Legion of Honor', lat: 37.7845, lng: -122.5008 },
					{ id: 'fort-point', name: 'Fort Point', lat: 37.8106, lng: -122.4769 },
					{ id: 'presidio-main-post', name: 'Presidio Main Post', lat: 37.7989, lng: -122.4662 },
					{ id: 'marina-chestnut', name: 'Marina / Chestnut Street', lat: 37.8028, lng: -122.4369 },
					{ id: 'fort-mason', name: 'Fort Mason', lat: 37.8067, lng: -122.4313 },
				],
			},
		],
	},
];

const DAY_PLANNER = [
	{
		id: 'day-1',
		title: 'Day 1 - Golden Gate Park & Ocean',
		blocks: [
			{ period: 'Morning', items: ['Japanese Tea Garden', 'SF Botanical'] },
			{ period: 'Lunch', items: ['Irving Street or Inner Sunset neighborhood'] },
			{ period: 'Afternoon', items: ['Stow Lake', 'Conservetory of Flowers'] },
			{ period: 'Evening', items: ['Ocean Beach sunset'] },
		],
	},
	{
		id: 'day-2',
		title: 'Day 2 - Marin County & Redwoods',
		note: 'Nature day.',
		blocks: [
			{ period: 'Morning', items: ['Golden Gate Bridge Welcome Center', 'Battery Spencer', 'Muir Woods National Monument', 'Muir Woods Visitor Center'] },
			{ period: 'Lunch', items: ['Sausalito waterfront'] },
			{ period: 'Afternoon', items: ['Marin Headlands scenic overlooks'] },
			{ period: 'Evening', items: ['Return via Golden Gate Bridge at sunset'] },
		],
	},
	{
		id: 'day-3',
		title: 'Day 3 - Waterfront & Historic San Francisco',
		blocks: [
			{ period: 'Morning', items: ["Fisherman's Wharf", 'Pier 39'] },
			{ period: 'Lunch', items: ['Wharf area'] },
			{ period: 'Afternoon', items: ['SF Maritime National Historic Park', 'Aquatic Park Cove'] },
			{ period: 'Evening', items: ['Ghirardelli Square', 'Bay sunset views'] },
		],
		optionalPlan: {
			title: 'Optional Swap',
			description: 'Add Alcatraz (half-day) and reduce time around the Wharf.',
			items: ['Alcatraz']
		}
	},
	{
		id: 'day-4',
		title: 'Day 4 - Presidio, Views & Hidden Gems',
		blocks: [
			{ period: 'Morning', items: ['Prisidio Tunnel Tops', 'Crissy Field'] },
			{ period: 'Midday', items: ['Palace of Fine Arts'] },
			{ period: 'Afternoon', items: ['Lands End', 'Sutro Baths'] },
			{ period: 'Evening', items: ['Marina District dinner', 'Walk along the waterfront near your hotel'] },
		],
		optionalPlan: {
			title: 'Wow Day Trip',
			description: 'Drive north instead of more city time.',
			items: ['Point Reyes National Sea Shore', 'Cypress Tree Tunnel', 'Point Reyes Light House']
		}
	},
	{
		id: 'day-5',
		title: 'Day 5 - Painted Ladies, Cable Cars & Waterfront Views',
		note: 'Blend the Golden Gate Park side of town with classic waterfront and postcard stops.',
		blocks: [
			{ period: 'Morning', items: ['Painted Ladies', 'Haight-Ashbury'] },
			{ period: 'Lunch', items: ['Hyde Street cable car corridor'] },
			{ period: 'Afternoon', items: ['Lombard Street', 'Palace of Fine Arts', 'Crissy Field'] },
			{ period: 'Evening', items: ['Powell & Market Cable Car Turnaround', 'Ghirardelli Square'] },
		],
		optionalPlan: {
			title: 'Cable Car Add-On',
			description: 'If the bakery and gastropub memory is the cable car stretch near the waterfront, ride toward Hyde & Beach and wander the cafes there.',
			items: ['Hyde & Beach Cable Car Turnaround', 'Hyde Street cable car corridor']
		}
	},
];

const normalizeText = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function City() {
	const { location, error } = useLiveLocation();
	const [completed, setCompleted] = useState({});
	const [selectedCityId, setSelectedCityId] = useState(CITY_DATA[0].id);
	const [sortMode, setSortMode] = useState('distance');
	const [mapPreference, setMapPreference] = useState(MAP_PREFERENCE_AUTO);
	const [collapsedSections, setCollapsedSections] = useState({});
	const [userPois, setUserPois] = useState([]);
	const [isAddLocationCollapsed, setIsAddLocationCollapsed] = useState(true);
	const [addLocationData, setAddLocationData] = useState({
		name: '',
		address: '',
		lat: '',
		lng: '',
		sectionId: '',
	});
	const [addLocationCoordMode, setAddLocationCoordMode] = useState('combined');
	const [addLocationStatus, setAddLocationStatus] = useState('');
	const [hasAutoPrefilledAddLocation, setHasAutoPrefilledAddLocation] = useState(false);
	const [selectedDayId, setSelectedDayId] = useState(DAY_PLANNER[0].id);
	const [scheduleCompleted, setScheduleCompleted] = useState({});
	const [scheduleOptionalEnabled, setScheduleOptionalEnabled] = useState({});
	const [isDayPlannerCollapsed, setIsDayPlannerCollapsed] = useState(false);

	useEffect(() => {
		try {
			const savedProgress = localStorage.getItem(CITY_PROGRESS_KEY);
			if (savedProgress) setCompleted(JSON.parse(savedProgress));
			const savedScheduleProgress = localStorage.getItem(CITY_SCHEDULE_PROGRESS_KEY);
			if (savedScheduleProgress) setScheduleCompleted(JSON.parse(savedScheduleProgress));

			const savedPrefs = localStorage.getItem(CITY_PREFS_KEY);
			if (savedPrefs) {
				const parsed = JSON.parse(savedPrefs);
				if (parsed.selectedCityId) setSelectedCityId(parsed.selectedCityId);
				if (parsed.sortMode) setSortMode(parsed.sortMode);
				if (parsed.mapPreference) setMapPreference(parsed.mapPreference);
				if (parsed.addLocationCoordMode) setAddLocationCoordMode(parsed.addLocationCoordMode);
				if (parsed.collapsedSections && typeof parsed.collapsedSections === 'object') {
					setCollapsedSections(parsed.collapsedSections);
				}
			}
			const savedUserPois = localStorage.getItem(CITY_USER_POIS_KEY);
			if (savedUserPois) setUserPois(JSON.parse(savedUserPois));
			const savedSchedulePrefs = localStorage.getItem(CITY_SCHEDULE_PREFS_KEY);
			if (savedSchedulePrefs) {
				const parsed = JSON.parse(savedSchedulePrefs);
				if (parsed.selectedDayId) setSelectedDayId(parsed.selectedDayId);
				if (parsed.scheduleOptionalEnabled && typeof parsed.scheduleOptionalEnabled === 'object') {
					setScheduleOptionalEnabled(parsed.scheduleOptionalEnabled);
				}
				if (typeof parsed.isDayPlannerCollapsed === 'boolean') {
					setIsDayPlannerCollapsed(parsed.isDayPlannerCollapsed);
				}
			}
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(CITY_PROGRESS_KEY, JSON.stringify(completed));
			localStorage.setItem(CITY_PREFS_KEY, JSON.stringify({
				selectedCityId,
				sortMode,
				mapPreference,
				collapsedSections,
				addLocationCoordMode,
			}));
			localStorage.setItem(CITY_USER_POIS_KEY, JSON.stringify(userPois));
			localStorage.setItem(CITY_SCHEDULE_PROGRESS_KEY, JSON.stringify(scheduleCompleted));
			localStorage.setItem(CITY_SCHEDULE_PREFS_KEY, JSON.stringify({ selectedDayId, scheduleOptionalEnabled, isDayPlannerCollapsed }));
		} catch {}
	}, [completed, selectedCityId, sortMode, mapPreference, collapsedSections, addLocationCoordMode, userPois, scheduleCompleted, selectedDayId, scheduleOptionalEnabled, isDayPlannerCollapsed]);

	const selectedCity = useMemo(() => {
		return CITY_DATA.find(city => city.id === selectedCityId) || CITY_DATA[0];
	}, [selectedCityId]);

	const selectedCitySections = useMemo(() => {
		const cityUserPois = userPois.filter((poi) => poi.cityId === selectedCity.id);
		return selectedCity.sections.map((section) => {
			const sectionPois = section.pois.map((poi) => ({
				...poi,
				category: poi.category || inferPoiCategory(poi.name, section.id),
			}));
			const extraPois = cityUserPois
				.filter((poi) => poi.sectionId === section.id)
				.map((poi) => ({
					id: poi.id,
					name: poi.name,
					lat: poi.lat,
					lng: poi.lng,
					category: poi.category || inferPoiCategory(poi.name, section.id),
				}));
			return {
				...section,
				pois: [...sectionPois, ...extraPois],
			};
		});
	}, [selectedCity, userPois]);

	const allLocationsSection = useMemo(() => {
		const allPois = selectedCitySections.flatMap((section) => section.pois.map((poi) => ({
			...poi,
			category: poi.category || inferPoiCategory(poi.name, section.id),
			distance: location ? getDistanceMeters(location.lat, location.lng, poi.lat, poi.lng) : Number.POSITIVE_INFINITY,
		})));

		const dedupedById = Array.from(new Map(allPois.map((poi) => [poi.id, poi])).values());
		dedupedById.sort((a, b) => {
			const distanceDelta = (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY);
			if (distanceDelta !== 0) return distanceDelta;
			return String(a.name || '').localeCompare(String(b.name || ''));
		});

		const minDistance = dedupedById.length > 0
			? dedupedById.reduce((min, poi) => Math.min(min, poi.distance || Number.POSITIVE_INFINITY), Number.POSITIVE_INFINITY)
			: Number.POSITIVE_INFINITY;

		return {
			id: ALL_SECTION_ID,
			name: 'All',
			lat: selectedCitySections[0]?.lat || 0,
			lng: selectedCitySections[0]?.lng || 0,
			distance: minDistance,
			pois: dedupedById,
		};
	}, [selectedCitySections, location]);

	useEffect(() => {
		if (!selectedCitySections.length) return;
		setAddLocationData((prev) => {
			if (prev.sectionId && selectedCitySections.some((section) => section.id === prev.sectionId)) {
				return prev;
			}
			return { ...prev, sectionId: selectedCitySections[0].id };
		});
	}, [selectedCitySections]);

	useEffect(() => {
		if (!location || hasAutoPrefilledAddLocation) return;
		let cancelled = false;
		const lat = Number(location.lat).toFixed(6);
		const lng = Number(location.lng).toFixed(6);

		const prefill = async () => {
			let address = '';
			try {
				address = await reverseGeocode(lat, lng);
			} catch {}
			if (cancelled) return;
			setAddLocationData((prev) => {
				if (prev.name || prev.address || prev.lat || prev.lng) return prev;
				return {
					...prev,
					name: address || `${lat}, ${lng}`,
					address,
					lat,
					lng,
				};
			});
			setHasAutoPrefilledAddLocation(true);
		};

		prefill();
		return () => { cancelled = true; };
	}, [location, hasAutoPrefilledAddLocation]);

	const categoryLabelBySectionId = useMemo(() => ({
		[ALL_SECTION_ID]: 'All',
		'sf-sites': 'Sites',
		'sf-attractions': 'Attractions',
		'sf-museums': 'Museums',
		'sf-transport-depots': 'Transportation',
		'sf-car-rentals': 'Car Rentals',
		'sf-union-square-area': 'Union Square Area',
		'sf-chinatown': 'Chinatown',
		'sf-north-beach-little-italy': 'North Beach / Little Italy',
		'sf-golden-gate-park-area': 'Golden Gate Park Area',
		'sf-haight-ashbury-area': 'Haight-Ashbury Area',
		'sf-overlooked-locations': 'Overlooked SF Locations',
	}), []);

	const poiLookup = useMemo(() => {
		const map = new Map();
		selectedCitySections.forEach((section) => {
			section.pois.forEach((poi) => {
				map.set(normalizeText(poi.name), poi);
			});
		});
		return map;
	}, [selectedCitySections]);

	const selectedDayPlan = useMemo(() => {
		return DAY_PLANNER.find(day => day.id === selectedDayId) || DAY_PLANNER[0];
	}, [selectedDayId]);

	const resolveSchedulePoi = (itemName) => {
		const normalized = normalizeText(itemName);
		if (poiLookup.has(normalized)) return poiLookup.get(normalized);
		for (const [poiName, poi] of poiLookup.entries()) {
			if (normalized.includes(poiName) || poiName.includes(normalized)) return poi;
		}
		return null;
	};

	const toggleScheduleComplete = (key) => {
		setScheduleCompleted(prev => ({ ...prev, [key]: !prev[key] }));
	};

	const sortedSections = useMemo(() => {
		const sections = selectedCitySections.map((section, index) => {
			let distance = Number.POSITIVE_INFINITY;
			if (location) {
				distance = getDistanceMeters(location.lat, location.lng, section.lat, section.lng);
			}
			return {
				...section,
				distance,
				order: index,
				done: Boolean(completed[section.id]),
			};
		});

		const active = sections.filter(section => !section.done);
		const done = sections.filter(section => section.done);

		if (sortMode === 'distance') {
			active.sort((a, b) => a.distance - b.distance);
		} else {
			active.sort((a, b) => a.order - b.order);
		}

		const allSection = {
			...allLocationsSection,
			done: Boolean(completed[ALL_SECTION_ID]),
			order: -1,
		};

		return [allSection, ...active, ...done];
	}, [selectedCitySections, allLocationsSection, location, completed, sortMode]);

	const toggleComplete = (id) => {
		setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
	};

	const toggleSectionCollapsed = (sectionId) => {
		setCollapsedSections((prev) => ({
			...prev,
			[sectionId]: !prev[sectionId],
		}));
	};

	const autofillLocationFromCurrent = async () => {
		if (!location) {
			setAddLocationStatus('Current location is not available yet.');
			return;
		}

		const lat = Number(location.lat).toFixed(6);
		const lng = Number(location.lng).toFixed(6);
		let address = '';
		try {
			address = await reverseGeocode(lat, lng);
		} catch {}

		setAddLocationData((prev) => ({
			...prev,
			name: address || `${lat}, ${lng}`,
			address,
			lat,
			lng,
		}));
		setAddLocationStatus('Location prefilled from current position.');
	};

	const handleAddLocationSubmit = (event) => {
		event.preventDefault();
		const name = String(addLocationData.name || '').trim();
		const sectionId = String(addLocationData.sectionId || '').trim();
		const lat = Number(addLocationData.lat);
		const lng = Number(addLocationData.lng);

		if (!name || !sectionId || Number.isNaN(lat) || Number.isNaN(lng)) {
			setAddLocationStatus('Name, category, latitude, and longitude are required.');
			return;
		}

		const sectionExists = selectedCitySections.some((section) => section.id === sectionId);
		if (!sectionExists) {
			setAddLocationStatus('Please select a valid category.');
			return;
		}

		const createdId = `city-user-${Date.now()}`;
		setUserPois((prev) => ([
			...prev,
			{
				id: createdId,
				cityId: selectedCity.id,
				sectionId,
				name,
				address: String(addLocationData.address || '').trim(),
				lat,
				lng,
				category: inferPoiCategory(name, sectionId),
				source: 'user',
			},
		]));

		setAddLocationStatus(`Added ${name}.`);
		setAddLocationData((prev) => ({
			...prev,
			name: '',
			address: '',
			lat: location ? Number(location.lat).toFixed(6) : '',
			lng: location ? Number(location.lng).toFixed(6) : '',
		}));
	};

	const resetAll = () => {
		const next = { ...completed };
		delete next[ALL_SECTION_ID];
		selectedCitySections.forEach(section => {
			delete next[section.id];
			section.pois.forEach(poi => delete next[poi.id]);
		});
		setCompleted(next);
		setScheduleCompleted({});
		setScheduleOptionalEnabled({});
	};

	return (
		<div className='containerDetail color-lite mt--25 bg-lite'>
			<div className='containerDetail color-yellow size20 p-20 contentLeft bg-lite mb-5'>
				<span role='img' aria-label='city'>{icons.city || '🌆'}</span> City Explorer
			</div>

			<div className='containerDetail flexContainer bg-lite p-10 contentLeft'>
				<label className='p-10 flexColumn size20 color-yellow contentLeft mb-5' htmlFor='city-select'>City</label>
				<select
					id='city-select'
					className='containerDetail flex2Column p-10 bg-tintedMedium color-lite width-100-percent'
					value={selectedCityId}
					onChange={(e) => setSelectedCityId(e.target.value)}
					aria-label='Select city'
				>
					{CITY_DATA.map(city => (
						<option key={city.id} value={city.id}>{city.name}</option>
					))}
				</select>
			</div>

			<div className='containerDetail flexContainer bg-lite p-10 contentLeft mt-5'>
				<label className='p-10 size20 flexColumn color-yellow contentLeft mb-5' htmlFor='city-map-preference'>
					Map
				</label>
				<select
					id='city-map-preference'
					className='containerDetail flex2Column p-10 bg-tintedMedium color-lite width-100-percent'
					value={mapPreference}
					onChange={(e) => setMapPreference(e.target.value)}
					aria-label='Select maps app'
				>
					<option value={MAP_PREFERENCE_AUTO}>Auto</option>
					<option value={MAP_PREFERENCE_APPLE}>Apple Maps</option>
					<option value={MAP_PREFERENCE_GOOGLE}>Google Maps</option>
				</select>
			</div>

			<div className='containerDetail color-lite contentLeft bg-lite mt-5 flexContainer'>
				<div
					onClick={() => setSortMode('distance')}
					className={`containerDetail flex3Column p-10 color-yellow button ${sortMode === 'distance' ? 'bg-green' : 'bg-lite'}`}
					role='button'
					tabIndex={0}
					onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSortMode('distance'); }}
					aria-label='Sort categories by distance'
				>
					Sort by Distance
				</div>
				<div
					onClick={() => setSortMode('default')}
					className={`containerDetail ml-5 p-10 flex3Column color-yellow button ${sortMode === 'default' ? 'bg-green' : 'bg-lite'}`}
					role='button'
					tabIndex={0}
					onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSortMode('default'); }}
					aria-label='Sort categories by default order'
				>
					Default Order
				</div>
			</div>

			<div className='containerDetail bg-lite p-10 contentLeft mt-10 size20'>
				<div
					className='containerDetail pt-20 pb-20 pl-10 button color-yellow bg-lite width-100-percent'
					onClick={() => setIsAddLocationCollapsed((prev) => !prev)}
					aria-expanded={!isAddLocationCollapsed}
					aria-controls='city-add-location-form'
					aria-label={`${isAddLocationCollapsed ? 'Expand' : 'Collapse'} add location form`}
				>
					<span className='text-outline-yellow mr-5'>➕</span>Location
				</div>

				<form
					id='city-add-location-form'
					className='containerDetail bg-lite p-10 contentLeft mt-10'
					onSubmit={handleAddLocationSubmit}
					aria-label='Add a custom city location'
					hidden={isAddLocationCollapsed}
				>
				<div className='mt-10'>
					<label className='size20 color-yellow contentLeft mt-10' htmlFor='city-add-category'>
						Category
					</label>
				</div>
				<select
					id='city-add-category'
					className='containerDetail p-10 bg-tintedMedium color-lite width-100-percent ml--2 mt-5'
					value={addLocationData.sectionId}
					onChange={(e) => setAddLocationData((prev) => ({ ...prev, sectionId: e.target.value }))}
					aria-label='Choose a category for this location'
				>
					{selectedCitySections.map((section) => (
						<option key={section.id} value={section.id}>{categoryLabelBySectionId[section.id] || section.name}</option>
					))}
				</select>
				<div className='mt-10'>
					<label className='color-yellow size20 contentLeft' htmlFor='city-add-name'>
						Location Name
					</label>
				</div>
				<input
					id='city-add-name'
					type='text'
					className='containerDetail p-10 bg-tintedMedium color-lite width-100-percent mt-5'
					value={addLocationData.name}
					onChange={(e) => setAddLocationData((prev) => ({ ...prev, name: e.target.value }))}
					placeholder='Location name'
					required
				/>
				<div className='mt-10'>
					<label className='size20 color-yellow size20 contentLeft mt-10' htmlFor='city-add-address'>
						Address
					</label>
				</div>
				<input
					id='city-add-address'
					type='text'
					className='containerDetail p-10 bg-tintedMedium color-lite width-100-percent mt-5'
					value={addLocationData.address}
					onChange={(e) => setAddLocationData((prev) => ({ ...prev, address: e.target.value }))}
					placeholder='Address'
				/>
				<div className='flexContainer mt-10'>
					<div className='flex2Column'>
						<label className='size20 color-yellow contentLeft mt-10' htmlFor='city-add-coordinates'>
							Coordinates
						</label>
					</div>
					<label className='flex2Column size20 contentLeft mt-5 color-lite button'>
						<input
							type='checkbox'
							checked={addLocationCoordMode === 'combined'}
							onChange={() => setAddLocationCoordMode((prev) => prev === 'combined' ? 'separate' : 'combined')}
							aria-label='Toggle between one coordinate field and separate latitude and longitude fields'
						/>
						<span className='ml-10'>
							{addLocationCoordMode === 'combined' ? 'Single field (lat,lng)' : 'Separate latitude and longitude fields'}
						</span>
					</label>
				</div>
				{addLocationCoordMode === 'combined' ? (
					<input
						type='text'
						className='containerDetail p-10 bg-tintedMedium color-lite width-100-percent mt-5'
						value={addLocationData.lat && addLocationData.lng ? `${addLocationData.lat},${addLocationData.lng}` : ''}
						onChange={(e) => {
							const [latValue = '', lngValue = ''] = String(e.target.value || '').split(',').map((part) => part.trim());
							setAddLocationData((prev) => ({ ...prev, lat: latValue, lng: lngValue }));
						}}
						placeholder='Latitude,Longitude'
						required
					/>
				) : (
					<div className='flexContainer mt-5'>
						<input
							type='number'
							step='0.000001'
							className='containerDetail p-10 bg-tintedMedium color-lite flex2Column'
							value={addLocationData.lat}
							onChange={(e) => setAddLocationData((prev) => ({ ...prev, lat: e.target.value }))}
							placeholder='Latitude'
							required
						/>
						<input
							type='number'
							step='0.000001'
							className='containerDetail p-10 bg-tintedMedium color-lite flex2Column ml-5'
							value={addLocationData.lng}
							onChange={(e) => setAddLocationData((prev) => ({ ...prev, lng: e.target.value }))}
							placeholder='Longitude'
							required
						/>
					</div>
				)}

				<div className='flexContainer mt-10'>
					<button
						type='button'
						className='containerDetail button p-10 bg-blue color-yellow flex2Column mr-5'
						onClick={autofillLocationFromCurrent}
						aria-label='Prefill name, address, latitude, and longitude from current location'
					>
						Use Current Location
					</button>
					<button
						type='submit'
						className='containerDetail button p-10 bg-green color-yellow flex2Column'
						aria-label='Add custom location'
					>
						<span className='text-outline-yellow'>➕</span> Location
					</button>
				</div>
				{addLocationStatus ? <div className='containerDetail color-orange contentLeft mt-5'>{addLocationStatus}</div> : null}
				</form>
			</div>

			<div className='containerDetail bg-lite mt-10 p-10 contentLeft'>
				<div className='flexContainer'>
					<div className='p-10 color-yellow size20 contentLeft flex2Column'>
						Day Planner
					</div>
					<div
						className='size30 button p-10 color-yellow contentRight'
						onClick={() => setIsDayPlannerCollapsed((prev) => !prev)}
						aria-expanded={!isDayPlannerCollapsed}
						aria-controls='city-day-planner-content'
						aria-label={`${isDayPlannerCollapsed ? 'Expand' : 'Collapse'} day planner`}
					>
						{isDayPlannerCollapsed ? '🔽' : '🔼'}
					</div>
				</div>
				<div id='city-day-planner-content' hidden={isDayPlannerCollapsed}>
					<div className='containerDetail mt-5 height-200'>
						{DAY_PLANNER.map(day => (
							<button
								key={day.id}
								type='button'
								className={`containerDetail button p-10 m-5 width--5 size20 contentLeft ${selectedDayId === day.id ? 'bg-green color-yellow' : 'bg-lite color-lite'}`}
								onClick={() => setSelectedDayId(day.id)}
								aria-label={`Open ${day.title}`}
							>
								{day.title.replace(' - ', ': ')}
							</button>
						))}
					</div>

				<div className='containerDetail bg-tinted mt-10 p-10 contentLeft'>
					<div className='color-yellow size20 contentLeft'>{selectedDayPlan.title}</div>
					{selectedDayPlan.note ? <div className='color-orange mt-5 contentLeft'>{selectedDayPlan.note}</div> : null}

					{selectedDayPlan.blocks.map((block, blockIndex) => (
						<div key={`${selectedDayPlan.id}-${block.period}`} className='containerDetail mt-10 contentLeft'>
							<div className='color-yellow contentLeft'>{block.period}</div>
							{block.items.map((item, itemIndex) => {
								const scheduleKey = `${selectedDayPlan.id}:block:${blockIndex}:${itemIndex}`;
								const poi = resolveSchedulePoi(item);
								const poiCategory = poi?.category || inferPoiCategory(item, '');
								return (
									<div key={scheduleKey} className='containerDetail flexContainer mt-5 contentLeft' style={getCategoryItemStyle(poiCategory)}>
										<label className='flex2Column button pl-10'>
											<input
												type='checkbox'
												checked={Boolean(scheduleCompleted[scheduleKey])}
												onChange={() => toggleScheduleComplete(scheduleKey)}
												aria-label={`Mark ${item} complete`}
											/>
											<span className='ml-10 color-lite' style={{ textDecoration: scheduleCompleted[scheduleKey] ? 'line-through' : 'none' }}>
												{item}
												<span className='color-orange ml-5'>{poiCategory}</span>
											</span>
										</label>
										{poi ? (
											<div className='flexColumn contentRight ml-5'>
												<button
													type='button'
													className='containerDetail p-10 color-yellow button'
													onClick={() => openPoiInMaps({ lat: poi.lat, lng: poi.lng }, mapPreference)}
													title='Open in Maps'
													aria-label={`Open ${item} in maps`}
												>
													{CATEGORY_ICON_BY_TYPE[poiCategory] || CATEGORY_ICON_BY_TYPE.poi}
												</button>
                                                <div>
                                                    {location ? (
                                                        <span className='color-yellow mt-2'>
															{formatMilesDisplay(metersToMiles(getDistanceMeters(location.lat, location.lng, poi.lat, poi.lng)))}
                                                            <span className='copyright'> miles</span>
                                                        </span>
                                                    ) : null}
                                                </div>
											</div>
										) : null}
									</div>
								);
							})}
						</div>
					))}

					{selectedDayPlan.optionalPlan ? (
						<div className='containerDetail mt-15 p-10 bg-dark contentLeft'>
							<label className='pl-10 button color-yellow'>
								<input
									type='checkbox'
									checked={Boolean(scheduleOptionalEnabled[selectedDayPlan.id])}
									onChange={() => setScheduleOptionalEnabled(prev => ({ ...prev, [selectedDayPlan.id]: !prev[selectedDayPlan.id] }))}
									aria-label={`Enable optional plan for ${selectedDayPlan.title}`}
								/>
								<span className='ml-10'>{selectedDayPlan.optionalPlan.title}</span>
							</label>
							<div className='color-orange mt-5 contentLeft pl-10'>{selectedDayPlan.optionalPlan.description}</div>
							{scheduleOptionalEnabled[selectedDayPlan.id] ? (
								<div className='mt-10'>
									{selectedDayPlan.optionalPlan.items.map((item, itemIndex) => {
										const scheduleKey = `${selectedDayPlan.id}:optional:${itemIndex}`;
										const poi = resolveSchedulePoi(item);
										const poiCategory = poi?.category || inferPoiCategory(item, '');
										return (
											<div key={scheduleKey} className='containerDetail flexContainer mt-5 contentLeft' style={getCategoryItemStyle(poiCategory)}>
												<label className='flex2Column button'>
													<input
														type='checkbox'
														checked={Boolean(scheduleCompleted[scheduleKey])}
														onChange={() => toggleScheduleComplete(scheduleKey)}
														aria-label={`Mark optional stop ${item} complete`}
													/>
													<span className='ml-10 color-lite' style={{ textDecoration: scheduleCompleted[scheduleKey] ? 'line-through' : 'none' }}>
														{item}
														<span className='color-orange ml-5'>{poiCategory}</span>
													</span>
												</label>
												{poi ? (
													<div className='flexColumn contentRight ml-5'>
														<button
															type='button'
															className='containerDetail p-10 color-yellow button'
															onClick={() => openPoiInMaps({ lat: poi.lat, lng: poi.lng }, mapPreference)}
															title='Open in Maps'
															aria-label={`Open optional stop ${item} in maps`}
														>
															{CATEGORY_ICON_BY_TYPE[poiCategory] || CATEGORY_ICON_BY_TYPE.poi}
														</button>
														{location ? (
															<span className='color-yellow mt-2'>
																{formatMilesDisplay(metersToMiles(getDistanceMeters(location.lat, location.lng, poi.lat, poi.lng)))}
																<span className='copyright'> miles</span>
															</span>
														) : null}
													</div>
												) : null}
											</div>
										);
									})}
								</div>
							) : null}
						</div>
					) : null}
				</div>
				</div>
			</div>

			{error ? <div className='containerDetail color-orange p-10'>{error}</div> : null}
			{!location ? <div className='containerDetail color-yellow p-10'>Getting location…</div> : null}

			<div
				className='containerDetail button bg-green color-yellow width-100-percent mt-5 size20 p-20'
				onClick={resetAll}
				aria-label='Reset all City checklist checkboxes'
			>
				☑️ Reset All
			</div>

			<ul className='containerDetail height--400'>
				{sortedSections.map((section) => (
					<li key={section.id} className='containerDetail bg-lite mb-5' style={{ listStyle: 'none' }}>
						<div className='containerDetail flexContainer p-20 m-5'>
							<label className='flex2Column flexContainer contentLeft'>
								<input
									type='checkbox'
									checked={Boolean(completed[section.id])}
									onChange={() => toggleComplete(section.id)}
									aria-label={`Mark ${section.name} complete`}
								/>
								<span
									className='color-yellow ml-10'
									style={{ textDecoration: completed[section.id] ? 'line-through' : 'none', fontSize: '18px' }}
								>
									{section.name}
								</span>
							</label>
							{location && !completed[section.id] ? (
								<span className='flexColumn mr-5 mt-10 color-yellow'>
									{formatMilesDisplay(metersToMiles(section.distance))}<span className='copyright'>miles</span>
								</span>
							) : null}
							<div
								className='button pt-10 pb-10 ml-5 size30'
								onClick={() => toggleSectionCollapsed(section.id)}
								aria-expanded={!collapsedSections[section.id]}
								aria-controls={`city-section-${section.id}`}
								aria-label={`${collapsedSections[section.id] ? 'Expand' : 'Collapse'} ${section.name}`}
							>
								{collapsedSections[section.id] ? '🔽' : '🔼'}
							</div>
						</div>

						<ul
							id={`city-section-${section.id}`}
							className='containerDetail mt-5 bg-lite'
							hidden={Boolean(collapsedSections[section.id])}
						>
							{section.pois.map((poi) => {
								const poiCategory = poi.category || inferPoiCategory(poi.name, section.id);
								return (
									<li key={poi.id} className='containerDetail contentLeft p-10 mb-5' style={{ listStyle: 'none', ...getCategoryItemStyle(poiCategory) }}>
										<div className='flexContainer'>
											<label className='flex2Column button pl-10 pt-20'>
												<input
													type='checkbox'
													checked={Boolean(completed[poi.id])}
													onChange={() => toggleComplete(poi.id)}
													aria-label={`Mark ${poi.name} complete`}
												/>
												<span
													style={{ textDecoration: completed[poi.id] ? 'line-through' : 'none', fontSize: '14px' }}
													className='color-lite ml-10'
												>
													{poi.name}
													<span className='color-orange ml-5'>{poiCategory}</span>
												</span>
											</label>
											<div className='flexColumn ml-5'>
												<div
													className='containerDetail p-10 color-yellow button contentCenter'
													title='Open in Maps'
													onClick={() => openPoiInMaps({ lat: poi.lat, lng: poi.lng }, mapPreference)}
													aria-label={`Open ${poi.name} in maps`}
												>
													{CATEGORY_ICON_BY_TYPE[poiCategory] || CATEGORY_ICON_BY_TYPE.poi}
													<div>
														{location && !completed[poi.id] ? (
															<div className='color-yellow mt-2 contentRight'>
																{formatMilesDisplay(metersToMiles(getDistanceMeters(location.lat, location.lng, poi.lat, poi.lng)))}
																<span className='copyright'> miles</span>
															</div>
														) : null}
													</div>
												</div>
												
											</div>
										</div>
									</li>
								);
							})}
						</ul>
					</li>
				))}
			</ul>
		</div>
	);
}
