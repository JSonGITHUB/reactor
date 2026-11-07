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

const normalizeLoggedDay = (day) => ({
    ...day,
    isCollapsed: day?.isCollapsed !== false,
});

const formatScheduleTime = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '--:--';
    }
    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    }).replace(' ', '');
};

const buildShiftSchedule = (startDate, totalWorkHours = 8) => {
    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
        return null;
    }

    const toMs = (minutes) => minutes * 60 * 1000;
    const totalWorkMinutes = Math.max(0, parseNumber(totalWorkHours, 8) * 60);
    const firstShiftWorkMinutes = totalWorkMinutes * (4.5 / 8);
    const secondShiftWorkMinutes = totalWorkMinutes - firstShiftWorkMinutes;

    const coffeeBreakMinutes = 15;
    const mealBreakMinutes = 30;

    const clockIn = new Date(startDate.getTime());
    const coffee1 = new Date(clockIn.getTime() + toMs(firstShiftWorkMinutes / 2));
    const firstShiftContinues = new Date(coffee1.getTime() + toMs(coffeeBreakMinutes));
    const meal = new Date(clockIn.getTime() + toMs(firstShiftWorkMinutes));
    const secondShift = new Date(meal.getTime() + toMs(mealBreakMinutes));
    const coffee2 = new Date(secondShift.getTime() + toMs(secondShiftWorkMinutes / 2));
    const secondShiftContinued = new Date(coffee2.getTime() + toMs(coffeeBreakMinutes));
    const clockOut = new Date(clockIn.getTime() + toMs(totalWorkMinutes + mealBreakMinutes));

    return {
        clockIn,
        coffee1,
        firstShiftContinues,
        meal,
        secondShift,
        coffee2,
        secondShiftContinued,
        clockOut
    };
};

const calculatePaidSessionSeconds = ({ startIso, stopIso, initiatedAt, dayHoursTarget }) => {
    const start = new Date(startIso);
    const stop = new Date(stopIso);

    if (Number.isNaN(start.getTime()) || Number.isNaN(stop.getTime()) || stop <= start) {
        return 0;
    }

    const elapsedMs = stop.getTime() - start.getTime();
    const dayStart = new Date(initiatedAt);
    const schedule = buildShiftSchedule(dayStart, dayHoursTarget);

    if (!schedule) {
        return Math.floor(elapsedMs / 1000);
    }

    const mealStartMs = schedule.meal.getTime();
    const secondShiftStartMs = schedule.secondShift.getTime();
    const overlapMs = Math.max(
        0,
        Math.min(stop.getTime(), secondShiftStartMs) - Math.max(start.getTime(), mealStartMs)
    );

    return Math.max(0, Math.floor((elapsedMs - overlapMs) / 1000));
};

const formatHours = (seconds) => (parseNumber(seconds) / 3600).toFixed(2);

