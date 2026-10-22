// components/AlertsPanel.jsx
import { useState } from "react";
import { BEACHES } from "./Beaches";

export default function AlertsPanel({ alerts, selectedBeach, onSelectBeach, onClearSelection }) {
    const [sortMode, setSortMode] = useState("north-to-south");

    const northToSouthBeachOrder = BEACHES
        .slice()
        .sort((a, b) => b.lat - a.lat)
        .map((beach) => beach.name);

    const northToSouthIndex = northToSouthBeachOrder.reduce((acc, name, index) => {
        acc[name] = index;
        return acc;
    }, {});

    const latestByBeach = Object.values(
        alerts.reduce((acc, alert) => {
            const current = acc[alert.beach];
            if (!current || alert.time > current.time) {
                acc[alert.beach] = alert;
            }
            return acc;
        }, {})
    );

    const sortedAlerts = latestByBeach.slice().sort((a, b) => {
        if (sortMode === "best-score") {
            return b.score - a.score;
        }

        if (sortMode === "alphabetic") {
            return a.beach.localeCompare(b.beach);
        }

        const aIdx = northToSouthIndex[a.beach];
        const bIdx = northToSouthIndex[b.beach];

        if (aIdx == null && bIdx == null) {
            return a.beach.localeCompare(b.beach);
        }
        if (aIdx == null) return 1;
        if (bIdx == null) return -1;
        return aIdx - bIdx;
    });

    return (
        <div className='containerDetail bg-lite'>
            <div className='containerDetail p-10 color-orange size20 contentLeft flexContainer mb-5'>
                <div className='flex2Column'>🔔 Alerts</div>
                <div className='flex2Column contentRight size12'>
                    <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value)}
                        className='containerDetail p-10 color-yellow bg-tinted'
                    >
                        <option value='north-to-south'>North to South</option>
                        <option value='best-score'>Best Score Desc</option>
                        <option value='alphabetic'>Alphabetic</option>
                    </select>
                </div>
            </div>

            <div className='containerDetail flexContainer p-10 size12 mb-5'>
                <div className='flex2Column color-yellow contentLeft pt-10 pb-10 pl-5'>
                    {selectedBeach ? `Selected: ${selectedBeach}` : "Selected: All Beaches"}
                </div>
                <div className='flex2Column contentRight'>
                    <button
                        type='button'
                        onClick={() => onClearSelection?.()}
                        className='containerDetail p-10 color-yellow bg-tinted'
                    >
                        Show All
                    </button>
                </div>
            </div>

            {sortedAlerts.length === 0 && <div className='containerDetail color-lite contentLeft size15 m-5 bg-lite p-10'>No alerts</div>}
            <div className='containerDetail ht-200'>
                {sortedAlerts.map((a, i) => (
                    <div
                        key={i}
                        onClick={() => onSelectBeach?.(a.beach)}
                        className={`containerDetail button contentLeft size15 m-5 p-5 ${selectedBeach === a.beach ? "bg-tinted color-yellow" : "bg-lite color-lite"}`}
                    >
                        🌊 {a.beach} → {((a.score / 3).toFixed(1) < 30) ? '👎🏽' : ((a.score / 3).toFixed(1) < 60) ? '👍🏽' : ((a.score / 3).toFixed(1) < 80) ? '🤙🏽' : '🔥' } @{" "}
                        {new Date(a.time).toLocaleTimeString()}
                    </div>
                ))}
            </div>
        </div>
    );
}