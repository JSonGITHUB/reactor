import React, { useEffect, useMemo, useState } from 'react';
import CollapseToggleButton from './CollapseToggleButton';
import icons from '../site/icons';

const CAMP_PROFILE_KEY = 'campTripProfile';
const CAMP_PACK_KEY = 'campPackProgress';
const CAMP_CHECKLIST_KEY = 'campChecklistProgress';
const CAMP_PLAN_KEY = 'campPlanNotes';

const initialCampPackItems = [
    { id: 'tent', icon: '⛺️', label: 'Tent', category: 'Shelter', baseQty: 1, perPerson: false },
    { id: 'sleeping-bag', icon: '🛏️', label: 'Sleeping Bag', category: 'Sleep', baseQty: 1, perPerson: true },
    { id: 'sleep-pad', icon: '🧩', label: 'Sleeping Pad', category: 'Sleep', baseQty: 1, perPerson: true },
    { id: 'water-jug', icon: '🚰', label: 'Water Containers', category: 'Water', baseQty: 1, perPerson: false },
    { id: 'stove', icon: '🔥', label: 'Camp Stove', category: 'Cooking', baseQty: 1, perPerson: false },
    { id: 'fuel', icon: '🛢️', label: 'Fuel Canisters', category: 'Cooking', baseQty: 1, perPerson: false },
    { id: 'cooler', icon: '🧊', label: 'Cooler', category: 'Food', baseQty: 1, perPerson: false },
    { id: 'headlamp', icon: '🔦', label: 'Headlamp', category: 'Lighting', baseQty: 1, perPerson: true },
    { id: 'first-aid', icon: '🩹', label: 'First Aid Kit', category: 'Safety', baseQty: 1, perPerson: false },
    { id: 'layers', icon: '🧥', label: 'Warm Layers', category: 'Clothing', baseQty: 1, perPerson: true },
    { id: 'rain', icon: '🌧️', label: 'Rain Gear', category: 'Clothing', baseQty: 1, perPerson: true },
    { id: 'map', icon: '🗺️', label: 'Map / Offline Navigation', category: 'Navigation', baseQty: 1, perPerson: false },
    { id: 'power', icon: '🔋', label: 'Battery Bank', category: 'Power', baseQty: 1, perPerson: false },
    { id: 'trash', icon: '🧹', label: 'Trash + Cleanup Supplies', category: 'Leave No Trace', baseQty: 1, perPerson: false }
];

const defaultChecklist = {
    preTrip: [
        'Reserve campsite / permits',
        'Review weather + road conditions',
        'Vehicle check (tires, fuel, fluids)',
        'Share itinerary with trusted contact',
        'Confirm route and backup route',
    ],
    setup: [
        'Pitch shelter before dark',
        'Set kitchen and safe food zone',
        'Set water system + purification',
        'Review camp rules and fire policy',
    ],
    breakdown: [
        'Extinguish fire completely',
        'Pack all waste and food scraps',
        'Final gear sweep',
        'Leave site cleaner than found',
    ],
};

const defaultProfile = {
    tripName: 'Weekend Camp Trip',
    destination: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    travelers: 2,
    vehicles: 1,
    oneWayMiles: 120,
    mpg: 24,
    fuelPrice: 4.5,
    supplyAccess: 'limited',
    maxNoSupplyDays: 2,
    waterLitersPerPersonPerDay: 4,
    mealsPerPersonPerDay: 3,
    nearestTown: '',
    emergencyContact: '',
    notes: '',
};

const defaultPlanNotes = {
    before: 'Pack by category and verify road conditions 24h before departure.',
    during: 'Check weather morning/evening, log fuel and water consumption daily.',
    after: 'Restock used items and update checklist for next trip.',
};

