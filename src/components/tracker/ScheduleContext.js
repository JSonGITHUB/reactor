import React, { createContext, useEffect, useState, useContext } from 'react';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';
import Sounds from '../sound/Sounds';

export const ScheduleContext = createContext();

const ScheduleParent = ({
    children,
    targetElementRef
}) => {

     const getStoredMeds = () => {
        const saved = localStorage.getItem('medSchedule');
        return saved ? JSON.parse(saved) : [];
    };
    const getStoredTimeline = () => {
        const saved = localStorage.getItem('medsTimeline');
        if (!saved) return [];
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    };
    const [meds, setMeds] = useState(getStoredMeds);
    const [timeline, setTimeline] = useState(getStoredTimeline);

        const handleCheck = (dose, idx) => {
        const newCompleted = !dose.completed;
        // Map over timeline and update only the matching dose
        const newTimeline = timeline.map((d, dIdx) => {
            if (
                d.medicationId === dose.medicationId &&
                new Date(d.time).getTime() === new Date(dose.time).getTime()
            ) {
                const updatedDose = { ...d, completed: newCompleted };
                return updatedDose;
            }
            return d;
        });
        setTimeline(newTimeline);
        localStorage.setItem('medsTimeline', JSON.stringify(newTimeline));
        if (newCompleted && typeof Sounds?.drip === 'function') {
            Sounds.drip();
        }
    };

    useEffect(() => {
        if (meds.length === 0) {
            const initialData = initializeData('medSchedule', []);
            setMeds(initialData);
            //localStorage.setItem('medSchedule', JSON.stringify(initialData));
        } else {
        }                                           
    }, [meds.length]);
    const saveMeds = (data) => {
        localStorage.setItem('medSchedule', JSON.stringify(data));
    };
    const saveTimeline = (data) => {
        localStorage.setItem('medsTimeline', JSON.stringify(data));
    };
    const generateSchedule = (medication) => {
        const interval = Number(medication.interval);
        const dosingMode = medication.dosingMode || 'interval';
        const dosesPerDay = Number(medication.dosesPerDay || (dosingMode === 'daily' ? 1 : 0));
        const isPerDay = dosingMode === 'perDay' || dosingMode === 'daily' || dosesPerDay > 0;
        const stepMs = interval * 60 * 60 * 1000;
        const totalDoses = medication.totalDoses ? Number(medication.totalDoses) : null;
        const { startTime, name, warning, instruction, weekdays } = medication;
        const schedule = [];
        let current = new Date(startTime);
        const now = new Date();
        const maxFuture = 7 * 24 * 60; // 1 week in minutes
        if (Number.isNaN(current.getTime())) {
            return schedule;
        }
    
        // Helper to get weekday string
        const getDayStr = date =>
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    
        if (isPerDay) {
            const dailyCount = Math.min(Math.max(dosesPerDay || 1, 1), 5);
            const startHour = current.getHours();
            const startMinute = current.getMinutes();
            const dayEndRaw = medication.dayEnd || medication.endTime || '';
            const dayEndMatch = typeof dayEndRaw === 'string' ? dayEndRaw.match(/(\d{2}):(\d{2})/) : null;
            const endHour = dayEndMatch ? Number(dayEndMatch[1]) : null;
            const endMinute = dayEndMatch ? Number(dayEndMatch[2]) : null;
            const horizon = new Date(now.getTime() + maxFuture * 60 * 1000);

            const startDay = new Date(current);
            startDay.setHours(0, 0, 0, 0);
            let dayCursor = new Date(startDay);
            if (!totalDoses) {
                const today = new Date(now);
                today.setHours(0, 0, 0, 0);
                if (dayCursor < today) {
                    dayCursor = today;
                }
            }

            const buildDoseTimesForDay = (dayDate) => {
                const dayStart = new Date(dayDate);
                dayStart.setHours(startHour, startMinute, 0, 0);

                if (dailyCount === 1) {
                    return [dayStart];
                }

                if (!Number.isFinite(endHour) || !Number.isFinite(endMinute)) {
                    return [dayStart];
                }

                const dayEnd = new Date(dayDate);
                dayEnd.setHours(endHour, endMinute, 0, 0);
                if (dayEnd <= dayStart) {
                    return [dayStart];
                }

                const spacing = (dayEnd.getTime() - dayStart.getTime()) / (dailyCount - 1);
                return Array.from({ length: dailyCount }, (_, index) => new Date(dayStart.getTime() + spacing * index));
            };

            let safety = 0;
            while (safety < 2000) {
                if (totalDoses && schedule.length >= totalDoses) {
                    break;
                }
                if (!totalDoses && dayCursor > horizon) {
                    break;
                }

                if (!weekdays || weekdays.length === 0 || weekdays.includes(getDayStr(dayCursor))) {
                    const doseTimes = buildDoseTimesForDay(dayCursor);
                    for (const doseTime of doseTimes) {
                        if (doseTime < current) continue;
                        if (!totalDoses && doseTime > horizon) continue;
                        schedule.push({
                            time: new Date(doseTime),
                            name,
                            warning,
                            instruction,
                            medicationId: medication.id
                        });
                        if (totalDoses && schedule.length >= totalDoses) {
                            break;
                        }
                    }
                }

                dayCursor = new Date(dayCursor.getTime() + 24 * 60 * 60 * 1000);
                safety += 1;
            }
        } else {
            if (!Number.isFinite(stepMs) || stepMs <= 0) {
                return schedule;
            }
            if (!totalDoses) {
                if (!Number.isNaN(current.getTime()) && stepMs > 0 && current < now) {
                    const diff = now.getTime() - current.getTime();
                    const steps = Math.floor(diff / stepMs);
                    current = new Date(current.getTime() + steps * stepMs);
                }
                let safety = 0;
                while ((current - now) / (60 * 1000) < maxFuture && safety < 2000) {
                    if (!weekdays || weekdays.length === 0 || weekdays.includes(getDayStr(current))) {
                        schedule.push({
                            time: new Date(current),
                            name,
                            warning,
                            instruction,
                            medicationId: medication.id
                        });
                    }
                    current = new Date(current.getTime() + stepMs);
                    safety += 1;
                }
            } else {
                for (let i = 0; i < totalDoses; i++) {
                    if (!weekdays || weekdays.length === 0 || weekdays.includes(getDayStr(current))) {
                        schedule.push({
                            time: new Date(current),
                            name,
                            warning,
                            instruction,
                            medicationId: medication.id
                        });
                    }
                    current = new Date(current.getTime() + stepMs);
                }
            }
        }
    
        return schedule;
    };

    const flattenSchedules = (meds) => {
        return meds.flatMap((med) => generateSchedule(med));
    };

    useEffect(() => {
        const baseSchedules = flattenSchedules(meds).sort((a, b) => new Date(a.time) - new Date(b.time));
        setTimeline((prevTimeline) => {
            const prevMap = new Map(
                (prevTimeline || []).map((dose) => [
                    `${dose.medicationId}-${new Date(dose.time).getTime()}`,
                    dose
                ])
            );
            return baseSchedules.map((dose) => {
                const key = `${dose.medicationId}-${new Date(dose.time).getTime()}`;
                const prev = prevMap.get(key);
                return prev
                    ? { ...dose, completed: prev.completed, activated: prev.activated, notified: prev.notified }
                    : dose;
            });
        });
        saveMeds(meds);
    }, [meds]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        saveTimeline(timeline);
    }, [timeline]);

    return (

        <ScheduleContext.Provider
            value={{
                targetElementRef,
                meds,
                setMeds,
                timeline,
                setTimeline,
                handleCheck
            }}>
            {
                (validate(meds) !== null)
                    ? children
                    : <div>WHOOOPSIE!</div>
            }
        </ScheduleContext.Provider>
    );

};
export const useSchedule = () => useContext(ScheduleContext);

export default ScheduleParent;