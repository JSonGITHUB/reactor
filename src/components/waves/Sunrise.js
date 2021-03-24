import React, { useState, useEffect } from 'react';
import Loader from '../utils/Loader.js';
import useOceanData from './useOceanData.js';
import useCurrentTime from './useCurrentTime.js';

const Sunrise = ({isMotionOn}) => {
    
    const sunrise1uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400';
    const sunrise2uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=today';
    const sunrise3uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=2021-03-05';
    const sunrise4uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&formatted=0';
    
    const [sunrise, setSunrise] = useState(null);
    const [data, getData] = useOceanData('sunrise', sunrise1uri);
    
    useEffect(() => {
        if (data !== undefined) {
            console.log(`sunrise => ${JSON.stringify(data,null,2)}`)
            const time = data.results.sunrise;
            const timeArray = time.split(':');
            const displayTime = `${timeArray[0]}:${timeArray[1]}`
            setSunrise(displayTime);
        }
    },[data.results.sunrise]);

    const getCurrentSunrise = () => <div className="r-10 m-5 p-10 bg-lite white">
                                {sunrise}<span className='copyright bold'>PM</span>
                            </div>;
    const percent = 'twentyfivePercent mt--70 mb--70';
    // eslint-disable-next-line
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;
    return getCurrentSunrise();
}

export default Sunrise;
