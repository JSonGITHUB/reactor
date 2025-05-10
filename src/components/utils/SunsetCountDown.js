import React, { useEffect, useState } from 'react';
import useOceanData from '../waves/useOceanData';
import useCurrentTime from './useCurrentTime';
import validate from './validate';

const SunsetCountDown = () => {

    const latitude = initializeData('latitude', 0);
    const longitude = initializeData('longitude', 0); 
    const sunset1uri = `https://api.sunrise-sunset.org/json?lat=${Number(latitude).toFixed(7)}&lng=${Number(longitude).toFixed(7)}`;
    const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0 });
    const [retry, setRetry] = useState('');
    const [data, getData] = useOceanData('sunset', sunset1uri, '', setRetry);
    const [sunsetTime, setSunsetTime] = useState();

    useEffect(() => {
        console.log(`SUNSET TIME: ${sunsetTime}`);
        const calculateTimeRemaining = () => {
            const currentTime = new Date();
            //const targetTime = new Date(sunsetTime);
            const targetTime = new Date(`${currentTime.toDateString()} ${sunsetTime}`);

            const timeDifference = targetTime - currentTime;
            const hours = Math.floor(timeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

            setTimeRemaining({ hours, minutes });
        };

        // Update time remaining initially and then every minute
        calculateTimeRemaining();
        const intervalId = setInterval(calculateTimeRemaining, 60000);

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [sunsetTime]);

    useEffect(() => {
        //if (data.results !== undefined) {
        if (validate(data.results) !== null) {
            console.log(`url: ${sunset1uri}`);
            console.log(`data: ${JSON.stringify(data,null,2)}`)
            setSunsetTime(data.results.civil_twilight_end);
        }
        
    },[data.results]);

    return (
        <div>
            <h2>Time Remaining</h2>
            {
                (retry !=='')
                ? <p>Error fetching data retry attempt {retry}</p>
                : <p>
                    {`${timeRemaining.hours} hours ${timeRemaining.minutes} minutes`}
                </p>
            }
        </div>
    );
};

export default SunsetCountDown;