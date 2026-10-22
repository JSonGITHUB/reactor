// hooks/useSurfStream.js
import { useEffect, useRef, useState } from "react";
import { BEACHES } from "./Beaches";
import { fetchWindBatch, fetchWave, fetchTide } from "./api";
import { calculateSurfScore } from "./surfEngine";
import { notify } from "./notifications";

export function useSurfStream() {
    const [data, setData] = useState({});
    const [alerts, setAlerts] = useState([]);

    const buffer = useRef([]);

    useEffect(() => {
        const pollBeaches = async () => {
            const timestamp = Date.now();
            const windByBeach = await fetchWindBatch(BEACHES);
            const settled = await Promise.allSettled(
                BEACHES.map(async (beach) => {
                    const [waveResult, tideResult] = await Promise.allSettled([
                        fetchWave(beach),
                        fetchTide(beach.id)
                    ]);

                    const wind = windByBeach[beach.name] || { windSpeed: 0 };
                    const wave = waveResult.status === "fulfilled"
                        ? waveResult.value
                        : { waveHeight: 0.5, wavePeriod: 6 };
                    const tide = tideResult.status === "fulfilled"
                        ? tideResult.value
                        : { phase: "mid", factor: 1 };

                    return {
                        beach: beach.name,
                        time: timestamp,
                        ...wind,
                        ...wave,
                        tide,
                        locationPrefs: { wind: beach.wind, tide: beach.tide }
                    };
                })
            );

            const events = settled
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value);

            if (events.length) {
                buffer.current.push(...events);
            }
        };

        pollBeaches().catch(() => {
            // keep loop alive even if one polling cycle fails
        });
        const interval = setInterval(pollBeaches, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const processor = setInterval(() => {
            if (!buffer.current.length) return;

            setData(prev => {
                const updated = { ...prev };

                buffer.current.forEach(event => {
                    const score = calculateSurfScore(event, event.locationPrefs);

                    const entry = { ...event, score };

                    if (!updated[event.beach]) updated[event.beach] = [];

                    updated[event.beach] = [
                        entry,
                        ...updated[event.beach]
                    ].slice(0, 25);

                    // 🔔 alert system
                    if (score > 80) {
                        setAlerts(a => [
                            { beach: event.beach, score, time: event.time },
                            ...a.slice(0, 10)
                        ]);

                        notify("🌊 Epic Surf!", `${event.beach} score: ${score}`);
                    }
                });

                buffer.current = [];
                return updated;
            });
        }, 2000);

        return () => clearInterval(processor);
    }, []);

    return { data, alerts };
}