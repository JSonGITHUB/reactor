import React, { useState, useEffect } from 'react';
import Loader from '../utils/Loader.js';
import useOceanData from './useOceanData';
import validate from '../utils/validate';

const Sunrise = ({isMotionOn}) => {
    
    const sunrise1uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400';
    const sunrise2uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=today';
    const sunrise3uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=2021-03-05';
    const sunrise4uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&formatted=0';
    
    const [sunrise, setSunrise] = useState(null);
    const [retry, setRetry] = useState('');    
    const [data, setData] = useState(null);

    const sunriseData = useOceanData('sunrise', sunrise1uri, '', setRetry)

    useEffect(() => {
        if (sunriseData.results.sunrise) {
            setData(sunriseData);
        } else {
            const localSunrise = initializeData('sunrise', null);
            setData(localSunrise);
        }
    },[sunriseData]);

    useEffect(() => {
        //if (data !== undefined && data !== null) {
        if (validate(data) !== null) {
            localStorage.setItem('sunrise', JSON.stringify(data));
            console.log(`sunrise => ${JSON.stringify(data,null,2)}`)
            const time = data.results.sunrise;
            const timeArray = time.split(':');
            const displayTime = `${timeArray[0]}:${timeArray[1]}`
            setSunrise(displayTime);
        }
    },[data]);

    const getCurrentSunrise = () => {
        if (retry !=='') {
            return <span className='bold'>Error fetching data retry attempt {retry}</span>
        }
        return <div className="r-10 m-5 p-10 bg-veryLite white">
                {sunrise}<span className='copyright bold'>PM</span>
            </div>;
    }
    const percent = 'twentyfivePercent mt--70 mb--70';
    // eslint-disable-next-line
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;
    return getCurrentSunrise();
}

export default Sunrise;
