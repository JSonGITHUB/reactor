import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const SunTracker = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sunrise, setSunrise] = useState(null);
    const [sunset, setSunset] = useState(null);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [sunCollapse, setSunCollapse] = useState(true);

    useEffect(() => {
        // Update current time every second
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Get user's geolocation
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                // Fetch sunrise/sunset times
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=auto`)
                    .then((res) => res.json())
                    .then((data) => {
                        const sunriseTime = new Date(data.daily.sunrise[0]);
                        const sunsetTime = new Date(data.daily.sunset[0]);
                        setSunrise(sunriseTime);
                        setSunset(sunsetTime);
                    })
                    .catch(() => setError('Failed to fetch sunrise/sunset times'));
            },
            () => setError('Location access denied')
        );
    }, []);

    // Calculate time remaining until sunset
    const timeUntilDark = sunset ? sunset.getTime() - currentTime.getTime() : 0;
    const hours = Math.floor(timeUntilDark / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDark % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilDark % (1000 * 60)) / 1000);
    const daylightHeader = () => {
        if (error !== null) {
            return <div>
                {icons.bright} DAYLIGHT: Error fetching data retry attempt {error}
            </div>
        }
        return <div>
            {/*{icons.bright} DAYLIGHT {surfTime.hours}<span className='size12'>hrs</span> {surfTime.minutes}<span className='size12'>min</span>*/}
            {icons.bright} DAYLIGHT: {hours}h{minutes}m{seconds}s
        </div>
    }

    return (
        <div>
            <div className='containerBox color-yellow size25 bg-lite size15 bold p-20'>
                <CollapseToggleButton
                    title=''
                    component={daylightHeader()}
                    isCollapsed={sunCollapse}
                    setCollapse={setSunCollapse}
                    align='left'
                />
            </div>
            {
                (sunCollapse)
                ? null
                : <div>
                    {
                        error ? (
                            <div className='containerBox color-red'>
                                {error}
                            </div>
                        ) : (
                            <div>
                                {/*
                                    sunset && timeUntilDark > 0 ? (
                                        <div className='containerBox'>
                                                    ⏳ Daylight: {hours}h {minutes}m {seconds}s
                                        </div>
                                    ) : (
                                        <div className='containerBox'>
                                            🌙 It's already dark!
                                        </div>
                                    )
                                */}
                                <div className='containerBox flexContainer'>
                                    <div className='containerBox flex2Column'>
                                        <div className='containerBox bg-lite color-yellow'>
                                            🌞 Sunrise
                                        </div>
                                        <div className='containerBox'>
                                            {sunrise ? sunrise.toLocaleTimeString() : 'Loading...'}
                                        </div>
                                    </div>
                                    <div className='containerBox flex2Column'>
                                        <div className='containerBox bg-lite color-yellow'>
                                            {icons.sunset} Sunset
                                        </div>
                                        <div className='containerBox'>
                                            {sunset ? sunset.toLocaleTimeString() : 'Loading...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            }
        </div>
    );
};

export default SunTracker;