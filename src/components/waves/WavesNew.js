import React, { useState, useEffect, useRef, useContext } from 'react';
import getKey from '../utils/KeyGenerator';
import WaveUtils from '../wavefinder/WaveUtils';
import calculateDistance from '../location/CalculateDistance';
import NewTide from './NewTide';
import ConditionsDashboard from './ConditionsDashboard';
import SurfLocation from './SurfLocation';
import { getSurfSpots } from './SurfSpots';
import ConditionsSelectors from './ConditionsSelectors';
import Location from '../utils/Location'
import useOceanData from './useOceanData';
import useCurrentTime from '../utils/useCurrentTime';
import ConditionsContext from '../context/ConditionsContext';
import ArrowsNorthSouth from './ArrowsNorthSouth';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import settings from '../../assets/images/settings.png';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';
import SearchBar from '../utils/SearchBar';
import debounceType from '../utils/DebouncerType';
import OceanParent, { OceanContext } from '../context/OceanContext';
import WavesParent, { WavesContext } from '../context/WavesContext';

const WavesNew = () => {

    const targetElementRef = useRef(null);

    const {
        status,
        setStatus,
        swellData,
        setTide,
        setWind,
        setWindStatus,
        handleTideCheck,
        handleTideSelection,
        handleWindCheck,
        handleSwellCheck,
        handleSwell1Selection,
        handleSwell2Selection,
        handleSwell1LiveSelection,
        handleSwell2LiveSelection,
        handleSwell1Angle,
        handleSwell2Angle,
        handleSwell1Height,
        handleSwell2Height,
        handleSwell1Interval,
        handleSwell2Interval,
        handleStarSelection,
        handleDistanceSelection,
        pause
    } = useContext(OceanContext);

    const {
        locations,
        setLocations,
        currentWave,
        setCurrentWave,
        edit,
        setEdit,
        updateLocations
    } = useContext(WavesContext);

    const [itemEntry, setItemEntry] = useState('');
    const locationScrollerRef = useRef(null);
    const northRef = useRef(null);
    const southRef = useRef(null);
    const northSouthRef = useRef(null);
    const getLocalData = (localItem) => initializeData(localItem, null);
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [locationCollapse, setLocationCollapse] = useState(collapseStateInit('locationCollapse'));
    const [matchCollapse, setMatchCollapse] = useState(collapseStateInit('matchCollapse'));
    const [gpsCollapse, setGpsCollapse] = useState(true);
    const [conditionsCollapse, setConditionsCollapse] = useState(true);
    const [buttonsVisible, setButtonsVisible] = useState(false);
    const toggleButtons = () => {
        setButtonsVisible(!buttonsVisible);
    };
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    const uriMLL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${startTime}&end_date=${endTime}&datum=MLLW&station=9410230&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    // eslint-disable-next-line
    const [retry, setRetry] = useState('');
    const data = useOceanData('tides', uriMLL, '', setRetry);
    // eslint-disable-next-line
    const tideNow = useOceanData('tide', tideNowLink, '', setRetry);

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
    const currentPositionExists = () => (status.longitude) ? true : false;
    const updateCurrentLocation = ({
        latitude,
        longitude
    }) => {
        console.log(`UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`)
        if (currentPositionExists()) {

            if ((Math.abs(status.longitude - longitude) > .0001) || (Math.abs(status.latitude - latitude) > .0001) || (status.init === false)) {
                console.log(`updateCurrentLocation => satus coords ^^^^^^^^^^^ ${longitude}, ${latitude}`)
                setStatus(prevState => ({
                    ...prevState,
                    longitude,
                    latitude,
                    init: true
                }));
            }
        } else if ((Math.abs(Number(initializeData('longitude', null)) - longitude) > .000003) || (Math.abs(initializeData('latitude', null) - latitude) > .000003)) {
            console.log(`updateCurrentLocation => local coords ^^^^^^^^^^^ ${longitude}, ${latitude}`)
            setStatus(prevState => ({
                ...prevState,
                longitude,
                latitude,
                init: true
            }));
        }
    }
    /*     
    const updateLocations = (locations) => {
        //console.log(`updateLocations1 => ${JSON.stringify(locations, null, 2)}`);
        //console.log(`updateLocations2 => ${initializeData('locations', null)}`);
        setEdit(!edit);
        setLocations(locations);
    }; 
    */
    const addWave = () => {
        const swells = [];
        const winds = [];
        const tides = [];
        const waveLocations = [...locations];
        //console.log(`addWave => waveLocations: ${JSON.stringify(waveLocations, null, 2)}`)
        let i = 0;
        let wave = prompt('wave: ', '');
        const latitude = prompt('lat: ', initializeData('latitude', null));
        const longitude = prompt('long: ', initializeData('longitude', null));
        const swellCount = prompt('swell count: ', '');
        for (i = 0; i < swellCount; i++) {
            swells[i] = prompt('swell direction', '').toLocaleUpperCase();
        }
        const windCount = prompt('wind count: ', '');
        for (i = 0; i < windCount; i++) {
            winds[i] = prompt('wind direction', '').toLocaleUpperCase();
        }
        const tideCount = prompt('tide count: ', '');
        for (i = 0; i < tideCount; i++) {
            tides[i] = prompt('tide direction', '').toLocaleLowerCase();
        }
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
        waveLocations.push(getObj());
        localStorage.setItem('locations', JSON.stringify(waveLocations));
        setLocations(waveLocations);
        updateLocations(waveLocations);
    }
    const tideDisplay = (display) => <NewTide
        display={display}
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

    const swell1Match = (item) => (item && item.swell && item.swell.indexOf(status.swell1Direction) > -1) ? true : false;
    const swell2Match = (item) => (item && item.swell && item.swell.indexOf(status.swell2Direction) > -1) ? true : false;
    const windMatch = (item) => (item && item.swell && item.wind.indexOf(status.windDirection) > -1) ? true : false;
    const tideMatch = (item) => (item && item.swell && item.tide.indexOf(status.tide) > -1) ? true : false;
    const getDistance = (item) => calculateDistance(status, item);
    const distanceRange = Number(status.distance);
    const regionMatch = (item) => ((getDistance(item) < distanceRange) || (distanceRange > 999999999999)) ? getDistance(item) : false;
    const match = (item) => {
        const matches = [];
        // eslint-disable-next-line
        let matchesCount = (swell1Match(item)) ? matches.push('swell1') : matches;
        matchesCount = (swell2Match(item)) ? matches.push('swell2') : matches;
        matchesCount = (windMatch(item)) ? matches.push('wind') : matches;
        // eslint-disable-next-line
        matchesCount = (tideMatch(item)) ? matches.push('tide') : matches;
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
    let norths = 0;
    let souths = 0;
    const getMatchingLocation = (item, category) => {
        //console.log(`WavesNew => getMatchingLocation => item: ${JSON.stringify(item, null, 2)}`);
        const matches = match(item);
        //console.log(`matches: ${JSON.stringify(matches, null, 2)}`);
        const inRegion = regionMatch(item);
        if ((swell1Confirm(matches) && swell2Confirm(matches) && tideConfirm(matches) && windConfirm(matches)) || showAll) {
            if (inRegion !== false) {
                if (matches.length >= Number(status.stars)) {
                    if (category === 'south') {
                        souths += 1;
                    } else {
                        norths += 1;
                    }
                    return <SurfLocation
                                key={getKey('link')}
                                state={status}
                                item={item}
                                matches={matches}
                                regionMatch={inRegion}
                                tideDisplay={tideDisplay}
                                locationCollapse={locationCollapse}
                            />
                }
            }
        }
    }
    const setScroll = () => {
        const height = () => (northRef.current) ? (northRef.current.clientHeight + northSouthRef.current.clientHeight) - 255 : 100;

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
        });

        if (locationScrollerRef.current) {
            //console.log(`setScroll => height: ${height()}`)
            //console.log(`setScroll => locationScrollerRef.current.scrollHeight: ${locationScrollerRef.current.scrollHeight}`)
            locationScrollerRef.current.scrollTo({
                top: height(),
                left: 0,
                behavior: 'smooth',
            });
        }

        toggleButtons();
    }
    const handleSwellLiveSelection = () => {
        handleSwell1LiveSelection();
        handleSwell2LiveSelection();
        setScroll();
    }
    useEffect(() => {
        handleSwellLiveSelection()
    }, []);
    useEffect(() => {
        const newLocations = [...locations];
        newLocations.forEach((loc) => {
            loc.collapse = locationCollapse
         });
        setLocations(newLocations);
    }, [locationCollapse]);
    const currentTide = () => {

        window.scrollTo({
            top: 20,
            left: 0,
            behavior: 'smooth',
        });

        const localTide = Number(initializeData('tideData', null).data[initializeData('tideData', null).data.length - 1].v).toFixed(1);
        const waterLevel = (validate(tideNow[0].data) !== null) ? Number(tideNow[0].data[tideNow[0].data.length - 1].v).toFixed(1) : localTide;
        const getCurrentTide = (waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium";
        localStorage.setItem('height', waterLevel);
        setTide(getCurrentTide);
        toggleButtons();
    }
    const currentConditions = () => {

        window.scrollTo({
            top: 20,
            left: 0,
            behavior: 'smooth',
        });

        const localTide = Number(initializeData('tideData', null).data[initializeData('tideData', null).data.length - 1].v).toFixed(1);
        const waterLevel = (validate(tideNow[0].data) !== null) ? Number(tideNow[0].data[tideNow[0].data.length - 1].v).toFixed(1) : localTide;
        const getCurrentTide = (waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium";
        localStorage.setItem('height', waterLevel);
        setTide(getCurrentTide);
        setWindStatus(initializeData('wind', null));
        toggleButtons();
    }
    const conditionsEntry = () => {

        window.scrollTo({
            top: 1340,
            left: 0,
            behavior: 'smooth',
        });
        toggleButtons();
    }
    const getCount = () => initializeData('waveCount', 0);
    // eslint-disable-next-line
    const sortedSpots = () => {
        const latitude = (validate(status.latitude) !== null) ? status.latitude : 33.079940;
        const north = [];
        const south = [];
        locations.forEach((item) => {
            if ((latitude > item.latitude) && (String(item.name).toLowerCase().includes(String(itemEntry).toLowerCase()))) {
                //console.log(`spot name: ${item.name}`);
                south.push(item);
            } else if (String(item.name).includes(itemEntry)) {
                //console.log(`north ${item.name} distance: ${getDistance(item)}`);
                north.push(item);
            }
        });

        localStorage.setItem('scrollIndex', north.length)

        const northSorted = north.sort((a, b) => getDistance(a) - getDistance(b));
        const southSorted = south.sort((a, b) => getDistance(a) - getDistance(b));

        const northLocations = northSorted.reverse().map((item) => <div key={getKey('northLocation')}>
            {getMatchingLocation(item, 'north')}
        </div>
        )
        const southLocations = southSorted.map((item) => <div key={getKey('southLocation')}>
            {getMatchingLocation(item, 'south')}
        </div>
        )

        let sortedCount = 0;
        let sortedSouthCount = 0;
        let sortedNorthCount = 0;

        localStorage.setItem('waveCount', sortedCount);

        // Function to enable scroll snapping
        const enableScrollSnap = () => {
            if (locationScrollerRef.current) {
                locationScrollerRef.current.style.scrollSnapType = "y mandatory";
            }
        };

        // Function to disable scroll snapping
        const disableScrollSnap = () => {
            if (locationScrollerRef.current) {
                locationScrollerRef.current.style.scrollSnapType = "none";
            }
        };
        return <div
                id='locationScroller'
                ref={locationScrollerRef}
                className='locationScroller r-10'
                //onMouseEnter={enableScrollSnap}
                //onMouseLeave={disableScrollSnap}
                //onMouseDown={disableScrollSnap}
                //onMouseUp={enableScrollSnap}
                onScroll={() => console.log(`scrollTop: ${northSouthRef.current.clientHeight + northRef.current.clientHeight}`)}
                style={{
                    scrollSnapType: "none",
                }}
            >
            <div id='north' ref={northRef}>
                {northLocations}
            </div>
            <div id='northSouth' ref={northSouthRef} className='pt-15'>
                <div className='flex3Column'>
                    <ArrowsNorthSouth
                        north={norths}
                        south={souths}
                    />
                </div>
            </div>
            <div id='south' ref={southRef} key={getKey('southLocations')}>
                {southLocations}
            </div>
        </div>;
    }
    const repositionButton = () => {
        return (
            <div onClick={() => setScroll()} className='size12 p-10 button r-5 color-lite bold bg-tinted m-1 box-shadow'>
                Closest {icons.waveSet} {icons.upDownArrow}
            </div>
        )
    }
    const conditionsButton = () => {
        return (
            <div onClick={() => conditionsEntry()} className='size12 p-10 button r-5 color-lite bold bg-tinted m-1 box-shadow'>
                Conditions
            </div>
        )
    }
    const currentTideButton = () => {
        return (
            <div onClick={() => currentTide()} className='size12 p-10 button r-5 color-lite bold bg-tinted m-1 box-shadow'>
                Tide
            </div>
        )
    }
    const handleEditToggle = () => {
        setEdit(!edit);
    }
    const currentButton = () => {
        return (
            <div onClick={() => currentConditions()} className='size12 p-10 button r-5 color-lite bold bg-tinted m-1 box-shadow'>
                Conditions
            </div>
        )
    }
    const setEntry = (value) => {
        console.log(`setEntry ${value}`);
        debounceType(setItemEntry, value);
    }

    return (
        (retry !== '')
            ? <div>
                WATER TEMP: Error fetching data retry attempt {retry}
            </div>
            : <OceanParent targetElementRef={targetElementRef} >
                <div className='bold color-yellow mt--25'>
                    <div className='containerBox color-yellow bg-lite p-20'>
                        <CollapseToggleButton
                            title={`${icons.earth1} CURRENT CONDITIONS`}
                            isCollapsed={conditionsCollapse}
                            setCollapse={setConditionsCollapse}
                            align='left'
                        />
                    </div>
                    {
                        (conditionsCollapse)
                            ? <div>
                                <div className='containerBox button color-red brdr-red' onClick={handleSwellLiveSelection}>
                                    GET CURRENT BUOY REPORT
                                </div>
                            </div>
                            : <div className='containerDetail p-5'>
                                <div className='containerBox color-yellow bg-lite p-20'>
                                    <CollapseToggleButton
                                        title={'GPS'}
                                        isCollapsed={gpsCollapse}
                                        setCollapse={setGpsCollapse}
                                        align='left'
                                        icon={settings}
                                    />
                                </div>
                                {
                                    (gpsCollapse)
                                        ? null
                                        : <Location currentPositionExists={currentPositionExists} returnCoordinates={updateCurrentLocation} />
                                }
                                <div className='color-soft'>
                                    <ConditionsDashboard
                                        tideDisplay={tideDisplay}
                                    />
                                </div>

                                <ConditionsContext.Provider value={status}>
                                    <ConditionsSelectors
                                        tideDisplay={tideDisplay}
                                    />
                                </ConditionsContext.Provider>
                                <div className=''>
                                    <div className='containerBox color-yellow bg-lite p-20'>
                                        <CollapseToggleButton
                                            title={`${icons.wave} WAVE SUMMARY`}
                                            isCollapsed={matchCollapse}
                                            setCollapse={setMatchCollapse}
                                            align='left'
                                        />
                                    </div>
                                    {
                                        (matchCollapse)
                                            ? <div></div>
                                            : <div>
                                                <div className='m-10 mt-20'>
                                                    <span className='bold color-lite'>
                                                        {(getCount() === 1) ? `1 wave` : `${getCount()} waves`}
                                                    </span> of {locations.length}
                                                </div>
                                                <div className='m-5'>
                                                    <span className='bold color-lite'>{status.distance} mile</span> radius
                                                </div>
                                                <div className='m-5 bold'>
                                                    prefer:
                                                </div>
                                                <div className='m-5'>
                                                    <span className='bold color-neogreen'>{status.swell1Direction} </span>and <span className='color-orange bold'>{status.swell2Direction} </span>swell
                                                </div>
                                                <div className='m-5'>
                                                    <span className='bold color-lite'>{status.tide} </span>tide
                                                </div>
                                                <div className='m-5'>
                                                    <span className='bold color-lite'>{status.windDirection}</span> winds.
                                                </div>
                                            </div>

                                    }
                                </div>
                            </div>
                    }
                    <div className='containerBox bold color-yellow bg-lite p-20'>
                        <SearchBar
                            onSubmit={setEntry}
                            onChange={setEntry}
                            label='Search waves'
                            term=''
                        />
                    </div>
                    <div className='containerBox color-yellow bg-lite p-20'>
                        <CollapseToggleButton
                            title={
                                `${
                                    (locationCollapse)
                                    ? '+ EXPAND'
                                    : '- COLLAPSE'
                                } ALL`
                            }
                            isCollapsed={locationCollapse}
                            setCollapse={setLocationCollapse}
                            align='left'
                        />
                    </div>
                    <div className={`mt-20 ${(edit) ? '' : 'mb-40'}`}>
                        {sortedSpots()}
                    </div>
                    <div className='containerBox'></div>
                    <div className='mb--10'>
                        <WavesParent targetElementRef={targetElementRef} >
                            <WaveUtils
                                item={status}
                                logLocation={() => alert('needs work')} setEdit={setEdit}
                            >
                            </WaveUtils>
                        </WavesParent>
                    </div>
                    <div className={`containerBox bt--20 width--10 bg-tintedDark`}>
                        <div className={`button-container mt-5`}>
                            {/*
                                <div className='scrollSnapRight'>
                                    {currentTideButton()}
                                </div>
                                <div className='scrollSnapRight'>
                                    {currentButton()}
                                </div>
                                <div className='scrollSnapRight'>
                                    {conditionsButton()}
                                </div>
                            */}
                            <div className='scrollSnapRight'>
                                {currentButton()}
                            </div>
                            <div className='scrollSnapRight mr-10'>
                                {repositionButton()}
                            </div>
                            <span title='toggle edit' className='containerBox button scrollSnapRight' onClick={handleEditToggle}>{(edit) ? `${icons.dont}${icons.edit}` : icons.edit}</span>
                            <div className='containerBox button scrollSnapRight' onClick={addWave}>
                                <span className='mr-5 text-outline-light button'>{icons.plus}</span>
                                <span className=''>{icons.wave}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </OceanParent>
    )
}
export default WavesNew;