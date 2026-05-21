// lib/api.js
import { fetchOpenMeteoJson, roundCoord } from '../../utils/openMeteoClient';
import { fetchBuoyData } from '../../utils/noaaClient';

function toCompassDirection(degrees) {
    if (degrees == null || Number.isNaN(Number(degrees))) return null;

    const normalized = ((Number(degrees) % 360) + 360) % 360;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % directions.length;
    return directions[index];
}

export async function fetchWind(lat, lon) {
    const safeLat = roundCoord(lat, 3);
    const safeLon = roundCoord(lon, 3);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${safeLat}&longitude=${safeLon}&current_weather=true`;
    const data = await fetchOpenMeteoJson(url, {
        cacheKey: `wind:${safeLat}:${safeLon}`,
        ttlMs: 10 * 60 * 1000,
        allowStaleOnError: true
    });

    return {
        windSpeed: data?.current_weather?.windspeed ?? data?.current?.wind_speed_10m ?? 0,
        windDir: toCompassDirection(
            data?.current_weather?.winddirection ?? data?.current?.wind_direction_10m
        )
    };
}

export async function fetchWindBatch(beaches) {
    if (!Array.isArray(beaches) || beaches.length === 0) {
        return {};
    }

    const latitudes = beaches.map((beach) => roundCoord(beach.lat, 3));
    const longitudes = beaches.map((beach) => roundCoord(beach.lon, 3));
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitudes.join(',')}&longitude=${longitudes.join(',')}&current_weather=true`;

    try {
        const payload = await fetchOpenMeteoJson(url, {
            cacheKey: `wind-batch:${latitudes.join(',')}:${longitudes.join(',')}`,
            ttlMs: 10 * 60 * 1000,
            allowStaleOnError: true
        });

        const records = Array.isArray(payload)
            ? payload
            : (Array.isArray(payload?.results) ? payload.results : [payload]);

        const windByCoord = new Map(
            records
                .filter(Boolean)
                .map((item) => {
                    const key = `${roundCoord(item.latitude, 3)}:${roundCoord(item.longitude, 3)}`;
                    const speed = item?.current_weather?.windspeed ?? item?.current?.wind_speed_10m ?? 0;
                    const direction = toCompassDirection(
                        item?.current_weather?.winddirection ?? item?.current?.wind_direction_10m
                    );
                    return [key, { windSpeed: speed, windDir: direction }];
                })
        );

        return beaches.reduce((acc, beach) => {
            const key = `${roundCoord(beach.lat, 3)}:${roundCoord(beach.lon, 3)}`;
            acc[beach.name] = windByCoord.get(key) ?? { windSpeed: 0, windDir: null };
            return acc;
        }, {});
    } catch (error) {
        return beaches.reduce((acc, beach) => {
            acc[beach.name] = { windSpeed: 0, windDir: null };
            return acc;
        }, {});
    }
}

// NOAA CO-OPS tide station for San Diego county beaches
const SD_TIDE_STATION = '9410170'; // San Diego, CA
const tideCache = new Map();
const TIDE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — predictions don't change

export const TIDE_STATIONS = [
    { id: '9410660', name: 'Los Angeles', lat: 33.7199, lon: -118.2729 },
    { id: '9410230', name: 'La Jolla', lat: 32.8669, lon: -117.2571 },
    { id: '9410170', name: 'San Diego', lat: 32.7142, lon: -117.1736 },
];

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function distanceKm(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;
    const deltaLat = toRadians(lat2 - lat1);
    const deltaLon = toRadians(lon2 - lon1);
    const startLat = toRadians(lat1);
    const endLat = toRadians(lat2);

    const a = Math.sin(deltaLat / 2) ** 2
        + Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

export function getNearestTideStation(lat, lon, fallbackStationId = SD_TIDE_STATION) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return TIDE_STATIONS.find((station) => station.id === fallbackStationId)
            || TIDE_STATIONS.find((station) => station.id === SD_TIDE_STATION)
            || TIDE_STATIONS[0];
    }

    return TIDE_STATIONS.reduce((nearest, station) => {
        if (!nearest) return station;

        const nearestDistance = distanceKm(lat, lon, nearest.lat, nearest.lon);
        const stationDistance = distanceKm(lat, lon, station.lat, station.lon);

        return stationDistance < nearestDistance ? station : nearest;
    }, null);
}

