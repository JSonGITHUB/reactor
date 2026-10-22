// components/BeachCard.jsx
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

import { surfLabel } from "./surfEngine";

export default function BeachCard({ beach, data }) {
    const chart = data.map(d => ({
        time: new Date(d.time).toLocaleTimeString(),
        waveHeight: d.waveHeight,
        wind: d.windSpeed,
        waterTemp: d.waterTemp,
        period: d.wavePeriod,
        score: d.score
    }));
    const hasMultiplePoints = chart.length > 1;

    const latest = data[0];

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload[0]) return null;

        const data = payload[0].payload;
        return (
            <div style={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '4px',
                padding: '8px',
                color: '#fff',
                fontSize: '12px',
            }}>
                <div className='containerDetail color-yellow'>
                    {data.time}
                </div>
                <div className='containerDetail flexContainer'>
                    <div className='flexColumn contentRight' style={{ color: '#42a5f5' }}>
                        🌊
                    </div>
                    <div className='flex2Column pl-5 contentLeft'>
                        {data.waveHeight}ft
                    </div>
                </div>
                {data.wind != null && (
                    <div className='containerDetail flexContainer'>
                        <div className='flexColumn contentRight' style={{ color: '#ff7043' }}>
                            💨
                        </div>
                        <div className='flex2Column pl-5 contentLeft'>
                            {Math.round(data.wind * 1.15078)}mph
                        </div>
                    </div>
                )}
                {data.waterTemp != null && (
                    <div className='containerDetail flexContainer'>
                        <div className='flexColumn contentRight' style={{ color: '#26a69a' }}>
                            🌡️
                        </div>
                        <div className='flex2Column pl-5 contentLeft'>
                            {Math.round((data.waterTemp * 9 / 5) + 32)}°F
                        </div>
                    </div>
                )}
                {data.period != null && (
                    <div className='containerDetail flexContainer'>
                        <div className='flexColumn contentRight' style={{ color: '#ab47bc' }}>
                            ⏱️
                        </div>
                        <div className='flex2Column pl-5 contentLeft'>
                            {data.period}s
                        </div>
                    </div>
                )}
                <div className='containerDetail flexContainer'>
                    <div className='flexColumn contentRight' style={{ color: '#facc15' }}>
                        🎯
                    </div>
                    <div className='flex2Column pl-5 contentLeft'>
                        {data.score}%
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='containerDetail color-lite mt-5 bg-lite'>
            <div className='containerDetail color-yellow p-10 contentLeft'>
                {beach}
                <div className='color-orange  contentLeft size12'>
                    Height: {latest?.waveHeight ?? "..."} ft |
                    Score: {latest?.score ?? "..."}{" "}
                    {latest && surfLabel(latest)}
                </div>
            </div>
            {chart.length === 0 ? (
                <div className='containerDetail p-10 color-lite size12 contentLeft mt-5'>
                    Collecting wave samples...
                </div>
            ) : null}
            <LineChart width={300} height={180} data={chart}>
                <XAxis dataKey="time" hide />
                <YAxis />
                {/*
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f9fafb",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
                        }}
                        labelStyle={{ color: "#facc15", fontWeight: 600 }}
                        itemStyle={{ color: "#f9fafb" }}
                        cursor={{ stroke: "#6b7280", strokeDasharray: "4 4" }}
                    />
                */}
                <Tooltip content={<CustomTooltip />} />                    
                <Line
                    type="monotone"
                    dataKey="waveHeight"
                    stroke="#42a5f5"
                    strokeWidth={2}
                    dot={!hasMultiplePoints}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </div>
    );
}