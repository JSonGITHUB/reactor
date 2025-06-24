import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

function useCurrentPosition() {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition(pos.coords),
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );
    }, []);

    return position;
}

function useMarineForecast(lat, lon) {
    const [marineData, setMarineData] = useState(null);

    useEffect(() => {
        if (!lat || !lon) return;

        const url =
            `https://api.open-meteo.com/v1/marine` +
            `?latitude=33.07975887564837` +
            `&longitude=-117.24155450590048` +
            `&hourly=wave_height,wind_wave_height,swell_wave_height` +
            `&timezone=auto`;
      

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const time = data.hourly.time;
                const wave = data.hourly.wave_height;
                const wind = data.hourly.wind_wave_height;
                const swell = data.hourly.swell_wave_height;
                const formatted = time.map((t, i) => ({
                    time: t,
                    wave: wave[i],
                    wind: wind[i],
                    swell: swell[i],
                }));
                setMarineData(formatted);
            })
            .catch(console.error);
    }, [lat, lon]);

    return marineData;
}

export default function MarineDataChart() {
    const coords = useCurrentPosition();
    const marineData = useMarineForecast(coords?.latitude, coords?.longitude);

    if (!coords) return <p>Getting location...</p>;
    if (!marineData) return <p>Loading marine data...</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Wave Forecast (Next 24h)</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marineData.slice(0, 24)}>
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis label={{ value: 'Height (m)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wave" stroke="#1e90ff" name="Wave" />
                    <Line type="monotone" dataKey="wind" stroke="#ff7f50" name="Wind Wave" />
                    <Line type="monotone" dataKey="swell" stroke="#32cd32" name="Swell" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}