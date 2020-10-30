import React from 'react';
import Loader from '../utils/Loader.js';
//import tide from '../../assets/images/tide.png'
import arrowDown from '../../assets/images/ArrowDown.png';
import arrowUp from '../../assets/images/ArrowUp.png';

class Tide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tide: null,
            tideDirection: localStorage.tideDirection || "?",
            height: null
        }
    }
    getCurrentTime = () => {
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
    getTideData = () => {
        console.log(`getTideData ->`);
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        
        console.log(`Tide   - getStartTime: ${this.getCurrentTime().startTime} => getEndTime: ${this.getCurrentTime().endTime}`)
        const uriMLLW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().startTime}&end_date=${this.getCurrentTime().endTime}&station=9410230&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMHHW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MHHW&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMHW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MHW&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMTL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MTL&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMSL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_level&datum=MSL&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriNAVD = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_level&datum=NAVD&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriSTND = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_level&datum=STND&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriLaJolla = `https://tidesandcurrents.noaa.gov/api/datagetter?product=predictions&amp;application=NOS.COOPS.TAC.WL&amp;begin_date=20201020&amp;end_date=20201021&amp;datum=MLLW&amp;station=9410230&amp;time_zone=lst_ldt&amp;units=english&amp;interval=hilo&amp;format=json`;
        const uri = uriMLLW;
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const parseTideData = (data) => {
            const waterLevel = Number(data.data[data.data.length - 1].v).toFixed(1) || 1;
            console.log(`tideData => ${JSON.stringify(data, null, 2)}`)
            this.props.setTide(waterLevel)
            this.setState({
                station: data.metadata.name,
                tide:(waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium",
                height: waterLevel
            })
        }
        const getTideHour = (tide) => Number(tide.t.split(" ")[1].split(":")[0]);
        const getTideMinutes = (tide) => Number(tide.t.split(" ")[1].split(":")[1]);
//        const getTideTime = (tide) => (getTideHour(tide) === this.getCurrentTime().hours) ? getTideHour(tide) : tide;
        const getTideTime = (tide) => `${getTideHour(tide)}:${getTideMinutes(tide)}`;
        const getTideHeight = (tide) => Number(tide.v);
        //const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
        fetch(proxyurl + uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`tideData => ${JSON.stringify(data, null, 2)} \ncurrentTime: ${this.getCurrentTime().hours}:${this.getCurrentTime().minutes}`);
                const waterLevel = Number(data.data[data.data.length - 1].v).toFixed(1);
                this.props.setTide(waterLevel);
                this.setState({
                    station: data.metadata.name,
                    tide:(waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium",
                    height: waterLevel
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));

    }
    getDirection = () => {
        console.log(`getDirection ->`);
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        console.log(`Tide   - getStartTime: ${this.getCurrentTime().startTime} => getEndTime: ${this.getCurrentTime().endTime}`)
        const tideDaily = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&amp;application=NOS.COOPS.TAC.WL&amp;begin_date=${this.getCurrentTime().year}${this.getCurrentTime().month}${this.getCurrentTime().date}&amp;end_date=${this.getCurrentTime().year}${this.getCurrentTime().month}${this.getCurrentTime().date}&amp;datum=MLLW&amp;station=9410230&amp;time_zone=lst_ldt&amp;units=english&amp;interval=hilo&amp;format=json`;
        const uri = tideDaily;
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        console.log(`tideDaily: ${tideDaily}`)
        const getTideHour = (tide) => Number(tide.t.split(" ")[1].split(":")[0]);
        const getTideMinutes = (tide) => Number(tide.t.split(" ")[1].split(":")[1]);
//        const getTideTime = (tide) => (getTideHour(tide) === this.getCurrentTime().hours) ? getTideHour(tide) : tide;
        const getTideTime = (tide) => `${getTideHour(tide)}:${getTideMinutes(tide)}`;
        const getTideHeight = (tide) => Number(tide.v);
        const getTide = (tide) => tide.type;
        //const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${this.getCurrentTime().currentTime}&end_date=${this.getCurrentTime().currentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`tideDirection => ${JSON.stringify(data, null, 2)}`);
                const hours = data.predictions.map((tide) => getTideHour(tide));
                const times = data.predictions.map((tide) => getTideTime(tide));
                const heights = data.predictions.map((tide) => getTideHeight(tide));
                const tides = data.predictions.map((tide) => getTide(tide));
                const checkTide = (hour) => hour >= this.getCurrentTime().hours;
                const nextTideIndex = hours.findIndex(checkTide);
                const pastLastTide = Number(this.getCurrentTime().hours-hours[nextTideIndex-1]);
                const untilNextTide = Number(hours[nextTideIndex]-this.getCurrentTime().hours);
                const untilNextTideMinutes = Number(hours[nextTideIndex]-this.getCurrentTime().hours);
                const closerTideIndex = (pastLastTide >= untilNextTide) ? nextTideIndex : (nextTideIndex-1);
                const nextTide = tides[nextTideIndex];
                const nextHeight = heights[nextTideIndex];
                const lastHeight = heights[nextTideIndex-1];
                const nextHour = (Number(times[nextTideIndex].split(':')[0])>12) ? (Number(times[nextTideIndex].split(':')[0])-12) : Number(times[nextTideIndex].split(':')[0]);
                const nextMinutes = (times[nextTideIndex].split(':')[1] === "0") ? "00" : times[nextTideIndex].split(':')[1];
                const nextTime = `${nextHour}:${nextMinutes}`;
                const lastTide = tides[nextTideIndex-1];
                const convertTide = (tide) => (tide === 'L') ? 'low' : 'high';
                const getCurrentTide = convertTide(tides[closerTideIndex]);
                const currentTide = ((pastLastTide !== untilNextTide)) ? getCurrentTide : 'medium';
                console.log(`CURRENT ${currentTide} HOUR: ${this.getCurrentTime().hours} TIMES: ${hours}\n next ${nextTide} tide in ${untilNextTide} hours\n previous ${lastTide} tide was ${pastLastTide} hours ago tideMinutes: ${this.getCurrentTime().minutes}`);
                this.setState({
                    tide: currentTide,
                    tideDirection: (nextTide === 'L') ? "DOWN" : "UP",
                    previousTide: lastHeight,
                    nextTide: nextHeight,
                    nextPhase: convertTide(nextTide),
                    nextTime: nextTime,
                    untilNextTide
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));

    }
    getInterval = () => 300000;
    getAllData = () => {
        this.getTideData();
        this.getDirection();
    }
    componentDidMount() {
        this.getAllData();
        this.timerID = setInterval(() => this.getAllData(), this.getInterval());
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    previousTide = () => (localStorage.getItem("tide")) ? Number(localStorage.getItem("tide")) : 0;
    notEqual = () => (Number(this.previousTide()) !== Number(this.state.height)) ? true : false;
    greaterThan = () => (Number(this.previousTide()) > Number(this.state.height)) ? true : false;
    getDownArrow = () => {
        localStorage.setItem("tideDirection", "DOWN")
        return <img className='arrows mb--2' src={arrowDown} />
    }
    getUpArrow = () => { 
        localStorage.setItem("tideDirection", "UP")
        return <img className='arrows mb--2' src={arrowUp} />
    }
    getTideDirection = () => (this.state.tideDirection === "DOWN") ? this.getDownArrow() : this.getUpArrow();
    //getTideDirection = () => (this.notEqual() && this.greaterThan()) ? "DOWN" : this.state.tideDirection;
    setLocalTide = () => localStorage.setItem("tide", Number(this.state.height));
    setLocalTideDirection = () => localStorage.setItem("tideDirection", this.state.tideDirection);
    fixHours = () => (this.getCurrentTime().hours>12) ? Number(this.getCurrentTime().hours - 12) : this.getCurrentTime().hours;

    getCurrentTide = () => <div className="r-10 m-5 p-10 bg-lite white">
                            <div>{this.getTideDirection()}</div>
                            <div>{this.state.height} <span className="greet"> ft. </span>{this.state.tide}</div>
                            <div className='copyright pt-10'>
                                from: <span className='bold'>{(this.state.previousTide) ? this.state.previousTide.toFixed(1) : ''}' </span>
                                to: <span className='bold'>{(this.state.nextTide) ? this.state.nextTide.toFixed(1) : ''}'</span><br/>
                                <span className='bold'>{this.state.nextPhase}</span> in <span className='bold'>{this.state.untilNextTide} hours </span>
                                at: <span className='bold'>{this.state.nextTime}</span>
                            </div>
                        </div>;

    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                        <Loader isMotionOn={this.props.isMotionOn}/>
                    </div>;

    render() {
        //console.log(`tide direction: ${this.state.tideDirection} previous height: ${this.previousTide()} height: ${this.state.height} == ${this.previousTide() === Number(this.state.height)}`)
        this.setLocalTide();
        this.setLocalTideDirection();
        return <div>{this.getCurrentTide()}</div>
    };
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