const parseJson = (value, fallback) => {
    try {
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch (error) {
        return fallback;
    }
};

const CAMP_PACK_ITEMS_KEY = 'campPackItems';
const CAMP_COLLAPSE_KEY = 'campCollapseState';
const CAMP_PACK_FILTER_KEY = 'campPackFilter';

const Camp = () => {
    // Collapsed state persistence
    const [collapseState, setCollapseState] = useState(() => {
        const stored = localStorage.getItem(CAMP_COLLAPSE_KEY);
        return stored ? JSON.parse(stored) : {
            tripProfileCollapsed: true,
            travelPlanCollapsed: true,
            packBuilderCollapsed: true,
            checklistsCollapsed: true,
            foodWaterCollapsed: true,
            itineraryCollapsed: true,
            safetyCollapsed: true,
        };
    });
    const setCollapsed = (key, valueOrUpdater) =>
        setCollapseState(prev => {
            const value = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev[key]) : valueOrUpdater;
            const next = { ...prev, [key]: value };
            localStorage.setItem(CAMP_COLLAPSE_KEY, JSON.stringify(next));
            return next;
        });

    const [profile, setProfile] = useState(defaultProfile);
    // Persist added pack items
    const [campPackItems, setCampPackItems] = useState(() => {
        const stored = localStorage.getItem(CAMP_PACK_ITEMS_KEY);
        return stored ? JSON.parse(stored) : initialCampPackItems;
    });
    const [packedById, setPackedById] = useState({});
    const [qtyById, setQtyById] = useState({});
    // Persist pack filter
    const [packFilter, setPackFilter] = useState(() => {
        const stored = localStorage.getItem(CAMP_PACK_FILTER_KEY);
        return stored || 'all';
    });
    const [showAddItemDialog, setShowAddItemDialog] = useState(false);
    const [showEditItemDialog, setShowEditItemDialog] = useState(false);
    const [editItemIndex, setEditItemIndex] = useState(null);
    const [newItem, setNewItem] = useState({
        label: '',
        icon: '',
        category: '',
        baseQty: 1,
        perPerson: false,
    });
    const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
    const [newCategory, setNewCategory] = useState('');
                // Add Category dialog logic
                const handleAddCategoryOpen = () => {
                    setNewCategory('');
                    setShowAddCategoryDialog(true);
                };

                const handleAddCategorySubmit = (e) => {
                    e.preventDefault();
                    if (!newCategory.trim()) return;
                    // Add a dummy item to ensure the category appears in the filter
                    setCampPackItems(prev => ([...prev, {
                        id: 'cat-' + newCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 7),
                        icon: '',
                        label: '(New Category)',
                        category: newCategory,
                        baseQty: 0,
                        perPerson: false,
                        isCategoryOnly: true,
                    }]));
                    setShowAddCategoryDialog(false);
                    setPackFilter(newCategory);
                };

                const handleAddCategoryCancel = () => {
                    setShowAddCategoryDialog(false);
                };
            // Persist campPackItems
            useEffect(() => {
                localStorage.setItem(CAMP_PACK_ITEMS_KEY, JSON.stringify(campPackItems));
            }, [campPackItems]);

            // Persist packFilter
            useEffect(() => {
                localStorage.setItem(CAMP_PACK_FILTER_KEY, packFilter);
            }, [packFilter]);

            // Persist collapseState
            useEffect(() => {
                localStorage.setItem(CAMP_COLLAPSE_KEY, JSON.stringify(collapseState));
            }, [collapseState]);
        // Edit Item dialog logic
        const handleEditItemOpen = (item, idx) => {
            setEditItemIndex(idx);
            setNewItem({
                label: item.label,
                icon: item.icon,
                category: item.category,
                baseQty: item.baseQty,
                perPerson: !!item.perPerson,
            });
            setShowEditItemDialog(true);
        };

        const handleEditItemSubmit = (e) => {
            e.preventDefault();
            if (!newItem.label || !newItem.category || editItemIndex === null) return;
            setCampPackItems((prev) => prev.map((item, idx) => idx === editItemIndex ? {
                ...item,
                label: newItem.label,
                icon: newItem.icon || '➕',
                category: newItem.category,
                baseQty: Math.max(1, Number(newItem.baseQty) || 1),
                perPerson: !!newItem.perPerson,
            } : item));
            setShowEditItemDialog(false);
            setEditItemIndex(null);
        };

        const handleEditItemCancel = () => {
            setShowEditItemDialog(false);
            setEditItemIndex(null);
        };

        const handleDeleteItem = (idx) => {
            setCampPackItems((prev) => prev.filter((_, i) => i !== idx));
        };
    const CHECKLIST_ITEMS_KEY = 'campChecklistItems';
    const [checklistItems, setChecklistItems] = useState(() => {
        const stored = localStorage.getItem(CHECKLIST_ITEMS_KEY);
        return stored ? JSON.parse(stored) : defaultChecklist;
    });
    const [checklistProgressById, setChecklistProgressById] = useState({});
    const [showChecklistDialog, setShowChecklistDialog] = useState(false);
    const [checklistDialogSection, setChecklistDialogSection] = useState('');
    const [checklistDialogValue, setChecklistDialogValue] = useState('');
    const [editChecklistIndex, setEditChecklistIndex] = useState(null);
        // Persist checklist items
        useEffect(() => {
            localStorage.setItem(CHECKLIST_ITEMS_KEY, JSON.stringify(checklistItems));
        }, [checklistItems]);
    const [planNotes, setPlanNotes] = useState(defaultPlanNotes);

    useEffect(() => {
        const storedProfile = localStorage.getItem(CAMP_PROFILE_KEY);
        const storedPack = localStorage.getItem(CAMP_PACK_KEY);
        const storedChecklist = localStorage.getItem(CAMP_CHECKLIST_KEY);
        const storedPlan = localStorage.getItem(CAMP_PLAN_KEY);

        if (storedProfile) {
            const parsed = parseJson(storedProfile, defaultProfile);
            setProfile({ ...defaultProfile, ...parsed });
        }

        if (storedPack) {
            const parsed = parseJson(storedPack, {});
            if (parsed && typeof parsed === 'object') {
                setPackedById(parsed.packedById && typeof parsed.packedById === 'object' ? parsed.packedById : {});
                setQtyById(parsed.qtyById && typeof parsed.qtyById === 'object' ? parsed.qtyById : {});
            }
        }

        if (storedChecklist) {
            const parsed = parseJson(storedChecklist, {});
            if (parsed && typeof parsed === 'object') setChecklistProgressById(parsed);
        }

        if (storedPlan) {
            const parsed = parseJson(storedPlan, defaultPlanNotes);
            setPlanNotes({ ...defaultPlanNotes, ...parsed });
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CAMP_PROFILE_KEY, JSON.stringify(profile));
    }, [profile]);

    useEffect(() => {
        localStorage.setItem(CAMP_PACK_KEY, JSON.stringify({ packedById, qtyById }));
    }, [packedById, qtyById]);

    useEffect(() => {
        localStorage.setItem(CAMP_CHECKLIST_KEY, JSON.stringify(checklistProgressById));
    }, [checklistProgressById]);

    useEffect(() => {
        localStorage.setItem(CAMP_PLAN_KEY, JSON.stringify(planNotes));
    }, [planNotes]);

    const nights = useMemo(() => {
        const start = new Date(profile.startDate);
        const end = new Date(profile.endDate);
        const diffMs = end.getTime() - start.getTime();
        if (!Number.isFinite(diffMs) || diffMs < 0) return 0;
        return Math.max(0, Math.round(diffMs / (24 * 60 * 60 * 1000)));
    }, [profile.startDate, profile.endDate]);

    const roundTripMiles = useMemo(() => {
        const oneWay = Number(profile.oneWayMiles) || 0;
        return Math.max(0, oneWay * 2);
    }, [profile.oneWayMiles]);

    const estimatedFuelGallons = useMemo(() => {
        const mpg = Math.max(1, Number(profile.mpg) || 1);
        return roundTripMiles / mpg;
    }, [profile.mpg, roundTripMiles]);

    const estimatedFuelCost = useMemo(() => {
        const gasPrice = Math.max(0, Number(profile.fuelPrice) || 0);
        return estimatedFuelGallons * gasPrice;
    }, [estimatedFuelGallons, profile.fuelPrice]);

    const totalTripDays = useMemo(() => Math.max(1, nights + 1), [nights]);

    // Conversion constant
    const LITERS_TO_GALLONS = 0.264172;
    const waterRecommendation = useMemo(() => {
        const people = Math.max(1, Number(profile.travelers) || 1);
        const litersPerPersonPerDay = Math.max(1, Number(profile.waterLitersPerPersonPerDay) || 1);
        return people * litersPerPersonPerDay * totalTripDays;
    }, [profile.travelers, profile.waterLitersPerPersonPerDay, totalTripDays]);
    const waterLitersPerPersonPerDayGallons = useMemo(() => (Number(profile.waterLitersPerPersonPerDay) * LITERS_TO_GALLONS).toFixed(2), [profile.waterLitersPerPersonPerDay]);
    const waterRecommendationGallons = useMemo(() => (waterRecommendation * LITERS_TO_GALLONS).toFixed(1), [waterRecommendation]);

    const mealsRecommendation = useMemo(() => {
        const people = Math.max(1, Number(profile.travelers) || 1);
        const mealsPerPersonPerDay = Math.max(1, Number(profile.mealsPerPersonPerDay) || 1);
        return people * mealsPerPersonPerDay * totalTripDays;
    }, [profile.travelers, profile.mealsPerPersonPerDay, totalTripDays]);

    const supplyRisk = useMemo(() => {
        const maxNoSupplyDays = Math.max(1, Number(profile.maxNoSupplyDays) || 1);
        if (profile.supplyAccess === 'full') return 'Low';
        if (profile.supplyAccess === 'limited' && maxNoSupplyDays <= 2) return 'Moderate';
        return 'High';
    }, [profile.supplyAccess, profile.maxNoSupplyDays]);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(campPackItems.map((item) => item.category)));
        return ['all', ...unique];
    }, [campPackItems]);

    // Filter out dummy category-only items from display
    const visiblePackItems = useMemo(() => campPackItems.filter(item => !item.isCategoryOnly), [campPackItems]);
    const filteredPackItems = useMemo(() => {
        if (packFilter === 'all') return visiblePackItems;
        return visiblePackItems.filter((item) => item.category === packFilter);
    }, [packFilter, visiblePackItems]);

    const getRecommendedQty = (item) => {
        const baseQty = Number(item?.baseQty || 1);
        const people = Math.max(1, Number(profile.travelers) || 1);
        return item?.perPerson ? Math.max(1, baseQty * people) : Math.max(1, baseQty);
    };

    const getCurrentQty = (item) => {
        const custom = Number(qtyById[item.id]);
        if (Number.isInteger(custom) && custom > 0) return custom;
        return getRecommendedQty(item);
    };

    const adjustQty = (itemId, nextQty) => {
        const safeQty = Math.max(1, Number(nextQty) || 1);
        setQtyById((prev) => ({ ...prev, [itemId]: safeQty }));
    };

    const packProgress = useMemo(() => {
        const total = filteredPackItems.length;
        if (total < 1) return { packed: 0, total: 0, percent: 0 };
        const packed = filteredPackItems.filter((item) => packedById[item.id]).length;
        return {
            packed,
            total,
            percent: Math.round((packed / total) * 100),
        };
    }, [filteredPackItems, packedById]);

    const totalChecklistItems = useMemo(() => {
        return Object.values(checklistItems).reduce((sum, list) => sum + list.length, 0);
    }, [checklistItems]);

    const completedChecklistItems = useMemo(() => {
        return Object.values(checklistProgressById).filter(Boolean).length;
    }, [checklistProgressById]);

    const checklistPercent = totalChecklistItems > 0
        ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
        : 0;

    const updateProfileField = (field, value) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
    };

    const toggleChecklistItem = (id) => {
        setChecklistProgressById((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Add Item dialog logic
    const handleAddItemOpen = () => {
        setNewItem({
            label: '',
            icon: '',
            category: packFilter === 'all' ? '' : packFilter,
            baseQty: 1,
            perPerson: false,
        });
        setShowAddItemDialog(true);
    };

    const handleAddItemChange = (field, value) => {
        setNewItem((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddItemSubmit = (e) => {
        e.preventDefault();
        if (!newItem.label || !newItem.category) return;
        const id = newItem.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).slice(2, 7);
        setCampPackItems((prev) => [
            ...prev,
            {
                id,
                icon: newItem.icon || '➕',
                label: newItem.label,
                category: newItem.category,
                baseQty: Math.max(1, Number(newItem.baseQty) || 1),
                perPerson: !!newItem.perPerson,
            },
        ]);
        setShowAddItemDialog(false);
    };

    const handleAddItemCancel = () => {
        setShowAddItemDialog(false);
    };

    return (
        <div className='containerDetail mt--30 contentLeft bg-lite ml-5 mr-5 mt--25'>
            <div className='containerDetail bg-lite pl-15 pt-20 pb-20 color-yellow size25 mb-5'>
                <span className='mr-5'>{icons.camp || '⛺️'}</span>
                Camp
            </div>

            <div className={`containerDetail mt-5 color-lite size20 ${!collapseState.tripProfileCollapsed ? 'bg-dkGreen' : 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Trip Profile'
                        isCollapsed={collapseState.tripProfileCollapsed}
                        setCollapse={v => setCollapsed('tripProfileCollapsed', v)}
                        align='left'
                    />
                </div>
                {collapseState.tripProfileCollapsed ? null : (
                    <div className='containerDetail bg-lite mt-5 p-10'>
                        <>
                        <input className='containerDetail m-5 color-lite width--10' value={profile.tripName} onChange={(e) => updateProfileField('tripName', e.target.value)} placeholder='Trip name' />
                        <input className='containerDetail m-5 color-lite width--10' value={profile.destination} onChange={(e) => updateProfileField('destination', e.target.value)} placeholder='Destination / campground' />
                        <div className='containerDetail bg-tinted p-10'>
                            <div className='color-yellow size20'>
                                Progress: <span className='color-lite'>{packProgress.packed}/{packProgress.total}</span> packed ({packProgress.percent}%)
                            </div>
                            <div className='mt-10'>
                                <select className='containerDetail mt-5 color-lite width-100-percent' value={packFilter} onChange={(e) => setPackFilter(e.target.value)}>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category === 'all' ? 'All' : category}</option>
                                    ))}
                                </select>
                                <div 
                                    className='button containerDetail bg-green p-10 mt-5 w--5' 
                                    onClick={() => { setPackedById({}); setQtyById({}); }}
                                >
                                    Reset Builder
                                </div>
                                <div 
                                    className='button containerDetail bg-orange color-dark p-10 mt-5' 
                                    onClick={() => setPackedById({})}
                                >
                                    Reset Checkboxes
                                </div>
                                <div 
                                    className='button containerDetail bg-blue p-10 mt-5' 
                                    onClick={handleAddItemOpen}
                                >
                                    <span role='img' aria-label='add'>➕</span> Add Item
                                </div>
                            </div>
                        </div>
                        <div className='containerDetail m-5 p-10 color-yellow'>
                            Vehicles
                            <input 
                                type='number' 
                                min='1' 
                                className='containerDetail color-lite mt-10 mb-5 width-100-percent' 
                                value={profile.vehicles} onChange={(e) => updateProfileField('vehicles', Math.max(1, Number(e.target.value) || 1))} 
                            />
                        </div>
                        <textarea 
                            className='containerDetail m-5 color-lite width--10' 
                            rows='3' 
                            value={profile.notes} 
                            onChange={(e) => updateProfileField('notes', e.target.value)} 
                            placeholder='Trip notes, permits, gate codes, meetup details...' 
                        />
                        <div className='containerDetail m-5 bg-dark color-yellow p-10 mt-5'>
                            {profile.tripName} • {totalTripDays} day trip ({nights} night{nights === 1 ? '' : 's'})
                        </div>
                        </>
                    </div>
                )}
            </div>

            <div className={`containerDetail mt-5 color-lite size20 ${!collapseState.travelPlanCollapsed ? 'bg-dkGreen' : 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Travel and Resupply Plan'
                        isCollapsed={collapseState.travelPlanCollapsed}
                        setCollapse={v => setCollapsed('travelPlanCollapsed', v)}
                        align='left'
                    />
                </div>
                {collapseState.travelPlanCollapsed ? null : (
                    <div className='containerDetail bg-lite mt-5 p-10'>
                        <div className='containerDetail m-5 p-10 color-yellow'>
                            One-way miles
                            <input
                                type='number'
                                min='0'
                                className='containerDetail color-lite w-100 mt-5 mb-5 ml-10'
                                value={profile.oneWayMiles} onChange={(e) => updateProfileField('oneWayMiles', Math.max(0, Number(e.target.value) || 0))}
                            />
                        </div>
                        
                        <div className='containerDetail m-5 p-10 color-yellow'>
                            MPG
                            <input
                                type='number'
                                min='1'
                                className='containerDetail color-lite w-100 mt-5 mb-5 ml-10'
                                value={profile.mpg} onChange={(e) => updateProfileField('mpg', Math.max(1, Number(e.target.value) || 1))}
                            />
                        </div>
                        <div className='containerDetail m-5 p-10 color-yellow'>
                            Fuel $/gal
                            <input
                                type='number'
                                min='0'
                                step='0.01'
                                className='containerDetail color-lite w-100 mt-5 mb-5 ml-10'
                                value={profile.fuelPrice} onChange={(e) => updateProfileField('fuelPrice', Math.max(0, Number(e.target.value) || 0))}
                            />
                        </div>

                        <div className='containerDetail m-5 mt-5 p-10 bg-tinted'>
                            <div className='color-yellow'>
                                Driving Estimate
                            </div>
                            <div className='color-lite size15 mt-5'>
                                Round-trip miles: {roundTripMiles.toFixed(0)} mi
                            </div>
                            <div className='color-lite size15'>
                                Fuel needed: {estimatedFuelGallons.toFixed(1)} gal
                            </div>
                            <div className='color-orange size15'>
                                Estimated fuel cost: ${estimatedFuelCost.toFixed(2)}
                            </div>
                        </div>

                        <div className='containerDetail m-5 mt-5 p-10 bg-tinted'>
                            <div className='color-yellow'>
                                Supply Access
                            </div>
                            <div className='mt-5'>
                                <select
                                    className='containerDetail m-5 color-lite width--10'
                                    value={profile.supplyAccess}
                                    onChange={(e) => updateProfileField('supplyAccess', e.target.value)}
                                >
                                    <option value='none'>No nearby supplies</option>
                                    <option value='limited'>Limited supplies</option>
                                    <option value='full'>Full supply access</option>
                                </select>
                                <div className='containerDetail m-5 p-10 color-yellow'>
                                    Max days without supplies
                                    <input
                                        type='number'
                                        min='1'
                                        className='containerDetail mt-10 color-lite w-100'
                                        value={profile.maxNoSupplyDays}
                                        onChange={(e) => updateProfileField('maxNoSupplyDays', Math.max(1, Number(e.target.value) || 1))}
                                    />
                                </div>
                            </div>
                            <div className='color-orange size15 mt-5'>Resupply risk: {supplyRisk}</div>
                            <input
                                className='containerDetail m-5 color-lite width--10 mt-5'
                                value={profile.nearestTown}
                                onChange={(e) => updateProfileField('nearestTown', e.target.value)}
                                placeholder='Nearest town / supply stop'
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className={`containerDetail mt-5 color-lite size20 ${!collapseState.packBuilderCollapsed ? 'bg-dkGreen' : 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Camp Pack Builder'
                        isCollapsed={collapseState.packBuilderCollapsed}
                        setCollapse={v => setCollapsed('packBuilderCollapsed', v)}
                        align='left'
                    />
                </div>
                {collapseState.packBuilderCollapsed ? null : (
                    <div className='containerDetail bg-lite mt-5'>
                        <div className='containerDetail bg-tinted p-10'>
                            <div className='color-yellow size20 p-10'>
                                Progress: <span className='color-lite'>{packProgress.packed}/{packProgress.total}</span> packed ({packProgress.percent}%)
                            </div>
                                <select className='containerDetail mt-5 color-lite width-100-percent' value={packFilter} onChange={(e) => setPackFilter(e.target.value)}>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category === 'all' ? 'All' : category}</option>
                                    ))}
                                </select>
                                <div 
                                    className='button containerDetail bg-blue p-10 mt-5' 
                                    onClick={handleAddCategoryOpen}
                                >
                                    <span role='img' aria-label='add'>➕</span> Add Category
                                </div>
                                                    {showAddCategoryDialog && (
                                                        <div className='containerDetail'>
                                                            <div className='containerDetail bg-dark p-10 fixed t-50 brdr-green width--60' style={{ margin: '50px -5px', zIndex: 1000 }}>
                                                                <form onSubmit={handleAddCategorySubmit}>
                                                                    <div className='color-yellow size20 p-10 mb-10'>Add Category</div>
                                                                    <div className='mb-10'>
                                                                        <div className='p-10'>
                                                                            <label className='color-lite'>Category Name</label>
                                                                        </div>
                                                                        <input
                                                                            className='containerDetail ml-5 mb-10 color-lite width--5'
                                                                            value={newCategory}
                                                                            onChange={e => setNewCategory(e.target.value)}
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className='containerDetail flexContainer mt-10'>
                                                                        <button type='submit' className='button bg-green color-lite p-10 mr-10 flex2Column m-5'>Add</button>
                                                                        <button type='button' className='button bg-yellow color-dark p-10 flex2Column m-5' onClick={handleAddCategoryCancel}>Cancel</button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                            <div className='dialog-backdrop' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 999 }} onClick={handleAddCategoryCancel}></div>
                                                        </div>
                                                    )}
                                <div 
                                    className='button containerDetail bg-green p-10 mt-5 w--5' 
                                    onClick={() => { setPackedById({}); setQtyById({}); }}
                                >
                                    Reset Builder
                                </div>
                                <div 
                                    className='button containerDetail bg-blue p-10 mt-5' 
                                    onClick={handleAddItemOpen}
                                >
                                    <span role='img' aria-label='add'>➕</span> Add Item
                                </div>
                        </div>

                        {showAddItemDialog && (
                            <div className=''>
                                <div className='containerDetail t-50 dialog-content fixed bg-dark width--40 p-20 brdr-green' style={{ maxWidth: 400, margin: '40px auto', zIndex: 1000 }}>
                                    <form onSubmit={handleAddItemSubmit}>
                                        <div className='color-yellow size20 mb-10'>Add Pack Item</div>
                                        <div className='mb-10'>
                                            <label className='color-lite'>Label</label>
                                            <div>
                                            <input
                                                className='containerDetail mt-10 color-lite width-100-percent'
                                                value={newItem.label}
                                                onChange={e => handleAddItemChange('label', e.target.value)}
                                                required
                                            />
                                            </div>
                                        </div>
                                        <div className='mb-10'>
                                            <label className='color-lite'>Icon (emoji or text)</label>
                                            <input
                                                className='containerDetail mt-10 color-lite width-100-percent'
                                                value={newItem.icon}
                                                onChange={e => handleAddItemChange('icon', e.target.value)}
                                                maxLength={2}
                                            />
                                        </div>
                                        <div className='mb-10'>
                                            <label className='color-lite'>Category</label>
                                            <select
                                                className='containerDetail mt-10 color-lite width-100-percent'
                                                value={newItem.category}
                                                onChange={e => handleAddItemChange('category', e.target.value)}
                                                required
                                            >
                                                <option value='' disabled>Select category</option>
                                                {categories.filter(c => c !== 'all').map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className='mb-10'>
                                            <label className='color-lite'>Base Qty</label>
                                            <input
                                                type='number'
                                                min='1'
                                                className='containerDetail mt-5 color-lite width-100-percent'
                                                value={newItem.baseQty}
                                                onChange={e => handleAddItemChange('baseQty', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className='mb-10'>
                                            <label className='color-lite mt-10 mr-10'>Per Person</label>
                                            <input
                                                type='checkbox'
                                                checked={!!newItem.perPerson}
                                                onChange={e => handleAddItemChange('perPerson', e.target.checked)}
                                                style={{ margin: 10, width: 50, height: 50 }}
                                            />
                                        </div>
                                        <div className='containerDetail flexContainer mt-20'>
                                            <button type='submit' className='flex2Column button bg-green color-lite p-10 ml--5'>
                                                Add
                                            </button>
                                            <button type='button' className='flex2Column button bg-yellow color-dark p-10 mr--5' onClick={handleAddItemCancel}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <div className='dialog-backdrop' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 999 }} onClick={handleAddItemCancel}></div>
                            </div>
                        )}

                        <div className='containerDetail mt-5 ht-400'>
                            {filteredPackItems.map((item) => {
                                const recommendedQty = getRecommendedQty(item);
                                const currentQty = getCurrentQty(item);
                                const isPacked = Boolean(packedById[item.id]);
                                // Find the index in campPackItems for edit/delete
                                const idx = campPackItems.findIndex(i => i.id === item.id);

                                return (
                                    <div key={item.id} className='containerDetail m-5 mt-5'>
                                        <div className='containerDetail m-5 flexContainer bg-lite'>
                                            <label className={`flexColumn`}>
                                                <input
                                                    type='checkbox'
                                                    checked={isPacked}
                                                    onChange={() => setPackedById((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                    aria-label={`Mark ${item.label} packed`}
                                                    style={{ margin: 10, width: 40, height: 40, accentColor: isPacked ? '#4CAF50' : '#ccc' }}
                                                />
                                            </label>
                                            <div className='flex2Column ml-5'>
                                                <div className='flexContainer'>
                                                    <div className='flex2Column ml-5'>
                                                        <div className='color-yellow'>
                                                            {item.icon}{item.label}
                                                        </div>
                                                        <div className='color-orange size12'>
                                                            {item.category} | Recommended: {recommendedQty}
                                                        </div>
                                                        <div className='flexContainer contentCenter'>
                                                            <div className='flexColumn color-lite'>
                                                                Qty:
                                                            </div>
                                                            <div 
                                                                className='flex4Column button containerDetail m-5 bg-lite p-10 mr-5' 
                                                                onClick={() => adjustQty(item.id, currentQty - 1)}
                                                            >
                                                                -
                                                            </div>
                                                            <div 
                                                                className='flex4Column containerDetail m-5 bg-dark p-10 mr-5 color-yellow'
                                                            >
                                                                {currentQty}
                                                            </div>
                                                            <div 
                                                                className='flex4Column button containerDetail m-5 bg-lite p-10' 
                                                                onClick={() => adjustQty(item.id, currentQty + 1)}
                                                            >
                                                                +
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flexColumn w-50'>
                                                <button 
                                                    className='containerDetail button p-10 color-lite p-5' 
                                                    onClick={() => handleEditItemOpen(item, idx)} 
                                                    type='button'
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className='containerDetail button p-10 color-lite p-5 mt-5' 
                                                    onClick={() => handleDeleteItem(idx)} 
                                                    type='button'
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                                            {showEditItemDialog && (
                                                <div className='containerDetail'>
                                                    <div className='containerDetail bg-dark p-20 brdr-green fixed t-50 width--50' style={{ margin: '40px auto', zIndex: 1000 }}>
                                                        <form onSubmit={handleEditItemSubmit}>
                                                            <div className='color-yellow size20 mb-10'>Edit Pack Item</div>
                                                            <div className='mb-10'>
                                                                <label className='color-lite'>Label</label>
                                                                <input
                                                                    className='containerDetail m-5 color-lite w-100'
                                                                    value={newItem.label}
                                                                    onChange={e => handleAddItemChange('label', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className='mb-10'>
                                                                <label className='color-lite'>Icon (emoji or text)</label>
                                                                <input
                                                                    className='containerDetail m-5 color-lite w-100'
                                                                    value={newItem.icon}
                                                                    onChange={e => handleAddItemChange('icon', e.target.value)}
                                                                    maxLength={2}
                                                                />
                                                            </div>
                                                            <div className='mb-10'>
                                                                <label className='color-lite'>Category</label>
                                                                <select
                                                                    className='containerDetail m-5 color-lite w-100'
                                                                    value={newItem.category}
                                                                    onChange={e => handleAddItemChange('category', e.target.value)}
                                                                    required
                                                                >
                                                                    <option value='' disabled>Select category</option>
                                                                    {categories.filter(c => c !== 'all').map(category => (
                                                                        <option key={category} value={category}>{category}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className='mb-10'>
                                                                <label className='color-lite'>Base Qty</label>
                                                                <input
                                                                    type='number'
                                                                    min='1'
                                                                    className='containerDetail m-5 color-lite w-100'
                                                                    value={newItem.baseQty}
                                                                    onChange={e => handleAddItemChange('baseQty', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className='mb-10'>
                                                                <label className='color-lite'>Per Person</label>
                                                                <input
                                                                    type='checkbox'
                                                                    checked={!!newItem.perPerson}
                                                                    onChange={e => handleAddItemChange('perPerson', e.target.checked)}
                                                                    style={{ margin: 10, width: 50, height: 50 }}
                                                                />
                                                            </div>
                                                            <div className='flexContainer mt-10'>
                                                                <button type='submit' className='button bg-green color-lite p-10 mr-10'>Save</button>
                                                                <button type='button' className='button bg-dark color-lite p-10' onClick={handleEditItemCancel}>Cancel</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className='dialog-backdrop' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 999 }} onClick={handleEditItemCancel}></div>
                                                </div>
                                            )}
                    </div>
                )}
            </div>

            <div className={`containerDetail mt-5 color-lite size20 ${!collapseState.checklistsCollapsed ? 'bg-dkGreen' : 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Trip Checklists'
                        isCollapsed={collapseState.checklistsCollapsed}
                        setCollapse={v => setCollapsed('checklistsCollapsed', v)}
                        align='left'
                    />
                </div>
                {collapseState.checklistsCollapsed ? null : (
                    <div className='containerDetail bg-lite mt-5 p-10'>
                        <div className='containerDetail m-5 bg-dark color-yellow p-10 flexContainer'>
                            <span>Checklist Progress: {completedChecklistItems}/{totalChecklistItems} ({checklistPercent}%)</span>
                            <button className='button bg-orange color-dark ml-10' style={{fontSize:'0.9em'}} onClick={() => setChecklistProgressById({})}>Reset </button>
                        </div>
                        {Object.entries(checklistItems).map(([sectionKey, list]) => (
                            <div key={sectionKey} className='containerDetail m-5 mt-10'>
                                <div className='color-yellow size20 flexContainer mt-10 p-10'>
                                    {sectionKey === 'preTrip' ? 'Pre-Trip' : sectionKey === 'setup' ? 'Camp Setup' : 'Breakdown'}
                                    <button className='containerDetail p-10 button bg-green mt--5 color-yellow ml-10' onClick={() => { setChecklistDialogSection(sectionKey); setChecklistDialogValue(''); setEditChecklistIndex(null); setShowChecklistDialog(true); }}>➕ Add</button>
                                </div>
                                {list.map((item, idx) => {
                                    const id = `${sectionKey}:${item}`;
                                    const done = Boolean(checklistProgressById[id]);
                                    return (
                                        <div key={id} className={`containerDetail flexContainer align-center m-5${done ? ' bg-dkGreen brdr-green' : ' bg-lite'}`}>
                                            <label className={`flex2Column p-10 mt-5 button`} style={{flex:1}}>
                                                <input 
                                                    type='checkbox' 
                                                    checked={done} 
                                                    onChange={() => toggleChecklistItem(id)} 
                                                    style={{ marginLeft: 10, marginTop: 30, width: 35, height: 35 }} 
                                                />
                                            </label>
                                            <span className='flex2Column pt-40'>{item}</span>
                                            <div className='flexColumn'>
                                                <div>
                                                    <button 
                                                        className='containerDetail button color-dark bg-tinted ml-5 p-20' 
                                                        onClick={() => { setChecklistDialogSection(sectionKey); setChecklistDialogValue(item); setEditChecklistIndex(idx); setShowChecklistDialog(true); }}
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                                <div>
                                                    <button className='containerDetail button color-lite bg-tinted ml-5 mt-5 p-20' 
                                                        onClick={() => {
                                                            setChecklistItems(prev => ({
                                                                ...prev,
                                                                [sectionKey]: prev[sectionKey].filter((_, i) => i !== idx)
                                                            }));
                                                            // Remove progress for deleted item
                                                            setChecklistProgressById(prev => {
                                                                const newObj = { ...prev };
                                                                delete newObj[id];
                                                                return newObj;
                                                            });
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                                            {showChecklistDialog && (
                                                <div className='contentDetail'>
                                                    <div className='containerDetail fixed t-50 bg-dark p-10 brdr-green width--60' style={{ margin: '40px auto', zIndex: 1000 }}>
                                                        <form onSubmit={e => {
                                                            e.preventDefault();
                                                            if (!checklistDialogValue.trim()) return;
                                                            setChecklistItems(prev => {
                                                                const updated = { ...prev };
                                                                if (editChecklistIndex === null) {
                                                                    // Add
                                                                    updated[checklistDialogSection] = [...updated[checklistDialogSection], checklistDialogValue.trim()];
                                                                } else {
                                                                    // Edit
                                                                    updated[checklistDialogSection] = updated[checklistDialogSection].map((v, i) => i === editChecklistIndex ? checklistDialogValue.trim() : v);
                                                                }
                                                                return updated;
                                                            });
                                                            setShowChecklistDialog(false);
                                                            setChecklistDialogValue('');
                                                            setEditChecklistIndex(null);
                                                        }}>
                                                            <div className='color-yellow size20 p-10 mb-10'>{editChecklistIndex === null ? 'Add Checklist Item' : 'Edit Checklist Item'}</div>
                                                            <div className='mb-10'>
                                                                <label className='color-lite p-10 mb-5'>
                                                                    Item
                                                                </label>
                                                                <div className='mt-5'>
                                                                    <input
                                                                        className='containerDetail m-5 color-lite width--10'
                                                                        value={checklistDialogValue}
                                                                        onChange={e => setChecklistDialogValue(e.target.value)}
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className='containerDetail bg-lite p-10 flexContainer mt-20'>
                                                                <button type='submit' className='button flex2Column bg-green color-lite ml--5 p-10 mr-10'>{editChecklistIndex === null ? 'Add' : 'Save'}</button>
                                                                <button type='button' className='button flex2Column bg-yellow color-dark mr--5 ml--5 p-10' onClick={() => { setShowChecklistDialog(false); setChecklistDialogValue(''); setEditChecklistIndex(null); }}>Cancel</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div className='dialog-backdrop' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 999 }} onClick={() => { setShowChecklistDialog(false); setChecklistDialogValue(''); setEditChecklistIndex(null); }}></div>
                                                </div>
                                            )}
                    </div>
                )}
            </div>

            <div className={`containerDetail mt-5 color-lite size20 ${!collapseState.foodWaterCollapsed ? 'bg-dkGreen' : 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Meals and Water'
                        isCollapsed={collapseState.foodWaterCollapsed}
                        setCollapse={v => setCollapsed('foodWaterCollapsed', v)}
                        align='left'
                    />
                </div>
                {collapseState.foodWaterCollapsed ? null : (
                    <div className='containerDetail bg-lite mt-5 p-10'>
                        <div className='flexContainer'>
                            <div className='containerDetail m-5 flex2Column p-10  color-yellow'>
                                <div>Water/day</div>    
                                <div className='color-orange copyright mt--5 mb-5 ml-5'>
                                    <span>{profile.waterLitersPerPersonPerDay} L</span>
                                    <span className='ml-10'>({waterLitersPerPersonPerDayGallons} gal)</span>
                                </div>
                                <input
                                    type='number'
                                    min='1'
                                    className='containerDetail color-lite w-100'
                                    value={profile.waterLitersPerPersonPerDay}
                                    onChange={(e) => updateProfileField('waterLitersPerPersonPerDay', Math.max(1, Number(e.target.value) || 1))}
                                />
                            </div>
                            <div className='containerDetail m-5 flex2Column p-10 color-yellow'>
                                <div>Meals/day</div>
                                <input
                                    type='number'
                                    min='1'
                                    className='containerDetail mt-20 color-lite w-100'
                                    value={profile.mealsPerPersonPerDay}
                                    onChange={(e) => updateProfileField('mealsPerPersonPerDay', Math.max(1, Number(e.target.value) || 1))}
                                />
                            </div>
                        </div>
                        <div className='containerDetail m-5 bg-tinted mt-10 p-10'>
                            <div className='color-yellow mb-5'>Recommended totals for this trip</div>
                            <div className='color-lite mt-10 mb-5'>
                                <span className='color-yellow'>Water:</span> {waterRecommendation.toFixed(1)} L
                                <span className='ml-10'>({waterRecommendationGallons} gal)</span>
                            </div>
                            <div className='color-lite'><span className='color-yellow'>Meals:</span> {mealsRecommendation} meal portions</div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`containerDetail mt-5 color-lite size20 ${!collapseState.itineraryCollapsed ? 'bg-dkGreen' : 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Timeline and Itinerary'
                        isCollapsed={collapseState.itineraryCollapsed}
                        setCollapse={v => setCollapsed('itineraryCollapsed', v)}
                        align='left'
                    />
                </div>
                {collapseState.itineraryCollapsed ? null : (
                    <div className='containerDetail bg-lite mt-5 p-10'>
                        <div className='ml-5 mb-5 color-yellow size20'>Before Trip</div>
                        <textarea className='containerDetail m-5 color-lite width--10 mt-5' rows='3' value={planNotes.before} onChange={(e) => setPlanNotes((prev) => ({ ...prev, before: e.target.value }))} />
                        <div className='ml-5 mb-5 color-yellow size20 mt-10'>During Trip</div>
                        <textarea className='containerDetail m-5 color-lite width--10 mt-5' rows='3' value={planNotes.during} onChange={(e) => setPlanNotes((prev) => ({ ...prev, during: e.target.value }))} />
                        <div className='ml-5 mb-5 color-yellow size20 mt-10'>After Trip</div>
                        <textarea className='containerDetail m-5 color-lite width--10 mt-5' rows='3' value={planNotes.after} onChange={(e) => setPlanNotes((prev) => ({ ...prev, after: e.target.value }))} />
                    </div>
                )}
            </div>

            <div className={`containerDetail mt-5 color-lite size20 ${!collapseState.safetyCollapsed ? 'bg-dkGreen' : 'bg-lite'} mb-5`}>
                <div className='containerDetail bg-lite color-yellow'>
                    <CollapseToggleButton
                        title='Safety and Contacts'
                        isCollapsed={collapseState.safetyCollapsed}
                        setCollapse={v => setCollapsed('safetyCollapsed', v)}
                        align='left'
                    />
                </div>
                {collapseState.safetyCollapsed ? null : (
                    <div className='containerDetail bg-lite mt-5 p-10'>
                        <input
                            className='containerDetail m-5 color-lite width--10'
                            value={profile.emergencyContact}
                            onChange={(e) => updateProfileField('emergencyContact', e.target.value)}
                            placeholder='Emergency contact details'
                        />
                        <div className='containerDetail m-5 bg-tinted mt-5 p-10'>
                            <div className='color-yellow'>Quick Safety Notes</div>
                            <div className='color-lite mt-15'>1. Share your route and expected check-in time before departure.</div>
                            <div className='color-lite mt-15'>2. If weather shifts, prioritize road access and daylight movement.</div>
                            <div className='color-lite mt-15'>3. Track fuel and water daily when supply access is limited or none.</div>
                            <div className='color-lite mt-15'>4. Keep first aid, headlamp, and navigation accessible while driving and at camp.</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Camp;
