import React, {useState, useEffect} from 'react';
import Loader from '../utils/Loader.js';
//import tide from '../../assets/images/tide.png'
import arrowDown from '../../assets/images/ArrowDown.png';
import arrowUp from '../../assets/images/ArrowUp.png';
//import config from '../../apis/config';
import axios from 'axios';

const Tide = ({setTide, display, isMotionOn}) => {
    
    //const KEY = 'Client-ID '+config.unsplashAPI_KEY;
    //const api = config.tideAPI_BASE_URL;
    
    const [status, setStatus] = useState({
        tide: null,
        tideDirection: localStorage.tideDirection || "?",
        height: null
    })

    const getCurrentTime = () => {
        let currentTime = new Date();
        const year = currentTime.getFullYear();
        const currentMonth = currentTime.getMonth()+1;
        const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
        const currentDate = currentTime.getDate();
        const date = (currentDate<10) ? `0${currentDate}` : currentDate;
        const currentHour = currentTime.getHours();
        const hours = (currentHour<10) ? `0${currentHour}` : currentHour;
        const startHour = ((currentHour-1)<10) ? `0${(currentHour-1)}` : (currentHour-1);
        const currentMinutes = currentTime.getMinutes();
        const minutes = (currentMinutes<10) ? `0${currentMinutes}` : currentMinutes;
        const getEndTime = `${year}${month}${date}%20${hours}:${minutes}`;
        const getStartTime = `${year}${month}${date}%20${startHour}:00`;
        currentTime = `${year}${month}${date}%20${hours}:${minutes}`;
        return (
            {   
                hours,
                minutes,
                date,
                month,
                year,
                currentTime,
                startTime: getStartTime,
                endTime: getEndTime
            }
        )
    }
    useEffect(() => {

        let ignore = false;

        const tideData = async () => {

            console.log(`tideData =>`)
            const proxyurl = "https://cors-anywhere.herokuapp.com/";
            const uriMLLW = `https://api.tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime().startTime}&end_date=${getCurrentTime().endTime}&station=9410230&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`; 

            const uriMLL = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${getCurrentTime().startTime}&end_date=${getCurrentTime().endTime}&station=9410230&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
            const uriMHHW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime().currentTime}&end_date=${getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MHHW&units=english&time_zone=lst_ldt&application=web_services&format=json`;
            const uriMHW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime().currentTime}&end_date=${getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MHW&units=english&time_zone=lst_ldt&application=web_services&format=json`;
            const uriMTL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime().currentTime}&end_date=${getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MTL&units=english&time_zone=lst_ldt&application=web_services&format=json`;
            const uriMSL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime().currentTime}&end_date=${getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MSL&units=english&time_zone=lst_ldt&application=web_services&format=json`;
            const uriNAVD = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime().currentTime}&end_date=${getCurrentTime().currentTime}&station=9410230&product=water_level&datum=NAVD&units=english&time_zone=lst_ldt&application=web_services&format=json`;
            const uriSTND = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime().currentTime}&end_date=${getCurrentTime().currentTime}&station=9410230&product=water_level&datum=STND&units=english&time_zone=lst_ldt&application=web_services&format=json`;
            const uriLaJolla = `https://tidesandcurrents.noaa.gov/api/datagetter?product=predictions&amp;application=NOS.COOPS.TAC.WL&amp;begin_date=20201020&amp;end_date=20201021&amp;datum=MLLW&amp;station=9410230&amp;time_zone=lst_ldt&amp;units=english&amp;interval=hilo&amp;format=json`;
            const uri = proxyurl + uriMLLW;
            const { data } = await axios.get(uriMLL, {
                params: {
                    origin: '*',
                    format: 'json',
                    mode:'cors'
                }
            });
            //console.log(`tideData => data: ${JSON.stringify(data, null, 2)}`)
            
            const waterLevel = Number(data.data[data.data.length - 1].v).toFixed(1);
            //console.log(`TIDE => waterLevel: ${waterLevel}`)
            setTide(waterLevel);
            setStatus(prevState => ({
                ...prevState,
                station: data.metadata.name,
                tide:(waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium",
                height: waterLevel
            }));
        };
        if (!ignore) tideData();
       return () => { ignore = true; }
    },[]);
    useEffect(() => {
        let ignore = false;
        
        const tideDaily = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&amp;application=NOS.COOPS.TAC.WL&amp;begin_date=${getCurrentTime().year}${getCurrentTime().month}${getCurrentTime().date}&amp;end_date=${getCurrentTime().year}${getCurrentTime().month}${getCurrentTime().date}&amp;datum=MLLW&amp;station=9410230&amp;time_zone=lst_ldt&amp;units=english&amp;interval=hilo&amp;format=json`;
        const uri = tideDaily;
        //console.log(`Tide   - getStartTime: ${getCurrentTime().startTime} => getEndTime: ${getCurrentTime().endTime}`)
        
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const getTideHour = (tide) => Number(tide.t.split(" ")[1].split(":")[0]);
        const getTideMinutes = (tide) => Number(tide.t.split(" ")[1].split(":")[1]);const getTideTime = (tide) => `${getTideHour(tide)}:${getTideMinutes(tide)}`;
        const getTideHeight = (tide) => Number(tide.v);
        const getTide = (tide) => tide.type;
        
        const getDirection = async () => {

            const { data } = await axios.get(uri, {
                params: {
                    origin: '*',
                    format: 'json',
                    mode:'cors'
                }
            });

            //console.log(`Tide - getDirection => data: ${JSON.stringify(data, null, 2)}`)
            const hours = data.predictions.map((tide) => getTideHour(tide));
            const minutes = data.predictions.map((tide) => getTideMinutes(tide));
            const times = data.predictions.map((tide) => getTideTime(tide));
            const heights = data.predictions.map((tide) => getTideHeight(tide));
            const tides = data.predictions.map((tide) => getTide(tide));
            const checkTide = (hour) => hour >= getCurrentTime().hours;
            const nextTideIndex = hours.findIndex(checkTide);
            const pastLastTide = Number(getCurrentTime().hours-hours[nextTideIndex-1]);
            const untilNextTide = Number(hours[nextTideIndex]-getCurrentTime().hours);
            // eslint-disable-next-line
            const untilNextTideMinutes = Number(minutes[nextTideIndex]-getCurrentTime().minutes);
            const lessThanHour = (untilNextTide === 0) ? true : false;
            const untilTide = () => {
                const pastTime = (untilNextTideMinutes < 0) ? (-1*untilNextTideMinutes) : untilNextTideMinutes;
                console.log(`untilTide => \nuntilNextTideMinutes: ${untilNextTideMinutes}\nuntilNextTide: ${untilNextTide}`)
                const time = (lessThanHour) ? pastTime : untilNextTide
                return time;
                 
            }
            const closerTideIndex = (pastLastTide >= untilNextTide) ? nextTideIndex : (nextTideIndex-1);
            const nextTide = tides[nextTideIndex];
            const nextHeight = heights[nextTideIndex];
            const lastHeight = heights[nextTideIndex-1];
            const nextHour = (Number(times[nextTideIndex].split(':')[0])>12) ? (Number(times[nextTideIndex].split(':')[0])-12) : Number(times[nextTideIndex].split(':')[0]);
            const nextMinutes = (times[nextTideIndex].split(':')[1] < 10) ? `0${times[nextTideIndex].split(':')[1]}` : times[nextTideIndex].split(':')[1];
            const nextTime = `${nextHour}:${nextMinutes}`;
            // eslint-disable-next-line
            const lastTide = tides[nextTideIndex-1];
            const convertTide = (tide) => (tide === 'L') ? 'low' : 'high';
            const getCurrentTide = convertTide(tides[closerTideIndex]);
            const currentTide = ((pastLastTide !== untilNextTide)) ? getCurrentTide : 'medium';
            console.log(`CURRENT ${currentTide} HOUR: ${getCurrentTime().hours} TIMES: ${hours}\n next ${nextTide} tide in ${untilNextTide} hours\n previous ${lastTide} tide was ${pastLastTide} hours ago tideMinutes: ${getCurrentTime().minutes}`);
                            
            setStatus(prevState => ({
                ...prevState,
                tide: currentTide,
                tideDirection: (nextTide === 'L') ? "DOWN" : "UP",
                previousTide: lastHeight,
                nextTide: nextHeight,
                nextPhase: convertTide(nextTide),
                nextTime: nextTime,
                untilNextTide: untilTide()
            }))
        };
        getDirection();
    },[]);
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
    const setLocalTide = () => localStorage.setItem("tide", Number(status.height));
    const setLocalTideDirection = () => localStorage.setItem("tideDirection", status.tideDirection);
    // eslint-disable-next-line
    const fixHours = () => (getCurrentTime().hours>12) ? Number(getCurrentTime().hours - 12) : getCurrentTime().hours;

    const getCurrentTide = () => <div className="r-10 m-5 p-10 bg-lite white">
                            <div>{getTideDirection()}</div>
                            <div>{status.height} <span className="greet"> ft. </span></div>
                            <div className='description pt-10'>
                                from: <span className='greet bold'>{(status.previousTide) ? status.previousTide.toFixed(1) : ''}' </span>
                                {(display === 'narrow') ? <br/> : ''}to: <span className='greet bold'>{(status.nextTide) ? status.nextTide.toFixed(1) : ''}'</span><br/>
                                <span className='greet bold'>{status.nextPhase} in {status.untilNextTide} {(display === 'narrow') ? 'hr' : 'hour'}{status.untilNextTide === 1 ? '' : 's'} </span><br/>
                                at: <span className='greet bold'>{status.nextTime}</span>
                            </div>
                        </div>;

    const percent = 'twentyfivePercent mt--70 mb--70';
    // eslint-disable-next-line
    const loading = () => <div className={percent}>
                        <Loader isMotionOn={isMotionOn}/>
                    </div>;

    
    //console.log(`tide direction: ${status.tideDirection} previous height: ${previousTide()} height: ${status.height} == ${previousTide() === Number(status.height)}`)
    setLocalTide();
    setLocalTideDirection();
    return <div>{getCurrentTide()}</div>
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
