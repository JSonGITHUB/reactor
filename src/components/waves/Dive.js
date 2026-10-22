import React, { useEffect, useMemo, useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import getMatchIcon from './GetMatchIcon';
import fetchCurrentWaterTemp from './waterTempService';

const NOAA_BASE = '/api/prod/datagetter';
const NOAA_STATION_ID = '9410230';
const NDBC_SWELL_STATION_ID = '46254';
const NDBC_VISIBILITY_STATION_IDS = ['46254', '46232', '46225'];
const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const SD_BEACH_BASE = isLocalDev ? '/api/sdbeachinfo' : 'https://www.sdbeachinfo.com';
const SD_BEACH_STATUS_ENDPOINT = `${SD_BEACH_BASE}/Home/GetTargetByID`;
const NOAA_PROXY_BASE = isLocalDev ? '/api/noaa' : 'https://api.tidesandcurrents.noaa.gov';
const NDBC_PROXY_BASE = isLocalDev ? '/api/ndbc' : 'https://www.ndbc.noaa.gov';

const VISIBILITY_CONFIG = {
    url: process.env.REACT_APP_DIVE_VISIBILITY_URL,
    label: process.env.REACT_APP_DIVE_VISIBILITY_LABEL || 'Configured visibility endpoint',
    rowsPath: process.env.REACT_APP_DIVE_VISIBILITY_ROWS_PATH || '',
    timestampField: process.env.REACT_APP_DIVE_VISIBILITY_TIMESTAMP_FIELD || '',
    valueField: process.env.REACT_APP_DIVE_VISIBILITY_VALUE_FIELD || '',
    unit: (process.env.REACT_APP_DIVE_VISIBILITY_UNIT || 'feet').toLowerCase(),
};

const parseVisibility = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const numeric = Number(value.replace(/[^\d.-]/g, ''));
        return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
};

const getByPath = (value, path) => {
    if (!path || typeof path !== 'string') return value;
    return path
        .split('.')
        .filter(Boolean)
        .reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), value);
};

const convertVisibilityToFeet = (value, unit) => {
    if (!Number.isFinite(value)) return null;
    const normalizedUnit = (unit || 'feet').toLowerCase();

    if (normalizedUnit === 'feet' || normalizedUnit === 'foot' || normalizedUnit === 'ft') return value;
    if (normalizedUnit === 'meter' || normalizedUnit === 'meters' || normalizedUnit === 'm') return value * 3.28084;
    if (normalizedUnit === 'kilometer' || normalizedUnit === 'kilometers' || normalizedUnit === 'km') return value * 3280.84;
    if (normalizedUnit === 'mile' || normalizedUnit === 'miles' || normalizedUnit === 'mi') return value * 5280;
    if (normalizedUnit === 'nautical_miles' || normalizedUnit === 'nautical-mile' || normalizedUnit === 'nmi') return value * 6076.12;

    return value;
};

const isMissingResourceMessage = (value) => {
    const text = String(value || '').toLowerCase();
    return text.includes('no http resource was found')
        || text.includes('requested url was not found')
        || text.includes('404');
};

const extractArray = (payload, rowsPath = '') => {
    const rowsFromPath = getByPath(payload, rowsPath);
    if (Array.isArray(rowsFromPath)) return rowsFromPath;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.observations)) return payload.observations;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

