import React, { useContext, useRef, useEffect } from 'react';
import { StepContext } from '../context/StepContext';
//import Selector from '../forms/FunctionalSelector';
import StepsDisplay from './StepsDisplay';

const StepTimerContainer = () => {
    const {
        timerState,
        steps,
        currentStepIndex,
        setCurrentStepIndex,
        schedules,
        setSchedules,
        schedule,
        scheduleNames,
        selectSchedule,
        setSchedule,
        timeLeft,
        //setTimeLeft,
        currentTimer,
        setCurrentTimer,
        isRunning,
        setIsRunning,
        formatTime,
        getHours,
        getMinutes,
        getSeconds,
        handleNextStep,
        targetElementRef
    } = useContext(StepContext);
    
    /*
    const locationScrollerRef = useRef(null);

    const setScroll = () => {

        const height = () => currentStepIndex * 300;
        
        console.log(`StepTimerContainer => setScroll => height: ${height()}`);

        window.scrollTo({
            top: height(),
            behavior: 'smooth',
        });

        if (locationScrollerRef.current) {
            //console.log(`setScroll => height: ${height()}`)
            //console.log(`setScroll => locationScrollerRef.current.scrollHeight: ${locationScrollerRef.current.scrollHeight}`)
            locationScrollerRef.current.scrollTo({
                top: height(),
                left: 0,
                behavior: 'smooth',
            });
        }
    }
   
    useEffect(() => {
        setScroll();
    }, [currentStepIndex]);
    
    
    useEffect(() => {
        //console.log(`StepTimerContainer => scheduleNames: ${JSON.stringify(schedules, null, 2)}`);
    }, []);
    useEffect(() => {
        //console.log(`StepTimerContainer => scheduleNames: ${JSON.stringify(schedules, null, 2)}`);
    }, [schedules]);
    */

    return (
        <div className='containerBox'>
            {/* <div className='containerBox'>
                {dialog}
            </div> */}
            {
            /*
                (schedules && schedules.length > 0)
                ? <Selector
                    groupTitle='schedule'
                    label='schedule selector'
                    items={['Weekday', 'Weekend']}
                    selected={schedule}
                    onChange={selectSchedule}
                    fontSize='25'
                    padding='10px'
                    width={'100%'}
                />
                : null
            */
            }
            <StepsDisplay />
        </div>
    )
}

export default StepTimerContainer