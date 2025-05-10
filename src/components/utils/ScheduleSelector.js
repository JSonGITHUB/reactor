import React, { useContext, useState } from 'react'
import Selector from '../forms/FunctionalSelector';
import { StepContext } from '../context/StepContext';

const ScheduleSelector = React.memo(() => {

    const {
        schedules,
        scheduleNames,
        schedule,
        selectSchedule,
        isRunning,
        setIsRunning,
    } = useContext(StepContext);

    const [wasRunning, setWasRunning] = useState(false);

    const removeDuplicates = (array) => [...new Set(array)];
    const getSchedules = () => {
        if (!schedules) {
            return ['Add Schedule'];
        }
        const newSchedules = [...schedules];
        let currenSchedules = [];
        if (schedules && scheduleNames && (schedules.length > scheduleNames.length || schedules.length == scheduleNames.length)) {
            currenSchedules = newSchedules.map((schedule) => schedule.title);
        } else {
            currenSchedules = scheduleNames || ['Weekday', 'Training'];
        }
        if (currenSchedules.indexOf('Add Schedule') === -1) {
            currenSchedules.push('Add Schedule');
        }
        const cleanArray = removeDuplicates(currenSchedules);
        return cleanArray;
    }
    //console.log(`getSchedules: ${JSON.stringify(getSchedules(), null, 2)}`);
    
    const handleMouseOver = () => {
        if (isRunning) {
            setWasRunning(true);
            setIsRunning(false);
        }
    };

    const handleMouseOut = () => {
        if (wasRunning) {
            setIsRunning(true);
            setWasRunning(false);
        }
    };
    const handleTouchStart = () => {
        if (isRunning) {
            setIsRunning(false);
        }
    };

    const handleTouchEnd = () => {
        if (!isRunning) {
            setIsRunning(true);
        }
    };

    return (
        schedules && schedules.length > 0 && (
                <div
                    className='containerBox pr-20'
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    //onTouchStart={handleTouchStart}
                    //onTouchEnd={handleTouchEnd}
                >
                    <Selector
                        groupTitle='schedule'
                        label='schedule selector'
                        items={getSchedules()}
                        selected={getSchedules()[schedule]}
                        onChange={selectSchedule}
                        fontSize='25'
                        padding='10px'
                        width='100%'
                        alignText='left'
                    />
                </div>
    ))
});

export default ScheduleSelector