function formatNoaaDate(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}${month}${day} ${hours}:${minutes}`;
}

export async function fetchTideForecastSeries(stationId = SD_TIDE_STATION, hours = 48) {
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const end = new Date(now);
    end.setHours(end.getHours() + hours);

    const cacheKey = `tide-series:${stationId}:${formatNoaaDate(now)}:${hours}`;
    const cached = tideCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < TIDE_CACHE_TTL_MS) {
        return cached.data;
    }

    const requestPredictions = async (interval) => {
        const params = new URLSearchParams({
            station: stationId,
            product: 'predictions',
            datum: 'MLLW',
            time_zone: 'lst_ldt',
            units: 'english',
            format: 'json',
            interval,
            begin_date: formatNoaaDate(now),
            end_date: formatNoaaDate(end),
        });

        const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params.toString()}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`NOAA tide forecast HTTP ${resp.status}`);
        }

        const json = await resp.json();
        return Array.isArray(json?.predictions) ? json.predictions : [];
    };

    // Prefer denser 6-minute predictions for accurate in-window tide reporting.
    // Fall back to hourly if the station/API does not support interval=6.
    let predictions = [];
    try {
        predictions = await requestPredictions('6');
    } catch (_error) {
        predictions = await requestPredictions('h');
    }

    if (!predictions.length) {
        predictions = await requestPredictions('h');
    }

    tideCache.set(cacheKey, { fetchedAt: Date.now(), data: predictions });
    return predictions;
}

/**
 * Fetch real tide phase and factor from NOAA CO-OPS hi/lo predictions.
 * Falls back to a deterministic sine-based estimate if the API is unavailable.
 */
export async function fetchTide(beachId) {
    const cacheKey = `tide:${SD_TIDE_STATION}`;
    const now = Date.now();
    const cached = tideCache.get(cacheKey);
    if (cached && now - cached.fetchedAt < TIDE_CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
            `?station=${SD_TIDE_STATION}&product=predictions&datum=MLLW` +
            `&time_zone=lst_ldt&units=english&format=json&date=today&interval=hilo`;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`NOAA tide HTTP ${resp.status}`);
        const json = await resp.json();

        const predictions = (json.predictions || []).map(p => ({
            t: new Date(p.t).getTime(),
            v: parseFloat(p.v),
            type: p.type // 'H' or 'L'
        }));

        if (!predictions.length) throw new Error('No predictions returned');

        // Find the surrounding hi/lo events bracketing now
        let prev = null;
        let next = null;
        for (const p of predictions) {
            if (p.t <= now) prev = p;
            else if (!next) next = p;
        }

        if (!prev || !next) throw new Error('Cannot bracket current time');

        // How far through the current half-cycle are we (0–1)
        const progress = (now - prev.t) / (next.t - prev.t);

        let phase, factor;
        const direction = next.type === 'H' ? 'rising' : 'falling';
        if (next.type === 'H') {
            // Rising toward high tide
            if (progress < 0.33)      { phase = 'low';  factor = 0.85; }
            else if (progress < 0.67) { phase = 'mid';  factor = 1.0; }
            else                      { phase = 'high'; factor = 1.2; }
        } else {
            // Falling toward low tide
            if (progress < 0.33)      { phase = 'high'; factor = 1.2; }
            else if (progress < 0.67) { phase = 'mid';  factor = 1.0; }
            else                      { phase = 'low';  factor = 0.85; }
        }

        const level = prev.v + (next.v - prev.v) * progress;
        const data = { phase, factor, level: +level.toFixed(2), direction };
        tideCache.set(cacheKey, { fetchedAt: now, data });
        return data;
    } catch (_err) {
        // Deterministic fallback: approximate 12.4h tidal cycle from current time
        const hour = new Date().getHours() + new Date().getMinutes() / 60;
        const sinVal = Math.sin((hour % 12.4) / 12.4 * Math.PI * 2);
        let phase, factor, direction;
        if (sinVal > 0.33)       { phase = 'high'; factor = 1.2; direction = 'falling'; }
        else if (sinVal < -0.33) { phase = 'low';  factor = 0.85; direction = 'rising'; }
        else                     { phase = 'mid';  factor = 1.0; direction = Math.cos((hour % 12.4) / 12.4 * Math.PI * 2) >= 0 ? 'rising' : 'falling'; }
        return { phase, factor, direction };
    }
}

/**
 * Fetch real wave data from NDBC buoy assigned to this beach.
 * Falls back to simulated values if the buoy is unavailable.
 *
 * @param {Object} beach - beach object with a `buoyId` field
 */
export async function fetchWave(beach) {
    const stationId = beach?.buoyId;
    if (stationId) {
        try {
            const buoy = await fetchBuoyData(stationId);
            if (buoy && buoy.waveHeight != null && buoy.wavePeriod != null) {
                return {
                    waveHeight: buoy.waveHeight,
                    wavePeriod: buoy.wavePeriod,
                    waveDir:    buoy.waveDir,
                    waterTemp:  buoy.waterTemp,
                    dataSource: 'ndbc',
                };
            }
        } catch {
            // fall through to simulation
        }
    }

    // Simulated fallback
    return {
        waveHeight: +(Math.random() * 2.5 + 0.5).toFixed(2),
        wavePeriod: +(6 + Math.random() * 7).toFixed(1),
        waveDir:    null,
        waterTemp:  null,
        dataSource: 'simulated',
    };
}
