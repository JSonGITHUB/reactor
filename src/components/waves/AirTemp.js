import React, { useState, useEffect, useRef } from 'react';

const AirTemp = ({ isMotionOn, setStatus }) => {
    
    const [temp,setTemp] = useState();
    const setStatusRef = useRef(setStatus);

    useEffect(() => {
        setStatusRef.current = setStatus;
    }, [setStatus]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        async function fetchAirTemp(stationId = '9410230') {
            const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');

            async function getDataForDate(date) {
                const dateStr = formatDate(date);
                const airUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&end_date=${dateStr}&station=${stationId}&product=air_temperature&units=english&time_zone=lst_ldt&application=ports_screen&format=json`;

                const res = await fetch(airUrl, { signal: controller.signal });
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

                const json = await res.json();
                return json?.data ?? [];
            }

            try {
                const today = new Date();
                let data = await getDataForDate(today);

                if (!data.length) {
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);
                    console.warn('No data for today, falling back to yesterday.');
                    data = await getDataForDate(yesterday);
                }

                if (!data.length) throw new Error('No air temperature data found at all');

                const latest = data[data.length - 1];
                return parseFloat(latest.v);
            } catch (error) {
                if (error?.name === 'AbortError') {
                    return null;
                }
                console.error('Error fetching air temperature:', error);
                return null;
            }
        }
        fetchAirTemp().then(temp => {
            if (!isMounted) return;
            if (temp !== null) {
                console.log(`AirTemp => fetchAirTemp => Current air temperature: ${temp} °F`);
                const roundedTemp = Number(temp).toFixed(0);
                setTemp(roundedTemp);
                if (typeof setStatusRef.current === 'function') {
                    setStatusRef.current(prevState => ({
                        ...prevState,
                        airTemp: roundedTemp
                    }));
                }
            } else {
                const cachedTempRaw = localStorage.getItem('airTemp');
                const cachedTemp = cachedTempRaw ? JSON.parse(cachedTempRaw) : null;
                if (cachedTemp !== null && cachedTemp !== undefined && cachedTemp !== '') {
                    const roundedCachedTemp = Number(cachedTemp).toFixed(0);
                    setTemp(roundedCachedTemp);
                    if (typeof setStatusRef.current === 'function') {
                        setStatusRef.current(prevState => ({
                            ...prevState,
                            airTemp: roundedCachedTemp
                        }));
                    }
                    console.warn('AirTemp => Using cached air temperature');
                } else {
                    console.log('AirTemp => fetchAirTemp => No temperature data available');
                }
            }
        });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);
    useEffect(() => {
        if (temp !== null && temp !== undefined && temp !== '') {
            localStorage.setItem('airTemp', JSON.stringify(temp));
        }
    }, [temp]);

    return <div>
                {temp}°F
            </div>
    
}

export default AirTemp;
