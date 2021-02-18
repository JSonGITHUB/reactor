import React, { useState, useEffect } from 'react';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';
import axios from 'axios';

const WindDirection = ({columns, setWind, height}) => {
    
    const [status, setStatus] = useState({
        columns: columns,
        station: null,
        speed: null,
        angle: null,
        direction: null,
        gusts: null
    });
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

        let ignore = false;

        const getWindData = async () => {

            console.log(`getWindData =>`)
            const proxyurl = "https://cors-anywhere.herokuapp.com/";
            const uri = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=9410230&product=wind&time_zone=lst&units=english&format=json';
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
            
            const { data } = await axios.get(uri, {
                params: {
                    origin: '*',
                    format: 'json',
                    mode:'cors'
                }
            });
            //console.log(`getWindData => data: ${JSON.stringify(data, null, 2)}`)
            setWind(data.data[data.data.length - 1].dr, data.data[data.data.length - 1].d, data.data[data.data.length - 1].s, data.data[data.data.length - 1].g)
            const station = data.metadata.name;
            const speed = data.data[data.data.length - 1].s * 1.15078;
            const angle = data.data[data.data.length - 1].d;
            const direction = data.data[data.data.length - 1].dr;
            const gusts = data.data[data.data.length - 1].g * 1.15078;
            setStatus(prevState => ({
                ...prevState,
                station: station,
                speed: speed,
                angle: angle,
                direction: direction,
                gusts: gusts
            }))
        };
        if (!ignore) getWindData();  
       return () => { ignore = true; }
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
    const style = {
        height: height
    }
    const getCurrentWind = () => {
        return (
            <div className='r-10 m-5 p-10 bg-lite white centeredContent' style={style}>
                <div>{getWindIcon()}</div>
                <div>{`${status.direction} ${Number(status.angle).toFixed(0)}°`}</div>
                <div>{`${Number(status.speed).toFixed(0)}-${Number(status.gusts).toFixed(0)}`} <span className="greet">mph</span></div>
            </div>
        )
    }
    return <div>{getCurrentWind()}</div>
}

export default WindDirection;
