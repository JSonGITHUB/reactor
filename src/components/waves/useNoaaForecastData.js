import { useEffect, useState } from 'react';
import { fetchBuoyTrendData } from '../../utils/noaaClient';

const getWindDirectionLabel = (degrees) => {
    if (!Number.isFinite(Number(degrees))) return null;
    const normalized = ((Number(degrees) % 360) + 360) % 360;
    const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % labels.length;
    return labels[index];
};

/**
 * NOAA/NDBC regional buoy trend for the past 48 hours.
 * Normalized to the same row shape used by ForecastChart.
 */
export function useNoaaForecastData(buoyId, hours = 48) {
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchForecast = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!buoyId) {
                    throw new Error('No buoy configured for this beach');
                }

                const rows = await fetchBuoyTrendData(buoyId, hours);
                if (!rows.length) {
                    throw new Error('No NOAA buoy trend rows returned');
                }

                const normalized = rows.map((row) => {
                    const date = new Date(row.timestamp);
                    const hour = date.getHours();
                    const isTonight = date.getDate() === new Date().getDate();
                    const dayLabel = isTonight ? 'Today' : 'Tomorrow';
                    const timeStr = `${(hour % 12 || 12).toString().padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;

                    return {
                        time: timeStr,
                        shortTime: `${hour}h`,
                        swellHeight: row.waveHeight,
                        wind: row.windSpeed,
                        windDir: getWindDirectionLabel(row.windDir),
                        windDirectionDegrees: row.windDir,
                        waterTemp: row.waterTempC,
                        waterTempSource: Number.isFinite(row.waterTempC)
                            ? 'NOAA/NDBC buoy water temperature'
                            : null,
                        airTemp: row.airTempC,
                        airTempSource: Number.isFinite(row.airTempC)
                            ? 'NOAA/NDBC buoy air temperature'
                            : null,
                        period: row.wavePeriod,
                        hour,
                        day: dayLabel,
                        date,
                        timestamp: row.timestamp,
                        source: 'noaa-ndbc',
                    };
                });

                if (!cancelled) {
                    setForecastData(normalized);
                }
            } catch (err) {
                if (!cancelled) {
                    setForecastData(null);
                    setError(err?.message || 'Failed to fetch NOAA forecast');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchForecast();

        return () => {
            cancelled = true;
        };
    }, [buoyId, hours]);

    return { forecastData, loading, error };
}

export default useNoaaForecastData;
