import React, { useState, useEffect } from 'react';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';

const WindDirection = ({columns, setWind}) => {
    
    const [status, setStatus] = useState({
        columns: columns,
        station: null,
        speed: null,
        angle: null,
        direction: null,
        gusts: null
    });
            
    const getWindData = () => {
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
        const tri = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=9410230&product=wind&time_zone=lst&units=english&format=json'
        const uri = tri;
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        //const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
        fetch(proxyurl + uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`WindDirection => direction: ${JSON.stringify(data.data[data.data.length - 1],null,2)}`)
                setWind(data.data[data.data.length - 1].dr, data.data[data.data.length - 1].d, data.data[data.data.length - 1].s, data.data[data.data.length - 1].g)
                setStatus(prevState => ({
                    ...prevState,
                    station: data.metadata.name,
                    speed: data.data[data.data.length - 1].s,
                    angle: data.data[data.data.length - 1].d,
                    direction: data.data[data.data.length - 1].dr,
                    gusts: data.data[data.data.length - 1].g
                }))
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

    useEffect(() => {   
        getWindData();  
        /*		
        const timerID = setInterval(
            () => getWindData(),
            300000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
        */
    },[]);

    /*
    Water Level: 2.01 ft Above MLLW
    Next Tide at 3:09 PM: Low 1.70 ft
    Gusting to: 12.3 kts from WSW
    */
    const getWindIcon = () => {
        const windDirection = status.direction;
        const classes = "shaka r-20 p-2 bg-white";
        if (windDirection === "N") {
            return <img src={N} className={classes} alt={windDirection} />;
        } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
            return <img src={NE} className={classes} alt={windDirection} />;
        } else if (windDirection === "E") {
            return <img src={E} className={classes} alt={windDirection} />;
        } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
            return <img src={SE} className={classes} alt={windDirection} />;
        } else if (windDirection === "S") {
            return <img src={S} className={classes} alt={windDirection} />;
        } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
            return <img src={SW} className={classes} alt={windDirection} />;
        } else if (windDirection === "W") {
            return <img src={W} className={classes} alt={windDirection} />;
        } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
            return <img src={NW} className={classes} alt={windDirection} />;
        }
    }
    const getCurrentWind = () => {
        return (
            <div className="r-10 m-5 p-10 bg-lite white">
                <div>{getWindIcon()}</div>
                <div>{`${status.direction} ${Number(status.angle).toFixed(0)}°`}</div>
                <div>{`${Number(status.speed).toFixed(0)}-${Number(status.gusts).toFixed(0)}`} <span className="greet">knots</span></div>
            </div>
        )
    }
    return <div>{getCurrentWind()}</div>
}

export default WindDirection;
