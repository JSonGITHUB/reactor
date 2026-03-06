import React, { useEffect, useMemo, useState } from 'react';

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
 * Sample Data — San Diego Wildlife Animal Park
 */
const SD_WILDLIFE_PARK_FEATURES = [
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
];

/**
 * Main Component
 */
export default function Parks({
  features = SD_WILDLIFE_PARK_FEATURES,
  defaultSort = 'distance' // distance | park
}) {
  const { location, error } = useLiveLocation();

  const [completed, setCompleted] = useState({});
  const [sortMode, setSortMode] = useState(defaultSort);

  /**
   * Sort + Distance Calculation
   */
  const sortedFeatures = useMemo(() => {
    if (!features.length) return [];

    let enriched = features.map((f, index) => {
      let distance = Infinity;

      if (location) {
        distance = getDistanceMeters(
          location.lat,
          location.lng,
          f.lat,
          f.lng
        );
      }

      return {
        ...f,
        distance,
        parkOrder: index,
        completed: !!completed[f.id]
      };
    });

    // Split completed vs active
    const active = enriched.filter((f) => !f.completed);
    const done = enriched.filter((f) => f.completed);

    if (sortMode === 'distance') {
      active.sort((a, b) => a.distance - b.distance);
    } else {
      active.sort((a, b) => a.parkOrder - b.parkOrder);
    }

    return [...active, ...done];
  }, [features, location, completed, sortMode]);

  function toggleComplete(id) {
    setCompleted((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  return (
    <div className='containerDetail color-lite mt--25 bg-lite'>
        <div className='containerDetail color-yellow size20 p-20 contentLeft bg-lite'>
            🏞️ Safari Park
        </div>
        <div className='containerDetail color-lite contentLeft bg-lite mt-5 flexContainer'>
            <div
                onClick={() => setSortMode('distance')}
                className={`containerDetail flex2Column p-10 color-yellow button ${sortMode === 'distance' ? 'bg-green' : 'bg-lite'}`}
            >
                Sort by Distance
            </div>

            <div
            onClick={() => setSortMode('park')}
            className={`containerDetail ml-5 p-10 flex2Column color-yellow button ${sortMode === 'park' ? 'bg-green' : 'bg-lite'}`}
            >
            Park Default Order
            </div>
        </div>

      {error && <div style={styles.error}>{error}</div>}

      {!location && <div>Getting location…</div>}

      <ul className='containerDetail'>
        {sortedFeatures.map((f) => (
          <div key={f.id} className='containerDetail bg-lite mb-5'>
            {/* Attraction Header */}
            <li className='containerDetail flexContainer p-20'>
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

              {location && !completed[f.id] && (
                <span className='flexColumn mr-5 mt-2 color-yellow'>
                  {metersToMiles(f.distance).toFixed(2)}<span className='copyright'>miles</span>
                </span>
              )}
            </li>

            {/* Nested Stops */}
            {f.stops && f.stops.length > 0 && (
              <ul className='containerDetail mt-5 bg-lite'>
                {f.stops.map((stop) => (
                  <li key={stop.id} className={`containerDetail flexContainer contentLeft p-20 ${stop.id !== f.stops[f.stops.length - 1].id ? 'mb-5' : ''}`}>
                    <label className='flex2Column'>
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

                    {location && !completed[stop.id] && (
                      <span className='mr-5 flexColumn'>
                        {metersToMiles(
                          getDistanceMeters(location.lat, location.lng, stop.lat, stop.lng)
                        ).toFixed(2)}<span className='copyright'>miles</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
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