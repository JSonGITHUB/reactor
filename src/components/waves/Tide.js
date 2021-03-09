import React, {useState, useEffect} from 'react';
import Loader from '../utils/Loader.js';
//import tide from '../../assets/images/tide.png'
import arrowDown from '../../assets/images/ArrowDown.png';
import arrowUp from '../../assets/images/ArrowUp.png';
//import config from '../../apis/config';
import useOceanData from './useOceanData.js';
import useCurrentTime from './useCurrentTime.js';

const Tide = ({setTide, display, isMotionOn}) => {
    
    //const KEY = 'Client-ID '+config.unsplashAPI_KEY;
    //const api = config.tideAPI_BASE_URL;
    const [ time ] = useCurrentTime(null);
    //const uriMLL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${time.startTime}&end_date=${time.endTime}&station=9410230&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${time.startTime}&end_date=${time.endTime}&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    const uriMLL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${time.startTime}&end_date=${time.endTime}&datum=MLLW&station=9410230&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
    const [data, getData] = useOceanData('tides', uriMLL);
    const [tideNow, getTideNow] = useOceanData('tide', tideNowLink);
    
    const [status, setStatus] = useState({
        tide: '',
        tideDirection: localStorage.tideDirection || "?",
        height: null
    })
    const getCurrentWaterLevel = () => {
        if (tideNow.data !== undefined) { 
            const waterLevel = Number(tideNow.data[tideNow.data.length - 1].v).toFixed(1);
            //console.log(`getCurrentWaterLevel => waterLevel: ${waterLevel}`)
            return waterLevel;
        }
    }
    const getCurrentTide = () => {
        const waterLevel = getCurrentWaterLevel();
        const tide = (waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium";
        //console.log(`getCurrentTide => tide: ${tide}`)
        return tide;
    }
    useEffect(() => {
        let mounted = true;
        if ((tideNow.data !== undefined) && mounted === true) {
            const tide = getCurrentTide();
            //console.log(`tideNowData => \nurl: ${tideNowLink}\nstartTime: ${time.startTime}\nendTime: ${time.endTime}`)
            //console.log(`tideData => data: ${JSON.stringify(data, null, 2)}`)
            setTide(tide);
        }
        return () => mounted = false;
    },[]);
    useEffect(() => {
        let mounted = true;
        if ((data.predictions !== undefined) && mounted) {
            const getTideHour = (tide) => Number(tide.t.split(" ")[1].split(":")[0]);
            const getTideMinutes = (tide) => Number(tide.t.split(" ")[1].split(":")[1]);const getTideTime = (tide) => `${getTideHour(tide)}:${getTideMinutes(tide)}`;
            const getTideHeight = (tide) => Number(tide.v);
            const getTide = (tide) => tide.type;
            //console.log(`Tide - getDirection => \nurl: ${uriMLL}\nendTime: ${time.endTime}\ndata.length: ${data.predictions.length}\ndata: ${JSON.stringify(data, null, 2)}`)
            const hours = data.predictions.map((tide) => getTideHour(tide));
            const minutes = data.predictions.map((tide) => getTideMinutes(tide));
            const times = data.predictions.map((tide) => getTideTime(tide));
            const heights = data.predictions.map((tide) => getTideHeight(tide));
            const tides = data.predictions.map((tide) => getTide(tide));
            const checkTide = (hour) => {
                if (hour >= time.hours) {
                    //console.log(`checkTide =>\nhours: ${hours}\nhour: ${hour}\ncurrent time.hour: ${time.hours}`)
                    if (hour === time.hours) {
                        if (minutes > time.minutes) {
                            return true;
                        }
                    } else if (hour > time.hours) {
                        return true;
                    }
                };
                return false;
            }
            //const nextTideIndex = hours.findIndex(checkTide);
            const nextTideIndex = hours.findIndex(checkTide);
            const nextIndexExtra = () => ((hours[nextTideIndex-1] === time.hours) && (minutes[nextTideIndex-1] > time.minutes)) ? 1 : 0;
            const getNextIndex = () => nextTideIndex + nextIndexExtra();
            const pastLastTide = Number(time.hours-hours[getNextIndex()-1]);
            const untilNextTide = Number(hours[getNextIndex()]-time.hours);
            // eslint-disable-next-line
            const untilNextTideMinutes = Number(minutes[getNextIndex()]-time.minutes);
            const lessThanHour = (untilNextTide === 0) ? true : false;
            const untilTide = () => {
                const pastTime = (untilNextTideMinutes < 0) ? (untilNextTideMinutes+60) : untilNextTideMinutes;
                //console.log(`untilTide => \npastTime: ${pastTime}\nuntilNextTideMinutes: ${untilNextTideMinutes}\nuntilNextTide: ${untilNextTide}`)
                const time = (lessThanHour) ? (String(pastTime) + 'min') : ((untilNextTideMinutes < 0) ? (untilNextTide-1) : untilNextTide) + 'hr ' + String(pastTime) + 'min';
                const timeDisplay = time;
                return timeDisplay;
            }
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
            const convertTide = (tide) => (tide === 'L' || 'low') ? 'low' : 'high';
            const currentTide = getCurrentTide();
            //console.log(`CURRENT ${currentTide} \nheights: ${heights}\nlastHeight: ${lastHeight}\nnextHeight: ${nextHeight}\nHOUR: ${time.hours} \nTIMES: ${hours}\n next ${nextTide} \ntide in ${untilNextTide} hours\n previous ${lastTide} tide was ${pastLastTide} hours ago tideMinutes: ${time.minutes}`);
            setStatus(prevState => ({
                ...prevState,
                tide: currentTide,
                tideDirection: (nextTide === 'L') ? "DOWN" : "UP",
                previousTide: lastHeight,
                nextTide: nextHeight,
                nextPhase: convertTide(nextTide),
                nextTime: nextTime,
                untilNextTide: untilTide(),
                nextTideIndex: getNextIndex()
            }))
        }
        return () => mounted = false;
    },[data]);
    const previousTide = () => (localStorage.getItem("tide")) ? Number(localStorage.getItem("tide")) : 0;
    // eslint-disable-next-line
    const notEqual = () => (Number(previousTide()) !== Number(status.height)) ? true : false;
    // eslint-disable-next-line
    const greaterThan = () => (Number(previousTide()) > Number(status.height)) ? true : false;
    const getDownArrow = () => {
        localStorage.setItem("tideDirection", "DOWN")
        return <img className='arrows mb--2' src={arrowDown} alt='tide direction down' />
    }
    const getUpArrow = () => { 
        localStorage.setItem("tideDirection", "UP")
        return <img className='arrows mb--2' src={arrowUp}  alt='tide direction up' />
    }
    const getTideDirection = () => (status.tideDirection === "DOWN") ? getDownArrow() : getUpArrow();
    //getTideDirection = () => (notEqual() && greaterThan()) ? "DOWN" : status.tideDirection;
    const setLocalTide = () => localStorage.setItem("tide", status.tide);
    const setLocalTideDirection = () => localStorage.setItem("tideDirection", status.tideDirection);
    // eslint-disable-next-line
    const fixHours = () => (time.hours>12) ? Number(time.hours - 12) : time.hours;
    const narrowDisplay = <div></div>;
    const wideDisplay = <div>from: 
                            <span className='bold'>{(status.previousTide) ? status.previousTide.toFixed(1) : ''}' </span>
                            to: 
                            <span className='bold'>{(status.nextTide) ? status.nextTide.toFixed(1) : ''}'</span><br/>
                            <span className='bold'>{status.nextPhase} in {status.untilNextTide}</span><br/>
                            at: <span className='bold'>{status.nextTime}</span>
                        </div>
    const starDisplay = <div></div>
    const getTideDetails = () => {
        return <div className='greet pt-10'>
                    <div className='bold'>{String(status.tide).toUpperCase()} tide</div>
                    <div>
                        <span className='bold'>{getCurrentWaterLevel()}</span> ft.
                    </div>
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
                    <div>
                        <span className='bold'>{getCurrentWaterLevel()}</span> ft.
                    </div>
                </div>
    }
    const tideError = () => <div>
            {status.nextPhase} tide after midnight, tomorrows tide info will update in {24-time.hours} hrs
        </div> 
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
    return <div>{getTideDisplay()}</div>
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
