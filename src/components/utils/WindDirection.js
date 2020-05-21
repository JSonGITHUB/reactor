import React from 'react';
import Dialog from '../functional/Dialog.js';
import Loader from '../utils/Loader.js';

class WindDirection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            direction: null
        }
    }
    getWindData = () => {
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        let getCurrentTime = new Date();
        getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:00`
        console.log(`Wind   -      getCurrentTime: ${getCurrentTime} ===> 20200520%2018:24`)
        const uriWind = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=wind&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriWindTest = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2020:00&end_date=20200520%2020:00&station=9410230&product=wind&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uri = uriWind;
        
        //const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                this.setState({
                    station: data.metadata.name,
                    s: data.data[0].s,
                    angle: data.data[0].d,
                    direction: data.data[0].dr,
                    g: data.data[0].g
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));

    }
    componentDidMount() {
        
        this.getWindData();
        this.timerID = setInterval(
            () => this.tick(),
            50000
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
        console.log(`getWind ->`);
        this.getWindData();
    }
    getCurrentWind = () => <div>
            <div>{`Wind: ${this.state.direction}`}</div><br/>
            {/*
            <div>{`s: ${this.state.s}`}</div>
            <div>{`angle: ${this.state.d}`}</div>
            <div>{`g: ${this.state.g}`}</div>
            */}
        </div>;
    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    render() {
        return <div className="color-yellow greet mt-20">
                {this.getCurrentWind()}
            </div>
    };
}

export default WindDirection;