const normalizeRows = (payload, mapping = {}) => {
    const rows = extractArray(payload, mapping.rowsPath)
        .map((row) => {
            const configuredTimestamp = mapping.timestampField
                ? getByPath(row, mapping.timestampField)
                : null;
            const timestamp = configuredTimestamp
                || row?.timestamp
                || row?.date
                || row?.time
                || row?.datetime
                || row?.observedAt
                || row?.created_at;

            const configuredVisibilityValue = mapping.valueField
                ? getByPath(row, mapping.valueField)
                : null;
            const rawVisibility = configuredVisibilityValue
                ?? row?.visibilityFt
                ?? row?.visibility_ft
                ?? row?.visibility
                ?? row?.diveVisibility
                ?? row?.dive_visibility
                ?? row?.visibility_feet;

            const parsedVisibility = parseVisibility(rawVisibility);
            const visibility = convertVisibilityToFeet(parsedVisibility, mapping.unit);

            if (!timestamp || visibility === null) return null;
            const dateValue = new Date(timestamp);
            if (Number.isNaN(dateValue.getTime())) return null;

            return {
                timestamp: dateValue,
                visibility,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return rows;
};

const hasVisibilityRows = (payload, mapping = {}) => normalizeRows(payload, mapping).length > 0;

const extractBeachStatus = (payload) => {
    if (!Array.isArray(payload)) return null;
    const site = payload.find((entry) => String(entry?.Name || '').toLowerCase().includes('la jolla cove'));
    if (!site) return null;

    const statusText = site.IndicatorID === 1
        ? 'Closure'
        : site.IndicatorID === 3 || site.IndicatorID === 5
            ? 'Advisory'
            : 'Open';

    return {
        name: site.Name,
        status: statusText,
        indicatorId: site.IndicatorID,
    };
};

const fetchVisibilityPayload = async () => {
    const configuredEndpoint = VISIBILITY_CONFIG.url;
    if (!configuredEndpoint) {
        return fetchVisibilityFromNdbcStations(NDBC_VISIBILITY_STATION_IDS);
    }

    const endpoints = [{ url: configuredEndpoint, label: VISIBILITY_CONFIG.label }];

    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url);
            if (!response.ok) {
                lastError = new Error(`Visibility request failed (${response.status}) for ${endpoint.url}`);
                continue;
            }

            const payload = await response.json();
            const mapping = endpoint.url === configuredEndpoint
                ? {
                    rowsPath: VISIBILITY_CONFIG.rowsPath,
                    timestampField: VISIBILITY_CONFIG.timestampField,
                    valueField: VISIBILITY_CONFIG.valueField,
                    unit: VISIBILITY_CONFIG.unit,
                }
                : {};

            if (hasVisibilityRows(payload, mapping)) {
                return {
                    payload,
                    source: endpoint.label,
                    mapping,
                };
            }

            const message = payload?.Message || payload?.message;
            if (message) {
                lastError = new Error(String(message));
                continue;
            }

            lastError = new Error(`Visibility response did not contain observations for ${endpoint.url}`);
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('Visibility data unavailable from configured endpoints.');
};

const fetchSdBeachStatus = async () => {
    const response = await fetch(SD_BEACH_STATUS_ENDPOINT, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`SD Beach status request failed (${response.status})`);
    }
    return response.json();
};

const dayKey = (dateValue) => {
    const year = dateValue.getFullYear();
    const month = `${dateValue.getMonth() + 1}`.padStart(2, '0');
    const day = `${dateValue.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateValue) => {
    const month = `${dateValue.getMonth() + 1}`.padStart(2, '0');
    const day = `${dateValue.getDate()}`.padStart(2, '0');
    return `${month}/${day}`;
};

const formatDateTime = (dateValue) => dateValue.toLocaleString();

const parseNumeric = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const parseNoaaTimestamp = (timestamp) => {
    if (!timestamp || typeof timestamp !== 'string') return null;
    const normalized = timestamp.includes('T') ? timestamp : timestamp.replace(' ', 'T');
    const dateValue = new Date(normalized);
    return Number.isNaN(dateValue.getTime()) ? null : dateValue;
};

const getNoaaDataRows = (payload) => (Array.isArray(payload?.data) ? payload.data : []);

const knotsToMph = (value) => (value === null ? null : value * 1.15078);

const getWindDirectionLabel = (degrees) => {
    if (!Number.isFinite(degrees)) return null;
    const normalized = ((degrees % 360) + 360) % 360;
    const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(normalized / 45) % 8;
    return labels[index];
};

const getWindDirectionIcon = (directionLabel) => {
    if (!directionLabel) return null;
    return getMatchIcon({
        kind: 'wind',
        status: { windDirection: directionLabel },
        collapse: false,
        compact: true,
    });
};

const cToF = (value) => (value === null ? null : (value * 9 / 5) + 32);
const metersToFeet = (value) => (value === null ? null : value * 3.28084);
const nmiToFeet = (value) => (value === null ? null : value * 6076.12);

const fetchNoaaProduct = async (product) => {
    const params = new URLSearchParams({
        date: 'latest',
        station: NOAA_STATION_ID,
        product,
        units: 'english',
        time_zone: 'lst_ldt',
        application: 'reactor_dive',
        format: 'json',
    });

    const response = await fetch(`${NOAA_PROXY_BASE}${NOAA_BASE}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`NOAA ${product} request failed (${response.status})`);
    }
    return response.json();
};

