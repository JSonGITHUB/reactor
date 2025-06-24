import React, { useEffect } from 'react';
import useOceanData from './useOceanData';
import useCurrentTime from './utils/useCurrentTime';

import validate from '../utils/validate';

const CurrentTide = ({setTide}) => {
    
    //const [ time ] = useCurrentTime();
    const time = useCurrentTime();
    const startTime = time[0].startTime;
    const endTime = time[0].endTime;
    const tideNowLink = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${startTime}&end_date=${endTime}&station=9410660&product=water_level&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json`;
    const [retry, setRetry] = useState('');        
    const [tideNow, setTideNow] = useState(null);
    const tideData = useOceanData('tide', tideNowLink, '', setRetry);

    useEffect(() => {
        console.log(`${retry} CurrentTide => tideData: ${JSON.stringify(tideData,null,2)}`);
        if (tideData[0].data) {
            setTideNow(tideData);
        } else {
            const localTide = initializeData('tideData', null);
            setTideNow(localTide);
        }
    },[tideData]);
    useEffect(() => {
        localStorage.setItem('tideData', JSON.stringify(tideNow));
    },[tideNow]);
    
    const getCurrentWaterLevel = () => {
        //if (tideNow[0].data !== undefined) { 
        if (validate(tideNow[0].data) !== null) {
            const waterLevel = Number(tideNow[0].data[tideNow[0].data.length - 1].v).toFixed(1);
            console.log(`CurrentTide => getCurrentWaterLevel => waterLevel: ${waterLevel}`)
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
        if ((tideNow[0].data !== undefined) && mounted === true) {
            const tide = getCurrentTide();
            //console.log(`tideNowData => \nurl: ${tideNowLink}\nstartTime: ${time.startTime}\nendTime: ${time.endTime}`)
            //console.log(`tideData => data: ${JSON.stringify(data, null, 2)}`)
            setTide(tide);
        }
        return () => mounted = false;
    },[tideNow[0].data]);
    */
    //const tideClasses = () => 'r-10 m-5 bg-lite white pl-15 pr-15 pt-20 pb-30';
    const tideClasses = () => 'r-10 m-5 bg-tinted color-neogreen pl-15 pr-15 pt-20 pb-30';

    return <div className={ tideClasses() }>
            {
                (retry !=='')
                ? <span className='bold'>Error fetching data retry attempt {retry}</span>
                : <span className='bold'><span>{getCurrentWaterLevel()}</span> ft.</span>
            }
            </div>;
}

export default CurrentTide;