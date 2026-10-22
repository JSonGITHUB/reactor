import { useEffect, useMemo, useState } from 'react';
import { fetchTideForecastSeries, getNearestTideStation } from './api';
import { getStoredTideSeries } from './tideUtils';

/**
 * Hook that fetches a 48-hour tide forecast series for a given coordinate.
 *
 * @param {number} lat - Latitude of the beach
 * @param {number} lon - Longitude of the beach
 * @returns {{ tideRows: Array, tideStation: object|null, loading: boolean, error: string|null }}
 */
const useTideForecastData = (lat, lon) => {
    const [tideRows, setTideRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tideStation = useMemo(
        () => getNearestTideStation(lat, lon),
        [lat, lon]
    );

    const tideStationId = tideStation?.id || '9410230';

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        const load = async () => {
            try {
                const rows = await fetchTideForecastSeries(tideStationId, 48);
                if (!cancelled) {
                    setTideRows(Array.isArray(rows) ? rows : []);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setTideRows(getStoredTideSeries());
                    setError(err?.message || 'Failed to fetch tide forecast');
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [tideStationId]);

    return { tideRows, tideStation, loading, error };
};

export default useTideForecastData;
