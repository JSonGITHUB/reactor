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
        let getCurrentTime = new Date();//20200520%2018:24
        //getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${(getCurrentTime.getHours())}:${getCurrentTime.getMinutes()}`
        const getEndTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:${((getCurrentTime.getMinutes())<10) ? `0${(getCurrentTime.getMinutes())}` : (getCurrentTime.getMinutes())}`;
        //getCurrentTime = "20200520%2018:24";
        const getStartTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:00`;
        getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:${((getCurrentTime.getMinutes())<10) ? `0${(getCurrentTime.getMinutes())}` : (getCurrentTime.getMinutes())}`
        console.log(`getCurrentTime: ${getCurrentTime} ===> 20200520%2018:24`)
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
    getInterval = () => (this.state.temp !== null) ? 150000 : 31000;
    componentDidMount() {
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
        return <div>{this.getCurrentTemp()}</div>
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