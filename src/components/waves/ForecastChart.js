import React, { useEffect, useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useForecastData } from './useForecastData';
import { useNoaaForecastData } from './useNoaaForecastData';
import { useWaveWatchForecastData } from './useWaveWatchForecastData';
import { BEACHES } from './Beaches';
import useTideForecastData from './useTideForecastData';
import { getStoredTideSeries, getTideAtTime } from './tideUtils';

const ForecastChart = ({ selectedBeach, data }) => {
    const [forecastSource, setForecastSource] = useState('open-meteo');
    const [hoursToShow, setHoursToShow] = useState(48);
    const [visibleSeries, setVisibleSeries] = useState({
        swell: true,
        wind: true,
        water: true,
        air: true,
        period: true,
        tide: true,
    });
    const [collapsedReports, setCollapsedReports] = useState({
        morning: true,
        afternoon: true,
        evening: true,
        tomorrow: true,
    });
    const [nowTs, setNowTs] = useState(Date.now());

    const getSeriesResolutionMs = (rows) => {
        if (!Array.isArray(rows) || rows.length < 2) return Infinity;

        const timestamps = rows
            .map((row) => new Date(String(row?.t || '').replace(' ', 'T')).getTime())
            .filter((ts) => Number.isFinite(ts))
            .sort((a, b) => a - b);

        if (timestamps.length < 2) return Infinity;

        const deltas = [];
        for (let i = 1; i < timestamps.length; i++) {
            const delta = timestamps[i] - timestamps[i - 1];
            if (delta > 0) deltas.push(delta);
        }

        if (!deltas.length) return Infinity;
        deltas.sort((a, b) => a - b);
        return deltas[Math.floor(deltas.length / 2)];
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setNowTs(Date.now());
        }, 60 * 1000);

        return () => clearInterval(timer);
    }, []);

    const toggleReportCollapse = (key) => {
        setCollapsedReports(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleSeries = (seriesKey) => {
        setVisibleSeries((prevState) => ({
            ...prevState,
            [seriesKey]: !prevState[seriesKey],
        }));
    };

    // Get beach coordinates for API call
    const beach = useMemo(() => 
        BEACHES.find(b => b.name === selectedBeach),
        [selectedBeach]
    );

    const lat = beach?.lat || 32.87;
    const lon = beach?.lon || -117.26;

    // Fetch real forecast data from Open-Meteo
    const {
        forecastData: openMeteoData,
        loading: openMeteoLoading,
        error: openMeteoError
    } = useForecastData(lat, lon);

    const {
        forecastData: noaaData,
        loading: noaaLoading,
        error: noaaError
    } = useNoaaForecastData(beach?.buoyId, 48);

    // Fetch tide forecast series via reusable hook
    const { tideRows, tideStation } = useTideForecastData(lat, lon);

    // Generate 48-hour forecast data (fallback if API fails)
    const fallbackData = useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const forecast = [];

        // Simulate 48-hour forecast
        for (let i = 0; i < 48; i++) {
            const hour = (currentHour + i) % 24;
            const isTonight = i < (24 - currentHour);
            const dayLabel = isTonight ? 'Today' : 'Tomorrow';
            const date = new Date(now);
            date.setMinutes(0, 0, 0);
            date.setHours(currentHour + i);

            // Simulate wave height (feet) - ranges 2-8 ft typically
            const baseHeight = 4 + Math.sin((hour - 6) * Math.PI / 12) * 2;
            const swellHeight = baseHeight + Math.random() * 0.5;

            // Wind speed (knots) - typically 5-20 knots
            const windKnots = 12 + Math.sin((hour - 10) * Math.PI / 12) * 6 + Math.random() * 2;

            // Water temp (Celsius) - San Diego 16-22C typically
            const waterTemp = 18 + Math.sin((hour - 12) * Math.PI / 12) * 2;

            // Air temp (Celsius) - typically warmer daytime than water
            const airTemp = 20 + Math.sin((hour - 14) * Math.PI / 12) * 4;

            // Period (seconds) - typically 8-14s
            const period = 10 + Math.sin((hour - 8) * Math.PI / 12) * 2;

            const timeStr = `${(hour % 12 || 12).toString().padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;

            forecast.push({
                time: timeStr,
                shortTime: `${hour}h`,
                swellHeight: Math.round(swellHeight * 10) / 10,
                wind: Math.round(windKnots),
                waterTemp: Math.round(waterTemp * 10) / 10,
                waterTempSource: 'Simulated fallback water temperature',
                airTemp: Math.round(airTemp * 10) / 10,
                airTempSource: 'Simulated fallback air temperature',
                period: Math.round(period * 10) / 10,
                hour: i,
                day: dayLabel,
                date,
                timestamp: date.getTime(),
            });
        }

        return forecast;
    }, []);

    const {
        forecastData: ww3Data,
        loading: ww3Loading,
        error: ww3Error
    } = useWaveWatchForecastData(lat, lon, 48);

    const sourceMap = {
        'open-meteo': {
            data: openMeteoData,
            loading: openMeteoLoading,
            error: openMeteoError,
            label: 'Open-Meteo forecast model',
            type: 'Forecast'
        },
        noaa: {
            data: noaaData,
            loading: noaaLoading,
            error: noaaError,
            label: `NOAA/NDBC buoy ${beach?.buoyId || ''} trend`,
            type: 'Observed'
        },
        ww3: {
            data: ww3Data,
            loading: ww3Loading,
            error: ww3Error,
            label: 'NOAA WaveWatch III global model',
            type: 'Forecast'
        }
    };

    const activeSource = sourceMap[forecastSource] || sourceMap['open-meteo'];
    const sourceLoading = activeSource.loading;
    const sourceError = activeSource.error;
    const sourceData = activeSource.data;

    // Use source data if available, otherwise fallback to simulated data
    const baseForecastData = sourceData || fallbackData;

    const tideResolutionMeta = useMemo(() => {
        const storedTideRows = getStoredTideSeries();
        const tideRowsResolution = getSeriesResolutionMs(tideRows);
        const storedRowsResolution = getSeriesResolutionMs(storedTideRows);

        const useStoredRows = (
            Array.isArray(storedTideRows)
            && storedTideRows.length
            && storedRowsResolution < tideRowsResolution
        );

        const activeRows = useStoredRows
            ? storedTideRows
            : (tideRows.length ? tideRows : storedTideRows);

        const activeResolutionMs = getSeriesResolutionMs(activeRows);

        const formatResolution = (ms) => {
            if (!Number.isFinite(ms) || ms === Infinity) return 'unknown';
            if (ms < 60 * 1000) return `${Math.round(ms / 1000)}s`;
            return `${Math.round(ms / (60 * 1000))}m`;
        };

        return {
            source: useStoredRows ? 'TideChart cache' : 'NOAA tide feed',
            resolution: formatResolution(activeResolutionMs),
        };
    }, [tideRows, nowTs]);

    const forecastData = useMemo(() => {
        const getEntryTime = (entry, index) => (Number.isFinite(entry.timestamp)
            ? entry.timestamp
            : Date.now() + (index * 60 * 60 * 1000));

        const openMeteoAirRows = (openMeteoData || [])
            .map((entry) => ({
                timestamp: entry.timestamp,
                airTemp: Number.isFinite(entry.airTemp) ? entry.airTemp : null,
                airTempSource: entry.airTempSource || 'Open-Meteo weather 2m air temperature',
            }))
            .filter((entry) => Number.isFinite(entry.timestamp) && Number.isFinite(entry.airTemp));

        const getNearestAirTemp = (entryTime) => {
            if (!openMeteoAirRows.length || !Number.isFinite(entryTime)) return null;

            let nearest = openMeteoAirRows[0];
            let smallestDiff = Math.abs(openMeteoAirRows[0].timestamp - entryTime);

            for (let i = 1; i < openMeteoAirRows.length; i++) {
                const row = openMeteoAirRows[i];
                const diff = Math.abs(row.timestamp - entryTime);
                if (diff < smallestDiff) {
                    nearest = row;
                    smallestDiff = diff;
                }
            }

            return nearest;
        };

        const withAirTemp = baseForecastData.map((entry, index) => {
            if (Number.isFinite(entry.airTemp)) {
                return entry;
            }

            const entryTime = getEntryTime(entry, index);
            const nearestAir = getNearestAirTemp(entryTime);
            return {
                ...entry,
                airTemp: nearestAir?.airTemp ?? null,
                airTempSource: nearestAir?.airTempSource
                    ? `${nearestAir.airTempSource} (nearest timestamp fallback)`
                    : null,
            };
        });

        const storedTideRows = getStoredTideSeries();
        const tideRowsResolution = getSeriesResolutionMs(tideRows);
        const storedRowsResolution = getSeriesResolutionMs(storedTideRows);
        const mergedTideRows = (
            Array.isArray(storedTideRows)
            && storedTideRows.length
            && storedRowsResolution < tideRowsResolution
        )
            ? storedTideRows
            : (tideRows.length ? tideRows : storedTideRows);
        if (!mergedTideRows.length) return withAirTemp;

        // The tide series is already hourly (interval='h') so values are accurate
        // at each step. Use nearest-lookup for data values; Recharts type='monotone'
        // handles visual smoothing. Cubic spline on dense hourly data overshoots.
        const withTide = withAirTemp.map((entry, index) => {
            const entryTime = getEntryTime(entry, index);
            const tide = getTideAtTime(mergedTideRows, entryTime);
            return {
                ...entry,
                tideLevel: tide?.level ?? null,
                tidePhase: tide?.phase ?? null,
                tideDirection: tide?.direction ?? null,
            };
        });

        const tideLevels = withTide
            .map((entry) => entry.tideLevel)
            .filter((level) => Number.isFinite(level));

        if (!tideLevels.length) return withTide;

        const leftSeriesValues = withTide
            .flatMap((entry) => [entry.swellHeight, entry.period])
            .filter((value) => Number.isFinite(value));

        const leftAxisMax = leftSeriesValues.length ? Math.max(...leftSeriesValues) : 1;
        const tideMin = Math.min(...tideLevels);
        const tideMax = Math.max(...tideLevels);
        const maxAbsTide = Math.max(Math.abs(tideMin), Math.abs(tideMax));
        const tideScaleFactor = maxAbsTide > 0
            ? (leftAxisMax * 0.9) / maxAbsTide
            : 1;

        return withTide.map((entry) => {
            if (!Number.isFinite(entry.tideLevel)) {
                return {
                    ...entry,
                    tideScaled: null,
                };
            }

            const tideScaled = entry.tideLevel * tideScaleFactor;

            return {
                ...entry,
                tideScaled,
            };
        });
    }, [baseForecastData, tideRows, openMeteoData]);

    // Interpolate the merged series to 30-minute intervals for smoother curves.
    const interpolatedForecastData = useMemo(() => {
        if (!forecastData.length) return forecastData;

        const lerp = (a, b, t) => {
            if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
            return a + (b - a) * t;
        };

        const numericKeys = [
            'swellHeight', 'wind', 'waterTemp', 'airTemp',
            'period', 'tideLevel', 'tideScaled',
        ];

        const result = [];
        for (let i = 0; i < forecastData.length - 1; i++) {
            const a = forecastData[i];
            const b = forecastData[i + 1];
            const tsA = Number.isFinite(a.timestamp) ? a.timestamp : null;
            const tsB = Number.isFinite(b.timestamp) ? b.timestamp : null;

            result.push(a);

            // Only insert midpoint when both timestamps are valid and ~1 h apart
            if (tsA !== null && tsB !== null && (tsB - tsA) <= 70 * 60 * 1000) {
                const midTs = (tsA + tsB) / 2;
                const midDate = new Date(midTs);
                const midHour = midDate.getHours();
                const midMin = midDate.getMinutes();
                const h12 = midHour % 12 || 12;
                const ampm = midHour < 12 ? 'AM' : 'PM';
                const midTime = `${h12.toString().padStart(2, '0')}:${midMin.toString().padStart(2, '0')} ${ampm}`;

                const midpoint = { ...a, timestamp: midTs, time: midTime };
                numericKeys.forEach((k) => {
                    midpoint[k] = lerp(a[k], b[k], 0.5);
                    if (Number.isFinite(midpoint[k])) {
                        midpoint[k] = Math.round(midpoint[k] * 100) / 100;
                    }
                });
                // Carry forward categorical fields from the earlier entry
                midpoint.tidePhase = a.tidePhase;
                midpoint.tideDirection = a.tideDirection;
                midpoint.waterTempSource = a.waterTempSource;
                midpoint.airTempSource = a.airTempSource;
                result.push(midpoint);
            }
        }
        // Push the final entry
        result.push(forecastData[forecastData.length - 1]);
        return result;
    }, [forecastData]);

    const displayData = useMemo(() => {
        if (hoursToShow === 16) {
            // 16-hour daytime window: 5:00 AM to 9:00 PM on a single local day.
            const finiteRows = interpolatedForecastData.filter((entry) => Number.isFinite(entry.timestamp));
            if (!finiteRows.length) {
                return interpolatedForecastData.slice(0, 32);
            }

            const targetDayKey = (() => {
                const withWindowRows = finiteRows.filter((entry) => {
                    const hour = new Date(entry.timestamp).getHours();
                    return hour >= 5 && hour <= 21;
                });
                if (withWindowRows.length) {
                    return new Date(withWindowRows[0].timestamp).toDateString();
                }
                return new Date(finiteRows[0].timestamp).toDateString();
            })();

            const daytimeRows = finiteRows.filter((entry) => {
                const localDate = new Date(entry.timestamp);
                const hour = localDate.getHours();
                return (
                    localDate.toDateString() === targetDayKey
                    && hour >= 5
                    && hour <= 21
                );
            });

            return daytimeRows.length ? daytimeRows : interpolatedForecastData.slice(0, 32);
        }
        return interpolatedForecastData.slice(0, 96);
    }, [interpolatedForecastData, hoursToShow]);

    const hasWaterTempData = useMemo(
        () => displayData.some((entry) => Number.isFinite(entry.waterTemp)),
        [displayData]
    );

    const calculateSegmentStats = (entries, segmentLabel = 'window') => {
        if (!entries.length) return null;

        const swells = entries.map(e => e.swellHeight).filter(Number.isFinite);
        const winds = entries.map(e => e.wind).filter(Number.isFinite);
        const periods = entries.map(e => e.period).filter(Number.isFinite);
        const tides = entries.map(e => e.tideLevel).filter(Number.isFinite);
        const waterTemps = entries.map(e => e.waterTemp).filter(Number.isFinite);
        const airTemps = entries.map(e => e.airTemp).filter(Number.isFinite);
        const windDirs = entries.map(e => e.windDir).filter(Boolean);
        const tideDirections = entries.map(e => e.tideDirection).filter(Boolean);
        const tideSamples = entries
            .filter((entry) => Number.isFinite(entry.tideLevel) && Number.isFinite(entry.timestamp))
            .map((entry) => ({
                level: entry.tideLevel,
                timestamp: entry.timestamp,
            }));

        const formatTideTime = (timestamp) => {
            if (!Number.isFinite(timestamp)) return null;
            const date = new Date(timestamp);
            const hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const h12 = hours % 12 || 12;
            const ampm = hours < 12 ? 'am' : 'pm';
            return `${h12}:${minutes}${ampm}`;
        };

        // Improved surf-appropriate tide narrative
        const getTideNarrative = () => {
            if (!tideSamples.length) return [];

            const ordered = [...tideSamples]
                .sort((a, b) => a.timestamp - b.timestamp)
                .filter((sample, idx, arr) => idx === 0 || sample.timestamp !== arr[idx - 1].timestamp);

            // Detect tide turns from direction changes: rising->falling (high),
            // falling->rising (low). Ignore tiny jitter and merge nearby turns.
            const highs = [];
            const lows = [];
            const eps = 0.03;

            let prevSign = 0;
            for (let i = 1; i < ordered.length; i++) {
                const delta = ordered[i].level - ordered[i - 1].level;
                if (Math.abs(delta) <= eps) continue;

                const sign = delta > 0 ? 1 : -1;
                if (prevSign === 1 && sign === -1) {
                    highs.push(ordered[i - 1]);
                } else if (prevSign === -1 && sign === 1) {
                    lows.push(ordered[i - 1]);
                }
                prevSign = sign;
            }

            const mergeNearbyTurns = (points, type) => {
                if (!points.length) return points;

                const minSeparationMs = 75 * 60 * 1000;
                const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
                const merged = [sorted[0]];

                for (let i = 1; i < sorted.length; i++) {
                    const curr = sorted[i];
                    const lastIdx = merged.length - 1;
                    const last = merged[lastIdx];
                    const isClose = (curr.timestamp - last.timestamp) < minSeparationMs;

                    if (!isClose) {
                        merged.push(curr);
                        continue;
                    }

                    if (type === 'high') {
                        merged[lastIdx] = curr.level > last.level ? curr : last;
                    } else {
                        merged[lastIdx] = curr.level < last.level ? curr : last;
                    }
                }

                return merged;
            };

            const uniqueHighs = mergeNearbyTurns(highs, 'high');
            const uniqueLows = mergeNearbyTurns(lows, 'low');

            const phrases = [];
            const formatTide = (level) => {
                if (level >= 7) return 'an extremely high tide';
                if (level >= 3.5) return 'a high tide';
                if (level <= -2) return 'an extremely low tide';
                if (level <= 1.5) return 'a low tide';
                return 'a mid tide';
            };
            const formatTime = (ts) => {
                if (!Number.isFinite(ts)) return '';
                const d = new Date(ts);
                const h = d.getHours();
                const m = d.getMinutes().toString().padStart(2, '0');
                const ampm = h < 12 ? 'am' : 'pm';
                const h12 = h % 12 || 12;
                return `${h12}:${m}${ampm}`;
            };
            const timeOfDay = (ts) => {
                const h = new Date(ts).getHours();
                if (h < 12) return 'morning';
                if (h < 17) return 'afternoon';
                if (h < 21) return 'evening';
                return 'night';
            };
            const partOfDay = (ts) => {
                const h = new Date(ts).getHours();
                if (h < 5) return 'is during the early morning';
                if (h < 9) return 'will be during the morning';
                if (h < 12) return 'will be late morning';
                if (h < 15) return 'will be early afternoon';
                if (h < 17) return 'will be in the afternoon';
                if (h < 20) return 'will be in the evening';
                return 'will be at night';
            };

            // Build tide-turn events in chronological order so the report reads naturally.
            let turnEvents = [
                ...uniqueHighs.map((point) => ({ ...point, type: 'high' })),
                ...uniqueLows.map((point) => ({ ...point, type: 'low' })),
            ].sort((a, b) => a.timestamp - b.timestamp);

            // If no direction-change turns were detected in this window, fallback to extrema.
            if (!turnEvents.length && ordered.length) {
                const maxPoint = ordered.reduce((a, b) => a.level > b.level ? a : b);
                const minPoint = ordered.reduce((a, b) => a.level < b.level ? a : b);
                turnEvents = [
                    { ...maxPoint, type: 'high' },
                    { ...minPoint, type: 'low' },
                ]
                    .filter((point, idx, arr) => idx === 0 || point.timestamp !== arr[idx - 1].timestamp)
                    .sort((a, b) => a.timestamp - b.timestamp);
            }

            const eventPhrases = turnEvents.map((event) => {
                const tideDesc = formatTide(event.level)
                    .replace('an ', '')
                    .replace('a ', '');
                const tod = partOfDay(event.timestamp);
                return `${tideDesc} ${tod} (${event.level.toFixed(1)}ft at ${formatTime(event.timestamp)})`;
            });

            if (eventPhrases.length === 1) {
                phrases.push(`${eventPhrases[0].charAt(0).toUpperCase() + eventPhrases[0].slice(1)}.`);
            } else if (eventPhrases.length > 1) {
                phrases.push(`${eventPhrases.map((p) => p.trim()).join(', ')}.`);
            }

            // If tide is mostly flat and no significant high/low
            const tideRange = Math.abs(Math.max(...ordered.map(s => s.level)) - Math.min(...ordered.map(s => s.level)));
            if (!turnEvents.length && tideRange < 0.4) {
                phrases.push(`Tide stays fairly steady near ${ordered[0].level.toFixed(1)}ft.`);
            }

            // Add rising/falling trend
            const risingCount = tideDirections.filter((d) => d === 'rising').length;
            const fallingCount = tideDirections.filter((d) => d === 'falling').length;
            const totalDirectional = risingCount + fallingCount;
            if (totalDirectional > 0) {
                const risingRatio = risingCount / totalDirectional;
                const fallingRatio = fallingCount / totalDirectional;
                if (risingRatio >= 0.65) {
                    phrases.push(`Tide is mostly rising through the ${segmentLabel}.`);
                } else if (fallingRatio >= 0.65) {
                    phrases.push(`Tide is mostly falling through the ${segmentLabel}.`);
                }
            }

            return phrases;
        };

        const stats = {
            timeRange: entries.length > 0 ? `${entries[0].time} - ${entries[entries.length - 1].time}` : 'N/A',
            swell: {
                min: swells.length ? Math.min(...swells).toFixed(1) : 'N/A',
                max: swells.length ? Math.max(...swells).toFixed(1) : 'N/A',
                avg: swells.length ? (swells.reduce((a,b) => a+b, 0) / swells.length).toFixed(1) : 'N/A',
            },
            period: {
                min: periods.length ? Math.min(...periods).toFixed(1) : 'N/A',
                max: periods.length ? Math.max(...periods).toFixed(1) : 'N/A',
                avg: periods.length ? (periods.reduce((a,b) => a+b, 0) / periods.length).toFixed(1) : 'N/A',
            },
            wind: {
                min: winds.length ? Math.round(Math.min(...winds) * 1.15078) : 'N/A',
                max: winds.length ? Math.round(Math.max(...winds) * 1.15078) : 'N/A',
                avg: winds.length ? Math.round((winds.reduce((a,b) => a+b, 0) / winds.length) * 1.15078) : 'N/A',
            },
            tide: {
                min: tides.length ? Math.min(...tides).toFixed(1) : 'N/A',
                max: tides.length ? Math.max(...tides).toFixed(1) : 'N/A',
            },
            waterTemp: {
                min: waterTemps.length ? Math.round((Math.min(...waterTemps) * 9 / 5) + 32) : 'N/A',
                max: waterTemps.length ? Math.round((Math.max(...waterTemps) * 9 / 5) + 32) : 'N/A',
            },
            airTemp: {
                min: airTemps.length ? Math.round((Math.min(...airTemps) * 9 / 5) + 32) : 'N/A',
                max: airTemps.length ? Math.round((Math.max(...airTemps) * 9 / 5) + 32) : 'N/A',
            },
            count: entries.length,
            windDir: windDirs.length > 0 ? windDirs[Math.floor(windDirs.length / 2)] : null,
            tideDirection: tideDirections.length > 0 ? tideDirections[0] : null,
            tideNarrative: getTideNarrative().join(' '),
        };

        // Generate natural language summary
        const getConditions = () => {
            const swellAvg = parseFloat(stats.swell.avg);
            const windAvg = parseFloat(stats.wind.avg);
            
            if (!Number.isFinite(swellAvg) || !Number.isFinite(windAvg)) return 'Mixed conditions';
            
            if (swellAvg < 2) return 'Ankle-high waves';
            if (swellAvg < 3 && windAvg < 10) return 'Glassy and small,';
            if (swellAvg < 4 && windAvg < 12) return 'Fun and clean,';
            if (swellAvg < 6 && windAvg < 15) return 'Good conditions,';
            if (swellAvg < 8 && windAvg < 20) return 'Solid and pumping,';
            if (windAvg > 20) return 'Windy and choppy';
            return 'Decent waves';
        };

        // Analyze conditions for actionable insights
        const getContextualInsights = () => {
            const insights = [];
            const windAvg = parseFloat(stats.wind.avg);
            const swellAvg = parseFloat(stats.swell.avg);
            const waterTempAvg = (parseFloat(stats.waterTemp.min) + parseFloat(stats.waterTemp.max)) / 2;
            
            // Wind direction impact
            if (windAvg > 15 && stats.windDir) {
                const windOnshoreBreaks = ['N', 'NW', 'W', 'WSW', 'SW'];
                const isOnshore = windOnshoreBreaks.includes(stats.windDir);
                if (isOnshore) {
                    insights.push(`⚠️ ${windAvg}mph onshore wind will chop it up`);
                }
            }
            
            // Tide direction benefit
            if (stats.tideDirection === 'rising' && Number.isFinite(swellAvg) && swellAvg > 3) {
                insights.push('✓ Rising tide helps with shape');
            }
            
            // Water temp appeal
            if (Number.isFinite(waterTempAvg)) {
                if (waterTempAvg > 70) {
                    insights.push('Water is warm');
                } else if (waterTempAvg < 60) {
                    insights.push('Cold water — bring booties');
                }
            }
            
            // Preference-based recommendation
            if (insights.length > 0) {
                if (windAvg > 15 && Number.isFinite(swellAvg) && swellAvg > 4) {
                    insights.push('If you prioritize size over surface, still worth a go');
                }
            }
            
            return insights;
        };

        stats.summary = (() => {
            const swellAvg = parseFloat(stats.swell.avg);
            const windAvg = parseFloat(stats.wind.avg);
            const waterTempMin = parseFloat(stats.waterTemp.min);
            const conditions = getConditions();
            
            if (!Number.isFinite(swellAvg)) return 'No forecast data available.';
            
            let summary = `${conditions} `;
            summary += `${Number(stats.swell.min).toFixed(0)}${(Number(stats.swell.min).toFixed(0) === Number(stats.swell.max).toFixed(0) ? '' : `-${Number(stats.swell.max).toFixed(0)}`)}ft swell @ ${Number(stats.period.min).toFixed(1)}${(Number(stats.period.min).toFixed(1) === Number(stats.period.max).toFixed(1) ? '' : `-${Number(stats.period.max).toFixed(1)}`)}s. `;
            summary += `Wind ${Number(stats.wind.min)}${(Number(stats.wind.min) === Number(stats.wind.max) ? '' : `-${Number(stats.wind.max)}`)} mph`;
            
            if (Number.isFinite(waterTempMin) && stats.waterTemp.min !== 'N/A') {
                summary += ` and water temps ${stats.waterTemp.min}${(Number(stats.waterTemp.min) === Number(stats.waterTemp.max) ? '' : `-${stats.waterTemp.max}`)}°F`;
            }
            summary += `.`;
            
            // Add contextual insights if available
            const insights = getContextualInsights();
            if (insights.length > 0) {
                summary += ` ${insights.join(' ')}`;
            }
            if (stats.tideNarrative) {
                summary += ` ${stats.tideNarrative}`;
            }
            
            return summary;
        })();

        return stats;
    };

    const forecastReports = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        const morning = [];
        const afternoon = [];
        const evening = [];
        const tomorrow = [];

        displayData.forEach(entry => {
            if (!Number.isFinite(entry.timestamp)) return;

            const entryDate = new Date(entry.timestamp);
            const entryHour = entryDate.getHours();
            const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

            // Morning: 5 AM - 12 PM
            if (entryHour >= 5 && entryHour < 12 && entryDay.getTime() === todayStart.getTime()) {
                morning.push(entry);
            }
            // Afternoon: 12 PM - 5 PM
            else if (entryHour >= 12 && entryHour < 17 && entryDay.getTime() === todayStart.getTime()) {
                afternoon.push(entry);
            }
            // Evening: 5 PM - 9 PM
            else if (entryHour >= 17 && entryHour < 21 && entryDay.getTime() === todayStart.getTime()) {
                evening.push(entry);
            }
            // Tomorrow
            else if (entryDay.getTime() === tomorrowStart.getTime()) {
                tomorrow.push(entry);
            }
        });

        const morningStats = calculateSegmentStats(morning, 'morning');
        const afternoonStats = calculateSegmentStats(afternoon, 'afternoon');
        const eveningStats = calculateSegmentStats(evening, 'evening');
        const tomorrowStats = calculateSegmentStats(tomorrow, 'tomorrow window');

        // Generate comparison for tomorrow from today
        if (tomorrowStats && (morningStats || afternoonStats || eveningStats)) {
            const todayEntries = [...morning, ...afternoon, ...evening];
            const todayStats = calculateSegmentStats(todayEntries, 'day');

            if (todayStats) {
                const tomorrowSwellAvg = parseFloat(tomorrowStats.swell.avg);
                const todaySwellAvg = parseFloat(todayStats.swell.avg);
                const tomorrowPeriodAvg = parseFloat(tomorrowStats.period.avg);
                const todayPeriodAvg = parseFloat(todayStats.period.avg);
                const tomorrowWindAvg = parseFloat(tomorrowStats.wind.avg);
                const todayWindAvg = parseFloat(todayStats.wind.avg);
                const tomorrowWaterAvg = (parseFloat(tomorrowStats.waterTemp.min) + parseFloat(tomorrowStats.waterTemp.max)) / 2;
                const todayWaterAvg = (parseFloat(todayStats.waterTemp.min) + parseFloat(todayStats.waterTemp.max)) / 2;

                let comparison = 'It will be ';
                
                // Swell comparison
                if (Number.isFinite(tomorrowSwellAvg) && Number.isFinite(todaySwellAvg)) {
                    comparison += tomorrowSwellAvg > todaySwellAvg ? 'bigger' : tomorrowSwellAvg < todaySwellAvg ? 'smaller' : 'similar';
                    comparison += ` tomorrow with swell averaging ${tomorrowSwellAvg.toFixed(1)}ft compared to ${todaySwellAvg.toFixed(1)}ft today`;
                }

                // Period comparison
                if (Number.isFinite(tomorrowPeriodAvg) && Number.isFinite(todayPeriodAvg)) {
                    comparison += ', and an ';
                    comparison += tomorrowPeriodAvg > todayPeriodAvg ? 'increase' : tomorrowPeriodAvg < todayPeriodAvg ? 'decrease' : 'unchanged';
                    comparison += ` in period (${tomorrowPeriodAvg.toFixed(1)}s from ${todayPeriodAvg.toFixed(1)}s)`;
                }

                // Wind comparison
                if (Number.isFinite(tomorrowWindAvg) && Number.isFinite(todayWindAvg)) {
                    comparison += ', with ';
                    comparison += tomorrowWindAvg > todayWindAvg ? 'more' : tomorrowWindAvg < todayWindAvg ? 'less' : 'similar';
                    comparison += ` wind (${tomorrowWindAvg} mph from ${todayWindAvg} mph)`;
                }

                // Temperature comparison
                if (Number.isFinite(tomorrowWaterAvg) && Number.isFinite(todayWaterAvg) && 
                    tomorrowStats.waterTemp.min !== 'N/A' && todayStats.waterTemp.min !== 'N/A') {
                    comparison += ', and ocean temps will be ';
                    comparison += tomorrowWaterAvg > todayWaterAvg ? 'up' : tomorrowWaterAvg < todayWaterAvg ? 'down' : 'similar';
                    comparison += ` (${tomorrowWaterAvg.toFixed(1)}°F from ${todayWaterAvg.toFixed(1)}°F)`;
                } else {
                    comparison += '.';
                }

                if (tomorrowStats.tideNarrative) {
                    comparison += ` ${tomorrowStats.tideNarrative}`;
                }

                tomorrowStats.summary = comparison;
            }
        }

        const buildPriorComparison = (currentStats, priorStats, currentLabel, priorLabel) => {
            if (!currentStats || !priorStats) return '';

            const currentSwell = parseFloat(currentStats.swell.avg);
            const priorSwell = parseFloat(priorStats.swell.avg);
            const currentWind = parseFloat(currentStats.wind.avg);
            const priorWind = parseFloat(priorStats.wind.avg);
            const currentPeriod = parseFloat(currentStats.period.avg);
            const priorPeriod = parseFloat(priorStats.period.avg);
            const currentTide = parseFloat(currentStats.tide.max);
            const priorTide = parseFloat(priorStats.tide.max);

            const parts = [];

            if (Number.isFinite(currentSwell) && Number.isFinite(priorSwell)) {
                if (currentSwell > priorSwell + 0.2) {
                    parts.push(`${currentLabel} swell size is increasing compared to ${priorLabel}`);
                } else if (currentSwell < priorSwell - 0.2) {
                    parts.push(`${currentLabel} swell size is easing compared to ${priorLabel}`);
                } else {
                    parts.push(`${currentLabel} swell size is similar to ${priorLabel}`);
                }
            }

            if (Number.isFinite(currentWind) && Number.isFinite(priorWind)) {
                if (currentWind < priorWind - 2) {
                    parts.push(`${currentLabel} wind conditions will be improving compared to ${priorLabel}`);
                } else if (currentWind > priorWind + 2) {
                    parts.push(`${currentLabel} wind conditions will be more textured than ${priorLabel}`);
                } else {
                    parts.push(`${currentLabel} wind conditions are similar to ${priorLabel}`);
                }
            }

            if (Number.isFinite(currentPeriod) && Number.isFinite(priorPeriod)) {
                if (currentPeriod > priorPeriod + 0.3) {
                    parts.push(`Energy in the swell period is a bit stronger than ${priorLabel}`);
                } else if (currentPeriod < priorPeriod - 0.3) {
                    parts.push(`Swell period is a touch shorter than ${priorLabel}`);
                }
            }

            if (Number.isFinite(currentTide) && Number.isFinite(priorTide) && currentLabel.toLowerCase() === 'evening') {
                if (currentTide > priorTide + 0.4) {
                    parts.push(`Things may be a little slower than ${priorLabel} with the higher tide in the ${currentLabel.toLowerCase()}`);
                }
            }

            if (!parts.length) return '';
            return `${parts.join('. ')}.`;
        };

        if (afternoonStats && morningStats) {
            const comparison = buildPriorComparison(afternoonStats, morningStats, 'Afternoon', 'this morning');
            if (comparison) {
                afternoonStats.summary = `${comparison} ${afternoonStats.summary}`;
            }
        }

        if (eveningStats && afternoonStats) {
            const comparison = buildPriorComparison(eveningStats, afternoonStats, 'Evening', 'this afternoon');
            if (comparison) {
                eveningStats.summary = `${comparison} ${eveningStats.summary}`;
            }
        }

        return {
            morning: morningStats,
            afternoon: afternoonStats,
            evening: eveningStats,
            tomorrow: tomorrowStats,
        };
    }, [displayData]);

    const reportCards = useMemo(() => {
        const hour = new Date(nowTs).getHours();
        const configs = [
            { key: 'morning', label: '🌅 Morning (5 AM - 12 PM)', color: '#ffd166' },
            { key: 'afternoon', label: '☀️ Afternoon (12 PM - 5 PM)', color: '#f4a261' },
            { key: 'evening', label: '🌇 Evening (5 PM - 9 PM)', color: '#e76f51' },
            { key: 'tomorrow', label: '📅 Tomorrow', color: '#2ec4b6' },
        ];

        return configs.filter(({ key }) => {
            if (key === 'morning') return hour < 12;
            if (key === 'afternoon') return hour < 17;
            if (key === 'evening') return hour < 21;
            return true;
        });
    }, [nowTs]);

    // Tooltip for detailed info
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload[0]) return null;

        const data = payload[0].payload;

        const getSourceTagStyle = (sourceLabel) => {
            const label = String(sourceLabel || '').toLowerCase();

            if (!label) {
                return {
                    borderColor: '#607d8b',
                    color: '#b0bec5',
                    backgroundColor: 'rgba(96, 125, 139, 0.15)',
                };
            }

            if (label.includes('noaa/ndbc buoy')) {
                return {
                    borderColor: '#ff9f43',
                    color: '#ffd2a4',
                    backgroundColor: 'rgba(255, 159, 67, 0.16)',
                };
            }

            if (label.includes('marine')) {
                return {
                    borderColor: '#2ec4b6',
                    color: '#b9fff9',
                    backgroundColor: 'rgba(46, 196, 182, 0.14)',
                };
            }

            if (label.includes('weather') || label.includes('air temperature')) {
                return {
                    borderColor: '#42a5f5',
                    color: '#9cd0ff',
                    backgroundColor: 'rgba(66, 165, 245, 0.14)',
                };
            }

            if (label.includes('fallback') || label.includes('simulated')) {
                return {
                    borderColor: '#f4d35e',
                    color: '#ffe8a3',
                    backgroundColor: 'rgba(244, 211, 94, 0.14)',
                };
            }

            return {
                borderColor: '#90a4ae',
                color: '#cfd8dc',
                backgroundColor: 'rgba(144, 164, 174, 0.14)',
            };
        };

        return (
            <div 
                className='containerDetail'
                style={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    padding: '8px',
                    color: '#fff',
                    fontSize: '12px',
                }}
            >
                <div className='color-yellow'>
                    <span className='mr-5'>🕝</span>{data.time.toString().replace(' ', '')}
                </div>
                <div className='contentLeft' style={{ color: '#42a5f5' }}>
                    <span className='mr-5'>🌊</span>{data.swellHeight}<span className='copyright'>ft</span>
                </div>
                <div className='contentLeft' style={{ color: '#ce72de' }}>
                    <span className='mr-5'>⏱️</span>{data.period}s
                </div>
                {Number.isFinite(data.tideLevel) && (
                    <div>
                        <div className='contentLeft' style={{ color: '#f4d35e' }}>
                            <span className='mr-5'>🌗</span>{data.tideLevel}<span className='copyright'>ft</span>
                            {/*data.tidePhase ? ` ${data.tidePhase}` : ''*/}
                            {data.tideDirection ? `${(data.tideDirection === 'falling') ? '🔻' : '🔺'}` : '❓'}
                        </div>
                    </div>
                )}
                <div className='contentLeft' style={{ color: '#ff9143' }}>
                    <span className='mr-5'>💨</span>{Math.round(data.wind * 1.15078)}<span className='copyright'>mph</span>
                </div>
                <div className='contentLeft' style={{ color: '#03c6ed-' }}>
                    <span className='mr-5'>💧</span>{data.waterTempSource ? (
                        <div
                            style={{
                                ...getSourceTagStyle(data.waterTempSource),
                                marginTop: '4px',
                                border: `1px solid ${getSourceTagStyle(data.waterTempSource).borderColor}`,
                                borderRadius: '10px',
                                fontSize: '10px',
                                display: 'inline-block',
                                padding: '1px 6px',
                                lineHeight: 1.4,
                            }}
                        >
                            {Number.isFinite(data.waterTemp)
                                ? <>{Math.round((data.waterTemp * 9 / 5) + 32)}°<span className='copyright'>F</span></>
                                : 'N/A'}
                        </div>
                    ) : null}
                </div>
                <div className='contentLeft' style={{ color: '#86f3ea' }}>
                    <span className='mr-5'>🌡️</span>{data.airTempSource ? (
                        <div
                            style={{
                                ...getSourceTagStyle(data.airTempSource),
                                marginTop: '4px',
                                border: `1px solid ${getSourceTagStyle(data.airTempSource).borderColor}`,
                                borderRadius: '10px',
                                fontSize: '10px',
                                display: 'inline-block',
                                padding: '1px 6px',
                                lineHeight: 1.4,
                            }}
                        >
                            {Number.isFinite(data.airTemp)
                                ? <>{Math.round((data.airTemp * 9 / 5) + 32)}°<span className='copyright'>F</span></>
                                : 'N/A'}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    return (
        <div className='containerDetail contentLeft'>
            <div className='containerDetail color-yellow p-20 size20'>
                📊 {hoursToShow}-Hour Forecast {selectedBeach && `@ ${selectedBeach}`}
            </div>
            {sourceLoading && !sourceData ? null : (
                <div className='containerDetail m-5 p-10' style={{ backgroundColor: '#1a1f2e', border: '1px solid #2a3f5f' }}>
                    <div className='color-yellow size18 mb-10'>📋 Detailed Forecast Reports</div>
                    <div style={{ color: '#9fb3c8', fontSize: '10px', marginBottom: '8px' }}>
                        Tide resolution: {tideResolutionMeta.resolution} ({tideResolutionMeta.source})
                    </div>

                    <div className='flexContainer' style={{ flexWrap: 'wrap', gap: '10px' }}>
                        {reportCards.map(({ key, label, color }) => {
                            const report = forecastReports[key];
                            return (
                                <div
                                    key={key}
                                    style={{
                                        backgroundColor: '#111827',
                                        border: `1px solid ${color}`,
                                        borderRadius: '6px',
                                        padding: '10px',
                                        flex: '1',
                                        minWidth: '200px',
                                        fontSize: '11px',
                                    }}
                                >
                                    <div
                                    style={{
                                        color: color,
                                        fontWeight: 'bold',
                                        marginBottom: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                    onClick={() => toggleReportCollapse(key)}
                                >
                                    <span>{collapsedReports[key] ? '▶' : '▼'}</span>
                                    {label}
                                </div>
                                    {report && report.count > 0 ? (
                                        <>
                                            {!collapsedReports[key] && (
                                                <div style={{ color: '#bbb', marginBottom: '6px', fontSize: '10px', lineHeight: 1.3 }}>
                                                    {report.timeRange}
                                                </div>
                                            )}
                                            <div style={{ color: '#e0e0e0', marginBottom: collapsedReports[key] ? '0px' : '8px', fontSize: '11px', lineHeight: 1.4, fontStyle: 'italic' }}>
                                                {report.summary}
                                            </div>
                                            {!collapsedReports[key] && (
                                                <>
                                                    <div style={{ color: '#42a5f5', marginBottom: '3px', fontSize: '10px' }}>
                                                        🌊 Swell: {report.swell.min}-{report.swell.max}ft (avg {report.swell.avg}ft)
                                                    </div>
                                                    <div style={{ color: '#ce72de', marginBottom: '3px', fontSize: '10px' }}>
                                                        ⏱️ Period: {report.period.min}-{report.period.max}s (avg {report.period.avg}s)
                                                    </div>
                                                    <div style={{ color: '#ff9143', marginBottom: '3px', fontSize: '10px' }}>
                                                        💨 Wind: {report.wind.min}-{report.wind.max} mph (avg {report.wind.avg} mph)
                                                    </div>
                                                    <div style={{ color: '#f4d35e', marginBottom: '3px', fontSize: '10px' }}>
                                                        🌗 Tide: {report.tide.min}-{report.tide.max}ft
                                                    </div>
                                                    {report.waterTemp.min !== 'N/A' && (
                                                        <div style={{ color: '#03c6ed', marginBottom: '3px', fontSize: '10px' }}>
                                                            💧 Water: {report.waterTemp.min}-{report.waterTemp.max}°F
                                                        </div>
                                                    )}
                                                    {report.airTemp.min !== 'N/A' && (
                                                        <div style={{ color: '#86f3ea', fontSize: '10px' }}>
                                                            🌡️ Air: {report.airTemp.min}-{report.airTemp.max}°F
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ color: '#666' }}>No data available</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className='containerDetail color-lite mt-5'>
                <div className='containerDetail flexContainer mb-5 p-10 lh-10 color-lite'>
                    <div
                        onClick={() => setForecastSource('open-meteo')}
                        className='button flex3Column mr-5 p-10'
                        style={{
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: forecastSource === 'open-meteo' ? '1px solid #42a5f5' : '1px solid #555',
                            backgroundColor: forecastSource === 'open-meteo' ? '#1e3a5f' : '#222',
                            color: forecastSource === 'open-meteo' ? '#9cd0ff' : '#bbb'
                        }}
                    >
                        Open-Meteo
                    </div>           
                    <div
                        onClick={() => setForecastSource('noaa')}
                        className='button flex3Column mr-5 p-10'
                        style={{
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: forecastSource === 'noaa' ? '1px solid #ff9f43' : '1px solid #555',
                            backgroundColor: forecastSource === 'noaa' ? '#4d2f09' : '#222',
                            color: forecastSource === 'noaa' ? '#ffd2a4' : '#bbb'
                        }}
                    >
                        NOAA (NDBC)
                    </div>           
                    <div
                        onClick={() => setForecastSource('ww3')}
                        className='button flex3Column p-10'
                        style={{
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: forecastSource === 'ww3' ? '1px solid #2ec4b6' : '1px solid #555',
                            backgroundColor: forecastSource === 'ww3' ? '#0f3e3a' : '#222',
                            color: forecastSource === 'ww3' ? '#b9fff9' : '#bbb'
                        }}
                    >
                        NOAA WW3 (Model)
                    </div>           
                </div>
                <div className='containerDetail color-lite pl-20' style={{ fontSize: '12px', color: '#999' }}>
                    Source: {activeSource.label}
                    <span
                        style={{
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            border: `1px solid ${activeSource.type === 'Observed' ? '#ff9f43' : '#42a5f5'}`,
                            color: activeSource.type === 'Observed' ? '#ffd2a4' : '#9cd0ff',
                            marginLeft: '5px',
                        }}
                    >
                        {activeSource.type}
                    </span>
                    <br/>
                    {activeSource.type === 'Observed' ? '(recent measured buoy trend)' : '(model-projected 48-hour trend)'}
                </div>
            </div>         
            {!hasWaterTempData && (
                <div style={{ fontSize: '11px', marginLeft: '10px', marginTop: '6px', color: '#ffd166' }}>
                    ⚠️ No water-temperature samples were returned for this source in the selected {hoursToShow === 16 ? 'daytime (5 AM-9 PM)' : '48-hour'} window.
                </div>
            )}
            {sourceLoading && <div style={{ fontSize: '12px', marginLeft: '10px', color: '#666' }}>⏳ Loading {forecastSource === 'open-meteo' ? 'Open-Meteo' : forecastSource === 'noaa' ? 'NOAA/NDBC' : 'NOAA WW3'} data...</div>}
            {sourceError && <div style={{ fontSize: '12px', marginLeft: '10px', color: '#f44336' }}>⚠️ Using simulated data ({forecastSource})</div>}
           

            {sourceLoading && !sourceData ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#999',
                    fontSize: '14px',
                }}>
                    Fetching forecast from {forecastSource === 'open-meteo' ? 'Open-Meteo' : forecastSource === 'noaa' ? 'NOAA/NDBC' : 'NOAA WW3'}...
                </div>
            ) : (
                <>
                        <div className='containerDetail flexContainer mt-5 p-10'>
                            <div
                                onClick={() => setHoursToShow(hoursToShow === 48 ? 16 : 48)}
                                className={`containerDetail flex2Column button w-50 brdr-lite color-yellow size12${hoursToShow === 16 ? ' bg-green' : ''}`}
                            >
                                16 hours {hoursToShow === 16 ? '✓' : ''}
                            </div>
                            <div
                                onClick={() => setHoursToShow(hoursToShow === 48 ? 16 : 48)}
                                className={`containerDetail flex2Column button w-50 brdr-lite ml-10 color-yellow size12 ${hoursToShow === 48 ? 'bg-green' : ''}`}
                            >
                                48 hours {hoursToShow === 48 ? '✓' : ''}
                            </div>
                        </div> 
                        <div className='color-yellow contentLeft p-10 size20'>
                            {tideStation?.name && (
                                <div className='pl-20 size12' style={{ color: '#f4d35e' }}>
                                    🌗 Tide: {tideStation.name} ({tideStation.id})
                                </div>
                            )}
                        </div>
                    <ResponsiveContainer width='100%' height={300}>
                <LineChart data={displayData} margin={{ top: 5, right: 8, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#ddd' />
                    <XAxis
                        dataKey='time'
                        tick={{ fontSize: 11 }}
                        interval={hoursToShow === 16 ? 1 : 3}
                        angle={-45}
                        textAnchor='end'
                        height={60}
                    />
                    <YAxis
                        yAxisId='left'
                        domain={[
                            (dataMin) => {
                                const min = Number.isFinite(dataMin) ? dataMin : 0;
                                return Math.min(0, Math.floor((min - 0.25) * 2) / 2);
                            },
                            (dataMax) => Math.ceil((dataMax || 0) * 1.15),
                        ]}
                        tick={{ fontSize: 11 }}
                    />
                    <YAxis
                        yAxisId='right'
                        orientation='right'
                        width={34}
                        tickMargin={2}
                        label={{ value: '💨 Wind (mph)', angle: 90, position: 'insideRight', style: { fill: '#ff9143' } }}
                        tick={{ fontSize: 11 }}
                    />
                    <YAxis
                        yAxisId='temp'
                        hide={true}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {visibleSeries.swell && (
                        <Line
                            yAxisId='left'
                            type='monotone'
                            dataKey='swellHeight'
                            name='Swell'
                            stroke='#42a5f5'
                            dot={false}
                            strokeWidth={2}
                        />
                    )}
                    {visibleSeries.period && (
                        <Line
                            yAxisId='left'
                            type='monotone'
                            dataKey='period'
                            name='Period'
                            stroke='#ce72de'
                            dot={false}
                            strokeWidth={2}
                        //strokeDasharray='1 6'
                        />
                    )}
                    {visibleSeries.tide && (
                        <Line
                            yAxisId='left'
                            type='monotone'
                            dataKey='tideScaled'
                            name='Tide'
                            stroke='#f4d35e'
                            dot={false}
                            strokeWidth={2}
                            connectNulls={true}
                        />
                    )}
                    {visibleSeries.wind && (
                        <Line
                            yAxisId='right'
                            type='monotone'
                            dataKey='wind'
                            name='Wind--'
                            stroke='#ff9143'
                            dot={false}
                            strokeWidth={2}
                            //strokeDasharray='5 5'
                        />
                    )}
                    {visibleSeries.water && (
                        <Line
                            yAxisId='temp'
                            type='monotone'
                            dataKey='waterTemp'
                            name='Water'
                            stroke='#03c6ed'
                            dot={false}
                            strokeWidth={2}
                        //strokeDasharray='2 4'
                        />
                    )}
                    {visibleSeries.air && (
                        <Line
                            yAxisId='temp'
                            type='monotone'
                            dataKey='airTemp'
                            name='Air'
                            stroke='#86f3ea'
                            dot={false}
                            strokeWidth={2}
                        />
                    )}
                </LineChart>
                    </ResponsiveContainer>

                    <div 
                        className='flexContainer'
                    >
                        {/* Summary stats */}
                        {[
                    {
                        key: 'swell',
                        label: '🌊',
                        value: (() => {
                            const swellValues = displayData
                                .map((entry) => entry.swellHeight)
                                .filter((height) => Number.isFinite(height));

                            if (!swellValues.length) return 'N/A';

                            const minSwell = Math.min(...swellValues).toFixed(1);
                            const maxSwell = Math.max(...swellValues).toFixed(1);
                            return `${minSwell}ft\n${maxSwell}ft`;
                        })(),
                        color: '#42a5f5',
                    },{
                        key: 'period',
                        label: '⏱️',
                        value: (() => {
                            const periodValues = displayData
                                .map((entry) => entry.period)
                                .filter((period) => Number.isFinite(period));

                            if (!periodValues.length) return 'N/A';

                            const minPeriod = Math.min(...periodValues).toFixed(1);
                            const maxPeriod = Math.max(...periodValues).toFixed(1);
                            return `${minPeriod}s\n${maxPeriod}s`;
                        })(),
                        color: '#ce72de',
                    },
                    {
                        key: 'tide',
                        label: '🌗',
                        value: (() => {
                            const tideLevels = displayData
                                .map((entry) => entry.tideLevel)
                                .filter((level) => Number.isFinite(level));

                            if (!tideLevels.length) return 'N/A';

                            const minLevel = Math.min(...tideLevels).toFixed(1);
                            const maxLevel = Math.max(...tideLevels).toFixed(1);
                            return `${minLevel}ft\n${maxLevel}ft`;
                        })(),
                        color: '#f4d35e',
                    },
                    {
                        key: 'wind',
                        label: '💨',
                        value: (() => {
                            const windValues = displayData
                                .map((entry) => entry.wind)
                                .filter((wind) => Number.isFinite(wind));

                            if (!windValues.length) return 'N/A';

                            const minMph = Math.round(Math.min(...windValues) * 1.15078);
                            const maxMph = Math.round(Math.max(...windValues) * 1.15078);
                            return `${minMph}mph\n${maxMph}mph`;
                        })(),
                        color: '#ff9143',
                    },
                    {
                        key: 'water',
                        label: '💧',
                        value: (() => {
                            const waterTemps = displayData
                                .map((entry) => entry.waterTemp)
                                .filter((temp) => Number.isFinite(temp));

                            if (!waterTemps.length) return 'N/A';

                            const minF = Math.round((Math.min(...waterTemps) * 9 / 5) + 32);
                            const maxF = Math.round((Math.max(...waterTemps) * 9 / 5) + 32);
                            return `${minF}°F\n${maxF}°F`;
                        })(),
                        color: '#03c6ed',
                    },
                    {
                        key: 'air',
                        label: '🌡️',
                        value: (() => {
                            const airTemps = displayData
                                .map((entry) => entry.airTemp)
                                .filter((temp) => Number.isFinite(temp));

                            if (!airTemps.length) return 'N/A';

                            const minF = Math.round((Math.min(...airTemps) * 9 / 5) + 32);
                            const maxF = Math.round((Math.max(...airTemps) * 9 / 5) + 32);
                            return `${minF}°F\n${maxF}°F`;
                        })(),
                        color: '#86f3ea',
                    },
                        ].map((stat, i) => {
                            const statKey = stat.key;

                            return (
                            <div
                                key={i}
                                onClick={() => toggleSeries(statKey)}
                                style={{
                                    backgroundColor: '#222',
                                    border: `2px solid ${stat.color}`,
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    opacity: visibleSeries[statKey] ? 1 : 0.5,
                                }}
                                className='w-120 mr-5'
                            >
                                <div className='containerDetail contentLeft size15 mb-5' style={{ color: stat.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                        type='checkbox'
                                        checked={Boolean(visibleSeries[statKey])}
                                        onChange={() => toggleSeries(statKey)}
                                        onClick={(event) => event.stopPropagation()}
                                    />
                                    {stat.label}
                                </div>
                                <div className='contentLeft mt--5 pl-5 pb-5' style={{ fontSize: '16px', fontWeight: 'bold', color: stat.color, whiteSpace: 'pre-line' }}>
                                    {stat.value}
                                </div>
                            </div>
                        )})}
                    </div>
                </>
            )}
            <div className='containerDetail p-10' style={{ fontSize: '11px', color: '#95a5a6' }}>
                <div>
                    Temp source legend:
                </div>
                <div className='mb-5'>
                    <span style={{ padding: '1px 6px', borderRadius: '10px', border: '1px solid #ff9f43', color: '#ffd2a4', backgroundColor: 'rgba(255, 159, 67, 0.16)' }}>
                        Buoy observed
                    </span>
                    <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '10px', border: '1px solid #2ec4b6', color: '#b9fff9', backgroundColor: 'rgba(46, 196, 182, 0.14)' }}>
                        Marine SST
                    </span>
                    <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '10px', border: '1px solid #42a5f5', color: '#9cd0ff', backgroundColor: 'rgba(66, 165, 245, 0.14)' }}>
                        Weather air
                    </span>
                    <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '10px', border: '1px solid #f4d35e', color: '#ffe8a3', backgroundColor: 'rgba(244, 211, 94, 0.14)' }}>
                        Fallback
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ForecastChart;
