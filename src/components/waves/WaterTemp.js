import React, { useState, useEffect, useRef } from 'react';
import Loader from '../site/Loader';
import fetchCurrentWaterTemp from './waterTempService';

const WaterTemp = ({
    setStatus,
    isMotionOn
}) => {
    const [temp, setTemp] = useState(null);
    const [retry, setRetry] = useState('');
    const setStatusRef = useRef(setStatus);

    useEffect(() => {
        setStatusRef.current = setStatus;
    }, [setStatus]);

    useEffect(() => {
        let isMounted = true;

        const loadWaterTemp = async () => {
            try {
                setRetry('');
                const reading = await fetchCurrentWaterTemp({
                    noaaStationId: '9410230',
                    ndbcStationId: '46254',
                });

                if (!isMounted || !Number.isFinite(reading?.valueF)) return;

                const roundedTemp = Number(reading.valueF).toFixed(0);
                setTemp(roundedTemp);
                localStorage.setItem('waterTemp', roundedTemp);

                if (reading.timestamp) {
                    localStorage.setItem('waterTempTimestamp', reading.timestamp.toISOString());
                }
                if (reading.source) {
                    localStorage.setItem('waterTempSource', reading.source);
                }

                setStatusRef.current(prevState => ({
                    ...prevState,
                    waterTemp: roundedTemp,
                    waterTempTimestamp: reading.timestamp ? reading.timestamp.toISOString() : null,
                    waterTempSource: reading.source || null,
                }));
            } catch (error) {
                if (!isMounted) return;
                setRetry('1');
            }
        };

        loadWaterTemp();

        return () => {
            isMounted = false;
        };
    }, []);

    const getCurrentTemp = () => {
        if (retry !=='') {
            return <div>
                    WATER TEMP: Error fetching data retry attempt {retry}
                </div>
        }
        return <React.Fragment>
            {temp}°<span className="greet">F</span>
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
