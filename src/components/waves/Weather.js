import React, { useState, useEffect } from 'react';

const Weather = () => {
    const HOURLY_HOURS_TO_SHOW = 24;
    const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
    const ALERT_DB_NAME = 'kfa-weather-alerts';
    const PREFERENCES_KEY = 'weather-preferences';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [current, setCurrent] = useState(null);
    const [hourly, setHourly] = useState([]);
    const [daily, setDaily] = useState([]);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [alertConfig, setAlertConfig] = useState([]);
    const [showAlertPanel, setShowAlertPanel] = useState(false);
    const [triggeredAlerts, setTriggeredAlerts] = useState([]);

    const WEATHER_CODE_LABEL = {
        0: '☀️ Sunny',
        1: '🌤️ Clear',
        2: '⛅️ Cloudy',
        3: '☁️ Overcast',
        45: '😶‍🌫️ Fog',
        48: '😶‍🌫️ Heavy fog',
        51: '🌦️ Sprinkles',
        53: '🌦️ Drizzle',
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
    // Map temperature to color spectrum for better UX
    const getTempColor = (tempF) => {
        if (tempF === null || tempF === undefined) return '#888888';
        
        // Color spectrum based on temperature
        // 0°F and below: deep blue
        // 32°F: light blue (freezing)
        // 50°F: cyan
        // 70°F: green
        // 85°F: orange
        // 100°F+: red
        
        if (tempF <= 0) return '#001a4d'; // Deep blue
        if (tempF < 32) {
            const ratio = (tempF) / 32;
            return `hsl(220, 100%, ${20 + ratio * 40}%)`; // Blue to light blue
        }
        if (tempF < 50) {
            const ratio = (tempF - 32) / 18;
            return `hsl(${220 - ratio * 80}, 100%, ${60 - ratio * 20}%)`; // Light blue to cyan
        }
        if (tempF < 70) {
            const ratio = (tempF - 50) / 20;
            return `hsl(${140 - ratio * 60}, 100%, ${40 + ratio * 10}%)`; // Cyan to green
        }
        if (tempF < 85) {
            const ratio = (tempF - 70) / 15;
            return `hsl(${80 - ratio * 40}, 100%, ${40 + ratio * 10}%)`; // Green to yellow-orange
        }
        if (tempF < 100) {
            const ratio = (tempF - 85) / 15;
            return `hsl(${40 - ratio * 20}, 100%, ${50 - ratio * 10}%)`; // Orange to red-orange
        }
        // 100°F+: deep red
        return '#cc0000';
    };

    // Get contrasting text color based on background brightness
    const getTextColor = (bgColor) => {
        // For very dark or very light backgrounds, use white or dark text
        if (bgColor.includes('hsl')) {
            const match = bgColor.match(/(\d+)%\)/);
            if (match) {
                const lightness = parseInt(match[1]);
                return lightness > 50 ? '#333333' : '#333333';
            }
        }
        // Default for hex colors
        return '#ffffff';
    };

    // Alert persistence functions
    const saveAlertConfig = async (config) => {
        try {
            console.log('[Weather] Saving alert config:', config);
            const db = await openIndexedDB();
            const tx = db.transaction(['alerts'], 'readwrite');
            const store = tx.objectStore('alerts');
            
            return new Promise((resolve, reject) => {
                const request = store.put({ id: 'config', data: config });
                request.onsuccess = () => {
                    console.log('[Weather] ✓ Alert config saved to IndexedDB');
                    resolve();
                };
                request.onerror = () => {
                    console.error('[Weather] ✗ Error saving alert config:', request.error);
                    reject(request.error);
                };
            });
        } catch (err) {
            console.error('[Weather] ✗ Failed to save alert config:', err);
        }
    };

    const loadAlertConfig = async () => {
        try {
            console.log('[Weather] Loading alert config from IndexedDB');
            const db = await openIndexedDB();
            const tx = db.transaction(['alerts'], 'readonly');
            const store = tx.objectStore('alerts');
            
            return new Promise((resolve) => {
                const request = store.get('config');
                request.onsuccess = () => {
                    const data = request.result?.data || [];
                    console.log('[Weather] ✓ Alert config loaded:', data);
                    resolve(data);
                };
                request.onerror = () => {
                    console.error('[Weather] ✗ Error loading alert config:', request.error);
                    resolve([]);
                };
            });
        } catch (err) {
            console.error('[Weather] ✗ Failed to load alert config:', err);
            return [];
        }
    };

    const openIndexedDB = () => {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(ALERT_DB_NAME, 1);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => resolve(req.result);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('alerts')) {
                    db.createObjectStore('alerts', { keyPath: 'id' });
                }
            };
        });
    };

    // Check alerts against current weather data
    const checkAlerts = (currentWeather, hourlyData) => {
        const triggered = [];
        
        alertConfig.forEach((alert) => {
            let isTriggered = false;
            let message = '';

            if (alert.type === 'wind_below' && currentWeather) {
                if (currentWeather.windspeed < alert.value) {
                    isTriggered = true;
                    message = `💨 Wind speed dropped to ${currentWeather.windspeed} mph (below ${alert.value} mph)`;
                }
            } else if (alert.type === 'wind_above' && currentWeather) {
                if (currentWeather.windspeed > alert.value) {
                    isTriggered = true;
                    message = `💨 Wind speed increased to ${currentWeather.windspeed} mph (above ${alert.value} mph)`;
                }
            } else if (alert.type === 'temp_above' && currentWeather) {
                if (currentWeather.temperature > alert.value) {
                    isTriggered = true;
                    message = `🌡️ Temperature is ${currentWeather.temperature}°F (above ${alert.value}°F)`;
                }
            } else if (alert.type === 'temp_below' && currentWeather) {
                if (currentWeather.temperature < alert.value) {
                    isTriggered = true;
                    message = `🌡️ Temperature dropped to ${currentWeather.temperature}°F (below ${alert.value}°F)`;
                }
            } else if (alert.type === 'weather_code' && currentWeather) {
                if (currentWeather.weathercode === alert.value) {
                    const weatherLabel = WEATHER_CODE_LABEL[alert.value] || 'Unknown weather';
                    isTriggered = true;
                    message = `${weatherLabel}`;
                }
            }

            if (isTriggered) {
                triggered.push({
                    id: alert.id,
                    type: alert.type,
                    message,
                    timestamp: new Date().toLocaleTimeString(),
                });
            }
        });

        setTriggeredAlerts(triggered);
    };

    // Add new alert
    const addAlert = async (type, value, label) => {
        console.log('[Weather] Adding alert:', { type, value, label });
        const newAlert = {
            id: Date.now(),
            type,
            value,
            label,
        };
        const newConfig = [...alertConfig, newAlert];
        console.log('[Weather] New config:', newConfig);
        setAlertConfig(newConfig);
        const saved = await saveAlertConfig(newConfig);
        console.log('[Weather] Alert saved, returned:', saved);
    };

    // Remove alert
    const removeAlert = async (id) => {
        console.log('[Weather] Removing alert:', id);
        const newConfig = alertConfig.filter((a) => a.id !== id);
        setAlertConfig(newConfig);
        await saveAlertConfig(newConfig);
    };

    // Preferences persistence (localStorage)
    const savePreferences = (prefs) => {
        try {
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
        } catch (err) {
            console.warn('Failed to save preferences:', err);
        }
    };

    const loadPreferences = () => {
        try {
            const stored = localStorage.getItem(PREFERENCES_KEY);
            return stored ? JSON.parse(stored) : { showAlertPanel: false };
        } catch (err) {
            console.warn('Failed to load preferences:', err);
            return { showAlertPanel: false };
        }
    };

    const updateShowAlertPanel = (value) => {
        setShowAlertPanel(value);
        savePreferences({ showAlertPanel: value });
    };

    useEffect(() => {
        if (!latitude || !longitude) {
            setError('No coordinates provided');
            setLoading(false);
            return undefined;
        }

        const fetchWeather = async (isInitialLoad = false) => {
            if (isInitialLoad) {
                setLoading(true);
            }
            setError('');
            try {
                // Example endpoint for Open-Meteo: gets current + hourly + daily forecast + waves
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,weathercode,windspeed_10m,winddirection_10m,wave_height,wave_direction&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto`;
                const resp = await fetch(url);
                if (!resp.ok) {
                    throw new Error(`Weather request failed: ${resp.status}`);
                }
                const data = await resp.json();

                // conversion helpers
                const cToF = c => (c === null || c === undefined) ? null : +(c * 9 / 5 + 32).toFixed(1);
                const kmhToMph = k => (k === null || k === undefined) ? null : +(k * 0.621371).toFixed(1);
                const mmToInches = mm => (mm === null || mm === undefined) ? null : +(mm / 25.4).toFixed(2);
                const mToFeet = m => (m === null || m === undefined) ? null : +(m * 3.28084).toFixed(2);

                // Convert wind angle (0-360°) to cardinal/intercardinal direction
                const getWindDirection = (angle) => {
                    if (angle === null || angle === undefined) return 'N/A';
                    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
                    const index = Math.round(angle / 45) % 8;
                    return directions[index];
                };

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

                // hourly: pick upcoming hours from now and convert units.
                const allHours = data.hourly.time.map((t, idx) => ({
                    time: t,
                    tempF: cToF(data.hourly.temperature_2m[idx]),
                    precipIn: mmToInches(data.hourly.precipitation[idx]),
                    code: data.hourly.weathercode[idx],
                    windMph: kmhToMph(data.hourly.windspeed_10m[idx]),
                    windAngle: data.hourly.winddirection_10m[idx],
                    windDir: getWindDirection(data.hourly.winddirection_10m[idx]),
                    swellFeet: mToFeet(data.hourly.wave_height[idx]),
                    swellAngle: data.hourly.wave_direction[idx],
                    swellDir: getWindDirection(data.hourly.wave_direction[idx]),
                }));

                const nowMs = Date.now();
                const upcomingHours = allHours
                    .filter((h) => {
                        const hourMs = new Date(h.time).getTime();
                        return Number.isFinite(hourMs) && hourMs >= (nowMs - (30 * 60 * 1000));
                    })
                    .slice(0, HOURLY_HOURS_TO_SHOW);

                const hours = upcomingHours.length > 0
                    ? upcomingHours
                    : allHours.slice(0, HOURLY_HOURS_TO_SHOW);
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
                if (isInitialLoad) {
                    setLoading(false);
                }
            }
        };

        fetchWeather(true);
        const timerId = setInterval(() => {
            fetchWeather(false);
        }, REFRESH_INTERVAL_MS);

        return () => {
            clearInterval(timerId);
        };
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

    // Load alert configuration and preferences on mount
    useEffect(() => {
        console.log('[Weather] Component mounted, loading configuration...');
        const loadConfig = async () => {
            const config = await loadAlertConfig();
            console.log('[Weather] Setting alertConfig to:', config);
            setAlertConfig(config);
        };
        loadConfig();

        const prefs = loadPreferences();
        console.log('[Weather] Loading preferences:', prefs);
        setShowAlertPanel(prefs.showAlertPanel);
    }, []);

    // Re-check alerts whenever alertConfig changes
    useEffect(() => {
        if (current && alertConfig.length > 0) {
            checkAlerts(current, hourly);
        }
    }, [alertConfig]);

    if (loading) {
        return <div className='color-yellow'><span className='blinking-fade'>⏳</span> Loading weather…</div>;
    }
    if (error) {
        return <div className='color-red'>Error: {error}</div>;
    }
    const formatToWeekday = (dateStr) => {
        if (!dateStr) return '';
        // ensure Date accepts the string: prefer YYYY-MM-DD -> YYYY-MM-DDT00:00:00
        const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, { weekday: 'long' }); // e.g. "Monday"
    };

    const formatHourAmPm = (dateStr) => {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) {
            return dateStr;
        }
        return date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            hour12: true
        });
    };

    const formatDateWithNumber = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${weekday} ${month}/${day}`;
    };

    const mostCurrentHourlyIndex = hourly.reduce((closestIndex, hourEntry, index, all) => {
        const entryMs = new Date(hourEntry.time).getTime();
        if (!Number.isFinite(entryMs)) {
            return closestIndex;
        }

        if (closestIndex === -1) {
            return index;
        }

        const closestMs = new Date(all[closestIndex].time).getTime();
        if (!Number.isFinite(closestMs)) {
            return index;
        }

        return Math.abs(entryMs - Date.now()) < Math.abs(closestMs - Date.now())
            ? index
            : closestIndex;
    }, -1);

    return (
        <div className='containerDetail bg-lite color-lite size20 contentLeft ml-5 mr-5 mt--25 mb-10'>
            <div className='containerDetail bg-lite mb-5 p-20 color-yellow size20'>
                Weather
            </div>

            {/* Alert Triggered Display */}
            {triggeredAlerts.length > 0 && (
                <div className='containerDetail bg-lite mb-5 size20 contentLeft'>
                    <div className='containerDetail bg-lite mb-5 p-10 color-red size20'>
                        🚨 Active Alerts ({triggeredAlerts.length})
                    </div>
                    {triggeredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className='containerDetail bg-tintedMedium p-10 mb-5 size20 color-red'
                            style={{ borderLeft: '4px solid #ff0000' }}
                        >
                            <div className='flexContainer'>
                                <div className='flexColumn contentLeft' style={{ flex: 1 }}>
                                    {alert.message}
                                </div>
                                <div className='flexColumn contentRight size14 copyright color-yellow'>
                                    {alert.timestamp}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Alert Configuration Panel */}
            <div className='containerDetail bg-lite mb-5 size20 contentLeft'>
                <div
                    className='containerDetail bg-lite mb-5 p-10 color-yellow size20'
                    onClick={() => updateShowAlertPanel(!showAlertPanel)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    🔔 Weather Alerts {showAlertPanel ? '▼' : '▶'} ({alertConfig.length})
                </div>

                {showAlertPanel && (
                    <div className='containerDetail bg-tintedMedium p-10 mb-5'>
                        <div className='mb-10'>
                            <h4 className='color-yellow mb-5'>Alert Types:</h4>
                            <div className='flexContainer' style={{ flexWrap: 'wrap', gap: '10px' }}>
                                <button
                                    className='button bg-dark color-yellow p-10'
                                    onClick={() => {
                                        const value = prompt('Wind speed threshold (mph):', '5');
                                        if (value) addAlert('wind_below', parseFloat(value), `Wind below ${value} mph`);
                                    }}
                                >
                                    💨 Wind Below
                                </button>
                                <button
                                    className='button bg-dark color-yellow p-10'
                                    onClick={() => {
                                        const value = prompt('Wind speed threshold (mph):', '20');
                                        if (value) addAlert('wind_above', parseFloat(value), `Wind above ${value} mph`);
                                    }}
                                >
                                    💨 Wind Above
                                </button>
                                <button
                                    className='button bg-dark color-yellow p-10'
                                    onClick={() => {
                                        const value = prompt('Temperature threshold (°F):', '80');
                                        if (value) addAlert('temp_above', parseFloat(value), `Temp above ${value}°F`);
                                    }}
                                >
                                    🌡️ Temp Above
                                </button>
                                <button
                                    className='button bg-dark color-yellow p-10'
                                    onClick={() => {
                                        const value = prompt('Temperature threshold (°F):', '32');
                                        if (value) addAlert('temp_below', parseFloat(value), `Temp below ${value}°F`);
                                    }}
                                >
                                    🌡️ Temp Below
                                </button>
                                <button
                                    className='button bg-dark color-yellow p-10'
                                    onClick={() => addAlert('weather_code', 0, 'Sunny weather')}
                                >
                                    ☀️ Sunny (Code 0)
                                </button>
                                <button
                                    className='button bg-dark color-yellow p-10'
                                    onClick={() => addAlert('weather_code', 1, 'Clear weather')}
                                >
                                    🌤️ Clear (Code 1)
                                </button>
                            </div>
                        </div>

                        {alertConfig.length > 0 && (
                            <div className='containerDetail bg-lite p-10'>
                                <h4 className='color-yellow mb-5'>Active Alert Rules:</h4>
                                {alertConfig.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className='containerDetail bg-dark p-10 mb-5 flexContainer'
                                        style={{ alignItems: 'center', justifyContent: 'space-between' }}
                                    >
                                        <div className='flexColumn contentLeft color-yellow'>
                                            {alert.label}
                                        </div>
                                        <button
                                            className='button bg-red color-dark p-5'
                                            onClick={() => removeAlert(alert.id)}
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className='containerDetail bg-lite mb-5 size20 contentLeft'>
                <div className='containerDetail bg-lite mb-5 p-10 color-yellow size20'>
                    Current Weather:
                </div>
                <div className='flexContainer containerDetail bg-tintedMedium p-10 size20'>
                    <div className='flexColumn'>
                        {current ? (WEATHER_CODE_LABEL[current.weathercode] || ''): 'N/A'}
                    </div>
                    <div className='flexColumn'>
                        💨 {current ? `${current.windspeed} mph` : 'N/A'}
                    </div>
                    <div className='flexColumn'>
                        🌡️ {current ? `${current.temperature}°F` : 'N/A'}
                    </div>
                </div>
            </div>
            <div className='containerDetail bg-lite mb-5 size20'>
                <div className='containerDetail bg-lite mb-5 p-10 color-yellow size20 contentLeft'>
                    Hourly Forecast
                </div>
                <div className='containerDetail bg-tintedMedium size20 ht-200'>
                    {hourly.map((h, idx) => {
                        const w = weatherCodeMap[h.code] || { };
                        const isMostCurrentHour = idx === mostCurrentHourlyIndex;
                        const bgColor = getTempColor(h.tempF);
                        const textColor = getTextColor(bgColor);
                        return <div key={idx} style={{backgroundColor: bgColor, color: textColor}} className={`containerDetail ${isMostCurrentHour ? '' : ''} ${(idx === hourly.length - 1)?'':'mb-5'} pt-5 pb-5 pr-5 pl-10`}>
                                    <div className='flexContainer'>
                                        <div className='flexColumn contentRight'>
                                            ⏰ {formatHourAmPm(h.time).split(' ')[0]}:00
                                            <span className='copyright'>
                                                {formatHourAmPm(h.time).split(' ')[1]}
                                            </span>
                                        </div>
                                        <div className='flexContainer flexColumn'>
                                            <div className='flexColumn mr-5 mt--5'>
                                                💨
                                            </div>
                                            <div className='flexColumn mr-5 mt--5 contentCenter'>
                                                {h.windDir}
                                            </div>
                                            <div className='flexColumn mr-5 mt-5 contentRight'>
                                                {(typeof h.windMph === 'number') ? `${h.windMph.toFixed(0)}` : 'N/A'}<span className='copyright'>mph</span>
                                            </div>
                                        </div>
                                        <div className='flexColumn contentLeft'>
                                            {w.icon || '❔'} {w.desc.split(' ')[0] || 'Unknown'}
                                        </div>
                                        <div className='flexColumn contentLeft ' style={{fontSize: '1.2em', fontWeight: ''}}>
                                            🌡️ {(typeof h.tempF === 'number') ? `${h.tempF.toFixed(0)}°F` : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                    })}
                </div>
            </div>
            <div className='containerDetail bg-lite size20'>
                <div className='containerDetail bg-lite mb-5 p-10 color-yellow size20 contentLeft'>
                    Daily Forecast
                </div>
                <div className='containerDetail bg-tintedMedium size20'>
                    {daily.map((d, idx) => {
                        const w = weatherCodeMap[d.code] || {};
                        const bgColor = getTempColor(d.maxF);
                        const textColor = getTextColor(bgColor);
                        return <div key={idx} style={{backgroundColor: bgColor, color: textColor}} className={`containerDetail flexContainer  ${(idx === daily.length - 1)?'':'mb-5'} pt-10 pb-10 size20`}>
                                    <div className='flexColumn contentLeft'>
                                        📆 {formatDateWithNumber(d.date)}
                                    </div>
                                    <div className='flexColumn'>
                                        {w.icon || '❔'} {w.desc || 'Unknown'}
                                    </div>
                                    <div className='flexColumn contentRight ml-20 ' style={{fontSize: '1.1em', fontWeight: ''}}>
                                        🌡️ {d.maxF.toFixed(0)}°F
                                    </div>
                                </div>
                })}
                </div>
            </div>
        </div>
    );
};

export default Weather;