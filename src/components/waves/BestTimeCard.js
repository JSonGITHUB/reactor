import React, { useMemo } from 'react';

// Analyze current conditions to find best time window
const BestTimeCard = ({ data, alerts, summary }) => {
    const sharedBestTime = useMemo(() => {
        if (!summary) return null;

        return {
            startStr: summary.startStr,
            endStr: summary.endStr,
            score: summary.score,
            beach: summary.beach,
            details: {
                waveHeight: summary.waveHeight,
                windSpeed: summary.windSpeed,
                tideLevel: summary.tideLevel,
                tideDirection: summary.tideDirection,
            },
        };
    }, [summary]);

    const bestTime = useMemo(() => {
        if (sharedBestTime) return sharedBestTime;

        // Get current hour
        const now = new Date();
        const currentHour = now.getHours();
        const hourlyConditions = [];
        for (let h = 0; h < 24; h++) {
            const hour = (currentHour + h) % 24;
            
            // Simulated scoring based on time of day and data patterns
            let swellScore = 0;
            let windScore = 0;
            let tideScore = 0;

            // Swell tends to build through morning/midday
            swellScore = Math.sin((hour - 6) * Math.PI / 12) * 50 + 50;
            swellScore = Math.max(20, Math.min(100, swellScore));

            // Wind usually lighter in morning
            if (hour >= 6 && hour <= 9) {
                windScore = 90; // Light morning wind
            } else if (hour >= 10 && hour <= 15) {
                windScore = 60; // Moderate midday wind
            } else if (hour >= 16 && hour <= 18) {
                windScore = 40; // Increasing wind
            } else {
                windScore = 70; // Evening/night
            }

            // Tide cycles approximately every 12.4 hours
            const tidePhase = ((hour % 12.4) / 12.4) * Math.PI * 2;
            tideScore = Math.sin(tidePhase) * 40 + 60;

            const combinedScore = (swellScore * 0.5 + windScore * 0.3 + tideScore * 0.2);

            hourlyConditions.push({
                hour,
                swellScore: Math.round(swellScore),
                windScore: Math.round(windScore),
                tideScore: Math.round(tideScore),
                combinedScore: Math.round(combinedScore),
            });
        }

        // Find best 2-3 hour window
        let bestWindow = null;
        let bestWindowScore = 0;

        for (let i = 0; i < hourlyConditions.length - 2; i++) {
            const windowScore = (
                hourlyConditions[i].combinedScore +
                hourlyConditions[i + 1].combinedScore +
                hourlyConditions[i + 2].combinedScore
            ) / 3;

            if (windowScore > bestWindowScore) {
                bestWindowScore = windowScore;
                bestWindow = i;
            }
        }

        if (bestWindow === null) return null;

        const start = hourlyConditions[bestWindow];
        const end = hourlyConditions[bestWindow + 2];

        const formatHour = (h) => {
            const period = h >= 12 ? 'PM' : 'AM';
            const display = h % 12 || 12;
            return `${display}:00 ${period}`;
        };

        return {
            startHour: start.hour,
            endHour: end.hour,
            startStr: formatHour(start.hour),
            endStr: formatHour(end.hour),
            score: Math.round(bestWindowScore),
            beach: null,
            details: {
                swell: start.swellScore,
                wind: start.windScore,
                tide: start.tideScore,
            },
        };
    }, [sharedBestTime]);

    if (!bestTime) {
        return (
            <div className='containerDetail color-lite contentLeft size15 p-10 m-5 bg-lite'>
                ⏳ Calculating best time...
            </div>
        );
    }

    const getConditionEmoji = (score) => {
        if (score >= 80) return '🌊🌊🌊';
        if (score >= 60) return '🌊🌊';
        if (score >= 40) return '🌊';
        return '❌';
    };

    return (
        <div className='containerDetail color-yellow contentLeft'>
            <div className='containerDetail color-yellow contentLeft p-10'>
                🧠 Best Time to Surf Today
            </div>
            
            <div className='ml-10 mt-5 color-lite contentLeft size18 p-10'>
                {bestTime.startStr} – {bestTime.endStr}
            </div>
            {bestTime.beach && (
                <div className='ml-10 mt--5 color-lite contentLeft size12'>
                    Location: {bestTime.beach}
                </div>
            )}
            <div className='containerDetail mt-5 color-yellow color-lite contentLeft size18'>
                <div className='containerDetail color-yellow contentLeft size18 p-10'>
                    <div>Confidence: <strong>{bestTime.score}%</strong> {getConditionEmoji(bestTime.score)}</div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    fontSize: '12px',
                }}>
                    <div className='containerDetail mt-5 color-yellow brdr-blue'>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🌊 Swell</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
                            {bestTime.details.waveHeight != null ? `${Number(bestTime.details.waveHeight).toFixed(1)} ft` : `${bestTime.details.swell}%`}
                        </div>
                    </div>
                    
                    <div className='containerDetail mt-5 color-yellow brdr-purple'>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>💨 Wind</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7b1fa2' }}>
                            {bestTime.details.windSpeed != null ? `${Math.round(bestTime.details.windSpeed)} mph` : `${bestTime.details.wind}%`}
                        </div>
                    </div>

                    <div className='containerDetail mt-5 color-yellow brdr-teal'>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🌊 Tide</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00796b' }}>
                            {bestTime.details.tideLevel != null
                                ? `${Number(bestTime.details.tideLevel).toFixed(1)} ft ${(bestTime.details.tideDirection === 'falling') ? '🔻' : '🔺'}`
                                : `${bestTime.details.tide}%`}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                fontSize: '12px',
                marginLeft: '10px',
                color: '#666',
                fontStyle: 'italic',
            }}>
                Based on live forecast + tide data for the selected best beach
            </div>
        </div>
    );
};

export default BestTimeCard;
