
import React, { useState, useEffect, useContext, useRef } from 'react';
import getKey from '../utils/KeyGenerator';
import WaveUtils from '../wavefinder/WaveUtils';
import { BrowserRouter as Link } from 'react-router-dom';
import GetMatchIcon from './GetMatchIcon';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import { date, day, month, year } from '../utils/CurrentCalendar';
import initializeData from '../utils/InitializeData';
//import FullWidthButton from '../utils/FullWidthButton';
import { WavesContext } from '../context/WavesContext';
import validate from '../utils/validate';

// Debounced state hook
function useDebouncedState(initialValue, delay = 300) {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);
    const handler = useRef();

    useEffect(() => {
        if (handler.current) clearTimeout(handler.current);
        handler.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler.current);
    }, [value, delay]);

    return [debouncedValue, setValue, value];
}

// Isolated timer component — re-renders only itself every second
function SessionTimer({ sessionStart, sessionEnd }) {
    const [timer, setTimer] = useState(0);
    useEffect(() => {
        if (!sessionStart || sessionEnd) return;
        const id = setInterval(() => {
            setTimer(Math.floor((Date.now() - sessionStart) / 1000));
        }, 1000);
        return () => clearInterval(id);
    }, [sessionStart, sessionEnd]);

    return (
        <span>{Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</span>
    );
}

const SurfLocation = ({
    state,
    item,
    matches,
    regionMatch,
    tideDisplay,
    locationCollapse,
    currentConditions
}) => {
    const { /*edit, */windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, stars } = state;
    // eslint-disable-next-line
    const [collapse, setCollapse] = useState(item.collapse);
    const {
        locations,
        edit,
        handleEditToggle,
        updateLocations
    } = useContext(WavesContext);

    const [status] = useState({
        module: 'SurfLocation',
        logged: false,
        edit: edit,
        windDirection: windDirection,
        windSpeed: windSpeed,
        windGusts: windGusts,
        swell1Direction: swell1Direction,
        swell2Direction: swell2Direction,
        swell1Angle: swell1Angle,
        swell2Angle: swell2Angle,
        swell1Height: swell1Height,
        swell2Height: swell2Height,
        swell1Interval: swell1Interval,
        swell2Interval: swell2Interval,
        tide: tide,
        height: swell1Height,
        stars: stars
    });

    useEffect(() => {
        const newLocations = [...locations];
        const index = newLocations.findIndex(location => location === item);
        newLocations[index].collapse = collapse;
        localStorage.setItem('locations', JSON.stringify(newLocations))
    }, [collapse, item, locations]);

    const style = {
        height: '50px'
    }

    const getCurrentWind = () => {
        return (
            <div className='white' style={style}>
                <div className='m-2 p-10'>
                    {windSpeed}MPH
                </div>
            </div>
        )
    }

    const getStarDetails = (kind) => {
        let details = '';
        // eslint-disable-next-line
        const { height, windSpeed, windGusts, swell1Height, swell1Angle, swell1Interval, swell2Height, swell2Angle, swell2Interval } = status;
        // eslint-disable-next-line
        const getWindSpeed = (((windSpeed * 1.15078) + (windGusts * 1.15078)) / 2).toFixed(0);
        details = (kind === 'tide')
            ? <div className='mr-15 ml-15'>
                {tideDisplay('star')}
            </div>
            : details;
        details = (kind === 'wind') ? getCurrentWind() : details;
        details = (kind === 'swell1')
            ? (<React.Fragment>
                <div className='bold white p-10'>{swell1Angle}°</div>
            </React.Fragment>)
            : details;
        details = (kind === 'swell2')
            ? (<React.Fragment>
                <div className='bold white p-10'>{swell2Angle}°</div>
            </React.Fragment>)
            : details;
        return details
    }
    const getState = (kind) => {
        const { swell1Direction, swell2Direction, tide, windDirection } = status;
        if (kind === 'swell1') {
            return swell1Direction;
        } else if (kind === 'swell2') {
            return swell2Direction;
        } else if (kind === 'tide') {
            return tide.toUpperCase();
        } else if (kind === 'wind') {
            return windDirection;
        }
    }
    const star = (matchKind) => {
        if (collapse) {
            return <GetMatchIcon kind={matchKind} status={status} collapse={collapse} />
        }
        return (<div>
            <div className={`containerDetail p-5 ht-150`}>
                <div className='mt-10'>
                    <GetMatchIcon kind={matchKind} status={status} colapse={collapse} />
                </div>
            </div>
            <div className='size20 color-yellow bold pt-10'>
                {
                    (matchKind === 'tide')
                    ? ''
                    : <div className='pb-5'>
                            {getState(matchKind)}
                        </div>
                }
                <div className='mt--10'>
                    {getStarDetails(matchKind)}
                </div>
            </div>
        </div>)
    }
    const getStars = (stars) => stars.map((currentStar, index) => {
        return <div key={getKey(star(currentStar))} className={`flex6Column p-5 ${(index === stars.length - 1) ? null : 'mr-5'} ${(collapse) ? null : ' mt-5 containerDetail'}`}>
                    {star(currentStar)}
                </div>
    });
    const waterLevel = Number(initializeData('height', 0));
    console.log(`SurfLocation => height: ${waterLevel}`);
    const getCurrentTide = (waterLevel > 3) ? 'high' : (waterLevel < 2) ? 'low' : 'medium';

    const windOrientation = () => {

        const swellDirection = String(state.swell1Direction).charAt(0).toLocaleUpperCase();
        const windDirection = String(state.windDirection).charAt(0).toLocaleUpperCase();

        if (swellDirection === windDirection) {
            return 'onshore';
        }
        if (swellDirection === 'N' && windDirection === 'S') {
            return 'offshore';
        } else if (swellDirection === 'S' && windDirection === 'N') {
            return 'offshore';
        } else if (swellDirection === 'E' && windDirection === 'W') {
            return 'offshore';
        } else if (swellDirection === 'W' && windDirection === 'E') {
            return 'offshore';
        }
        if (swellDirection === 'N' && windDirection === 'E') {
            return 'sideshore => lefts';
        } else if (swellDirection === 'S' && windDirection === 'W') {
            return 'sideshore => lefts';
        } else if (swellDirection === 'E' && windDirection === 'S') {
            return 'sideshore => lefts';
        } else if (swellDirection === 'W' && windDirection === 'N') {
            return 'sideshore => lefts';
        }
        if (swellDirection === 'N' && windDirection === 'W') {
            return 'sideshore => rights';
        } else if (swellDirection === 'S' && windDirection === 'E') {
            return 'sideshore => rights';
        } else if (swellDirection === 'E' && windDirection === 'N') {
            return 'sideshore => rights';
        } else if (swellDirection === 'W' && windDirection === 'S') {
            return 'sideshore => rights';
        }

    }
    const surfaceCondition = () => {

        const windSpeed = Number(String(initializeData('windSpeed', 0)).replace('mph', ''));

        if (windSpeed === 0) {
            return 'oily glass';
        } else if (windSpeed < 5) {
            return 'glassy';
        } else if (windSpeed < 12) {
            return 'textured';
        } else if (windSpeed < 18) {
            return 'choppy';
        }
        return 'victory at sea';
    }
    const getConditions = () => {

        const isSwellHeightGood = (Number(state.swell1Height) > 4) ? true : false;
        const isWindGood = (windOrientation() !== 'onshore') ? true : false;
        const isSurfaceGood = (surfaceCondition() === 'oily glass' || surfaceCondition() === 'glassy') ? true : false;

        if (isSwellHeightGood && isWindGood && isSurfaceGood) {
            return 'Firing';
        } else if (!isSwellHeightGood && !isWindGood && !isSurfaceGood) {
            return 'Bad';
        }
        return 'Good';

    }
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const directions = {
        'N': 'north',
        'NE': 'northeast',
        'ENE': 'east, northeast',
        'NNE': 'north, northeast',
        'NW': 'northwest',
        'NNW': 'north, northwest',
        'W': 'west',
        'WNW': 'west, northwest',
        'E': 'east',
        'ESE': 'east, southeast',
        'S': 'south',
        'SE': 'southeast',
        'SSE': 'south, southeast',
        'WSW': 'west, southwest',
        'SW': 'southwest',
        'SSW': 'south, southwest'
    }
    const waveHeights = [
        'flat',
        'knee high',
        'waist high',
        'chest high',
        'shoulder high',
        'head high',
        'over head',
        'foot over head',
        'couple of feet over head',
        'double over head',
        'triple over head'
    ];
    const waveHeight = () => state.swell1Height;
    const waveSize = () => {
        const height = Number(waveHeight().replace('ft', ''));
        if (height < 12) {
            return waveHeights[height - 1];
        }
        if (height < 1) {
            return waveHeights[0];
        }
        if (height > 10) {
            return waveHeights[10];
        }
        return waveHeights[0];
    }

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

    const getStoredWaterTemp = () => {
        const rawWaterTemp = initializeData('waterTemp', '');
        return normalizeTemperature(rawWaterTemp, '');
    };

    const getStoredAirTemp = () => {
        const rawAirTemp = initializeData('airTemp', '');
        return normalizeTemperature(rawAirTemp, '');
    };
    const notes = () => {
        const longMonth = () => months[month() - 1];
        const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th'];
        const waterTemp = getStoredWaterTemp();
        const airTemp = getStoredAirTemp();
        const waterTempStr = waterTemp ? ` Water temp was ${waterTemp}°. ` : '';
        const airTempStr = airTemp ? `Air temp was ${airTemp}°. ` : '';
        const note = `On ${longMonth()} ${day()}${suffix[Number(String(day()).slice(-1))]} ${year()}, ` +
            `${item.name} was ${waveSize()} with ${state.swell1Height}ft close-outs out of the ${directions[state.swell1Direction]}, ` +
            `on a ${initializeData('height', 0)}ft ${getCurrentTide} tide.` +
            `The wind was ${windOrientation()} at ${initializeData('windSpeed', '0mph')} out of the ${directions[state.windDirection]} ` +
            `and surface conditions were ${surfaceCondition()}.${waterTempStr}${airTempStr}Overall the surf was ${getConditions().toLocaleLowerCase()}.`;
        return note;
    }
    const logTemplateData = (name) => {
        return (
            {
                Day: {
                    Date: date(),
                    Day: day(),
                    Month: month(),
                    Year: year()
                },
                Location: {
                    Break: name
                },
                Surf: {
                    Height: waveSize(),
                    Report: `${Number(state.swell1Height).toFixed(0)}ft`,
                    Shape: 'close-outs'
                },
                Swell1: {
                    Height: `${Number(state.swell1Height).toFixed(0)}ft`,
                    Direction: state.swell1Direction,
                    Angle: state.swell1Angle,
                    Interval: state.swell1Interval,
                },
                Swell2: {
                    Height: `${Number(state.swell2Height).toFixed(0)}ft`,
                    Direction: state.swell2Direction,
                    Angle: state.swell2Angle,
                    Interval: state.swell2Interval,
                },
                Swell3: {
                    Height: `${Number(state.swell2Height).toFixed(0)}ft`,
                    Direction: state.swell2Direction,
                    Angle: state.swell2Angle,
                    Interval: state.swell2Interval,
                },
                Tide: {
                    Phase: getCurrentTide,
                    Height: `${waterLevel.toFixed(0)}ft`
                },
                Wind: {
                    Direction: state.windDirection,
                    Orientation: windOrientation(),
                    MPH: `${initializeData('windSpeed', 0)}`,
                    Surface: surfaceCondition(),
                    WaterTemp: getStoredWaterTemp(),
                    AirTemp: getStoredAirTemp()
                },
                Conditions: {
                    Conditions: getConditions()
                },
                Comments: {
                    'notes': notes()
                }
            }
        )
    };
    // Session Timer State
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionStart, setSessionStart] = useState(null);
    const [sessionEnd, setSessionEnd] = useState(null);
    const [shape, setShape, shapeInput] = useDebouncedState('');
    const [conditions, setConditions, conditionsInput] = useDebouncedState('');
    const [sessionData, setSessionData] = useState(null);
    const [notice, setNotice] = useState('');

    // Start session: show dashboard, start timer
    const startSession = (item) => {
        const localTideData = localStorage.getItem('tideData');
        const tideData = localTideData ? (JSON.parse(localTideData).data || []) : [];
        console.log(`SurfLocation => startSession => tideData: ${JSON.stringify(tideData, null, 2)}`);
        const lastIndex = tideData.length - 1;
        const lastEntry = tideData[lastIndex];
        const height = lastEntry ? lastEntry.v : 0;
        const localTide = Number(height).toFixed(1);
        const waterLevel = (validate(tideData) !== null && lastEntry) ? Number(lastEntry.v).toFixed(1) : localTide;
        const getCurrentTide = (waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium";
        console.log(`SurfLocation => startSession => height: ${waterLevel}, getCurrentTide: ${getCurrentTide}`);
        localStorage.setItem('height', waterLevel);
        setSessionData(logTemplateData(item.name));
        setSessionStart(Date.now());
        setSessionActive(true);
        setSessionEnd(null);
    };

    // End session: record end time
    const endSession = () => {
        setSessionEnd(Date.now());
    };

    // Submit session: combine all data and log
    const submitSession = () => {
        if (!sessionData) return;
        // Compose the session log in the same structure Session.js expects
        const sessionSummary = {
            ...sessionData,
            Surf: {
                ...sessionData.Surf,
                Shape: shape
            },
            // Store Conditions as an object for Session.js compatibility
            Conditions: { Conditions: conditions },
            SessionTime: {
                startTime: sessionStart ? new Date(sessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
                endTime: sessionEnd ? new Date(sessionEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
                accumulatedTime: Math.floor((sessionEnd - sessionStart) / 60 / 1000)
            }
        };

        // --- Logic from handleSubmit in LogEntryFunctional ---
        // Generate a new logId (recordId)
        const generateNewLogId = () => {
            const dateObj = new Date();
            const st = dateObj.toDateString().replace(/ /g, '');
            const nd = dateObj.toLocaleTimeString().replace(/ /g, '');
            return `${st}${nd}`;
        };
        const recordId = generateNewLogId();
        // Store the session log in localStorage
        localStorage.setItem(recordId, JSON.stringify(sessionSummary));
        // Update postDirectory in localStorage
        let postDirectory = [];
        try {
            postDirectory = JSON.parse(localStorage.getItem('postDirectory')) || [];
        } catch (e) {
            postDirectory = [];
        }
        const newPostDirectory = [...postDirectory, recordId];
        localStorage.setItem('postDirectory', JSON.stringify(newPostDirectory));
        localStorage.setItem('lastPostId', recordId);
        // Remove any session draft notes
        localStorage.removeItem('sessionDraftNotes');

        // Show a timed notice to the user that the session has been logged
        setNotice('Session has been logged!');
        setTimeout(() => {
            setNotice('');
            // Now reset state as before
            setSessionActive(false);
            setSessionStart(null);
            setSessionEnd(null);
            setShape('');
            setConditions('');
            setSessionData(null);
        }, 2000);
    };
    const toggleEditMode = () => {
        handleEditToggle();
    };

    const camButton = (item) => {
        if (!item.cam) {
            return null;
        }

        return <a
            className='noUnderline'
            href={item.cam}
            target='_blank'
            rel='noopener noreferrer'
        >
            <div className='App button bg-blue brdr-yellow color-white p-10 r-10 mt-10'>
                Cam
            </div>
        </a>;
    };

    const camHeaderButton = (item) => {
        if (!item.cam) {
            return null;
        }

        return <a
            className='noUnderline ml-10'
            href={item.cam}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(event) => event.stopPropagation()}
        >
            <span className='button pl-10 pr-10 pt-5 pb-5 r-10 size15'>
                👀
            </span>
        </a>;
    };

    const logLocationButton = (item) => {
        return <React.Fragment>
            {
                edit
                ? <div className='mb--10'>
                    <WaveUtils
                        item={item}
                        logLocation={startSession}
                        updateLocations={updateLocations}
                    >
                    </WaveUtils>
                </div>
                : <div className='App button bg-dkYellow brdr-yellow color-yellow p-10 r-10 mt-20' onClick={() => startSession(item)}>
                    Log Session
                </div>
            }
            <div className='App button bg-gray brdr-yellow color-white p-10 r-10 mt-10 size12' onClick={toggleEditMode}>
                {edit ? 'Exit ✏️ Edit Mode' : '✏️ Edit Mode'}
            </div>
        </React.Fragment>
    }
    // eslint-disable-next-line
    const editLogButton = () => {
        return (
            <Link className='noUnderline' key={getKey('link')} to={{
                pathname: '/Session?logId=ThuApr3020209:19:28PM',
                state: {
                    logId: status.recordId
                }
            }}>
                <div className='App button bg-yellow color-black p-10 r-10 mt-20'>
                    Edit Log
                </div>
            </Link>
        );
    }

    const statusClass = (status) => (status === true) ? 'color-yellow' : 'white';
    const subStatusClass = (status) => (status === true) ? 'color-orange' : 'white';
    const swell1Match = (item) => (item.swell.indexOf(swell1Direction) > -1) ? true : false;
    // eslint-disable-next-line
    const swell2Match = (item) => (item.swell.indexOf(swell2Direction) > -1) ? true : false;
    // eslint-disable-next-line
    const windMatch = (item) => (item.wind.indexOf(windDirection) > -1) ? true : false;
    // eslint-disable-next-line
    const tideMatch = (item) => (item.tide.indexOf(tide) > -1) ? true : false;
    const swell2DirectionMatch = (direction) => (direction === swell2Direction) ? true : false;
    const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
    const tideDirectionMatch = (direction) => (direction.tide === tide) ? true : false;
    const preferredClasses = 'white bold';
    const starIcons = (item, stars) => {
        const star = icons.star;
        const name = (stars > 2) ? (item.name) ? item.name.substring(0, 12) : '' : (item.name) ? item.name.substring(0, 15) : '';
        let starsDisplay = '';
        let count = 0;
        while (count < stars) {
            starsDisplay = `${starsDisplay}${star}`;
            count++
        }
        return `${name}${starsDisplay}`;
    }
    const getLocationDetails = <div>
                                    <div className='width-100-percent flexContainer'>
                                        {getStars(matches)}
                                    </div>
                                    <div className='containerDetail p-10 mt-5'>
                                        <div className='r-10 p-10 mb-5 bg-tinted'>
                                            <div className={preferredClasses}>
                                                <span className='bold color-yellow'>Swell: </span>{item.swell.map((swell, i) => <span key={getKey('swell')} className={`${(swell === status.swell1Direction) ? statusClass(swell1Match(item)) : subStatusClass(swell2DirectionMatch(swell))}`} onClick={() => edit && alert(edit)}>{swell}<span className='color-white'>{((i + 1) === item.swell.length) ? '' : ', '}</span></span>)}
                                            </div>
                                        </div>
                                        <div className='r-10 p-10 mb-5 bg-tinted'>
                                            <div className={preferredClasses}>
                                                <span className='bold color-yellow'>Wind: </span>
                                                {item.wind.map((wind, i) => <span key={getKey('wind')} className={statusClass(windDirectionMatch({ wind }))}>
                                                    {wind}
                                                    <span className='color-white'>{((i + 1) === item.wind.length) ? '' : ', '}</span>
                                                </span>)}
                                            </div>
                                        </div>
                                        <div className='r-10 p-10 mb-10 bg-tinted'>
                                            <div className={preferredClasses}>
                                                <span className='bold color-yellow'>Tide: </span>
                                                {item.tide.map((tide, i) => <span key={getKey('tide')} className={statusClass(tideDirectionMatch({ tide }))}>{tide}
                                                    <span className='color-white'>{((i + 1) === item.tide.length) ? '' : ', '}</span>
                                                </span>)}
                                            </div>
                                        </div>
                                        {
                                            //(status.logged) ? editLogButton() : logLocationButton(item)
                                            logLocationButton(item)
                                        }
                                    </div>
                                </div>
    const getLocationHeaderDetails = <div className='flexContainer centerVertical contentLeft'>
        <span>{icons.wave}{starIcons(item, matches.length)}</span>
        {camHeaderButton(item)}
    </div>;

    const getLocationContainer = <div className={`containerDetail mt-5 mb-5 ml-5 ${collapse ? null : 'pb-10'} bg-${(matches.length > 3) ? 'great' : (matches.length === 3) ? 'good' : (matches.length === 2) ? 'fair' : 'bad'}`}>
            <div className={`containerDetail color-yellow size25 bold`}>
                <CollapseToggleButton
                component={getLocationHeaderDetails}
                    isCollapsed={collapse}
                    setCollapse={setCollapse}
                    align='left'
                />
            </div>
            <div
            className='containerDetail bg-lite flexContainer columnLeftAlign color-white'
                onClick={() => window.location = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
            >
                {
                    (collapse)
                    ? <div className={`flexContainer button size25 mr-15`}>
                        {getStars(matches)}
                    </div>
                    : null
                }
            <div className={`flex1Column pr-10 contentRight ${(collapse) ? ' mt-15' : ' p-10'}`}>
                <span className={`button size20 mr-5 ml-2 ${(collapse) ? '' : 'ml--30'}`}>
                    {icons.globe}
                </span>
                <span className='size15'>{`${Number(regionMatch).toFixed(1)}`} miles</span>
            </div>
            </div>
            {
                (collapse)
                ? <div></div>
                : getLocationDetails
            }
        </div>

    // Update a nested field in sessionData (e.g. updateSessionField('Surf', 'Height', 'head high'))
    const updateSessionField = (section, field, value) => {
        setSessionData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Session Dashboard UI
    const renderSessionDashboard = () => {
        if (!sessionActive || !sessionData) return null;
        // Helper to safely render any value as a string
        const safeRender = (val) => {
            if (val == null) return '';
            if (typeof val === 'function') return safeRender(val());
            if (val instanceof Date) return val.toLocaleString();
            if (Array.isArray(val)) return val.map(safeRender).join(', ');
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val);
        };
        const startTimeStr = sessionStart ? new Date(sessionStart).toLocaleString() : '';
        const endTimeStr = sessionEnd ? new Date(sessionEnd).toLocaleString() : '';
        let tidePhase = sessionData.Tide.Phase;
        tidePhase = safeRender(tidePhase);
        return (
            <div className='containerDetail bg-lite size20 color-lite contentLeft m-5'>
                <div className='containerDetail bg-lite size30 color-yellow p-20'>
                    Session Dashboard
                </div>
                <div className='containerDetail p-20 size25 color-yellow mb-5'>
                    {safeRender(sessionData.Location.Break)}
                </div>
                <div className='containerDetail flexContainer color-yellow p-20 mb-5'>
                    <div className='flex2Column'>
                        {startTimeStr.split(',')[1]}
                    </div>
                    <div className='flexColumn'>
                        <SessionTimer sessionStart={sessionStart} sessionEnd={sessionEnd} />
                    </div>
                </div>
                <div className='containerDetail p-10 mb-5'>
                    {/* Surf Height Selector */}
                    <div className='containerDetail flexContainer mb-5'>
                         <div className='flexColumn p-10'>
                            {icons.surf}
                        </div>
                        <label className='flex2Column'>
                            <select 
                                className='containerDetail color-lite p-10 mt--1 width--5' 
                                value={safeRender(sessionData.Surf.Height)} 
                                onChange={e => updateSessionField('Surf', 'Height', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Surf').group.find(g => g.description === 'Height').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {/* Swell1 Selector */}
                    <div className='containerDetail flexContainer mb-5 noScroll'>
                        <div className='flexColumn p-10'>
                            {icons.swell}
                        </div>
                        <label className='flex2Column flexContainer mt--5 mb-5 mr-5'>
                            <select 
                                className='flex6Column containerDetail color-lite w-60'
                                value={safeRender(sessionData.Swell1.Height)} 
                                onChange={e => updateSessionField('Swell1', 'Height', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell1').group.find(g => g.description === 'Height').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                className='flex6Column containerDetail color-lite p-10 w-90'
                                value={safeRender(sessionData.Swell1.Direction)} 
                                onChange={e => updateSessionField('Swell1', 'Direction', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell1').group.find(g => g.description === 'Direction').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                className='flex6Column containerDetail color-lite p-10 w-90'
                                value={safeRender(sessionData.Swell1.Angle)} 
                                onChange={e => updateSessionField('Swell1', 'Angle', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell1').group.find(g => g.description === 'Angle').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                className='flex4Column w-50 containerDetail color-lite p-10'
                                value={safeRender(sessionData.Swell1.Interval)} 
                                onChange={e => updateSessionField('Swell1', 'Interval', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell1').group.find(g => g.description === 'Interval').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {/* Swell2 Selector */}
                    <div className='containerDetail flexContainer mb-5 noScroll'>
                        <div className='flexColumn p-10'>
                            {icons.swell}
                        </div>
                        <label className='flex2Column flexContainer mt--5 mb-5 mr-5'>
                            <select
                                className='flex6Column containerDetail color-lite w-60'
                                value={safeRender(sessionData.Swell2.Height)} 
                                onChange={e => updateSessionField('Swell2', 'Height', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell2').group.find(g => g.description === 'Height').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                className='flex6Column containerDetail color-lite p-10 w-90' 
                                value={safeRender(sessionData.Swell2.Direction)} 
                                onChange={e => updateSessionField('Swell2', 'Direction', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell2').group.find(g => g.description === 'Direction').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                className='flex6Column containerDetail color-lite p-10 w-90' 
                                value={safeRender(sessionData.Swell2.Angle)} 
                                onChange={e => updateSessionField('Swell2', 'Angle', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell2').group.find(g => g.description === 'Angle').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                className='flex4Column w-50 containerDetail color-lite p-10'
                                value={safeRender(sessionData.Swell2.Interval)} 
                                onChange={e => updateSessionField('Swell2', 'Interval', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Swell2').group.find(g => g.description === 'Interval').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {/* Tide Selector */}
                    <div className='containerDetail flexContainer mb-5'>
                        <div className='flexColumn p-10'>
                            {icons.tide}
                        </div>
                        <label className='flex2Column flexContainer mt--5 mb-5 mr-5'>
                            <select
                                className='flex2Column containerDetail color-lite' 
                                value={tidePhase} 
                                onChange={e => updateSessionField('Tide', 'Phase', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Tide').group.find(g => g.description === 'Phase').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select 
                                className='flex2Column containerDetail color-lite'
                                value={safeRender(sessionData.Tide.Height)} 
                                onChange={e => updateSessionField('Tide', 'Height', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Tide').group.find(g => g.description === 'Height').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {/* Wind Selector */}
                    <div className='containerDetail flexContainer mb-5'>
                        <div className='flexColumn p-10'>
                            {icons.wind}
                        </div>
                        <label className='flex2Column flexContainer mt--5 mb-5 mr-5'>
                            <select
                                className='flex4Column containerDetail color-lite w-40' 
                                value={safeRender(sessionData.Wind.Direction)} 
                                onChange={e => updateSessionField('Wind', 'Direction', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Wind').group.find(g => g.description === 'Direction').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select
                                className='flex3Column containerDetail color-lite w-100' 
                                value={safeRender(sessionData.Wind.Orientation)} 
                                onChange={e => updateSessionField('Wind', 'Orientation', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Wind').group.find(g => g.description === 'Orientation').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <select className='flex3Column containerDetail color-lite' 
                                value={safeRender(sessionData.Wind.MPH)} 
                                onChange={e => updateSessionField('Wind', 'MPH', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Wind').group.find(g => g.description === 'MPH').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    {/* Surface Selector */}
                    <div className='containerDetail flexContainer mb-5'>
                        <div className='flexColumn p-10'>
                            {icons.surface}
                        </div>
                        <label className='flex2Column'>
                            <select className='containerDetail color-lite mb-5 mt-5 width--5'
                                value={safeRender(sessionData.Wind.Surface)} 
                                onChange={e => updateSessionField('Wind', 'Surface', e.target.value)}
                            >
                                {require('./InterfaceData').default.find(d => d.description === 'Wind').group.find(g => g.description === 'Surface').selections.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className='containerDetail p-10 mb-5'>
                    <div className='color-yellow mr-5'>
                        Notes:
                    </div>
                    <div className='ht-50'>
                        {safeRender(sessionData.Comments.notes)}
                    </div>
                </div>
                {!sessionEnd && (
                    <div 
                        className='button bg-green color-yellow p-10 r-10 mt-10 width-100-percent contentCenter' 
                        onClick={endSession}
                    >
                        End Session
                    </div>
                )}
                {sessionEnd && (
                    <div className='mt-10'>
                        <div className='containerDetail p-10 mb-5'>
                            <div className='color-yellow mr-5'>
                                End Time:
                            </div>
                            {endTimeStr}
                        </div>
                        <div className='containerDetail p-10 mb-5'>
                            <div className='color-yellow mr-5'>
                                Total Duration:
                            </div>
                            {Math.floor((sessionEnd-sessionStart)/60000)}:{('0'+(Math.floor((sessionEnd-sessionStart)/1000)%60)).slice(-2)}
                        </div>
                        <div className='containerDetail p-10 mb-5'>
                            <div className='mb-10 color-yellow'>
                                <label>
                                    Shape:
                                    <select
                                        className='ml-10 containerDetail p-10 color-lite'
                                        value={shapeInput}
                                        onChange={e => setShape(e.target.value)}
                                    >
                                        {['', 'speedy runners', 'peaky', 'bowly', 'close-outs', 'barreling', 'skatepark', 'mush burgers', 'slopey', 'slabbing'].map(opt => (
                                            <option key={opt} value={opt}>{opt || 'Select shape'}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className='containerDetail p-10 mb-5'>
                            <div className='mb-10 color-yellow'>
                                <label>
                                    Conditions:
                                    <select
                                        className='ml-10 containerDetail p-10 color-lite'
                                        value={conditionsInput}
                                        onChange={e => setConditions(e.target.value)}
                                    >
                                        {['', 'Firing', 'Good', 'Bad'].map(opt => (
                                            <option key={opt} value={opt}>{opt || 'Select conditions'}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>
                        <div className='button bg-green color-yellow p-20 r-10 mt-10 size20 contentCenter' onClick={submitSession}>
                            Submit Session
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div 
            className={`scrollSnap`} 
        >
            {notice && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#222',
                    color: '#ffe066',
                    padding: '16px 32px',
                    borderRadius: 10,
                    zIndex: 9999,
                    fontSize: 22,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
                }}>
                    {notice}
                </div>
            )}
            {renderSessionDashboard()}
            {!sessionActive && getLocationContainer}
        </div>
    );
}
export default SurfLocation;