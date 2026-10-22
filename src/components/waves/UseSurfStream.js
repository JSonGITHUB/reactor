// hooks/useSurfStream.js
import { useEffect, useRef, useState } from "react";
import { BEACHES } from "./Beaches";
import { fetchWind, fetchWave, fetchTide } from "./api";
import { calculateSurfScore } from "./surfEngine";
import { notify } from "./notifications";
import { fetchMarine, fetchTide } from "../lib/api";

const [marine, tide] = await Promise.all([
    fetchMarine(beach.lat, beach.lon),
    fetchTide(beach.lat, beach.lon)
]);

buffer.current.push({
    beach: beach.name,
    time: Date.now(),
    ...marine,
    tide
});

export function useSurfStream() {
    const [data, setData] = useState({});
    const [alerts, setAlerts] = useState([]);

    const buffer = useRef([]);

    useEffect(() => {
        const pollBeaches = async () => {
            const timestamp = Date.now();
            const events = await Promise.all(
                BEACHES.map(async (beach) => {
                    const [wind, wave, tide] = await Promise.all([
                        fetchWind(beach.lat, beach.lon),
                        fetchWave(),
                        fetchTide(beach.id)
                    ]);

                    return {
                        beach: beach.name,
                        time: timestamp,
                        ...wind,
                        ...wave,
                        tide
                    };
                })
            );

            buffer.current.push(...events);
        };
        pollBeaches();
        const interval = setInterval(pollBeaches, 6000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const processor = setInterval(() => {
            if (!buffer.current.length) return;

            setData(prev => {
                const updated = { ...prev };

                buffer.current.forEach(event => {
                    const score = calculateSurfScore(event);

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