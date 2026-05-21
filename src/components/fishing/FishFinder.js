import React, { useState } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const data = {
    'region': 'North County San Diego',
    'species': [
        {
            'name': 'California Halibut',
            'bag_limit': 5,
            'min_size_inches': 22,
            'season': 'Year-round'
        },
        {
            'name': 'Kelp, Barred & Sand Bass',
            'bag_limit': 5,
            'min_size_inches': 14,
            'season': 'Year-round'
        },
        {
            'name': 'White Seabass',
            'bag_limit': '3 (only 1 from Mar 15–Jun 15)',
            'min_size_inches': 28,
            'season': 'Year-round with seasonal limit'
        },
        {
            'name': 'California Sheephead',
            'bag_limit': 2,
            'min_size_inches': 12,
            'season': 'Mar 1 – Dec 31'
        },
        {
            'name': 'California Scorpionfish',
            'bag_limit': 5,
            'min_size_inches': null,
            'season': 'Year-round'
        },
        {
            'name': 'Surfperch',
            'bag_limit': '20 (no more than 10 per species)',
            'min_size_inches': 10.5,
            'season': 'Year-round'
        },
        {
            'name': 'Ocean Whitefish',
            'bag_limit': 10,
            'min_size_inches': null,
            'season': 'Year-round'
        },
        {
            'name': 'Rockfish & Groundfish',
            'bag_limit': 5,
            'min_size_inches': 'Varies by species',
            'season': 'Apr 1 – Dec 31'
        },
        {
            'name': 'Sharks (State-managed)',
            'bag_limit': 'Varies by species (typically 1–2)',
            'min_size_inches': null,
            'season': 'Year-round (white sharks prohibited)'
        },
        {
            'name': 'Tuna (Bluefin, Yellowtail, etc.)',
            'bag_limit': 'Federal limits apply',
            'min_size_inches': null,
            'season': 'Peak Apr – Oct'
        }
    ],
    'locations': [
        {
            'name': 'Oceanside Pier',
            'type': 'Pier',
            'license_required': false,
            'species': ['Surfperch', 'Halibut', 'Bass', 'Sheephead']
        },
        {
            'name': 'Oceanside Harbor Jetty',
            'type': 'Jetty',
            'license_required': true,
            'species': ['Halibut', 'Bass', 'Rockfish']
        },
        {
            'name': 'Carlsbad Jetty',
            'type': 'Jetty',
            'license_required': true,
            'species': ['Halibut', 'Bass', 'Sheephead']
        },
        {
            'name': 'Swami’s SMCA',
            'type': 'Marine Protected Area',
            'license_required': true,
            'species': ['Pelagic finfish only'],
            'notes': 'No take of other species. Shore-based line fishing only.'
        },
        {
            'name': 'Offshore (via charter)',
            'type': 'Open Ocean',
            'license_required': true,
            'species': ['Tuna', 'Yellowtail', 'Marlin', 'Sharks']
        }
    ],
    'notes': {
        'license_rules': 'No license required on public piers. License required for all other locations.',
        'rod_limit': 'Maximum of 2 rods per person on piers.',
        'mpa_rules': 'Swami’s SMCA and other protected areas allow only specific types of fishing (e.g., pelagic finfish with hook-and-line).',
        'seasonal_restrictions': {
            'rockfish': 'Closed Jan 1 – Mar 31',
            'sheephead': 'Closed Jan – Feb',
            'white_seabass': 'Limit of 1 from Mar 15 – Jun 15'
        },
        'gear_tip': 'Use lighter setups for perch and bass, and medium-heavy for halibut or deeper structure fish. Live bait is highly effective.'
    },
    'events': [
        {
            name: "🐟 Grunion Run",
            description: "A unique event where grunion come ashore to spawn. Observing and catching is allowed only on certain nights.",
            region: "Southern California beaches",
            regionIcon: "🇺🇸",
            months: ["March", "April", "May", "June"],
            2026: [
                { start: "March 24", end: "March 27" },
                { start: "April 7", end: "April 10" },
                { start: "April 21", end: "April 24" },
                { start: "May 6", end: "May 9" },
                { start: "May 20", end: "May 23" },
                { start: "June 4", end: "June 7" },
                { start: "June 18", end: "June 21" }
            ],
            notes: "Check CDFW for exact times. No take during April/May full moons."
        },
        {
            name: "🐟 Salmon Spawning Run",
            description: "Chinook and Coho salmon migrate upstream to spawn, with peak viewing in fall. Many rivers host festivals and have public viewing areas.",
            region: "California, Oregon, Washington rivers",
            regionIcon: "🇺🇸",
            months: ["September", "October", "November", "December"],
            2026: [
                { start: "September 15", end: "December 10" }
            ],
            notes: "Check local river websites for best viewing spots and festival dates. Fishing regulations apply."
        },
        {
            name: "🐟 Pacific Herring Spawn",
            description: "Massive schools of herring come close to shore to spawn, turning the water milky and attracting birds, seals, and fishermen.",
            region: "San Francisco Bay, Tomales Bay, Humboldt Bay",
            regionIcon: "🇺🇸",
            months: ["January", "February", "March"],
            2026: [
                { start: "January 10", end: "March 5" }
            ],
            notes: "Best seen at dawn. Harvesting is regulated; check CDFW for details."
        },
        {
            name: "🦑 California Market Squid Spawning",
            description: "Squid gather in huge numbers to spawn, often visible at night with lights from piers or boats.",
            region: "Monterey Bay, Channel Islands, Southern California beaches",
            regionIcon: "🇺🇸",
            months: ["April", "May", "June"],
            2026: [
                { start: "April 20", end: "June 15" }
            ],
            notes: "Look for bright lights on the water at night. Commercial fishing may be active."
        },
        {
            name: "🐋 Gray Whale Migration",
            description: "Gray whales migrate along the coast between Alaska and Baja California. Peak viewing from headlands and bluffs.",
            region: "Entire West Coast",
            regionIcon: "🌎",
            months: ["January", "February", "March", "April"],
            2026: [
                { start: "January 5", end: "April 25" }
            ],
            notes: "Bring binoculars. Many coastal parks offer whale-watching programs."
        },
        {
            name: "🐟 Smelt Run (Night Smelt)",
            description: "Smelt come ashore to spawn, often at night. Harvested by dip net along beaches and river mouths.",
            region: "Northern California, Oregon, Washington",
            regionIcon: "🇺🇸",
            months: ["May", "June", "July"],
            2026: [
                { start: "May 15", end: "July 10" }
            ],
            notes: "Best at night on incoming tides. Check local regulations for limits and open areas."
        },
        {
            name: "🐋 Gray Whale Calving Season",
            description: "Gray whales gather in Baja's protected lagoons to give birth and nurse calves. Guided boat tours offer close encounters.",
            region: "Laguna San Ignacio, Magdalena Bay, Guerrero Negro",
            regionIcon: "🇲🇽",
            months: ["January", "February", "March"],
            2026: [
                { start: "January 10", end: "March 31" }
            ],
            notes: "Best viewing via licensed panga tours. Respect wildlife regulations."
        },
        {
            name: "🦈 Mobula Ray Aggregations",
            description: "Thousands of mobula rays gather and leap from the water in spectacular displays, especially in the Sea of Cortez.",
            region: "Sea of Cortez (La Paz, Cabo Pulmo)",
            regionIcon: "🇲🇽",
            months: ["May", "June", "July"],
            2026: [
                { start: "May 15", end: "July 5" }
            ],
            notes: "Best seen by boat or snorkeling tours. Early mornings are ideal."
        },
        {
            name: "🐟 Sardine Run (Baja)",
            description: "Massive schools of sardines attract whales, dolphins, and seabirds, creating a feeding frenzy visible from boats.",
            region: "Pacific coast of Baja, especially around Bahia Magdalena",
            regionIcon: "🇲🇽",
            months: ["June", "July", "August"],
            2026: [
                { start: "June 10", end: "August 10" }
            ],
            notes: "Look for tour operators offering wildlife safaris during this period."
        },
        {
            name: "🥚 Sea Turtle Nesting and Hatching (Baja)",
            description: "Olive Ridley and Leatherback turtles nest on Baja's beaches. Nighttime tours allow visitors to witness nesting and hatchling releases.",
            region: "Todos Santos, San Cristobal, Magdalena Bay",
            regionIcon: "🇲🇽",
            months: ["September", "October", "November", "December"],
            2026: [
                { start: "September 1", end: "December 15" }
            ],
            notes: "Participate in conservation programs for the best experience."
        },
        {
            name: "🐟 Red Drum (Redfish) Fall Run",
            description: "Large schools of red drum gather near inlets and beaches, providing excellent surf and pier fishing opportunities.",
            region: "Outer Banks, Cape Hatteras, Cape Lookout",
            regionIcon: "🇺🇸",
            months: ["September", "October", "November"],
            2026: [
                { start: "September 10", end: "November 20" }
            ],
            notes: "Best action at dawn and dusk. Check local regulations for slot limits and bag limits."
        },
        {
            name: "🐟 Spot and Croaker Run",
            description: "Spot and croaker migrate south in huge numbers, drawing crowds to piers and beaches for fast-paced fishing.",
            region: "All North Carolina piers and beaches",
            regionIcon: "🇺🇸",
            months: ["September", "October"],
            2026: [
                { start: "September 1", end: "October 31" }
            ],
            notes: "Bloodworms and shrimp are top baits. No size limit for spot."
        },
        {
            name: "🐟 Bluefish Spring Blitz",
            description: "Bluefish schools move close to shore in spring, creating exciting action for surf and pier anglers.",
            region: "Outer Banks, Crystal Coast, Wilmington area",
            regionIcon: "🇺🇸",
            months: ["April", "May"],
            2026: [
                { start: "April 10", end: "May 20" }
            ],
            notes: "Metal lures and cut bait are effective. Watch for birds diving on bait schools."
        },
        {
            name: "🥚 Sea Turtle Nesting and Hatching (North Carolina)",
            description: "Loggerhead and green sea turtles nest on North Carolina beaches. Guided walks allow visitors to witness nesting and hatchling releases.",
            region: "Cape Hatteras, Topsail Island, Bald Head Island",
            regionIcon: "🇺🇸",
            months: ["June", "July", "August", "September"],
            2026: [
                { start: "June 1", end: "September 15" }
            ],
            notes: "Contact local sea turtle conservation groups for tour info. Lights and noise are restricted on nesting beaches."
        },
        {
            name: "🐟 Menhaden (Pogy) Migration",
            description: "Massive schools of menhaden migrate along the coast, attracting predators like striped bass, bluefish, and dolphins.",
            region: "Cape Fear, Cape Lookout, Pamlico Sound",
            regionIcon: "🇺🇸",
            months: ["October", "November"],
            2026: [
                { start: "October 1", end: "November 15" }
            ],
            notes: "Look for surface disturbances and diving birds. Cast-netting is popular where legal."
        }
    ]
}
  ;

