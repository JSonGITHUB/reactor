import React, { useState, useEffect } from 'react';
import Loader from '../site/Loader.js';
//import tide from '../../assets/images/tide.png'
import arrowDown from '../../assets/images/ArrowDown.png';
import arrowUp from '../../assets/images/ArrowUp.png';
//import config from '../../apis/config';

const Tide = ({ tideNow, data, time, setTide, display, isMotionOn }) => {

    const getTideHour = (tide) => {
        const originalHour = Number(tide.t.split(" ")[1].split(":")[0]);
        const greaterThan12 = (originalHour > 12) ? true : false;
        const lessThan1 = (originalHour < 1) ? true : false;
        const hour = (greaterThan12) ? (originalHour - 12) : (lessThan1) ? 12 : originalHour;
        console.log(`getTideHour => hour: ${hour}`);
        return hour;
    }
    const getTideMinutes = (tide) => {
        const originalMinutes = Number(tide.t.split(" ")[1].split(":")[1]);
        const lessThan10 = (originalMinutes < 10) ? true : false;
        const minutes = (lessThan10) ? `0${originalMinutes}` : originalMinutes;
        console.log(`getTideMinutes => minutes: ${minutes}`);
        return minutes;
    }
    const getTideTime = (tide) => {
        const originalTime = `${getTideHour(tide)}:${getTideMinutes(tide)}`;
        console.log(`getTideTime => time: ${originalTime}`);
        return originalTime;
    }
    const getTideHeight = (tide) => {
        const originalTide = Number(tide.v);
        console.log(`getTideHeight => tide: ${originalTide.toFixed(1)}`);
        const displayTide = `${originalTide.toFixed(1)}'`
        return displayTide;
    }
    const getTideType = (tide) => {
        const originalType = tide.type;
        const type = (originalType == 'H') ? 'High' : 'Low';
        console.log(`getTideType => type: ${type}`);
        return type;
    }
    const getTide = (tide) => {
        const originalTide = tide.type;
        const type = (originalTide == 'H') ? 'HIGH' : 'LOW';
        console.log(`getTide => tide: ${type}`);
        return type;
    }
    let localTide = Number(JSON.parse(localStorage.getItem("tideData")).data[JSON.parse(localStorage.getItem("tideData")).data.length - 1].v).toFixed(1);
    let localTideTime = Number(JSON.parse(localStorage.getItem("tideData")).data[JSON.parse(localStorage.getItem("tideData")).data.length - 1].t);

    console.log('Tide => tideNow: ', tideNow);
    console.log('Tide => tideNOW!!!: ', localTide);
    console.log('Tide => data: ', data);
    console.log('Tide => display: ', display);
    console.log('Tide => time: ', time[0].year);

    //const KEY = 'Client-ID '+config.unsplashAPI_KEY;
    //const api = config.tideAPI_BASE_URL;
    //const uriMLL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410230&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;

    const [status, setStatus] = useState({
        tide: '',
        tideDirection: localStorage.getItem('tideDirection') || "?",
        height: null,
        updated: false
    });

    const getCurrentWaterLevel = () => {

        if (tideNow.data !== undefined) {

            const waterLevel = Number(tideNow.data[tideNow.data.length - 1].v).toFixed(1);
            const waterLevelTime = Number(tideNow.data[tideNow.data.length - 1].t).toFixed(1);
            localStorage.setItem('height', waterLevel);

            return [waterLevel, waterLevelTime];
        }

        localStorage.setItem('height', localTide);
        localStorage.setItem('heightTime', localTideTime);

        return [localTide, localTideTime];
    }

    const getCurrentTide = (getCurrentWaterLevel()[0] > 4) ? "high" : (getCurrentWaterLevel()[0] < 2) ? "low" : "medium";
    const getCurrentTideTime = getCurrentWaterLevel()[1];

    useEffect(() => {

        let mounted = true;

        if ((tideNow.data !== undefined) && mounted === true) {
            const height = localStorage.getItem('height');
            setTide(getCurrentTide, height);
        }

        return () => mounted = false;

    }, [tideNow.data, getCurrentTide, setTide]);

    useEffect(() => {

        let mounted = true;
        const predictions = data[0].predictions;

        if ((predictions !== undefined && status.updated !== true) && mounted) {

            localStorage.setItem('tides', JSON.stringify(data));
            //console.log(`Tide - getDirection => data: ${JSON.stringify(data, null, 2)}`)
            //const hours = predictions.map((tide) => getTideHour(tide));
            //console.log(`predictions => hours: ${JSON.stringify(hours)}`);
            //const minutes = predictions.map((tide) => getTideMinutes(tide));
            //console.log(`predictions => minutes: ${JSON.stringify(minutes)}`);
            //const times = predictions.map((tide) => getTideTime(tide));
            //console.log(`predictions => times: ${JSON.stringify(times)}`);
            //const heights = predictions.map((tide) => getTideHeight(tide));
            //console.log(`predictions => heights: ${JSON.stringify(heights)}`);
            //const types = predictions.map((tide) => getTideType(tide));
            //console.log(`predictions => types: ${JSON.stringify(types)}`);
            //console.log('tide heights: ', heights);
            //const tides = predictions.map((tide) => getTide(tide));
            //console.log(`predictions => tides: ${JSON.stringify(tides)}`);
            /*
            const checkTide = (hour) => {

                if (hour >= time[0].hours) {
                    if (hour === time[0].hours) {
                        if (minutes > time[0].minutes) {
                            return true;
                        }
                    } else if (hour > time[0].hours) {
                        return true;
                    }
                };
                return false;
            }

            const nextTideIndex = hours.findIndex(checkTide);
            
            const nextIndexExtra = () => ((hours[nextTideIndex-1] === time[0].hours) && (minutes[nextTideIndex-1] > time[0].minutes)) ? 1 : 0;
            const getNextIndex = () => nextTideIndex + nextIndexExtra();
            const pastLastTide = Number(time[0].hours-hours[getNextIndex()-1]);
            const untilNextTide = Number(hours[getNextIndex()]-time[0].hours);

            // eslint-disable-next-line
            const untilNextTideMinutes = Number(minutes[getNextIndex()]-time[0].minutes);
            const lessThanHour = (untilNextTide === 0) ? true : false;
            
            const untilTide = () => {

                const pastTime = (untilNextTideMinutes < 0) ? (untilNextTideMinutes+60) : untilNextTideMinutes;
                const time = (lessThanHour) ? (String(pastTime) + 'min') : ((untilNextTideMinutes < 0) ? (untilNextTide-1) : untilNextTide) + 'hr ' + String(pastTime) + 'min';
                const timeDisplay = time;

                return timeDisplay;

            }
            
            // eslint-disable-next-line
            const closerTideIndex = (pastLastTide >= untilNextTide) ? getNextIndex() : (getNextIndex()-1);
            
            const nextTide = tides[getNextIndex()];
            const nextHeight = heights[getNextIndex()];
            const nextType = types[getNextIndex()];

            const lastHeight = heights[getNextIndex()-1];
            const lastHour = hours[getNextIndex()-1];
            const lastMinute = minutes[getNextIndex()-1];
            const lastType = types[getNextIndex()-1];

            const laterHeight = heights[getNextIndex()+1];
            const laterHour = hours[getNextIndex()+1];
            const laterMinute = minutes[getNextIndex()+1];
            const laterType = types[getNextIndex()+1];

            const getNextHour = Number(times[(getNextIndex() === -1) ? (times.length-1) : getNextIndex()].split(':')[0]);
            const nextHour = (getNextHour>12) ? (getNextHour-12) : (getNextHour<1)?'12':getNextHour;
            const nextMinutes = (times[(getNextIndex() === -1) ? 1 : getNextIndex()].split(':')[1] < 10) ? `0${times[(getNextIndex() === -1) ? (times.length-1) : getNextIndex()].split(':')[1]}` : times[(getNextIndex() === -1) ? (times.length-1) : getNextIndex()].split(':')[1];
            const nextTime = `${nextHour}:${nextMinutes}`;

            // eslint-disable-next-line
            const lastTide = tides[getNextIndex()-1];
            */
            const convertTide = (tide) => {
                const convertedTide = (tide === 'H') ? 'High' : 'Low';
                return convertedTide;
            };

            setStatus(prevState => ({

                ...prevState,
                tide: getCurrentTide,
                //tideDirection: (nextTide === 'L') ? "DOWN" : "UP",
                //previousTide: lastHeight,
                //previousHour: (lastHour>12)?(lastHour-12):(laterHour<1)?'12':laterHour,
                //previousMinute: (lastMinute<10)?(`0${lastMinute}`):lastMinute,
                //previousType: (lastType == 'L')?'LOW':'HIGH',
                //laterTide: laterHeight,
                //laterHour: (laterHour>12)?(laterHour-12):(laterHour<1)?'12':laterHour,
                //laterMinute: (laterMinute<10)?(`0${laterMinute}`):laterMinute, 
                //laterType: (laterType == 'L')?'LOW':'HIGH',        
                //nextTide: nextHeight,
                //nextPhase: convertTide(nextTide),
                //nextTime: nextTime,
                //nextType: (nextType == 'L')?'LOW':'HIGH',
                //untilNextTide: untilTide(),
                //nextTideIndex: getNextIndex(),
                predictions: predictions,
                updated: true

            }))

        }

        return () => mounted = false;

    }, [data, getCurrentTide, status.updated, time]);

    const previousTide = () => (localStorage.getItem('tide')) ? Number(localStorage.getItem('tide')) : 0;

    // eslint-disable-next-line
    const notEqual = () => (Number(previousTide()) !== Number(status.height)) ? true : false;

    // eslint-disable-next-line
    const greaterThan = () => (Number(previousTide()) > Number(status.height)) ? true : false;

    const getDownArrow = () => {

        localStorage.setItem('tideDirection', 'DOWN')

        return <div className='flex2Column bg-white r-10 ht-55 mt--15 w-50 pt-15 pl-10 pr-10 pb-10'>
            <img className='arrows mt-5 mb--2' src={arrowDown} alt='tide direction down' />
        </div>
    }

    const getUpArrow = () => {

        localStorage.setItem('tideDirection', 'UP')

        return <div className='flex2Column bg-white r-10 ht-55 mt--15 w-50 pt-15 pl-10 pr-10 pb-10'>
            <img className='arrows mt-5 mb--2' src={arrowUp} alt='tide direction up' />
        </div>

    }

    const getTideDirection = () => (status.tideDirection === "DOWN") ? getDownArrow() : getUpArrow();

    // eslint-disable-next-line
    const setLocalTide = () => localStorage.setItem('tide', status.tide);
    const setLocalTideDirection = () => localStorage.setItem('tideDirection', status.tideDirection);

    const findClosestDate = () => {

        const datesArray = status.predictions.map((tide) => tide.t)
        if (!Array.isArray(datesArray) || datesArray.length === 0) {
            return null; // Return null for an empty or non-array input
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
    const fixHours = () => (time[0].hours > 12) ? Number(time[0].hours - 12) : time[0].hours;
    const narrowDisplay = <React.Fragment></React.Fragment>;

    const tideDisplay = () => {

        console.log(`tideDisplay => ${JSON.stringify(status, null, 2)}`);

        if (status.updated) {

            const tideTable = status.predictions.map((tide) => <div className='flexContainer'>
                <div className={`flex3ColumnRight p-10 r-10-lft ${(findClosestDate()[1] === tide.t) ? 'bg-green' : 'bg-tinted'} mb-1`}>
                    <div className='pr-10-percent'>
                        {getTideHeight(tide)}
                    </div>
                </div>
                <div className={`flex3Column p-10 ${(findClosestDate()[1] === tide.t) ? 'bg-green' : 'bg-tinted'} mb-1`}>
                    <div>{getTide(tide)}</div>
                </div>
                <div className={`flex3ColumnRight p-10 r-10-rt ${(findClosestDate()[1] === tide.t) ? 'bg-green' : 'bg-tinted'} mb-1`}>
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


    const wideDisplay = <div className='flexContainer mt-20 p-10 r-10 bg-tinted'>
        <div className='flex3Column contentRight'>
            <div className='p-10 r-10-lft bg-tinted mb-1'>
                {`${(status.previousTide) ? status.previousTide.toFixed(1) : ''}'`}
            </div>
            <div className='p-10 r-10-lft bg-tinted mb-1'>
                {(status.nextTide) ? status.nextTide.toFixed(1) : ''}'
            </div>
            <div className='p-10 r-10-lft bg-tinted'>
                {`${(status.laterTide) ? status.laterTide.toFixed(1) : ''}'`}
            </div>
        </div>
        <div className='flex3Column'>
            <div className='p-10 bg-tinted mb-1'>
                {status.previousType}
            </div>
            <div className='p-10 bg-tinted mb-1'>
                {status.nextType}
            </div>
            <div className='p-10 bg-tinted'>
                {status.laterType}
            </div>
        </div>
        <div className='flex3Column contentRight'>
            <div className='p-10 r-10-rt bg-tinted mb-1'><span className='mr-20'>{status.previousHour}:{status.previousMinute}</span></div>
            <div className='p-10 r-10-rt bg-tinted mb-1'><span className='mr-20'>{status.nextTime}</span></div>
            <div className='p-10 r-10-rt bg-tinted'><span className='mr-20'>{status.laterHour}:{status.laterMinute}</span></div>
        </div>
    </div>

    const starDisplay = <React.Fragment></React.Fragment>

    const getTideDetails = () => {

        return <div className='bold'>
            <div className='p-10'>
                {(getCurrentWaterLevel()[0] < 2) ? 'LOW' : 'HIGH'}
            </div>
            <div className='p-10'>
                <span>{getCurrentWaterLevel()[0]}</span> ft.
            </div>
        </div>

    }

    const getHeight = () => {

        const height = getCurrentWaterLevel()[0];
        localStorage.setItem('height', height);
        const level = String(status.tide).toUpperCase();
        const levelDisplay = (display=='star' && level=='MEDIUM')?'MID':level;

        return <div className='pt-5'>
            <div className='bold pt-5 pb-10 mt--2'>{levelDisplay}</div>
            {(display=='star')?null:<div className='bold color-white'>{height} ft</div>}
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

        const datesArray = (status.predictions) ? status.predictions.map((tide) => tide.t) : [];

        if (!Array.isArray(datesArray) || datesArray.length === 0) {
            return null; // Return null for an empty or non-array input
        }

        const nextTideIndex = findClosestDate()[0]+1;

        const now = new Date();
        const tide = (status.predictions) ? status.predictions[nextTideIndex] : 'OOPS!';

        const date = datesArray[nextTideIndex];
        const currentDate = new Date(date);
        const timeDifference = Math.abs(currentDate - now);
        const nextTide = (status.predictions) ? getTide(tide) : 'OOPS!';
        const nextTideTime = (status.predictions) ? getTideTime(tide) : 'OOPS!';
        const nextTideHeight = (status.predictions) ? getTideHeight(tide) : 'OOPS!';

        function millisecondsToTime(ms) {
            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor(ms / (1000 * 60 * 60));
        
            return { hours, minutes, seconds };
        }
        
        const { hours, minutes, seconds } = millisecondsToTime(timeDifference);
        const untilNextTide = (status.predictions) ? `${hours} hours and ${minutes} minutes` : 'OOPS!';

        return <div className={tideClasses()}>
                    {(display === 'star') 
                    ? <div>
                            <div className='pb-10 pt-25 mt--94'>{getTideDirection()}</div>
                            <div className='pt-10'>{getHeight()}</div>
                        </div>
                    : <div className='p-10'>
                            {(status.nextTideIndex === -1) ? getHeight() : getTideDetails()}
                        </div>
                    }
                    {(display === 'star')
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

    return getTideDisplay()
}

export default Tide;

/*   sample url data
{
    "metadata": {
        "id":"8454000",
        "name":"Providence",
        "lat":"41.8071",
        "lon":"-71.4012"
    }, 
    "data": [
        {
            "t":"2013-01-01 10:00", 
            "v":"0.072", 
            "s":"0.003", 
            "f":"0,0,0,0", 
            "q":"v"
        },
        {
            "t":"2013-01-01 10:06", 
            "v":"0.095", 
            "s":"0.003", 
            "f":"0,0,0,0", 
            "q":"v"
        },
        {
            "t":"2013-01-01 10:12", 
            "v":"0.115", 
            "s":"0.003", 
            "f":"0,0,0,0", 
            "q":"v"
        },
        {
            "t":"2013-01-01 10:18", 
            "v":"0.138", 
            "s":"0.004", 
            "f":"0,0,0,0", 
            "q":"v"
        },
        {
            "t":"2013-01-01 10:24", 
            "v":"0.167", 
            "s":"0.004", 
            "f":"0,0,0,0", 
            "q":"v"
        }
    ]
}
*/

/* Sample temp data
metadata":{
    "id":"8454000",
    "name":"Providence",
    "lat":"41.8071",
    "lon":"-71.4012"
}, 
"data": [
    {
        "t":"2013-08-08 15:00", 
        "v":"72.5", 
        "f":"0,0,0"
    },
    {
        "t":"2013-08-08 15:06", 
        "v":"72.5", 
        "f":"0,0,0"
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
    "metadata":{
        "id":"9410230",
        "name":"La Jolla",
        "lat":"32.8669",
        "lon":"-117.2571"
    }, 
    "data": [
        {
            "t":"2020-05-20 18:24", 
            "v":"2.494", 
            "s":"0.459", 
            "f":"0,0,0,0", 
            "q":"p"
        }
    ]
}
*/
