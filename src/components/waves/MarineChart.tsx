import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface MarineDataPoint {
    time: string;
    wave_height: number;
    wind_wave_height: number;
    swell_wave_height: number;
}

const MarineChart: React.FC = () => {
    const [data, setData] = useState<MarineDataPoint[]>([]);

    useEffect(() => {
        fetch('/data.json')
            .then((res) => res.json())
            .then((json) => {
                const times = json.hourly.time;
                const wave = json.hourly.wave_height;
                const wind = json.hourly.wind_wave_height;
                const swell = json.hourly.swell_wave_height;

                const combined: MarineDataPoint[] = times.map((time: string, index: number) => ({
                    time,
                    wave_height: wave[index],
                    wind_wave_height: wind[index],
                    swell_wave_height: swell[index],
                }));

                setData(combined);
            })
            .catch((err) => {
                console.error('Failed to load marine data:', err);
            });
    }, []);

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h2>Marine Forecast (Wave Heights)</h2>
            <ResponsiveContainer>
                <LineChart data={data.slice(0, 24)} margin={{ top: 20, right: 30, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickFormatter={(t) => t.split('T')[1]} />
                    <YAxis unit="m" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wave_height" stroke="#8884d8" name="Wave Height" />
                    <Line type="monotone" dataKey="wind_wave_height" stroke="#82ca9d" name="Wind Wave" />
                    <Line type="monotone" dataKey="swell_wave_height" stroke="#ffc658" name="Swell Wave" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MarineChart;