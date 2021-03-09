import React, { useState, useEffect } from 'react';
import Loader from '../utils/Loader.js';
import useOceanData from './useOceanData.js';
import useCurrentTime from './useCurrentTime.js';

const AirTemp = ({isMotionOn}) => {
    const [ time ] = useCurrentTime(null);
    //console.log(`AirTemp => \nstartTime: ${time.startTime} \nendTime: ${time.endTime}`)
    const airTempuri = `https://tidesandcurrents.noaa.gov/api/datagetter?begin_date=${time.startTime}&end_date=${time.endTime}&station=9410230&product=air_temperature&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    const airUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${time.startTime}&end_date=${time.endTime}&station=9410230&product=air_temperature&units=english&time_zone=lst_ldt&application=ports_screen&format=json`;
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    const uri = proxyurl + airTempuri;

    const [temp, setTemp] = useState(null);
    const [data, getData] = useOceanData('air', airUrl);
    
    useEffect(() => {
        if (data.data !== undefined) {
            const temp = Number(data.data[data.data.length - 1].v).toFixed(0);
            setTemp(temp);
        }
    },[data]);

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
