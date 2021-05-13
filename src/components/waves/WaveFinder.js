import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import getKey from '../utils/KeyGenerator.js';
import WaveUtils from '../utils/WaveUtils.js';
import calculateDistance from '../utils/CalculateDistance.js';
import Tide from './Tide.js';
import ConditionsDashboard from './ConditionsDashboard.js';
// eslint-disable-next-line
import tide from '../../assets/images/tide.png';
import GetMatchIcon from './GetMatchIcon.js';
import SurfLocation from './SurfLocation.js';
import locations from './Locations.js';
import directionObject from './DirectionObject.js';
import ConditionsSelectors from './ConditionsSelectors.js';
//import GetMatchIcon from './GetMatchIcon.js';
import Geolocator from '../utils/Geolocator.js';
// eslint-disable-next-line
import useOceanData from './useOceanData.js';
import useCurrentTime from './useCurrentTime.js';
import ConditionsContext from '../context/ConditionsContext.js';

const WaveFinder = () => {
    const getLocal = (item) => localStorage.getItem(item);
    const getProps = (item) => item;

    const getDefault = (item) => (getLocal(item) === null) 
                                    ? getProps(item) 
                                    : getLocal(item);

    const getSwell1Direction = () => localStorage.getItem('swell1Direction') ? localStorage.getItem('swell1Direction') : 'SSW';
    const getSwell2Direction = () => localStorage.getItem('swell2Direction') ? localStorage.getItem('swell2Direction') : 'SSW';
    const getLocalLocations = () => (localStorage.getItem('locations')) ? JSON.parse(localStorage.getItem('locations')) : locations();
    const getLocations = () => getLocalLocations() || locations();
    
    const [status, setStatus] = useState({            
        module: 'WaveFinder',
        pause: true,
        date: new Date(),
        edit: false,
        tide: getDefault('tide'),
        stars: getDefault('stars'),
        waterTemp: '66.2',
        swell1Height: '2.0',
        swell1Interval: '17 seconds',
        swell1Direction: getSwell1Direction(),
        swell2Height: '2.0',
        swell2Interval: '9 seconds',
        swell2Direction: getSwell2Direction(),
        swell1Angle: directionObject[getSwell1Direction()],
        swell2Angle: directionObject[getSwell2Direction()],
        //swell1Direction: getDefault('swell1Direction'),
        //swell2Direction: getDefault('swell2Direction'),
        //swell1Angle: getDefault('swell1Angle'),
        //swell2Angle: getDefault('swell2Angle'),
        //swell1Height: getDefault('swell1Height'),
        //swell2Height: getDefault('swell2Height'),
        //swell1Interval: getDefault('swell1Interval'),
        //swell2Interval: getDefault('swell2Interval'),
        windDirection: getDefault('windDirection'),
        distance: getDefault('distance'),
        isSwell1: (localStorage.getItem('isSwell1') === 'true') ? true : false,
        isSwell2: (localStorage.getItem('isSwell2') === 'true') ? true : false,
        isTide: (localStorage.getItem('isTide') === 'true') ? true : false,
        isWind: (localStorage.getItem('isWind') === 'true') ? true : false,
        locations: getLocations(),
        matches: []
    });
    //console.log(`WaveFinder => status:\n${JSON.stringify(status, null, 2)}`);
    //setIt = setIt.bind(this);
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    //console.log(`WaveFinder => time: ${JSON.stringify(time, null, 2)}\nstartTime: ${startTime} \nendTime: ${endTime}`);
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    const uriMLL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${startTime}&end_date=${endTime}&datum=MLLW&station=9410230&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    // eslint-disable-next-line
    const data = useOceanData('tides', uriMLL);
    // eslint-disable-next-line
    const tideNow = useOceanData('tide', tideNowLink);
    
    //console.log(`isWind: ${getDefault('isWind')}`)
    
    const tick = () => {
        console.log(`tick => pause: ${status.pause}`)
        if (status.pause === false) {
            setStatus(prevState => ({
                ...prevState,
                date: new Date(),
                pause: true
            }));
        }
    }
    useEffect(() => {		
        const timerID = setInterval(
            () => tick(),
            3000000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    },[]);
    
    useEffect(() => {
        setScroll();
    },[]);

    const currentPositionExists = () => (status.longitude) ? true : false;
    const updateCurrentLocation = (longitude, latitude) => {
//      console.log(`UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`)
        localStorage.setItem('longitude', longitude);
        localStorage.setItem('latitude', latitude);
        setStatus(prevState => ({
            ...prevState,
            longitude,
            latitude
        }))
    }
    const updateLocations = () => {
        console.log(`updateLocations =>`);
        setStatus(prevState => ({
            ...prevState,
            locations: getLocations(),
            edit: false
        }));
    }; 
    const getDefaultHeights = (tideSelected) => {
        if (tideSelected === 'high') {
            return 5;
        } else if (tideSelected === 'medium') {
            return 3;
        }
        return 0;
    }
    const handleWindCheck = () => {
        localStorage.setItem('isWind', !status.isWind);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            isWind: localStorage.getItem('isWind')
        }));
    }
    const handleTideCheck = () => {
        localStorage.setItem('isTide', !status.isTide);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            isTide: localStorage.getItem('isTide')
        }));
    }
    const handleSwellCheck = (id) => {
        if (id === '1') {
            localStorage.setItem('isSwell1', !status.isSwell1);
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                isSwell1: localStorage.getItem('isSwell1')
            }));
        } else {
            localStorage.setItem('isSwell2', !status.isSwell2);
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                isSwell2: localStorage.getItem('isSwell2')
            }));
        }
    }
    // eslint-disable-next-line
    const handleSwellSelection = (id, groupTitle, label, selected) => {
        // eslint-disable-next-line
        const swellAngle = directionObject[selected];
        //console.log(`handleSwellSelection => \nselected: ${selected} \nswellAngle: ${swellAngle}\n directionObject: ${JSON.stringify(directionObject, null, 2)}`)
        if(id === '1') {
            localStorage.setItem('swell1Angle', swellAngle);
            localStorage.setItem('swell1Direction', selected);
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                swell1Direction: selected,
                swell1Angle: swellAngle
            }));
        } else {
            //console.log(`${selected} swell2Angle: ${swell2Angle}`)
            localStorage.setItem('swell2Angle', swellAngle);
            localStorage.setItem('swell2Direction', selected);
            setStatus(prevState => ({
                ...prevState,
                pause: true,
                swell2Direction: selected,
                swell2Angle: swellAngle
            }));
        }
    }
    const handleSwell1Selection = (groupTitle, label, selected) => {
        const swell1Angle = directionObject[selected];
        //console.log(`handleSwell1Selection => \nselected: ${selected} \nswell1Angle: ${swell1Angle}\n directionObject: ${JSON.stringify(directionObject, null, 2)}`)
        localStorage.setItem('swell1Angle', swell1Angle);
        localStorage.setItem('swell1Direction', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Direction: selected,
            swell1Angle: swell1Angle
        }));
    }
    const handleSwell2Selection = (groupTitle, label, selected) => {
        const swell2Angle = directionObject[selected];
        //console.log(`${selected} swell2Angle: ${swell2Angle}`)
        localStorage.setItem('swell2Angle', swell2Angle);
        localStorage.setItem('swell2Direction', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Direction: selected,
            swell2Angle: swell2Angle
        }));
    }
    const handleSwell1Angle = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Angle', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Angle: selected
        }));
    }
    const handleSwell2Angle = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Angle', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Angle: selected
        }));
    }
    const handleSwell1Height = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Height', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Height: selected
        }));
    }
    const handleSwell2Height = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Height', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Height: selected
        }));
    }
    const handleSwell1Interval = (groupTitle, label, selected) => {
        localStorage.setItem('swell1Interval', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell1Interval: selected
        }));
    }
    const handleSwell2Interval = (groupTitle, label, selected) => {
        localStorage.setItem('swell2Interval', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            swell2Interval: selected
        }));
    }
    const handleStarSelection = (groupTitle, label, selected) => {
        localStorage.setItem('stars', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            stars: selected
        }));
    }
    const handleDistanceSelection = (event) => {
        const target = event.target;
        localStorage.setItem('distance', target.value);
        setStatus(prevState => ({
            ...prevState,
            distance: target.value
        }));
    }
    const pause = (event) => {
        //console.log('PAUSE');
        setStatus(prevState => ({
            ...prevState,
            pause: true
        }));
    }
    // eslint-disable-next-line
    const unpause = () => {
        //console.log('UNPAUSE');
        setStatus(prevState => ({
            ...prevState,
            pause: true
        }));
    };
    const setTide = (tide) => {
        console.log(`WaveFinder = > setTide(${tide})`)
        //let currentTide = (Number(tide)>2) ? 'medium' : 'low';
        //console.log(`WaveFinder = > ${tide} currentTide(${currentTide})`)
        //currentTide = (Number(tide)>4) ? 'high' : currentTide;
        //console.log(`WaveFinder = > ${tide} currentTide(${currentTide})`)
        if (localStorage.getItem('tide') !== tide) {
            localStorage.setItem('tide', tide);
            setStatus(prevState => ({
                ...prevState,
                tide: tide,
                height: getDefaultHeights(tide)
            }));
        }
    }
    const tideDisplay = (display) => <Tide 
                                    tideNow={tideNow} 
                                    data={data} 
                                    time={time} 
                                    setTide={setTide} 
                                    display={`${display}`}
                                />

    // eslint-disable-next-line
    const getState = (kind) => {
        const { swell1Direction, swell2Direction, tide, windDirection } = status;
        if (kind === 'swell1') {
            return swell1Direction;
        } else if (kind === 'swell2') {
            return swell2Direction;
        } else if (kind === 'tide') {
            return tide;
        } else if (kind === 'wind') {
            return windDirection;
        }
    }
    // eslint-disable-next-line
    const getStarDetails = (kind) => {
        let details = '';
        const { height, windSpeed, windGusts } = status;
        details = (kind === 'tide') ? <div className='bold color-neogreen'>{height}'</div> : details;
        details = (kind === 'wind') ? <div className='bold color-neogreen'>{windSpeed * 1.15078}-{windGusts * 1.15078}mph</div> : details;
        return details
    }
    // eslint-disable-next-line
    /*
    const star = (matchKind) => <div className='flex3Column bg-lite mr-5 ml-5 p-10 r-10'>
                            <GetMatchIcon kind={matchKind} status={status}/>
                            <div className='greet'>{getState(matchKind)}{getStarDetails(matchKind)}</div>
                        </div>;
    */
    
    const handleTideSelection = (groupTitle, label, selected) => {
        localStorage.setItem('tide', selected);
        setTide(selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            tide: selected,
            height: getDefaultHeights(selected)
        }));
    }
    const setWind = (direction, angle, speed, gusts) => {
        //console.log(`setWind =>\ndirection: ${direction}\nspeed: ${speed}`)
        setStatus(prevState => ({
            ...prevState,
            windDirection: direction,
            windAngle: Number(angle).toFixed(0),
            windSpeed: Number(speed).toFixed(0),
            windGusts: Number(gusts).toFixed(0)
        }));
    }

    //console.log(`currentPositionExists: ${currentPositionExists()}`);
    const swell1Match = (item) => (item.swell.indexOf(status.swell1Direction)>-1) ? true : false;
    const swell2Match = (item) => (item.swell.indexOf(status.swell2Direction)>-1) ? true : false;
    const windMatch = (item) => (item.wind.indexOf(status.windDirection)>-1) ? true : false;
    const tideMatch = (item) => (item.tide.indexOf(status.tide)>-1) ? true : false;
    //const swell1DirectionMatch = (direction) => (direction.swell===status.swell1Direction) ? true : false;
    //const swell2DirectionMatch = (direction) => (direction===status.swell2Direction) ? true : false;
    //const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
    //const tideDirectionMatch = (direction) => (direction.tide === status.tide) ? true : false;
    const getDistance = (item) => calculateDistance(status, item);
    //Math.abs(item.latitude - status.latitude)+Math.abs(item.longitude - status.longitude);
    //.01 - 1 mile
    const distanceRange = Number(status.distance);
    const regionMatch = (item) => ((getDistance(item)<distanceRange) || (distanceRange > 999999999999)) ? getDistance(item) : false;
    let count = 0;
    const match = (item) => {
        const matches = [];
        // eslint-disable-next-line
        let matchesCount = (swell1Match(item)) ? matches.push('swell1') : matches;
        matchesCount = (swell2Match(item)) ? matches.push('swell2') : matches;
        matchesCount = (windMatch(item)) ? matches.push('wind') : matches;
        // eslint-disable-next-line
        matchesCount = (tideMatch(item)) ? matches.push('tide') : matches;
        //console.log(`matches => ${item.name} - ${matches}`)
        return matches;
    }
    // eslint-disable-next-line
    const statusClass = (status) => (status === true) ? 'color-neogreen' : 'color-yellow'; 
    // eslint-disable-next-line
    const subStatusClass = (status) => (status === true) ? 'color-orange' : 'color-yellow'; 
    const swell1Confirm = (matches) => ((status.isSwell1 && matches.includes('swell1')) || status.isSwell1 === false) ? true : false;
    const swell2Confirm = (matches) => ((status.isSwell2 && matches.includes('swell2')) || status.isSwell2 === false) ? true : false;
    const tideConfirm = (matches) => ((status.isTide && matches.includes('tide')) || status.isTide === false) ? true : false;
    const windConfirm = (matches) => ((status.isWind && matches.includes('wind')) || status.isWind === false) ? true : false;
    const showAll = false;
    const getCount = () => count;
    const getMatchingLocation = (item) => {
        const matches = match(item);
        const inRegion = regionMatch(item);
        if ((swell1Confirm(matches) && swell2Confirm(matches) && tideConfirm(matches) && windConfirm(matches)) || showAll) {
            if (inRegion !== false) {
                if (matches.length >= Number(status.stars)) {
                    //console.log(`STARS ==================> Matches: ${matches.length} status stars:${status.stars}`)
                    count = count + 1;
                    return <SurfLocation 
                                key={getKey('link')} 
                                state={status} 
                                item={item} 
                                matches={matches} 
                                calculateDistance={calculateDistance} 
                                regionMatch={inRegion} 
                                tideDisplay={tideDisplay} 
                                updateLocations={updateLocations}
                            >
                            </SurfLocation>
                }
            }
        }
    }
    const setScroll = () => {
        const body = document.body; // For Safari
        const html = document.documentElement; // Chrome, Firefox, IE and Opera places the overflow at the html level, unless else is specified. Therefore, we use the documentElement property for these browsers
        const height = document.getElementById('north').clientHeight;
        body.scrollLeft = 0;
        body.scrollTop = height+1700;
        html.scrollLeft = 0;
        html.scrollTop = height+1700;
    }
    const currentConditions = () => {
        const body = document.body; // For Safari
        const html = document.documentElement; // Chrome, Firefox, IE and Opera places the overflow at the html level, unless else is specified. Therefore, we use the documentElement property for these browsers
        body.scrollLeft = 0;
        body.scrollTop = 25;
        html.scrollLeft = 0;
        html.scrollTop = 25;
    }
    const conditionsEntry = () => {
        const body = document.body; // For Safari
        const html = document.documentElement; // Chrome, Firefox, IE and Opera places the overflow at the html level, unless else is specified. Therefore, we use the documentElement property for these browsers
        body.scrollLeft = 0;
        body.scrollTop = 740;
        html.scrollLeft = 0;
        html.scrollTop = 740;
    }
    const sortedNorthSpots = () => {
        const latitude = (status.latitude !== undefined) ? status.latitude : 33.079940;
        const north = [];
        locations().forEach((item) => {
            if (latitude < item.latitude) {
                north.push(item);
            }
        });
        localStorage.setItem('scrollIndex', north.length)
        const northLocations = () => north.map((item) => getMatchingLocation(item));
        return northLocations;
    }
    const sortedSouthSpots = () => {
        const latitude = (status.latitude !== undefined) ? status.latitude : 33.079940;
        const south = [];
        locations().forEach((item) => {
            if (latitude > item.latitude) {
                south.push(item);
            }
        });
        const southLocations = () => south.map((item) => getMatchingLocation(item));
        return southLocations;
    }
    // eslint-disable-next-line
    const sortedSpots = () => {
        const latitude = (status.latitude !== undefined) ? status.latitude : 33.079940;
        const north = [];
        const south = [];
        locations().forEach((item) => {
            //console.log(`${item.name} current ${latitude} > item: ${item.latitude}`)
            if (latitude > item.latitude) {
                south.push(item);
            } else {
                north.push(item);
            }
        });
        localStorage.setItem('scrollIndex', north.length)
        /*
        setStatus(prevState => ({
            ...prevState,
            scrollIndex: localStorage.getItem('scrollIndex')
        }));
        */
        const northLocations = north.map((item) => getMatchingLocation(item));
        const southLocations = south.map((item) => getMatchingLocation(item))
        const sorted = north.concat(south);
        //console.log(`sortedSpots =>\nsortedNorth: ${JSON.stringify(north,null,2)}`)
        //console.log(`sortedSpots =>\nsortedSouth: ${JSON.stringify(south,null,2)}`)
        const sortedLocations = sorted.map((item) => getMatchingLocation(item));
        return <div>
                <div id='north' className='p-10 r-10 glassy mb-1'>
                    {northLocations}<br/>north
                </div>
                <div className='p-10 r-10 glassy'>
                    south<br/>
                    {southLocations}
                </div>
            </div>;
    }
    const matchingLocations = locations().map((item) => getMatchingLocation(item));
    //localStorage.setItem('locations', JSON.stringify(locations()))
    //console.log(`WaveFinder => \nlocations: ${JSON.stringify(locations(), null, 2)}`)
    // eslint-disable-next-line
    const setWindStatus = (selected) => {
        localStorage.setItem('windDirection', selected);
        setStatus(prevState => ({
            ...prevState,
            pause: true,
            windDirection: selected
        }));
    }
    const tideButton = () => {
        return (
            <div className='p-10 button r-5 color-lite bold bg-green glassy m-1'>
                <GetMatchIcon kind='tide' status={status}/>
                Tide
            </div>
        )
    }
    const windButton = () => {
        return (
            <div className='p-10 button r-5 color-lite bold bg-green glassy m-1'>
                <GetMatchIcon kind='wind' status={status}/>
                Wind
            </div>
        )
    }
    const swell1Button = () => {
        return (
            <div className='p-10 button r-5 color-lite bold bg-green glassy m-1'>
                <GetMatchIcon kind='swell1' status={status}/>
                Swell1
            </div>
        )
    }
    const swell2Button = () => {
        return (
            <div className='p-10 button r-5 color-lite bold bg-green glassy m-1'>
                <GetMatchIcon kind='swell2' status={status}/>
                Swell2
            </div>
        )
    }
    const repositionButton = () => {
        return (
            <div onClick={() => setScroll()} className='p-10 button r-5 color-lite bold bg-green glassy m-1'>
                Reposition
            </div>
        )
    }
    const conditionsButton = () => {
        return (
            <div onClick={() => conditionsEntry()} className='p-10 button r-5 color-lite bold bg-green glassy m-1'>
                Conditions
            </div>
        )
    }
    const currentButton = () => {
        return (
            <div onClick={() => currentConditions()} className='p-10 button r-5 color-lite bold bg-green glassy m-1'>
                Current
            </div>
        )
    }
    return (
        <div className='App-content fadeIn mt--30'>
            <Geolocator currentPositionExists={currentPositionExists} returnCurrentPosition={updateCurrentLocation}/>
            <div className='white'>
                <ConditionsDashboard tideDisplay={tideDisplay} setWind={setWind} />
                <ConditionsContext.Provider value={status}>
                    <ConditionsSelectors 
                        setTide={setTide}
                        setWind={setWind}
                        setWindStatus={setWindStatus}
                        handleTideCheck={handleTideCheck}
                        handleTideSelection={handleTideSelection}
                        handleWindCheck={handleWindCheck} 
                        handleSwellCheck={handleSwellCheck}
                        handleSwell1Selection={handleSwell1Selection}
                        handleSwell2Selection={handleSwell2Selection}
                        handleSwell1Angle={handleSwell1Angle}
                        handleSwell2Angle={handleSwell2Angle}
                        handleSwell1Height={handleSwell1Height}
                        handleSwell2Height={handleSwell2Height}
                        handleSwell1Interval={handleSwell1Interval}
                        handleSwell2Interval={handleSwell2Interval}
                        handleStarSelection={handleStarSelection}
                        handleDistanceSelection={handleDistanceSelection}
                        pause={pause}
                        setStatus={setStatus}
                        tideNow={tideNow}
                        data={data} 
                        tideDisplay={tideDisplay}
                    />
                </ConditionsContext.Provider>
                <div className='mt-10 mb-20'>
                    <div className='m-5'><span className='color-neogreen bold'>{(getCount() === 1) ? `1 wave` : `${count} waves`}</span> out of {locations().length}</div>
                    <div className='m-5'>are in a <span className='color-neogreen bold'>{status.distance}</span> mile radius</div>
                    <div className='m-5'>and prefer <span className='color-neogreen bold'>{status.swell1Direction} </span>and <span className='color-orange bold '>{status.swell2Direction} </span>swell </div>
                    <div className='m-5'>with a <span className='color-neogreen bold'>{status.height}' {status.tide} </span>tide:</div>
                </div>
                {sortedSpots()}
                <WaveUtils status={status} item={status} updateLocations={updateLocations}></WaveUtils>
                <div className='flexContainer bt-15'>
                    <div className='flex3Column'>{currentButton()}</div>
                    <div className='flex3Column'>{conditionsButton()}</div>
                    <div className='flex3Column'>{repositionButton()}</div>
                </div>
                {/*
                    <div className='flexContainer t-50 mt-10'>
                        <div className='flex4Column'>{swell1Button()}</div>
                        <div className='flex4Column'>{swell2Button()}</div>
                        <div className='flex4Column'>{tideButton()}</div>
                        <div className='flex4Column'>{windButton()}</div>
                    </div>
                */}
            </div> 
        </div>  
    )
}
export default WaveFinder;