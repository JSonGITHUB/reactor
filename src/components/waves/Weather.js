import React, { useState, useEffect } from 'react';

const Weather = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [current, setCurrent] = useState(null);
    const [hourly, setHourly] = useState([]);
    const [daily, setDaily] = useState([]);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    const WEATHER_CODE_LABEL = {
        0: '☀️ Clear sky',
        1: '🌤️ Mainly clear',
        2: '⛅️ Partly cloudy',
        3: '☁️ Overcast',
        45: '😶‍🌫️ Fog',
        48: '😶‍🌫️ Depositing rime fog',
        51: '🌦️ Light drizzle',
        53: '🌦️ Moderate drizzle',
        55: '🌦️ Dense drizzle',
        56: '🥶🌦️ Light freezing drizzle',
        57: '🥶🌦️ Dense freezing drizzle',
        61: '🌦️ Light rain',
        63: '🌧️ Moderate rain',
        65: '🌧️🌧️ Heavy rain',
        66: '🥶🌧️ Light freezing rain',
        67: '🥶🌧️🌧️ Heavy freezing rain',
        71: '☃️ Light snow',
        73: '🌨️ Moderate snow',
        75: '🌨️🌨️ Heavy snow',
        77: '❄️ Snow grains',
        80: '🌦️ Light rain showers',
        81: '🌦️ Moderate rain showers',
        82: '🌧️🌧️🌧️ Violent rain showers',
        85: '🌨️ Light snow showers',
        86: '🌨️🌨️ Heavy snow showers',
        95: '⛈️ Thunderstorm',
        96: '🥶⛈️ Thunderstorm with slight hail',
        99: '🥶⛈️⛈️ Thunderstorm with heavy hail'
    };
    // Map Open-Meteo weather codes to emoji (or import from your icon set)
    const weatherCodeMap = {
        0: { icon: '☀️', desc: 'Clear sky' },
        1: { icon: '🌤️', desc: 'Mainly clear' },
        2: { icon: '⛅', desc: 'Partly cloudy' },
        3: { icon: '☁️', desc: 'Overcast' },
        45: { icon: '🌫️', desc: 'Fog' },
        48: { icon: '🌫️', desc: 'Depositing rime fog' },
        51: { icon: '🌦️', desc: 'Light drizzle' },
        53: { icon: '🌦️', desc: 'Moderate drizzle' },
        55: { icon: '🌧️', desc: 'Dense drizzle' },
        61: { icon: '🌧️', desc: 'Slight rain' },
        63: { icon: '🌧️', desc: 'Moderate rain' },
        65: { icon: '🌧️', desc: 'Heavy rain' },
        71: { icon: '🌨️', desc: 'Slight snow' },
        73: { icon: '🌨️', desc: 'Moderate snow' },
        75: { icon: '❄️', desc: 'Heavy snow' },
        77: { icon: '🌨️', desc: 'Snow grains' },
        80: { icon: '🌦️', desc: 'Rain showers (slight)' },
        81: { icon: '🌧️', desc: 'Rain showers (moderate)' },
        82: { icon: '⛈️', desc: 'Rain showers (violent)' },
        85: { icon: '🌨️', desc: 'Snow showers (slight)' },
        86: { icon: '❄️', desc: 'Snow showers (heavy)' },
        95: { icon: '⛈️', desc: 'Thunderstorm' },
        96: { icon: '⛈️', desc: 'Thunderstorm with hail' },
        99: { icon: '🌩️', desc: 'Severe thunderstorm with hail' },
    };

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            setError('');
            try {
                // Example endpoint for Open-Meteo: gets current + hourly + daily forecast
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto`;
                const resp = await fetch(url);
                const data = await resp.json();

                // conversion helpers
                const cToF = c => (c === null || c === undefined) ? null : +(c * 9 / 5 + 32).toFixed(1);
                const kmhToMph = k => (k === null || k === undefined) ? null : +(k * 0.621371).toFixed(1);
                const mmToInches = mm => (mm === null || mm === undefined) ? null : +(mm / 25.4).toFixed(2);

                // convert current weather
                if (data.current_weather) {
                    setCurrent({
                        temperature: cToF(data.current_weather.temperature), // °F
                        windspeed: kmhToMph(data.current_weather.windspeed), // mph
                        weathercode: data.current_weather.weathercode,
                        time: data.current_weather.time
                    });
                } else {
                    setCurrent(null);
                }

                // hourly: pick next ~12 hours and convert units
                const hours = data.hourly.time.map((t, idx) => ({
                    time: t,
                    tempF: cToF(data.hourly.temperature_2m[idx]),
                    precipIn: mmToInches(data.hourly.precipitation[idx]),
                    code: data.hourly.weathercode[idx],
                })).slice(0, 12);
                setHourly(hours);

                // daily: next ~7 days, convert temps to °F
                const days = data.daily.time.map((t, idx) => ({
                    date: t,
                    maxF: cToF(data.daily.temperature_2m_max[idx]),
                    minF: cToF(data.daily.temperature_2m_min[idx]),
                    code: data.daily.weathercode[idx],
                }));
                setDaily(days);

            } catch (err) {
                setError('Failed to load weather data');
            } finally {
                setLoading(false);
            }
        };

        if (latitude && longitude) {
            fetchWeather();
        } else {
            setError('No coordinates provided');
            setLoading(false);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLatitude(latitude);
                setLongitude(longitude);
            },
            (err) => {
                setError('Unable to retrieve your location. Please allow location access.');
                setLoading(false);
            }
        );
    }, []);

    if (loading) {
        return <div>Loading weather…</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }
    const formatToWeekday = (dateStr) => {
        if (!dateStr) return '';
        // ensure Date accepts the string: prefer YYYY-MM-DD -> YYYY-MM-DDT00:00:00
        const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, { weekday: 'long' }); // e.g. "Monday"
    };

    return (
        <div className='containerDetail bg-lite color-lite size20 contentLeft ml-5 mr-5 mt--20'>
            <div className='containerDetail bg-lite mb-5 p-20 color-yellow size20'>
                Weather
            </div>
            <div className='containerDetail bg-lite mb-5 size20 contentLeft'>
                <div className='containerDetail bg-lite p-10 mb-5 color-yellow size20'>
                    Temperature:
                </div>
                <div className='containerDetail bg-tintedMedium p-10 size20'>
                    🌡️ {current ? `${current.temperature}°F` : 'N/A'}
                </div>
            </div>
            <div className='containerDetail bg-lite mb-5 size20 contentLeft'>
                <div className='containerDetail bg-lite mb-5 p-10 color-yellow size20'>
                    Wind Speed:
                </div>
                <div className='containerDetail bg-tintedMedium p-10 size20'>
                    💨 {current ? `${current.windspeed} mph` : 'N/A'}
                </div>
            </div>
            <div className='containerDetail bg-lite mb-5 size20 contentLeft'>
                <div className='containerDetail bg-lite mb-5 p-10 color-yellow size20'>
                    Current Weather:
                </div>
                <div className='containerDetail bg-tintedMedium p-10 size20'>
                    {current ? WEATHER_CODE_LABEL[current.weathercode] : 'N/A'}
                </div>
            </div>
            <div className='containerDetail bg-lite mb-5 size20'>
                <div className='containerDetail bg-lite mb-5 p-10 color-yellow size20 contentLeft'>
                    Hourly Forecast
                </div>
                <div className='containerDetail bg-lite size20'>
                    {hourly.map((h, idx) => {
                        const hour = new Date(h.time).getHours();
                        const w = weatherCodeMap[h.code] || { };
                        return <div key={idx} className={`containerDetail flexContainer bg-tintedMedium ${(idx === hourly.length - 1)?'':'mb-5'} p-10 size20`}>
                                    <div className='flex6Column color-yellow contentRight pr-10'>
                                        {hour}:00
                                    </div>
                                    <div className='flex2Column contentLeft pl-5'>
                                        {w.icon || '❔'} {w.desc || 'Unknown'}
                                    </div>
                                    <div className='flex6Column contentLeft pl-10'>
                                        {h.tempF.toFixed(0)}°F
                                    </div>
                                </div>
                    })}
                </div>
            </div>
            <div className='containerDetail bg-lite size20'>
                <div className='containerDetail bg-lite mb-5 p-10 color-yellow size20 contentLeft'>
                    Daily Forecast
                </div>
                <div className='containerDetail bg-lite size20'>
                    {daily.map((d, idx) => {
                        const w = weatherCodeMap[d.code] || {};
                        return <div key={idx} className={`containerDetail flexContainer bg-tintedMedium ${(idx === daily.length - 1)?'':'mb-5'} p-10 size20`}>
                                    <div className='color-yellow flex6Column'>
                                        {formatToWeekday(d.date).substring(0,3)}
                                    </div>
                                    <div className='flex2Column'>
                                        {w.icon || '❔'} {w.desc || 'Unknown'}
                                    </div>
                                    <div className='flex6Column contentRight ml-20'>
                                        {d.maxF.toFixed(0)}°F
                                    </div>
                                </div>
                })}
                </div>
            </div>
        </div>
    );
};

export default Weather;