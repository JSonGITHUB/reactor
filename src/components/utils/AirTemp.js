import React from 'react';
import Loader from '../utils/Loader.js';

class AirTemp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            temp: 0,
        }
    }
    getAirTempData = () => {
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        let getCurrentTime = new Date();//20200520%2018:24
        //getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${(getCurrentTime.getHours())}:${getCurrentTime.getMinutes()}`
        getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:00`
        //getCurrentTime = "20200520%2018:24";
        console.log(`getCurrentTime: ${getCurrentTime} ===> 20200520%2018:24`)
        const airTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=air_temperature&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        //`https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2018:24&end_date=20200520%2018:24&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`
        fetch(airTempuri)
            .then(response => validate(response))
            .then(data => {
                this.setState({
                    temp: Number(data.data[0].v).toFixed(0)
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${airTempuri} \npath: ${window.location.pathname}\n`, err));
    }
    componentDidMount() {
        this.getAirTempData();
        this.timerID = setInterval(
            () => this.tick(),
            64000
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
       this.getAirTempData();
    }
    getCurrentTemp = () => <div>{this.state.temp}° <span className="greet">F</span></div>;
    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    render() {
        return this.getCurrentTemp()
    };
}

export default AirTemp;