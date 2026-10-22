import React, { useState, useEffect, useCallback, useRef } from 'react';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';

const WindDirection = ({
    columns, 
    setWind,
    height,
    collapse,
    waterTemp,
    airTemp
}) => {

    const setWindRef = useRef(setWind);
    const loggedFetchFailureRef = useRef(false);

    useEffect(() => {
        setWindRef.current = setWind;
    }, [setWind]);
    
    const [status, setStatus] = useState({
        columns: columns,
        station: null,
        speed: null,
        angle: null,
        direction: null,
        gusts: null
    });
            
    const getWindData = useCallback((signal, isMounted) => {
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
        const currentMinutes = getCurrentTime.getMinutes();
        const minutes = (currentMinutes<10) ? `0${currentMinutes}` : currentMinutes;
        getCurrentTime = `${year}${month}${date}%20${hours}:${minutes}`;
        //console.log(`Wind   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
        //const uriWind = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getStartTime}&end_date=${getEndTime}&station=9410230&product=wind&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        //const uriWindTest = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=20200520%2020:00&end_date=20200520%2020:00&station=9410230&product=wind&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
        const tri = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=9410230&product=wind&time_zone=lst&units=english&format=json'
        const uri = tri;
        //const waterTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${getCurrentTime}&end_date=${getCurrentTime}&station=9410230&product=water_temperature&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
        //fetch(proxyurl + uri)
        fetch(uri, { signal })
            .then(response => validate(response))
            .then(data => {
                if (!isMounted()) return;
                setWindRef.current(
                    data.data[data.data.length - 1].dr,
                    data.data[data.data.length - 1].d,
                    data.data[data.data.length - 1].s,
                    data.data[data.data.length - 1].g
                )
                setStatus(prevState => ({
                    ...prevState,
                    station: data.metadata.name,
                    speed: data.data[data.data.length - 1].s,
                    angle: data.data[data.data.length - 1].d,
                    direction: data.data[data.data.length - 1].dr,
                    gusts: data.data[data.data.length - 1].g
                }))
            })
            .catch(err => {
                if (err?.name === 'AbortError') return;
                const cachedDirection = initializeData('windDirection', 'N');
                const cachedSpeed = String(initializeData('windSpeed', '0mph')).replace('mph', '');
                const fallbackSpeed = Number(cachedSpeed) || 0;
                if (isMounted()) {
                    setWindRef.current(cachedDirection, 0, fallbackSpeed, fallbackSpeed);
                    setStatus(prevState => ({
                        ...prevState,
                        station: prevState.station || 'cached',
                        speed: fallbackSpeed,
                        angle: 0,
                        direction: cachedDirection,
                        gusts: fallbackSpeed
                    }));
                }
                if (!loggedFetchFailureRef.current) {
                    loggedFetchFailureRef.current = true;
                    console.warn(`WindDirection fetch unavailable (likely CORS). Using cached wind data instead.`);
                }
            });

            }, []);
    /*
    {
        'metadata':{
            'id':'9410230',
            'name':'La Jolla',
            'lat':'32.8669',
            'lon':'-117.2571'
        }, 
        'data': [
            {
                't':'2020-05-20 20:00', 
                's':'5.25', 
                'd':'313.00',
                 'dr':'NW', 
                 'g':'7.39', 
                 'f':'0,0'
            }
        ]
    }
    */

    useEffect(() => {   
        const controller = new AbortController();
        let mounted = true;
        const isMounted = () => mounted;
        getWindData(controller.signal, isMounted);  
        /*		
        const timerID = setInterval(
            () => getWindData(),
            300000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
        */
        return () => {
            mounted = false;
            controller.abort();
        };
    }, [getWindData]);

    /*
    Water Level: 2.01 ft Above MLLW
    Next Tide at 3:09 PM: Low 1.70 ft
    Gusting to: 12.3 kts from WSW
    */
    const getWindIcon = () => {
        const windDirection = status.direction;
        const classes = 'shaka r-20 p-2 bg-white h50w50 mb-15';
        if (windDirection === 'N') {
            return <img src={N} className={classes} alt={windDirection} />;
        } else if ((windDirection === 'NE') || (windDirection === 'NNE') || (windDirection === 'ENE')) {
            return <img src={NE} className={classes} alt={windDirection} />;
        } else if (windDirection === 'E') {
            return <img src={E} className={classes} alt={windDirection} />;
        } else if ((windDirection === 'SE') || (windDirection === 'SSE') || (windDirection === 'ESE')) {
            return <img src={SE} className={classes} alt={windDirection} />;
        } else if (windDirection === 'S') {
            return <img src={S} className={classes} alt={windDirection} />;
        } else if ((windDirection === 'SW') || (windDirection === 'SSW') || (windDirection === 'WSW')) {
            return <img src={SW} className={classes} alt={windDirection} />;
        } else if (windDirection === 'W') {
            return <img src={W} className={classes} alt={windDirection} />;
        } else if ((windDirection === 'NW') || (windDirection === 'NNW') || (windDirection === 'WNW')) {
            return <img src={NW} className={classes} alt={windDirection} />;
        }
    }

    const displayWindSpeed = (speed, gusts) => {
        if (speed === gusts) {
            return speed;
        }
        return `${speed}-${gusts}`
    }
    const mph = () => {

        const getMPH = (knots) => Number(knots / .868976).toFixed(0);

        const speed = getMPH(status.speed);
        const gusts = getMPH(status.gusts);

        localStorage.setItem('windSpeed', `${speed}mph`);

        return displayWindSpeed(speed, gusts);

    }

    const display = () => {
        
        const displayWaterTemp = waterTemp ?? initializeData('waterTemp', '80');
        const displayAirTemp = airTemp ?? initializeData('airTemp', '90');

        if (collapse) {
            return <div>
                    {icons.wind} {status.direction} {Number(status.gusts).toFixed(0)}mph {icons.water}{displayWaterTemp}°F {icons.temperature} {displayAirTemp}°F
                </div>
        }
        return <div className='r-10 p-10 white'>
                <div>{getWindIcon()}</div>
                <div className='mb-10'>{`${status.direction} ${Number(status.angle).toFixed(0)}°`}</div>
                <div>{mph()} <span className=''>mph</span></div>
            </div>
    }
    return <div className='color-white'>
            { display() }
        </div>
}

export default WindDirection;