const fetchNdbcStationData = async (stationId) => {
    const response = await fetch(`${NDBC_PROXY_BASE}/data/realtime2/${stationId}.txt`);
    if (!response.ok) {
        throw new Error(`NDBC station ${stationId} request failed (${response.status})`);
    }
    return response.text();
};

const parseNdbcRealtimeRows = (rawText) => {
    const fields = ['YY', 'MM', 'DD', 'hh', 'mm', 'WDIR', 'WSPD', 'GST', 'WVHT', 'DPD', 'APD', 'MWD', 'PRES', 'ATMP', 'WTMP', 'DEWP', 'VIS', 'PTDY', 'TIDE'];
    const tokens = (rawText || '').replace(/\r/g, ' ').split(/\s+/).filter(Boolean);
    const rows = [];

    for (let index = 0; index <= tokens.length - fields.length; index += 1) {
        const year = tokens[index];
        const month = tokens[index + 1];
        const day = tokens[index + 2];
        const hour = tokens[index + 3];
        const minute = tokens[index + 4];

        if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day) || !/^\d{2}$/.test(hour) || !/^\d{2}$/.test(minute)) {
            continue;
        }

        const rowTokens = tokens.slice(index, index + fields.length);
        if (rowTokens.length < fields.length) continue;

        const row = fields.reduce((accumulator, field, fieldIndex) => {
            accumulator[field] = rowTokens[fieldIndex];
            return accumulator;
        }, {});

        rows.push(row);
        index += fields.length - 1;
    }

    return rows
        .map((row) => {
            const timestamp = new Date(Date.UTC(
                Number(row.YY),
                Number(row.MM) - 1,
                Number(row.DD),
                Number(row.hh),
                Number(row.mm),
                0
            ));

            if (Number.isNaN(timestamp.getTime())) return null;

            const waterTempC = parseNumeric(row.WTMP === 'MM' ? null : row.WTMP);
            const swellMeters = parseNumeric(row.WVHT === 'MM' ? null : row.WVHT);
            const visibilityNmi = parseNumeric(row.VIS === 'MM' ? null : row.VIS);

            return {
                timestamp,
                waterTempF: cToF(waterTempC),
                swellFeet: metersToFeet(swellMeters),
                visibilityNmi,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

const fetchVisibilityFromNdbcStations = async (stationIds) => {
    for (const stationId of stationIds) {
        try {
            const raw = await fetchNdbcStationData(stationId);
            const rows = parseNdbcRealtimeRows(raw);
            const latestWithVisibility = [...rows]
                .reverse()
                .find((row) => Number.isFinite(row.visibilityNmi));

            if (!latestWithVisibility) {
                continue;
            }

            const visibilityFeet = nmiToFeet(latestWithVisibility.visibilityNmi);
            if (!Number.isFinite(visibilityFeet)) {
                continue;
            }

            return {
                payload: {
                    observations: [
                        {
                            timestamp: latestWithVisibility.timestamp.toISOString(),
                            visibility_ft: visibilityFeet,
                        },
                    ],
                },
                source: `NDBC station ${stationId} (VIS)`,
                mapping: {},
            };
        } catch (error) {
            // Try next nearby station if one feed is unavailable.
        }
    }

    throw new Error('NDBC visibility unavailable for fallback stations.');
};

const Dive = ({ coreMetricsOnly = false }) => {
    const defaultCoreOnly = coreMetricsOnly === true || coreMetricsOnly === 'true';
    const [showCoreOnly] = useState(defaultCoreOnly);
    const [rows, setRows] = useState([]);
    const [waterTrendRows, setWaterTrendRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [waterTemp, setWaterTemp] = useState(null);
    const [wind, setWind] = useState(null);
    const [swell, setSwell] = useState(null);
    const [beachStatus, setBeachStatus] = useState(null);
    const [visibilitySource, setVisibilitySource] = useState('No public numeric visibility feed available');

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setLoading(true);
            setError('');
            setWarning('');

            const [visibilityResult, waterResult, windResult, swellResult, beachStatusResult] = await Promise.allSettled([
                fetchVisibilityPayload(),
                fetchCurrentWaterTemp({
                    noaaStationId: NOAA_STATION_ID,
                    ndbcStationId: NDBC_SWELL_STATION_ID,
                }),
                fetchNoaaProduct('wind'),
                fetchNdbcStationData(NDBC_SWELL_STATION_ID),
                fetchSdBeachStatus(),
            ]);

            const normalizedRows = visibilityResult.status === 'fulfilled'
                ? normalizeRows(visibilityResult.value.payload, visibilityResult.value.mapping)
                : [];
            const resolvedVisibilitySource = visibilityResult.status === 'fulfilled'
                ? visibilityResult.value.source
                : isMissingResourceMessage(visibilityResult.reason?.message)
                    ? 'SD Beach visibility API endpoint unavailable (resource not found)'
                    : 'No public numeric visibility feed available';

            const currentWaterReading = waterResult.status === 'fulfilled' ? waterResult.value : null;

            const latestWindNoaa = windResult.status === 'fulfilled'
                ? getNoaaDataRows(windResult.value).slice(-1)[0]
                : null;
            const windSpeedKnots = parseNumeric(latestWindNoaa?.s);
            const windDirectionDegrees = parseNumeric(latestWindNoaa?.d);
            const windTimestamp = parseNoaaTimestamp(latestWindNoaa?.t);
            const windSpeedMph = knotsToMph(windSpeedKnots);
            const windDirectionLabel = getWindDirectionLabel(windDirectionDegrees);

            const ndbcRows = swellResult.status === 'fulfilled'
                ? parseNdbcRealtimeRows(swellResult.value)
                : [];
            const latestNdbcRow = ndbcRows.length ? ndbcRows[ndbcRows.length - 1] : null;
            const swellFeet = latestNdbcRow?.swellFeet ?? null;
            const swellTimestamp = latestNdbcRow?.timestamp ?? null;

            const parsedBeachStatus = beachStatusResult.status === 'fulfilled'
                ? extractBeachStatus(beachStatusResult.value)
                : null;

            const resolvedWaterValue = Number.isFinite(currentWaterReading?.valueF)
                ? currentWaterReading.valueF
                : null;
            const resolvedWaterTimestamp = currentWaterReading?.timestamp ?? null;
            const resolvedWaterSource = currentWaterReading?.source || null;

            const dataSourcesFailed = [visibilityResult, waterResult, windResult, swellResult, beachStatusResult].some((item) => item.status === 'rejected');

            if (isMounted) {
                setRows(normalizedRows);
                setWaterTrendRows(
                    ndbcRows.filter((row) => Number.isFinite(row.waterTempF))
                );
                setWaterTemp(
                    resolvedWaterValue === null
                        ? null
                        : {
                            value: resolvedWaterValue,
                            timestamp: resolvedWaterTimestamp,
                            source: resolvedWaterSource,
                        }
                );
                setWind(
                    windSpeedMph === null
                        ? null
                        : {
                            speedMph: windSpeedMph,
                            directionDegrees: windDirectionDegrees,
                            directionLabel: windDirectionLabel,
                            timestamp: windTimestamp,
                        }
                );
                setSwell(
                    swellFeet === null
                        ? null
                        : {
                            value: swellFeet,
                            timestamp: swellTimestamp,
                        }
                );
                setBeachStatus(parsedBeachStatus);
                setVisibilitySource(resolvedVisibilitySource);

                const hasAnyData = normalizedRows.length || resolvedWaterValue !== null || windSpeedKnots !== null || swellFeet !== null || parsedBeachStatus !== null;
                if (!hasAnyData) {
                    setError('Unable to load La Jolla Cove marine data right now.');
                } else if (dataSourcesFailed) {
                    setWarning('Some live readings are temporarily unavailable.');
                }
            }

            if (isMounted) {
                setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const latest = rows.length ? rows[rows.length - 1] : null;

    const trendData = useMemo(() => {
        if (!rows.length) return [];

        const byDay = rows.reduce((accumulator, row) => {
            const key = dayKey(row.timestamp);
            const existing = accumulator.get(key);

            if (!existing || existing.timestamp.getTime() < row.timestamp.getTime()) {
                accumulator.set(key, row);
            }

            return accumulator;
        }, new Map());

        return Array.from(byDay.values())
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .slice(-5)
            .map((row) => ({
                day: formatDateLabel(row.timestamp),
                visibility: row.visibility,
            }));
    }, [rows]);

    const waterTrendData = useMemo(() => {
        if (!waterTrendRows.length) return [];

        const byDay = waterTrendRows.reduce((accumulator, row) => {
            const key = dayKey(row.timestamp);
            const existing = accumulator.get(key);

            if (!existing || existing.timestamp.getTime() < row.timestamp.getTime()) {
                accumulator.set(key, row);
            }

            return accumulator;
        }, new Map());

        return Array.from(byDay.values())
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .slice(-5)
            .map((row) => ({
                day: formatDateLabel(row.timestamp),
                waterTemp: row.waterTempF,
            }));
    }, [waterTrendRows]);
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const unitByKey = {
                visibility: 'ft',
                waterTemp: '°F',
            };
            return (
                <div className='containerDetail p-10 bg-dark color-lite' style={{
                    borderRadius: '6px',
                    border: '1px solid #4a5568'
                }}>
                    {label && <div className='color-yellow mb-5'>{label}</div>}
                    {payload.map((entry, index) => (
                        <div key={index} className='color-lite size14'>
                            {entry.name}: {Number(entry.value).toFixed(1)} {unitByKey[entry.dataKey] || ''}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className='containerDetail mt--30 width--10'>
            <div className='containerDetail p-20 bg-lite color-yellow size30 contentLeft mb-5'>
                🤿 Dive Visibility
            </div>
            <div className='containerDetail bg-lite contentLeft'>
                {
                    /*
                    <div className='containerDetail bg-lite p-10 mb-5 contentLeft'>
                        <button
                            type='button'
                            className='button p-10 size15 color-yellow'
                            onClick={() => setShowCoreOnly((previous) => !previous)}
                        >
                            {showCoreOnly ? 'Show Full Marine Data' : 'Show Core Metrics Only'}
                        </button>
                    </div>
                    */
                }
                {
                    /*
                    <div className='containerDetail bg-lite color-lite contentLeft'>
                    */
                }
                    <div className='containerDetail bg-lite p-10 mb-5 contentLeft'>
                        <div className='size20 color-yellow mb-5'>La Jolla Cove</div>
                    </div>
                    <div className='containerDetail bg-lite contentLeft color-lite'>
                        {
                            loading
                                ? <div>Loading visibility data...</div>
                                : null
                        }

                        {
                            !loading && error
                                ? <div className='containerDetail bg-lite color-yellow p-10 mb-5'>{error}</div>
                                : null
                        }

                        {
                            !loading && !error && warning
                            ? <div className='containerDetail bg-lite color-orange p-10 mb-5'>{warning}</div>
                                : null
                        }

                        {
                            !loading && !error
                                ? (
                                    <>
                                        <div className='containerDetail bg-lite mb-5 p-10'>
                                            <span className='color-yellow'>Current visibility:</span> {latest ? `${latest.visibility.toFixed(1)} ft` : 'Unavailable from current source'}
                                        </div>
                                        {
                                            beachStatus
                                                ? <div className='containerDetail bg-lite mb-5 p-10'>
                                                    <span className='color-yellow'>La Jolla Cove status:</span> {beachStatus.status}
                                                </div>
                                                : null
                                        }
                                        <div className='containerDetail bg-lite mb-5 p-10'>
                                            <span className='color-yellow'>Visibility source:</span> {visibilitySource}
                                        </div>
                                        {
                                            visibilitySource.includes('NDBC station')
                                                ? <div className='containerDetail bg-lite mb-5 p-10 size15 color-orange'>
                                                    NDBC buoy visibility can be intermittently missing (reported as MM).
                                                </div>
                                                : null
                                        }
                                        <div className='containerDetail bg-lite mb-5 p-10'>
                                            <span className='color-yellow'>Water temperature:</span> {waterTemp ? `${waterTemp.value.toFixed(1)} °F` : 'N/A'}
                                        </div>
                                        {
                                            waterTemp?.source
                                                ? <div className='containerDetail bg-lite mb-5 p-10'>
                                                    <span className='color-yellow'>Water source:</span> {waterTemp.source}
                                                </div>
                                                : null
                                        }
                                        {
                                            showCoreOnly
                                                ? null
                                            : <div className='containerDetail bg-lite mb-5 p-10 w-100 contentCenter'>
                                                    <span className='color-yellow'>Wind:</span>
                                                    {
                                                        wind
                                                            ? <span className='ml-5'>
                                                                {wind.speedMph.toFixed(0)} mph
                                                                {
                                                                    wind.directionLabel
                                                                        ? <div className='containerDetail pt-10 bg-white w-50 m-10'>
                                                                            {getWindDirectionIcon(wind.directionLabel)}
                                                                        </div>
                                                                        : null
                                                                }
                                                                {wind.directionLabel || ''}
                                                                {wind.directionDegrees !== null ? ` @ ${wind.directionDegrees.toFixed(0)}°` : ''}
                                                            </span>
                                                            : ' N/A'
                                                    }
                                                </div>
                                        }
                                        {
                                            showCoreOnly
                                                ? null
                                                : <div className='containerDetail bg-lite mb-5 p-10'>
                                                    <span className='color-yellow'>Swell height:</span> {swell ? `${swell.value.toFixed(1)} ft` : 'N/A'}
                                                </div>
                                        }
                                        {
                                            latest
                                                ? <div className='copyright'>Visibility updated: {formatDateTime(latest.timestamp)}</div>
                                                : null
                                        }
                                        <div className='containerDetail bg-lite'>
                                            {
                                                waterTemp?.timestamp
                                                ? <div className='containerDetail mb-5 pl-10'><span className='color-yellow'>Water updated:</span> {formatDateTime(waterTemp.timestamp)}</div>
                                                    : null
                                            }
                                            {
                                                !showCoreOnly && wind?.timestamp
                                                ? <div className='containerDetail mb-5 pl-10'><span className='color-yellow'>Wind updated:</span> {formatDateTime(wind.timestamp)}</div>
                                                    : null
                                            }
                                            {
                                                !showCoreOnly && swell?.timestamp
                                                    ? <div className='containerDetail pl-10'><span className='color-yellow'>Swell updated:</span> {formatDateTime(swell.timestamp)}</div>
                                                    : null
                                            }
                                        </div>
                                    </>
                                )
                                : null
                        }

                        {
                            !loading && !error && !latest && !waterTemp && !wind && !swell
                                ? <div>No visibility data is currently available.</div>
                                : null
                        }
                    </div>
                {
                    /*
                    </div>
                    */
                }
                {
                    !loading && !error && trendData.length > 1
                        ? (
                            <div className='containerDetail bg-lite p-20 color-lite'>
                                <div className='size20 color-yellow contentLeft mb-10'>Last 5 Days Trend</div>
                                <div className='containerDetail color-yellow' style={{ height: '280px' }}>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                            <CartesianGrid stroke='currentColor' strokeDasharray='3 3' opacity={0.2} />
                                            <XAxis dataKey='day' stroke='currentColor' />
                                            <YAxis stroke='currentColor' unit=' ft' />
                                            <Tooltip content={<CustomTooltip />} labelFormatter={(label) => `Date: ${label}`} />
                                            <Line
                                                type='monotone'
                                                dataKey='visibility'
                                                name='Visibility'
                                                stroke='currentColor'
                                                strokeWidth={2}
                                                dot={{ r: 3, fill: 'currentColor' }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )
                        : null
                }

                {
                    !loading && !error && waterTrendData.length > 1
                        ? (
                            <div className='containerDetail bg-lite color-lite mt-5'>
                                <div className='containerDetail bg-lite p-20 mb-5'>
                                    <div className='size20 color-yellow contentLeft '>Water Temp Trend (Last 5 Days)</div>
                               </div>
                                <div className='containerDetail color-yellow' style={{ height: '280px' }}>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <LineChart data={waterTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                            <CartesianGrid stroke='currentColor' strokeDasharray='3 3' opacity={0.2} />
                                            <XAxis dataKey='day' stroke='currentColor' />
                                            <YAxis stroke='currentColor' unit=' °F' />
                                            <Tooltip content={<CustomTooltip />} labelFormatter={(label) => `Date: ${label}`} />
                                            <Line
                                                type='monotone'
                                                dataKey='waterTemp'
                                                name='Water Temp'
                                                stroke='currentColor'
                                                strokeWidth={2}
                                                dot={{ r: 3, fill: 'currentColor' }}
                                                activeDot={{ r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )
                        : null
                }

                {
                    !loading && !error && trendData.length <= 1 && latest
                        ? (
                            <div className='containerDetail bg-lite p-20 color-lite contentLeft'>
                                Trend graph becomes available when at least 2 days of visibility history are returned.
                            </div>
                        )
                        : null
                }
            </div>
        </div>
    );
};

export default Dive;