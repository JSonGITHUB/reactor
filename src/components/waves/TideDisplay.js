import React, { useState, useEffect } from 'react';
import useCurrentTime from '../utils/useCurrentTime';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import tideIcon from '../../assets/images/tide.png';
import validate from '../utils/validate';
import TideChart from './tide/TideChart';
import initializeData from '../utils/InitializeData';
import { getNearestTideStation } from './api';

const TideDisplay = ({
    display,
    tides,
    tideTable,
    getTide,
    getTideTime,
    getTideHeight,
    lat,
    lon
}) => {

    const getLocalData = (localItem) => initializeData(localItem, null);
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [tideCollapse, setTideCollapse] = useState(collapseStateInit('tideCollapse'));
    const [tideNow, setTideNow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTide, setCurrentTide] = useState();
    const [currentTideDirection, setCurrentTideDirection] = useState();
    const [status, setStatus] = useState({
        tide: '',
        tideDirection: initializeData('tideDirection', '?'),
        height: null,
        updated: false
    });
    const [errorMessage, setErrorMessage] = useState('');
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const waterLevelStation = getNearestTideStation(lat || 32.87, lon || -117.26);
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=${waterLevelStation.id}&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;

    useEffect(() => {
        setCurrentTide(localStorage.getItem('currentTide') ? JSON.parse(localStorage.getItem('currentTide')) : [0]);
        setCurrentTideDirection(localStorage.getItem('currentTideDirection') ? localStorage.getItem('currentTideDirection') : 'up');
    }, []);

    const getDownArrow = () => {
        return <div className='containerDetail bg-white ht-65 mt--10 mb-10 pt-23 size40'>
            {icons.downTriangle}
        </div>
    }
    const getTideArrows = () => (status.tideDirection === 'DOWN') ? icons.downTriangle : icons.upTriangle;
    const getUpArrow = () => {
        return <div className='containerDetail bg-white ht-65 mt--10 mb-10 pt-23 size40'>
            {icons.upTriangle}
        </div>
    }
    const getTideDirection = () => (status.tideDirection === 'DOWN') ? getDownArrow() : getUpArrow();

    const tideClasses = () => {
        if (display === 'star') {
            return ''
        } else {
            return 'white'
        }
    }
    const getClosestValue = (data) => {
        const currentTime = new Date();
        let closest = null;
        let smallestDifference = Infinity;
        let lastHeight = 0;
        let direction = '';

        data.forEach((item) => {
            const itemTime = new Date(item.t.replace(" ", "T"));
            const timeDifference = Math.abs(currentTime - itemTime);

            if (Number(item.v) > lastHeight) {
                direction = 'up';
            } else {
                direction = 'down';
            }
            if (timeDifference < smallestDifference) {
                closest = item;
                smallestDifference = timeDifference;
            }
            lastHeight = Number(item.v);
        });
        return closest ? [Number(closest.v), direction] : [0, direction];
    };

    const getCurrentWaterLevel = () => {

        let waterLevel = initializeData('height', null);
        let waterLevelTime = initializeData('heightTime', null)

        if ((validate(tideNow.data) !== null)) {
            waterLevel = Number(tideNow.data[tideNow.data.length - 1].v).toFixed(1);
            waterLevelTime = Number(tideNow.data[tideNow.data.length - 1].t).toFixed(1);
        } else if (validate(tideNow.data) !== null) {
            waterLevel = Number(tideNow.data[tideNow.data.length - 1].v).toFixed(1);
            waterLevelTime = Number(tideNow.data[tideNow.data.length - 1].t).toFixed(1);
        }
        console.log(`TideDisplay => getCurrentWaterLevel => height: ${waterLevel}, waterLevelTime: ${waterLevelTime}`);
        localStorage.setItem('height', waterLevel);
        localStorage.setItem('heightTime', waterLevelTime)

        return [waterLevel, waterLevelTime];
    }

    const getCurrentTide = () => (currentTide > 4) ? 'high' : (currentTide < 2) ? 'low' : 'medium';

    const heightInit = () => getLocalData('height') ? getLocalData('height') : '';
    //const tideHeader = () => <div>Tide {Number(heightInit()).toFixed(1)}<span className='size12'>ft</span> {getCurrentTide()}</div>
    
    const tideHeader = () => {
        const value = (currentTide && typeof currentTide === 'number' && isFinite(currentTide)) ? currentTide.toFixed(1) : '--';
        return <div>Tide {(currentTideDirection && currentTideDirection === 'UP') ? icons.collapse : icons.expand} {value}<span className='size12'>ft</span> {getCurrentTide()}</div>;
    }
    useEffect(() => {
        localStorage.setItem('tideCollapse', tideCollapse);
    }, [tideCollapse]);

    useEffect(() => {
        
        if (tideNow !== null) {
            if (tideNow.data) {
                const [level, direction] = getClosestValue(tideNow.data);
                setCurrentTide(level);
                setCurrentTideDirection(direction.toUpperCase());
                const tideDirection = direction.toUpperCase();
                const tide = (level > 4) ? 'high' : (level < 2) ? 'low' : 'medium';
                localStorage.setItem('tide', tide);
                localStorage.setItem('tideDirection', tideDirection);
                localStorage.setItem('currentTide', JSON.stringify(level));
                localStorage.setItem('currentTideDirection', direction.toUpperCase());
                setStatus(prevState => ({
                    ...prevState,
                    tide: tide,
                    predictions: tideNow.data,
                    tideDirection: tideDirection,
                    updated: true
                }));
            }
        }

    }, [tideNow]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cachedData = initializeData('tideNow', null);
                const halfHourAgo = new Date().getTime() - .5 * 60 * 60 * 1000;
                if (cachedData && cachedData.timestamp > halfHourAgo) {
                    setTideNow(cachedData.data);
                    setLoading(false);
                    setErrorMessage('');
                } else {
                    console.log(`NewTide => tideNowLink: ${tideNowLink}`)
                    const response = await fetch(tideNowLink);
                    if (!response.ok) {
                        throw new Error('Failed to fetch data');
                    }
                    const data = await response.json();
                    setTideNow(data);
                    localStorage.setItem('tideNow', JSON.stringify({ data, timestamp: new Date().getTime() }));
                    setLoading(false);
                    setErrorMessage('');
                }
            } catch (error) {
                setTideNow(null);
                setLoading(false);
                setErrorMessage('Error fetching data. Please try again later.');
            }
        };
        fetchData();
    }, [tideNowLink]);

    const handleOverride = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            console.log(`NewTide => tideNowLink: ${tideNowLink}`)
            const response = await fetch(tideNowLink);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setTideNow(data);
            localStorage.setItem('tideNow', JSON.stringify({ data, timestamp: new Date().getTime() }));
            setLoading(false);
        } catch (error) {
            setTideNow(null);
            setLoading(false);
            setErrorMessage('Error fetching data. Please try again later.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (errorMessage) {
        return (
            <div>
                <p>{errorMessage}</p>
                <button onClick={handleOverride}>Override using localStorage data</button>
            </div>
        );
    }

    if (!tideNow) {
        return <div>No data available.</div>;
    }
    const getTideDisplay = () => {

        const getNextLowTideIndex = () => {
            const predictions = (tides && Array.isArray(tides.predictions)) ? tides.predictions : [];
            const currentTime = new Date();

            let closestIndex = -1;
            let closestTimeDiff = Infinity;

            for (let i = 0; i < predictions.length; i++) {
                const predictionTime = new Date(predictions[i].t);
                if (predictionTime > currentTime && predictions[i].type === 'L') {
                    const timeDiff = predictionTime - currentTime;
                    if (timeDiff < closestTimeDiff) {
                        closestIndex = i;
                        closestTimeDiff = timeDiff;
                    }
                }
            }

            return closestIndex;
        };

        const predictions = (tides && Array.isArray(tides.predictions)) ? tides.predictions : [];
        const datesArray = predictions.map((tide) => tide.t);
        const now = new Date();
        const low = datesArray[getNextLowTideIndex()];
        const currentLow = new Date(low);
        const timeDifferenceLow = Math.abs(currentLow - now);
        const millisecondsToTime = (ms) => {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor(ms / (1000 * 60 * 60));
            return { hours, minutes, seconds };
        }
        const untilNextLow = (predictions.length > 0) ? `${millisecondsToTime(timeDifferenceLow)['hours']} hours and ${millisecondsToTime(timeDifferenceLow)['minutes']} minutes` : 'OOPS!';

        const getHeight = () => {
            const height = getCurrentWaterLevel()[0];
            console.log(`TideDisplay => getHeight => height: ${height}`);
            localStorage.setItem('height', height);
            return <div className=''>
                <div className='bold pb-10 mt--10'>{/*levelDisplay*/}{getCurrentTide()}</div>
                <div className='bold color-white'>{height} ft</div>
            </div>
        }
        const getTideDetails = () => {

            return <div className='flexContainer bold color-oceanblue'>
                <div className='flex2Column p-10'>
                    {getTideArrows()}<span className='ml-10'>{currentTide.toFixed(1)}</span><span className='size12'>ft</span>
                </div>
                <div className='flex2Column p-10'>
                    {getCurrentTide().toLocaleUpperCase()}
                </div>
            </div>

        }

        const lowTideDisplay = () => {

            const nextLowTideIndex = getNextLowTideIndex();

            return (
                <div className='mt-10 mb-35 ml--5 mr--5'>
                    {nextLowTideIndex !== -1 ? (
                        <div className='containerBox color-oceanblue p-20'>
                            Next <b>LOW</b> tide in {untilNextLow}
                        </div>
                    ) : (
                        <p>No low tide predictions found.</p>
                    )}
                </div>
            );
        };

        return <div className={tideClasses()}>
            {
                (display === 'wide')
                ? <div className='containerDetail mt-5 mb-5 size20 bold color-yellow bg-lite p-20'>
                    <CollapseToggleButton
                        //title={`TIDE ${icons.moon}`}
                        //title={`TIDE ${Number(heightInit()).toFixed(1)}ft ${getCurrentTide}`}
                        title={''}
                        component={tideHeader()}
                        isCollapsed={tideCollapse}
                        setCollapse={setTideCollapse}
                        align='left'
                        icon={tideIcon}
                    />
                </div>
                : null
            }
            {
                (display === 'star')
                ? <div>
                        <div className='pb-10 pt-15 mt--94'>{getTideDirection()}</div>
                        <div className='pt-10'>{getHeight()}</div>
                    </div>
                : <div></div>
            }
            {
                (display === 'star' || display === 'narrow')
                    ? <div></div>
                    : (tideCollapse)
                        ? null
                        : <div className='mt--5'>
                            {/*
                            <div>{getTideDirection()}</div>
                            */}
                            {/*
                                <div>
                                <div className='containerBox color-neogreen contentLeft'>
                                    <div>
                                        Next tide <b>{nextTide}</b> {nextTideHeight} in {nextTideCountdown} at {nextTideTime}
                                    </div>
                                </div>
                            </div>
                            */}
                            {lowTideDisplay()}
                        </div>
            }
            {
                (display === 'narrow')
                    ? null
                    : (display === 'star')
                        ? null
                        : (tideCollapse)
                            ? null
                            : <TideChart 
                                standalone='false'
                                lat={lat}
                                lon={lon}
                            />
                /*<div className='mt-10 p-10 r-10 bg-tinted'>
                        {tideTable()}
                    </div>
                */
            }
        </div>;
    }

    return getTideDisplay();

};

export default TideDisplay;