import React, { useEffect, useMemo, useRef, useState } from 'react';
// Map preference constants
const MAP_PREFERENCE_AUTO = 'auto';
const MAP_PREFERENCE_APPLE = 'apple';
const MAP_PREFERENCE_GOOGLE = 'google';

function isIPhoneDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openPoiInMaps({ lat, lng }, mapPreference) {
  if (!lat || !lng) return;
  const destination = `${lat},${lng}`;
  let resolvedPreference = mapPreference;
  if (mapPreference === MAP_PREFERENCE_AUTO) {
    resolvedPreference = isIPhoneDevice() ? MAP_PREFERENCE_APPLE : MAP_PREFERENCE_GOOGLE;
  }
  const mapUrl =
    resolvedPreference === MAP_PREFERENCE_APPLE
      ? `https://maps.apple.com/?daddr=${encodeURIComponent(destination)}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  window.open(mapUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Haversine distance formula (meters)
 */
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function metersToMiles(meters) {
  return meters / 1609.344;
}

/**
 * Hook — Get Live GPS Position
 */
function useLiveLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return { location, error };
}

/**
 * Sample Data — Multiple Parks (for future city/POI expansion)
 */
const PARKS_DATA = [
  {
    id: 'sdwap',
    name: 'San Diego Wildlife Animal Park',
    features: [
      {
        id: 'sdwap-entrance',
        name: 'Entrance & Visitor Center',
        lat: 32.8074,
        lng: -116.9893,
        stops: [
          { id: 'entrance-ticket', name: 'Get Tickets', lat: 32.8074, lng: -116.9893 },
          { id: 'entrance-map', name: 'Pick Up Map & Info', lat: 32.8075, lng: -116.9892 },
          { id: 'entrance-gift', name: 'Gift Shop', lat: 32.8073, lng: -116.9894 }
        ]
      },
      {
        id: 'sdwap-cheetah',
        name: 'Cheetah Run',
        lat: 32.8089,
        lng: -116.9875,
        stops: [
          { id: 'cheetah-viewing', name: 'Main Viewing Platform', lat: 32.8089, lng: -116.9875 },
          { id: 'cheetah-photo', name: 'Photo Opportunity Area', lat: 32.8090, lng: -116.9874 },
          { id: 'cheetah-info', name: 'Educational Exhibit', lat: 32.8088, lng: -116.9876 }
        ]
      },
      {
        id: 'sdwap-africa',
        name: 'Africa Rocks - Penguin Colony',
        lat: 32.8072,
        lng: -116.9901,
        stops: [
          { id: 'africa-penguin-main', name: 'Penguin Habitat', lat: 32.8072, lng: -116.9901 },
          { id: 'africa-puffin', name: 'Puffin Viewing', lat: 32.8073, lng: -116.9900 },
          { id: 'africa-seal', name: 'Seal & Otter Area', lat: 32.8071, lng: -116.9902 }
        ]
      },
      {
        id: 'sdwap-asia',
        name: 'Asian Savanna',
        lat: 32.8095,
        lng: -116.9910,
        stops: [
          { id: 'asia-elephant', name: 'Elephant Viewing', lat: 32.8095, lng: -116.9910 },
          { id: 'asia-tiger', name: 'Tiger Habitat', lat: 32.8096, lng: -116.9909 },
          { id: 'asia-giraffe', name: 'Giraffe & Antelope', lat: 32.8094, lng: -116.9911 }
        ]
      },
      {
        id: 'sdwap-africa-tram',
        name: 'Africa Tram Tour Start',
        lat: 32.8062,
        lng: -116.9885,
        stops: [
          { id: 'tram-station', name: 'Tram Boarding Station', lat: 32.8062, lng: -116.9885 },
          { id: 'tram-zebra', name: 'Zebra Stop', lat: 32.8060, lng: -116.9880 },
          { id: 'tram-rhino', name: 'Rhino Stop', lat: 32.8058, lng: -116.9875 },
          { id: 'tram-return', name: 'Tram Return Station', lat: 32.8062, lng: -116.9885 }
        ]
      },
      {
        id: 'sdwap-condor',
        name: 'California Condor Viewing',
        lat: 32.8110,
        lng: -116.9920,
        stops: [
          { id: 'condor-viewing', name: 'Main Observation Deck', lat: 32.8110, lng: -116.9920 },
          { id: 'condor-info', name: 'Conservation Center', lat: 32.8111, lng: -116.9919 },
          { id: 'condor-audio', name: 'Audio Guide Station', lat: 32.8109, lng: -116.9921 }
        ]
      }
    ]
  },
  {
    id: 'knotts',
    name: "Knott's Berry Farm",
    features: [
      {
        id: 'knotts-ghostrider',
        name: 'GhostRider Roller Coaster',
        lat: 33.8441,
        lng: -118.0007,
        stops: [
          { id: 'ghostrider-entrance', name: 'Ride Entrance', lat: 33.8441, lng: -118.0007 },
          { id: 'ghostrider-photo', name: 'Photo Booth', lat: 33.8442, lng: -118.0006 }
        ]
      },
      {
        id: 'knotts-calico',
        name: 'Calico Mine Ride',
        lat: 33.8447,
        lng: -118.0012,
        stops: [
          { id: 'calico-entrance', name: 'Mine Entrance', lat: 33.8447, lng: -118.0012 },
          { id: 'calico-exit', name: 'Mine Exit', lat: 33.8448, lng: -118.0011 }
        ]
      },
      {
        id: 'knotts-camp-snoopy',
        name: 'Camp Snoopy',
        lat: 33.8452,
        lng: -118.0003,
        stops: [
          { id: 'snoopy-stage', name: 'Snoopy Stage', lat: 33.8452, lng: -118.0003 },
          { id: 'snoopy-playground', name: 'Playground', lat: 33.8453, lng: -118.0002 }
        ]
      }
    ]
  },
  {
    id: 'encinitas',
    name: 'Encinitas (City Divisions & POIs)',
    features: [
      {
        id: 'encinitas-downtown',
        name: 'Downtown Encinitas',
        lat: 33.0482,
        lng: -117.2921,
        stops: [
          { id: 'poi-loftycafe', name: 'Lofty Coffee', lat: 33.0485, lng: -117.2930 },
          { id: 'poi-la-paloma', name: 'La Paloma Theatre', lat: 33.0487, lng: -117.2935 },
          { id: 'poi-swamis', name: 'Swami’s Café', lat: 33.0456, lng: -117.2781 },
          { id: 'poi-downtown-restroom', name: 'Public Restroom', lat: 33.0483, lng: -117.2925 },
          { id: 'poi-downtown-park', name: 'Downtown Park', lat: 33.0489, lng: -117.2928 },
          { id: 'poi-encinitas-station', name: 'Encinitas Train Station', lat: 33.0366, lng: -117.2922 },
          { id: 'poi-encinitas-bus', name: 'Encinitas Bus Station', lat: 33.0368, lng: -117.2923 },
          { id: 'poi-encinitas-shopping', name: 'Encinitas Village Shopping Center', lat: 33.0460, lng: -117.2920 },
          { id: 'poi-encinitas-diner', name: 'Encinitas Café Diner', lat: 33.0480, lng: -117.2927 }
        ]
      },
      {
        id: 'encinitas-cardiff',
        name: 'Cardiff-by-the-Sea',
        lat: 33.0203,
        lng: -117.2780,
        stops: [
          { id: 'poi-cardiff-kook', name: 'Cardiff Kook Statue', lat: 33.0246, lng: -117.2787 },
          { id: 'poi-seaside-market', name: 'Seaside Market', lat: 33.0222, lng: -117.2792 },
          { id: 'poi-cardiff-beach', name: 'Cardiff State Beach', lat: 33.0167, lng: -117.2833 },
          { id: 'poi-cardiff-restroom', name: 'Beach Restroom', lat: 33.0170, lng: -117.2830 },
          { id: 'poi-cardiff-park', name: 'Glen Park', lat: 33.0195, lng: -117.2785 },
          { id: 'poi-cardiff-trail-entrance1', name: 'San Elijo Lagoon Trail Entrance (East)', lat: 33.0210, lng: -117.2730 },
          { id: 'poi-cardiff-trail-entrance2', name: 'San Elijo Lagoon Trail Entrance (West)', lat: 33.0175, lng: -117.2810 }
        ]
      },
      {
        id: 'encinitas-leucadia',
        name: 'Leucadia',
        lat: 33.0750,
        lng: -117.3047,
        stops: [
          { id: 'poi-leucadia-donut', name: 'Leucadia Donut Shoppe', lat: 33.0739, lng: -117.3052 },
          { id: 'poi-beacons-beach', name: 'Beacon’s Beach', lat: 33.0752, lng: -117.3070 },
          { id: 'poi-leucadia-restroom', name: 'Beach Restroom', lat: 33.0750, lng: -117.3065 },
          { id: 'poi-leucadia-park', name: 'Leucadia Oaks Park', lat: 33.0735, lng: -117.3030 },
          { id: 'poi-leucadia-cafe', name: 'Pannikin Coffee & Tea', lat: 33.0755, lng: -117.3040 },
          { id: 'poi-leucadia-trail-entrance1', name: 'Leucadia Trail Entrance (North)', lat: 33.0770, lng: -117.3050 },
          { id: 'poi-leucadia-trail-entrance2', name: 'Leucadia Trail Entrance (South)', lat: 33.0720, lng: -117.3045 }
        ]
      },
      {
        id: 'encinitas-olivenhain',
        name: 'Olivenhain',
        lat: 33.0496,
        lng: -117.2276,
        stops: [
          { id: 'poi-olivenhain-meetinghall', name: 'Olivenhain Meeting Hall', lat: 33.0497, lng: -117.2277 },
          { id: 'poi-olivenhain-park', name: 'Little Oaks Park', lat: 33.0502, lng: -117.2280 },
          { id: 'poi-olivenhain-restroom', name: 'Park Restroom', lat: 33.0500, lng: -117.2281 },
          { id: 'poi-olivenhain-trail-entrance1', name: 'Olivenhain Trail Entrance (North)', lat: 33.0520, lng: -117.2250 },
          { id: 'poi-olivenhain-trail-entrance2', name: 'Olivenhain Trail Entrance (South)', lat: 33.0480, lng: -117.2290 }
        ]
      },
      {
        id: 'encinitas-lacosta',
        name: 'La Costa',
        lat: 33.0896,
        lng: -117.2677,
        stops: [
          { id: 'poi-lacosta-resort', name: 'Omni La Costa Resort & Spa', lat: 33.0897, lng: -117.2672 },
          { id: 'poi-lacosta-town-square', name: 'La Costa Town Square Shopping Center', lat: 33.0921, lng: -117.2622 },
          { id: 'poi-lacosta-park', name: 'Stagecoach Community Park', lat: 33.0891, lng: -117.2657 },
          { id: 'poi-lacosta-elementary', name: 'La Costa Heights Elementary', lat: 33.0926, lng: -117.2702 },
          { id: 'poi-lacosta-cafe', name: 'La Costa Coffee Roasting', lat: 33.0906, lng: -117.2656 },
          { id: 'poi-lacosta-trail-entrance1', name: 'La Costa Trail Entrance (North)', lat: 33.0930, lng: -117.2680 },
          { id: 'poi-lacosta-trail-entrance2', name: 'La Costa Trail Entrance (South)', lat: 33.0870, lng: -117.2660 }
        ]
      },
      {
        id: 'encinitas-airport',
        name: 'McClellan-Palomar Airport (Nearby)',
        lat: 33.1283,
        lng: -117.2790,
        stops: [
          { id: 'poi-airport-main', name: 'Airport Main Terminal', lat: 33.1283, lng: -117.2790 }
        ]
      }
    ]
  }
  // Add more parks or city divisions here in the future
];


/**
 * Main Component
 */

export default function Parks({
  parksData: _parksData = PARKS_DATA,
  defaultSort = 'distance'
}) {
  // Edit mode toggle
  const [editMode, setEditMode] = useState(false);
  const { location, error } = useLiveLocation();
  const [completed, setCompleted] = useState({});
  const [sortMode, setSortMode] = useState(defaultSort);
  const [mapPreference, setMapPreference] = useState(MAP_PREFERENCE_AUTO);
  // LocalStorage persistence
  const LS_KEY = 'parksDataV1';
  const [parksData, setParksData] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return _parksData;
  });
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(parksData));
    } catch {}
  }, [parksData]);
  const [selectedParkId, setSelectedParkId] = useState(parksData[0]?.id || '');
  // Editing state
  const [editState, setEditState] = useState({});

  // Find selected park
  const selectedPark = useMemo(
    () => parksData.find((p) => p.id === selectedParkId) || parksData[0],
    [parksData, selectedParkId]
  );

  // --- Edit/Add/Delete Logic ---
  function handleEditParkField(parkId, field, value) {
    setParksData(parksData.map(p => p.id === parkId ? { ...p, [field]: value } : p));
  }
  function handleEditFeatureField(parkId, featureId, field, value) {
    setParksData(parksData.map(p =>
      p.id === parkId ? {
        ...p,
        features: p.features.map(f => f.id === featureId ? { ...f, [field]: value } : f)
      } : p
    ));
  }
  function handleEditStopField(parkId, featureId, stopId, field, value) {
    setParksData(parksData.map(p =>
      p.id === parkId ? {
        ...p,
        features: p.features.map(f =>
          f.id === featureId ? {
            ...f,
            stops: f.stops.map(s => s.id === stopId ? { ...s, [field]: value } : s)
          } : f
        )
      } : p
    ));
  }
  function handleDeletePark(parkId) {
    setParksData(parksData.filter(p => p.id !== parkId));
    if (selectedParkId === parkId && parksData.length > 1) setSelectedParkId(parksData[0].id);
  }
  function handleDeleteFeature(parkId, featureId) {
    setParksData(parksData.map(p =>
      p.id === parkId ? { ...p, features: p.features.filter(f => f.id !== featureId) } : p
    ));
  }
  function handleDeleteStop(parkId, featureId, stopId) {
    setParksData(parksData.map(p =>
      p.id === parkId ? {
        ...p,
        features: p.features.map(f =>
          f.id === featureId ? { ...f, stops: f.stops.filter(s => s.id !== stopId) } : f
        )
      } : p
    ));
  }
  function handleAddPark() {
    const id = `park-${Date.now()}`;
    setParksData([
      ...parksData,
      { id, name: 'New Park', features: [] }
    ]);
    setSelectedParkId(id);
  }
  // Refs for feature scrolling
  const featureRefs = useRef({});
  function handleAddFeature(parkId) {
    const newId = `feature-${Date.now()}`;
    // Use current location if available
    const lat = location?.lat ?? 0;
    const lng = location?.lng ?? 0;
    setParksData(prev => prev.map(p =>
      p.id === parkId ? {
        ...p,
        features: [...p.features, { id: newId, name: 'New Feature', lat, lng, stops: [] }]
      } : p
    ));
    // Scroll after DOM update
    setTimeout(() => {
      if (featureRefs.current[newId]) {
        featureRefs.current[newId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
  function handleAddStop(parkId, featureId) {
    setParksData(parksData.map(p =>
      p.id === parkId ? {
        ...p,
        features: p.features.map(f =>
          f.id === featureId ? {
            ...f,
            stops: [...f.stops, { id: `stop-${Date.now()}`, name: 'New POI', lat: 0, lng: 0 }]
          } : f
        )
      } : p
    ));
  }

  // Sort + Distance Calculation for selected park
  const sortedFeatures = useMemo(() => {
    if (!selectedPark?.features?.length) return [];
    let enriched = selectedPark.features.map((f, index) => {
      let distance = Infinity;
      if (location) {
        distance = getDistanceMeters(location.lat, location.lng, f.lat, f.lng);
      }
      return {
        ...f,
        distance,
        parkOrder: index,
        completed: !!completed[f.id]
      };
    });
    const active = enriched.filter((f) => !f.completed);
    const done = enriched.filter((f) => f.completed);
    if (sortMode === 'distance') {
      active.sort((a, b) => a.distance - b.distance);
    } else {
      active.sort((a, b) => a.parkOrder - b.parkOrder);
    }
    return [...active, ...done];
  }, [selectedPark, location, completed, sortMode]);

  function toggleComplete(id) {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Clear all checkboxes for a feature/division
  function clearFeatureChecks(feature) {
    setCompleted((prev) => {
      const next = { ...prev };
      delete next[feature.id];
      if (feature.stops && feature.stops.length) {
        feature.stops.forEach(stop => { delete next[stop.id]; });
      }
      return next;
    });
  }

  // Clear all checkboxes for a park/city
  function clearParkChecks(park) {
    setCompleted((prev) => {
      const next = { ...prev };
      if (park.features && park.features.length) {
        park.features.forEach(feature => {
          delete next[feature.id];
          if (feature.stops && feature.stops.length) {
            feature.stops.forEach(stop => { delete next[stop.id]; });
          }
        });
      }
      return next;
    });
  }

  return (
    <div className='containerDetail color-lite mt--25 bg-lite'>
      {/* Park Selection Menu */}
      <div className='containerDetail color-yellow size20 p-20 contentLeft bg-lite'>
        <span role='img' aria-label='park'>🏞️</span> Parks & Points of Interest
      </div>
      {/* Map Selector */}
      <div className='containerDetail color-lite contentLeft bg-lite mt-5 mb-5 flexContainer'>
        <label className='containerDetail color-yellow p-10 flex2Column contentRight'>
          Map:
        </label>
        <select
          className='containerDetail p-10 bg-tintedMedium color-lite flex2Column mt--5 mb--5'
          value={mapPreference}
          onChange={e => setMapPreference(e.target.value)}
        >
          <option value={MAP_PREFERENCE_AUTO}>Auto</option>
          <option value={MAP_PREFERENCE_APPLE}>Apple Maps</option>
          <option value={MAP_PREFERENCE_GOOGLE}>Google Maps</option>
        </select>
      </div>
      <div className='containerDetail color-lite contentLeft bg-lite mt-5 ht-100'>
        {parksData.map((park, idx) => (
          <div key={park.id} className={`containerDetail ${idx !== parksData.length - 1 ? 'mb-5' : ''} p-10 color-yellow ${selectedParkId === park.id ? 'bg-green' : 'bg-lite'}`}
            style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSelectedParkId(park.id)}>{park.name}</span>
            {editMode && (
              <>
                <button className='ml-5 button bg-lite color-orange' onClick={() => handleDeletePark(park.id)}>🗑️</button>
                <button className='ml-5 button bg-lite color-yellow' onClick={() => setEditState({ type: 'edit-park', parkId: park.id })}>✏️</button>
              </>
            )}
          </div>
        ))}
        {editMode && (
          <button className='containerDetail mt-5 button bg-green color-yellow' onClick={handleAddPark}>Add Park/City</button>
        )}
      </div>
      {/* Edit Park Modal */}
      {editState.type === 'edit-park' && (
        <div className='containerDetail bg-lite p-20' style={{ position: 'fixed', top: 100, left: '20%', right: '20%', zIndex: 1000, border: '2px solid #ccc' }}>
          <h3>Edit Park/City</h3>
          <input
            className='containerDetail p-10 mb-10'
            value={parksData.find(p => p.id === editState.parkId)?.name || ''}
            onChange={e => handleEditParkField(editState.parkId, 'name', e.target.value)}
          />
          <button className='button bg-green color-yellow ml-5' onClick={() => setEditState({})}>Done</button>
        </div>
      )}
      {/*editMode && (
          <li
            key={f.id}
            ref={el => { if (el) featureRefs.current[f.id] = el; }}
            className='containerDetail bg-lite mb-5'
            style={{ listStyle: 'none' }}
          >
            <div className='containerDetail flexContainer p-20' style={{ position: 'relative' }}>
              <label className='flex2Column flexContainer contentLeft'>
                <input
                  type='checkbox'
                  checked={!!completed[f.id]}
                  onChange={() => toggleComplete(f.id)}
                />
                <span
                  className='color-yellow ml-10'
                  style={{
                    textDecoration: completed[f.id] ? 'line-through' : 'none',
                    fontSize: '18px'
                  }}
                >
                  {f.name}
                </span>
              </label>
              <button className='button bg-lite color-yellow ml-10' style={{ position: 'absolute', right: 0, top: 0 }} onClick={() => clearFeatureChecks(f)} title='Clear all checkboxes in this feature/division'>Reset</button>
              {location && !completed[f.id] && (
                <span className='flexColumn mr-5 mt-2 color-yellow'>
                  {metersToMiles(f.distance).toFixed(2)}<span className='copyright'>miles</span>
                </span>
              )}
              {editMode && (
                <div className='flexColumn mr-5 mt-2 color-yellow'>
                  <button className='ml-5 button bg-lite color-orange mr-5' onClick={() => handleDeleteFeature(selectedPark.id, f.id)}>🗑️</button>
                  <button className='ml-5 button bg-lite color-yellow mr-5' onClick={() => setEditState({ type: 'edit-feature', parkId: selectedPark.id, featureId: f.id })}>✏️</button>
                </div>
              )}
            </div>
          </li>
      )
      */}
      {/* Sort Controls */}
      <div className='containerDetail color-lite contentLeft bg-lite mt-5 flexContainer'>
        <div
          onClick={() => setSortMode('distance')}
          className={`containerDetail flex3Column p-10 color-yellow button ${sortMode === 'distance' ? 'bg-green' : 'bg-lite'}`}
        >
          Sort by Distance
        </div>
        <div
          onClick={() => setSortMode('park')}
          className={`containerDetail ml-5 p-10 flex3Column color-yellow button ${sortMode === 'park' ? 'bg-green' : 'bg-lite'}`}
        >
          Default Order
        </div>
        <div
          className={`containerDetail ml-5 p-10 flex3Column color-yellow button ${editMode ? 'bg-green color-yellow' : 'bg-yellow color-dark'}`}
          onClick={() => setEditMode((v) => !v)}
          title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          ✏️ {editMode ? 'Editing' : 'Edit'}            
        </div>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {!location && <div>Getting location…</div>}
      <div 
        className='containerDetail button bg-green color-yellow width-100-percent mt-5' 
        onClick={() => clearParkChecks(selectedPark)} 
        title='Clear all checkboxes in this park/city'
      >
          ☑️ Reset All
      </div>
      <ul className='containerDetail height--400'>
        {sortedFeatures.map((f, idx) => (
          <li
            key={f.id}
            ref={el => { if (el) featureRefs.current[f.id] = el; }}
            className={`containerDetail bg-lite mb-5 ${idx !== sortedFeatures.length - 1 ? 'mb-5' : 'mb-100'}`}
            style={{ listStyle: 'none' }}
          >
            {/* Feature/Division Header */}
            <div className='containerDetail flexContainer p-20'>
              <label className='flex2Column flexContainer contentLeft'>
                <input
                  type='checkbox'
                  checked={!!completed[f.id]}
                  onChange={() => toggleComplete(f.id)}
                />
                <span
                  className='color-yellow ml-10'
                  style={{
                    textDecoration: completed[f.id] ? 'line-through' : 'none',
                    fontSize: '18px'
                  }}
                >
                  {f.name}
                </span>
              </label>
              {!editMode && location && !completed[f.id] && (
                <span className='flexColumn mr-5 mt-2 color-yellow'>
                  {metersToMiles(f.distance).toFixed(2)}<span className='copyright'>miles</span>
                </span>
              )}
              {editMode && (
                <div className='flexColumn mr-5 mt-2 color-yellow'>
                  <button className='ml-5 button bg-lite color-orange mr-5' onClick={() => handleDeleteFeature(selectedPark.id, f.id)}>🗑️</button>
                  <button className='ml-5 button bg-lite color-yellow mr-5' onClick={() => setEditState({ type: 'edit-feature', parkId: selectedPark.id, featureId: f.id })}>✏️</button>
                </div>
              )}
            </div>
            {/* Edit Feature Modal */}
            {editState.type === 'edit-feature' && editState.featureId === f.id && (
              <div className='containerDetail bg-lite p-20 mt-5'>
                <div className='flexContainer'>
                  <div className='flex2Column contentRight p-10 color-yellow'>
                    Name:
                  </div>
                  <input
                    className='containerDetail p-10 mb-10 bg-tintedMedium color-lite flex2Column'
                    value={f.name}
                    onChange={e => handleEditFeatureField(selectedPark.id, f.id, 'name', e.target.value)}
                  />
                </div>
                <div className='flexContainer'>
                  <div className='flex2Column contentRight p-10 color-yellow'>
                    Latitude:
                  </div>
                  <input
                    className='containerDetail p-10 mb-10 bg-tintedMedium color-lite flex2Column'
                    type='number'
                    value={f.lat}
                    onChange={e => handleEditFeatureField(selectedPark.id, f.id, 'lat', parseFloat(e.target.value))}
                    placeholder='Latitude'
                  />
                </div>
                <div className='flexContainer'>
                  <div className='flex2Column contentRight p-10 color-yellow'>
                    Longitude:
                  </div>
                  <input
                    className='containerDetail p-10 mb-10 bg-tintedMedium color-lite flex2Column'
                    type='number'
                    value={f.lng}
                    onChange={e => handleEditFeatureField(selectedPark.id, f.id, 'lng', parseFloat(e.target.value))}
                    placeholder='Longitude'
                  />
                </div>
                <div>
                  <button className='button bg-green color-yellow ml-5 p-20 width-100-percent' onClick={() => setEditState({})}>
                    Done
                  </button>
                </div>  
              </div>
            )}
            {/* Nested Stops */}
            {f.stops && f.stops.length > 0 && (
              <ul className='containerDetail mt-5 bg-lite'>
                {f.stops.map((stop) => (
                  <li key={stop.id} className={`containerDetail contentLeft p-10 ${stop.id !== f.stops[f.stops.length - 1].id ? 'mb-5' : ''}`} style={{ listStyle: 'none' }}>
                    <div className='flexContainer'>
                      <label className='flex2Column button'>
                        <input
                          type='checkbox'
                          checked={!!completed[stop.id]}
                          onChange={() => toggleComplete(stop.id)}
                        />
                        <span
                          style={{
                            textDecoration: completed[stop.id] ? 'line-through' : 'none',
                            fontSize: '14px'
                          }}
                          className='color-lite ml-10'
                        >
                          {stop.name}
                        </span>
                      </label>
                      {editMode && (
                        <div className='contentRight'>
                          <button className='ml-5 button bg-lite color-orange mr-5' onClick={() => handleDeleteStop(selectedPark.id, f.id, stop.id)}>🗑️</button>
                          <button className='ml-5 button bg-lite color-yellow mr-5' onClick={() => setEditState({ type: 'edit-stop', parkId: selectedPark.id, featureId: f.id, stopId: stop.id })}>✏️</button>
                        </div>
                      )}
                      {!editMode && (
                        <div className='flexColumn flexContainer'>
                          {location && !completed[stop.id] && (
                            <span className='mr-5 flexColumn'>
                              {metersToMiles(
                                getDistanceMeters(location.lat, location.lng, stop.lat, stop.lng)
                              ).toFixed(2)}<span className='copyright mr-5'>miles</span>
                            </span>
                          )}
                          <button
                            className='containerDetail flexColumn ml-5 p-5 color-yellow button bg-green'
                            style={{ fontSize: 12 }}
                            title='Open in Maps'
                            onClick={() => openPoiInMaps({ lat: stop.lat, lng: stop.lng }, mapPreference)}
                          >
                            Open in Maps
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Edit Stop Modal */}
                    {editState.type === 'edit-stop' && editState.stopId === stop.id && (
                      <div className='containerDetail bg-lite p-20 mt-5'>
                        <div className='flexContainer'>
                          <div className='flex2Column contentRight p-10 color-yellow'>
                            Name:
                          </div>
                          <input
                            className='containerDetail p-10 mb-10 bg-tintedMedium color-lite flex2Column'
                            value={stop.name}
                            onChange={e => handleEditStopField(selectedPark.id, f.id, stop.id, 'name', e.target.value)}
                          />
                        </div>
                        <div className='flexContainer'>
                          <div className='flex2Column contentRight p-10 color-yellow'>
                            Latitude:
                          </div>
                          <input
                            className='containerDetail p-10 mb-10 bg-tintedMedium color-lite flex2Column'
                            type='number'
                            value={stop.lat}
                            onChange={e => handleEditStopField(selectedPark.id, f.id, stop.id, 'lat', parseFloat(e.target.value))}
                            placeholder='Latitude'
                          />
                        </div>
                        <div className='flexContainer'>
                          <div className='flex2Column contentRight p-10 color-yellow'>
                            Longitude:
                          </div>
                          <input
                            className='containerDetail p-10 mb-10 bg-tintedMedium color-lite flex2Column'
                            type='number'
                            value={stop.lng}
                            onChange={e => handleEditStopField(selectedPark.id, f.id, stop.id, 'lng', parseFloat(e.target.value))}
                            placeholder='Longitude'
                          />
                        </div>
                        <button 
                          className='button bg-green color-yellow ml-5 p-20 width-100-percent' 
                          onClick={() => setEditState({})}>
                            Done
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                <div
                  className='containerDetail button bg-green color-yellow width-100-percent mt-5'
                  onClick={() => clearFeatureChecks(f)}
                  title='Clear all checkboxes in this feature/division'
                >
                  ☑️ Reset
                </div>
                {editMode && (
                  <li 
                    className='containerDetail flexContainer p-20 width-100-percent button size20 bg-green color-yellow mt-5 contentCenter' 
                    style={{ listStyle: 'none' }} 
                    onClick={() => handleAddStop(selectedPark.id, f.id)}
                    >
                      ➕ Add
                  </li>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Basic Styles
 */
const styles = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: 16
  },
  controls: {
    display: 'flex',
    gap: 8,
    marginBottom: 12
  },
  btn: {
    padding: '6px 10px',
    cursor: 'pointer'
  },
  activeBtn: {
    padding: '6px 10px',
    background: '#333',
    color: '#fff',
    cursor: 'pointer'
  },
  list: {
    listStyle: 'none',
    padding: 0
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#222222',
    paddingLeft: 8,
    borderRadius: 4
  },
  stopsList: {
    listStyle: 'none',
    padding: 0,
    marginLeft: 24,
    marginBottom: 8
  },
  stopItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    backgroundColor: '#333333',
    fontSize: '14px'
  },
  label: {
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  },
  distance: {
    opacity: 0.7,
    fontSize: 12
  },
  error: {
    color: 'red',
    marginBottom: 8
  }
};