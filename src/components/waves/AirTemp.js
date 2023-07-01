import React, { useState, useEffect } from 'react';
import Loader from '../utils/Loader.js';
import useOceanData from './useOceanData.js';
import useCurrentTime from '../utils/useCurrentTime.js';

const AirTemp = ({isMotionOn}) => {
    const [ time ] = useCurrentTime();
    const airUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${time.startTime}&end_date=${time.endTime}&station=9410230&product=air_temperature&units=english&time_zone=lst_ldt&application=ports_screen&format=json`;
    const [temp, setTemp] = useState(null);
    const [updated, setUpdated] = useState(false);
    // eslint-disable-next-line
    const [data, getData] = useOceanData('air', airUrl);
    
    
            
    useEffect(() => {
        if (data.data !== undefined && updated !== true) {
            console.log(`AirTemp =>`)
            const temp = Number(data.data[data.data.length - 1].v).toFixed(0);
            setTemp(temp);
            setUpdated(true);
        }
    },[data.data, time.startTime, time.endTime, updated]);

    const getCurrentTemp = () => <div className="r-10 m-5 p-10 bg-lite white">
                                {temp}° 
                                <span className="greet">F </span>
                            </div>;

    const percent = 'twentyfivePercent mt--70 mb--70';

    // eslint-disable-next-line
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;
            
    return getCurrentTemp();
}

export default AirTemp;
