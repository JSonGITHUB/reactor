import React, { useState, useEffect } from 'react';
import Loader from '../site/Loader';
import useOceanData from './useOceanData';
//import useCurrentTime from './useCurrentTime';
import useCurrentTime from '../utils/useCurrentTime';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';

const AirTemp = ({isMotionOn}) => {
    
    //const [ time ] = useCurrentTime();
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const airUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410230&product=air_temperature&units=english&time_zone=lst_ldt&application=ports_screen&format=json`;
    const [temp, setTemp] = useState(null);
    const [updated, setUpdated] = useState(false);
    // eslint-disable-next-line
    const [retry, setRetry] = useState('');    
    const [data, setData] = useState(null);
    const airTempData = useOceanData('air', airUrl, '', setRetry)
            
    useEffect(() => {
        if (data !== null && updated !== true) {
            //if (data.data !== undefined && updated !== true) {
            if (validate(data.data) !== null && updated !== true) {
                console.log(`data:${data.data}`);
                //console.log(`AirTemp =>`)
                const temp = Number(data.data[data.data.length - 1].v).toFixed(0);
                setTemp(temp);
                localStorage.setItem('airTemp', temp)
                setUpdated(true);
            }
        }
    },[data, time.startTime, time.endTime, updated]);
    useEffect(() => {
        if (airTempData.data) {
            setData(airTempData)
        } else {
            const localAir = initializeData('airTemp', null);
            setData(localAir);
        }
    },[airTempData]);
    const getCurrentTemp = () => {
        if (retry !=='') {
            return <p>Error fetching data retry attempt {retry}</p>
        }
        return <div className="r-10 pt-10 white">
                    {temp}° 
                    <span className="greet">F </span>
                </div>;
    }

    const percent = 'twentyfivePercent mt--70 mb--70';

    // eslint-disable-next-line
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;
            
    return getCurrentTemp();
}

export default AirTemp;
