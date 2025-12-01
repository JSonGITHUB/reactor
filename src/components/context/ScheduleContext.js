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
    const [meds, setMeds] = useState(getStoredMeds);
    const [timeline, setTimeline] = useState([]);

        const handleCheck = (dose, idx) => {
        const newCompleted = !dose.completed;
        // Map over timeline and update only the matching dose
        const newTimeline = timeline.map((d, dIdx) => {
            if (
                d.medicationId === dose.medicationId &&
                new Date(d.time).getTime() === new Date(dose.time).getTime()
            ) {
                const updatedDose = { ...d, completed: newCompleted };
                console.log(`ScheduleContext => newTimeline => Dose ${updatedDose.name} ${updatedDose.time}: ${newCompleted ? 'completed' : 'uncompleted'}: ${JSON.stringify(updatedDose, null, 2)}`);
                return updatedDose;
            }
            return d;
        });
        console.log(`ScheduleContext => newTimeline: ${JSON.stringify(newTimeline, null, 2)}`);
        setTimeline(newTimeline);
        console.log(`newTimeline: ${JSON.stringify(newTimeline, null, 2)}`);
        localStorage.setItem('medsTimeline', JSON.stringify(newTimeline));
        if (newCompleted && typeof Sounds?.drip === 'function') {
            Sounds.drip();
        }
    };

    useEffect(() => {
        if (meds.length === 0) {
            const initialData = initializeData('medSchedule', []);
            setMeds(initialData);
            console.log(`ScheduleContext => useEffect => initialized meds: ${JSON.stringify(initialData, null, 2)}`);
            //localStorage.setItem('medSchedule', JSON.stringify(initialData));
        } else {
            console.log(`ScheduleContext => useEffect => existing meds: ${JSON.stringify(meds, null, 2)}`);
        }                                           
    }, []);
    const saveMeds = (data) => {
        localStorage.setItem('medSchedule', JSON.stringify(data));
    };
    const saveTimeline = (data) => {
        console.log(`ScheduleContext => saveTimeline => timeline: ${JSON.stringify(data, null, 2)}`);
        //localStorage.setItem('medsTimeline', JSON.stringify(data));
    };
    const generateSchedule = (medication) => {
        const interval = Number(medication.interval);
        const totalDoses = medication.totalDoses ? Number(medication.totalDoses) : null;
        const { startTime, name, warning, instruction, weekdays } = medication;
        const schedule = [];
        let current = new Date(startTime);
        const now = new Date();
        const maxFuture = 7 * 24 * 60; // 1 week in minutes
    
        // Helper to get weekday string
        const getDayStr = date =>
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    
        if (!totalDoses) {
            while ((current - now) / (60 * 1000) < maxFuture) {
                if (!weekdays || weekdays.length === 0 || weekdays.includes(getDayStr(current))) {
                    schedule.push({
                        time: new Date(current),
                        name,
                        warning,
                        instruction,
                        medicationId: medication.id
                    });
                }
                current = new Date(current.getTime() + interval * 60 * 60 * 1000);
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
                current = new Date(current.getTime() + interval * 60 * 60 * 1000);
            }
        }
    
        return schedule;
    };

    const flattenSchedules = (meds) => {
        return meds.flatMap((med) => generateSchedule(med));
    };

    useEffect(() => {
        if (!timeline || timeline == []) {
            const allSchedules = flattenSchedules(meds).sort((a, b) => new Date(a.time) - new Date(b.time));
            setTimeline(allSchedules);
        }
        saveMeds(meds);
    }, [meds]);
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