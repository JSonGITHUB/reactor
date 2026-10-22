import { useEffect, useState } from 'react';
import { fetchOpenMeteoJson, roundCoord } from '../../utils/openMeteoClient';

const getWindDirectionLabel = (degrees) => {
    if (!Number.isFinite(Number(degrees))) return null;
    const normalized = ((Number(degrees) % 360) + 360) % 360;
    const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % labels.length;
    return labels[index];
};

/**
 * Fetch 48-hour wave/weather forecast from Open-Meteo APIs
 * - Marine endpoint: swell/wave height and period
 * - Forecast endpoint: wind and air temperature
 * Falls back to simulated data on error
 */
export function useForecastData(lat = 32.87, lon = -117.26) {
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                setError(null);

                // Open-Meteo APIs (free, no key required)
                const weatherUrl = 'https://api.open-meteo.com/v1/forecast';
                const marineUrl = 'https://marine-api.open-meteo.com/v1/marine';
                const safeLat = roundCoord(lat, 3);
                const safeLon = roundCoord(lon, 3);

                const weatherParams = new URLSearchParams({
                    latitude: safeLat,
                    longitude: safeLon,
                    hourly: 'wind_speed_10m,wind_direction_10m,temperature_2m',
                    wind_speed_unit: 'kn',
                    timezone: 'America/Los_Angeles',
                    forecast_days: 2,
                });

                const marineParams = new URLSearchParams({
                    latitude: safeLat,
                    longitude: safeLon,
                    hourly: 'swell_wave_height,swell_wave_period,wave_height,wave_period,sea_surface_temperature',
                    timezone: 'America/Los_Angeles',
                    forecast_days: 2,
                });

                const weatherRequest = fetchOpenMeteoJson(`${weatherUrl}?${weatherParams.toString()}`, {
                    cacheKey: `forecast-weather:${safeLat}:${safeLon}`,
                    ttlMs: 30 * 60 * 1000,
                    allowStaleOnError: true
                });

                const marineRequest = fetchOpenMeteoJson(`${marineUrl}?${marineParams.toString()}`, {
                    cacheKey: `forecast-marine:${safeLat}:${safeLon}`,
                    ttlMs: 30 * 60 * 1000,
                    allowStaleOnError: true
                });

                const [weatherData, marineData] = await Promise.all([weatherRequest, marineRequest]);

                if (!weatherData?.hourly?.time || !marineData?.hourly?.time) {
                    throw new Error('Invalid forecast response structure');
                }

                const marineByTime = new Map(
                    marineData.hourly.time.map((t, i) => [
                        t,
                        {
                            swellWaveHeight: marineData.hourly.swell_wave_height?.[i],
                            swellWavePeriod: marineData.hourly.swell_wave_period?.[i],
                            waveHeight: marineData.hourly.wave_height?.[i],
                            wavePeriod: marineData.hourly.wave_period?.[i],
                            waterTempCelsius: marineData.hourly.sea_surface_temperature?.[i],
                        }
                    ])
                );

                // Parse/merge API responses into forecast format
                const forecast = weatherData.hourly.time.map((timeStr, i) => {
                    const date = new Date(timeStr);
                    const hour = date.getHours();
                    const isTonight = date.getDate() === new Date().getDate();
                    const dayLabel = isTonight ? 'Today' : 'Tomorrow';

                    const marineHour = marineByTime.get(timeStr) || {};

                    // Prefer swell values for trend, then fallback to combined wave values.
                    const waveHeightMeters = Number.isFinite(marineHour.swellWaveHeight)
                        ? marineHour.swellWaveHeight
                        : marineHour.waveHeight;
                    const waveHeightFeet = waveHeightMeters * 3.28084;

                    const windSpeedKnots = weatherData.hourly.wind_speed_10m?.[i];
                    const windDirectionDegrees = weatherData.hourly.wind_direction_10m?.[i];

                    const tempCelsius = weatherData.hourly.temperature_2m?.[i];
                    const waterTempCelsius = marineHour.waterTempCelsius;
                    const wavePeriodSeconds = Number.isFinite(marineHour.swellWavePeriod)
                        ? marineHour.swellWavePeriod
                        : marineHour.wavePeriod;

                    const timeStr2 = `${(hour % 12 || 12).toString().padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;

                    const safeWaveHeightFeet = Number.isFinite(waveHeightFeet) ? waveHeightFeet : 0;
                    const safeWindKnots = Number.isFinite(windSpeedKnots) ? windSpeedKnots : 0;
                    const safeAirTempCelsius = Number.isFinite(tempCelsius) ? tempCelsius : 18;
                    const hasMarineWaterTemp = Number.isFinite(waterTempCelsius);
                    const safeWaterTempCelsius = Number.isFinite(waterTempCelsius)
                        ? waterTempCelsius
                        : null;
                    const safeWavePeriodSeconds = Number.isFinite(wavePeriodSeconds) ? wavePeriodSeconds : 0;

                    return {
                        time: timeStr2,
                        shortTime: `${hour}h`,
                        swellHeight: Math.round(safeWaveHeightFeet * 10) / 10,
                        wind: Math.round(safeWindKnots * 10) / 10,
                        windDir: getWindDirectionLabel(windDirectionDegrees),
                        windDirectionDegrees,
                        waterTemp: safeWaterTempCelsius,
                        waterTempSource: hasMarineWaterTemp
                            ? 'Open-Meteo marine sea surface temperature'
                            : null,
                        airTemp: safeAirTempCelsius,
                        airTempSource: 'Open-Meteo weather 2m air temperature',
                        period: Math.round(safeWavePeriodSeconds * 10) / 10,
                        hour: i,
                        day: dayLabel,
                        date,
                        timestamp: date.getTime(),
                    };
                });

                setForecastData(forecast);
            } catch (err) {
                setError(err.message);
                // Fallback: return null so ForecastChart will generate simulated data
                setForecastData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, [lat, lon]);

    return { forecastData, loading, error };
}
