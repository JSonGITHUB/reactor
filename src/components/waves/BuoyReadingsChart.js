import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

async function getNearbyStations(lat, lon, radiusKm) {
    const url = `https://www.ndbc.noaa.gov/data/radial_search.php?lat=${lat}&lon=${lon}&range=${radiusKm}&time=0`;
    const resp = await fetch(url);
    const text = await resp.text();
    const lines = text.trim().split('\n');
    return lines.slice(1).map(line => {
        const [id] = line.split(/\s+/);
        return id;
    });
}

async function getLatestData(stationId) {
    const url = `https://www.ndbc.noaa.gov/data/realtime2/${stationId}.txt`;
    const resp = await fetch(url);
    const text = await resp.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(/\s+/);
    const last = lines[lines.length - 1].split(/\s+/);
    const record = headers.reduce((obj, h, i) => {
        obj[h] = parseFloat(last[i]);
        return obj;
    }, {});
    return { stationId, data: record };
}

async function getBuoyReadings(lat, lon, rangeKm = 50) {
    const stations = await getNearbyStations(lat, lon, rangeKm);
    const readings = await Promise.all(
        stations.map(id => getLatestData(id))
    );
    return readings;
}

export default function BuoyReadingsChart({ lat, lon }) {
    const [readings, setReadings] = useState([]);

    useEffect(() => {
        getBuoyReadings(lat, lon, 100).then(setReadings);
    }, [lat, lon]);

    const chartData = readings.map(({ stationId, data }) => ({
        name: stationId,
        WTMP: data.WTMP, // Water temperature
        WVHT: data.WVHT, // Wave height
        WSPD: data.WSPD, // Wind speed
    }));

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Nearby Buoy Readings</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Measurements', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="WTMP" stroke="#8884d8" name="Water Temp (°C)" />
                    <Line type="monotone" dataKey="WVHT" stroke="#82ca9d" name="Wave Height (m)" />
                    <Line type="monotone" dataKey="WSPD" stroke="#ff7300" name="Wind Speed (m/s)" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}