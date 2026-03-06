import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const SunTracker = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sunrise, setSunrise] = useState(null);
    const [sunset, setSunset] = useState(null);
    const [error, setError] = useState(null);
    const [sunCollapse, setSunCollapse] = useState(true);

    useEffect(() => {
        // Update current time every second
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        // Get user's geolocation
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (!isMounted) return;
                const { latitude, longitude } = position.coords;

                // Fetch sunrise/sunset times
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=auto`, { signal: controller.signal })
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error('Failed to fetch sunrise/sunset');
                        }
                        return res.json();
                    })
                    .then((data) => {
                        if (!isMounted) return;
                        const sunriseTime = new Date(data.daily.sunrise[0]);
                        const sunsetTime = new Date(data.daily.sunset[0]);
                        setSunrise(sunriseTime);
                        setSunset(sunsetTime);
                    })
                    .catch((error) => {
                        if (error?.name === 'AbortError') return;
                        if (isMounted) {
                            setError('Failed to fetch sunrise/sunset times');
                        }
                    });
            },
            () => {
                if (isMounted) {
                    setError('Location access denied');
                }
            }
        );

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    // Calculate time remaining until sunset
    const timeUntilDark = sunset ? sunset.getTime() - currentTime.getTime() : 0;
    const hours = Math.floor(timeUntilDark / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilDark % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilDark % (1000 * 60)) / 1000);
    const daylightHeader = () => {
        if (error !== null) {
            return <div>
                {icons.bright} Daylight: Error fetching data retry attempt {error}
            </div>
        }
        return <div>
            {/*{icons.bright} DAYLIGHT {surfTime.hours}<span className='size12'>hrs</span> {surfTime.minutes}<span className='size12'>min</span>*/}
            {icons.bright} Daylight: {hours}h{minutes}m{seconds}s
        </div>
    }

    return (
        <div>
            <div className='containerDetail mt-5 mb-5 color-yellow size20 bg-lite size15 bold p-20'>
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