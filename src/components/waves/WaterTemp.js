import React, { useState, useEffect } from 'react';
import Loader from '../site/Loader.js';
import useOceanData from './useOceanData.js';
import useCurrentTime from './useCurrentTime.js';

const WaterTemp = ({isMotionOn}) => {

    const [ time ] = useCurrentTime();
    const waterUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${time.startTime}&end_date=${time.endTime}&station=9410230&product=water_temperature&units=english&time_zone=lst_ldt&application=ports_screen&format=json`;
        
    const [temp, setTemp] = useState(null);
    // eslint-disable-next-line
    const [data, getData] = useOceanData('water', waterUrl);

    useEffect(() => {
        if (data.data !== undefined) {
            const temp = Number(data.data[data.data.length - 1].v).toFixed(0);
            setTemp(temp);
        }
    },[data]);

    const getCurrentTemp = () => <React.Fragment>
                                    {temp}° 
                                    <span className="greet">F</span>
                                </React.Fragment>;
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
