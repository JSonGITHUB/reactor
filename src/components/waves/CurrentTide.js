import React, { useEffect } from 'react';
import useOceanData from './useOceanData.js';
import useCurrentTime from './useCurrentTime.js';

const CurrentTide = ({setTide}) => {
    
    const [ time ] = useCurrentTime(null);
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${time.startTime}&end_date=${time.endTime}&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    const [tideNow, getTideNow] = useOceanData('tide', tideNowLink);
    
    const getCurrentWaterLevel = () => {
        if (tideNow.data !== undefined) { 
            const waterLevel = Number(tideNow.data[tideNow.data.length - 1].v).toFixed(1);
            console.log(`getCurrentWaterLevel => waterLevel: ${waterLevel}`)
            return waterLevel;
        }
    }
    /*
    const getCurrentTide = () => {
        const waterLevel = getCurrentWaterLevel();
        console.log(`getCurrentTide => waterLevel: ${waterLevel}`)
        const tide = (waterLevel > 3) ? "high" : (waterLevel < 2) ? "low" : "medium";
        console.log(`getCurrentTide =>\ntide: ${tide}\nwaterLevel: ${waterLevel}`)
        return tide;
    }    
    useEffect(() => {
        let mounted = true;
        if ((tideNow.data !== undefined) && mounted === true) {
            const tide = getCurrentTide();
            //console.log(`tideNowData => \nurl: ${tideNowLink}\nstartTime: ${time.startTime}\nendTime: ${time.endTime}`)
            //console.log(`tideData => data: ${JSON.stringify(data, null, 2)}`)
            setTide(tide);
        }
        return () => mounted = false;
    },[tideNow.data]);
    */
    //const tideClasses = () => 'r-10 m-5 bg-lite white pl-15 pr-15 pt-20 pb-30';
    const tideClasses = () => 'r-10 m-5 bg-lite color-neogreen pl-15 pr-15 pt-20 pb-30';

    return <div className={ tideClasses() }>
                <span className='bold'>{getCurrentWaterLevel()}</span> ft.
            </div>;
}

export default CurrentTide;