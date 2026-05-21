import React, { useState, useEffect, useRef } from 'react';
import RadioSelector from '../forms/FormRadio';
import DatePicker from 'react-date-picker';
import PostDirectory from './PostDirectory';
import { BrowserRouter as Route } from 'react-router-dom';
import Selector from './Selector';
import group from './Group';
import generateNewLogId from './GenerateLogId';
import getDirection from './getDirection';
import getWindOrientation from './GetWindOrientation';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';
import {
    normalizeSessionTime,
    formatTime
} from '../utils/sessionTimeUtils';

const LogEntry = ({ logId, onChange, getStateLog, title, message, items }) => {

    const [
        postDirectory,
        setPostDirectory,
        ,
        getLastIndex,
        ,
        addPost,
    ] = PostDirectory();

    const logExists = () => postDirectory.includes(String(logId));

    const withResolvedDay = (logValue, fallbackDate = new Date(), forceDate = false) => {
        const nextLog = {
            ...logValue,
            Day: {
                ...(logValue?.Day || {})
            }
        };

        const parsedExistingDate = nextLog.Day?.Date ? new Date(nextLog.Day.Date) : null;
        const resolvedDate = forceDate
            ? fallbackDate
            : (parsedExistingDate instanceof Date && !Number.isNaN(parsedExistingDate.getTime())
                ? parsedExistingDate
                : fallbackDate);

        if (forceDate || !nextLog.Day?.Date) {
            nextLog.Day.Date = resolvedDate;
        }
        if (forceDate || nextLog.Day?.Day === '' || nextLog.Day?.Day === undefined || nextLog.Day?.Day === null) {
            nextLog.Day.Day = resolvedDate.getDate();
        }
        if (forceDate || nextLog.Day?.Month === '' || nextLog.Day?.Month === undefined || nextLog.Day?.Month === null) {
            nextLog.Day.Month = resolvedDate.getMonth() + 1;
        }
        if (forceDate || nextLog.Day?.Year === '' || nextLog.Day?.Year === undefined || nextLog.Day?.Year === null) {
            nextLog.Day.Year = resolvedDate.getFullYear();
        }

        return nextLog;
    };

    const normalizeSwellValue = (value) => {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    };

    const normalizeAngle = (value) => {
        const raw = normalizeSwellValue(value);
        if (!raw) return '';
        const match = raw.match(/-?\d+/);
        return match ? match[0] : raw;
    };

    // Always store interval as number, display as 'N seconds' in UI only
    const normalizeInterval = (value) => {
        const raw = normalizeSwellValue(value);
        if (!raw) return '';
        const match = raw.match(/-?\d+/);
        return match ? Number(match[0]) : '';
    };

    const getIntervalSeconds = (value) => {
        const match = normalizeSwellValue(value).match(/-?\d+/);
        return match ? Number(match[0]) : 0;
    };

    const withOrderedPrimarySwells = (logValue) => {
        if (!logValue?.Swell1 || !logValue?.Swell2) {
            return logValue;
        }

        const swell1Interval = getIntervalSeconds(logValue.Swell1.Interval);
        const swell2Interval = getIntervalSeconds(logValue.Swell2.Interval);

        if (swell2Interval <= swell1Interval) {
            return logValue;
        }

        return {
            ...logValue,
            Swell1: { ...logValue.Swell2 },
            Swell2: { ...logValue.Swell1 },
            Surf: {
                ...(logValue.Surf || {}),
                Report: logValue.Swell2.Height,
                Height: getWaveHeight(logValue.Swell2.Height)
            }
        };
    };

    const withNormalizedSwellFields = (logValue) => {
        const nextLog = { ...logValue };
        const swellKeys = ['Swell1', 'Swell2', 'Swell3'];

        swellKeys.forEach((key) => {
            if (!nextLog[key] || typeof nextLog[key] !== 'object') {
                return;
            }
            nextLog[key] = {
                ...nextLog[key],
                Angle: normalizeAngle(nextLog[key].Angle),
                Interval: normalizeInterval(nextLog[key].Interval)
            };
        });

        const orderedLog = withOrderedPrimarySwells(nextLog);

        return {
            ...orderedLog,
            Conditions: logValue.Conditions || { Conditions: 'Good' },
            Comments: logValue.Comments || { notes: '' }
        };
    };
    
    const ensureCommentsAndConditions = (log) => {
        return {
            ...log,
            Conditions: log?.Conditions || { Conditions: 'Good' },
            Comments: log?.Comments || { notes: '' }
        };
    };
    
    const [status, setStatus] = useState(() => ({
        logId: logId,
        date: new Date(),
        log: ensureCommentsAndConditions(withResolvedDay(getStateLog(), new Date(), !logExists())),
        change: false,
        spot: initializeData('spot', "Ninja's")
    }));
    const latestLogRef = useRef(status.log);

    useEffect(() => {
        latestLogRef.current = status.log;
    }, [status.log]);

    useEffect(() => {
        setStatus((prevState) => {
            const nextLog = withResolvedDay(prevState.log, prevState.date || new Date(), !logExists());
            const protectedLog = ensureCommentsAndConditions(nextLog);
            latestLogRef.current = protectedLog;
            if (JSON.stringify(nextLog.Day) === JSON.stringify(prevState.log?.Day)) {
                return prevState;
            }
            return {
                ...prevState,
                log: protectedLog
            };
        });
    }, []);

    const handleSelection = (groupTitle, label, selected) => {
        if (typeof groupTitle === 'string') {
            const currentLog = latestLogRef.current || status.log || {};
            const getAngleFromDirectionLabel = (directionLabel, fallback = '') => {
                if (!directionLabel) {
                    return fallback;
                }

                for (let angle = 0; angle <= 355; angle += 5) {
                    if (getDirection(angle) === directionLabel) {
                        return String(angle);
                    }
                }

                return fallback;
            };
            const nextGroup = {
                ...(currentLog[groupTitle] || {}),
                [label]: selected
            };
            // When users manually choose a direction, keep angle in sync for the same group.
            if (label === 'Direction' && Object.prototype.hasOwnProperty.call(nextGroup, 'Angle')) {
                nextGroup.Angle = getAngleFromDirectionLabel(selected, nextGroup.Angle);
            }
            // When users manually choose wind direction, keep orientation in sync.
            if (groupTitle === 'Wind' && label === 'Direction') {
                nextGroup.Orientation = getWindOrientation(selected) || nextGroup.Orientation;
            }
            const nextLog = {
                ...currentLog,
                [groupTitle]: nextGroup
            };
            latestLogRef.current = nextLog;
            
            setStatus(prevState => ({
                ...prevState,
                log: nextLog,
                change: true
            }));
            onChange(groupTitle, label, selected, true);
        }
    };

    // Helper to format session details for comments
    const getSessionDetailsComment = (log) => {
        // Use robust session time normalization and formatting
        const sessionTime = normalizeSessionTime(log?.SessionTime);
        const startStr = sessionTime.startTime;
        const endStr = sessionTime.endTime;
        // Session category (period)
        let period = log?.SessionTime?.period || '';
        if (!period && startStr) {
            const [hour] = startStr.split(':').map(Number);
            if (hour < 7) period = 'Dawn';
            else if (hour < 11) period = 'Morning';
            else if (hour < 14) period = 'Noon';
            else if (hour < 18) period = 'Afternoon';
            else period = 'Evening';
        }
        // Swell interval/angle
        const swell1 = log?.Swell1 || {};
        const swell2 = log?.Swell2 || {};
        const swellDetails = [];
        if (swell1.Interval) swellDetails.push(`Swell1: ${swell1.Interval} sec @ ${swell1.Angle}°`);
        if (swell2.Interval) swellDetails.push(`Swell2: ${swell2.Interval} sec @ ${swell2.Angle}°`);
        // Compose details
        let details = '';
        if (startStr && endStr) details += `Session: ${startStr} - ${endStr}`;
        if (period) details += (details ? ' | ' : '') + `Period: ${period}`;
        if (swellDetails.length) details += (details ? ' | ' : '') + swellDetails.join(' | ');
        return details;
    };

    const updateNotes = (event) => {
        const noteValue = event.target.value;
        localStorage.setItem('sessionDraftNotes', noteValue);
        // Only update user notes, not auto-generate details here
        handleSelection('Comments', 'notes', noteValue);
    };

    // Generate a single conversational summary comment
    // Helper to format duration in h m
    const formatDuration = (minutes) => {
        if (!minutes || isNaN(minutes)) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const generateFinalComment = () => {
        const log = latestLogRef.current || status.log || {};
        // Date
        let dateObj = log.Day && log.Day.Date ? new Date(log.Day.Date) : null;
        let dateStr = dateObj ? dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
        // Session time (robust normalization)
        const sessionTime = normalizeSessionTime(log.SessionTime);
        let startStr = sessionTime.startTime;
        let endStr = sessionTime.endTime;
        let duration = sessionTime.accumulatedTime ? formatDuration(sessionTime.accumulatedTime) : '';
        // Location
        let location = log.Location && log.Location.Break ? log.Location.Break : '';
        // Surf
        let height = log.Surf && log.Surf.Height ? log.Surf.Height : '';
        let shape = log.Surf && log.Surf.Shape ? log.Surf.Shape : '';
        // Swell1
        let swell1 = log.Swell1 || {};
        let swell1Height = swell1.Height || '';
        let swell1Dir = swell1.Direction || '';
        let swell1Angle = swell1.Angle || '';
        let swell1Interval = swell1.Interval ? `${swell1.Interval}` : '';
        // Swell2 (optional)
        let swell2 = log.Swell2 || {};
        let swell2Height = swell2.Height || '';
        let swell2Dir = swell2.Direction || '';
        let swell2Angle = swell2.Angle || '';
        let swell2Interval = swell2.Interval ? `${swell2.Interval}` : '';
        // Tide
        let tide = log.Tide || {};
        let tideHeight = tide.Height || '';
        let tidePhase = tide.Phase || '';
        // Wind
        let wind = log.Wind || {};
        let windDir = wind.Direction || '';
        let windOrientation = wind.Orientation || '';
        let windMPH = wind.MPH || '';
        let windSurface = wind.Surface || '';
        let waterTemp = wind.WaterTemp || '';
        let airTemp = wind.AirTemp || '';
        // Conditions
        let conditions = log.Conditions && log.Conditions.Conditions ? log.Conditions.Conditions : '';
        //alert(conditions);
        // Compose conversational summary
        let summary = `On ${dateStr}`;
        // Always show session time details
        if (startStr) summary += ` | Start: ${startStr}`;
        if (endStr) summary += ` | End: ${endStr}`;
        if (duration) summary += ` | Duration: ${duration}`;
        if (location) summary += `, ${location}`;
        summary += ' was';
        if (height) summary += ` ${height}`;
        // Add shape and swell1Dir in surf description
        if (shape && swell1Dir) {
            summary += ` ${shape} `;
        }
        if (swell1Height || swell1Dir || swell1Angle || swell1Interval) {
            summary += ' with';
            if (swell1Height) summary += ` ${swell1Height}`;
            if (swell1Dir) summary += ` swell out of the ${swell1Dir}`;
            if (swell1Angle) summary += ` at ${swell1Angle}°`;
            if (swell1Interval) summary += ` and a ${swell1Interval} second interval`;
        }
        if (swell2Height || swell2Dir || swell2Angle || swell2Interval) {
            summary += ', plus secondary swell';
            if (swell2Height) summary += ` ${swell2Height}`;
            if (swell2Dir) summary += ` out of the ${swell2Dir}`;
            if (swell2Angle) summary += ` at ${swell2Angle}°`;
            if (swell2Interval) summary += ` and a ${swell2Interval} second interval`;
        }
        if (tideHeight || tidePhase) summary += `, on a ${tideHeight}${tidePhase ? ' ' + tidePhase.toLowerCase() : ''} tide`;
        if (windOrientation || windMPH || windDir) {
            summary += '. The wind was';
            if (windOrientation) summary += ` ${windOrientation}`;
            if (windMPH) summary += ` at ${windMPH}`;
            if (windDir) summary += ` out of the ${windDir}`;
        }
        if (windSurface) summary += ` and surface conditions were ${windSurface.toLowerCase()}`;
        if (waterTemp) summary += `. Water temp was ${waterTemp}°`;
        if (airTemp) summary += `. Air temp was ${airTemp}°`;
        if (conditions) summary += `. Overall the surf was ${conditions.toLowerCase()}`;
        summary += '.';

        handleSelection('Comments', 'notes', summary);
    };

    const buildSubmissionSummary = (logValue, recordId, actionLabel) => {
        const summary = {
            action: actionLabel,
            recordId,
            day: logValue?.Day,
            location: logValue?.Location?.Break,
            conditions: logValue?.Conditions?.Conditions,
            comments: logValue?.Comments?.notes,
            surfReport: logValue?.Surf?.Report,
            wind: logValue?.Wind,
            tide: logValue?.Tide
        };

        return `Confirm ${actionLabel}?\n\n${JSON.stringify(summary, null, 2)}`;
    };

    const previewRecordId = () => {
        const date = new Date();
        const st = date.toDateString().replace(/ /g, '');
        const nd = date.toLocaleTimeString().replace(/ /g, '');
        return `${st}${nd}`;
    };

    const handleSubmit = () => {
        const baseLog = latestLogRef.current || status.log;
        const dayResolvedLog = withResolvedDay(baseLog, new Date(), true);
        const normalizedLog = withNormalizedSwellFields(dayResolvedLog);
        const protectedLog = ensureCommentsAndConditions(normalizedLog);

        const submitMessage = buildSubmissionSummary(protectedLog, previewRecordId(), 'submit');
        //const shouldContinue = window.confirm(submitMessage);
        const shouldContinue = true; // Bypass confirmation for now to streamline testing
        if (!shouldContinue) {
            return;
        }

        const recordId = generateNewLogId();
        
        const newPost = JSON.stringify(protectedLog);
        localStorage.setItem(recordId, newPost);
        const newPostDirectory = [...postDirectory, recordId];
        localStorage.setItem('postDirectory', JSON.stringify(newPostDirectory));
        localStorage.setItem('lastPostId', recordId);
        localStorage.removeItem('sessionDraftNotes');
        setPostDirectory(newPostDirectory);
        window.location.href = '/reactor/Sessions';
    };

    const handleSave = () => {
        const baseLog = latestLogRef.current || status.log;
        const dayResolvedLog = withResolvedDay(baseLog, new Date(), false);
        const normalizedLog = withNormalizedSwellFields(dayResolvedLog);
        const protectedLog = ensureCommentsAndConditions(normalizedLog);

        const saveMessage = buildSubmissionSummary(protectedLog, String(logId), 'save');
        //const shouldContinue = window.confirm(saveMessage);
        const shouldContinue = true; // Bypass confirmation for now to streamline testing
        if (!shouldContinue) {
            return;
        }
        
        addPost(logId, protectedLog);
        localStorage.removeItem('sessionDraftNotes');
        window.location.href = '/reactor/Sessions';
    };

    const handleDelete = () => {
        const id = logId;
        const newPostDirectory = [...postDirectory];
        const index = newPostDirectory.indexOf(String(id));
        newPostDirectory.splice(index, 1);
        localStorage.removeItem(id);
        localStorage.setItem('lastPostId', `${newPostDirectory[getLastIndex()]}`);
        setPostDirectory(newPostDirectory);
        window.location.href = '/reactor/Sessions';
    };

    const handleCancel = () => {
        localStorage.removeItem('sessionDraftNotes');
        window.location.href = '/reactor/Sessions';
    };

    const onDateChange = (date) => {
        if (!date || typeof date.getDate !== 'function') {
            // Ignore invalid/null dates
            return;
        }
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        handleSelection('Day', 'Date', date);
        handleSelection('Day', 'Day', day);
        handleSelection('Day', 'Month', month);
        handleSelection('Day', 'Year', year);
    };



    const getTide = (height) => {
        const tide = Number(height.replace('ft', '')).toFixed(0) + 'ft';
        return tide;
    };

    const defaultSelection = (item, groupTitle) => {
        let selected = status.log[groupTitle][item.description];
        // For interval selectors, always return number value
        if (item.description === 'Interval' && (groupTitle === 'Swell1' || groupTitle === 'Swell2' || groupTitle === 'Swell3')) {
            if (selected !== undefined && selected !== null && selected !== '') {
                const match = String(selected).match(/-?\d+/);
                selected = match ? Number(match[0]) : '';
            }
        }
        if ((item.description === 'Height' && (groupTitle === 'Swell1' || groupTitle === 'Swell2')) || (item.description === 'Report' && groupTitle === 'Surf')) {
            selected = getWaveHeight(selected);
        }
        if (item.description === 'Phase' && groupTitle === 'Tide') {
            if (selected === 'high' || selected === 'medium' || selected === 'low') {
            } else if (selected > 3) {
                selected = 'high';
            } else if (selected > 2) {
                selected = 'medium';
            } else {
                selected = 'low';
            }
        }
        if (item.description === 'Height' && groupTitle === 'Tide') {
            if (selected === 'NaNft') {
                selected = status.log[groupTitle]['Phase'];
            }
            selected = getTide(selected);
        }
        if (selected === ('High => Low' || 'Low => High')) {
            selected = 'medium';
        }
        return selected;
    };

    const radioItems = (item, groupTitle) => {
        return (
            <RadioSelector
                header={groupTitle}
                groupTitle={groupTitle}
                selected={defaultSelection(item, groupTitle)}
                label={item.description}
                items={item.selections}
                onChange={handleSelection}
            />
        );
    };

    const radio = (item, groupTitle) => {
        return (
            <div 
                className='containerDetail m-5 size20 color-yellow'
                key={`radio-${groupTitle}-${item.description}`}
            >
                {radioItems(item, groupTitle)}
            </div>
        );
    };

    const selectionInterface = (item, groupTitle, selected) => (item.type === 'radio') ? radio(item, groupTitle, selected) : Selector(item, groupTitle, status.spot, defaultSelection, handleSelection, selected);
    const groups = () => items.map((item) => {
        const headerClasses = 'containerDetail m-5 size20 color-yellow color-yellow p-20 contentLeft';
        const description = item.description;

        return <div key={`group-container-${description}`} className='containerDetail m-5 size20 color-yellow bg-lite'>
            <div className={headerClasses}>
                {description}
            </div>
            <div>
                {
                    (!status.log[description])
                    ? null
                    : item.group.map((group) => {
                            const selection = status.log[description][group.description];
                            return (
                                <React.Fragment key={`group-item-${description}-${group.description}`}>
                                    {selectionInterface(group, description, selection)}
                                </React.Fragment>
                            )
                        })
                }
            </div>
        </div>
    });

    const categories = () => {
        status.selectorStatus = [];
        return groups();
    };

    const dateEntry = () => {
        const stateLogDate = () => status.log.Day.Date;
        const getDate = () => (logExists() === true) ? new Date(stateLogDate()) : (status.date === '') ? logId : new Date(status.date);
        return <div className='containerDetail m-5 size20 color-yellow bg-lite'>
                    <div className='containerDetail m-5 size20 color-yellow bold color-yellow p-20 contentLeft'>
                        Date
                    </div>
                    <DatePicker
                        onChange={onDateChange}
                        value={getDate()}
                        className='containerDetail m-5 size20 color-yellow width--10 bg-yellow color-dark p-20'
                    />
                </div>
    };

    return (
        (!status.log.Comments)
            ? null
            : <Route>
                <form>
                    {dateEntry()}
                    {categories()}
                    <div className='containerDetail m-5 size20 color-yellow bg-lite'>
                        <div className='containerDetail m-5 size20 color-yellow color-yellow bold'>Additional Comments: </div>
                        <div className='containerDetail m-5 size20 color-yellow'>
                            <textarea
                                rows='10'
                                cols={window.innerWidth / 15}
                                value={status.log.Comments.notes || ''}
                                onChange={updateNotes}
                                className='mt-10 greet p-10 r-10 brdr-green'
                            />
                            <button
                                type='button'
                                className='mt-10 ml-10 p-10 brdr-green color-dark bg-yellow bold'
                                onClick={generateFinalComment}
                            >
                                Generate Comment
                            </button>
                        </div>
                    </div>
                    <div className='containerDetail m-5 size20 color-yellow color-yellow bold bg-tintedMedium'>
                        <p>Count: {postDirectory.length}</p> 
                    </div>
                    <div className='containerDetail m-5 size20 color-yellow flexContainer bold'>
                        {
                            logExists()
                                ? <>
                                    <div
                                        onClick={handleSave}
                                        className='flex3Column button containerDetail m-5 size20 color-yellow bg-green brdr-green color-dark'
                                    >
                                        save
                                    </div>
                                    <div
                                        onClick={handleCancel}
                                        className='flex3Column button containerDetail m-5 size20 color-yellow bg-yellow brdr-yellow color-dark'
                                    >
                                        cancel
                                    </div>
                                    <div
                                        onClick={handleDelete}
                                        className='flex3Column button containerDetail m-5 size20 color-yellow bg-red brdr-red color-red'
                                    >
                                        delete
                                    </div>
                                </>
                                : <>
                                    <div
                                        onClick={handleSubmit}
                                        className='flex3Column button containerDetail m-5 size20 color-yellow bg-green brdr-green color-dark'
                                    >
                                        submit
                                    </div>
                                    <div
                                        onClick={handleCancel}
                                        className='flex3Column button containerDetail m-5 size20 color-yellow bg-yellow brdr-yellow color-dark'
                                    >
                                        cancel
                                    </div>
                                </>
                        }
                    </div>
                </form>
            </Route>
    );
};

export default LogEntry;
// --- Exported helper: getWaveHeight ---
export const getWaveHeight = (height) => {
    let newHeight = height;
    const heights = ['flat', 'knee high', 'waist high', 'chest high', 'shoulder high', 'head high', 'over head', 'foot over head', '2 feet over head', 'double over head', 'triple over head'];
    const size = ['1ft', '2ft', '3ft', '4ft', '5ft', '6ft', '7ft', '8ft', '9ft', '10ft'];
    const decimal = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0'];
    newHeight = (size.indexOf(height) < 0) ? height : size[heights.indexOf(height)];
    newHeight = (decimal.indexOf(height) < 0) ? height : size[decimal.indexOf(height)];
    return newHeight;
};