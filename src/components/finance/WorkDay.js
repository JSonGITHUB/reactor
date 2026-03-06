import React, { useEffect, useMemo, useState } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const STORAGE_KEY = 'workDayTracking';
const OVERTIME_MULTIPLIER = 1.5;

const parseNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const formatMoney = (amount) => `$${parseNumber(amount).toFixed(2)}`;

const formatDateTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString();
};

const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString();
};

const formatDay = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, { weekday: 'long' });
};

const formatHours = (seconds) => (parseNumber(seconds) / 3600).toFixed(2);

const WorkDay = () => {
    const [workWeeks, setWorkWeeks] = useState([]);
    const [activeDay, setActiveDay] = useState(null);
    const [nowMs, setNowMs] = useState(Date.now());

    const [showWeekPrompt, setShowWeekPrompt] = useState(false);

    const [weekForm, setWeekForm] = useState({
        employer: '',
        weekHours: '',
        dayHours: '',
        rate: ''
    });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

        if (Array.isArray(stored.workWeeks)) {
            setWorkWeeks(stored.workWeeks);
        } else {
            const migratedWeeks = [];
            if (stored.weekConfig) {
                migratedWeeks.push({
                    id: Date.now(),
                    ...stored.weekConfig,
                    isCollapsed: true,
                    days: Array.isArray(stored.daysWorked) ? stored.daysWorked : []
                });
            }
            setWorkWeeks(migratedWeeks);
        }

        setActiveDay(stored.activeDay || null);
    }, []);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                workWeeks,
                activeDay
            })
        );
    }, [workWeeks, activeDay]);

    useEffect(() => {
        if (!activeDay?.isRunning) {
            return;
        }
        const id = setInterval(() => {
            setNowMs(Date.now());
        }, 1000);
        return () => clearInterval(id);
    }, [activeDay?.isRunning]);

    const runningSeconds = useMemo(() => {
        if (!activeDay?.isRunning || !activeDay?.currentSessionStart) {
            return 0;
        }
        return Math.max(0, Math.floor((nowMs - new Date(activeDay.currentSessionStart).getTime()) / 1000));
    }, [activeDay?.isRunning, activeDay?.currentSessionStart, nowMs]);

    const totalWorkedSeconds = useMemo(() => {
        if (!activeDay) {
            return 0;
        }
        return parseNumber(activeDay.totalWorkedSeconds) + runningSeconds;
    }, [activeDay, runningSeconds]);

    const workedHours = parseNumber(totalWorkedSeconds) / 3600;
    const hoursLeft = Math.max(0, parseNumber(activeDay?.dayHoursTarget) - workedHours);
    const overtimeHours = Math.max(0, workedHours - parseNumber(activeDay?.dayHoursTarget));
    const baseRate = parseNumber(activeDay?.rate);
    const accumulatedDollars = workedHours * baseRate;
    const projectedDayDollars = parseNumber(activeDay?.dayHoursTarget) * baseRate;
    const overtimeDollars = overtimeHours * baseRate * OVERTIME_MULTIPLIER;

    const openWeekPrompt = () => {
        const latestWeek = workWeeks[0];
        setWeekForm({
            employer: latestWeek?.employer || '',
            weekHours: latestWeek?.weekHours?.toString() || '',
            dayHours: latestWeek?.dayHours?.toString() || '',
            rate: latestWeek?.rate?.toString() || ''
        });
        setShowWeekPrompt(true);
    };

    const submitWeek = () => {
        if (!weekForm.employer || !weekForm.weekHours || !weekForm.dayHours || !weekForm.rate) {
            return;
        }

        const createdAt = new Date().toISOString();
        const newWeek = {
            id: Date.now(),
            employer: weekForm.employer,
            weekHours: parseNumber(weekForm.weekHours),
            dayHours: parseNumber(weekForm.dayHours),
            rate: parseNumber(weekForm.rate),
            startedAt: createdAt,
            isCollapsed: false,
            days: []
        };

        setWorkWeeks(prev => [newWeek, ...prev]);
        setShowWeekPrompt(false);
    };

    const startWorkday = (weekId) => {
        const week = workWeeks.find((item) => item.id === weekId);
        if (!week?.employer || !week?.rate || !week?.dayHours || activeDay) {
            return;
        }
        const startedAt = new Date().toISOString();
        setActiveDay({
            id: Date.now(),
            weekId,
            employer: week.employer,
            rate: parseNumber(week.rate),
            dayHoursTarget: parseNumber(week.dayHours),
            day: formatDay(startedAt),
            date: formatDate(startedAt),
            initiatedAt: startedAt,
            sessions: [],
            totalWorkedSeconds: 0,
            currentSessionStart: null,
            isRunning: false
        });
    };

    const startTimer = () => {
        if (!activeDay || activeDay.isRunning) {
            return;
        }
        setActiveDay(prev => ({
            ...prev,
            isRunning: true,
            currentSessionStart: new Date().toISOString()
        }));
    };

    const stopTimer = () => {
        if (!activeDay || !activeDay.isRunning || !activeDay.currentSessionStart) {
            return;
        }

        const stopAt = new Date().toISOString();
        const startMs = new Date(activeDay.currentSessionStart).getTime();
        const stopMs = new Date(stopAt).getTime();
        const durationSeconds = Math.max(0, Math.floor((stopMs - startMs) / 1000));

        const nextSession = {
            start: activeDay.currentSessionStart,
            stop: stopAt,
            durationSeconds
        };

        setActiveDay(prev => ({
            ...prev,
            isRunning: false,
            currentSessionStart: null,
            totalWorkedSeconds: parseNumber(prev.totalWorkedSeconds) + durationSeconds,
            sessions: [...(prev.sessions || []), nextSession]
        }));
    };

    const endWorkday = () => {
        if (!activeDay) {
            return;
        }

        let completed = { ...activeDay };

        if (completed.isRunning && completed.currentSessionStart) {
            const stopAt = new Date().toISOString();
            const startMs = new Date(completed.currentSessionStart).getTime();
            const stopMs = new Date(stopAt).getTime();
            const durationSeconds = Math.max(0, Math.floor((stopMs - startMs) / 1000));

            completed.sessions = [
                ...(completed.sessions || []),
                {
                    start: completed.currentSessionStart,
                    stop: stopAt,
                    durationSeconds
                }
            ];
            completed.totalWorkedSeconds = parseNumber(completed.totalWorkedSeconds) + durationSeconds;
            completed.currentSessionStart = null;
            completed.isRunning = false;
        }

        const dayWorkedHours = parseNumber(completed.totalWorkedSeconds) / 3600;
        const dayOvertimeHours = Math.max(0, dayWorkedHours - parseNumber(completed.dayHoursTarget));

        const completedDay = {
            ...completed,
            endedAt: new Date().toISOString(),
            totalWorkedHours: dayWorkedHours,
            overtimeHours: dayOvertimeHours,
            overtimeDollars: dayOvertimeHours * parseNumber(completed.rate) * OVERTIME_MULTIPLIER,
            totalDollars: dayWorkedHours * parseNumber(completed.rate),
            projectedDollars: parseNumber(completed.dayHoursTarget) * parseNumber(completed.rate),
            isCollapsed: true
        };

        setWorkWeeks(prev => prev.map((week) => (
            week.id === completedDay.weekId
                ? { ...week, days: [completedDay, ...(week.days || [])] }
                : week
        )));
        setActiveDay(null);
    };

    const toggleWeekCollapse = (weekId) => {
        setWorkWeeks(prev => prev.map((week) => (
            week.id === weekId ? { ...week, isCollapsed: !week.isCollapsed } : week
        )));
    };

    const toggleDayCollapse = (weekId, dayId) => {
        setWorkWeeks(prev => prev.map((week) => {
            if (week.id !== weekId) {
                return week;
            }
            return {
                ...week,
                days: (week.days || []).map((day) => (
                    day.id === dayId ? { ...day, isCollapsed: !day.isCollapsed } : day
                ))
            };
        }));
    };

    const getWeekTotals = (week) => {
        const totals = (week.days || []).reduce((accumulator, day) => {
            accumulator.totalHours += parseNumber(day.totalWorkedHours);
            accumulator.totalOvertime += parseNumber(day.overtimeHours);
            return accumulator;
        }, { totalHours: 0, totalOvertime: 0 });

        return totals;
    };

    return (
        <div className='containerDetail mt--30 width--10'>
            <div className='containerDetail p-20 bg-lite color-lite size30 contentLeft'>
                💼 WorkDay
            </div>
            <div className='containerDetail contentLeft bg-green button p-20 size20 color-yellow mt-5 mb-5 width-100-percent' onClick={openWeekPrompt}>
                <span className='text-outline-light'>➕</span> Work Week
            </div>
            {showWeekPrompt && (
                <div className='containerDetail bg-lite color-yellow mb-5'>
                    <div className='containerDetail bg-lite size20 mb-10 p-15 contentLeft'>Work Week Setup</div>
                    <input
                        className='containerDetail m-5 p-10 color-lite'
                        placeholder='Employer'
                        value={weekForm.employer}
                        onChange={(e) => setWeekForm(prev => ({ ...prev, employer: e.target.value }))}
                    />
                    <input
                        className='containerDetail m-5 p-10 color-lite'
                        placeholder='Work week hours'
                        type='number'
                        value={weekForm.weekHours}
                        onChange={(e) => setWeekForm(prev => ({ ...prev, weekHours: e.target.value }))}
                    />
                    <input
                        className='containerDetail m-5 p-10 color-lite'
                        placeholder='Work day hours'
                        type='number'
                        value={weekForm.dayHours}
                        onChange={(e) => setWeekForm(prev => ({ ...prev, dayHours: e.target.value }))}
                    />
                    <input
                        className='containerDetail m-5 p-10 color-lite'
                        placeholder='Hourly rate'
                        type='number'
                        value={weekForm.rate}
                        onChange={(e) => setWeekForm(prev => ({ ...prev, rate: e.target.value }))}
                    />
                    <div className='containerDetail flexContainer mt-10 bg-lite'>
                        <div className='button containerDetail flex2Column mr-5 p-10' onClick={submitWeek}>
                            Save Week
                        </div>
                        <div className='button containerDetail flex2Column p-10' onClick={() => setShowWeekPrompt(false)}>
                            Cancel
                        </div>
                    </div>
                </div>
            )}

            {activeDay && (
                <div className='containerDetail bg-lite mb-5'>
                    <div className='containerDetail bg-lite size25 p-20 color-yellow'>
                        Active
                    </div>
                    <div className='containerDetail bg-lite mt-5 mb-5'>
                        <div className='containerDetail mt-5 p-10 color-lite contentLeft'>
                            <span className=' pr-5 color-yellow'>
                                {activeDay.date}
                            </span>
                            <span className='pr-5'>
                                {activeDay.day}
                            </span>
                            {formatDateTime(activeDay.initiatedAt).split(',')[1].split(':')[0]}:
                            {formatDateTime(activeDay.initiatedAt).split(',')[1].split(':')[1]}
                            <span className='copyright'>{formatDateTime(activeDay.initiatedAt).split(',')[1].split(' ')[2]}</span>
                            <span className='color-yellow pr-5 pl-5'>
                                -
                            </span>
                            <span className='color-lite'>
                                {activeDay.employer}
                            </span>
                            {/*
                                <div className='flexColumn contentRight color-yellow pl-5 pr-5'>
                                    #{activeDay.weekId}
                                </div> 
                            */}
                        </div>
                        <div className='containerDetail mt-5 p-10 contentLeft'>
                            <div className='mr-10 color-lite'>
                                <span className='color-yellow pr-5'>
                                    Rate: 
                                </span>
                                {formatMoney(activeDay.rate)}
                                <span className='copyright'>
                                    /hr
                                </span>
                            </div>
                            <div className='color-lite mr-10'>
                                <span className='color-yellow mr-5'>
                                    Pay:
                                </span>
                                {formatMoney(projectedDayDollars)}
                            </div>
                            <div className='contentRight color-lite mr-10'>
                                <span className='color-yellow ml-5 mr-5'>
                                    {`Earned:`}
                                </span>
                                {formatMoney(accumulatedDollars)}
                            </div>
                        </div>
                        <div className='containerDetail flexContainer mt-5 p-10'>
                            <div className='flexColumn contentRight color-lite'>
                                <span className='color-yellow pr-5'>
                                    Target:
                                </span>
                                {activeDay.dayHoursTarget}
                                <span className='copyright'>
                                    HRS
                                </span>
                            </div>
                            <div className='flexColumn contentRight color-yellow pr-5'>
                                Complete:
                                <span className='color-lite pl-5'>
                                    {workedHours.toFixed(2)}
                                </span>
                                <span className='copyright color-lite'>
                                    HRS
                                </span>
                            </div>
                            <div className='flexColumn contentRight color-yellow'>
                                Remaining: 
                                <span className='color-lite pl-5'>
                                    {hoursLeft.toFixed(2)}
                                </span>
                                <span className='copyright color-lite'>
                                    HRS
                                </span>
                            </div>
                        </div>
                        <div className='containerDetail flexContainer mt-5 p-10 width-auto'>
                            <div className='flexColumn contentRight color-yellow mr-10'>
                                Overtime: 
                            </div>
                            <div className='flexColumn color-lite'>
                                {overtimeHours.toFixed(2)}
                            </div>
                            <div className='flexColumn contentRight color-yellow ml-10 mr-10'>
                                {`=>`}
                            </div>
                            <div className='flexColumn color-lite'>
                                {formatMoney(overtimeDollars)}
                            </div>
                        </div>
                    </div>
                    <div className='containerDetail bg-lite mt-5 mb-5 flexContainer'>
                        {!activeDay.isRunning ? (
                            <div 
                                className='button containerDetail flex2Column m-5 p-10 bg-green color-yellow' 
                                onClick={startTimer}
                            >
                                Start Timer
                            </div>
                        ) : (
                            <div 
                                className='button containerDetail flex2Column m-5 p-10 bg-dkRed color-yellow' 
                                onClick={stopTimer}
                            >
                                Stop Timer
                            </div>
                        )}
                        <div 
                            className='button containerDetail flex2Column m-5 p-10 bg-red color-yellow' 
                            onClick={endWorkday}
                        >
                            End Day
                        </div>
                    </div>
                    <div className='containerDetail bg-dkYellow'>
                        <div className='containerDetail contentLeft size25 p-15 color-yellow bg-lite mb-5'>
                            Session Logs
                        </div>
                        {(activeDay.sessions || []).length === 0 ? (
                            <div className='containerDetail color-red'>No logged sessions yet.</div>
                        ) : (
                            <div className='scroll ht-250'>
                                {activeDay.sessions.map((segment, index) => (
                                    <div key={`${activeDay.id}-${index}`} className='containerDetail mb-5 contentLeft color-lite'>
                                        <div className='flexContainer p-10'>
                                            <div className='flex2Column contentLeft mr-10'>
                                                <span className='color-yellow mr-5'>{formatDateTime(segment.start).split(',')[0]}</span>{formatDateTime(segment.start).split(',')[1]} - {formatDateTime(segment.stop).split(',')[1]}
                                            </div>
                                            <div className='flexColumn contentRight mr-10'>
                                                <span className='color-yellow copyright mr-5'>
                                                    HOURS:
                                                </span>
                                                {formatHours(segment.durationSeconds)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className='containerDetail mt-10 mb-10 bg-dkBlue'>
                <div className='containerDetail p-10 bg-blue size25 p-20 contentLeft color-yellow'>
                    Weeks
                </div>
                <div className='containerDetail mb-5 bg-lite color-lite mt-5'>
                    {workWeeks.length === 0 ? (
                        <div className='containerDetail color-red'>
                            No weeks created yet.
                        </div>
                    ) : (
                        <div>
                            {workWeeks.map((week, index) => {
                                const totals = getWeekTotals(week);
                                const isActiveWeek = activeDay?.weekId === week.id;

                                return (
                                    <div key={week.id} className={`containerDetail bg-lite color-lite mb-5 ${(index === 0) ? '' : 'mt-5'}`}>
                                        <div className='containerDetail bg-lite color-lite'>
                                            <CollapseToggleButton
                                                title={
                                                        <div className='flexContainer'>
                                                            <div className='flexColumn contentLeft color-yellow'>
                                                                {formatDate(week.startedAt)}
                                                            </div>
                                                            <div className='flexColumn contentLeft color-lite pl-5'>
                                                                {week.employer}
                                                            </div>
                                                            <div className='flex3Column contentRight pr-10'>
                                                                <span className='color-yellow mr-5 copyright'>
                                                                    GOAL:
                                                                </span>
                                                                {week.weekHours} 
                                                                <span className='color-yellow ml-5 mr-5 copyright'>
                                                                    HOURS:
                                                                </span> 
                                                                {totals.totalHours.toFixed(2)} 
                                                                <span className='color-yellow ml-5 mr-5 copyright'>
                                                                    OT:
                                                                </span> 
                                                                {totals.totalOvertime.toFixed(2)}
                                                            </div>
                                                        </div>
                                                }
                                                isCollapsed={week.isCollapsed}
                                                setCollapse={() => toggleWeekCollapse(week.id)}
                                                align='left'
                                            />
                                        </div>

                                        {!week.isCollapsed && (
                                            <div className='containerDetail color-lite mt-5'>
                                                <div className='contentLeft p-10 mb-5 flexContainer size10'>
                                                    <div className='flex2Column contentLeft mr-10'>
                                                        <span className='mr-5 color-yellow'>
                                                            Rate:
                                                        </span>
                                                        {formatMoney(week.rate)} / hr
                                                    </div>
                                                    <div className='flex2Column contentRight mr-10'>
                                                        <span className='mr-5 color-yellow'>
                                                            Hours Target:
                                                        </span>
                                                        {week.dayHours}
                                                    </div>
                                                </div>
                                                <div 
                                                    className='containerDetail button p-30 size25 contentLeft color-yellow mb-5 bg-green'
                                                    onClick={() => startWorkday(week.id)}
                                                    disabled={!!activeDay}
                                                    title={activeDay ? 'Complete the active day first.' : 'Start a new day in this week'}
                                                >
                                                    {isActiveWeek ? '🧑🏻‍💻 Active' : '▶️ Start'}
                                                </div>

                                                <div className='containerDetail contentLeft size20 p-20 color-yellow bg-lite mb-5'>
                                                    📅 Days Logged
                                                </div>
                                                {(week.days || []).length === 0 ? (
                                                    <div className='containerDetail color-red'>No days logged for this week.</div>
                                                ) : (
                                                    <div>
                                                        {(week.days || []).map((day) => (
                                                            <div key={day.id} className='containerDetail bg-lite'>
                                                                
                                                                <div
                                                                    className='button containerDetail contentLeft'
                                                                    onClick={() => toggleDayCollapse(week.id, day.id)}
                                                                    title='Expand/collapse workday'
                                                                >
                                                                    <div className='containerDetail flexContainer p-10'>
                                                                        <div className='flex2Column contentRight color-yellow mr-10'>
                                                                            Employer: 
                                                                        </div>
                                                                        <div className='flex2Column contentLeft'>
                                                                            {day.employer}
                                                                        </div>
                                                                    </div>
                                                                    <div className='containerDetail flexContainer mt-5 p-10'>
                                                                        <div className='flex2Column contentRight color-yellow mr-10'>
                                                                            {day.day}, 
                                                                        </div>
                                                                        <div className='flex2Column contentLeft'>
                                                                            {day.date}
                                                                        </div>
                                                                    </div>
                                                                    <div className='containerDetail flexContainer mt-5 p-10'>
                                                                        <div className='flex2Column contentRight color-yellow mr-10'>
                                                                            Total Hours: 
                                                                        </div>
                                                                        <div className='flex2Column contentLeft'>
                                                                            {parseNumber(day.totalWorkedHours).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className='containerDetail flexContainer mt-5 p-10'>
                                                                        <div className='flex2Column contentRight color-yellow mr-10'>
                                                                            Overtime: 
                                                                        </div>
                                                                        <div className='flex2Column contentLeft'>
                                                                            {parseNumber(day.overtimeHours).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className='containerDetail flexContainer mt-5 p-10'>
                                                                        <div className='flex2Column contentRight color-yellow mr-10'>
                                                                            Total Time Worked: 
                                                                        </div>
                                                                        <div className='flex2Column contentLeft'>
                                                                            {parseNumber(day.totalWorkedHours).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div className='containerDetail flexContainer mt-5 p-10'>
                                                                        <div className='flex2Column contentRight color-yellow mr-10'>
                                                                            Overtime: 
                                                                        </div>
                                                                        <div className='flex2Column contentLeft'>
                                                                            {parseNumber(day.overtimeHours).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {!day.isCollapsed && (
                                                                    <div className='containerDetail mt-5 bg-lite color-lite'>
                                                                        <div className='containerDetail flexContainer p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-5'>
                                                                                Rate: 
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                {formatMoney(day.rate)} / hr
                                                                            </div>
                                                                        </div>
                                                                        <div className='containerDetail flexContainer mt-5 p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-5'>
                                                                                Hours Target:
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                {day.dayHoursTarget}
                                                                            </div>
                                                                        </div>
                                                                        <div className='containerDetail flexContainer mt-5 p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-5'>
                                                                                Total Dollars: 
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                {formatMoney(day.totalDollars)}
                                                                            </div>
                                                                        </div>
                                                                        <div className='containerDetail flexContainer mt-5 p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-5'>
                                                                                Projected Day Dollars:
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                {formatMoney(day.projectedDollars)}
                                                                            </div>
                                                                        </div>
                                                                        <div className='containerDetail flexContainer mt-5 p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-5'>
                                                                                Overtime Dollars:
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                {formatMoney(day.overtimeDollars)}
                                                                            </div>
                                                                        </div>
                                                                        <div className='containerDetail flexContainer mt-5 p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-5'>
                                                                                Initiated:
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                {formatDateTime(day.initiatedAt)}
                                                                            </div>
                                                                        </div>
                                                                        <div className='containerDetail flexContainer mt-5 p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-5'>
                                                                                Ended: 
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                {formatDateTime(day.endedAt)}
                                                                            </div>
                                                                        </div>
                                                                        <div className='containerDetail bg-lite mt-5'>
                                                                            <div className='containerDetail contentLeft size20 p-20 bg-blue color-yellow'>Logged Sessions</div>
                                                                            {(day.sessions || []).length === 0 ? (
                                                                                <div className='containerDetail color-red'>No sessions recorded.</div>
                                                                            ) : (
                                                                                <div className='scroll ht-250'>
                                                                                    {day.sessions.map((segment, index) => (
                                                                                        <div key={`${day.id}-segment-${index}`} className={`containerDetail p-10 mt-5 contentLeft flexContainer`}>
                                                                                            <div className='flex3Column'>Start: {formatDateTime(segment.start)}</div>
                                                                                            <div className='flex3Column'>Stop: {formatDateTime(segment.stop)}</div>
                                                                                            <div className='flex3Column'>Hours: {formatHours(segment.durationSeconds)}</div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkDay;