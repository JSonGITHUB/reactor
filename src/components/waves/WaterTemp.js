import React, { useState, useEffect } from 'react';
import Loader from '../site/Loader';
import useOceanData from './useOceanData';
//import useCurrentTime from './useCurrentTime';
import useCurrentTime from '../utils/useCurrentTime';
import validate from '../utils/validate';

const WaterTemp = ({
    setStatus,
    isMotionOn
}) => {

    //const [ time ] = useCurrentTime();
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const waterUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410230&product=water_temperature&units=english&time_zone=lst_ldt&application=ports_screen&format=json`;
    
    //console.log(`WaterTemp => time: ${JSON.stringify(time,null,2)}`);
    //console.log(`WaterTemp => startTime: ${startTime} endTime: ${endTime}`);

    const [temp, setTemp] = useState(null);
    // eslint-disable-next-line
    const [retry, setRetry] = useState('');
    const [data, getData] = useOceanData('water', waterUrl, '', setRetry);

    useEffect(() => {
        //if (data.data !== undefined) {
        if (validate(data.data) !== null) {
            const temp = Number(data.data[data.data.length - 1].v).toFixed(0);
            setTemp(temp);
            localStorage.setItem('waterTemp', temp);
            setStatus(prevState => ({
                ...prevState,
                waterTemp: temp
            }));
        }
    },[data]);

    const getCurrentTemp = () => {
        if (retry !=='') {
            return <div>
                    WATER TEMP: Error fetching data retry attempt {retry}
                </div>
        }
        return <React.Fragment>
            {temp}° 
            <span className="greet">F</span>
        </React.Fragment>;
    }
    
    const percent = 'twentyfivePercent mt--70 mb--70';
    // eslint-disable-next-line
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;

    return <div className="r-10 pt-10 white">
            {getCurrentTemp()}
        </div>
}

export default WaterTemp;

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
            "t":"2020-05-20 18:24", 
            "v":"63.7", 
            "f":"0,0,0"
        }
    ]
}
*/
