import React from 'react';
import Loader from '../utils/Loader.js';

class Buoy extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buoy: null,
        }
    }
    getBuoyData = () => {
        console.log(`getBuoy ->`);
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
        console.log(`Buoy   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        const buoyuri = `https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt`;
        //`https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2018:24&end_date=20200520%2018:24&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`
        fetch(buoyuri)
            .then(response => console.log(`YEEEW!!!! -- ${validate(response)}))
            /*
            .then(data => {
                this.setState({
                    buoy: Number(data.data[data.data.length - 1].v).toFixed(0)
                })
            })
            */
            .catch(err => console.log(`Something went wrong!\nbuoyuri: ${buoyuri} \npath: ${window.location.pathname}\n`, err));
    }
    getLocalBuoyData = () => {
        console.log(`getLocalBuoy ->`);
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
        console.log(`LocalBuoy   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        
        const localBuoyURI = `http://192.168.1.8:8080/`;
        fetch(localBuoyURI)
            .then(response => validate(response))
            .then(data => {
                console.log(`LocalBuoy: ${JSON.stringify(data, 2, null)}`)
                this.setState({
                    buoy: Number(data.data[data.data.length - 1].v).toFixed(0)
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${localBuoyURI} \npath: ${window.location.pathname}\n`, err));
    }
    getInterval = () => 300000;
    componentDidMount() {
        this.getBuoyData();
        //this.getLocalBuoyData();
        this.timerID = setInterval(() => this.getBuoyData(), this.getInterval());
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    getCurrentBuoy = () => <div>{this.state.buoy}° <span className="greet">F</span></div>;
    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    render() {
        return <div>
                <div>{this.getCurrentBuoy()}</div>
            </div>
    };
}

export default Buoy;