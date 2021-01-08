import React, { useState, useEffect } from 'react';
import Loader from '../utils/Loader.js';

const AirTemp = ({isMotionOn}) => {
    
   const [temp, setTemp] = useState(null);
   const getAirTempData = () => {
        console.log(`getAir ->`);
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
        console.log(`Air   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        const airTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getStartTime}&end_date=${getEndTime}&station=9410230&product=air_temperature&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        //`https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2018:24&end_date=20200520%2018:24&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        fetch(proxyurl + airTempuri)
            .then(response => validate(response))
            .then(data => {
                setTemp(Number(data.data[data.data.length - 1].v).toFixed(0));
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${airTempuri} \npath: ${window.location.pathname}\n`, err));
    }
    useEffect(() => {     	
        getAirTempData()
        /*	
        const timerID = setInterval(
            () => getAirTempData(),
            300000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
        */
    },[]);
    const getCurrentTemp = () => <div className="r-10 m-5 p-10 bg-lite white">
                                {temp}° 
                                <span className="greet">F </span>
                            </div>;
    const percent = 'twentyfivePercent mt--70 mb--70';
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;
    return getCurrentTemp();
}

export default AirTemp;