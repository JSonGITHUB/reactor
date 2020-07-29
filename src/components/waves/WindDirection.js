import React from 'react';
import Loader from '../utils/Loader.js';

class WindDirection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            direction: null,
            columns: props.columns,
            station: null,
            speed: null,
            angle: null,
            gusts: null
        }
    }
    getWindData = () => {
        console.log(`getWind ->`);
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
        console.log(`Wind   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        const uriWind = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getStartTime}&end_date=${getEndTime}&station=9410230&product=wind&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriWindTest = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2020:00&end_date=20200520%2020:00&station=9410230&product=wind&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uri = uriWind;
        
        //const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`WindDirection => direction: ${JSON.stringify(data.data[data.data.length - 1],null,2)}`)
                this.props.setWind(data.data[data.data.length - 1].dr, data.data[data.data.length - 1].d, data.data[data.data.length - 1].s, data.data[data.data.length - 1].g)
                this.setState({
                    station: data.metadata.name,
                    speed: data.data[data.data.length - 1].s,
                    angle: data.data[data.data.length - 1].d,
                    direction: data.data[data.data.length - 1].dr,
                    gusts: data.data[data.data.length - 1].g
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
    getInterval = () => 300000;
    componentDidMount() {
        this.getWindData()
        this.timerID = setInterval(() => this.getWindData(), this.getInterval());
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    /*
    Water Level: 2.01 ft Above MLLW
    Next Tide at 3:09 PM: Low 1.70 ft
    Gusting to: 12.3 kts from WSW
    */
    getCurrentWind = () => {
        const { columns } = this.props;
        const { direction, angle, speed, gusts } = this.state;
        return (
            <div className={(columns > 1) ? "flexContainer": ""}>
                <div className={(columns > 1) ? "flex3Column": ""}>{`${direction} ${Number(angle).toFixed(0)}°`}</div>
                <div className={(columns > 1) ? "flex3Column": ""}>{`${Number(speed).toFixed(0)}-${Number(gusts).toFixed(0)}`} <span className="greet">knots</span></div>
            </div>
        )
    }
    render() {
        return <div>{this.getCurrentWind()}</div>
    };
}

export default WindDirection;