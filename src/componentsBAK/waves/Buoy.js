import React, { useState, useEffect } from 'react';
import Loader from '../utils/Loader.js';

const Buoy = ({isMotionOn}) => {
    
    const [buoy, setBouy] = useState(null);
    
    const getBuoyData = () => {
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
            .then(response => console.log(`YEEEW!!!! -- ${validate(response)}`))
            .catch(err => console.log(`Something went wrong!\nbuoyuri: ${buoyuri} \npath: ${window.location.pathname}\n`, err));
    }
    const getLocalBuoyData = () => {
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
                setBouy(Number(data.data[data.data.length - 1].v).toFixed(0));
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${localBuoyURI} \npath: ${window.location.pathname}\n`, err));
    }
    useEffect(() => {     	
        getBuoyData();	
        const timerID = setInterval(
            () => getBuoyData(),
            300000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    },[]);
    const getCurrentBuoy = () => <div>{buoy}° <span className="greet">F</span></div>;
    const percent = 'twentyfivePercent mt--70 mb--70';
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;
    return <React.Fragment>
            {getCurrentBuoy()}
        </React.Fragment>
}

export default Buoy;