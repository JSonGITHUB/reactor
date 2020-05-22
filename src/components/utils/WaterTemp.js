import React from 'react';
import Dialog from '../functional/Dialog.js';
import Loader from '../utils/Loader.js';

class WaterTemp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            temp: 0,
        }
    }
    getWaterTempData = () => {
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        let getCurrentTime = new Date();//20200520%2018:24
        //getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${(getCurrentTime.getHours())}:${getCurrentTime.getMinutes()}`
        getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:00`
        //getCurrentTime = "20200520%2018:24";
        console.log(`getCurrentTime: ${getCurrentTime} ===> 20200520%2018:24`)
        const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        //`https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2018:24&end_date=20200520%2018:24&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`
        fetch(waterTempuri)
            .then(response => validate(response))
            .then(data => {
                this.setState({
                    temp: data.data[0].v
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${waterTempuri} \npath: ${window.location.pathname}\n`, err));
    }
    delay = () => (this.state.temp !== 0) ? 50000 : 1000;
    componentDidMount() {
        this.getWaterTempData();
        this.timerID = setInterval(
            () => this.tick(),
            this.delay()
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
        console.log(`getWaterTemp ->`);
        this.getWaterTempData();
    }
    getCurrentTemp = () => <div className="color-blue mt-20">Water Temp: {this.state.temp}</div>;
    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    render() {
        return <div className="color-yellow greet">
                {this.getCurrentTemp()}
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