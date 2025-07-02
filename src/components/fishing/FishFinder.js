import React, { useState } from 'react';

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
    }
}
  ;

const FishFinder = () => {
    const [selectedSeason, setSelectedSeason] = useState('All Seasons');
    const [selectedLocation, setSelectedLocation] = useState('All Locations');
    const [selectedSpecies, setSelectedSpecies] = useState('All Species');

    const seasons = [
        'All Seasons',
        ...Array.from(new Set(data.species.map(s => s.season)))
    ];

    const locations = [
        'All Locations',
        ...data.locations.map(l => l.name)
    ];

    const speciesList = [
        'All Species',
        ...data.species.map(s => s.name)
    ];

    // Filter species by season and location
    const filteredSpecies = data.species.filter(species => {
        const seasonMatch = selectedSeason === 'All Seasons' || species.season === selectedSeason;
        const locationMatch = selectedLocation === 'All Locations'
            || data.locations.some(loc =>
                loc.name === selectedLocation &&
                loc.species.some(s => species.name.includes(s))
            );
        const speciesMatch = selectedSpecies === 'All Species' || species.name === selectedSpecies;
        return seasonMatch && locationMatch && speciesMatch;
    });

    // For the main table, show all species filtered by season/location, not by selectedSpecies
    const displayedSpecies = data.species.filter(species => {
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
    const selectedSpeciesDetails = data.species.find(s => s.name === selectedSpecies);

    return (
        <div className='containerBox'>
            <div className='containerDetail p-20 color-yellow centerVertical m-5 bg-dark bold'>
                <span className='size40 mr-5'>🐟</span>Fish Finder
            </div>

            <div className='containerBox contentLeft pr-10'>
                <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className='containerBox width--10'
                >
                    {seasons.map(season => (
                        <option key={season} value={season}>{season}</option>
                    ))}
                </select>

                <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className='containerBox width--10'
                >
                    {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>

                <select
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    className='containerBox width--10'
                >
                    {speciesList.map(species => (
                        <option key={species} value={species}>{species}</option>
                    ))}
                </select>
            </div>

            {selectedLocationDetails && (
                <div className='containerBox bg-lite contentLeft'>
                    <div className='containerBox color-yellow bold'>Location Info</div>
                    <div className='containerBox'>Type: {selectedLocationDetails.type}</div>
                    <div className='containerBox'>License Required: {selectedLocationDetails.license_required ? 'Yes' : 'No'}</div>
                    {selectedLocationDetails.notes && <div className='containerBox'>Notes: {selectedLocationDetails.notes}</div>}
                </div>
            )}

            {/* Species Details Section */}
            {selectedSpecies !== 'All Species' && selectedSpeciesDetails && (
                <div className='containerBox'>
                    <div className='containerBox mt-5 p-10 bg-lite contentLeft'>
                        <div className='containerBox color-yellow bold mb-2'>
                            🐟 Species Details: {selectedSpeciesDetails.name}
                        </div>
                        <div className='containerBox'>
                           🎣 Bag Limit: {selectedSpeciesDetails.bag_limit}
                        </div>
                        <div className='containerBox'>
                            📏 Min Size (in): {selectedSpeciesDetails.min_size_inches ? `${selectedSpeciesDetails.min_size_inches}${typeof selectedSpeciesDetails.min_size_inches === 'number' ? '″' : ''}` : '—'}
                        </div>
                        <div className='containerBox'>
                            📅 Season: {selectedSpeciesDetails.season}
                        </div>
                    </div>
                    <div className='containerBox bg-lite contentLeft'>
                        <div className='containerBox color-yellow'>🌎 Locations:</div>
                        {locationsForSelectedSpecies.length > 0 ? (
                            <div className='containerBox'>
                                {locationsForSelectedSpecies.map(loc => (
                                    <div className='containerBox' key={loc.name}>
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

            {/* Main Table */}
            <div className='containerBox'>
                <div className='containerBox flexContainer contentLeft bg-yellow color-dark'>
                    <div className='flex4Column contentLeft'>🐟 Species</div>
                    <div className='flex4Column contentLeft'>🎣 Bag Limit</div>
                    <div className='flex4Column contentLeft'>📏 Min Size (in)</div>
                    <div className='flex4Column contentLeft'>📅 Season</div>
                </div>
                <div className='scrollHeight250'>
                    {displayedSpecies.map((sp, i) => (
                        <div key={i} className={`containerBox flexContainer contentLeft ${(i % 2 === 0) ? 'bg-lite' : ''}`}>
                            <div className='flex4Column contentLeft'>{sp.name}</div>
                            <div className='flex4Column contentLeft'>{sp.bag_limit}</div>
                            <div className='flex4Column contentLeft'>
                                {
                                    (sp.min_size_inches)
                                        ? `${sp.min_size_inches}${typeof sp.min_size_inches === 'number' ? '″' : ''}`
                                        : '—'
                                }
                            </div>
                            <div className='flex4Column contentLeft'>{sp.season}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FishFinder;