import { useState, useEffect } from 'react';

/**
 * useLocation - Custom hook to get current GPS location
 * Returns:
 *  {
 *    latitude: number | null,
 *    longitude: number | null,
 *    error: string | null,
 *    loading: boolean
 *  }
 */
const useLocation = () => {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser.');
            setLoading(false);
            return;
        }

        const onSuccess = (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            setError(null);
            setLoading(false);
        };

        const onError = (err) => {
            setError(err.message || 'Unable to retrieve location');
            setLoading(false);
        };

        const watcher = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });

        // Cleanup function: remove watcher on unmount
        return () => {
            navigator.geolocation.clearWatch(watcher);
        };
    }, []);

    return { latitude, longitude, error, loading };
};

export default useLocation;