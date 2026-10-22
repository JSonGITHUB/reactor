import { useEffect, useState } from 'react';
import { fetchOpenMeteoJson, roundCoord } from '../../utils/openMeteoClient';

const getWindDirectionLabel = (degrees) => {
    if (!Number.isFinite(Number(degrees))) return null;
    const normalized = ((Number(degrees) % 360) + 360) % 360;
    const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % labels.length;
    return labels[index];
};

const toLon360 = (lon) => {
    const n = Number(lon);
    if (!Number.isFinite(n)) return null;
    return ((n % 360) + 360) % 360;
};

const toIsoUtc = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

const parseWw3CsvRows = (csvText) => {
    const lines = String(csvText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    // Expect header + units + rows
    if (lines.length < 3) return [];

    const rows = [];
    for (let i = 2; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length < 6) continue;

        const timestamp = new Date(cols[0]).getTime();
        if (!Number.isFinite(timestamp)) continue;

        const shgtMeters = Number(cols[4]);
        const sperSeconds = Number(cols[5]);

        rows.push({
            timestamp,
            waveHeightMeters: Number.isFinite(shgtMeters) ? shgtMeters : null,
            wavePeriodSeconds: Number.isFinite(sperSeconds) ? sperSeconds : null,
        });
    }

    return rows;
};

/**
 * NOAA WaveWatch III model point forecast (via PacIOOS ERDDAP).
 * Returns a normalized 48-hour forecast row set.
 */
