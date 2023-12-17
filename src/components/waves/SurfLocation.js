import React, { useState } from 'react';
import getKey from '../utils/KeyGenerator.js';
import WaveUtils from '../utils/WaveUtils.js';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import GetMatchIcon from './GetMatchIcon.js';
import getAngle from './GetAngle.js';
import createLog from './CreateLog.js';

const SurfLocation = ({ state, item, matches, regionMatch, tideDisplay, updateLocations }) => {
    //console.log(`SurfLocation: state: ${JSON.stringify(state, null, 2)}`)
    const { edit, windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, height, stars } = state;
    // eslint-disable-next-line
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
    const secondsToSec = () => ' sec';
    const getSpeed = () => `${Number(status.windSpeed).toFixed(0)}-${Number(status.windGusts).toFixed(0)}`;
    const getStrength = () => (Number(status.speed) < 2) ? 'light' : (Number(status.speed) > 8) ? 'strong' : 'moderate';
    const style = {
        height: '50px'
    }
    const getCurrentWind = () => {
        return (
            <div className='white' style={style}>
                {/*<div className='m-2 p-10'>{`${getStrength()}`}</div>*/}
                {/*<div className='m-2 p-10'>{`${status.windDirection} ${Number(getAngle(status.windDirection))}°`}</div>*/}
                {/*<div className='m-2 p-10'>{getSpeed()} <span className="greet">mph</span></div>*/}
            </div>
        )
    }
    // eslint-disable-next-line
    const setTide = (tide) => {
        localStorage.setItem("tide", tide);
    }
    const getStarDetails = (kind) => {
        let details = '';
        // eslint-disable-next-line
        const { height, windSpeed, windGusts, swell1Height, swell1Angle, swell1Interval, swell2Height, swell2Angle, swell2Interval } = status;
        // eslint-disable-next-line
        const getWindSpeed = (((windSpeed * 1.15078) + (windGusts * 1.15078)) / 2).toFixed(0);
        details = (kind === 'tide') 
            ? <div className='mt--20'>
                {tideDisplay('star')}
                </div> 
            : details;
        details = (kind === 'wind') ? getCurrentWind() : details;
        details = (kind === 'swell1')
            ? (<React.Fragment>
                <div className='bold white p-10'>{swell1Angle}°</div>
                {/*<div className='bold white p-10'>{`${swell1Height}${(swell1Height.includes('ft')) ? '' : "'"}`}</div>*/}
                {/*<div className='bold white p-10'>{swell1Interval.replace(' seconds', secondsToSec())}</div>*/}
            </React.Fragment>)
            : details;
        details = (kind === 'swell2')
            ? (<React.Fragment>
                <div className='bold white p-10'>{swell2Angle}°</div>
                {/*<div className='bold white p-10'>{`${swell2Height}${(swell2Height.includes('ft')) ? '' : "'"}`}</div>*/}
                {/*<div className='bold white p-10'>{swell2Interval.replace(' seconds', secondsToSec())}</div>*/}
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
        return (<div>
                    <div className={`p-5 r-10 bg-tinted ht-140`}>
                        <div className='mt-10'>
                            <GetMatchIcon kind={matchKind} status={status} />
                        </div>
                    </div>
                    <div className='size20 color-yellow bold'>
                        {(matchKind === 'tide') 
                        ? '' 
                        : <div className='pt-10 pb-5'>
                                {getState(matchKind)}
                            </div>
                        }<div className='mt--10'>{getStarDetails(matchKind)}</div>
                    </div>
                </div>)
    }
    const getStars = (stars) => stars.map((currentStar, index) => {
        const classes = (index == 0)?'':'ml-5';
        return <div key={getKey('star')} className={`flex4Column mt-5 bg-tinted p-5 r-10 ${classes}`}>
                    {star(currentStar)}
                </div>
    });
    const logLocation = (item) => (status.logged === true) ? alert('log already exists') : alert('log already exists');//createLog(item, status);
    const logLocationButton = (item) => {
        return <React.Fragment>
            {
                (localStorage.getItem('edit') === 'true')
                    ? <WaveUtils item={item} state={status} logLocation={() => logLocation(item)} updateLocations={updateLocations}></WaveUtils>
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
                pathname: '/SurfLog?logId=ThuApr3020209:19:28PM',
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
    return (
        <div class='scrollSnap' key={getKey('loc')} /*onClick={() => this.props.editLocation()}*/>
            <div className='r-10 m-10 p-10 bg-tinted'>
                <div className='r-10 p-10 bg-tinted'>
                    <div className='bg-tinted r-10 navBranding color-yellow p-10 lh-30'>{item.name}</div>
                    <div className='size20 color-yellow pt-5'>{`${regionMatch} miles`}</div>
                </div>
                <div className='width-100-percent flexContainer'>{getStars(matches)}</div>
                <div className='r-10 p-10 mt-5 mb-5 bg-tinted'>
                    <div className={preferredClasses}>
                        Swell: {item.swell.map((swell, i) => <span key={getKey('swell')} className={`${(swell === status.swell1Direction) ? statusClass(swell1Match(item)) : subStatusClass(swell2DirectionMatch(swell))}`}>{swell}{((i + 1) === item.swell.length) ? '' : ', '}</span>)}
                    </div>
                </div>
                <div className='r-10 p-10 mb-5 bg-tinted'>
                    <div className={preferredClasses}>
                        Wind: {item.wind.map((wind, i) => <span key={getKey('wind')} className={statusClass(windDirectionMatch({ wind }))}>
                        {wind}{((i + 1) === item.wind.length) ? '' : ', '}
                    </span>)}
                    </div>
                </div>
                <div className='r-10 p-10 mb-5 bg-tinted'>
                    <div className={preferredClasses}>
                        Tide: {item.tide.map((tide, i) => <span key={getKey('tide')} className={statusClass(tideDirectionMatch({ tide }))}>{tide}{((i + 1) === item.tide.length) ? '' : ', '}</span>)}
                    </div>
                </div>
                {
                    //(status.logged) ? editLogButton() : logLocationButton(item)
                    logLocationButton(item)
                }
            </div>
        </div>
    );
}
export default SurfLocation;