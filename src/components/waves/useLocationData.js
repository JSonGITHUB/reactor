import { useCallback, useEffect, useMemo, useState } from 'react';

// Hook that fetches browser geolocation and reverse geocodes it via Nominatim.
// Provides a snapshot object plus a request function so it can be reused outside the UI component.
// Now also accepts a coords tuple [latitude, longitude] to bypass geolocation.
const useLocationData = ({ autoRequest = true, coords = null } = {}) => {
    const [location, setLocation] = useState(null);
    const [data, setData] = useState(null);
    const [zipCode, setZipCode] = useState('');
    const [city, setCity] = useState('');
    const [road, setRoad] = useState('');
    const [address, setAddress] = useState('');
    const [suburb, setSuburb] = useState('');
    const [county, setCounty] = useState('');
    const [region, setRegion] = useState('');
    const [country, setCountry] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const requestLocation = useCallback(async (opts) => {
        setLoading(true);
        setError('');
        try {
            let latitude;
            let longitude;

            if (opts && typeof opts.latitude === 'number' && typeof opts.longitude === 'number') {
                latitude = opts.latitude;
                longitude = opts.longitude;
                setLocation({ latitude, longitude });
            } else if (coords && Array.isArray(coords) && coords.length === 2 &&
                typeof coords[0] === 'number' && typeof coords[1] === 'number') {
                latitude = coords[0];
                longitude = coords[1];
                setLocation({ latitude, longitude });
            } else {
                if (!navigator.geolocation) {
                    setError('Geolocation is not supported by your browser.');
                    setLoading(false);
                    return;
                }
                const position = await new Promise((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject)
                );
                ({ latitude, longitude } = position.coords);
                setLocation({ latitude, longitude });
            }

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const json = await response.json();
            const addressInfo = json.address || {};

            setData(json);
            setZipCode(
                addressInfo.postcode ||
                addressInfo.zip ||
                'No zip code found for your location.'
            );
            setAddress(addressInfo);
            setRoad(addressInfo.road || '');
            setSuburb(addressInfo.suburb || '');
            setCity(
                addressInfo.city ||
                addressInfo.town ||
                addressInfo.village ||
                addressInfo.hamlet ||
                addressInfo.county ||
                ''
            );
            setRegion(addressInfo.state || '');
            setCountry(addressInfo.country || '');
            setCounty(addressInfo.county || '');
        } catch (err) {
            setError('Unable to retrieve your location. Please allow location access.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (coords && Array.isArray(coords) && coords.length === 2 &&
            typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            // If coords is provided, use it directly and do not call requestLocation
            (async () => {
                setLoading(true);
                setError('');
                try {
                    await requestLocation({ latitude: coords[0], longitude: coords[1] });
                } finally {
                    setLoading(false);
                }
            })();
        } else if (autoRequest) {
            requestLocation();
        }
    }, [autoRequest, requestLocation, coords]);

    const snapshot = useMemo(
        () => ({
            location,
            data,
            zipCode,
            city,
            road,
            address,
            suburb,
            county,
            state: region,
            country,
            loading,
            error
        }),
        [
            location,
            data,
            zipCode,
            city,
            road,
            address,
            suburb,
            county,
            region,
            country,
            loading,
            error
        ]
    );

    return {
        ...snapshot,
        snapshot,
        requestLocation
    };
};

export default useLocationData;