export function useWaveWatchForecastData(lat = 32.87, lon = -117.26, hours = 48) {
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const fetchForecast = async () => {
            try {
                setLoading(true);
                setError(null);

                const safeLat = roundCoord(lat, 1);
                const safeLon360 = roundCoord(toLon360(lon), 1);
                if (!Number.isFinite(safeLat) || !Number.isFinite(safeLon360)) {
                    throw new Error('Invalid coordinates for WW3 query');
                }

                const now = new Date();
                const end = new Date(now.getTime() + hours * 60 * 60 * 1000);
                const startIso = toIsoUtc(now);
                const endIso = toIsoUtc(end);

                const ww3Constraint = [
                    `shgt[(${startIso}):1:(${endIso})][(0.0)][(${safeLat})][(${safeLon360})]`,
                    `sper[(${startIso}):1:(${endIso})][(0.0)][(${safeLat})][(${safeLon360})]`
                ].join(',');

                const ww3Url = `https://coastwatch.pfeg.noaa.gov/erddap/griddap/NWW3_Global_Best.csv?${encodeURIComponent(ww3Constraint)}`;

                const weatherParams = new URLSearchParams({
                    latitude: roundCoord(lat, 3),
                    longitude: roundCoord(lon, 3),
                    hourly: 'wind_speed_10m,wind_direction_10m,temperature_2m',
                    wind_speed_unit: 'kn',
                    timezone: 'America/Los_Angeles',
                    forecast_days: 2,
                });
                const weatherUrl = `https://api.open-meteo.com/v1/forecast?${weatherParams.toString()}`;

                const marineParams = new URLSearchParams({
                    latitude: roundCoord(lat, 3),
                    longitude: roundCoord(lon, 3),
                    hourly: 'sea_surface_temperature',
                    timezone: 'America/Los_Angeles',
                    forecast_days: 2,
                });
                const marineUrl = `https://marine-api.open-meteo.com/v1/marine?${marineParams.toString()}`;

                const [ww3Response, weatherData, marineData] = await Promise.all([
                    fetch(ww3Url),
                    fetchOpenMeteoJson(weatherUrl, {
                        cacheKey: `forecast-weather:${roundCoord(lat, 3)}:${roundCoord(lon, 3)}`,
                        ttlMs: 30 * 60 * 1000,
                        allowStaleOnError: true
                    }),
                    fetchOpenMeteoJson(marineUrl, {
                        cacheKey: `forecast-marine-temp:${roundCoord(lat, 3)}:${roundCoord(lon, 3)}`,
                        ttlMs: 30 * 60 * 1000,
                        allowStaleOnError: true
                    })
                ]);

                if (!ww3Response.ok) {
                    throw new Error(`WW3 request failed (${ww3Response.status})`);
                }

                const ww3Csv = await ww3Response.text();
                const ww3Rows = parseWw3CsvRows(ww3Csv);
                if (!ww3Rows.length) {
                    throw new Error('WW3 returned no rows for this location/time window');
                }

                const weatherRows = Array.isArray(weatherData?.hourly?.time)
                    ? weatherData.hourly.time.map((timeStr, i) => ({
                        timestamp: new Date(timeStr).getTime(),
                        windKnots: weatherData.hourly.wind_speed_10m?.[i],
                        windDirDegrees: weatherData.hourly.wind_direction_10m?.[i],
                        tempCelsius: weatherData.hourly.temperature_2m?.[i],
                    })).filter((row) => Number.isFinite(row.timestamp))
                    : [];

                const marineRows = Array.isArray(marineData?.hourly?.time)
                    ? marineData.hourly.time.map((timeStr, i) => ({
                        timestamp: new Date(timeStr).getTime(),
                        waterTempCelsius: marineData.hourly.sea_surface_temperature?.[i],
                    })).filter((row) => Number.isFinite(row.timestamp))
                    : [];

                const getNearestWeather = (ts) => {
                    if (!weatherRows.length) return null;

                    let nearest = weatherRows[0];
                    let smallestDiff = Math.abs(weatherRows[0].timestamp - ts);

                    for (let i = 1; i < weatherRows.length; i++) {
                        const row = weatherRows[i];
                        const diff = Math.abs(row.timestamp - ts);
                        if (diff < smallestDiff) {
                            nearest = row;
                            smallestDiff = diff;
                        }
                    }

                    return nearest;
                };

                const getNearestMarine = (ts) => {
                    if (!marineRows.length) return null;

                    let nearest = marineRows[0];
                    let smallestDiff = Math.abs(marineRows[0].timestamp - ts);

                    for (let i = 1; i < marineRows.length; i++) {
                        const row = marineRows[i];
                        const diff = Math.abs(row.timestamp - ts);
                        if (diff < smallestDiff) {
                            nearest = row;
                            smallestDiff = diff;
                        }
                    }

                    return nearest;
                };

                const normalized = ww3Rows.map((row) => {
                    const date = new Date(row.timestamp);
                    const hour = date.getHours();
                    const timeStr = `${(hour % 12 || 12).toString().padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
                    const nearestWeather = getNearestWeather(row.timestamp);
                    const nearestMarine = getNearestMarine(row.timestamp);
                    const hasMarineWaterTemp = Number.isFinite(nearestMarine?.waterTempCelsius);
                    const hasWeatherAirTemp = Number.isFinite(nearestWeather?.tempCelsius);

                    return {
                        time: timeStr,
                        shortTime: `${hour}h`,
                        swellHeight: Number.isFinite(row.waveHeightMeters)
                            ? Math.round((row.waveHeightMeters * 3.28084) * 10) / 10
                            : null,
                        wind: Number.isFinite(nearestWeather?.windKnots)
                            ? Math.round(nearestWeather.windKnots * 10) / 10
                            : null,
                        windDir: getWindDirectionLabel(nearestWeather?.windDirDegrees),
                        windDirectionDegrees: nearestWeather?.windDirDegrees,
                        waterTemp: Number.isFinite(nearestMarine?.waterTempCelsius)
                            ? nearestMarine.waterTempCelsius
                            : null,
                        waterTempSource: hasMarineWaterTemp
                            ? 'Open-Meteo marine sea surface temperature'
                            : null,
                        airTemp: Number.isFinite(nearestWeather?.tempCelsius)
                            ? nearestWeather.tempCelsius
                            : null,
                        airTempSource: hasWeatherAirTemp
                            ? 'Open-Meteo weather 2m air temperature'
                            : null,
                        period: Number.isFinite(row.wavePeriodSeconds)
                            ? Math.round(row.wavePeriodSeconds * 10) / 10
                            : null,
                        hour,
                        day: date.getDate() === new Date().getDate() ? 'Today' : 'Tomorrow',
                        date,
                        timestamp: row.timestamp,
                        source: 'ww3-model',
                    };
                });

                if (!cancelled) {
                    setForecastData(normalized);
                }
            } catch (err) {
                if (!cancelled) {
                    setForecastData(null);
                    setError(err?.message || 'Failed to fetch WW3 forecast');
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
    }, [lat, lon, hours]);

    return { forecastData, loading, error };
}

export default useWaveWatchForecastData;