const FishFinder = () => {
    const [species, setSpecies] = useState([...data.species]);
    const [selectedSeason, setSelectedSeason] = useState('All Seasons');
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [selectedSpecies, setSelectedSpecies] = useState('All Species');
    const [eventsCollapsed, setEventsCollapsed] = useState(true);
    // Events CRUD state
    const [events, setEvents] = useState([...data.events]);
    // Per-event collapse state
    const [eventItemCollapsed, setEventItemCollapsed] = useState(() => {
        const initial = {};
        if (data.events) {
            data.events.forEach(ev => { initial[ev.name] = true; });
        }
        return initial;
    });
    const [eventEdit, setEventEdit] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        region: '',
        regionIcon: '',
        months: [],
        '2026': [],
        notes: ''
    });
    const [editEventIndex, setEditEventIndex] = useState(null);

    const handleAddEvent = () => {
        if (!newEvent.name) return;
        setEvents([...events, { ...newEvent, months: newEvent.months.filter(Boolean), '2026': newEvent['2026'].filter(d => d.start && d.end) }]);
        setNewEvent({ name: '', description: '', region: '', regionIcon: '', months: [], '2026': [], notes: '' });
    };

    const handleEditEvent = (index) => {
        setEditEventIndex(index);
        setNewEvent({ ...events[index], months: [...events[index].months], '2026': [...(events[index]['2026'] || [])] });
    };

    const handleSaveEditEvent = () => {
        const updated = [...events];
        updated[editEventIndex] = { ...newEvent, months: newEvent.months.filter(Boolean), '2026': newEvent['2026'].filter(d => d.start && d.end) };
        setEvents(updated);
        setEditEventIndex(null);
        setNewEvent({ name: '', description: '', region: '', regionIcon: '', months: [], '2026': [], notes: '' });
    };

    const handleDeleteEvent = (index) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    // For months and 2026 dates in event form
    const handleEventMonthChange = (idx, value) => {
        const months = [...newEvent.months];
        months[idx] = value;
        setNewEvent(ev => ({ ...ev, months }));
    };
    const handleEventDateChange = (idx, field, value) => {
        const dates = [...newEvent['2026']];
        dates[idx] = { ...dates[idx], [field]: value };
        setNewEvent(ev => ({ ...ev, '2026': dates }));
    };
    const addEventMonth = () => setNewEvent(ev => ({ ...ev, months: [...ev.months, ''] }));
    const removeEventMonth = (idx) => setNewEvent(ev => ({ ...ev, months: ev.months.filter((_, i) => i !== idx) }));
    const addEventDate = () => setNewEvent(ev => ({ ...ev, '2026': [...ev['2026'], { start: '', end: '' }] }));
    const removeEventDate = (idx) => setNewEvent(ev => ({ ...ev, '2026': ev['2026'].filter((_, i) => i !== idx) }));

    // Add/Edit species state
    const [newSpecies, setNewSpecies] = useState({ name: '', bag_limit: '', min_size_inches: '', season: '' });
    const [editIndex, setEditIndex] = useState(null);
    const [edit, setEdit] = useState(false);

    const handleEventToggle = (eventName) => {
        setEventItemCollapsed(prev => ({ ...prev, [eventName]: !prev[eventName] }));
    };

    const handleAddSpecies = () => {
        if (!newSpecies.name) return;
        setSpecies([...species, newSpecies]);
        setNewSpecies({ name: '', bag_limit: '', min_size_inches: '', season: '' });
    };

    const handleEditSpecies = (index) => {
        setEditIndex(index);
        setNewSpecies(species[index]);
    };

    const handleSaveEdit = () => {
        const updated = [...species];
        updated[editIndex] = newSpecies;
        setSpecies(updated);
        setEditIndex(null);
        setNewSpecies({ name: '', bag_limit: '', min_size_inches: '', season: '' });
    };

    const handleDeleteSpecies = (index) => {
        setSpecies(species.filter((_, i) => i !== index));
    };

    const seasons = [
        'All Seasons',
        ...Array.from(new Set(species.map(s => s.season)))
    ];

    const locations = [
        'All Locations',
        ...data.locations.map(l => l.name)
    ];

    const speciesList = [
        'All Species',
        ...species.map(s => s.name)
    ];

    // For the main table, show all species filtered by season/location, not by selectedSpecies
    const displayedSpecies = species.filter(species => {
        const seasonMatch = selectedSeason === 'All Seasons' || species.season === selectedSeason;
        const locationMatch = selectedLocation === 'All Locations'
            || data.locations.some(loc =>
                loc.name === selectedLocation &&
                loc.species.some(s => species.name.includes(s))
            );
        return seasonMatch && locationMatch;
    });

    const selectedLocationDetails =
        selectedLocation !== 'All Locations'
            ? data.locations.find(l => l.name === selectedLocation)
            : null;

    // Find all locations for the selected species
    const locationsForSelectedSpecies = selectedSpecies !== 'All Species'
        ? data.locations.filter(loc =>
            loc.species.some(s => selectedSpecies.includes(s))
        )
        : [];

    // Find species details for the selected species
    const selectedSpeciesDetails = species.find(s => s.name === selectedSpecies);

    return (
        <div className='containerDetail mt--30'>
            <div className='containerDetail bg-lite'>
                <div className='containerDetail p-20 color-yellow m-5 bg-lite bold size40 contentLeft'>
                    <span className='size40 mr-5'>🐟</span>Fish Finder
                </div>
                <div className='containerDetail size20 m-5 bg-lite color-yellow p-15 contentLeft pr-10'>
                    <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(e.target.value)}
                        className='containerDetail size20 m-5 bg-lite color-yellow p-15 width--10'
                    >
                        {seasons.map(season => (
                            <option key={season} value={season}>{season}</option>
                        ))}
                    </select>

                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className='containerDetail size20 m-5 bg-lite color-yellow p-15 width--10'
                    >
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>

                    <select
                        value={selectedSpecies}
                        onChange={(e) => setSelectedSpecies(e.target.value)}
                        className='containerDetail size20 m-5 bg-lite color-yellow p-15 width--10'
                    >
                        {speciesList.map(species => (
                            <option key={species} value={species}>{species}</option>
                        ))}
                    </select>
                </div>
            </div>
            {selectedLocationDetails && (
                <div className='containerDetail size20 m-5 bg-lite color-yellow p-15 bg-lite contentLeft'>
                    <div className='containerDetail size20 m-5 bg-lite color-yellow p-15 color-yellow bold'>Location Info</div>
                    <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>Type: {selectedLocationDetails.type}</div>
                    <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>License Required: {selectedLocationDetails.license_required ? 'Yes' : 'No'}</div>
                    {selectedLocationDetails.notes && <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>Notes: {selectedLocationDetails.notes}</div>}
                </div>
            )}

            {/* Species Details Section */}
            {selectedSpecies !== 'All Species' && selectedSpeciesDetails && (
                <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>
                    <div className='containerDetail size20 m-5 bg-lite color-yellow p-15 mt-5 p-10 bg-lite contentLeft'>
                        <div className='containerDetail size20 m-5 bg-lite color-yellow p-15 color-yellow bold mb-2'>
                            🐟 Species Details: {selectedSpeciesDetails.name}
                        </div>
                        <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>
                           🎣 Bag Limit: {selectedSpeciesDetails.bag_limit}
                        </div>
                        <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>
                            📏 Min Size (in): {selectedSpeciesDetails.min_size_inches ? `${selectedSpeciesDetails.min_size_inches}${typeof selectedSpeciesDetails.min_size_inches === 'number' ? '″' : ''}` : '—'}
                        </div>
                        <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>
                            📅 Season: {selectedSpeciesDetails.season}
                        </div>
                    </div>
                    <div className='containerDetail size20 m-5 bg-lite color-yellow p-15 bg-lite contentLeft'>
                        <div className='containerDetail size20 m-5 bg-lite color-yellow p-15 color-yellow'>🌎 Locations:</div>
                        {locationsForSelectedSpecies.length > 0 ? (
                            <div className='containerDetail size20 m-5 bg-lite color-yellow p-15'>
                                {locationsForSelectedSpecies.map(loc => (
                                    <div className='containerDetail size20 m-5 bg-lite color-yellow p-15' key={loc.name}>
                                        <span className=''>{loc.name}</span>
                                        {loc.type && <> — <span>{loc.type}</span></>}
                                        {typeof loc.license_required !== 'undefined' && <> — <span>License: {loc.license_required ? 'Yes' : 'No'}</span></>}
                                        {loc.notes && <> — <span className='italic'>{loc.notes}</span></>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className='color-red'> No known locations</span>
                        )}
                    </div>
                </div>
            )}


            {/* Edit Toggle Button */}
            <div 
                className='containerDetail bg-lite p-10 mb-5 mt-5 bg-blue color-yellow size20' 
                onClick={() => setEdit(e => !e)}
            >
                {edit ? 'Close Species Editor' : 'Edit/Add Species'}
            </div>

            {/* Add/Edit Species Form - only show when edit is true */}
            {edit && (
                <div className='containerDetail bg-lite p-10 mb-10'>
                    <input
                        placeholder='Name'
                        value={newSpecies.name}
                        onChange={e => setNewSpecies({ ...newSpecies, name: e.target.value })}
                        className='m-2 p-5'
                    />
                    <input
                        placeholder='Bag Limit'
                        value={newSpecies.bag_limit}
                        onChange={e => setNewSpecies({ ...newSpecies, bag_limit: e.target.value })}
                        className='m-2 p-5'
                    />
                    <input
                        placeholder='Min Size (in)'
                        value={newSpecies.min_size_inches}
                        onChange={e => setNewSpecies({ ...newSpecies, min_size_inches: e.target.value })}
                        className='m-2 p-5'
                    />
                    <input
                        placeholder='Season'
                        value={newSpecies.season}
                        onChange={e => setNewSpecies({ ...newSpecies, season: e.target.value })}
                        className='m-2 p-5'
                    />
                    {editIndex === null ? (
                        <button className='m-2 p-5' onClick={handleAddSpecies}>Add Species</button>
                    ) : (
                        <button className='m-2 p-5' onClick={handleSaveEdit}>Save Edit</button>
                    )}
                </div>
            )}

            {/* Main Table */}
            <div className='containerDetail bg-lite '>
                {displayedSpecies.map((sp, i) => (
                    <div key={i} className={`containerDetail m-2 contentLeft bg-lite`}>
                        <div className='containerDetail flexContainer size20 m-2 bg-yellow color-dark p-10 color-yellow'>
                            <div className='flex2Column'>
                                🐟 {sp.name}
                            </div>
                            {edit && (
                                <>
                                    <div 
                                        className='m-2 p-10 flexColumn' 
                                        onClick={() => handleEditSpecies(species.indexOf(sp))}
                                    >
                                        ✏️
                                    </div>
                                    <div 
                                        className='m-2 p-10 flexColumn' 
                                        onClick={() => handleDeleteSpecies(species.indexOf(sp))}
                                    >
                                        🗑️
                                    </div>
                                </>
                            )}
                        </div>
                        <div className='containerDetail m-2 size20 color-yellow bg-lite flexContainer'>
                            <div className='containerDetail flex3Column contentLeft pl-10 pr-10 m-2'>
                                {sp.min_size_inches ? `📏 ${sp.min_size_inches}${typeof sp.min_size_inches === 'number' ? '″' : ''}` : '—'}
                            </div>
                            <div className='containerDetail flex3Column contentLeft pl-10 pr-10 m-2'>🎣 {sp.bag_limit}</div>
                            <div className='containerDetail flex3Column contentLeft pl-10 pr-10 m-2'>📅 {sp.season}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Special Events Edit Toggle Button */}
            <div className='containerDetail bg-lite p-10 mb-5 mt-5 bg-blue color-yellow size20' onClick={() => setEventEdit(e => !e)}>
                {eventEdit ? 'Close Events Editor' : 'Edit/Add Special Events'}
            </div>

            {/* Add/Edit Event Form - only show when eventEdit is true */}
            {eventEdit && (
                <div className='containerDetail bg-lite p-10 mb-10'>
                    <input
                        placeholder='Name'
                        value={newEvent.name}
                        onChange={e => setNewEvent(ev => ({ ...ev, name: e.target.value }))}
                        className='m-2 p-5'
                    />
                    <input
                        placeholder='Description'
                        value={newEvent.description}
                        onChange={e => setNewEvent(ev => ({ ...ev, description: e.target.value }))}
                        className='m-2 p-5'
                    />
                    <input
                        placeholder='Region'
                        value={newEvent.region}
                        onChange={e => setNewEvent(ev => ({ ...ev, region: e.target.value }))}
                        className='m-2 p-5'
                    />
                    <input
                        placeholder='Region Icon (emoji)'
                        value={newEvent.regionIcon}
                        onChange={e => setNewEvent(ev => ({ ...ev, regionIcon: e.target.value }))}
                        className='m-2 p-5'
                    />
                    <div className='m-2'>Months:
                        {newEvent.months.map((month, idx) => (
                            <span key={idx}>
                                <input
                                    value={month}
                                    onChange={e => handleEventMonthChange(idx, e.target.value)}
                                    className='m-1 p-2'
                                />
                                <button onClick={() => removeEventMonth(idx)} className='m-1'>✖️</button>
                            </span>
                        ))}
                        <button onClick={addEventMonth} className='m-1'>+ Month</button>
                    </div>
                    <div className='m-2'>2026 Dates:
                        {newEvent['2026'].map((date, idx) => (
                            <span key={idx}>
                                <input
                                    placeholder='Start'
                                    value={date.start}
                                    onChange={e => handleEventDateChange(idx, 'start', e.target.value)}
                                    className='m-1 p-2'
                                />
                                <input
                                    placeholder='End'
                                    value={date.end}
                                    onChange={e => handleEventDateChange(idx, 'end', e.target.value)}
                                    className='m-1 p-2'
                                />
                                <button onClick={() => removeEventDate(idx)} className='m-1'>✖️</button>
                            </span>
                        ))}
                        <button onClick={addEventDate} className='m-1'>+ Date</button>
                    </div>
                    <input
                        placeholder='Notes'
                        value={newEvent.notes}
                        onChange={e => setNewEvent(ev => ({ ...ev, notes: e.target.value }))}
                        className='m-2 p-5'
                    />
                    {editEventIndex === null ? (
                        <button className='m-2 p-5' onClick={handleAddEvent}>Add Event</button>
                    ) : (
                        <button className='m-2 p-5' onClick={handleSaveEditEvent}>Save Edit</button>
                    )}
                </div>
            )}

            {/* Events Section */}
            {events && events.length > 0 && (
                <div className='containerDetail bg-lite mt-5 mb-100'>
                    <div className='containerDetail bg-yellow p-15'>
                        <CollapseToggleButton
                            title={<span className='size25 color-dark'><span role="img" aria-label="wave">🌊</span> Special Events</span>}
                            isCollapsed={eventsCollapsed}
                            setCollapse={setEventsCollapsed}
                            align='left'
                        />
                    </div>
                    {!eventsCollapsed && (
                        <div>
                            {events.map((event, idx) => (
                                <div key={`${event.name}-${event.region}`} className='containerDetail mt-5 contentLeft bg-lite color-lite'>
                                    <div className='containerDetail bg-lite color-yellow p-10 size20 flexContainer'>
                                        <CollapseToggleButton
                                            title={<span>{event.regionIcon} {event.name}</span>}
                                            isCollapsed={eventItemCollapsed[event.name]}
                                            setCollapse={() => handleEventToggle(event.name)}
                                            align='left'
                                        />
                                        {eventEdit && (
                                            <>
                                                <div className='m-2 p-10 flexColumn' onClick={() => handleEditEvent(idx)}>✏️</div>
                                                <div className='m-2 p-10 flexColumn' onClick={() => handleDeleteEvent(idx)}>🗑️</div>
                                            </>
                                        )}
                                    </div>
                                    {
                                        !eventItemCollapsed[event.name] && (
                                            <div>
                                                <div className='containerDetail size18 m-2 p-10'>{event.description}</div>
                                                <div className='containerDetail size18 m-2 p-10'><span className='color-yellow mr-5'>Region:</span>{event.region}</div>
                                                <div className='containerDetail size18 m-2 p-10'><span className='color-yellow mr-5'>Months:</span>{event.months && event.months.join(', ')}</div>
                                                {event["2026"] && event["2026"].length > 0 && (
                                                    <div className='containerDetail size18 m-2 p-10'>
                                                        <span className='bold color-yellow'>2026 Dates:</span>
                                                        <ul>
                                                            {event["2026"].map((run, idx2) => (
                                                                <li key={idx2}>{run.start} – {run.end}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {event.notes && (
                                                    <div className='containerDetail size18 m-2 color-orange italic p-10'>{event.notes}</div>
                                                )}
                                            </div>
                                        )
                                    }
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FishFinder;