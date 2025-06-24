import React, { useState, useEffect } from 'react';
import useCurrentTime from '../utils/useCurrentTime';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import icons from '../site/icons';
import tideIcon from '../../assets/images/tide.png';
import validate from '../utils/validate';
import TideChart from './tide/TideChart';
import initializeData from '../utils/InitializeData';

const TideDisplay = ({
    display,
    tides,
    tideTable,
    getTide,
    getTideTime,
    getTideHeight
}) => {

    const getLocalData = (localItem) => initializeData(localItem, null);
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [tideCollapse, setTideCollapse] = useState(collapseStateInit('tideCollapse'));
    const [tideNow, setTideNow] = useState(null);
    const [loading, setLoading] = useState(true);
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
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;

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
        localStorage.setItem('height', waterLevel);
        localStorage.setItem('heightTime', waterLevelTime)

        return [waterLevel, waterLevelTime];
    }

    const getCurrentTide = () => (getCurrentWaterLevel()[0] > 4) ? 'high' : (getCurrentWaterLevel()[0] < 2) ? 'low' : 'medium';

    const heightInit = () => getLocalData('height') ? getLocalData('height') : '';
    const tideHeader = () => <div>TIDE {Number(heightInit()).toFixed(1)}<span className='size12'>ft</span> {getCurrentTide()}</div>


    useEffect(() => {
        localStorage.setItem('tideCollapse', tideCollapse);
    }, [tideCollapse]);

    useEffect(() => {
        
        if (tideNow !== null) {
            const tide = getCurrentTide();
            localStorage.setItem('tide', tide);
            if (tideNow.data) {
                const tideDirection = getClosestValue(tideNow.data)[1].toUpperCase();
                localStorage.setItem('tideDirection', tideDirection)
                setStatus(prevState => ({
                    ...prevState,
                    tide: tide,
                    predictions: tideNow.data,
                    tideDirection: tideDirection,
                    updated: true
                }))
            }
        }

    }, [tideNow]);

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
    }, []);

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
    const defaultTides = {
        "data": {
            "predictions": [
                {
                    "t": "2024-07-01 11:40",
                    "v": "1.960",
                    "type": "L"
                },
                {
                    "t": "2024-07-01 18:23",
                    "v": "6.064",
                    "type": "H"
                },
                {
                    "t": "2024-07-02 01:53",
                    "v": "-0.341",
                    "type": "L"
                },
                {
                    "t": "2024-07-02 08:22",
                    "v": "3.338",
                    "type": "H"
                },
                {
                    "t": "2024-07-02 12:34",
                    "v": "2.232",
                    "type": "L"
                }
            ]
        },
        "timestamp": 1719874078612
    }

    const findClosestDate = () => {
        const data = tides;
        let datesArray = (data.predictions) ? data.predictions.map((tide) => tide.t) : [];
        if (!Array.isArray(datesArray) || datesArray.length === 0) {
            //return null; // Return null for an empty or non-array input
            if (Object.keys(tides).length === 0) {
                const predictions = initializeData('tides', defaultTides)[0].predictions;
                datesArray = predictions.map((tide) => tide.t)
            } else {
                console.log(`useEffect => 3 tides: ${JSON.stringify(tides, null, 2)}`);
                datesArray = tides.predictions.map((tide) => tide.t)
            }
        }
        const now = new Date();
        let closestDate = datesArray[0];
        let index = 0;
        let closestIndex = 0;

        datesArray.forEach(date => {

            const currentDate = new Date(date);
            const timeDifference = Math.abs(currentDate - now);

            // If the current date is closer than the assumed closest date, update closestDate
            if (timeDifference < Math.abs(new Date(closestDate) - now)) {
                closestDate = date;
                closestIndex = index;
            }
            index++

        });

        return [closestIndex, closestDate];

    }

    const getTideDisplay = () => {

        const getNextLowTideIndex = () => {
            const predictions = tides.predictions;
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

        const predictions = tides.predictions;
        const datesArray = predictions.map((tide) => tide.t);
        const nextTideIndex = findClosestDate()[0];
        const now = new Date();
        const date = datesArray[nextTideIndex];
        const low = datesArray[getNextLowTideIndex()];
        const currentDate = new Date(date);
        const currentLow = new Date(low);
        const timeDifference = Math.abs(currentDate - now);
        const timeDifferenceLow = Math.abs(currentLow - now);
        const millisecondsToTime = (ms) => {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor(ms / (1000 * 60 * 60));
            return { hours, minutes, seconds };
        }
        const { hours, minutes } = millisecondsToTime(timeDifference);
        const untilNextTide = (predictions) ? `${hours} hours and ${minutes} minutes` : 'OOPS!';
        const untilNextLow = (predictions) ? `${millisecondsToTime(timeDifferenceLow)['hours']} hours and ${millisecondsToTime(timeDifferenceLow)['minutes']} minutes` : 'OOPS!';

        const getHeight = () => {
            const height = getCurrentWaterLevel()[0];
            localStorage.setItem('height', height);
            return <div className=''>
                <div className='bold pb-10 mt--10'>{/*levelDisplay*/}{getCurrentTide()}</div>
                <div className='bold color-white'>{height} ft</div>
            </div>
        }
        const getTideDetails = () => {

            return <div className='flexContainer bold color-oceanblue'>
                <div className='flex2Column p-10'>
                    {getTideArrows()}<span className='ml-10'>{getCurrentWaterLevel()[0]}</span> ft.
                </div>
                <div className='flex2Column p-10'>
                    {getCurrentTide().toLocaleUpperCase()}
                </div>
            </div>

        }

        const lowTideDisplay = () => {

            const nextLowTideIndex = getNextLowTideIndex();

            return (
                <div>
                    {nextLowTideIndex !== -1 ? (
                        <div className='containerBox color-oceanblue p-20 mt-10'>
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
                ? <div className='containerBox bold color-yellow bg-lite p-20'>
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
                : (display !== 'narrow' && !tideCollapse)
                    ? <div className='containerDetail mb-10 contentCenter'>
                            {(tideNow.nextTideIndex === -1) ? getHeight() : getTideDetails()}
                        </div>
                    : <div></div>
            }
            {
                (display === 'star' || display === 'narrow')
                    ? <div></div>
                    : (tideCollapse)
                        ? null
                        : <div>
                            {/*
                            <div>{getTideDirection()}</div>
                            */}
                            {/*
                                <div>
                                <div className='containerBox color-neogreen contentLeft'>
                                    <div>
                                        Next tide <b>{nextTide}</b> {nextTideHeight} in {untilNextTide} at {nextTideTime}
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
                            : <TideChart />
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