import React from 'react';
import Loader from '../utils/Loader.js';
//import tide from '../../assets/images/tide.png'

class Tide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tide: null,
            height: null
        }
    }
    getTideData = () => {
        console.log(`getTide ->`);
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        let getCurrentTime = new Date();
        const getEndTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:${((getCurrentTime.getMinutes())<10) ? `0${(getCurrentTime.getMinutes())}` : (getCurrentTime.getMinutes())}`;
        const getStartTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:00`;
        getCurrentTime = `${(getCurrentTime.getFullYear())}${((getCurrentTime.getMonth()+1)<10) ? `0${(getCurrentTime.getMonth()+1)}` : (getCurrentTime.getMonth()+1)}${(getCurrentTime.getDate()<10)? `0${getCurrentTime.getDate()}` : getCurrentTime.getDate()}%20${((getCurrentTime.getHours())<10) ? `0${(getCurrentTime.getHours())}` : (getCurrentTime.getHours())}:${((getCurrentTime.getMinutes())<10) ? `00` : (getCurrentTime.getMinutes())}`
        console.log(`Tide   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        const uriMLLW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getStartTime}&end_date=${getEndTime}&station=9410230&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMHHW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_level&datum=MHHW&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMHW = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_level&datum=MHW&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMTL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_level&datum=MTL&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriMSL = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_level&datum=MSL&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriNAVD = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_level&datum=NAVD&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const uriSTND = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_level&datum=STND&units=english&time_zone=lst_ldt&application=web_services&format=json`;

        const uri = uriMLLW;
        
        //const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                const waterLevel = Number(data.data[data.data.length - 1].v).toFixed(1);
                console.log(`tideData => ${JSON.stringify(data, null, 2)}`)
                this.props.setTide(waterLevel)
                this.setState({
                    station: data.metadata.name,
                    tide:(waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "med",
                    height: waterLevel
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));

    }
    getInterval = () => 300000;
    componentDidMount() {
        this.getTideData();
        this.timerID = setInterval(() => this.getTideData(), this.getInterval());
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    getCurrentTide = () => <div>{this.state.height} <span className="greet">feet</span></div>;
    percent = 'twentyfivePercent mt--70 mb--70';
    loading = () => <div className={this.percent}>
                <Loader isMotionOn={this.props.isMotionOn}/>
            </div>;
    render() {
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