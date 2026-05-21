const DEFAULT_NOAA_STATION_ID = '9410230';
const DEFAULT_NDBC_STATION_ID = '46254';

const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const NOAA_PROXY_BASE = isLocalDev ? '/api/noaa' : 'https://api.tidesandcurrents.noaa.gov';
const NOAA_BASE = '/api/prod/datagetter';
const NDBC_PROXY_BASE = isLocalDev ? '/api/ndbc' : 'https://www.ndbc.noaa.gov';

const parseNumeric = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const parseNoaaTimestamp = (timestampValue) => {
    if (!timestampValue) return null;
    const parsed = new Date(timestampValue.replace(' ', 'T'));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const cToF = (valueCelsius) => {
    if (!Number.isFinite(valueCelsius)) return null;
    return (valueCelsius * 9 / 5) + 32;
};

const parseNdbcLatestWaterTemp = (rawText) => {
    const lines = String(rawText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !line.startsWith('#'));

    if (!lines.length) return null;

    const latest = lines[0].split(/\s+/);
    if (latest.length < 15) return null;

    const year = Number(latest[0]);
    const month = Number(latest[1]);
    const day = Number(latest[2]);
    const hour = Number(latest[3]);
    const minute = Number(latest[4]);
    const waterTempC = parseNumeric(latest[14] === 'MM' ? null : latest[14]);

    const timestamp = [year, month, day, hour, minute].every(Number.isFinite)
        ? new Date(Date.UTC(year, month - 1, day, hour, minute, 0))
        : null;

    if (timestamp && Number.isNaN(timestamp.getTime())) {
        return {
            valueF: cToF(waterTempC),
            timestamp: null,
        };
    }

    return {
        valueF: cToF(waterTempC),
        timestamp,
    };
};

const fetchNoaaWaterTemp = async (stationId) => {
    const params = new URLSearchParams({
        date: 'latest',
        station: stationId,
        product: 'water_temperature',
        units: 'english',
        time_zone: 'lst_ldt',
        application: 'reactor_shared_water_temp',
        format: 'json',
    });

    const response = await fetch(`${NOAA_PROXY_BASE}${NOAA_BASE}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`NOAA water temperature request failed (${response.status})`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    const latestRow = rows[rows.length - 1] || null;

    const valueF = parseNumeric(latestRow?.v);
    const timestamp = parseNoaaTimestamp(latestRow?.t);

    if (!Number.isFinite(valueF)) {
        throw new Error('NOAA water temperature data unavailable');
    }

    return {
        valueF,
        timestamp,
        source: `NOAA CO-OPS station ${stationId}`,
    };
};

const fetchNdbcWaterTemp = async (stationId) => {
    const response = await fetch(`${NDBC_PROXY_BASE}/data/realtime2/${stationId}.txt`);
    if (!response.ok) {
        throw new Error(`NDBC water temperature request failed (${response.status})`);
    }

    const rawText = await response.text();
    const latest = parseNdbcLatestWaterTemp(rawText);

    if (!latest || !Number.isFinite(latest.valueF)) {
        throw new Error('NDBC water temperature data unavailable');
    }

    return {
        valueF: latest.valueF,
        timestamp: latest.timestamp,
        source: `NDBC station ${stationId}`,
    };
};

export const fetchCurrentWaterTemp = async ({
    noaaStationId = DEFAULT_NOAA_STATION_ID,
    ndbcStationId = DEFAULT_NDBC_STATION_ID,
} = {}) => {
    try {
        return await fetchNoaaWaterTemp(noaaStationId);
    } catch (noaaError) {
        const fallback = await fetchNdbcWaterTemp(ndbcStationId);
        return {
            ...fallback,
            source: `${fallback.source} fallback`,
        };
    }
};

export default fetchCurrentWaterTemp;
