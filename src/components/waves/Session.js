import React, { useState, useEffect } from 'react';
import LogEntry from './LogEntryFunctional';
import Loader from '../site/Loader';
import interfaceData from './InterfaceData';
import templateData from './LogTemplateData';
import generateNewLogId from './GenerateLogId';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';
import icons from '../site/icons';
import getDirection from './getDirection';
import getWindOrientation from './GetWindOrientation';
import { getWaveHeight } from './LogEntryFunctional';
import getWindMPH from './GetWindMPH';
import getSurface from './GetSurface';
import {
    combineDateAndTime,
    formatDate,
    formatTime,
    getAccumulatedMinutes,
    normalizeSessionTime
} from '../utils/sessionTimeUtils';

const Session = ({logId, location}) => { 

    const isNewSessionRoute = () => {
        const search = location?.search || window.location.search || '';
        return search.includes('new=1');
    };

    const normalizeDirection = (value, fallback = '') => {
        if (value === null || value === undefined) {
            return fallback;
        }

        const numeric = Number(value);
        if (Number.isFinite(numeric)) {
            const fromDegrees = getDirection(numeric);
            if (fromDegrees) {
                return fromDegrees;
            }
        }

        const normalized = String(value).trim().toUpperCase();
        return normalized || fallback;
    };

    const normalizeHeightFt = (value, fallback = '') => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        const numeric = Number(String(value).replace('ft', '').trim());
        if (Number.isNaN(numeric)) {
            return fallback;
        }
        return `${Math.max(0, Math.round(numeric))}ft`;
    };

    // Always return interval as 'N seconds' string
    const normalizeInterval = (value, fallback = '') => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        // If already in 'N seconds' format, return as is
        if (typeof value === 'string' && value.trim().match(/^\d+\s*seconds?$/)) {
            return value.trim().replace(/\s+/, ' ');
        }
        // If just a number, convert to string
        const match = String(value).match(/-?\d+/);
        if (match) {
            return `${match[0]} seconds`;
        }
        return fallback;
    };

    const normalizeAngle = (value, fallback = '') => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        const match = String(value).match(/-?\d+/);
        if (match) {
            return match[0];
        }
        return fallback;
    };  

    const asNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const normalizeTemperature = (value, fallback = '') => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }

        const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
        if (!Number.isFinite(numeric)) {
            return fallback;
        }

        return String(Math.round(numeric));
    };

    const getStoredWindGusts = () => {
        const rawGusts = initializeData('windGusts', null);
        const parsedGusts = Number(String(rawGusts ?? '').replace(/[^\d.-]/g, ''));
        if (Number.isFinite(parsedGusts) && parsedGusts >= 0) {
            return parsedGusts;
        }

        const rawSpeed = initializeData('windSpeed', null);
        const parsedSpeed = Number(String(rawSpeed ?? '').replace(/[^\d.-]/g, ''));
        if (Number.isFinite(parsedSpeed) && parsedSpeed >= 0) {
            return parsedSpeed;
        }

        return 5;
    };

    const getIntervalSeconds = (value) => {
        const match = String(value || '').match(/-?\d+/);
        return match ? Number(match[0]) : 0;
    };

    const getStoredSwellSnapshot = (prefix, fallbackSwell) => {
        // Always use fallback if nothing in storage
        const height = normalizeHeightFt(
            initializeData(`${prefix}Height`, fallbackSwell.Height),
            fallbackSwell.Height
        );
        const direction = normalizeDirection(
            initializeData(`${prefix}Direction`, fallbackSwell.Direction),
            fallbackSwell.Direction
        );
        const angle = normalizeAngle(
            initializeData(`${prefix}Angle`, fallbackSwell.Angle),
            fallbackSwell.Angle
        );
        // If no interval in storage, use fallback, and if fallback is missing, use '12 seconds'
        let interval = normalizeInterval(
            initializeData(`${prefix}Interval`, fallbackSwell.Interval),
            fallbackSwell.Interval
        );
        if (!interval) interval = '12 seconds';
        return {
            ...fallbackSwell,
            Height: height,
            Direction: direction,
            Angle: angle,
            Interval: interval
        };
    };

    const getHeaderWaveSnapshots = () => {
        const primaryHeaderSwell = getStoredSwellSnapshot('swell2', templateData.Swell1);
        const secondaryHeaderSwell = getStoredSwellSnapshot('swell1', templateData.Swell2);

        const primaryHasValue = getIntervalSeconds(primaryHeaderSwell.Interval) > 0
            || primaryHeaderSwell.Direction !== templateData.Swell1.Direction
            || primaryHeaderSwell.Height !== templateData.Swell1.Height;
        const secondaryHasValue = getIntervalSeconds(secondaryHeaderSwell.Interval) > 0
            || secondaryHeaderSwell.Direction !== templateData.Swell2.Direction
            || secondaryHeaderSwell.Height !== templateData.Swell2.Height;

        if (primaryHasValue || secondaryHasValue) {
            return {
                swell1: primaryHeaderSwell,
                swell2: secondaryHeaderSwell
            };
        }

        return {
            swell1: getStoredSwellSnapshot('swell1', templateData.Swell1),
            swell2: getStoredSwellSnapshot('swell2', templateData.Swell2)
        };
    };

    const getWindWaveSwellSnapshot = () => {
        const storedSwellData = initializeData('swellData', null);
        const safeSwell = (storedSwellData && typeof storedSwellData === 'object') ? storedSwellData : {};

        // Keep this aligned with SwellDisplay where wind-wave reads from safeSwell.wind_wave_*.
        const windWaveHeight = asNumber(safeSwell.wind_wave_height);
        const windWaveDirection = asNumber(safeSwell.wind_wave_direction);
        const windWaveInterval = asNumber(safeSwell.wind_wave_period);

        const hasWindWaveValues = windWaveHeight > 0 || windWaveDirection > 0 || windWaveInterval > 0;
        if (hasWindWaveValues) {
            return {
                ...templateData.Swell3,
                Height: normalizeHeightFt(windWaveHeight, templateData.Swell3.Height),
                Direction: normalizeDirection(windWaveDirection, templateData.Swell3.Direction),
                Angle: normalizeAngle(windWaveDirection, templateData.Swell3.Angle),
                Interval: normalizeInterval(windWaveInterval, templateData.Swell3.Interval)
            };
        }

        return getStoredSwellSnapshot('swell3', templateData.Swell3);
    };

    const orderPrimarySwells = (swell1, swell2) => {
        const firstInterval = getIntervalSeconds(swell1?.Interval);
        const secondInterval = getIntervalSeconds(swell2?.Interval);
        return (secondInterval > firstInterval)
            ? { swell1: swell2, swell2: swell1 }
            : { swell1, swell2 };
    };

    const getConditionFromStars = () => {
        const stars = Number(initializeData('stars', 3));
        if (!Number.isFinite(stars)) {
            return templateData.Conditions.Conditions;
        }
        if (stars >= 4) {
            return 'Firing';
        }
        if (stars >= 2) {
            return 'Good';
        }
        return 'Bad';
    };

    const getSurfLocationWindOrientation = (swellDirection, windDirection) => {
        const swell = String(swellDirection || '').charAt(0).toUpperCase();
        const wind = String(windDirection || '').charAt(0).toUpperCase();

        if (!swell || !wind) {
            return '';
        }

        if (swell === wind) {
            return 'onshore';
        }

        if ((swell === 'N' && wind === 'S')
            || (swell === 'S' && wind === 'N')
            || (swell === 'E' && wind === 'W')
            || (swell === 'W' && wind === 'E')) {
            return 'offshore';
        }

        if ((swell === 'N' && wind === 'E')
            || (swell === 'S' && wind === 'W')
            || (swell === 'E' && wind === 'S')
            || (swell === 'W' && wind === 'N')) {
            return 'sideshore => lefts';
        }

        if ((swell === 'N' && wind === 'W')
            || (swell === 'S' && wind === 'E')
            || (swell === 'E' && wind === 'N')
            || (swell === 'W' && wind === 'S')) {
            return 'sideshore => rights';
        }

        return '';
    };

    const getWindOrientationForSession = (swellDirection, windDirection) => {
        // First try swell + wind comparison
        if (swellDirection && String(swellDirection).trim() !== '') {
            const surfComparison = getSurfLocationWindOrientation(swellDirection, windDirection);
            if (surfComparison) {
                return surfComparison;
            }
        }

        // Fall back to wind-only lookup table
        if (windDirection && String(windDirection).trim() !== '') {
            const fromTable = getWindOrientation(windDirection);
            if (fromTable) {
                return fromTable;
            }
        }

        // Final fallback
        return '';
    };

    const getTideHeight = (phase) => {
        const localHeight = initializeData('height', null);
        const normalizedLocalHeight = normalizeHeightFt(localHeight, '');
        if (normalizedLocalHeight) {
            return normalizedLocalHeight;
        }

        if (phase === 'high') {
            return '5ft';
        }
        if (phase === 'medium') {
            return '3ft';
        }
        return '0ft';
    };

    const getCurrentTideFromTideData = () => {
        const storedTideData = initializeData('tideData', null);
        const tideRows = Array.isArray(storedTideData?.data?.data)
            ? storedTideData.data.data
            : (Array.isArray(storedTideData?.data) ? storedTideData.data : null);

        if (Array.isArray(tideRows) && tideRows.length > 0) {
            const currentTime = new Date();
            let closest = null;
            let smallestDifference = Infinity;

            tideRows.forEach((item) => {
                const itemTime = new Date(String(item?.t || '').replace(' ', 'T'));
                const itemHeight = Number(item?.v);

                if (!Number.isFinite(itemTime.getTime()) || !Number.isFinite(itemHeight)) {
                    return;
                }

                const timeDifference = Math.abs(currentTime - itemTime);
                if (timeDifference < smallestDifference) {
                    closest = item;
                    smallestDifference = timeDifference;
                }
            });

            const waterLevel = Number(closest?.v);
            if (Number.isFinite(waterLevel)) {
                const phase = (waterLevel > 4) ? 'high' : (waterLevel < 2) ? 'low' : 'medium';
                return {
                    phase,
                    height: `${Math.round(waterLevel)}ft`
                };
            }
        }

        const storedCurrentTide = Number(initializeData('currentTide', null));
        if (Number.isFinite(storedCurrentTide)) {
            const phase = (storedCurrentTide > 4) ? 'high' : (storedCurrentTide < 2) ? 'low' : 'medium';
            return {
                phase,
                height: `${Math.round(storedCurrentTide)}ft`
            };
        }

        const storedHeight = Number(initializeData('height', null));
        if (Number.isFinite(storedHeight)) {
            const phase = (storedHeight > 4) ? 'high' : (storedHeight < 2) ? 'low' : 'medium';
            return {
                phase,
                height: `${Math.round(storedHeight)}ft`
            };
        }

        return null;
    };

    const buildNewSessionLog = () => {
        const now = new Date();
        const sessionDraftNotes = initializeData('sessionDraftNotes', '');

        const currentTide = getCurrentTideFromTideData();
        const tidePhase = currentTide
            ? currentTide.phase
            : String(initializeData('tide', templateData.Tide.Phase)).toLowerCase();
        const windDirection = normalizeDirection(
            initializeData('windDirection', templateData.Wind.Direction),
            templateData.Wind.Direction
        );
        const windGusts = getStoredWindGusts();
        const waterTemp = normalizeTemperature(
            initializeData('waterTemp', templateData.Wind.WaterTemp),
            templateData.Wind.WaterTemp
        );
        const airTemp = normalizeTemperature(
            initializeData('airTemp', templateData.Wind.AirTemp),
            templateData.Wind.AirTemp
        );
        const headerWaveSnapshots = getHeaderWaveSnapshots();
        const nextSwell1 = headerWaveSnapshots.swell1;
        const nextSwell2 = headerWaveSnapshots.swell2;
        const nextSwell3 = getWindWaveSwellSnapshot();
        const orderedSwells = orderPrimarySwells(nextSwell1, nextSwell2);
        const windOrientation = getWindOrientationForSession(orderedSwells.swell1.Direction, windDirection);

        // Prepopulate startTime and endTime with current time (rounded to nearest 5 min)
        const roundTo5 = (date) => {
            const d = new Date(date);
            d.setSeconds(0, 0);
            d.setMinutes(Math.round(d.getMinutes() / 5) * 5);
            return d;
        };
        const start = roundTo5(now);
        // End time: 2 hours after start
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
        const accumulatedTime = Math.max(0, Math.round((end - start) / 1000 / 60));

        // Format as HH:mm for input fields
        const pad = (n) => String(n).padStart(2, '0');
        const startTimeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
        const endTimeStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

        return {
            ...templateData,
            Day: {
                Date: now,
                Day: now.getDate(),
                Month: now.getMonth() + 1,
                Year: now.getFullYear()
            },
            Location: {
                ...templateData.Location,
                Break: initializeData('spot', templateData.Location.Break)
            },
            Surf: {
                ...templateData.Surf,
                Height: getWaveHeight(orderedSwells.swell1.Height),
                Report: orderedSwells.swell1.Height
            },
            Swell1: orderedSwells.swell1,
            Swell2: orderedSwells.swell2,
            Swell3: nextSwell3,
            Tide: {
                ...templateData.Tide,
                Phase: tidePhase,
                Height: currentTide?.height || getTideHeight(tidePhase)
            },
            Wind: {
                ...templateData.Wind,
                Direction: windDirection,
                Orientation: windOrientation || templateData.Wind.Orientation,
                MPH: getWindMPH(windGusts),
                Surface: getSurface(windGusts),
                WaterTemp: waterTemp,
                AirTemp: airTemp
            },
            Conditions: {
                Conditions: getConditionFromStars()
            },
            Comments: {
                notes: (sessionDraftNotes === null || String(sessionDraftNotes).trim() === '')
                    ? templateData.Comments.notes
                    : String(sessionDraftNotes)
            },
            SessionTime: {
                startTime: startTimeStr,
                endTime: endTimeStr,
                startDate,
                endDate,
                accumulatedTime
            }
        };
    };

    const getSelectedLogId = () => {
        if (isNewSessionRoute()) {
            return null;
        }

        const storedLogId = initializeData('logId', null);
        if (validate(storedLogId) !== null && storedLogId !== '') {
            return String(storedLogId);
        }
        if (validate(logId) !== null && logId !== '') {
            return String(logId);
        }
        return null;
    };

    const ensureCommentsAndConditions = (log) => {
        return {
            ...log,
            Conditions: log?.Conditions || { Conditions: 'Good' },
            Comments: log?.Comments || { notes: '' }
        };
    };



    const getSelectedLogData = (selectedId) => {
        if (!selectedId) {
            return null;
        }
        const loadedLog = initializeData(selectedId, null);
        if (loadedLog && typeof loadedLog === 'object') {
            // Normalize SessionTime fields
            if (loadedLog.SessionTime) {
                loadedLog.SessionTime = normalizeSessionTime(loadedLog.SessionTime);
            }
            return ensureCommentsAndConditions(loadedLog);
        }
        return loadedLog;
    };

    // eslint-disable-next-line
    const initLogId = () => {
        const selectedId = getSelectedLogId();
        return (selectedId) ? selectedId : generateNewLogId();
    };
    const initLog = () => {
        const selectedId = getSelectedLogId();
        const selectedLog = getSelectedLogData(selectedId);
        const resultLog = (selectedId && selectedLog) ? selectedLog : buildNewSessionLog();
        return ensureCommentsAndConditions(resultLog);
    };

    // Helper to normalize time to 'HH:mm' string
    const normalizeTimeString = (val) => {
        if (!val) return '';
        if (typeof val === 'string' && /^\d{2}:\d{2}$/.test(val)) return val;
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return '';
    };

    // Wrap initLog to always normalize SessionTime fields
    const robustInitLog = () => {
        const log = initLog();
        if (log && log.SessionTime) {
            log.SessionTime = {
                ...log.SessionTime,
                startTime: normalizeTimeString(log.SessionTime.startTime),
                endTime: normalizeTimeString(log.SessionTime.endTime)
            };
        }
        return log;
    };

    const [status, setStatus] = useState(() => ({
        logID: initLogId(),
        log: robustInitLog(),
        isLoaded: false,
        items: []
    }));

    useEffect(() => {
        const selectedLogId = getSelectedLogId();

        const normalizeSessionTimes = (log) => {
            if (log && log.SessionTime) {
                log.SessionTime = {
                    ...log.SessionTime,
                    startTime: normalizeTimeString(log.SessionTime.startTime),
                    endTime: normalizeTimeString(log.SessionTime.endTime)
                };
            }
            return log;
        };

        if (selectedLogId === null) {
            const newLog = normalizeSessionTimes(buildNewSessionLog());
            setStatus(prevState => ({
                ...prevState,
                log: newLog,
                logID:generateNewLogId(),
                items: interfaceData,
                isLoaded: true
            }));
        } else {
            const localLog = normalizeSessionTimes(getSelectedLogData(selectedLogId));
            setStatus(prevState => ({
                ...prevState,
                log: localLog || templateData,
                logID: selectedLogId,
                items: interfaceData,
                isLoaded: true
            }));
        }
    }, [location?.search, logId]);

    const updateLog = (groupTitle, label, selected, set) => {
        if (validate(groupTitle) !== null && groupTitle !== 1 && validate(selected) !== null && set) {
            setStatus((prevState) => {
                const currentLog = prevState.log || templateData;
                const nextLog = {
                    ...currentLog,
                    [groupTitle]: {
                        ...(currentLog[groupTitle] || {}),
                        [label]: selected
                    }
                };

                return {
                    ...prevState,
                    log: nextLog
                };
            });
        }
    };

    const getStateLog = () => {
        const statusLog = status.log;
        return (statusLog && statusLog.Day) ? statusLog : templateData;
    };
          

    let appInterface = <div className='App-content pb-400 sizeMobile fadeIn'>
        <div className='flex3Column'></div>
        <div className='flex3Column'>
            <Loader />
        </div>
        <div className='flex3Column'></div>
    </div>;

        // Session period options
        const sessionPeriods = [
            { key: 'dawn', label: 'Dawn', icon: '🌅' },
            { key: 'morning', label: 'Morning', icon: '☀️' },
            { key: 'noon', label: 'Noon', icon: '🌞' },
            { key: 'afternoon', label: 'Afternoon', icon: '🏄' },
            { key: 'evening', label: 'Evening', icon: '🌇' }
        ];
        const getToday = () => formatDate(new Date());
        const getPeriodLabel = (key) => {
            const found = sessionPeriods.find(p => p.key === key);
            return found ? `${found.icon} ${found.label}` : '';
        };
        const getPeriodFromHour = (date) => {
            if (!date) return '';
            const hour = date.getHours();
            if (hour < 7) return 'dawn';
            if (hour < 11) return 'morning';
            if (hour < 14) return 'noon';
            if (hour < 18) return 'afternoon';
            return 'evening';
        };







        // --- Session Time State ---
        const handleStartDateChange = (e) => {
            const dateVal = e.target.value;
            setStatus((prevState) => {
                const currentLog = prevState.log || templateData;
                const st = normalizeSessionTime(currentLog.SessionTime);
                const startTime = normalizeTimeString(st.startTime || '06:00');
                const endTime = normalizeTimeString(st.endTime || '08:00');
                // If endTime is before startTime, auto-advance endTime by 1 hour
                let acc = getAccumulatedMinutes(dateVal, startTime, dateVal, endTime);
                let fixedEnd = endTime;
                if (acc <= 0) {
                    // auto-advance endTime
                    const startDateObj = combineDateAndTime(dateVal, startTime);
                    if (startDateObj) {
                        const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000);
                        fixedEnd = formatTime(endDateObj);
                        acc = 60;
                    }
                }
                const sessionTime = {
                    ...st,
                    startDate: dateVal,
                    startTime: normalizeTimeString(startTime),
                    endTime: normalizeTimeString(fixedEnd),
                    accumulatedTime: acc
                };
                return {
                    ...prevState,
                    log: {
                        ...currentLog,
                        SessionTime: sessionTime
                    }
                };
            });
        };
        const handleStartTimeChange = (e) => {
            const timeVal = e.target.value;
            setStatus((prevState) => {
                const currentLog = prevState.log || templateData;
                const st = normalizeSessionTime(currentLog.SessionTime);
                const dateVal = st.startDate || getToday();
                const endTime = normalizeTimeString(st.endTime || '08:00');
                let acc = getAccumulatedMinutes(dateVal, timeVal, dateVal, endTime);
                let fixedEnd = endTime;
                if (acc <= 0) {
                    // auto-advance endTime
                    const startDateObj = combineDateAndTime(dateVal, timeVal);
                    if (startDateObj) {
                        const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000);
                        fixedEnd = formatTime(endDateObj);
                        acc = 60;
                    }
                }
                // Only auto-set period if not already set by user
                let period = st.period;
                if (!period || period === '') {
                    const autoPeriodDate = combineDateAndTime(dateVal, timeVal);
                    if (autoPeriodDate) {
                        period = getPeriodFromHour(autoPeriodDate);
                    }
                }
                const sessionTime = {
                    ...st,
                    startTime: normalizeTimeString(timeVal),
                    endTime: normalizeTimeString(fixedEnd),
                    accumulatedTime: acc,
                    period
                };
                return {
                    ...prevState,
                    log: {
                        ...currentLog,
                        SessionTime: sessionTime
                    }
                };
            });
        };
    const handleEndDateChange = (e) => {
        // Removed endDate logic
        return;
    };
        const handleEndTimeChange = (e) => {
            const timeVal = e.target.value;
            setStatus((prevState) => {
                const currentLog = prevState.log || templateData;
                const st = normalizeSessionTime(currentLog.SessionTime);
                const dateVal = st.startDate || getToday();
                const startTime = normalizeTimeString(st.startTime || '06:00');
                let acc = getAccumulatedMinutes(dateVal, startTime, dateVal, timeVal);
                let fixedStart = startTime;
                if (acc <= 0) {
                    // auto-move startTime to 1 hour before endTime
                    const endDateObj = combineDateAndTime(dateVal, timeVal);
                    if (endDateObj) {
                        const startDateObj = new Date(endDateObj.getTime() - 60 * 60 * 1000);
                        fixedStart = formatTime(startDateObj);
                        acc = 60;
                    }
                }
                const sessionTime = {
                    ...st,
                    startTime: normalizeTimeString(fixedStart),
                    endTime: normalizeTimeString(timeVal),
                    accumulatedTime: acc
                };
                return {
                    ...prevState,
                    log: {
                        ...currentLog,
                        SessionTime: sessionTime
                    }
                };
            });
        };
    const handlePeriodChange = (e) => {
        const period = e.target.value;
        setStatus((prevState) => {
            const currentLog = prevState.log || templateData;
            const sessionTime = {
                ...currentLog.SessionTime,
                period
            };
            return {
                ...prevState,
                log: {
                    ...currentLog,
                    SessionTime: sessionTime
                }
            };
        });
    };
    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const formatDuration = (minutes) => {
        if (!minutes || isNaN(minutes)) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

        if (status.isLoaded) {
            const sessionTime = normalizeSessionTime(status.log?.SessionTime);
            // Always show time fields as HH:mm strings
            const startTimeValue = (typeof sessionTime.startTime === 'string' && sessionTime.startTime.match(/^\d{2}:\d{2}$/))
                ? sessionTime.startTime
                : formatTime(sessionTime.startTime);
            const endTimeValue = (typeof sessionTime.endTime === 'string' && sessionTime.endTime.match(/^\d{2}:\d{2}$/))
                ? sessionTime.endTime
                : formatTime(sessionTime.endTime);
            appInterface = <div className='fadeIn mt--40 mb-20 pt-10 pb-20'>
                <div className='containerDetail color-lite bg-blue m-5 p-22 size30'>
                    <span className='mt-5 mr-5'>
                        {icons.session}
                    </span>
                    Session
                </div>
                <div className='containerDetail bg-lite color-yellow p-10 m-5 mb-10'>
                     <div className='containerDetail mb-5 size20 color-yellow flexContainer'>
                        <label className='mr-10 flex2Column contentRight p-5'>
                            Start Date:
                        </label>
                        <input 
                            className='containerDetail color-lite flex2Column'
                            type='date' 
                            value={sessionTime.startDate || getToday()} 
                            onChange={handleStartDateChange} 
                        />
                    </div>
                     <div className='containerDetail mb-5 size20 color-yellow flexContainer'>
                        <label className='mr-10 flex2Column contentRight p-5'>
                            Time:
                        </label>
                        <input 
                            className='containerDetail color-lite flex2Column'
                            type='time' 
                            value={startTimeValue || '06:00'} 
                            onChange={handleStartTimeChange} 
                        />
                    </div>
                     <div className='containerDetail mb-5 size20 color-yellow flexContainer'>
                        <label className='mr-10 flex2Column contentRight p-5'>
                            End Time:
                        </label>
                        <input 
                            className='containerDetail color-lite flex2Column'
                            type='time' 
                            value={endTimeValue || '08:00'} 
                            onChange={handleEndTimeChange} 
                        />
                    </div>
                     <div className='containerDetail mb-5 size20 color-yellow flexContainer'>
                        <label className='mr-10 flex2Column contentRight pt-15'>
                            Session Period:
                        </label>
                        <select value={sessionTime.period || ''} onChange={handlePeriodChange} className='containerDetail color-lite flex2Column'>
                            <option value='' disabled>Select period</option>
                            {sessionPeriods.map(p => (
                                <option key={p.key} value={p.key}>{p.icon} {p.label}</option>
                            ))}
                        </select>
                    </div>
                     <div className='containerDetail mb-5 size20 color-yellow flexContainer'>
                        <label className='mr-5 flex2Column contentRight p-5 pt-10 mt-5'>
                            Accumulated Time:
                        </label>
                        <span className='containerDetail color-lite flex2Column p-10'>
                            {sessionTime.accumulatedTime > 0 ? `${Math.floor(sessionTime.accumulatedTime / 60)}h ${sessionTime.accumulatedTime % 60}m` : '0m'}
                        </span>
                    </div>
                </div>
                <LogEntry
                    logId={status.logID}
                    onChange={updateLog}
                    getStateLog={getStateLog}
                    title='Session Log'
                    message='Add your session data'
                    items={status.items}
                />
            </div>;
        }
        if (status.log) {
            return appInterface;
        }
        return null;
}

export default Session;