import React, { useState, useEffect } from 'react';
import Loader from '../site/Loader';
import tide from '../../assets/images/tide.png';
import getKey from '../utils/KeyGenerator';
import icons from '../site/icons';
import useOceanData from './useOceanData';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';

const Tide = ({
    tideNow,
    data,
    time,
    setTide,
    display,
    isMotionOn
}) => {

    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    console.log(`TIDE => tideNowLink: ${tideNowLink}`)
    const [retry, setRetry] = useState('');
    const localTideNow = useOceanData('tide', tideNowLink, '', setRetry);
    const getLocalData = (localItem) => initializeData(localItem, null);
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [tideCollapse, setTideCollapse] = useState(collapseStateInit('tideCollapse'));
    
    const heightInit = () => getLocalData('height') ? getLocalData('height') : '';
    const getClosestValue = () => {
        const data = tideNow.data;
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
    const getCurrentTide = (getClosestValue()[0] > 4) ? 'high' : (getClosestValue()[0] < 2) ? 'low' : 'medium';
   
    const tideHeader = () => {
        if (retry !== '') {
            return <div>
                TIDE: Error fetching data retry attempt {retry}
            </div>
        }
        return <div>
            TIDE {Number(heightInit()).toFixed(1)}<span className='size12'>ft</span> {getCurrentTide}
        </div>
    }

    useEffect(() => {
        localStorage.setItem('tideCollapse', tideCollapse);
    }, [tideCollapse]);

    const initTide = {
        t: '2024-04-04 13:18',
        v: '-0.743',
        type: 'L'
    }
    const evaluteTide = (tide) => tide ?? initTide;
    const getTideHour = (tide) => {
        const newTide = evaluteTide(tide);
        const originalHour = Number(newTide.t.split(' ')[1].split(':')[0]);
        const greaterThan12 = (originalHour > 12) ? true : false;
        const lessThan1 = (originalHour < 1) ? true : false;
        const hour = (greaterThan12) ? (originalHour - 12) : (lessThan1) ? 12 : originalHour;
        return hour;
    }
    const getTideMinutes = (tide) => {
        const newTide = evaluteTide(tide);
        const originalMinutes = Number(newTide.t.split(' ')[1].split(':')[1]);
        const lessThan10 = (originalMinutes < 10) ? true : false;
        const minutes = (lessThan10) ? `0${originalMinutes}` : originalMinutes;
        return minutes;
    }
    const getTideTime = (tide) => {
        const originalTime = `${getTideHour(tide)}:${getTideMinutes(tide)}`;
        return originalTime;
    }
    const getTideHeight = (tide) => {
        const newTide = evaluteTide(tide);
        const originalTide = Number(newTide.v);
        const displayTide = `${originalTide.toFixed(1)}'`
        return displayTide;
    }
    const getTide = (tide) => {
        const newTide = evaluteTide(tide);
        const newType = (newTide.type === 'H') ? 'HIGH' : 'LOW';
        return newType;
    }

    const [status, setStatus] = useState({
        tide: '',
        tideDirection: initializeData('tideDirection', '?'),
        height: null,
        updated: false
    });


    /*
    useEffect(() => {

        const uriMLL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${startTime}&end_date=${endTime}&datum=MLLW&station=9410230&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
        setData(useOceanData('tides', uriMLL));

    }, []);
    */
    useEffect(() => {

        let mounted = true;
        let waterLevel = initializeData('height', null);
        let waterLevelTime = initializeData('heightTime', null);

        if ((validate(tideNow[0].data) !== null) && mounted === true) {
            waterLevel = Number(tideNow[0].data[tideNow[0].data.length - 1].v).toFixed(1);
            waterLevelTime = Number(tideNow[0].data[tideNow[0].data.length - 1].t).toFixed(1);
       } else if (validate(localTideNow[0].data) !== null) {
            waterLevel = Number(localTideNow[0].data[localTideNow[0].data.length - 1].v).toFixed(1);
            waterLevelTime = Number(localTideNow[0].data[localTideNow[0].data.length - 1].t).toFixed(1);
        }

        localStorage.setItem('height', waterLevel);
        localStorage.setItem('heightTime', waterLevelTime)
        setTide(getCurrentTide, waterLevel);

        return () => mounted = false;

    }, [tideNow[0].data, getCurrentTide, setTide]);

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

    useEffect(() => {

        let mounted = true;
        let predictions = [];
        console.log(`useEffect => 1 data[0]: ${JSON.stringify(data[0], null, 2)}`);
        console.log(`useEffect => 1a Object.keys(data[0]).length: ${Object.keys(data[0]).length}`);
        if (Object.keys(data[0]).length === 0) {
            predictions = initializeData('tides', defaultTides)[0].predictions;
        } else {
            predictions = data[0].predictions;
        }

        if ((validate(predictions !== null) && status.updated !== true) && mounted) {

            if (Object.keys(data[0]).length > 0) {
                localStorage.setItem('tides', JSON.stringify(data));
            }

            setStatus(prevState => ({
                ...prevState,
                tide: getCurrentTide,
                predictions: predictions,
                updated: true
            }))

        }
        return () => mounted = false;
    }, [data, getCurrentTide, status.updated, time]);

    const previousTide = () => initializeData('tide', 0);

    // eslint-disable-next-line
    const notEqual = () => (Number(previousTide()) !== Number(status.height)) ? true : false;

    // eslint-disable-next-line
    const greaterThan = () => (Number(previousTide()) > Number(status.height)) ? true : false;

    const getDownArrow = () => {

        localStorage.setItem('tideDirection', 'DOWN')

        return <div className='containerDetail m-auto bg-white ht-65 mt--15 pt-23 size40'>
            {icons.downTriangle}
        </div>
    }

    const getUpArrow = () => {

        localStorage.setItem('tideDirection', 'UP')

        return <div className='containerDetail m-auto bg-white ht-65 mt--15 pt-23 size40'>
            {icons.upTriangle}
        </div>

    }

    const getTideDirection = () => (status.tideDirection === 'DOWN') ? getDownArrow() : getUpArrow();

    // eslint-disable-next-line
    const setLocalTide = () => localStorage.setItem('tide', status.tide);
    const setLocalTideDirection = () => localStorage.setItem('tideDirection', status.tideDirection);

    const getNextLowTideIndex = () => {
        const predictions = status.predictions;
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

    const findClosestDate = () => {

        let datesArray = (status.predictions) ? status.predictions.map((tide) => tide.t) : [];
        if (!Array.isArray(datesArray) || datesArray.length === 0) {
            //return null; // Return null for an empty or non-array input
            if (Object.keys(data[0]).length === 0) {
                const predictions = initializeData('tides', defaultTides)[0].predictions;
                datesArray = predictions.map((tide) => tide.t)
            } else {
                datesArray = data[0].predictions.map((tide) => tide.t)
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

    // eslint-disable-next-line
    const narrowDisplay = <React.Fragment></React.Fragment>;

    const tideDisplay = () => {
        if (status.updated) {
            let predictions = [];
            if (Object.keys(data[0]).length === 0) {
                predictions = initializeData('tides', defaultTides)[0].predictions;
            } else {
                predictions = data[0].predictions;
            }
            //const tideTable = status.predictions.map((tide) => <div key={getKey('tide')} className='flexContainer'>
            const tideTable = predictions.map((tide) => <div key={getKey('tide')} className='flexContainer'>
                <div className={`flex3ColumnRight p-10 r-10-lft ${(findClosestDate()[1] === tide.t) ? 'bg-green' : (tide.type === 'L') ? 'bg-neogreen' : 'bg-tinted'} mb-1`}>
                    <div className='pr-10-percent'>
                        {getTideHeight(tide)}
                    </div>
                </div>
                <div className={`flex3Column p-10 ${(findClosestDate()[1] === tide.t) ? 'bg-green' : (tide.type === 'L') ? 'bg-neogreen' : 'bg-tinted'} mb-1`}>
                    <div>{getTide(tide)}</div>
                </div>
                <div className={`flex3ColumnRight p-10 r-10-rt ${(findClosestDate()[1] === tide.t) ? 'bg-green' : (tide.type === 'L') ? 'bg-neogreen' : 'bg-tinted'} mb-1`}>
                    <div className='pr-50-percent'>
                        <div>{getTideTime(tide)}</div>
                    </div>
                </div>
            </div>
            );
            return tideTable;
        }
        return
    }

    const starDisplay = <React.Fragment></React.Fragment>

    const getTideDetails = () => {

        return <div className='bold'>
            <div className='p-10'>
                {getCurrentTide.toLocaleUpperCase()}
            </div>
            <div className='p-10'>
                <span>{getClosestValue()[0]}</span> ft.
            </div>
        </div>

    }

    const getHeight = () => {
        const height = getClosestValue()[0];
        localStorage.setItem('height', height);
        return <div className=''>
            <div className='bold pb-10 mt--10'>{/*levelDisplay*/}{getCurrentTide}</div>
            <div className='bold color-white'>{height} ft</div>
        </div>
    }

    // eslint-disable-next-line
    const tideError = () => <React.Fragment>
        {status.nextPhase} tide after midnight, tomorrows tide info will update in {24 - time[0].hours} hrs
    </React.Fragment>

    const tideClasses = () => {
        if (display === 'star') {
            return ''
        } else {
            return 'white'
        }
    }

    const getTideDisplay = () => {

        let datesArray = (status.predictions) ? status.predictions.map((tide) => tide.t) : [];
        let predictions = [];
        if (!Array.isArray(datesArray) || datesArray.length === 0) {
            //return null; // Return null for an empty or non-array input
            if (Object.keys(data[0]).length === 0) {
                predictions = initializeData('tides', defaultTides)[0].predictions;
                datesArray = predictions.map((tide) => tide.t)
            } else {
                predictions = data[0].predictions;
                datesArray = predictions.map((tide) => tide.t)
            }
        }

        const nextTideIndex = findClosestDate()[0] + 1;
        const now = new Date();
        const tide = (predictions) ? predictions[nextTideIndex] : 'OOPS!';
        const date = datesArray[nextTideIndex];
        const currentDate = new Date(date);
        const timeDifference = Math.abs(currentDate - now);
        const nextTide = (predictions) ? getTide(tide) : 'OOPS!';
        const nextTideTime = (predictions) ? getTideTime(tide) : 'OOPS!';
        const nextTideHeight = (predictions) ? getTideHeight(tide) : 'OOPS!';
        const millisecondsToTime = (ms) => {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor(ms / (1000 * 60 * 60));
            return { hours, minutes, seconds };
        }
        const { hours, minutes } = millisecondsToTime(timeDifference);
        const untilNextTide = (predictions) ? `${hours} hours and ${minutes} minutes` : 'OOPS!';

        return <div className={tideClasses()}>
            {(display === 'star')
                ? <div>
                    <div className='pb-10 pt-25 mt--94'>{getTideDirection()}</div>
                    <div className='pt-10'>{getHeight()}</div>
                </div>
                : (display !== 'narrow')
                    ? <div className='containerDetail mb-10'>
                        {(status.nextTideIndex === -1) ? getHeight() : getTideDetails()}
                    </div>
                    : <div></div>
            }
            {(display === 'star' || display === 'narrow')
                ? <div></div>
                : <div>
                    <div className=''>{getTideDirection()}</div>
                    <div className='mt-10 p-10'>
                        {nextTideHeight} {nextTide} tide at {nextTideTime}
                    </div>
                    <div className='p-10'>
                        in {untilNextTide}
                    </div>
                </div>
            }
            {(display === 'narrow')
                ? narrowDisplay
                : (display === 'star')
                    ? starDisplay
                    : <div className='mt-10 p-10 r-10 bg-tinted'>
                        {tideDisplay()}
                    </div>
            }

        </div>;
    }

    const percent = 'twentyfivePercent mt--70 mb--70';

    // eslint-disable-next-line
    const loading = () => <div className={percent}>
        <Loader isMotionOn={isMotionOn} />
    </div>;

    setLocalTideDirection();

    return <div>
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
                        icon={tide}
                    />
                </div>
                : null
        }
        {
            (tideCollapse)
                ? null
                : getTideDisplay()
        }
    </div>

}

export default Tide;

/*   sample url data
{
    'metadata': {
        'id':'8454000',
        'name':'Providence',
        'lat':'41.8071',
        'lon':'-71.4012'
    }, 
    'data': [
        {
            't':'2013-01-01 10:00', 
            'v':'0.072', 
            's':'0.003', 
            'f':'0,0,0,0', 
            'q':'v'
        },
        {
            't':'2013-01-01 10:06', 
            'v':'0.095', 
            's':'0.003', 
            'f':'0,0,0,0', 
            'q':'v'
        },
        {
            't':'2013-01-01 10:12', 
            'v':'0.115', 
            's':'0.003', 
            'f':'0,0,0,0', 
            'q':'v'
        },
        {
            't':'2013-01-01 10:18', 
            'v':'0.138', 
            's':'0.004', 
            'f':'0,0,0,0', 
            'q':'v'
        },
        {
            't':'2013-01-01 10:24', 
            'v':'0.167', 
            's':'0.004', 
            'f':'0,0,0,0', 
            'q':'v'
        }
    ]
}
*/

/* Sample temp data
metadata':{
    'id':'8454000',
    'name':'Providence',
    'lat':'41.8071',
    'lon':'-71.4012'
}, 
'data': [
    {
        't':'2013-08-08 15:00', 
        'v':'72.5', 
        'f':'0,0,0'
    },
    {
        't':'2013-08-08 15:06', 
        'v':'72.5', 
        'f':'0,0,0'
    }
]
}

https://tidesandcurrents.noaa.gov/api/datagetter?
begin_date=20200520%2018:46&
end_date=20200520%2018:46&
station=9410230&
product=water_level&
datum=mllw&
units=english&
time_zone=gmt&
application=web_services&
format=json

https://tidesandcurrents.noaa.gov/api/datagetter?
begin_date=20200520%2018:24&
end_date=20200520%2018:24&
station=9410230&
product=water_level&
datum=mllw&
units=english&
time_zone=gmt&
application=web_services&
format=json

{
    'metadata':{
        'id':'9410230',
        'name':'La Jolla',
        'lat':'32.8669',
        'lon':'-117.2571'
    }, 
    'data': [
        {
            't':'2020-05-20 18:24', 
            'v':'2.494', 
            's':'0.459', 
            'f':'0,0,0,0', 
            'q':'p'
        }
    ]
}
*/