/**
 * noaaClient.js
 * Fetches and parses NDBC (National Data Buoy Center) realtime observation data.
 * Buoy text files are served with CORS headers and update hourly.
 *
 * NDBC realtime2 format (first two lines are headers):
 * #YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
 * col:  0   1  2  3  4    5    6    7     8     9   10    11    12    13   14    15   16   17   18
 */

const NDBC_BASE = '/api/ndbc/data/realtime2';

// In-memory cache: { stationId: { data, fetchedAt } }
const cache = new Map();
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 min — buoys update ~hourly
const trendCache = new Map();
const TREND_CACHE_TTL_MS = 20 * 60 * 1000;

function parseTimestampUtc(cols) {
    const year = parseInt(cols[0], 10);
    const month = parseInt(cols[1], 10);
    const day = parseInt(cols[2], 10);
    const hour = parseInt(cols[3], 10);
    const minute = parseInt(cols[4], 10);

    if (![year, month, day, hour, minute].every(Number.isFinite)) return null;

    const fullYear = year >= 100 ? year : 2000 + year;
    return new Date(Date.UTC(fullYear, month - 1, day, hour, minute));
}

function parseBuoyText(text) {
    const lines = text.split('\n').filter(Boolean);
    // First two lines are comment headers starting with #
    const dataLines = lines.filter(l => !l.startsWith('#'));
    if (!dataLines.length) return null;

    // Most recent reading is the first data line
    const cols = dataLines[0].trim().split(/\s+/);

    const parseNum = (val) => {
        const n = parseFloat(val);
        return isNaN(n) || val === 'MM' ? null : n;
    };

    return {
        windDir:    parseNum(cols[5]),      // degrees True
        windSpeed:  parseNum(cols[6]),      // m/s → convert below
        windGust:   parseNum(cols[7]),      // m/s
        waveHeight: parseNum(cols[8]),      // meters → convert below
        wavePeriod: parseNum(cols[9]),      // seconds (dominant)
        avgPeriod:  parseNum(cols[10]),     // seconds (average)
        waveDir:    parseNum(cols[11]),     // degrees
        waterTemp:  parseNum(cols[14]),     // °C → convert below
    };
}

function parseBuoyTrendText(text) {
    const lines = text.split('\n').filter(Boolean);
    const dataLines = lines.filter(l => !l.startsWith('#'));
    if (!dataLines.length) return [];

    const parseNum = (val) => {
        const n = parseFloat(val);
        return isNaN(n) || val === 'MM' ? null : n;
    };

    return dataLines
        .map((line) => {
            const cols = line.trim().split(/\s+/);
            const timestamp = parseTimestampUtc(cols);
            if (!timestamp) return null;

            return {
                timestamp: timestamp.getTime(),
                windDir: parseNum(cols[5]),
                windSpeed: parseNum(cols[6]), // m/s
                waveHeight: parseNum(cols[8]), // m
                wavePeriod: parseNum(cols[9]), // s
                airTemp: parseNum(cols[13]), // C
                waterTemp: parseNum(cols[14]), // C
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.timestamp - b.timestamp);
}

function convertUnits(raw) {
    if (!raw) return null;
    return {
        windDir:    raw.windDir,
        windSpeed:  raw.windSpeed   != null ? +(raw.windSpeed * 1.94384).toFixed(1)  : null, // m/s → knots
        windGust:   raw.windGust    != null ? +(raw.windGust  * 1.94384).toFixed(1)  : null,
        waveHeight: raw.waveHeight  != null ? +(raw.waveHeight * 3.28084).toFixed(2) : null, // m → ft
        wavePeriod: raw.wavePeriod  != null ? raw.wavePeriod                          : null,
        avgPeriod:  raw.avgPeriod   != null ? raw.avgPeriod                           : null,
        waveDir:    raw.waveDir,
        waterTemp:  raw.waterTemp   != null ? +(raw.waterTemp * 9/5 + 32).toFixed(1) : null, // °C → °F
    };
}

/**
 * Fetch buoy data for a given NDBC station ID.
 * Returns converted (imperial) values or null fields on missing data.
 *
 * @param {string} stationId - e.g. '46086'
 * @returns {Promise<{windDir, windSpeed, windGust, waveHeight, wavePeriod, avgPeriod, waveDir, waterTemp}>}
 */
export async function fetchBuoyData(stationId) {
    const now = Date.now();
    const cached = cache.get(stationId);
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const url = `${NDBC_BASE}/${stationId}.txt`;
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`NDBC ${stationId}: HTTP ${resp.status}`);
        }
        const text = await resp.text();
        const raw = parseBuoyText(text);
        const data = convertUnits(raw);

        if (data) {
            cache.set(stationId, { data, fetchedAt: now });
        }

        return data;
    } catch (err) {
        // Return stale cache on error rather than failing completely
        if (cached) {
            return cached.data;
        }
        console.warn(`[noaaClient] fetchBuoyData(${stationId}) failed:`, err.message);
        return null;
    }
}

/**
 * Fetch recent buoy trend data for a station over the last N hours.
 * Returns values normalized for chart usage.
 *
 * @param {string} stationId
 * @param {number} hours
 * @returns {Promise<Array<{timestamp:number, waveHeight:number|null, wavePeriod:number|null, windSpeed:number|null, windDir:number|null, airTempC:number|null, waterTempC:number|null}>>}
 */
export async function fetchBuoyTrendData(stationId, hours = 48) {
    const cacheKey = `${stationId}:${hours}`;
    const now = Date.now();
    const cached = trendCache.get(cacheKey);
    if (cached && now - cached.fetchedAt < TREND_CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const url = `${NDBC_BASE}/${stationId}.txt`;
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`NDBC ${stationId}: HTTP ${resp.status}`);
        }

        const text = await resp.text();
        const rawRows = parseBuoyTrendText(text);
        const cutoff = now - (hours * 60 * 60 * 1000);

        const rows = rawRows
            .filter((row) => row.timestamp >= cutoff)
            .map((row) => ({
                timestamp: row.timestamp,
                waveHeight: row.waveHeight != null ? +(row.waveHeight * 3.28084).toFixed(2) : null, // m -> ft
                wavePeriod: row.wavePeriod != null ? +row.wavePeriod : null,
                windSpeed: row.windSpeed != null ? +(row.windSpeed * 1.94384).toFixed(1) : null, // m/s -> knots
                windDir: row.windDir,
                airTempC: row.airTemp != null ? +row.airTemp : null,
                waterTempC: row.waterTemp != null ? +row.waterTemp : null,
            }));

        trendCache.set(cacheKey, { fetchedAt: now, data: rows });
        return rows;
    } catch (err) {
        if (cached) return cached.data;
        console.warn(`[noaaClient] fetchBuoyTrendData(${stationId}) failed:`, err.message);
        return [];
    }
}
