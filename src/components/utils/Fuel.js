import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import getKey from './KeyGenerator.js';
import Geolocator from '../location/Geolocator.js';
import useLocationData from '../waves/useLocationData.js';
import { currentDate } from './CurrentCalendar.js';
import CollapseToggleButton from './CollapseToggleButton.js';
import validate from './validate.js';
import initializeData from './InitializeData.js';


const Fuel = () => {

    const {
        snapshot,
        requestLocation
    } = useLocationData({ autoRequest: false });

    const lastOdometer = () => Number(initializeData('odometer', 0));
    const lastOilChange = () => Number(initializeData('oilChange', 0));
    const lastLocation = () => initializeData('location', 'Home');
    const lastGallons = () => Number(initializeData('gallons', 0));
    const lastUSDPerGallon = () => Number(initializeData('usdPerGallon', 0));
    const [totalUSD, setTotalUSD] = useState(0);
    const [location, setLocation] = useState(lastLocation());
    const [odometer, setOdometer] = useState(lastOdometer());
    const [oilChange, setOilChange] = useState(lastOilChange());
    const [exchangeRate, setExchangeRate] = useState(0);
    const [pricePerLiter, setPricePerLiter] = useState(0);
    const [pricePerGallon, setPricePerGallon] = useState(lastUSDPerGallon());
    const [gallonsPurchased, setGallonsPurchased] = useState(lastGallons());
    const [litersPurchased, setLitersPurchased] = useState(0);
    const [trips, setTrips] = useState(initializeData('TripFuelTracker', []));
    const [currency, setCurrency] = useState('USD');
    const [longitude, setLongitude] = useState(initializeData('longitude', []));
    const [latitude, setLatitude] = useState(initializeData('latitude', []));
    const [distance, setDistance] = useState(initializeData('distance', []));
    const [guageStart, setGuageStart] = useState('');
    const [guageEnd, setGuageEnd] = useState('');
    const [formCollapse, setFormCollapse] = useState(true);
    const [logCollapse, setLogCollapse] = useState(true);
    const [oilCollapse] = useState(true);
    const [graphCollapse, setGraphCollapse] = useState(true);
    const [chartFilterMode, setChartFilterMode] = useState('all'); // 'all', 'today', 'month', 'year', 'range', 'day'
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterSpecificDay, setFilterSpecificDay] = useState('');
    const [pricePerGallonCollapse, setPricePerGallonCollapse] = useState(true);
    const [milesTraveledCollapse, setMilesTraveledCollapse] = useState(true);
    const [milesBetweenFuelingCollapse, setMilesBetweenFuelingCollapse] = useState(true);
    const [costPerStopCollapse, setCostPerStopCollapse] = useState(true);
    const [mfgEfficiencyCollapse, setMfgEfficiencyCollapse] = useState(true);
    const [pricesCollapse, setPricesCollapse] = useState(true);
    const [pricesSortMode, setPricesSortMode] = useState('price'); // 'price' or 'distance'
    const [locationsCollapse, setLocationsCollapse] = useState(true);
    const [locationsSortMode, setLocationsSortMode] = useState('distance'); // 'location' or 'distance'
    const [category, setCategory] = useState('');
    const [costFee, setCostFee] = useState(0);
    const [rating, setRating] = useState(0);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [categoryDialogIndex, setCategoryDialogIndex] = useState(null);
    const [categoryDialogNewName, setCategoryDialogNewName] = useState('');
    const [categoryDialogNewIcon, setCategoryDialogNewIcon] = useState('🏷️');
    const [locationCategories, setCategories] = useState({});
    const [locationsCategorySort, setLocationsCategorySort] = useState();
    const [editLocationDialog, setEditLocationDialog] = useState(false);
    const [editLocationIndex, setEditLocationIndex] = useState(null);
    const [interiorCollapse] = useState(true);
    const [interior, setInterior] = useState();
    const [washCollapse] = useState(true);
    const [wash, setWash] = useState();
    const [maintenanceCollapse] = useState(true);
    const [maintenance, setMaintenance] = useState();
    const [rotateCollapse] = useState(true);
    const [rotate, setRotate] = useState();
    const [tiresCollapse] = useState(true);
    const [tires, setTires] = useState();
    const [otherCollapse] = useState(true);
    const [other, setOther] = useState();
    const [serviceCollapse, setServiceCollapse] = useState(true);
    // Dynamic service configuration and state
    const [serviceDefs, setServiceDefs] = useState(); // [{ key, label, interval }]
    const [serviceState, setServiceState] = useState({}); // { [key]: { collapse: boolean, value: number|null } }

    // Default service definitions (no direct React state/functions embedded)
    const defaultServiceDefs = [
        { key: 'oil-change', label: '🛢️ Oil Change', interval: 10000 },
        { key: 'interior', label: '🧽 Interior', interval: 1000 },
        { key: 'wash', label: '🚗 Wash', interval: 2000 },
        { key: 'maintenance', label: '🔧 Maintenance', interval: 2000 },
        { key: 'rotate', label: '🛞 Rotate Tires', interval: 5000 },
        { key: 'new-tires', label: '🛞 New Tires', interval: 80000 },
        { key: 'other', label: '⚙️ Other', interval: 5000 },
    ];

    // Build a derived array compatible with existing UI: [label, collapse, setCollapse, value, setValue, interval]
    const computedServices = useMemo(() => {
        if (!serviceDefs || !Array.isArray(serviceDefs)) return [];
        return serviceDefs.map(def => {
            const st = serviceState[def.key] || { collapse: true, value: null };
            const setCollapse = (updater) => setServiceState(prev => {
                const current = (prev[def.key] && typeof prev[def.key].collapse !== 'undefined')
                    ? prev[def.key].collapse
                    : st.collapse;
                const next = (typeof updater === 'function') ? updater(current) : updater;
                return {
                    ...prev,
                    [def.key]: { ...(prev[def.key] || {}), collapse: next }
                };
            });
            const setValue = (updater) => setServiceState(prev => {
                const current = (prev[def.key] && typeof prev[def.key].value !== 'undefined')
                    ? prev[def.key].value
                    : st.value;
                const next = (typeof updater === 'function') ? updater(current) : updater;
                const newValue = {
                    ...prev,
                    [def.key]: { ...(prev[def.key] || {}), value: next }
                }
                //console.log(`Fuel => setValue newValue: ${JSON.stringify(newValue, null, 2)}`);
                return newValue;
            });
            return [def.label, st.collapse, setCollapse, st.value, setValue, def.interval];
        });
    }, [serviceDefs, serviceState]);

    const currencyCode = [
        'USD',
        'MXN',
        'DOP',
        'NIO',
        'CRC',
        'IDR',
        'AUD',
    ];

    const currencies = {
        USD: 'Dollar',
        MXN: `MXN Pesos`,   // Mexican Peso
        DOP: `DOP Pesos`,   // Dominican Peso
        NIO: `Córdoba`,   // Nicaraguan Cordovas
        CRC: `Colones`,    // Costa Rican Colones
        IDR: `Rupiah`,  // Indonesian Rupiah
        AUD: `AUD`,    // Australian Dollar
    };

    const fuelGuageReadings = [
        '110',
        '105',
        '100',
        '95',
        '90',
        '85',
        '80',
        '75',
        '70',
        '65',
        '60',
        '55',
        '50',
        '45',
        '40',
        '35',
        '30',
        '25',
        '20',
        '15',
        '10',
        '5',
        '0',
        '-5',
        '-10'
    ];
    const defaultCategories = {
        'Start': '🟢',
        'End': '🔴',
        'Shopping': '🛒',
        'Beach': '🏖️',
        'Hike': '🥾',
        'Bike': '🚴‍♂️',
        'Surf': '🏄‍♂️',
        'Snorkel': '🤿',
        'Fishing': '🎣',
        'Entertainment': '🎭',
        'Work': '💼',
        'Medical': '🏥',
        'Water': '💧',
        'Dining': '🍽️',
        'Bar': '🍸',
        'Billiards': '🎱',
        'Gas': '⛽',
        'Maintenance': '🛠️',
        'Service': '🔧',
        'Site': '👀',
        'POI': '📍',
        'Camp': '⛺️',
        'Parking': '🅿️',
        'Toll': '🚧',
    };
    useEffect(() => {
        //console.log(`Fuel => trips: ${JSON.stringify(trips, null, 2)}`);
        localStorage.setItem('TripFuelTracker', JSON.stringify(trips));
        setDistance(initializeData('distance', null));
    }, [trips]);
    useEffect(() => {
        if (tires !== null && tires !== undefined) {
            localStorage.setItem('tires', tires);
        }
    }, [tires]);
    // Persist dynamic services configuration/state
    useEffect(() => {
        if (serviceDefs && Array.isArray(serviceDefs)) {
            localStorage.setItem('serviceDefs', JSON.stringify(serviceDefs));
        }
        if (serviceState && typeof serviceState === 'object' && Object.keys(serviceState).length > 0) {
            localStorage.setItem('serviceState', JSON.stringify(serviceState));
        }
    }, [serviceDefs, serviceState]);
    useEffect(() => {
        if (interior !== null && interior !== undefined) {
            localStorage.setItem('interior', interior);
        }
    }, [interior]);
    
    useEffect(() => {
        if (wash !== null && wash !== undefined) {
            localStorage.setItem('wash', wash);
        }
    }, [wash]);
    useEffect(() => {
        if (maintenance !== null && maintenance !== undefined) {
            localStorage.setItem('maintenance', maintenance);
        }
    }, [maintenance]);
    useEffect(() => {
        if (rotate !== null && rotate !== undefined) {
            localStorage.setItem('rotate', rotate);
        }
    }, [rotate]);
    useEffect(() => {
        if (other !== null && other !== undefined) {
            localStorage.setItem('other', other);
        }
    }, [other]);
    useEffect(() => {
        localStorage.setItem('latitude', latitude);
    }, [latitude]);
    useEffect(() => {
        localStorage.setItem('longitude', longitude);
    }, [longitude]);
    useEffect(() => {
        localStorage.setItem('distance', distance);
    }, [distance]);
    useEffect(() => {
        if (oilChange !== null && oilChange !== undefined) {
            localStorage.setItem('oilChange', oilChange);
        }
    }, [oilChange]);
    useEffect(() => {
        // Safely read trips from localStorage (guard against 'undefined' or invalid JSON)
        let newTripsRaw = localStorage.getItem('TripFuelTracker');
        let newTrips = [];
        if (
            typeof newTripsRaw === 'string' &&
            newTripsRaw.length > 0 &&
            newTripsRaw !== 'undefined' &&
            newTripsRaw !== 'null'
        ) {
            // Remove surrounding quotes if present
            if (newTripsRaw[0] === '"' && newTripsRaw[newTripsRaw.length - 1] === '"') {
                newTripsRaw = newTripsRaw.substring(1, newTripsRaw.length - 1);
            }
            try {
                newTrips = JSON.parse(newTripsRaw);
            } catch {
                newTrips = [];
            }
        }
        setTrips(Array.isArray(newTrips) ? newTrips : []);
        //console.log(`Fuel => newTrips: ${JSON.stringify(newTrips, null, 2)}`);
        // ...use newTrips as needed...
        // Safely read categories from localStorage
        let storedCategoriesRaw = localStorage.getItem('locationCategories');
        let parsedCategories = defaultCategories;
        if (
            storedCategoriesRaw &&
            storedCategoriesRaw !== 'undefined' &&
            storedCategoriesRaw !== 'null'
        ) {
            try {
                parsedCategories = JSON.parse(storedCategoriesRaw);
            } catch {
                parsedCategories = defaultCategories;
            }
        }
        setCategories(parsedCategories);
        setTires(initializeData('tires', ''));
        setInterior(initializeData('interior', ''));
        setWash(initializeData('wash', ''));
        setMaintenance(initializeData('maintenance', ''));
        setRotate(initializeData('rotate', ''));
        setOther(initializeData('other', ''));
        setOilChange(initializeData('oilChange', 0));
        // Initialize dynamic services
        const defsFromStorage = initializeData('serviceDefs', defaultServiceDefs);
        //console.log(`Fuel => defsFromStorage: ${JSON.stringify(defsFromStorage, null, 2)}`);
        setServiceDefs(defsFromStorage);
        // Build initial state, prefer stored; else map from existing specific states
        try {
            const storedStateRaw = localStorage.getItem('serviceState');
            const storedState = storedStateRaw ? JSON.parse(storedStateRaw) : null;
            if (storedState && typeof storedState === 'object') {
                //console.log(`Fuel => storedState: ${JSON.stringify(storedState, null, 2)}`);
                setServiceState(storedState);
            } else {
                const seeded = {
                    'oil-change': { collapse: oilCollapse, value: initializeData('oilChange', 0) },
                    'interior': { collapse: interiorCollapse, value: initializeData('interior', '') },
                    'wash': { collapse: washCollapse, value: initializeData('wash', '') },
                    'maintenance': { collapse: maintenanceCollapse, value: initializeData('maintenance', '') },
                    'rotate': { collapse: rotateCollapse, value: initializeData('rotate', '') },
                    'new-tires': { collapse: tiresCollapse, value: initializeData('tires', '') },
                    'other': { collapse: otherCollapse, value: initializeData('other', '') },
                };
                setServiceState(seeded);
            }
        } catch (e) {
            setServiceState({});
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    // Monitor location data changes and update location state
    useEffect(() => {
        if (snapshot && snapshot.country && snapshot.country.toLowerCase() !== 'united states') {
            const locationParts = [
                snapshot.road,
                snapshot.city,
                snapshot.county,
                snapshot.state,
                snapshot.zipCode,
                snapshot.country
            ].filter(part => part && part !== 'No zip code found for your location.');
            
            const locationStr = locationParts.join(', ');
            if (locationStr) {
                setLocation(locationStr);
            }
        }
        if (snapshot && snapshot.data && snapshot.data.display_name) {
            //console.log(`Fuel => snapshot: ${JSON.stringify(snapshot, null, 2)}`);
            const newLocation = `${snapshot.data.address.road || ''}, ${snapshot.data.address.suburb || null}${(snapshot.data.address.suburb) ? ',' : ''} ${snapshot.data.address.city || snapshot.data.address.town || snapshot.data.address.village || snapshot.data.address.county || ''}, ${snapshot.data.address.state}`;
            setLocation(newLocation || 'Home');
        }
    }, [snapshot]);
    
    useEffect(() => {
        localStorage.setItem('locationCategories', JSON.stringify(locationCategories));
    }, [locationCategories]);

    useEffect(() => {
        if (editLocationDialog && editLocationIndex !== null && trips[editLocationIndex]) {
            const trip = trips[editLocationIndex];
            setLocation(trip.location || '');
            setOdometer(trip.odometer || '');
            setGuageStart(trip.guageStart || '');
            setGuageEnd(trip.guageEnd || '');
            setLongitude(trip.longitude || '');
            setLatitude(trip.latitude || '');
            setPricePerGallon(trip.usdPerGallon || '');
            setGallonsPurchased(trip.gallons || '');
            setCategory(trip.category || '');
            setCostFee(trip.costFee || 0);
            setRating(trip.rating || 0);
            setTotalUSD(trip.totalUSD || 0);
        }
    }, [editLocationDialog, editLocationIndex, trips]);
    /*
    const clearRecord = () => {
        setTrips([]);
    }
    */
    const recalculateDistances = (tripData) => {
        for (let i = 1; i < tripData.length; i++) {
            const currentDate = new Date(tripData[i].time);
            const previousDate = new Date(tripData[i - 1].time);
            if (currentDate.toDateString() === previousDate.toDateString()) {
                tripData[i].distance = tripData[i].odometer - tripData[i - 1].odometer;
            } else {
                tripData[i].distance = 0;
            }
        }
        return tripData;
    }
    const deleteLocation = (index) => {
        const newTrips = [...trips];
        const deleteConfirmed = window.confirm(`Do you want to delete ${newTrips[index].location}?`);

        if (deleteConfirmed && index >= 0 && index < newTrips.length) {
            newTrips.splice(index, 1);
        } else {
            console.log('Invalid index to remove');
        }
        const tripsUpdate = recalculateDistances(newTrips);
        setTrips(tripsUpdate);
    }
    const editOdometer = (index, odometer) => {
        const newTrips = [...trips];
        newTrips[index].odometer = prompt('Edit odometer:', odometer) || odometer;
        /*
        newTrips[index].distance = newTrips[index].odometer - newTrips[index - 1].odometer;
        if (newTrips[index + 1].distance) {
            newTrips[index + 1].distance = newTrips[index + 1].odometer - newTrips[index].odometer;
        }
        setTrips(newTrips);
        */
        const tripsUpdate = recalculateDistances(newTrips);
        setTrips(tripsUpdate);
    }
    const editGuageStart = (index, guageStart) => {
        const newTrips = [...trips];
        newTrips[index].guageStart = prompt('Edit guage start:', guageStart) || guageStart;
        setTrips(newTrips);
    }
    const editGuageEnd = (index, guageEnd) => {
        const newTrips = [...trips];
        newTrips[index].guageEnd = prompt('Edit guage end:', guageEnd) || guageEnd;
        setTrips(newTrips);
    }
    const editDistance = (index, distance) => {
        const newTrips = [...trips];
        newTrips[index].distance = prompt('Edit distance:', distance) || distance;
        setTrips(newTrips);
    }
    const editGallons = (index, gallons) => {
        const newTrips = [...trips];
        newTrips[index].gallons = prompt('Edit gallons:', gallons) || gallons;
        const newTotalUSD = newTrips[index].usdPerGallon * newTrips[index].gallons;
        newTrips[index].totalUSD = newTotalUSD.toFixed(2);
        setTrips(newTrips);
    }
    const editTripCategory = (index, category) => {
        //console.log(`editTripCategory => `);
        setCategoryDialogIndex(index);
        setCategoryDialogNewName('');
        setCategoryDialogNewIcon('🏷️');
        setCategoryDialogOpen(true);
    };
    const handleCategorySelect = (selectedCategory) => {
        if (selectedCategory === '__add__') {
            setCategoryDialogIndex(null);
            setCategoryDialogNewName('');
            setCategoryDialogNewIcon('🏷️');
            setCategoryDialogOpen(true);
            return;
        }
        if (categoryDialogIndex !== null) {
            const newTrips = [...trips];
            newTrips[categoryDialogIndex].category = selectedCategory;
            setTrips(newTrips);
            setCategoryDialogOpen(false);
            setCategoryDialogIndex(null);
            return;
        }
        setCategory(selectedCategory);
    };

    const handleAddNewCategory = () => {
        if (categoryDialogNewName.trim()) {
            const newCatName = categoryDialogNewName.trim();
            const newIcon = categoryDialogNewIcon.trim() || '🏷️';
            alert(`handleAddNewCategory => newCatName: ${newCatName}, newIcon: ${newIcon}`);
            const newCategories = { ...locationCategories };
            if (!newCategories[newCatName]) {
                newCategories[newCatName] = newIcon;
                setCategories(newCategories);
                handleCategorySelect(newCatName);
                setCategoryDialogNewName('');
                setCategoryDialogNewIcon('🏷️');
            } else {
                window.alert('Category already exists');
            }
        }
    };

    const addService = () => {
        const rawName = prompt('Enter service name (with emoji):', '🧰 Custom Service');
        if (!rawName) return;
        const serviceInterval = prompt('Enter service interval in miles:', '1000');
        const intervalMiles = parseInt(serviceInterval, 10);
        if (isNaN(intervalMiles) || intervalMiles <= 0) {
            window.alert('Invalid interval miles');
            return;
        }
        const key = rawName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setServiceDefs(prev => (Array.isArray(prev) ? [...prev, { key, label: rawName, interval: intervalMiles }] : [{ key, label: rawName, interval: intervalMiles }]));
        // Initialize this service's state: collapsed by default, last value at current odometer
        setServiceState(prev => ({
            ...prev,
            [key]: { collapse: true, value: Number(odometer) || 0 }
        }));
    };

    const removeService = (idx) => {
        if (!serviceDefs || !serviceDefs[idx]) return;
        const def = serviceDefs[idx];
        const confirmed = window.confirm(`Remove service "${def.label}"?`);
        if (!confirmed) return;
        setServiceDefs(prev => (Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : prev));
        if (def && def.key) {
            setServiceState(prev => {
                const next = { ...prev };
                delete next[def.key];
                return next;
            });
        }
    };

    const renderCategoryDialog = () => {

        if (!categoryDialogOpen) return null;
        const categoryOptions = Object.keys(locationCategories);

        return (
            <div className='modal-overlay' style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div className='containerDetail p-20 maxHeight75percent bg-dark'>
                    <div className='containerDetail p-20 contentLeft color-yellow bg-lite width--5'>Select a Category</div>

                    <div className='containerDetail p-20 contentLeft color-yellow mt-5 srcoll'>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '10px',
                            marginBottom: '20px'
                        }}>
                            {categoryOptions.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    className='containerDetail p-10 contentCenter button bg-lite'
                                >
                                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                                        {locationCategories[cat]}
                                    </div>
                                    <div style={{ fontSize: '12px' }}>{cat}</div>
                                </button>
                            ))}
                        </div>

                        <div style={{
                            borderTop: '1px solid #ddd',
                            paddingTop: '15px',
                            marginTop: '15px'
                        }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>
                                <strong>Add New Category:</strong>
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    type='text'
                                    placeholder='Icon (emoji)'
                                    value={categoryDialogNewIcon}
                                    onChange={(e) => setCategoryDialogNewIcon(e.target.value)}
                                    style={{
                                        width: '60px',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '20px',
                                        textAlign: 'center'
                                    }}
                                    maxLength={2}
                                />
                                <input
                                    type='text'
                                    placeholder='Category name'
                                    value={categoryDialogNewName}
                                    onChange={(e) => setCategoryDialogNewName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddNewCategory();
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                                <button
                                    onClick={handleAddNewCategory}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4caf50'}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setCategoryDialogOpen(false);
                            setCategoryDialogIndex(null);
                            setCategoryDialogNewName('');
                            setCategoryDialogNewIcon('🏷️');
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#da190b'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    };
    const renderEditDialog = () => {
        if (!editLocationDialog) return null;
        if (editLocationIndex === null || !trips[editLocationIndex]) {
            return null;
        }

        const trip = trips[editLocationIndex];

        return (
            <div className='modal-overlay' style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div className='containerDetail p-20 maxHeight75percent bg-dark' style={{ width: '90%', maxWidth: '600px' }}>
                    <div className='containerDetail p-20 contentCenter color-yellow bg-lite size25 mb-10'>
                        Edit Trip Entry
                    </div>

                    <div className='containerDetail p-20 color-lite scroll' style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <div className='containerDetail mb-10'>
                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Location:</span>
                                <input
                                    className='flexColumn inputField color-lite size15 w-300'
                                    type='text'
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </label>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Category:</span>
                                <select
                                    className='flexColumn inputSelect w-300'
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {Object.keys(locationCategories).map((cat) => (
                                        <option key={cat} value={cat}>
                                            {locationCategories[cat]} {cat}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>
                                    Odometer:
                                </span>
                                <input
                                    className='flexColumn inputField color-lite size15 w-300'
                                    type='number'
                                    value={odometer}
                                    onChange={(e) => setOdometer(e.target.value)}
                                />
                            </label>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Distance:</span>
                                <input
                                    className='flexColumn inputField color-lite size15 w-300'
                                    type='number'
                                    value={trip.distance || 0}
                                    disabled

                                />
                            </label>

                            <>
                                <label className='flexContainer mb-5'>
                                    <span className='flexColumn contentRight color-yellow w-170 pr-10'>Guage Start:</span>
                                    <select
                                        className='flexColumn inputSelect w-300'
                                        value={guageStart}
                                        onChange={(e) => setGuageStart(e.target.value)}
                                    >
                                        <option value=''>Select</option>
                                        {fuelGuageReadings.map((reading) => (
                                            <option key={reading} value={reading}>{reading}%</option>
                                        ))}
                                    </select>
                                </label>

                                <label className='flexContainer mb-5'>
                                    <span className='flexColumn contentRight color-yellow w-170 pr-10'>Guage End:</span>
                                    <select
                                        className='flexColumn inputSelect w-300'
                                        value={guageEnd}
                                        onChange={(e) => setGuageEnd(e.target.value)}
                                    >
                                        <option value=''>Select</option>
                                        {fuelGuageReadings.map((reading) => (
                                            <option key={reading} value={reading}>{reading}%</option>
                                        ))}
                                    </select>
                                </label>

                                <label className='flexContainer mb-5'>
                                    <span className='flexColumn contentRight color-yellow w-170 pr-10'>Gallons:</span>
                                    <input
                                        className='flexColumn inputField color-lite size15 w-300'
                                        type='number'
                                        step='0.1'
                                        value={gallonsPurchased}
                                        onChange={(e) => setGallonsPurchased(e.target.value)}
                                    />
                                </label>

                                <label className='flexContainer mb-5'>
                                    <span className='flexColumn contentRight color-yellow w-170 pr-10'>$ / Gallon:</span>
                                    <input
                                        className='flexColumn inputField color-lite size15 w-300'
                                        type='number'
                                        step='0.01'
                                        value={pricePerGallon}
                                        onChange={(e) => setPricePerGallon(e.target.value)}
                                    />
                                </label>

                                <label className='flexContainer mb-5'>
                                    <span className='flexColumn contentRight color-yellow w-170 pr-10'>Total USD:</span>
                                    <input
                                        className='flexColumn inputField color-lite size15 w-300'
                                        type='number'
                                        step='0.01'
                                        value={totalUSD}
                                        onChange={(e) => setTotalUSD(e.target.value)}
                                    />
                                </label>
                            </>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Cost/Fee:</span>
                                <input
                                    className='flexColumn inputField color-lite size15 w-300'
                                    type='number'
                                    step='0.01'
                                    value={costFee}
                                    onChange={(e) => setCostFee(e.target.value)}
                                />
                            </label>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Rating:</span>
                                <select
                                    className='flexColumn inputSelect w-300'
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value=''>Select Rating</option>
                                    <option value='1'>1 ⭐</option>
                                    <option value='2'>2 ⭐⭐</option>
                                    <option value='3'>3 ⭐⭐⭐</option>
                                    <option value='4'>4 ⭐⭐⭐⭐</option>
                                    <option value='5'>5 ⭐⭐⭐⭐⭐</option>
                                </select>
                            </label>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Latitude:</span>
                                <input
                                    className='flexColumn inputField color-lite size15 w-300'
                                    type='number'
                                    step='0.000001'
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                />
                            </label>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Longitude:</span>
                                <input
                                    className='flexColumn inputField color-lite size15 w-300'
                                    type='number'
                                    step='0.000001'
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                />
                            </label>

                            <label className='flexContainer mb-5'>
                                <span className='flexColumn contentRight color-yellow w-170 pr-10'>Time:</span>
                                <input
                                    className='flexColumn inputField color-lite size15 w-300'
                                    type='date'
                                    value={trip.time || ''}
                                    disabled

                                />
                            </label>
                        </div>
                    </div>

                    <div className='containerDetail p-10 flexContainer mt-10'>
                        <button
                            className='containerDetail p-20 button bg-green flex2Column mr-5 size20 color-lite'
                            onClick={() => updateLocation()}
                            style={{ cursor: 'pointer', border: 'none', borderRadius: '4px' }}
                        >
                            💾 Save
                        </button>
                        <button
                            className='containerDetail p-20 button bg-red flex2Column size20 color-lite'
                            onClick={() => setEditLocationDialog(false)}
                            style={{ cursor: 'pointer', border: 'none', borderRadius: '4px' }}
                        >
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const editUSDGallons = (index, usdPerGallon) => {
        const newTrips = [...trips];
        newTrips[index].usdPerGallon = prompt('Edit USD per gallon', usdPerGallon) || usdPerGallon;
        const newTotalUSD = newTrips[index].usdPerGallon * newTrips[index].gallons;
        newTrips[index].totalUSD = newTotalUSD.toFixed(2);
        setTrips(newTrips);
    }
    const editTotalUSD = (index, totalUSD) => {
        const newTrips = [...trips];
        newTrips[index].totalUSD = prompt('Edit total USD:', totalUSD) || totalUSD;
        setTrips(newTrips);
    }

    const getTripIndex = (tripObject) => {
        if (!tripObject) return -1;

        return trips.findIndex(trip =>
            trip.location === tripObject.location &&
            trip.odometer === tripObject.odometer &&
            trip.time === tripObject.time &&
            trip.latitude === tripObject.latitude &&
            trip.longitude === tripObject.longitude
        );
    };

    const editEntry = (trip) => {
        const index = getTripIndex(trip);
        //console.log(`editEntry => index: ${index}`);
        /*
            editLocation(index, trip.location)
            editOdometer(index, trip.odometer)
            editGuageStart(index, trip.guageStart)
            editGuageEnd(index, trip.guageEnd)
            editLongitude(index, trip.longitude)
            editLatitude(index, trip.latitude)
            editDistance(index, trip.distance)
            editGallons(index, trip.gallons)
            editTime(index)
            editDate(index)
            editUSDGallons(index, trip.usdPerGallon)
            editTotalUSD(index, trip.totalUSD)
        */

        setEditLocationIndex(index);
        setEditLocationDialog(true);
    }

    //const getDate = (index) => (trips[index] !== undefined) ? `${trips[index].time.split(', ')[0].split('/')[0]}/${trips[index].time.split(', ')[0].split('/')[1]}` : null;
    const getDate = (index) => (validate(trips[index]) !== null) ? `${trips[index].time.split(', ')[0].split('/')[0]}/${trips[index].time.split(', ')[0].split('/')[1]}` : null;


    const getSameDayStartIndex = (targetDate) => {
        let startIndex = -1;
        for (let i = 0; i < trips.length; i++) {
            if (getDate(i) === targetDate) {
                startIndex = i;
                break;
            }
        }
        return startIndex;
    }
    const getSameDayEndIndex = (targetDate) => {
        let endIndex = -1;
        for (let i = trips.length - 1; i >= 0; i--) {
            if (getDate(i) === targetDate) {
                endIndex = i;
                break;
            }
        }
        return endIndex;
    }
    const calculateDistanceToStop = useCallback((tripLatitude, tripLongitude) => {
        if (!latitude || !longitude) return null;
        const R = 3959; // Earth's radius in miles
        const lat1 = (latitude * Math.PI) / 180;
        const lat2 = (tripLatitude * Math.PI) / 180;
        const deltaLat = ((tripLatitude - latitude) * Math.PI) / 180;
        const deltaLon = ((tripLongitude - longitude) * Math.PI) / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance.toFixed(0);
    }, [latitude, longitude]);
    const getBestFuelDeals = useMemo(() => {
        const seen = new Set();
        const filtered = trips
            .filter(stop => {
                if (Number(stop.gallons) > 1 && !seen.has(stop.location)) {
                    seen.add(stop.location);
                    return true;
                }
                return false;
            })
            .map((stop, idx) => ({
                ...stop,
                distanceFromCurrent: calculateDistanceToStop(stop.latitude, stop.longitude)
            }));

        // Sort based on mode
        if (pricesSortMode === 'distance') {
            return filtered
                .sort((a, b) => Number(a.distanceFromCurrent) - Number(b.distanceFromCurrent))
                .map((stop, idx) => ({ ...stop, rank: idx + 1 }));
        } else {
            return filtered
                .sort((a, b) => Number(a.usdPerGallon) - Number(b.usdPerGallon))
                .map((stop, idx) => ({ ...stop, rank: idx + 1 }));
        }
    }, [trips, pricesSortMode, calculateDistanceToStop]);

    const getLocations = useMemo(() => {
        const seen = new Set();
        const filtered = trips
            .filter(stop => {
                //if (Number(stop.gallons) > 1 && !seen.has(stop.location)) {
                seen.add(stop.location);
                return true;
                //}
                //return false;
            })
            .map((stop, idx) => ({
                ...stop,
                distanceFromCurrent: calculateDistanceToStop(stop.latitude, stop.longitude)
            }));

        // Sort based on primary mode
        let sorted = filtered;

        if (locationsSortMode === 'distance') {
            sorted = filtered.sort((a, b) => Number(a.distanceFromCurrent) - Number(b.distanceFromCurrent));
        } else if (locationsSortMode === 'category') {
            sorted = filtered
                .filter(stop => stop.category === locationsCategorySort && stop.category !== '')
                .sort((a, b) => Number(a.distanceFromCurrent) - Number(b.distanceFromCurrent));
        } else if (locationsSortMode === 'chronological') {
            sorted = [...trips].reverse();
        } else {
            // Default: sort by location alphabetically
            sorted = filtered
                .sort((a, b) => {
                    const locationCompare = a.location.localeCompare(b.location);
                    if (locationCompare !== 0) return locationCompare;

                    // Secondary sort within same location
                    if (locationsCategorySort === 'distance') {
                        return Number(a.distanceFromCurrent) - Number(b.distanceFromCurrent);
                    } else if (locationsCategorySort === 'category') {
                        if (a.category && b.category) {
                            return a.category.localeCompare(b.category);
                        }
                    }
                    return 0;
                });
        }

        return sorted.map((stop, idx) => ({ ...stop, rank: idx + 1 }));
    }, [trips, locationsSortMode, locationsCategorySort, calculateDistanceToStop]);

    const calculateAndRecord = () => {

        const lastIndex = (trips.length - 1);
        const lastDate = getDate(lastIndex);
        const pricePerLiterUSD = pricePerLiter / exchangeRate;
        const gallons = litersPurchased * 0.264172;
        const newGallons = (currency === 'USD') ? gallonsPurchased : gallons.toFixed(1);

        const usdPerGallon = (currency === 'USD') ? Number(pricePerGallon) : Number(pricePerLiterUSD * 3.78541);
        const newUsdPerGallon = usdPerGallon.toFixed(2) || 0;
        const totalUSD = (currency === 'USD') ? (gallonsPurchased * pricePerGallon) : (gallons * usdPerGallon);
        const newTotalUSD = totalUSD.toFixed(2);
        const time = currentDate();
        const newDate = `${time.split(', ')[0].split('/')[0]}/${time.split(', ')[0].split('/')[1]}`;
        const newDistance = (lastDate === newDate) ? (Number(odometer) - lastOdometer()) : 0;
        localStorage.setItem('distance', newDistance);
        localStorage.setItem('odometer', odometer);
        localStorage.setItem('oilChange', oilChange);
        localStorage.setItem('location', location);
        localStorage.setItem('gallons', newGallons);
        localStorage.setItem('usdPerGallon', newUsdPerGallon);
        localStorage.setItem('rating', rating);
        localStorage.setItem('category', category);
        localStorage.setItem('costFee', costFee);
        //console.log(`Fuel => calculateAndRecord => guageStart: ${guageStart} guageEnd: ${guageEnd}`);
        const newTrip = {
            location: location,
            odometer: odometer,
            rating: rating,
            category: category,
            costFee: costFee,
            guageStart: (guageStart === '') ? 0 : guageStart,
            guageEnd: (guageEnd === '') ? 0 : guageEnd,
            time: time,
            latitude: latitude,
            longitude: longitude,
            distance: newDistance,
            gallons: newGallons,
            usdPerGallon: newUsdPerGallon,
            totalUSD: newTotalUSD
        }
        const newTrips = [...trips, newTrip];
        //console.log(`Fuel => calculateAndRecord => newTrips: ${JSON.stringify(newTrips, null, 2)}`);
        setTrips(newTrips);
        setFormCollapse(true)
    };
    const updateLocation = () => {

        const pricePerLiterUSD = pricePerLiter / exchangeRate;
        const gallons = litersPurchased * 0.264172;
        const newGallons = (currency === 'USD') ? gallonsPurchased : gallons.toFixed(1);

        const usdPerGallon = (currency === 'USD') ? Number(pricePerGallon) : Number(pricePerLiterUSD * 3.78541);
        const newUsdPerGallon = usdPerGallon.toFixed(2) || 0;
        const totalUSD = (currency === 'USD') ? (gallonsPurchased * pricePerGallon) : (gallons * usdPerGallon);
        const newTotalUSD = totalUSD.toFixed(2);
        const time = currentDate();
        const previousTripOdometer = (editLocationIndex > 0) ? Number(trips[editLocationIndex - 1].odometer) : 0;
        const newDistance = (editLocationIndex > 0) ? (Number(odometer) - previousTripOdometer) : 0;
        localStorage.setItem('distance', newDistance);
        localStorage.setItem('odometer', odometer);
        localStorage.setItem('oilChange', oilChange);
        localStorage.setItem('location', location);
        localStorage.setItem('gallons', newGallons);
        localStorage.setItem('usdPerGallon', newUsdPerGallon);
        localStorage.setItem('rating', rating);
        localStorage.setItem('category', category);
        localStorage.setItem('costFee', costFee);
        //console.log(`Fuel => calculateAndRecord => guageStart: ${guageStart} guageEnd: ${guageEnd}`);
        const updateTrip = {
            location: location,
            odometer: odometer,
            rating: rating,
            category: category,
            costFee: costFee,
            guageStart: (guageStart === '') ? 0 : guageStart,
            guageEnd: (guageEnd === '') ? 0 : guageEnd,
            time: time,
            latitude: latitude,
            longitude: longitude,
            distance: newDistance,
            gallons: newGallons,
            usdPerGallon: newUsdPerGallon,
            totalUSD: newTotalUSD
        }
        const newTrips = [...trips];
        newTrips[editLocationIndex] = updateTrip;
        setTrips(newTrips);
        setEditLocationDialog(false);
    };
    const getTotalHours = (index) => {
        //const totalTime = trips.reduce((accumulator, trip) => accumulator + parseFloat(trip.time), 0);
        if (trips[index]?.time) {
            const targetDate = new Date(trips[index].time);
            if (isNaN(targetDate)) return null;
            const dates = trips.map((trip) => new Date(trip.time));
            const tripsForDate = dates.filter((date) => date.toDateString() === targetDate.toDateString());
            //console.log(`Fuel => getTotalHours => date: ${dates[index]}`);
            const firstDate = tripsForDate[0];
            const lastDate = targetDate;
            if (isNaN(firstDate) || isNaN(lastDate)) return null;
            const timeDifference = lastDate - firstDate;
            const totalTime = timeDifference / (1000 * 60 * 60);
            const nearestHours = Math.floor(totalTime);
            const remainingMinutes = Math.round((totalTime - nearestHours) * 60);

            return `${nearestHours}h${remainingMinutes}m`;
        }
        return null
    }
    const getTripHours = (index) => {
        //const totalTime = trips.reduce((accumulator, trip) => accumulator + parseFloat(trip.time), 0);
        //console.log(`Fuel => getTripHours => index: ${index} trips.length: ${trips.length}`);
        if (index < (trips.length - 1)) {
            const targetTime = new Date(trips[(index)]?.time);
            const startTime = new Date(trips[(index - 1)]?.time);
            if (isNaN(targetTime)) return `Trip Start`;
            //console.log(`Fuel => getTripHours => startTime: ${startTime}`);
            //console.log(`Fuel => getTripHours => targetTime: ${targetTime}`);
            const firstDate = startTime;
            const lastDate = targetTime;
            if (isNaN(firstDate) || isNaN(lastDate)) return null;
            const timeDifference = lastDate - firstDate;
            const totalTime = timeDifference / (1000 * 60 * 60);
            const nearestHours = Math.floor(totalTime);
            const remainingMinutes = Math.round((totalTime - nearestHours) * 60);
            return `${nearestHours}h${remainingMinutes}m`;
        } else {
            return `Trip Start`;
        }
    }
    const getTotalMiles = (index) => {
        if (index < 0 || index >= trips.length) return null;
        let lastFuelIndex = -1;
        for (let i = index - 1; i >= 0; i--) {
            if (parseFloat(trips[i].gallons) > 0) {
                lastFuelIndex = i;
                break;
            }
        }
        if (lastFuelIndex === -1) return null;
        const startOdo = parseFloat(trips[lastFuelIndex].odometer);
        const endOdo = parseFloat(trips[index].odometer);
        const miles = endOdo - startOdo;
        return miles >= 0 ? miles.toFixed(1) : null;
    };
    const getDailyMiles = (index) => {
        //const totalMiles = trips.reduce((accumulator, trip) => accumulator + parseFloat(trip.distance), 0);
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalMilesInRange = trips
            .slice(startIndex, endIndex + 1)
            .reduce((accumulator, trip) => accumulator + parseFloat(trip.distance), 0);

        return totalMilesInRange.toFixed(1);
    }
    const getTotalGallons = (index) => {
        //const totalGallons = trips.reduce((accumulator, trip) => accumulator + parseFloat(Number(trip.gallons)), 0);
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalGallons = trips
            .slice(startIndex, endIndex + 1)
            .reduce((accumulator, trip) => accumulator + parseFloat(Number(trip.gallons)), 0);

        return totalGallons.toFixed(1);
    }

    const getTotalStops = (index) => {
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalStops = endIndex - startIndex;
        return totalStops;
    }
    const getTotalUSD = (index) => {
        //const totalUSD = trips.reduce((accumulator, trip) => accumulator + parseFloat(trip.totalUSD), 0);
        const targetDate = getDate(index);
        if (!targetDate) return null;
        const startIndex = getSameDayStartIndex(targetDate);
        const endIndex = getSameDayEndIndex(targetDate);
        const totalUSD = trips
            .slice(startIndex, endIndex + 1)
            .reduce((accumulator, trip) => accumulator + parseFloat(trip.totalUSD), 0);

        return totalUSD.toFixed(2);
    };
    const getDateFromTimeString = useCallback((timeString) => {
        if (!timeString) return null;
        const datePart = timeString.split(', ')[0]; // "M/D/YYYY"
        const [month, day, year] = datePart.split('/');
        return new Date(year, month - 1, day);
    }, []);

    const filterChartData = useCallback((data) => {
        if (chartFilterMode === 'all') return data;

        const now = new Date();

        return data.filter(item => {
            const sourceIndex =
                typeof item.tripIndex === 'number'
                    ? item.tripIndex
                    : item.id - 1;
            const tripDate = getDateFromTimeString(trips[sourceIndex]?.time);
            if (!tripDate) return false;

            switch (chartFilterMode) {
                case 'today': {
                    return tripDate.toDateString() === now.toDateString();
                }
                case 'day': {
                    if (!filterSpecificDay) return false;
                    const specificDate = new Date(filterSpecificDay);
                    return tripDate.toDateString() === specificDate.toDateString();
                }
                case 'month': {
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();
                    return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
                }
                case 'year': {
                    return tripDate.getFullYear() === now.getFullYear();
                }
                case 'range': {
                    if (!filterStartDate || !filterEndDate) return false;
                    const startDate = new Date(filterStartDate);
                    const endDate = new Date(filterEndDate);
                    endDate.setHours(23, 59, 59, 999); // Include entire end date
                    return tripDate >= startDate && tripDate <= endDate;
                }
                default:
                    return true;
            }
        });
    }, [chartFilterMode, filterSpecificDay, filterStartDate, filterEndDate, trips, getDateFromTimeString]);
    const handleInputChange = (event) => {
        const { value } = event.target;
        setCurrency(value);
    };
    const handleGuageStartChange = (event) => {
        const { value } = event.target;
        setGuageStart(value);
    };
    const handleGuageEndChange = (event) => {
        const { value } = event.target;
        setGuageEnd(value);
    };
    const getUSInputs = () => {
        if (currencies[currency] === 'Dollar') {
            return <div>
                <label className='flexContainer containerDetail mt-5'>
                    <div className='columnRightAlign flex2Column'>
                        <span className='inputText'>
                            {currencies[currency]} per Gallon:
                        </span>
                    </div>
                    <div className='columnLeftAlign flex2Column'>
                        <input
                            id='pricePerGallon'
                            name='pricePerGallon'
                            className='inputField'
                            type='number'
                            value={pricePerGallon}
                            onChange={(e) => setPricePerGallon(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer containerDetail mt-5'>
                    <div className='columnRightAlign flex2Column'>
                        <span className='inputText'>
                            Total Gallons:
                        </span>
                    </div>
                    <div className='columnLeftAlign flex2Column'>
                        <input className='inputField'
                            id='gallonsPurchased'
                            name='gallonsPurchased'
                            type='number'
                            value={gallonsPurchased}
                            onChange={(e) => setGallonsPurchased(e.target.value)}
                        />
                    </div>
                </label>
            </div>
        }
    }
    const getInternationalInputs = () => {
        if (currencies[currency] !== 'Dollar') {
            return <div>
                <label className='flexContainer containerDetail bg-lite m-5'>
                    <div className='columnRightAlign flex2Column'>
                        <span className='inputText'>
                            Exchange Rate:
                        </span>
                    </div>
                    <div className='columnLeftAlign flex2Column'>
                        <input className='inputField'
                            id='exchangeRate'
                            name='exchangeRate'
                            type='number'
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer containerDetail bg-lite m-5'>
                    <div className='columnRightAlign flex2Column'>
                        <span className='inputText'>
                            {currencies[currency]} per Liter:
                        </span>
                    </div>
                    <div className='columnLeftAlign flex2Column'>
                        <input className='inputField'
                            id='pricePerLiter'
                            name='pricePerLiter'
                            type='number'
                            value={pricePerLiter}
                            onChange={(e) => setPricePerLiter(e.target.value)}
                        />
                    </div>
                </label>
                <label className='flexContainer containerDetail bg-lite m-5'>
                    <div className='columnRightAlign flex2Column'>
                        <span className='inputText'>
                            Total Liters:
                        </span>
                    </div>
                    <div className='columnLeftAlign flex2Column'>
                        <input className='inputField'
                            id='litersPurchased'
                            name='litersPurchased'
                            type='number'
                            value={litersPurchased}
                            onChange={(e) => setLitersPurchased(e.target.value)}
                        />
                    </div>
                </label>
            </div>
        }
    }
    const updateCurrentLocation = (longitude, latitude) => {
        console.log(
            `UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`
        );
        setLongitude(longitude);
        setLatitude(latitude + .000001);
        // Immediately reverse geocode using provided coordinates
        //console.log(`Fuel => Requesting location data with provided coordinates...`);
        requestLocation({ latitude, longitude });
    };
    const findClosestBelowOrEqual = (arr, target) => {
        const filtered = arr.filter(num => num <= target);
        if (filtered.length === 0) return null;

        return filtered.reduce((prev, curr) =>
            Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
        );
    }
    const getLastStopFueled = (id) => {
        let lastFuelUp = {};
        let index = 0;
        trips.forEach((stop) => {
            if (stop.gallons > 0 && index < id) {
                lastFuelUp = { ...stop };
            }
            index++
        });
        return lastFuelUp;
    }
    const getStopsSinceLastFueled = (id) => {
        const indexArray = [];
        let index = 0;
        trips.forEach((stop) => {
            if (stop.gallons > 0) {
                indexArray.push(index);
            }
            index++
        });
        const stops = id - findClosestBelowOrEqual(indexArray, id);
        return `${stops} `
    }
    const getHoursSinceLastFueled = (id) => {
        const indexArray = [];
        let index = 0;
        trips.forEach((stop) => {
            if (stop.gallons > 0) {
                indexArray.push(index);
            }
            index++
        });
        if (trips[id].time) {
            const targetDate = new Date(trips[id].time);
            if (isNaN(targetDate)) return null;
            const firstDateId = findClosestBelowOrEqual(indexArray, id);
            //console.log(`getHoursSinceLastFueled => id: ${id} firstDateId: ${firstDateId}`);
            const firstDate = new Date(trips[firstDateId]?.time);
            const lastDate = targetDate;
            if (isNaN(firstDate) || isNaN(lastDate)) return null;
            const timeDifference = lastDate - firstDate;
            const totalTime = timeDifference / (1000 * 60 * 60);
            const nearestHours = Math.floor(totalTime);
            const remainingMinutes = Math.round((totalTime - nearestHours) * 60);

            return `${nearestHours}h${remainingMinutes}m`;
        }
        return null
    }
    const getTotalsDisplay = (index, trip, category) => {
        const date = getDate(index);
        //const previousDate = getDate(index - 1) || null;
        const nextDate = getDate(index + 1) || null;
        if (date === nextDate) {
            return
        }
        return <div className={`containerDetail scrollSnapBottom mt-5 mb-5 bg-${(category === 'daily') ? 'dkGreen' : 'blue'}`}>
            <div className='containerDetail color-yellow bold mb-5'>
                {(category === 'daily') ? 'daily total' : 'since last fueled'}
            </div>
            <div className='flexContainer h-scroll'>
                <div className='flex4Column containerDetail mr-5'>
                    <div className='containerDetail bold color-yellow size20'>🛣️</div>
                    <div className='bold color-lite'>{(category === 'daily') ? getDailyMiles(index) : getTotalMiles(index)}<span className='size12'>miles</span></div>
                </div>
                <div className='flex4Column containerDetail mr-5'>
                    <div className='containerDetail bold color-yellow size20'>⏱️</div>
                    <div className='bold color-lite'>{(category === 'daily') ? getTotalHours(index) : `${(trip.gallons > 0) ? getTotalHours(index) : getHoursSinceLastFueled(index)}`}</div>
                </div>
                <div className='flex4Column containerDetail mr-5'>
                    <div className='containerDetail bold color-yellow size20'>🛑</div>
                    <div className='bold color-lite'>{(category === 'daily') ? getTotalStops(index) : `${(trip.gallons > 0) ? getTotalStops(index) : getStopsSinceLastFueled(index)}`}</div>
                </div>
                <div className='flex4Column containerDetail mr-5'>
                    <div className='containerDetail bold color-yellow size20'>⛽️</div>
                    <div className='bold color-lite'>{(category === 'daily') ? getTotalGallons(index) : `${(trip.gallons > 0) ? trip.gallons : getLastStopFueled(index).gallons}`}<span className='size12'>gallons</span></div>
                </div>
                <div className='flex4Column containerDetail'>
                    <div className='containerDetail bold color-yellow size20'>💸</div>
                    <div className='bold color-lite'>${(category === 'daily') ? getTotalUSD(index) : `${(trip.totalUSD > 0) ? trip.gallons : getLastStopFueled(index).totalUSD}`}</div>
                </div>
            </div>
        </div>
    }
    const getTripTime = (trip) => {
        //console.log(`Fuel => getTripTime => trip: ${JSON.stringify(trip, null, 2)}`);
        const time = trip.time.split(', ')[1];
        const hours = time.split(':')[0];
        const minutes = time.split(':')[1];
        const half = time.split(' ')[1];
        const display = `${hours}:${minutes} ${half}`;
        return display;
    }
    const locationEntry = () => <div>
        <div className='containerDetail mt-5 size20'>
            <div className='containerDetail mb-5 mt-5'>
                <Geolocator
                    currentPositionExists='false'
                    returnCurrentPosition={updateCurrentLocation}
                />
            </div>
            <label className='flexContainer containerDetail mt-5'>
                <div className='columnRightAlign flex2Column'>
                    <span className='inputText'>
                        Location:
                    </span>
                </div>
                <div className='columnLeftAlign flex2Column'>
                    <input
                        className='inputField'
                        id='location'
                        name='location'
                        type='string'
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
            </label>
            <label className='flexContainer containerDetail mt-5'>
                <div className='columnRightAlign flex2Column'>
                    <span className='inputText'>
                        Category:
                    </span>
                </div>
                <div className='columnLeftAlign flex2Column'>
                                <select
                                    name='category'
                                    value={category}
                                    onChange={(e) => handleCategorySelect(e.target.value)}
                                    className='inputSelect'
                                >
                                    {
                                        Object.keys(locationCategories || {}).map((cat) => (
                                            <option key={cat} value={cat}>
                                                {locationCategories[cat]} {cat}
                                            </option>
                                        ))
                                    }
                                    <option value='__add__'>➕ Add Category</option>
                                </select>
                </div>
            </label>
            <label className='flexContainer containerDetail mt-5'>
                <div className='columnRightAlign flex2Column'>
                    <span className='inputText'>
                        Odometer:
                    </span>
                </div>
                <div className='columnLeftAlign flex2Column'>
                    <input className='inputField'
                        id='odometer'
                        name='odometer'
                        type='number'
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                    />
                </div>
            </label>

            {category === 'Gas' ? (
                <>
                    <label className='flexContainer containerDetail mt-5 p-10'>
                        <div className='columnRightAlign flex2Column'>
                            <span className='inputText'>
                                Currency:
                            </span>
                        </div>
                        <div className='columnLeftAlign flex2Column'>
                            <select
                                name='currency'
                                value={currency}
                                onChange={handleInputChange}
                                className='inputSelect'
                            >
                                <option value=''>Select Currency</option>
                                {currencyCode.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currencies[currency]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </label>
                    <label className='flexContainer containerDetail mt-5 p-10'>
                        <div className='columnRightAlign flex2Column'>
                            <select
                                name='guageStart'
                                value={guageStart}
                                onChange={handleGuageStartChange}
                                className='inputSelect'
                            >
                                <option value=''>Tank Start</option>
                                {fuelGuageReadings.map((readingValue) => (
                                    <option key={readingValue} value={readingValue}>
                                        {`${readingValue}%`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='columnLeftAlign flex2Column'>
                            <select
                                name='guageEnd'
                                value={guageEnd}
                                onChange={handleGuageEndChange}
                                className='inputSelect'
                            >
                                <option value=''>Tank End</option>
                                {fuelGuageReadings.map((readingValue) => (
                                    <option key={readingValue} value={readingValue}>
                                        {`${readingValue}%`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </label>
                    {getInternationalInputs()}
                    {getUSInputs()}
                </>
            ) : (
                <>
                    {
                        (category === 'Shopping' || category === 'Entertainement' || category === 'Maintenance' || category === 'Repair' || category === 'Toll' || category === 'Parking' || category === 'Dining') &&
                        <label className='flexContainer containerDetail mt-5'>
                            <div className='columnRightAlign flex2Column'>
                                <span className='inputText'>
                                    Cost/Fee:
                                </span>
                            </div>
                            <div className='columnLeftAlign flex2Column'>
                                <input className='inputField'
                                    id='costFee'
                                    name='costFee'
                                    type='number'
                                    value={costFee}
                                    onChange={(e) => setCostFee(e.target.value)}
                                />
                            </div>
                        </label>
                    }
                    {
                        (category === 'Maintenance' || category === 'Repair' || category === 'Entertainement' || category === 'Dining' || category === 'Bar') &&
                        <label className='flexContainer containerDetail mt-5'>
                            <div className='columnRightAlign flex2Column'>
                                <span className='inputText'>
                                    Rating (1-5):
                                </span>
                            </div>
                            <div className='columnLeftAlign flex2Column'>
                                <select
                                    name='rating'
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    className='inputSelect'
                                >
                                    <option value=''>Select Rating</option>
                                    <option value='1'>1 ⭐</option>
                                    <option value='2'>2 ⭐⭐</option>
                                    <option value='3'>3 ⭐⭐⭐</option>
                                    <option value='4'>4 ⭐⭐⭐⭐</option>
                                    <option value='5'>5 ⭐⭐⭐⭐⭐</option>
                                </select>
                            </div>
                        </label>
                    }
                </>
            )}
        </div>
        <div className='containerDetail flexContainer mt-5'>
            <div
                className='containerDetail bg-green p-20 flex2Column size20 button color-lite m-5'
                onClick={calculateAndRecord}
            >
                ➕ Add
            </div>
            <div
                className='containerDetail bg-green p-20 flex2Column size20 button color-lite m-5'
                onClick={() => setFormCollapse(true)}
            >
                Cancel
            </div>
        </div>
    </div>

    const displayLog = () => {
        const sortedTrips = [...trips].reverse();
        //console.log(`Fuel => displayLog => sortedTrips: ${JSON.stringify(sortedTrips, null, 2)}`);
        return <div className='mt-5 ml-5 mr-5 scroll height-400'>
            {
                sortedTrips.map((trip, index) => {
                    const originalIndex = trips.length - 1 - index;
                    return <div className='' key={getKey(`trip${originalIndex}`)}>
                        {getTotalsDisplay(originalIndex, trip, 'daily')}
                        {(originalIndex>1) && getTotalsDisplay(originalIndex, trip, 'trip')}
                        <div className={`containerDetail color-soft scrollSnap mb-5 ${(trip.location.toLowerCase().includes('oil')) ? 'bg-dkYellow' : 'bg-lite'}`}>
                            <div className='containerDetail'>
                                <div className='containerDetail flexContainer'>
                                    <div className='bold color-yellow flex1Auto flexContainer'>
                                        <div
                                            className='button p-5 mr-10 r-5 size20 flex2Column color-yellow contentLeft'
                                            onClick={() => editEntry(trip)}
                                        >
                                            {originalIndex + 1}. {trip.location}
                                            <br />
                                            <div className='contentLeft size15 color-lite mt-10'>
                                                📅 {`${trip.time.split(', ')[0].split('/')[0]}/${trip.time.split(', ')[0].split('/')[1]}`} - {`${(trip && trip !== "'") ? getTripTime(trip) : null}`}
                                            </div>
                                            <div className='contentLeft size15 color-lite mt-5'>
                                                ⏱️ {getTripHours((sortedTrips.length - index) - 1) || 'Trip Start'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flexColumn w-50'>
                                        <div className='r-5 size15 bg-lite bold color-yellow button pl-20 pr-20 pb-10 pt-10' onClick={() => deleteLocation(originalIndex)}>
                                            X
                                        </div>
                                        <div
                                            title='map'
                                            className='button mt-10 mb-5'
                                            onClick={() => window.location = `https://www.google.com/maps?q=${trip.latitude},${trip.longitude}`}
                                        >
                                            🌎
                                        </div>
                                        <div
                                            title={trip.category || 'no category'}
                                            className='button size15'
                                            onClick={() => editTripCategory(originalIndex, trip.category)}
                                        >
                                            {
                                                (trip.category !== undefined && trip.category !== null && trip.category !== '')
                                                    ? `${locationCategories[trip.category]}`
                                                    : '❓'
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    {
                                        (trip.gallons < 1)
                                            ? null
                                            : <div>
                                                <div className='flexContainer mb-5 '>
                                                    <div className='flex3Column containerDetail bg-red'>
                                                        <div className='containerDetail color-lite bold size20'>⛽️</div>
                                                        <div
                                                            className='color-lite bold size12 p-5'
                                                            onClick={() => editGallons(originalIndex, trip.gallons)}
                                                        >
                                                            {trip.gallons}<span className='size12'>gallons</span>
                                                        </div>
                                                    </div>
                                                    <div className='flex3Column ml-5 containerDetail bg-green'>
                                                        <div className='containerDetail color-lite bold size20'>💸 / ⛽️</div>
                                                        <div className='color-lite bold size12 p-5' onClick={() => editUSDGallons(originalIndex, trip.usdPerGallon)}>
                                                            ${trip.usdPerGallon}/<span className='size12'>gal</span>
                                                        </div>
                                                    </div>
                                                    <div className='flex3Column ml-5 containerDetail bg-dkGreen'>
                                                        <div className='containerDetail color-lite bold size20'>💰</div>
                                                        <div
                                                            className='color-lite bold size12 p-5'
                                                            onClick={() => editTotalUSD(originalIndex, trip.totalUSD)}
                                                        >
                                                            ${trip.totalUSD}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    }
                                    <div className='flexContainer'>
                                        {
                                            (trip.distance === 0)
                                                ? null
                                                : <div
                                                    className='containerDetail flex3Column bg-lite mr-5'
                                                    onClick={() => editDistance(originalIndex, trip.distance)}
                                                >
                                                    <div className='containerDetail color-lite bold size20'>
                                                        🛣️
                                                    </div>
                                                    <div className='color-lite bold size12 p-5'>
                                                        {trip.distance}
                                                        <span className='size12'>
                                                            miles
                                                        </span>
                                                    </div>
                                                </div>
                                        }
                                        {
                                            (trip.gallons < 1)
                                                ? <div className='containerDetail flex3Column mr-5 bg-dkRed'>
                                                    <div className='containerDetail color-lite bold size20' onClick={() => editGallons(originalIndex, trip.gallons)}>➕⛽️</div>
                                                    <div
                                                        className='color-lite bold size12 p-5'
                                                    >
                                                        {(trip.odometer < getLastStopFueled(index).odometer) ? 0 : trip.odometer - getLastStopFueled(index).odometer}
                                                        <span className='size12'>
                                                            miles
                                                        </span>
                                                    </div>
                                                </div>
                                                : <div className='containerDetail flex3Column mr-5 bg-dkRed'>
                                                    <div className='containerDetail color-lite bold size20'>
                                                        <span className='size12'>
                                                            <span className='ml-2' onClick={() => editGuageStart(originalIndex, trip.guageStart)}>
                                                                {trip.guageStart}
                                                            </span>%
                                                        </span>
                                                        ⛽️
                                                        <span className='size12'>
                                                            <span className='ml-2' onClick={() => editGuageEnd(originalIndex, trip.guageEnd)}>
                                                                {trip.guageEnd}
                                                            </span>%
                                                        </span>
                                                    </div>
                                                    <div
                                                        className='color-lite bold size12 p-5'
                                                    >
                                                        <span className='size12'>fill: {trip.guageEnd - trip.guageStart}%</span>
                                                    </div>
                                                </div>
                                        }
                                        <div
                                            className='containerDetail flex3Column bg-blue'
                                            onClick={() => editOdometer(originalIndex, trip.odometer)}
                                        >
                                            <div className='containerDetail color-lite bold size20'>🚙</div>
                                            <div className='color-lite bold size12 p-5'>
                                                {trip.odometer}
                                                <span className='size12'>
                                                    odo
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* 
                                <div className='contentLeft bold size20 p-5 ml-10 mb-5' onClick={() => editDate(originalIndex)}>
                                    {`${trip.time.split(', ')[0].split('/')[0]}/${trip.time.split(', ')[0].split('/')[1]}`} - {`${(trip && trip !== "'") ? getTripTime(trip) : null}`}
                                </div> 
                                */}

                        </div>
                    </div>
                })
            }
        </div>
    }

    const chartData = useMemo(() => {
        if (!Array.isArray(trips)) return [];
        const rawData = trips.map((trip, idx) => {
            const distance = Number(trip.distance) || 0;
            const gallons = Number(trip.gallons) || 0;
            const cost = Number(trip.totalUSD) || 0;
            const odometerVal = Number(trip.odometer) || 0;
            
            // Calculate MPG based on distance since last Gas stop
            let mpg = null;
            if (gallons > 0 && trip.category === 'Gas') {
                // Find last Gas stop
                let lastGasOdometer = null;
                for (let i = idx - 1; i >= 0; i--) {
                    if (trips[i].category === 'Gas') {
                        lastGasOdometer = Number(trips[i].odometer) || 0;
                        break;
                    }
                }
                
                // Calculate distance since last Gas stop
                const distanceSinceLastGas = lastGasOdometer !== null 
                    ? Math.max(0, odometerVal - lastGasOdometer)
                    : distance;
                
                mpg = gallons > 0 ? Number((distanceSinceLastGas / gallons).toFixed(2)) : null;
            }
            
            const pricePerGallon = gallons > 0 ? Number((cost / gallons).toFixed(2)) : null;

            // Get previous label
            const previousTrip = idx > 0 ? trips[idx - 1] : null;
            const previousLabel = previousTrip ? `${idx}. ${previousTrip.location || 'Stop'}` : null;

            return {
                id: idx + 1,
                tripIndex: idx,
                label: `${idx + 1}. ${trip.location || 'Stop'}`,
                previousLabel,
                odometer: odometerVal,
                distance,
                gallons,
                cost,
                mpg,
                pricePerGallon,
                latitude: trip.latitude,
                longitude: trip.longitude,
                category: trip.category,
            };
        });
        const filtered = filterChartData(rawData);
        return filtered.filter(item => item.gallons > 0);
    }, [trips, filterChartData]);

    const distanceData = useMemo(() => {
        if (!Array.isArray(trips)) return [];
        const rawData = trips.map((trip, idx) => {
            const distance = Number(trip.distance) || 0;
            const gallons = Number(trip.gallons) || 0;
            const cost = Number(trip.totalUSD) || 0;
            const odometerVal = Number(trip.odometer) || 0;
            const mpg = gallons > 0 ? Number((distance / gallons).toFixed(2)) : null;
            const pricePerGallon = gallons > 0 ? Number((cost / gallons).toFixed(2)) : null;

            // Get previous label
            const previousTrip = idx > 0 ? trips[idx - 1] : null;
            const previousLabel = previousTrip ? `${idx}. ${previousTrip.location || 'Stop'}` : null;

            return {
                id: idx + 1,
                tripIndex: idx,
                label: `${idx + 1}. ${trip.location || 'Stop'}`,
                previousLabel,
                odometer: odometerVal,
                distance,
                gallons,
                cost,
                mpg,
                pricePerGallon,
                latitude: trip.latitude,
                longitude: trip.longitude,
                category: trip.category,
            };
        });
        const filtered = filterChartData(rawData);
        // Filter to only Gas stops to match other charts
        const gasOnly = filtered.filter(item => item.gallons > 0);
        // Reindex after filtering to keep IDs sequential
        return gasOnly.map((item, newIdx) => ({
            ...item,
            id: newIdx + 1,
            label: `${newIdx + 1}. ${item.label.split('. ')[1] || 'Stop'}`,
        }));
    }, [trips, filterChartData]);

    const getDistanceSinceLastFuel = (index) => {
        if (index < 0 || index >= trips.length) return 0;

        let cumulativeDistance = Number(trips[index].distance) || 0;

        // Check if previous trip has gallons > 1
        if (index > 0 && Number(trips[index - 1].gallons) > 1) {
            return cumulativeDistance;
        }

        // Otherwise, sum all prior distances with gallons < 2 plus current
        for (let i = index - 1; i >= 0; i--) {
            const gallons = Number(trips[i].gallons);
            if (gallons > 1) break; // Stop at last fuel stop
            cumulativeDistance += Number(trips[i].distance) || 0;
        }

        return cumulativeDistance.toFixed(1);
    };

    const milesBetweenFuelingData = useMemo(() => {
        if (!Array.isArray(trips)) return [];
        const gasTrips = trips.filter(trip => trip.category === 'Gas');
        const rawData = gasTrips.map((trip, idx) => {
            const odometerVal = Number(trip.odometer) || 0;
            const gallons = Number(trip.gallons) || 0;

            // In full history, compute baseline from previous Gas or Start
            const tripIdx = trips.indexOf(trip);
            let previousLabel = null;
            let baselineOdometer = null;
            let baselineIdx = -1;

            if (tripIdx > 0) {
                let foundPrevGas = false;
                for (let i = tripIdx - 1; i >= 0; i--) {
                    if (trips[i].category === 'Gas') {
                        baselineOdometer = Number(trips[i].odometer) || 0;
                        previousLabel = `${idx}. ${trips[i].location || 'Stop'}`;
                        baselineIdx = i;
                        foundPrevGas = true;
                        break;
                    }
                }

                // Fallback: use prior 'Start' if no previous Gas found
                if (!foundPrevGas) {
                    for (let i = tripIdx - 1; i >= 0; i--) {
                        if (trips[i].category === 'Start') {
                            baselineOdometer = Number(trips[i].odometer) || 0;
                            previousLabel = `${idx}. ${trips[i].location || 'Start'}`;
                            baselineIdx = i;
                            break;
                        }
                    }
                }
            }

            // Default label and coords point to current Gas
            let displayLabel = `${idx + 1}. ${trip.location || 'Stop'}`;
            let lat = trip.latitude;
            let lon = trip.longitude;
            let distanceSinceLastFuel = 0;

            if (baselineOdometer !== null) {
                const defaultDistance = Math.max(0, odometerVal - baselineOdometer);
                distanceSinceLastFuel = defaultDistance;

                // If segment exceeds 300 miles, use next End as the segment end
                if (defaultDistance > 300 && baselineIdx >= 0) {
                    for (let j = baselineIdx + 1; j < trips.length; j++) {
                        if (trips[j].category === 'End') {
                            const endOdo = Number(trips[j].odometer) || 0;
                            distanceSinceLastFuel = Math.max(0, endOdo - baselineOdometer);
                            displayLabel = `${idx + 1}. ${trips[j].location || 'End'}`;
                            lat = trips[j].latitude;
                            lon = trips[j].longitude;
                            break;
                        }
                    }
                }
            }

            return {
                id: idx + 1,
                tripIndex: tripIdx,
                label: displayLabel,
                previousLabel,
                odometer: odometerVal,
                distanceSinceLastFuel,
                gallons,
                latitude: lat,
                longitude: lon,
            };
        });
        const filtered = filterChartData(rawData);
        // Reindex after filtering to keep IDs sequential
        return filtered.map((item, newIdx) => ({
            ...item,
            id: newIdx + 1,
            label: `${newIdx + 1}. ${item.label.split('. ')[1] || 'Stop'}`,
        }));
    }, [trips, filterChartData]);

    const renderChartFilters = () => (
        <div className='containerDetail bg-lite mt-5 contentLeft pl-10 pr-10 pb-10'>
            <div className=''>
                <label>
                    <select
                        value={chartFilterMode}
                        onChange={(e) => {
                            setFilterStartDate('');
                            setFilterEndDate('');
                            setFilterSpecificDay('');
                            setChartFilterMode(e.target.value);
                        }}
                        className='containerDetail width--5 color-lite p-10'
                    >
                        <option value='all'>All Data</option>
                        <option value='today'>Today</option>
                        <option value='day'>Specific Day</option>
                        <option value='month'>Current Month</option>
                        <option value='year'>Current Year</option>
                        <option value='range'>Date Range</option>
                    </select>
                </label>
            </div>

            {chartFilterMode === 'day' && (
                <div className='flexContainer mb-10'>
                    <label className='flexContainer containerDetail flex3Column bg-lite'>
                        <div className='columnRightAlign flex2Column'>
                            <span className='inputText'>Select Day:</span>
                        </div>
                        <div className='columnLeftAlign flex2Column'>
                            <input
                                type='date'
                                value={filterSpecificDay}
                                onChange={(e) => setFilterSpecificDay(e.target.value)}
                                className='inputField'
                            />
                        </div>
                    </label>
                </div>
            )}

            {chartFilterMode === 'range' && (
                <div>
                    <div className='flexContainer mb-10'>
                        <label className='flexContainer containerDetail flex3Column bg-lite mr-5'>
                            <div className='columnRightAlign flex2Column'>
                                <span className='inputText'>Start Date:</span>
                            </div>
                            <div className='columnLeftAlign flex2Column'>
                                <input
                                    type='date'
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className='inputField'
                                />
                            </div>
                        </label>
                    </div>
                    <div className='flexContainer mb-10'>
                        <label className='flexContainer containerDetail flex3Column bg-lite'>
                            <div className='columnRightAlign flex2Column'>
                                <span className='inputText'>End Date:</span>
                            </div>
                            <div className='columnLeftAlign flex2Column'>
                                <input
                                    type='date'
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className='inputField'
                                />
                            </div>
                        </label>
                    </div>
                </div>
            )}

            <div className='containerDetail color-lite mt-10 p-10 bg-dkGreen'>
                📊 Showing {chartData.length} record{chartData.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
    const CustomFuelCostTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const gallons = payload.find(p => p.dataKey === 'gallons')?.value || 0;
            const cost = payload.find(p => p.dataKey === 'cost')?.value || 0;
            const currentLabel = payload[0]?.payload?.label;
            const pricePerGallon = gallons > 0 ? (cost / gallons).toFixed(2) : '0.00';
            //console.log(`payload: ${JSON.stringify(payload, null, 2)}`);
            return (
                <div className='containerDetail bg-tintedDark contentLeft' style={{ border: '1px solid #ccc' }}>
                    <div className='containerDetail color-lite pt-10 pb-10'>
                        <span
                            title='map'
                            className='button'
                            onClick={() => window.location = `https://www.google.com/maps?q=${payload[0]?.payload?.latitude},${payload[0]?.payload?.longitude}`}
                        >
                            🌎
                        </span>
                        {currentLabel.split('.')[1]}
                    </div>
                    <div className='containerDetail mt-5 bg-lite'>
                        <div className='p-5' style={{ color: '#4fc3f7' }}>
                            {getDistanceSinceLastFuel(Number(currentLabel.split('.')[0]) - 1)} miles
                        </div>
                        <div className='color-lite p-5' style={{ color: '#ff8c42' }}>
                            ${cost}
                        </div>
                        <div className='color-lite p-5' style={{ color: '#6fd672' }}>
                            {gallons} gallons
                        </div>
                        <div className='color-yellow p-5'>
                            ${pricePerGallon} / gallon
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomMPGTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const mpg = payload.find(p => p.dataKey === 'mpg')?.value || 0;
            const previousLabel = payload[0]?.payload?.previousLabel;
            const currentLabel = payload[0]?.payload?.label;

            return (
                <div className='containerDetail bg-tintedDark contentLeft' style={{ border: '1px solid #ccc' }}>
                    <div className='containerDetail color-lite'>
                        {
                            (previousLabel)
                                ? <div>
                                    {previousLabel.split('.')[1]}
                                    <span className='color-yellow ml-10 mr-5 size30'>→</span>
                                    {currentLabel.split('.')[1]}
                                </div>
                                : <div>
                                    <span
                                        title='map'
                                        className='button'
                                        onClick={() => window.location = `https://www.google.com/maps?q=${payload[0]?.payload?.latitude},${payload[0]?.payload?.longitude}`}
                                    >
                                        🌎
                                    </span>
                                    {currentLabel.split('.')[1]}
                                </div>
                        }
                    </div>
                    <div className='containerDetail bg-lite p-5 mt-10' style={{ color: '#a78bfa' }}>
                        MPG: {mpg}
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomDistanceTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const previousLabel = payload[0]?.payload?.previousLabel;
            const currentLabel = payload[0]?.payload?.label;

            return (
                <div className='containerDetail bg-tintedDark contentLeft' style={{ border: '1px solid #ccc' }}>
                    <div className='containerDetail color-lite'>
                        {
                            (previousLabel)
                                ? <div>
                                    {previousLabel.split('.')[1]}
                                    <span className='color-yellow ml-10 mr-5 size30'>→</span>
                                    {currentLabel.split('.')[1]}
                                </div>
                                : <div>
                                    <span
                                        title='map'
                                        className='button'
                                        onClick={() => window.location = `https://www.google.com/maps?q=${payload[0]?.payload?.latitude},${payload[0]?.payload?.longitude}`}
                                    >
                                        🌎
                                    </span>
                                    {currentLabel.split('.')[1]}
                                </div>
                        }
                    </div>
                    <div className='containerDetail bg-lite mt-10 p-5' style={{ color: '#4fc3f7' }}>
                        {payload[0]?.payload?.distance}<span className='copyright color-yellow ml-5'>miles</span>
                        {/*getDistanceSinceLastFuel(Number(currentLabel.split('.')[0]) - 1)}<span className='copyright color-yellow ml-5'>miles since fueled</span>*/}
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomMilesBetweenFuelingTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const distanceSinceLastFuel = payload.find(p => p.dataKey === 'distanceSinceLastFuel')?.value || 0;
            const previousLabel = payload[0]?.payload?.previousLabel;
            const currentLabel = payload[0]?.payload?.label;

            return (
                <div className='containerDetail bg-tintedDark contentLeft' style={{ border: '1px solid #ccc' }}>
                    <div className='containerDetail color-lite'>
                        {
                            (previousLabel)
                                ? <div>
                                    {previousLabel.split('.')[1]}
                                    <span className='color-yellow ml-10 mr-5 size30'>→</span>
                                    {currentLabel.split('.')[1]}
                                </div>
                                : <div>
                                    <span
                                        title='map'
                                        className='button'
                                        onClick={() => window.location = `https://www.google.com/maps?q=${payload[0]?.payload?.latitude},${payload[0]?.payload?.longitude}`}
                                    >
                                        🌎
                                    </span>
                                    {currentLabel.split('.')[1]}
                                </div>
                        }
                    </div>
                    <div className='containerDetail bg-lite mt-10 p-5' style={{ color: '#ffa500' }}>
                        {distanceSinceLastFuel}<span className='copyright color-yellow ml-5'>miles since last fuel</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomDollarPerGallonTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const pricePerGallon = payload.find(p => p.dataKey === 'pricePerGallon')?.value || 0;
            const currentLabel = payload[0]?.payload?.label;

            return (
                <div className='containerDetail bg-tintedDark contentLeft' style={{ border: '1px solid #ccc' }}>
                    <div className='containerDetail color-white pt-10 pb-10'>
                        <span
                            title='map'
                            className='button'
                            onClick={() => window.location = `https://www.google.com/maps?q=${payload[0]?.payload?.latitude},${payload[0]?.payload?.longitude}`}
                        >
                            🌎
                        </span>
                        {currentLabel.split('.')[1]}
                    </div>
                    <div className='containerDetail mt-5 bg-lite p-5' style={{ color: '#4ade80' }}>
                        ${pricePerGallon}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCharts = () => (
        <div className=''>
            <div className='containerDetail bg-lite mt-5'>
                <div className='containerDetail bg-lite p-10 '>
                    <CollapseToggleButton
                        title={<span className='color-yellow size20'>📈 Fuel Charts</span>}
                        isCollapsed={graphCollapse}
                        setCollapse={setGraphCollapse}
                        align='left'
                    />
                </div>
            </div>
            {graphCollapse ? null : (
                <div className=''>
                    {renderChartFilters()}
                    <div className='mt-5'>
                        <div className='containerDetail bg-lite'>
                            <div className={`containerDetail p-10 bg-lite`}>
                                <CollapseToggleButton
                                    title={<span className='color-yellow size20'>Price per Gallon by Stop</span>}
                                    isCollapsed={pricePerGallonCollapse}
                                    setCollapse={setPricePerGallonCollapse}
                                    align='left'
                                />
                            </div>
                        </div>
                        {
                            (pricePerGallonCollapse)
                                ? null
                                : <div className='containerDetail mt-5 pt-10'>
                                    <ResponsiveContainer width='100%' height={600}>
                                        <LineChart
                                            data={chartData.filter(d => d.gallons > 1)}
                                            margin={{ top: 10, right: 10, bottom: 100, left: -35 }}
                                        >
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis
                                                dataKey='label'
                                                interval={0}
                                                angle={-90}
                                                height={90}
                                                tickMargin={8}
                                                tickLine={false}
                                                tick={{ fontSize: 10, textAnchor: 'end', fill: '#dddddd' }}
                                            />
                                            <YAxis stroke='#4ade80' />
                                            <Tooltip content={<CustomDollarPerGallonTooltip />} />
                                            <Legend />
                                            <Line
                                                type='monotone'
                                                dataKey='pricePerGallon'
                                                stroke='#4ade80'
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: '#4ade80' }}
                                                name='$/Gallon'
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                        }

                    </div>
                    <div className='mt-5'>
                        <div className={`containerDetail bg-lite`}>
                            <div className={`containerDetail p-10 bg-lite`}>
                                <CollapseToggleButton
                                    title={<span className='color-yellow size20'>Miles Traveled</span>}
                                    isCollapsed={milesTraveledCollapse}
                                    setCollapse={setMilesTraveledCollapse}
                                    align='left'
                                />
                            </div>
                        </div>
                        {
                            (milesTraveledCollapse)
                                ? null
                                : <div className='containerDetail mt-5 pt-10'>
                                    <ResponsiveContainer width='100%' height={600}>
                                        <LineChart data={distanceData} margin={{ top: 10, right: 10, bottom: 120, left: -25 }}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis
                                                dataKey='label'
                                                interval={0}
                                                angle={-90}
                                                height={110}
                                                tickMargin={8}
                                                tickLine={false}
                                                tick={{ fontSize: 10, textAnchor: 'end', fill: '#dddddd' }}
                                            />
                                            <YAxis yAxisId='dist' orientation='left' stroke='#4fc3f7' />
                                            <Tooltip content={<CustomDistanceTooltip />} />
                                            <Legend />
                                            <Line yAxisId='dist' type='monotone' dataKey='distance' stroke='#4fc3f7' dot={{ r: 2 }} name='Miles' />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                        }
                    </div>
                    <div className='mt-5'>
                        <div className='containerDetail bg-lite'>
                            <div className={`containerDetail p-10 bg-lite`}>
                                <CollapseToggleButton
                                    title={<span className='color-yellow size20'>Miles Between Fueling</span>}
                                    isCollapsed={milesBetweenFuelingCollapse}
                                    setCollapse={setMilesBetweenFuelingCollapse}
                                    align='left'
                                />
                            </div>
                        </div>
                        {
                            (milesBetweenFuelingCollapse)
                                ? null
                                : <div className='containerDetail mt-5 pt-10'>
                                    <ResponsiveContainer width='100%' height={600}>
                                        <LineChart data={milesBetweenFuelingData} margin={{ top: 10, right: 10, bottom: 120, left: -25 }}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis
                                                dataKey='label'
                                                interval={0}
                                                angle={-90}
                                                height={110}
                                                tickMargin={8}
                                                tickLine={false}
                                                tick={{ fontSize: 10, textAnchor: 'end', fill: '#dddddd' }}
                                            />
                                            <YAxis yAxisId='dist' orientation='left' stroke='#ffa500' />
                                            <Tooltip content={<CustomMilesBetweenFuelingTooltip />} />
                                            <Legend />
                                            <Line yAxisId='dist' type='monotone' dataKey='distanceSinceLastFuel' stroke='#ffa500' dot={{ r: 2 }} name='Miles Since Last Fuel' />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                        }
                    </div>
                    <div className='mt-5'>
                        <div className='containerDetail bg-lite'>
                            <div className={`containerDetail p-10 bg-lite`}>
                                <CollapseToggleButton
                                    title={<span className='color-yellow size20'>Fuel + Cost per Stop</span>}
                                    isCollapsed={costPerStopCollapse}
                                    setCollapse={setCostPerStopCollapse}
                                    align='left'
                                />
                            </div>
                        </div>
                        {
                            (costPerStopCollapse)
                                ? null
                                : <div className='containerDetail mt-5 pt-10'>
                                    <ResponsiveContainer width='100%' height={600}>
                                        <BarChart data={chartData.filter(d => d.gallons > 1)} margin={{ top: 10, right: 5, bottom: 120, left: -30 }}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis
                                                dataKey='label'
                                                interval={0}
                                                angle={-90}
                                                height={110}
                                                tickMargin={8}
                                                tickLine={false}
                                                tick={{ fontSize: 10, textAnchor: 'end', fill: '#dddddd' }}
                                            />
                                            <YAxis stroke='#ff8c42' />
                                            <Tooltip content={<CustomFuelCostTooltip />} />
                                            <Legend />
                                            <Bar dataKey='gallons' stackId='a' fill='#6fd672' name='Gallons' />
                                            <Bar dataKey='cost' stackId='a' fill='#ff8c42' name='Cost (USD)' />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                        }
                    </div>
                    <div className='mt-5'>
                        <div className='containerDetail bg-lite'>
                            <div className={`containerDetail p-10 bg-lite`}>
                                <CollapseToggleButton
                                    title={<span className='color-yellow size20'>MPG Efficiency</span>}
                                    isCollapsed={mfgEfficiencyCollapse}
                                    setCollapse={setMfgEfficiencyCollapse}
                                    align='left'
                                />
                            </div>
                        </div>
                        {
                            (mfgEfficiencyCollapse)
                                ? null
                                : <div className='containerDetail mt-5 pt-10'>
                                    <ResponsiveContainer width='100%' height={600}>
                                        <LineChart data={chartData.filter(d => d.category === 'Gas' && d.mpg !== null && d.mpg > 0)} margin={{ top: 10, right: 10, bottom: 100, left: -35 }}>
                                            <CartesianGrid strokeDasharray='3 3' />
                                            <XAxis
                                                dataKey='label'
                                                interval={0}
                                                angle={-90}
                                                height={90}
                                                tickMargin={8}
                                                tickLine={false}
                                                tick={{ fontSize: 10, textAnchor: 'end', fill: '#dddddd' }}
                                            />
                                            <YAxis stroke='#a78bfa' />
                                            <Tooltip content={<CustomMPGTooltip />} />
                                            <Legend />
                                            <ReferenceLine y={25} stroke='#ff4444' strokeDasharray='3 3' label='25 mpg target' />
                                            <Line type='monotone' dataKey='mpg' stroke='#a78bfa' dot name='MPG' />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                        }
                    </div>
                </div>
            )}
        </div>
    );

    const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const serviceDisplay = (header, collapse, setCollapse, value, setChange, interval, idx) => <div className=''>
                <div className='containerDetail bg-lite'>
                    <CollapseToggleButton
                        title={<div className='flexContainer color-yellow size20'><div className='flex2Column'>{header}</div><div className='flex2Column contentRight'>{(toNum(value) + toNum(interval) - toNum(odometer))} miles</div></div>}
                        isCollapsed={collapse}
                        setCollapse={setCollapse}
                        align='left'
                    />
                </div>
                {
                    (collapse)
                    ? null
                    : <div className='containerDetail mt-5 size20'>
                        <div className=''>
                            <label className='flexContainer containerDetail bg-lite'>
                                <div className='contentRight flex2Column pt-10'>
                                    <span className='inputText'>
                                        Last {header}:
                                    </span>
                                </div>
                                <div className='contentLeft flex3Column'>
                                    <input className='inputField'
                                        id='service'
                                        name='service'
                                        type='number'
                                        value={value}
                                        onChange={(e) => setChange(() => toNum(e.target.value))}
                                    />
                                </div>
                            </label>
                        </div>
                        <div className=''>
                            <div className='flexContainer containerDetail bg-lite mt-5 p-10'>
                                <div className='contentRight flex2Column'>
                                    <span className='inputText'>
                                        Since Last {header}:
                                    </span>
                                </div>
                                <div className='contentLeft flex3Column color-yellow'>
                                    {(toNum(odometer) - toNum(value))} miles
                                </div>
                            </div>
                        </div>
                        <div className=''>
                            <div className='flexContainer containerDetail bg-lite mt-5 p-10'>
                                <div className='contentRight flex2Column'>
                                    <span className='inputText'>
                                        Next {header}:
                                    </span>
                                </div>
                                <div className='contentLeft flex3Column color-yellow'>
                                    {(toNum(value) + toNum(interval))} miles
                                </div>
                            </div>
                        </div>
                        <div className=''>
                            <div className='flexContainer containerDetail bg-lite mt-5 p-10'>
                                <div className='contentRight flex2Column'>
                                    <span className='inputText'>
                                        Last Reading:
                                    </span>
                                </div>
                                <div className='contentLeft flex3Column color-yellow'>
                                    {toNum(odometer)} miles
                                </div>
                            </div>
                        </div>
                        <div className=''>
                            <div className='flexContainer containerDetail bg-lite mt-5 p-10'>
                                <div className='contentRight flex2Column'>
                                    <span className='inputText'>
                                        Until {header}:
                                    </span>
                                </div>
                                <div className='contentLeft flex3Column color-yellow'>
                                    {(toNum(value) + toNum(interval) - toNum(odometer))} miles
                                </div>
                            </div>
                        </div>
                        <div className='contentRight'>
                            <div
                                className='containerDetail p-20 button size35'
                                title='Remove Service'
                                onClick={() => removeService(idx)}
                            >
                                🗑️
                            </div>
                        </div>
                    </div>
                }
            </div>


    return (
        <div className='containerDetail ml-5 mr-5 bg-lite mt--25'>
            <div className='containerDetail bg-lite color-yellow size20 p-20 contentLeft mb-5'>
                <div className='flexContainer'>
                    <div className='flex2Column contentLeft'>
                        <span className='size20 mr-5 mb-5 mt-5'>⛽️</span> Fuel
                    </div>
                    <div className='flexColumn contentRight'>
                        <Geolocator
                            currentPositionExists='false'
                            returnCurrentPosition={updateCurrentLocation}
                        />
                    </div>
                </div>
            </div>
            {
                (categoryDialogOpen)
                    ? renderCategoryDialog()
                    : null
            }
            {
                (editLocationDialog)
                    ? renderEditDialog()
                    : null
            }
            <div className='containerDetail bg-lite'>
                <div className={`containerDetail bg-lite pl-5 pt-5 pb-5 color-yellow button size20 contentLeft`}>
                    <CollapseToggleButton
                        title={<span className='color-yellow size20'>Add Stop</span>}
                        isCollapsed={formCollapse}
                        setCollapse={setFormCollapse}
                        align='left'
                    />
                </div>
                {
                    (formCollapse)
                        ? <div></div>
                        : locationEntry()
                }
            </div>
            <div className={`containerDetail bg-lite mb-5 mt-5`}>
                <div className={`containerDetail bg-lite pl-5 pt-5 pb-5 color-yellow button size20 contentLeft`}>
                    <CollapseToggleButton
                        title={<span className='color-yellow'>Service / Maintenance</span>}
                        isCollapsed={serviceCollapse}
                        setCollapse={setServiceCollapse}
                        align='left'
                    />
                </div>
                {(!serviceCollapse) && (
                    <div
                        className='containerDetail mb-5 p-10 button bg-green width-100-percent color-lite size20 mt-5'
                        onClick={addService}
                    >
                        ➕ Add Service
                    </div>
                )}
                {
                    (!serviceCollapse)
                    ? computedServices.map((service, idx) => (
                        <div key={(serviceDefs && serviceDefs[idx] && serviceDefs[idx].key) || idx} className='containerDetail mb-5 mt-5'>
                            {serviceDisplay(service[0], service[1], service[2], service[3], service[4], service[5], idx)}
                        </div>
                    ))
                    : null
                }
            </div>
            <div className='containerDetail mt-5 bg-lite p-5'>
                <div className='containerDetail p-10 bg-lite'>
                    <CollapseToggleButton
                        title={<span className='color-yellow size20'>Trip Log</span>}
                        isCollapsed={logCollapse}
                        setCollapse={setLogCollapse}
                        align='left'
                    />
                </div>
                {
                    (logCollapse)
                        ? null
                        : displayLog()
                }
            </div>
            <div className='containerDetail bg-lite mt-5'>
                <div className='containerDetail bg-lite p-10'>
                    <CollapseToggleButton
                        title={<span className='color-yellow size20'>Gas Prices</span>}
                        isCollapsed={pricesCollapse}
                        setCollapse={setPricesCollapse}
                        align='left'
                    />
                </div>
                {
                    (pricesCollapse)
                        ? null
                        : <div>
                            <div className='containerDetail mt-5 p-10'>
                                <select
                                    value={pricesSortMode}
                                    onChange={(e) => setPricesSortMode(e.target.value)}
                                    className='containerDetail width--5 color-lite p-10'
                                >
                                    <option value='chronological'>Chronological</option>
                                    <option value='price'>Price</option>
                                    <option value='distance'>Distance</option>
                                </select>
                            </div>
                            <div className='containerDetail p-10 scrollHeight250'>
                                {getBestFuelDeals.map((stop, idx) => (
                                    <div key={idx} className='containerDetail mb-5 color-lite contentLeft pt-10 pb-10 pl-20 pr-10'>
                                        <div
                                            title='map'
                                            className='button'
                                            onClick={() => window.location = `https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`}
                                        >
                                            🌎 {stop.location}
                                        </div>
                                        <div className='color-yellow'>
                                            {stop.distanceFromCurrent} miles away
                                        </div>
                                        <div className='color-yellow'>
                                            ${stop.usdPerGallon}/gal
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                }
            </div>
            <div className='containerDetail bg-lite mt-5'>
                <div className='containerDetail bg-lite p-10'>
                    <CollapseToggleButton
                        title={<span className='color-yellow size20'>Locations</span>}
                        isCollapsed={locationsCollapse}
                        setCollapse={setLocationsCollapse}
                        align='left'
                    />
                </div>
                {
                    (locationsCollapse)
                        ? null
                        : <div className=''>
                            <select
                                value={locationsSortMode}
                                onChange={(e) => setLocationsSortMode(e.target.value)}
                                className='containerDetail width--5 color-lite p-10 mt-5 mb-5'
                            >
                                <option value='chronological'>Chronological</option>
                                <option value='category'>Category</option>
                                <option value='distance'>Distance</option>
                            </select>
                            {
                                (locationsSortMode === 'category')
                                    ? <select
                                        value={locationsCategorySort}
                                        onChange={(e) => setLocationsCategorySort(e.target.value)}
                                        className='containerDetail width--5 color-lite p-10 mb-5 mt--5'
                                    >
                                        {
                                            Object.keys(locationCategories).map((catKey, idx) => (
                                                <option key={idx} value={catKey}>{locationCategories[catKey]} {catKey}</option>
                                            ))
                                        }
                                    </select>
                                    : null
                            }
                            <div className='containerDetail p-10 scrollHeight250'>
                                {getLocations.map((stop, idx) => (
                                    <div key={idx} className='containerDetail flexContainer mb-5 color-lite pt-10 pb-10 pl-20 pr-10'>
                                        <div className='flex2Column contentLeft'>
                                            <div
                                                title='map'
                                                className='button'
                                                onClick={() => editEntry(stop)}
                                            >
                                                {locationCategories[stop.category]} {stop.location}
                                            </div>
                                            <div className='color-yellow'>
                                                {stop.distanceFromCurrent} miles away
                                            </div>
                                            {
                                                (stop.usdPerGallon > 0)
                                                    ? <div className='color-yellow'>
                                                        ${stop.usdPerGallon}/gal
                                                    </div>
                                                    : null
                                            }
                                            {
                                                (stop.costFee > 0)
                                                    ? <div className='color-yellow'>
                                                        ${stop.costFee}
                                                    </div>
                                                    : null
                                            }
                                            {
                                                (stop.rating > 0)
                                                    ? <div className='color-yellow'>
                                                        {'⭐'.repeat(stop.rating)}
                                                    </div>
                                                    : null
                                            }
                                        </div>
                                        <div
                                            className='flexColumn p-10 button'
                                            onClick={() => window.location = `https://www.google.com/maps?q=${stop.latitude},${stop.longitude}`}
                                        >
                                            🌎
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                }
            </div>
            {renderCharts()}
        </div>
    );
};

export default Fuel;