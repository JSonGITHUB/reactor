import React from 'react';
import Loader from '../utils/Loader.js';

class WaterTemp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            temp: null,
        }
    }
    getWaterTempData = () => {
        console.log(`getWaterTemp ->`);
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        let getCurrentTime = new Date();
        const year = getCurrentTime.getFullYear();
        const currentMonth = getCurrentTime.getMonth()+1;
        const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
        const currentDate = getCurrentTime.getDate();
        const date = (currentDate<10) ? `0${currentDate}` : currentDate;
        const currentHour = getCurrentTime.getHours();
        const hours = (currentHour<10) ? `0${currentHour}` : currentHour;
        const startHour = ((currentHour-1)<10) ? `0${(currentHour-1)}` : (currentHour-1);
        const currentMinutes = getCurrentTime.getMinutes();
        const minutes = (currentMinutes<10) ? `0${currentMinutes}` : currentMinutes;
        const getEndTime = `${year}${month}${date}%20${hours}:${minutes}`;
        const getStartTime = `${year}${month}${date}%20${startHour}:00`;
        getCurrentTime = `${year}${month}${date}%20${hours}:${minutes}`;
        console.log(`WaterTemp   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getStartTime}&end_date=${getEndTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        //`https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2018:24&end_date=20200520%2018:24&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`
        fetch(waterTempuri)
            .then(response => validate(response))
            .then(data => {
                this.setState({
                    temp: Number(data.data[data.data.length - 1].v).toFixed(0)
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${waterTempuri} \npath: ${window.location.pathname}\n`, err));
    }
    getLocalWaterTempData = () => {
        console.log(`getLocalWaterTemp ->`);
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        let getCurrentTime = new Date();
        const year = getCurrentTime.getFullYear();
        const currentMonth = getCurrentTime.getMonth()+1;
        const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
        const currentDate = getCurrentTime.getDate();
        const date = (currentDate<10) ? `0${currentDate}` : currentDate;
        const currentHour = getCurrentTime.getHours();
        const hours = (currentHour<10) ? `0${currentHour}` : currentHour;
        const startHour = ((currentHour-1)<10) ? `0${(currentHour-1)}` : (currentHour-1);
        const currentMinutes = getCurrentTime.getMinutes();
        const minutes = (currentMinutes<10) ? `0${currentMinutes}` : currentMinutes;
        const getEndTime = `${year}${month}${date}%20${hours}:${minutes}`;
        const getStartTime = `${year}${month}${date}%20${startHour}:00`;
        getCurrentTime = `${year}${month}${date}%20${hours}:${minutes}`;
        console.log(`LocalWaterTemp   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        const localWaterTempURI = `http://192.168.1.8:8080/`;
        fetch(localWaterTempURI)
            .then(response => validate(response))
            .then(data => {
                console.log(`LocalWaterTemp: ${JSON.stringify(data, 2, null)}`)
                this.setState({
                    temp: Number(data.data[data.data.length - 1].v).toFixed(0)
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${localWaterTempURI} \npath: ${window.location.pathname}\n`, err));
    }
    getInterval = () => 300000;
    componentDidMount() {
        this.getWaterTempData();
        //this.getLocalWaterTempData();
        this.timerID = setInterval(() => this.getWaterTempData(), this.getInterval());
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    getCurrentTemp = () => <div>{this.state.temp}° <span className="greet">F</span></div>;
    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    render() {
        return <div>
                <div>{this.getCurrentTemp()}</div>
            </div>
    };
}

export default WaterTemp;

/*
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
            "v":"63.7", 
            "f":"0,0,0"
        }
    ]
}
*/