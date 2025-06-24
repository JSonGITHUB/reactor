import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export const interpolateTides = (tideData) => {

    const parseTideData = (tide) => {
        const format = 'yyyy-MM-dd HH:mm';
        return {
            time: DateTime.fromFormat(tide.t, format, { zone: 'utc' }),
            value: parseFloat(tide.v),
            //type: tide.type
            type: 'H'
        };
    }

    const parsedTides = tideData.map(parseTideData);

    const interpolateHeight = (t1, h1, t2, h2, t) => {
        const duration = t2.diff(t1, 'minutes').minutes;
        const elapsed = t.diff(t1, 'minutes').minutes;
        const phase = (elapsed / duration) * Math.PI;
        const meanHeight = (h1 + h2) / 2;
        const amplitude = (h2 - h1) / 2;
        return meanHeight + amplitude * Math.sin(phase);
    }

    const granularTideData = [];
    for (let i = 0; i < parsedTides.length - 1; i++) {
        const { time: t1, value: h1 } = parsedTides[i];
        const { time: t2, value: h2 } = parsedTides[i + 1];
        let currentTime = t1;
        while (currentTime <= t2) {
            granularTideData.push({
                time: currentTime.toISO(),
                value: interpolateHeight(t1, h1, t2, h2, currentTime).toFixed(3)
            });
            currentTime = currentTime.plus({ minutes: 15 });
        }
    }

    // Add the last high or low tide data point
    const lastTide = parsedTides[parsedTides.length - 1];
    granularTideData.push({
        time: lastTide.time.toISO(),
        value: lastTide.value.toFixed(3)
    });
    return granularTideData;
}

const TideData = (
    tideData
) => {

    const [granularTideData, setGranularTideData] = useState();

    useEffect(() => {
        console.log(`tideData: ${JSON.stringify(tideData, null, 2)}`)
        // Sample tide data
        /*
        const tideData = [
            { t: "2024-06-30 05:35", v: "3.201", type: "H" },
            { t: "2024-06-30 10:45", v: "1.559", type: "L" },
            { t: "2024-06-30 17:37", v: "5.693", type: "H" },
            { t: "2024-07-01 00:58", v: "0.321", type: "L" },
            { t: "2024-07-01 07:09", v: "3.186", type: "H" }
        ];
        */
        // Get granular tide data
        const granularData = interpolateTides(tideData);
        setGranularTideData(granularData);
    }, []);

    return (
        <div>
            <h2>Granular Tide Predictions</h2>
            <div className='containerBox'>
                {granularTideData.map((tide, index) => (
                    <div key={index} className='containerBox'>
                        {tide.time}: {tide.value} ft.
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TideData;