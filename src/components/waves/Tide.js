import React, {useState, useEffect} from 'react';
import Loader from '../utils/Loader.js';
//import tide from '../../assets/images/tide.png'
import arrowDown from '../../assets/images/ArrowDown.png';
import arrowUp from '../../assets/images/ArrowUp.png';
//import config from '../../apis/config';

const Tide = ({tideNow, data, time, setTide, display, isMotionOn}) => {
    
    //const KEY = 'Client-ID '+config.unsplashAPI_KEY;
    //const api = config.tideAPI_BASE_URL;
    //const uriMLL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410230&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    
    const [status, setStatus] = useState({
        tide: '',
        tideDirection: localStorage.getItem('tideDirection') || "?",
        height: null,
        updated: false
    })
    const getCurrentWaterLevel = () => {
        if (tideNow.data !== undefined) { 
            const waterLevel = Number(tideNow.data[tideNow.data.length - 1].v).toFixed(1);
            //console.log(`Tide => getCurrentWaterLevel => waterLevel: ${waterLevel}`)
            return waterLevel;
        }
    }
    const getCurrentTide = (getCurrentWaterLevel() > 3) ? "high" : (getCurrentWaterLevel() < 2) ? "low" : "medium";
    useEffect(() => {
        let mounted = true;
        if ((tideNow.data !== undefined) && mounted === true) {
            const tide = getCurrentTide;
            //console.log(`tideNowData => \nurl: ${tideNowLink}\nstartTime: ${startTime}\nendTime: ${endTime}`)
            //console.log(`tideData => data: ${JSON.stringify(data, null, 2)}`)
            //setTide(tide);
        }
        return () => mounted = false;
    },[tideNow.data, getCurrentTide, setTide]);
    useEffect(() => {
        let mounted = true;
        const predictions = data.predictions;
        if ((predictions !== undefined && status.updated !== true) && mounted) {
            localStorage.setItem('tides', JSON.stringify(data));
            const getTideHour = (tide) => Number(tide.t.split(" ")[1].split(":")[0]);
            const getTideMinutes = (tide) => Number(tide.t.split(" ")[1].split(":")[1]);const getTideTime = (tide) => `${getTideHour(tide)}:${getTideMinutes(tide)}`;
            const getTideHeight = (tide) => Number(tide.v);
            const getTide = (tide) => tide.type;
            //console.log(`Tide - getDirection => \nurl: ${uriMLL}\nendTime: ${endTime}\ndata.length: ${predictions.length}\ndata: ${JSON.stringify(data, null, 2)}`)
            const hours = predictions.map((tide) => getTideHour(tide));
            const minutes = predictions.map((tide) => getTideMinutes(tide));
            const times = predictions.map((tide) => getTideTime(tide));
            const heights = predictions.map((tide) => getTideHeight(tide));
            const tides = predictions.map((tide) => getTide(tide));
            const checkTide = (hour) => {
                if (hour >= time[0].hours) {
                    //console.log(`checkTide =>\nhours: ${hours}\nhour: ${hour}\ncurrent time.hour: ${time[0].hours}`)
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
            //const nextTideIndex = hours.findIndex(checkTide);
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
                //console.log(`untilTide => \npastTime: ${pastTime}\nuntilNextTideMinutes: ${untilNextTideMinutes}\nuntilNextTide: ${untilNextTide}`)
                const time = (lessThanHour) ? (String(pastTime) + 'min') : ((untilNextTideMinutes < 0) ? (untilNextTide-1) : untilNextTide) + 'hr ' + String(pastTime) + 'min';
                const timeDisplay = time;
                return timeDisplay;
            }
            // eslint-disable-next-line
            const closerTideIndex = (pastLastTide >= untilNextTide) ? getNextIndex() : (getNextIndex()-1);
            
            const nextTide = tides[getNextIndex()];
            const nextHeight = heights[getNextIndex()];
            const lastHeight = heights[getNextIndex()-1];
            const getNextHour = Number(times[(getNextIndex() === -1) ? (times.length-1) : getNextIndex()].split(':')[0]);
            const nextHour = (getNextHour>12) ? (getNextHour-12) : getNextHour;
            const nextMinutes = (times[(getNextIndex() === -1) ? 1 : getNextIndex()].split(':')[1] < 10) ? `0${times[(getNextIndex() === -1) ? (times.length-1) : getNextIndex()].split(':')[1]}` : times[(getNextIndex() === -1) ? (times.length-1) : getNextIndex()].split(':')[1];
            const nextTime = `${nextHour}:${nextMinutes}`;
            // eslint-disable-next-line
            const lastTide = tides[getNextIndex()-1];
            const convertTide = (tide) => {
                const convertedTide = (tide === 'H') ? 'High' : 'Low';
                return convertedTide;
            };
            //console.log(`CURRENT: ${getCurrentTide}\ngetNextIndex: ${getNextIndex()}\nheights: ${heights}\nlastHeight: ${lastHeight}\nnextHeight: ${nextHeight}\ntime: ${time[0].hours}::${time[0].minutes}\nTIMES: ${hours}\n next ${nextTide} \ntide in ${untilNextTide} hours\n previous ${lastTide} tide was ${pastLastTide} hours ago tideMinutes: ${time[0].minutes}`);
            setStatus(prevState => ({
                ...prevState,
                tide: getCurrentTide,
                tideDirection: (nextTide === 'L') ? "DOWN" : "UP",
                previousTide: lastHeight,
                nextTide: nextHeight,
                nextPhase: convertTide(nextTide),
                nextTime: nextTime,
                untilNextTide: untilTide(),
                nextTideIndex: getNextIndex(),
                updated: true
            }))
        }
        return () => mounted = false;
    },[data, getCurrentTide, status.updated, time]);
    const previousTide = () => (localStorage.getItem('tide')) ? Number(localStorage.getItem('tide')) : 0;
    // eslint-disable-next-line
    const notEqual = () => (Number(previousTide()) !== Number(status.height)) ? true : false;
    // eslint-disable-next-line
    const greaterThan = () => (Number(previousTide()) > Number(status.height)) ? true : false;
    const getDownArrow = () => {
        localStorage.setItem('tideDirection', 'DOWN')
        return <img className='arrows mb--2' src={arrowDown} alt='tide direction down' />
    }
    const getUpArrow = () => { 
        localStorage.setItem('tideDirection', 'UP')
        return <img className='arrows mb--2' src={arrowUp}  alt='tide direction up' />
    }
    const getTideDirection = () => (status.tideDirection === "DOWN") ? getDownArrow() : getUpArrow();
    //getTideDirection = () => (notEqual() && greaterThan()) ? "DOWN" : status.tideDirection;
    // eslint-disable-next-line
    const setLocalTide = () => localStorage.setItem('tide', status.tide);
    const setLocalTideDirection = () => localStorage.setItem('tideDirection', status.tideDirection);
    // eslint-disable-next-line
    const fixHours = () => (time[0].hours>12) ? Number(time[0].hours - 12) : time[0].hours;
    const narrowDisplay = <React.Fragment></React.Fragment>;
    const wideDisplay = <div>
                            from: <span className='bold'>{(status.previousTide) ? status.previousTide.toFixed(1) : ''}' </span>
                            to: <span className='bold'>{(status.nextTide) ? status.nextTide.toFixed(1) : ''}'</span><br/>
                            <span className='bold'>{status.nextPhase} in {status.untilNextTide}</span><br/>
                            at: <span className='bold'>{status.nextTime}</span>
                        </div>
    const starDisplay = <React.Fragment></React.Fragment>
    const getTideDetails = () => {
        return <div className='greet pt-10'>
                    <div className='bold'>{String(status.tide).toUpperCase()} tide</div>
                    <span className='bold'>{getCurrentWaterLevel()}</span> ft.
                    {(display === 'narrow') 
                        ? narrowDisplay 
                        : (display === 'star') 
                            ? starDisplay 
                            : wideDisplay
                    }
                </div>
    }
    const getHeight = () => {
        return <div className='greet pt-10'>
                    <div className='bold'>{String(status.tide).toUpperCase()} tide</div>
                    <div className='bold'>{getCurrentWaterLevel()} ft.</div>
                </div>
    }
    // eslint-disable-next-line
    const tideError = () => <React.Fragment>
            {status.nextPhase} tide after midnight, tomorrows tide info will update in {24-time[0].hours} hrs
        </React.Fragment>
    const tideClasses = () => {
        if (display === 'star') {
            return ''
        } else {
            return 'r-10 m-5 bg-lite white pl-15 pr-15 pt-20 pb-30'
        }
        
    }
    const getTideDisplay = () => <div className={tideClasses()}>
                            <div className='mt-15 mb-5'>{getTideDirection()}</div>
                            {(status.nextTideIndex === -1) ? getHeight() : getTideDetails()}  
                        </div>;

    const percent = 'twentyfivePercent mt--70 mb--70';
    // eslint-disable-next-line
    const loading = () => <div className={percent}>
                        <Loader isMotionOn={isMotionOn}/>
                    </div>;

    
    //console.log(`tide direction: ${status.tideDirection} previous height: ${previousTide()} height: ${status.height} == ${previousTide() === Number(status.height)} \ntide: ${localStorage.getItem('tide')}`)
    //setLocalTide();
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
