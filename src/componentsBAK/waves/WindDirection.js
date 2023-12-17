import React, { useState, useEffect } from 'react';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';
import useOceanData from './useOceanData.js';

const WindDirection = ({columns, setWind, height}) => {
    
    const uri = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=9410230&product=wind&time_zone=lst&units=english&format=json';
    // eslint-disable-next-line
    const [data, getData] = useOceanData('wind', uri);

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
        //console.log(`getWindData =>`)
        if (data.data !== undefined) {
            
            const station = data.metadata.name;
            const speed = data.data[data.data.length - 1].s * 1.15078;
            const angle = data.data[data.data.length - 1].d;
            const direction = data.data[data.data.length - 1].dr;
            const gusts = data.data[data.data.length - 1].g * 1.15078;
            localStorage.setItem('wind', direction);
            if (status.station !== station) {
                setStatus(prevState => ({
                    ...prevState,
                    station: station,
                    speed: speed,
                    angle: angle,
                    direction: direction,
                    gusts: gusts
                }))
                setWind(data.data[data.data.length - 1].dr, data.data[data.data.length - 1].d, data.data[data.data.length - 1].s, data.data[data.data.length - 1].g);
            }
        }
    },[data, setWind, status.station]);

    /*
    Water Level: 2.01 ft Above MLLW
    Next Tide at 3:09 PM: Low 1.70 ft
    Gusting to: 12.3 kts from WSW
    */
    const getWindIcon = () => {
        const windDirection = status.direction;
        const classes = "h50w50 r-25 p-5 mt-5 mb-5 bg-white";
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
    const getSpeed = () => `${Number(status.speed).toFixed(0)}-${Number(status.gusts).toFixed(0)}`;
    const getStrength = () => (Number(status.speed)<2) ? 'light' : (Number(status.speed)>8) ? 'strong' : 'moderate';
    const getCurrentWind = () => {
        return (
            <div className='r-10 m-5 p-10 bg-lite white centeredContent' style={style}>
                {getWindIcon()}
                <div className='m-2'>{`${getStrength()}`}</div>
                <div className='m-2'>{`${status.direction} ${Number(status.angle).toFixed(0)}°`}</div>
                <div className='m-2'>{getSpeed()} <span className="greet">mph</span></div>
            </div>
        )
    }
    return <React.Fragment>{getCurrentWind()}</React.Fragment>
}

export default WindDirection;