const formatCountdown = (remainingSeconds) => {
    const safeSeconds = Math.max(0, parseNumber(remainingSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const WorkDay = () => {
    const [workWeeks, setWorkWeeks] = useState([]);
    const [activeDay, setActiveDay] = useState(null);
    const [nowMs, setNowMs] = useState(Date.now());

    const [showWeekPrompt, setShowWeekPrompt] = useState(false);
    const [isActiveScheduleCollapsed, setIsActiveScheduleCollapsed] = useState(false);
    const [editingWeekId, setEditingWeekId] = useState(null);
    const [weekEditForm, setWeekEditForm] = useState({
        employer: '',
        weekHours: '',
        dayHours: '',
        rate: ''
    });

    const [weekForm, setWeekForm] = useState({
        employer: '',
        weekHours: '',
        dayHours: '',
        rate: ''
    });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

        if (Array.isArray(stored.workWeeks)) {
            setWorkWeeks(stored.workWeeks.map((week) => ({
                ...week,
                isCollapsed: week?.isCollapsed ?? true,
                days: Array.isArray(week.days) ? week.days.map(normalizeLoggedDay) : []
            })));
        } else {
            const migratedWeeks = [];
            if (stored.weekConfig) {
                migratedWeeks.push({
                    id: Date.now(),
                    ...stored.weekConfig,
                    isCollapsed: true,
                    days: Array.isArray(stored.daysWorked) ? stored.daysWorked.map(normalizeLoggedDay) : []
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
        if (!activeDay) {
            return;
        }

        const id = setInterval(() => {
            setNowMs(Date.now());
        }, 1000);
        return () => clearInterval(id);
    }, [activeDay]);

    const runningSeconds = useMemo(() => {
        if (!activeDay?.isRunning || !activeDay?.currentSessionStart) {
            return 0;
        }
        return calculatePaidSessionSeconds({
            startIso: activeDay.currentSessionStart,
            stopIso: new Date(nowMs).toISOString(),
            initiatedAt: activeDay.initiatedAt,
            dayHoursTarget: activeDay.dayHoursTarget
        });
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

    const activeScheduleEntries = useMemo(() => {
        if (!activeDay?.initiatedAt) {
            return [];
        }

        const start = new Date(activeDay.initiatedAt);
        if (Number.isNaN(start.getTime())) {
            return [];
        }

        const schedule = buildShiftSchedule(start, activeDay.dayHoursTarget);
        if (!schedule) {
            return [];
        }

        return [
            { label: 'Clock In', date: schedule.clockIn },
            { label: 'Coffee', date: schedule.coffee1 },
            { label: '1st Shift continues', date: schedule.firstShiftContinues },
            { label: 'Meal', date: schedule.meal },
            { label: '2nd Shift', date: schedule.secondShift },
            { label: 'Coffee', date: schedule.coffee2 },
            { label: '2nd Shift continued', date: schedule.secondShiftContinued },
            { label: 'Clock Out', date: schedule.clockOut },
        ];
    }, [activeDay?.initiatedAt, activeDay?.dayHoursTarget]);

    const activeScheduleRows = useMemo(() => (
        activeScheduleEntries.map((entry) => ({
            ...entry,
            atMs: entry.date.getTime(),
            time: formatScheduleTime(entry.date)
        }))
    ), [activeScheduleEntries]);

    const nextActiveScheduleIndex = useMemo(() => {
        if (activeScheduleRows.length === 0) {
            return -1;
        }
        return activeScheduleRows.findIndex((row) => row.atMs >= nowMs);
    }, [activeScheduleRows, nowMs]);

    const endWorkday = () => {
        if (!activeDay) {
            return;
        }

        let completed = { ...activeDay };

        if (completed.isRunning && completed.currentSessionStart) {
            const stopAt = new Date().toISOString();
            const startMs = new Date(completed.currentSessionStart).getTime();
            const stopMs = new Date(stopAt).getTime();
            const durationSeconds = calculatePaidSessionSeconds({
                startIso: completed.currentSessionStart,
                stopIso: stopAt,
                initiatedAt: completed.initiatedAt,
                dayHoursTarget: completed.dayHoursTarget
            });

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

    const stopTimer = () => {
        if (!activeDay || !activeDay.isRunning || !activeDay.currentSessionStart) {
            return;
        }

        const stopAt = new Date().toISOString();
        const startMs = new Date(activeDay.currentSessionStart).getTime();
        const stopMs = new Date(stopAt).getTime();
        const durationSeconds = calculatePaidSessionSeconds({
            startIso: activeDay.currentSessionStart,
            stopIso: stopAt,
            initiatedAt: activeDay.initiatedAt,
            dayHoursTarget: activeDay.dayHoursTarget
        });

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

    const nextActiveScheduleCountdown = useMemo(() => {
        if (nextActiveScheduleIndex < 0 || !activeScheduleRows[nextActiveScheduleIndex]) {
            stopTimer();
            endWorkday();
            return null;
        }
        const remainingSeconds = Math.ceil((activeScheduleRows[nextActiveScheduleIndex].atMs - nowMs) / 1000);
        return formatCountdown(remainingSeconds);
    }, [nextActiveScheduleIndex, activeScheduleRows, nowMs]);

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

    const openWeekEdit = (week) => {
        setEditingWeekId(week.id);
        setWeekEditForm({
            employer: week?.employer || '',
            weekHours: week?.weekHours?.toString() || '',
            dayHours: week?.dayHours?.toString() || '',
            rate: week?.rate?.toString() || ''
        });
    };

    const cancelWeekEdit = () => {
        setEditingWeekId(null);
        setWeekEditForm({
            employer: '',
            weekHours: '',
            dayHours: '',
            rate: ''
        });
    };

    const saveWeekEdit = (weekId) => {
        const employer = weekEditForm.employer.trim();
        const weekHours = parseNumber(weekEditForm.weekHours, -1);
        const dayHours = parseNumber(weekEditForm.dayHours, -1);
        const rate = parseNumber(weekEditForm.rate, -1);

        if (!employer || weekHours <= 0 || dayHours <= 0 || rate <= 0) {
            alert('Please provide a valid employer, work week hours, work day hours, and hourly rate.');
            return;
        }

        setWorkWeeks((prev) => prev.map((week) => (
            week.id === weekId
                ? {
                    ...week,
                    employer,
                    weekHours,
                    dayHours,
                    rate
                }
                : week
        )));

        // Keep active day values aligned when editing the week currently being tracked.
        setActiveDay((prev) => {
            if (!prev || prev.weekId !== weekId) {
                return prev;
            }
            return {
                ...prev,
                employer,
                dayHoursTarget: dayHours,
                rate
            };
        });

        cancelWeekEdit();
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
            isCollapsed: true,
            isRunning: true,
            currentSessionStart: new Date().toISOString()
        });
    };

    const startTimer = () => {
        if (!activeDay || activeDay.isRunning) {
            return;
        }
        setNowMs(Date.now());
        setActiveDay(prev => ({
            ...prev,
            isRunning: true,
            currentSessionStart: new Date().toISOString()
        }));
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

    const ScheduleDisplay = ({ hours = 8, startTime }) => {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const schedule = buildShiftSchedule(start, hours);

        if (!schedule) {
            return null;
        }

        const events = [
            {
                label: '1st Shift Clock-in',
                time: formatScheduleTime(schedule.clockIn)
            },
            {
                label: 'Coffee',
                time: formatScheduleTime(schedule.coffee1)
            },
            {
                label: '1st Shift Continued',
                time: formatScheduleTime(schedule.firstShiftContinues)
            },
            {
                label: 'Meal Clock-out',
                time: formatScheduleTime(schedule.meal)
            },
            {
                label: '2nd Shift Clock-in',
                time: formatScheduleTime(schedule.secondShift)
            },
            {
                label: 'Coffee',
                time: formatScheduleTime(schedule.coffee2)
            },
            {
                label: '2nd Shift Continued',
                time: formatScheduleTime(schedule.secondShiftContinued)
            },
            {
                label: 'Clock-out',
                time: formatScheduleTime(schedule.clockOut)
            }
        ];

        return (
            <div className='schedule-display contentLeft'>
                <h3 className='containerDetail size20 p-20 color-yellow'>
                    Shift Schedule ({hours} Hours)
                </h3>
                <div className='containerDetail mt--10 ht-100 scroll mb-10'>
                    
                            {events.map((event, index) => (
                                <div className='flexContainer p-10 contentLeft' key={`schedule-event-${index}`}>
                                    <div className='flexColumn color-yellow contentRight pr-10'>{event.time}</div>
                                    <div className='flex2Column contentLeft'>{event.label}</div>
                                </div>
                            ))}
                </div>
            </div>
        );
    };

    const editDay = (weekId, dayId) => {
        const newHours = prompt('Edit total worked hours:', '');
        if (newHours === null) return;

        const parsedHours = parseNumber(newHours, -1);
        if (parsedHours < 0) {
            alert('Please enter a valid number');
            return;
        }

        setWorkWeeks(prev => prev.map((week) => {
            if (week.id !== weekId) {
                return week;
            }

            return {
                ...week,
                days: (week.days || []).map((day) => {
                    if (day.id !== dayId) {
                        return day;
                    }

                    const totalSeconds = parsedHours * 3600;
                    const dayOvertimeHours = Math.max(0, parsedHours - parseNumber(day.dayHoursTarget));

                    return {
                        ...day,
                        totalWorkedSeconds: totalSeconds,
                        totalWorkedHours: parsedHours,
                        overtimeHours: dayOvertimeHours,
                        overtimeDollars: dayOvertimeHours * parseNumber(day.rate) * OVERTIME_MULTIPLIER,
                        totalDollars: parsedHours * parseNumber(day.rate)
                    };
                })
            };
        }));
    };

    const deleteDay = (weekId, dayId) => {
        if (!window.confirm('Are you sure you want to delete this day?')) {
            return;
        }

        setWorkWeeks(prev => prev.map((week) => {
            if (week.id !== weekId) {
                return week;
            }
            return {
                ...week,
                days: (week.days || []).filter((day) => day.id !== dayId)
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
                <span className='text-outline-lite'>➕</span> Work Week
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
                    <div className='containerDetail bg-yellow size25 p-20 color-dark contentLeft'>
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
                        <div className='containerDetail flexContainer mt-5 pt-10 pb-10'>
                            <div className='flexColumn contentLeft color-lite'>
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
                        <div className='containerDetail mt-5 p-10 contentLeft bg-green color-yellow'>
                            {/*
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
                            */}
                            <div className='contentLeft color-lite mr-10'>
                                <span className='color-yellow ml-5 mr-5'>
                                    {`Earned:`}
                                </span>
                                {formatMoney(accumulatedDollars)}
                            </div>
                        </div>
                        <div className='containerDetail mt-5 p-10 contentLeft'>
                            <span className='contentLeft color-yellow mr-10'>
                                Overtime: 
                            </span>
                            <span className='color-lite'>
                                {overtimeHours.toFixed(2)}
                            </span>
                            <span className='contentRight color-yellow ml-10 mr-10'>
                                {`=>`}
                            </span>
                            <span className='color-lite'>
                                {formatMoney(overtimeDollars)}
                            </span>
                        </div>

                        {activeScheduleRows.length > 0 && (
                            <div className='containerDetail mt-5 mb-5 bg-lite'>
                                <CollapseToggleButton
                                    title={<span className='color-yellow'>Active Schedule</span>}
                                    isCollapsed={isActiveScheduleCollapsed}
                                    setCollapse={setIsActiveScheduleCollapsed}
                                    align='left'
                                />
                                {isActiveScheduleCollapsed ? null : (
                                    <div className='containerDetail p-10'>
                                        {activeScheduleRows.map((row, index) => (
                                            <div
                                                key={`active-schedule-${index}`}
                                                className='containerDetail flexContainer mt-5 p-10 contentLeft'
                                                style={index === nextActiveScheduleIndex ? { backgroundColor: 'rgba(255, 215, 0, 0.2)', border: '1px solid #ffd700' } : undefined}
                                            >
                                                <div className='flexColumn color-yellow pr-10'>
                                                    {row.time}
                                                </div>
                                                <div className={`flex2Column color-orange flexContainer`}>
                                                    <div className='flex2Column p-5 contentLeft'>
                                                        {index === nextActiveScheduleIndex ? '▶ ' : ''}
                                                        {row.label}
                                                    </div>
                                                    {index === nextActiveScheduleIndex && nextActiveScheduleCountdown ? <div className='containerDetail flexColumn pl-10 pr-10'>{nextActiveScheduleCountdown}</div> : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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
                                                {editingWeekId === week.id ? (
                                                    <div className='containerDetail bg-lite mb-5'>
                                                        <div className='containerDetail contentLeft p-10 color-yellow size20'>Edit Work Week</div>
                                                        <input
                                                            className='containerDetail m-5 p-10 color-lite'
                                                            placeholder='Employer'
                                                            aria-label='Edit employer'
                                                            value={weekEditForm.employer}
                                                            onChange={(e) => setWeekEditForm((prev) => ({ ...prev, employer: e.target.value }))}
                                                        />
                                                        <input
                                                            className='containerDetail m-5 p-10 color-lite'
                                                            placeholder='Work week hours'
                                                            aria-label='Edit work week hours'
                                                            type='number'
                                                            value={weekEditForm.weekHours}
                                                            onChange={(e) => setWeekEditForm((prev) => ({ ...prev, weekHours: e.target.value }))}
                                                        />
                                                        <input
                                                            className='containerDetail m-5 p-10 color-lite'
                                                            placeholder='Work day hours'
                                                            aria-label='Edit work day hours'
                                                            type='number'
                                                            value={weekEditForm.dayHours}
                                                            onChange={(e) => setWeekEditForm((prev) => ({ ...prev, dayHours: e.target.value }))}
                                                        />
                                                        <input
                                                            className='containerDetail m-5 p-10 color-lite'
                                                            placeholder='Hourly rate'
                                                            aria-label='Edit hourly rate'
                                                            type='number'
                                                            value={weekEditForm.rate}
                                                            onChange={(e) => setWeekEditForm((prev) => ({ ...prev, rate: e.target.value }))}
                                                        />
                                                        <div className='containerDetail flexContainer mt-10 bg-lite'>
                                                            <button
                                                                type='button'
                                                                className='button containerDetail flex2Column mr-5 p-10'
                                                                onClick={() => saveWeekEdit(week.id)}
                                                                aria-label='Save work week edits'
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                type='button'
                                                                className='button containerDetail flex2Column p-10'
                                                                onClick={cancelWeekEdit}
                                                                aria-label='Cancel work week edits'
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                <div
                                                    className='containerDetail bg-yellow button p-10 size20 contentLeft color-dark p-20 mb-5'
                                                    onClick={() => openWeekEdit(week)}
                                                    aria-label='Edit work week properties'
                                                >
                                                    ✏️ Edit Week
                                                </div>
                                                )}
                                                <div 
                                                    className='containerDetail button p-30 size25 contentLeft color-yellow mb-5 bg-green'
                                                    onClick={() => startWorkday(week.id)}
                                                    disabled={!!activeDay}
                                                    title={activeDay ? 'Complete the active day first.' : 'Start a new day in this week'}
                                                >
                                                    {isActiveWeek ? '🧑🏻‍💻 Active' : '▶️ Start'}
                                                </div>
                                                <ScheduleDisplay
                                                    hours={8}
                                                    startTime='13:30'
                                                />
                                                <div className='containerDetail contentLeft size20 p-20 color-yellow bg-lite mb-5'>
                                                    📅 Days Logged
                                                </div>
                                                {(week.days || []).length === 0 ? (
                                                    <div className='containerDetail color-red'>No days logged for this week.</div>
                                                ) : (
                                                    <div>
                                                        {(week.days || []).map((day) => {
                                                            const loggedDay = normalizeLoggedDay(day);

                                                            return (
                                                                <div key={day.id} className='containerDetail bg-lite mb-5'>
                                                                    <button
                                                                        type='button'
                                                                        className='button containerDetail contentLeft'
                                                                        onClick={() => toggleDayCollapse(week.id, day.id)}
                                                                        title='Expand/collapse workday'
                                                                        aria-expanded={!loggedDay.isCollapsed}
                                                                        style={{ width: '100%', textAlign: 'left' }}
                                                                    >
                                                                        <div className='containerDetail flexContainer p-10'>
                                                                            <div className='flex2Column contentRight color-yellow mr-10'>
                                                                                {loggedDay.isCollapsed ? '▶' : '▼'}
                                                                            </div>
                                                                            <div className='flex2Column contentLeft'>
                                                                                <div className='color-lite'>{day.employer}</div>
                                                                                <div className='size12 color-yellow'>
                                                                                    {day.day} · {day.date} · {parseNumber(day.totalWorkedHours).toFixed(2)} hrs worked
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </button>

                                                                    {!loggedDay.isCollapsed && (
                                                                        <div className='containerDetail mt-5 bg-lite color-lite'>
                                                                            <div className='containerDetail flexContainer p-10'>
                                                                                <div className='flex2Column contentRight color-yellow mr-5'>Rate:</div>
                                                                                <div className='flex2Column contentLeft'>{formatMoney(day.rate)} / hr</div>
                                                                            </div>
                                                                            <div className='containerDetail flexContainer mt-5 p-10'>
                                                                                <div className='flex2Column contentRight color-yellow mr-5'>Hours Target:</div>
                                                                                <div className='flex2Column contentLeft'>{day.dayHoursTarget}</div>
                                                                            </div>
                                                                            <div className='containerDetail flexContainer mt-5 p-10'>
                                                                                <div className='flex2Column contentRight color-yellow mr-5'>Total Dollars:</div>
                                                                                <div className='flex2Column contentLeft'>{formatMoney(day.totalDollars)}</div>
                                                                            </div>
                                                                            <div className='containerDetail flexContainer mt-5 p-10'>
                                                                                <div className='flex2Column contentRight color-yellow mr-5'>Projected Day Dollars:</div>
                                                                                <div className='flex2Column contentLeft'>{formatMoney(day.projectedDollars)}</div>
                                                                            </div>
                                                                            <div className='containerDetail flexContainer mt-5 p-10'>
                                                                                <div className='flex2Column contentRight color-yellow mr-5'>Overtime Dollars:</div>
                                                                                <div className='flex2Column contentLeft'>{formatMoney(day.overtimeDollars)}</div>
                                                                            </div>
                                                                            <div className='containerDetail flexContainer mt-5 p-10'>
                                                                                <div className='flex2Column contentRight color-yellow mr-5'>Initiated:</div>
                                                                                <div className='flex2Column contentLeft'>{formatDateTime(day.initiatedAt)}</div>
                                                                            </div>
                                                                            <div className='containerDetail flexContainer mt-5 p-10'>
                                                                                <div className='flex2Column contentRight color-yellow mr-5'>Ended:</div>
                                                                                <div className='flex2Column contentLeft'>{formatDateTime(day.endedAt)}</div>
                                                                            </div>
                                                                            <div className='containerDetail bg-lite mt-5 flexContainer p-10'>
                                                                                <div
                                                                                    title='Edit worked hours'
                                                                                    className='button flex2Column p-10 mr-5 bg-dkYellow color-dark size20'
                                                                                    onClick={() => editDay(week.id, day.id)}
                                                                                >
                                                                                    ✏️ Edit Hours
                                                                                </div>
                                                                                <div
                                                                                    title='Delete this workday'
                                                                                    className='button flex2Column p-10 bg-dkRed color-dark size20'
                                                                                    onClick={() => deleteDay(week.id, day.id)}
                                                                                >
                                                                                    🗑️ Delete Day
                                                                                </div>
                                                                            </div>
                                                                            <div className='containerDetail bg-lite mt-5'>
                                                                                <div className='containerDetail contentLeft size20 p-20 bg-blue color-yellow'>Logged Sessions</div>
                                                                                {(day.sessions || []).length === 0 ? (
                                                                                    <div className='containerDetail color-red'>No sessions recorded.</div>
                                                                                ) : (
                                                                                    <div className='scroll ht-250'>
                                                                                        {day.sessions.map((segment, index) => (
                                                                                            <div key={`${day.id}-segment-${index}`} className='containerDetail p-10 mt-5 contentLeft flexContainer'>
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
                                                            );
                                                        })}
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