// SurfDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSurfStream } from "./surfStreamHook";
import BeachCard from "./BeachCard";
import AlertsPanel from "./AlertsPanel";
import MapView from "./MapView";
import BestTimeCard from "./BestTimeCard";
import ForecastChart from "./ForecastChart";
import { BEACHES } from "./Beaches";
import { calculateSurfScore, surfLabel } from "./surfEngine";
import { useForecastData } from "./useForecastData";
import { getStoredTideSeries, getTideAtTime } from "./tideUtils";
import CollapseToggleButton from "../utils/CollapseToggleButton";
import PWAPushManager from "../../utils/PWAPushManager";

const isDaylightTime = (dateLike) => {
    const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(date.getTime())) return false;

    const minutesSinceMidnight = (date.getHours() * 60) + date.getMinutes();
    return minutesSinceMidnight >= 330 && minutesSinceMidnight <= 1200; // 05:30 to 20:00
};

const isDaylightWindow = (startDateLike, durationMinutes = 60) => {
    const start = startDateLike instanceof Date ? startDateLike : new Date(startDateLike);
    if (Number.isNaN(start.getTime())) return false;

    const end = new Date(start.getTime() + (durationMinutes * 60 * 1000));
    return isDaylightTime(start) && isDaylightTime(end);
};

export default function SurfDashboard() {
    const { data, alerts } = useSurfStream();
    const [selectedBeach, setSelectedBeach] = useState(null);
    const [dashboardCollapsed, setDashboardCollapsed] = useState(true);
    const [viewMode, setViewMode] = useState('map'); // 'map', 'details', 'forecast', 'best-time'
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        if (selectedBeach) return;
        if (!alerts.length) return;
        setSelectedBeach(alerts[0].beach);
    }, [alerts, selectedBeach]);

    useEffect(() => {
        if (selectedBeach) return;

        const firstBeachWithData = BEACHES.find((b) => (data[b.name] || []).length > 0);
        if (!firstBeachWithData) return;

        setSelectedBeach(firstBeachWithData.name);
    }, [data, selectedBeach]);

    // Check conditions and send notifications
    useEffect(() => {
        if (notificationsEnabled) {
            PWAPushManager.checkConditionsAndNotify(data, alerts);
        }
    }, [data, alerts, notificationsEnabled]);

    // Toggle notifications
    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const granted = await PWAPushManager.requestPermission();
            setNotificationsEnabled(granted);
        } else {
            PWAPushManager.setEnabled(false);
            setNotificationsEnabled(false);
        }
    };

    const visibleBeaches = selectedBeach
        ? BEACHES.filter((b) => b.name === selectedBeach)
        : [];

    const bestCurrentEntry = useMemo(() => {
        const latestEntries = Object.values(data)
            .map(entries => entries[0])
            .filter(Boolean);

        if (!latestEntries.length) return null;

        return latestEntries.reduce((best, entry) =>
            (entry.score ?? 0) > (best.score ?? 0) ? entry : best
        );
    }, [data]);

    const bestBeachConfig = useMemo(() => {
        if (!bestCurrentEntry?.beach) return null;
        return BEACHES.find((beach) => beach.name === bestCurrentEntry.beach) || null;
    }, [bestCurrentEntry]);

    const { forecastData } = useForecastData(
        bestBeachConfig?.lat || 32.87,
        bestBeachConfig?.lon || -117.26
    );

    const bestTimeSummary = useMemo(() => {
        if (!bestCurrentEntry) return null;

        const baseline = bestCurrentEntry;

        const { beach, tide, locationPrefs } = baseline;
        const tideRows = getStoredTideSeries();
        const forecastRows = (forecastData || [])
            .filter((row) => Number.isFinite(row?.timestamp))
            .filter((row) => row.timestamp >= Date.now())
            .slice(0, 24);

        if (!forecastRows.length) return null;

        const hourlyConditions = [];

        forecastRows.forEach((forecastRow) => {
            const forecastTide = getTideAtTime(tideRows, forecastRow.timestamp) || tide;
            const combinedScore = calculateSurfScore(
                {
                    waveHeight: forecastRow.swellHeight,
                    wavePeriod: forecastRow.period,
                    windSpeed: forecastRow.wind,
                    windDir: forecastRow.windDir,
                    tide: forecastTide
                },
                locationPrefs
            );

            hourlyConditions.push({
                hour: forecastRow.date?.getHours?.() ?? 0,
                timestamp: forecastRow.timestamp,
                combinedScore,
                waveHeight: forecastRow.swellHeight,
                wavePeriod: forecastRow.period,
                windSpeed: forecastRow.wind,
                windDir: forecastRow.windDir,
                tide: forecastTide,
                forecastRow
            });
        });

        let bestWindow = null;
        let bestWindowScore = 0;

        for (let i = 0; i < hourlyConditions.length; i++) {
            const candidate = hourlyConditions[i];
            const candidateStart = Number.isFinite(candidate.timestamp)
                ? candidate.timestamp
                : candidate.forecastRow?.date;

            if (!isDaylightWindow(candidateStart, 60)) {
                continue;
            }

            const windowScore = candidate.combinedScore;

            if (windowScore > bestWindowScore) {
                bestWindowScore = windowScore;
                bestWindow = i;
            }
        }

        if (bestWindow === null) return null;

        const bestWindowStart = Number.isFinite(hourlyConditions[bestWindow].timestamp)
            ? new Date(hourlyConditions[bestWindow].timestamp)
            : new Date();
        const bestWindowEnd = new Date(bestWindowStart.getTime() + (60 * 60 * 1000));

        const closingTime = new Date(bestWindowStart);
        closingTime.setHours(20, 0, 0, 0);

        const clampedEnd = bestWindowEnd > closingTime ? closingTime : bestWindowEnd;

        const startHour = bestWindowStart.getHours();
        const startMinute = bestWindowStart.getMinutes();
        const endHour = clampedEnd.getHours();
        const endMinute = clampedEnd.getMinutes();
        const bestWindowConditions = hourlyConditions[bestWindow];

        const formatHour = (hour, minute = 0) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const display = hour % 12 || 12;
            const minuteStr = String(minute).padStart(2, '0');
            return `${display}:${minuteStr} ${period}`;
        };

        return {
            startStr: formatHour(startHour, startMinute),
            endStr: formatHour(endHour, endMinute),
            score: Math.round(bestWindowScore),
            beach,
            waveHeight: bestWindowConditions.waveHeight,
            latestScore: Math.round(bestWindowConditions.combinedScore),
            windDir: bestWindowConditions.windDir,
            windSpeed: bestWindowConditions.windSpeed,
            tidePhase: bestWindowConditions.tide?.phase,
            tideDirection: bestWindowConditions.tide?.direction,
            tideLevel: bestWindowConditions.tide?.level
        };
    }, [bestCurrentEntry, forecastData]);

    const modes = [
        { id: 'map', label: '🗺️ Map', icon: '🗺️' },
        { id: 'details', label: '📋 Details', icon: '📋' },
        { id: 'forecast', label: '📊 Forecast', icon: '📊' },
        { id: 'best-time', label: '🧠 Best Time', icon: '🧠' },
    ];

    const dashboardBody = (
        <>
            {/* Mode Tabs */}
            <div className='containerDetail flexContainer mb-5'>
                {modes.map(mode => (
                    <div
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`containerDetail mr-5 button p-10 ${viewMode === mode.id ? 'bg-lite color-yellow' : 'color-lite'}`}
                    >
                        {mode.label}
                    </div>
                ))}
                {/* Notification Toggle */}
                <div className='flexContainer contentRight'>
                    <div
                        onClick={toggleNotifications}
                        className={`containerDetail button p-10 ${notificationsEnabled ? 'bg-lite color-yellow' : 'color-lite'}`}
                        title={notificationsEnabled ? 'Notifications ON' : 'Notifications OFF'}
                    >
                        {notificationsEnabled ? '🔔' : '🔕'} {notificationsEnabled ? 'ON' : 'OFF'}
                    </div>
                </div>
            </div>

            {/* View Content */}
            {viewMode === 'map' && (
                <MapView
                    data={data}
                    alerts={alerts}
                    selectedBeach={selectedBeach}
                    onSelectBeach={(beach) => {
                        setSelectedBeach(beach);
                        setViewMode('details');
                    }}
                />
            )}

            {viewMode === 'details' && (
                <>
                    <AlertsPanel
                        alerts={alerts}
                        selectedBeach={selectedBeach}
                        onSelectBeach={(beach) => setSelectedBeach(beach)}
                        onClearSelection={() => setSelectedBeach(null)}
                    />

                    {visibleBeaches.length === 0 ? (
                        <div className='containerDetail color-lite contentLeft size15 p-10 m-5 bg-lite'>
                            Waiting for beach data...
                        </div>
                    ) : (
                        visibleBeaches.map((b) => (
                            <BeachCard
                                key={b.id}
                                beach={b.name}
                                data={data[b.name] || []}
                            />
                        ))
                    )}
                </>
            )}

            {viewMode === 'forecast' && (
                <ForecastChart selectedBeach={selectedBeach} data={data} />
            )}

            {viewMode === 'best-time' && (
                <BestTimeCard data={data} alerts={alerts} summary={bestTimeSummary} />
            )}
        </>
    );

    const getDashboardTitle = <div className='color-yellow size20 mt--5'>
                🌊 Surf Dashboard
            </div>;

    return (
            <React.Fragment>
                <div className='containerDetail bg-lite mb-5 p-20'>
                    <CollapseToggleButton
                        title={getDashboardTitle}
                        description={bestTimeSummary ? (
                            <div className='mt-5'>
                                <div>
                                    <span className='color-orange size12'>
                                        Best Time:
                                    </span>
                                    <span className='color-lite size12 ml-5'>
                                        {bestTimeSummary.startStr} - {bestTimeSummary.endStr} ({bestTimeSummary.score}%)
                                    </span>
                                </div>
                                {
                                    !dashboardCollapsed && (
                                    <div>
                                        <span className='color-orange size12 mr-5'>
                                            Location:
                                        </span>
                                        <span className='color-lite size12'>
                                            {bestTimeSummary.beach ?? "..."}
                                        </span>
                                        <span className='color-lite size12 mr-5 ml-5'>
                                            <span className='color-lite size12'>
                                                {bestTimeSummary.latestScore != null ? surfLabel(bestTimeSummary) : ""}
                                            </span>
                                            <span className='color-lite size12 mr-5 ml-5'>
                                                {bestTimeSummary.waveHeight != null ? bestTimeSummary.waveHeight.toFixed(0) : "..."}<span className='copyright color-yellow'>ft</span>
                                            </span>
                                        </span>
                                        <div className='color-orange contentLeft size12 mr-5'>
                                            Wind:
                                            <span className='color-lite size12 mr-5 ml-5'>
                                                {bestTimeSummary.windDir ?? "..."}
                                            </span>
                                            <span className='color-lite size12 mr-5 ml-5'>
                                                {bestTimeSummary.windSpeed ?? "..."} mph
                                            </span>
                                            <div>
                                                Tide:
                                                <span className='color-lite size12 mr-5 ml-5'>
                                                    {bestTimeSummary.tidePhase ?? "..."}
                                                </span>
                                                <span className='color-lite size12 ml-5'>
                                                    {bestTimeSummary.tideLevel ?? "..."} ft
                                                </span>
                                                <span className='color-lite size12 ml-5'>
                                                    {(bestTimeSummary.tideDirection === 'rising') ? '🔺' : '🔻'}
                                                    {bestTimeSummary.tideDirection ?? "..."}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                        component={null}
                        isCollapsed={dashboardCollapsed}
                        setCollapse={setDashboardCollapsed}
                        align='left'
                        bold={false}
                        editTitle={null}
                        icon={null}
                    />
                </div>
                {!dashboardCollapsed && dashboardBody}
            </React.Fragment>
    );
}