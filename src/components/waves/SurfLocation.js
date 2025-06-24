import React, { useState, useEffect, useContext } from 'react';
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

const SurfLocation = ({
    state,
    item,
    matches,
    regionMatch,
    tideDisplay,
    locationCollapse
}) => {
    const { /*edit, */windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, stars } = state;
    // eslint-disable-next-line
    const [collapse, setCollapse] = useState(item.collapse);
    const [showLabel, setShowLabel] = useState(false);
    const {
        locations,
        setLocations,
        currentWave,
        setCurrentWave,
        handleResetLocations,
        handleEditToggle,
        edit,
        setEdit,
        updateLocations
    } = useContext(WavesContext);
    const [status, setStatus] = useState({
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
        //setLocations(newLocations)
        localStorage.setItem('locations', JSON.stringify(newLocations))
    }, [collapse]);

    const style = {
        height: '50px'
    }
    const editWave = (location, index) => {
        console.log(`editWaveSave => index: ${index}`)
        const waveLocations = [...locations];
        let swells = location.swell;
        let winds = location.wind;
        let tides = location.tide;
        let i = 0;
        let wave = prompt('wave: ', location.name);
        let latitude = prompt('lat: ', location.latitude);
        let longitude = prompt('long: ', location.longitude);
        const swellCount = prompt('swell count: ', swells.length);
        for (i = 0; i < swellCount; i++) {
            swells[i] = prompt('edit swell direction', swells[i]).toLocaleUpperCase();
        }
        swells = swells.slice(0, swellCount);
        const windCount = prompt('wind count: ', winds.length);
        for (i = 0; i < windCount; i++) {
            winds[i] = prompt('edit wind direction', winds[i]).toLocaleUpperCase();
        }
        winds = winds.slice(0, windCount);
        const tideCount = prompt('tide count: ', tides.length);
        for (i = 0; i < tideCount; i++) {
            tides[i] = prompt('edit tide direction', tides[i]).toLocaleLowerCase();
        }
        tides = tides.slice(0, tideCount);
        const getObj = () => {
            return {
                name: wave,
                latitude: latitude,
                longitude: longitude,
                swell: swells,
                wind: winds,
                tide: tides
            }
        }
        waveLocations[index] = getObj();
        console.log(`editWaveSave => wave: ${wave} ${JSON.stringify(waveLocations[index], null, 2)}`)
        localStorage.setItem('locations', JSON.stringify(waveLocations));
        setLocations(waveLocations);
        updateLocations(waveLocations);
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
            <div className={`containerBox ht-150`}>
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
        return <div key={getKey(star(currentStar))} className='flex6Column'>
                    {star(currentStar)}
                </div>
    });
    const waterLevel = Number(initializeData('height', 0));
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
    const conditions = () => {

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
    const notes = () => {
        const longMonth = () => months[month() - 1];
        const suffix = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th'];
        const note = `On ${longMonth()} ${day()}${suffix[Number(String(day()).slice(-1))]} ${year()}, ` +
            `${item.name} was ${waveSize()} with ${state.swell1Height}ft close-outs out of the ${directions[state.swell1Direction]}, ` +
            `on a ${initializeData('height', 0)}ft ${getCurrentTide} tide.` +
            `The wind was ${windOrientation()} at ${initializeData('windSpeed', '0mph')} out of the ${directions[state.windDirection]} ` +
            `and surface conditions were ${surfaceCondition()}. Overall the surf was ${conditions().toLocaleLowerCase()}.`;
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
                    Surface: surfaceCondition()
                },
                Conditions: {
                    Conditions: conditions()
                },
                Comments: {
                    'notes': notes()
                }
            }
        )
    };
    const logLocation = (item) => {
        console.log(`logLocation => item: ${JSON.stringify(item, null, 2)}`);
        const id = date();
        localStorage.setItem('logId', id);
        localStorage.setItem(id, JSON.stringify(logTemplateData(item.name)));
        window.location.pathname = '/reactor/Session';
    }
    const logLocationButton = (item) => {
        return <React.Fragment>
            {
                (initializeData('edit', 'false') === 'true')
                ? <div className='mb--10'>
                    <WaveUtils
                        item={item}
                        logLocation={logLocation}
                        updateLocations={updateLocations}
                    >
                    </WaveUtils>
                </div>
                : <div className='App button bg-dkYellow color-black p-10 r-10 mt-20' onClick={() => logLocation(item)}>
                    Log Session
                </div>
            }
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
                                    <div className='width-100-percent flexContainer'>{getStars(matches)}</div>
                                    <div className='r-10 p-10 mt-5 mb-5 bg-tinted'>
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
                                    <div className='r-10 p-10 mb-5 bg-tinted'>
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

    const getLocationContainer = <div className={`containerBox bg-${(matches.length > 3) ? 'great' : (matches.length === 3) ? 'good' : (matches.length === 2) ? 'fair' : 'bad'}`}>
            <div className={`containerDetail color-yellow size25 bold`}>
                <CollapseToggleButton
                    title={
                        `${icons.wave}${starIcons(item, matches.length)}`}
                    isCollapsed={collapse}
                    setCollapse={setCollapse}
                    align='left'
                />
            </div>
            <div
            className='containerDetail mt-2 bg-lite flexContainer columnLeftAlign color-white pl-15 pr-15'
                onClick={() => window.location = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
            >
                {
                    (collapse)
                    ? <div className={`flexContainer button size25 mr-15 mt-5`}>
                        {getStars(matches)}
                    </div>
                    : null
                }
            <div className={`flex1Column mt-10 pb-10 ${(collapse) ? 'contentLeft' : 'contentRight'}`}>
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

    const transitionClass = `button ease`;

    const handleTransitionEnd = () => {
        if (!collapse) {
            setShowLabel(true);
        }
    };

    return (
        <div 
            className={`scrollSnap`} 
            key={getKey('loc')} 
            /*onClick={() => this.props.editLocation()}*/
        >
            {getLocationContainer}
        </div>
    );
}
export default SurfLocation;