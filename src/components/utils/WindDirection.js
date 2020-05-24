import React from 'react';
import Loader from '../utils/Loader.js';

class WindDirection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            direction: null,
            columns: props.columns
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
                console.log(`WindDirection => direction: ${data.data[0].dr}`)
                this.props.setWind(data.data[0].dr, data.data[0].d, data.data[0].s, data.data[0].g)
                this.setState({
                    station: data.metadata.name,
                    speed: data.data[0].s,
                    angle: data.data[0].d,
                    direction: data.data[0].dr,
                    gusts: data.data[0].g
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));

    }
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
                "t":"2020-05-20 20:00", 
                "s":"5.25", 
                "d":"313.00",
                 "dr":"NW", 
                 "g":"7.39", 
                 "f":"0,0"
            }
        ]
    }
    */
    componentDidMount() {
        this.getWindData();
        this.timerID = setInterval(
            () => this.tick(),
            25000
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    tick() {
        if (this.state.direction === null) {
            console.log(`getWind ->`);
            this.getWindData();
        }
        
    }
    /*
    Water Level: 2.01 ft Above MLLW
    Next Tide at 3:09 PM: Low 1.70 ft
    Gusting to: 12.3 kts from WSW
    */
    getCurrentWind = () => <div className={(this.props.columns > 1) ? "flexContainer": ""}>
                            <div className={(this.props.columns > 1) ? "flex3Column": ""}>{`${this.state.direction} ${Number(this.state.angle).toFixed(0)}°`}</div>
                            <div className={(this.props.columns > 1) ? "flex3Column": ""}>{`${Number(this.state.speed).toFixed(0)}-${Number(this.state.gusts).toFixed(0)}`} <span className="greet">knots</span></div>
                        </div>
    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    render() {
        return <div>{this.getCurrentWind()}</div>
    };
}

export default WindDirection;