import React, { useState, useEffect } from 'react';
import useOceanData from './useOceanData.js';
import useCurrentTime from '../utils/useCurrentTime.js';

const Sunset = ({ view }) => {

    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');
    const sunset1uri = `https://api.sunrise-sunset.org/json?lat=${Number(latitude).toFixed(7)}&lng=${Number(longitude).toFixed(7)}`;
    //const sunset2uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=today';
    //const sunset3uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=2021-03-05';
    //const sunset4uri = 'https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&formatted=0';
    const [sunrise, setSunrise] = useState(null);
    const [sunset, setSunset] = useState(null);
    const [untilDark, setUntilDark] = useState(null);
    // eslint-disable-next-line
    const [data, getData] = useOceanData('sunset', sunset1uri);
    const [time] = useCurrentTime();

    useEffect(() => {
        if (data.results !== undefined) {
            //console.log(`sunset => ${JSON.stringify(data,null,2)}`)
            const sunsetTime = data.results.sunset;
            const sunsetTimeArray = sunsetTime.split(':');
            const sunsetHours = Number(sunsetTimeArray[0]) + 5;
            const sunsetMinutes = sunsetTimeArray[1];
            const sunsetDisplayTime = `${sunsetHours}:${sunsetMinutes}`
            setSunset(sunsetDisplayTime);
            const sunriseTime = data.results.sunrise;
            const sunriseTimeArray = sunriseTime.split(':');
            const sunriseHours = Number(sunriseTimeArray[0]) + 5;
            const sunriseMinutes = sunriseTimeArray[1];
            const sunriseDisplayTime = `${sunriseHours}:${sunriseMinutes}`
            setSunrise(sunriseDisplayTime);
            const untilDark = data.results.civil_twilight_end;
            const untilDarkTimeArray = untilDark.split(':');
            const untilDarkHours = Number(untilDarkTimeArray[0]) + 5;
            const untilDarkMinutes = untilDarkTimeArray[1];
            const untilDarkDisplayTime = `${untilDarkHours}:${untilDarkMinutes}`
            setUntilDark(untilDarkDisplayTime);
        }
    }, [data.results]);
    const getUntilDarkMinutes = () => Number(String(untilDark).split(':')[1]);
    const areDarkMinutesLess = () => (getUntilDarkMinutes() < time.minutes) ? true : false;
    const darkHours = () => Number(String(untilDark).split(':')[0]);
    const darkMinutes = () => (areDarkMinutesLess()) ? (time.minutes - getUntilDarkMinutes()) : (getUntilDarkMinutes() - time.minutes);
    const hourReducer = () => (areDarkMinutesLess()) ? 1 : 0;
    const hoursUntilDark = () => ((darkHours() + 12) - hourReducer()) - time.hours;
    const minutesUntilDark = () => darkMinutes();
    const displaySurfHours = () => (hoursUntilDark() > 0) ? `${hoursUntilDark()} hours` : '';
    const displaySurfMinutes = () => (minutesUntilDark() > 0) ? `${minutesUntilDark()} minutes` : '';
    const surfTime = () => `${displaySurfHours()} ${displaySurfMinutes()}`;
    // eslint-disable-next-line
    const darkClass = (hoursUntilDark() < 2) ? 'color-red m-5' : 'color-neogreen m-5';
    const colorClass = (Number(hoursUntilDark()) <= 2) ? " color-red" : " white";

    const getCurrentSunset = () => {
        return (
            <React.Fragment>
                <div className="p-5 r-10 color-yellow glassy m-5">
                    <span className="ml-2">surf time remaining:</span>
                    <br />
                    <div className={`r-10 m-5 p-10 bg-lite ${colorClass}`}>
                        {surfTime()}
                    </div>
                </div>
                {view === "full" && (
                    <div className="flexContainer">
                        <span className="flex3Column p-5 r-10 color-yellow glassy m-5">
                            <span className="ml-2">sunrise</span>
                            <br />
                            <div className="r-10 m-5 p-10 bg-lite white">
                                {sunrise}
                                <span className="copyright bold">AM</span>
                            </div>
                        </span>
                        <span className="flex3Column p-5 r-10 color-orange glassy m-5">
                            <span className="ml-2">sunset</span>
                            <br />
                            <div className="r-10 m-5 p-10 bg-lite white">
                                {sunset}
                                <span className="copyright bold">PM</span>
                            </div>
                        </span>
                        <span className="flex3Column p-5 r-10 color-graphite glassy m-5">
                            <div className="ml-2">dark</div>
                            {/*<div className="copyright bold">in {darkCount()}</div>*/}
                            <div className="r-10 m-5 p-10 bg-lite white">
                                {untilDark}
                                <span className="copyright bold">PM</span>
                            </div>
                        </span>
                    </div>
                )}
            </React.Fragment>
        );
    };

    return getCurrentSunset();
}

export default Sunset;