import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import Sounds from '../sound/Sounds';
import initializeData from '../utils/InitializeData';
import initStepSchedules from '../utils/initStepSchedules';
import validate from '../utils/validate';

export const StepContext = createContext();

const StepsParent = ({
    children,
    targetElementRef
}) => {

    const timerRef = useRef(null);
    const intervalRef = useRef(null);

    const timerState = initializeData('timerState', {});
    const [steps, setSteps] = useState(initStepSchedules[0].steps);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [schedules, setSchedules] = useState(initStepSchedules);
    const [schedule, setSchedule] = useState(0);
    const [stepCollapse, setStepCollapse] = useState(true);
    //const [timeLeft, setTimeLeft] = useState(timerState.timeLeft || 0);
    const [currentTimer, setCurrentTimer] = useState();
    const [isRunning, setIsRunning] = useState(timerState.isRunning || false);
    const [scheduleNames, setScheduleNames] = useState();
    const [newStep, setNewStep] = useState('');
    const [newHours, setNewHours] = useState('');
    const [editIndex, setEditIndex] = useState();
    const [newMinutes, setNewMinutes] = useState('');
    const [newSeconds, setNewSeconds] = useState('');
    const [newNote, setNewNote] = useState('');
    const [dialog, setDialog] = useState('');
    const [newTimer, setNewTimer] = useState('');

    const getHours = (totalSeconds) => Math.floor(totalSeconds / 3600);
    const getMinutes = (totalSeconds) => Math.floor((totalSeconds % 3600) / 60);
    const getSeconds = (totalSeconds) => totalSeconds % 60;

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'completed';

        const date = new Date(timestamp);

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const period = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;

        return `${hours}:${minutes}:${seconds} ${period}`;
    };

    const determineStepAndTimer = () => {
        const steps = updatedSteps();
        if (validate(schedules) === null && (!steps || steps.length === 0)) {
            return {
                currentStep: 0,
                currentTimer: 0,
                currentStepIndex: 0,
            };
        } else {
            const now = Date.now();
            const { lastTimestamp, currentTimer, currentStepIndex, isRunning } = timerState;
            const timeElapsed = isRunning ? Math.floor((now - lastTimestamp) / 1000) : 0;
            let updatedTimer = currentTimer - timeElapsed;
            let updatedStepIndex = (currentStepIndex >= 0) ? currentStepIndex : 0;
            while (updatedTimer <= 0 && updatedStepIndex < steps.length) {
                updatedTimer += steps[updatedStepIndex].timer;
                updatedStepIndex++;
            }
            if (updatedStepIndex >= steps.length) {
                updatedStepIndex = 0;
                updatedTimer = steps[updatedStepIndex].timer;
            }
            return {
                currentStep: steps[updatedStepIndex],
                currentTimer: updatedTimer,
                currentStepIndex: updatedStepIndex,
            };
        }
    };
    /* 
    const moveToNextStep = () => {
        const nextIndex = ((currentStepIndex >= 0) ? currentStepIndex : 0) + 1;
        const steps = updatedSteps();
        if (((nextIndex >= 0)) && (nextIndex < steps.length)) {
            setCurrentStepIndex(nextIndex);
            setTimeLeft(steps[nextIndex].timer);
            startTimer();
        } else {
            setIsRunning(false);
        }
    };
    */
    const pauseTimer = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
    };
    /* 
    const startTimer = () => {
        if (intervalRef.current) return;
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    moveToNextStep();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
     */
    const calculateStepTimes = () => {
        const now = Date.now(); 
        let accumulatedTime = now;
        const newSteps = [...steps];
        return newSteps.map((step, index) => {
            const startTime = index >= currentStepIndex ? accumulatedTime : null;
            const endTime = index >= currentStepIndex ? startTime + step.duration * 1000 : null;
            if (index >= currentStepIndex) {
                accumulatedTime = endTime;
            }
            return {
                ...step,
                startTime,
                endTime
            };
        });
    }
    const updatedSteps = () => {
        const now = Date.now();
        const elapsedTime = steps
            .slice(0, currentStepIndex)
            .reduce((total, step) => total + step.timer * 1000, 0);
        let accumulatedTime = now - elapsedTime;
        return steps.map((step, index) => {
            const startTime = accumulatedTime;
            const endTime = startTime + step.timer * 1000;
            accumulatedTime = endTime;
            return {
                ...step,
                startTime: formatTimestamp(startTime),
                endTime: formatTimestamp(endTime)
            };
        });
    }

    const updatedStepss = () => {
        const now = Date.now();
        let cumulativeTime = 0;
        let newSteps = [];
        if (validate(schedules) !== null) {
            if ((!steps || steps.length === 0) && schedules.length > 0 && schedules[schedule].steps) {
                newSteps = [...schedules[schedule].steps];
            } else {
                newSteps = [...steps];
            }
        }
        newSteps = newSteps.map((step, index) => {
            if (index < ((currentStepIndex >= 0) ? currentStepIndex : 0)) {
                /* 
                console.log(`2 - index: ${index} currentStepIndex: ${currentStepIndex}`);
                const newStep = {
                    ...step,
                    stepIndex: index,
                    startTime: null,
                    endTime: null,
                };
                 */
                const startTime = now + cumulativeTime;
                cumulativeTime += step.timer * 1000;
                const endTime = now + cumulativeTime;
                console.log(`3 - step: ${step.step} index: ${index} currentStepIndex: ${currentStepIndex} startTime: ${formatTimestamp(startTime)} endTime: ${formatTimestamp(endTime)}`);
                const newStep = {
                    ...step,
                    stepIndex: index,
                    startTime: formatTimestamp(startTime),
                    endTime: formatTimestamp(endTime),
                };
                return newStep;
            } else {
                const startTime = now + cumulativeTime;
                cumulativeTime += step.timer * 1000;
                const endTime = now + cumulativeTime;
                console.log(`3 - step: ${step.step} index: ${index} currentStepIndex: ${currentStepIndex} startTime: ${formatTimestamp(startTime)} endTime: ${formatTimestamp(endTime)}`);
                const newStep = {
                    ...step,
                    stepIndex: index,
                    startTime: formatTimestamp(startTime),
                    endTime: formatTimestamp(endTime),
                };
                return newStep;
            }
        });
        return newSteps;
    };
    const updateSteps = (stepIndex) => {
        if (validate(schedules) !== null) {
            if (!isRunning) return steps;
            const newSteps = updatedSteps();
            localStorage.setItem('steps', JSON.stringify(newSteps));
            //setSteps(newSteps);
            const newSchedules = [...schedules];
            newSchedules.map((scheduleData, index) => {
                if (index === schedule) {
                    return {
                        ...scheduleData,
                        steps: newSteps,
                    };
                }
                return scheduleData;
            });
            //localStorage.setItem('schedules', JSON.stringify(newSchedules));
            setSchedules(newSchedules);
        }
    };
    const handleNextStep = () => {
        const steps = updatedSteps();
        const nextStepIndex = ((currentStepIndex >= 0) ? currentStepIndex : 0) + 1;
        if ((nextStepIndex >= 0) && (nextStepIndex < steps.length)) {
            setCurrentStepIndex(nextStepIndex);
            setCurrentTimer(steps[nextStepIndex].timer);
        } else {
            setIsRunning(false);
            setCurrentStepIndex(0);
        }
    };
    const handleRestartStep = () => {
        const steps = updatedSteps();
        if (steps.length > 0) {
            setCurrentTimer(steps[(currentStepIndex >= 0) ? currentStepIndex : 0].timer);
            setIsRunning(true);
        }
    };
    const toggleTimer = () => {
        setIsRunning((prev) => !prev);
    };
    const totalSeconds =
        parseInt(newHours || 0) * 3600 +
        parseInt(newMinutes || 0) * 60 +
        parseInt(newSeconds || 0);

    const selectSchedule = (groupTitle, label, selected) => {
        if (selected === 'Add Schedule') {
            addSchedule();
            return;
        }
        if (scheduleNames !== undefined) {
            console.log(`StepTimer => selectSchedule => schedule: ${selected}`);
            console.log(`scheduleNames: ${JSON.stringify(scheduleNames, null, 2)}`);
            const scheduleIndex = scheduleNames.findIndex(c => c === selected);
            console.log(`StepContext => scheduleIndex: ${scheduleIndex}`);
            localStorage.setItem('schedule', (scheduleIndex < 0) ? 0 : scheduleIndex);
            setSchedule((scheduleIndex < 0) ? 0 : scheduleIndex);
            setCurrentStepIndex(0);
        } else {
            const newSchedules = [...schedules];
            const newScheduleNames = newSchedules.map((schedule) => schedule.title);
            const scheduleIndex = newScheduleNames.findIndex(c => c === selected);
            localStorage.setItem('schedule', (scheduleIndex < 0) ? 0 : scheduleIndex);
            setSchedule((scheduleIndex < 0) ? 0 : scheduleIndex);
            setCurrentStepIndex(0);
            setIsRunning(false);
        }

    }
    const removeDuplicates = (array) => [...new Set(array)];

    const addSchedule = () => {

        const newSchedules = [...schedules];
        const newScheduleNames = newSchedules.map((schedule) => schedule.title);
        const scheduleIndex = newScheduleNames.length;
        const newSchedule = prompt('Enter new schedule name:');
        newSchedules.push({ title: `${newSchedule}`, steps: [] });
        newScheduleNames.push(`${newSchedule}`);
        const cleanNames = removeDuplicates(newScheduleNames);
        localStorage.setItem('schedules', JSON.stringify(newSchedules));
        localStorage.setItem('scheduleNames', JSON.stringify(cleanNames));
        localStorage.setItem('schedule', (scheduleIndex < 0) ? 0 : scheduleIndex);
        setSchedules(newSchedules);
        setSchedule((scheduleIndex < 0) ? 0 : scheduleIndex);
        setScheduleNames(cleanNames);
        setCurrentStepIndex(0);
        setIsRunning(false);

    }

    useEffect(() => {

        /* if (newStep && totalSeconds > 0) {
            setSteps([...steps, { step: newStep, timer: totalSeconds }]);
            setNewStep('');
            setNewHours('');
            setNewMinutes('');
            setNewSeconds('');
        } */
    }, [newHours, newMinutes, newSeconds]);
    
    useEffect(() => {
        const newSchedules = [...schedules];
        newSchedules[schedule].steps[currentStepIndex].note = newNote;
        console.log(`StepContext => note: ${newSchedules[schedule].steps[currentStepIndex].note}`);
        setSchedules(newSchedules);
    }, [newNote]);

    useEffect(() => {
        if (currentTimer === 0 && isRunning) {
            Sounds['boop'](5);
        }
        if (isRunning && currentTimer > 0) {
            timerRef.current = setTimeout(() => {
                setCurrentTimer((prev) => prev - 1);
            }, 1000);
        } else if (isRunning && currentTimer === 0) {
            clearTimeout(timerRef.current);
            handleNextStep();
        }
        return () => clearTimeout(timerRef.current);
    }, [isRunning, currentTimer]);

    useEffect(() => {
        const savedState = timerState;
        const currentStep = initializeData('currentStepIndex', 0);
        
        const hasTitle = (array) => array.length > 0 && array[0].hasOwnProperty('title');
        const initializedSchedules = initializeData('schedules', initStepSchedules);
        setSchedules((hasTitle(initializedSchedules) ? initializedSchedules : initStepSchedules));
        setSchedule((initializeData('schedule', 0) < 0) ? 0 : initializeData('schedule', 0));
        const newSchedules = ['Add Schedule'];
        const newScheduleNames = newSchedules.map((schedule) => schedule.title);
        setScheduleNames(initializeData('scheduleNames', newScheduleNames));

        //setTimeLeft(currentStep.currentTimer);
        setCurrentTimer(currentStep.currentTimer);
        setCurrentStepIndex((currentStep.currentStepIndex >= 0) ? currentStep.currentStepIndex : 0);
    }, []);
    useEffect(() => {
        if (validate(schedules) !== null && (steps === undefined || steps[(currentStepIndex >= 0) ? currentStepIndex : 0].startTime !== null)) {
            console.log(`StepTimer => 1 schedule: ${schedule} steps: ${JSON.stringify(schedules[schedule].steps[currentStepIndex], null, 2)}`);
        } else {
            localStorage.setItem('steps', JSON.stringify(updatedSteps()));
        }
    }, [steps]);
    useEffect(() => {
        const steps = updatedSteps();
        if ((currentStepIndex >= 0) && steps.length > 0) {
            setCurrentTimer(steps[currentStepIndex].timer);
            setIsRunning(true);
            setSteps(steps);
        }
    }, [currentStepIndex]);
    useEffect(() => {
        let cleanNames = [];
        if (scheduleNames === undefined || scheduleNames.length === 0) {
            const newSchedules = initializeData('scheduleNames', ['Add Schedule'])
            cleanNames = removeDuplicates(newSchedules);
        } else {
            cleanNames = removeDuplicates(scheduleNames);
        }
        localStorage.setItem('scheduleNames', JSON.stringify(cleanNames));
    }, [scheduleNames]);
    useEffect(() => {
        if (validate(schedules) !== null && schedules.length > 0) {
            updateSteps((currentStepIndex >= 0) ? currentStepIndex : 0);
        }
    }, [isRunning]);
    useEffect(() => {
        if (schedule < 0) {
            setSchedule(0);
        } else {
            if (validate(schedules) !== null && schedules.length > 0 && schedules[schedule] && schedules[schedule].steps) {
                if (schedules[schedule].steps.length === 0) {
                    setStepCollapse(false);
                } else {
                    setStepCollapse(true);
                }
                setSteps(updatedSteps());
            }
        }
    }, [schedule]);
    useEffect(() => {
        if (validate(schedules) !== null && schedules.length > 0) {
            const newSchedules = [...schedules];
            const newScheduleNames = newSchedules.map((schedule) => schedule.title);
            const cleanNames = removeDuplicates(newScheduleNames);
            if (cleanNames[0] !== undefined) {
                setScheduleNames(cleanNames);
            }
            const savedState = timerState;
            const currentStep = determineStepAndTimer();
            setSchedule((initializeData('schedule', 0) < 0) ? 0 : initializeData('schedule', 0));

            //setTimeLeft(currentStep.currentTimer);
            setCurrentTimer(currentStep.currentTimer);
            setCurrentStepIndex((currentStep.currentStepIndex >= 0) ? currentStep.currentStepIndex : 0);
        }
        if (validate(schedules) !== null) {
            localStorage.setItem('schedules', JSON.stringify(schedules));
        }
    }, [schedules]);
    /* 
    useEffect(() => {
        if ((currentStepIndex >= 0) && currentTimer !== undefined && steps !== undefined && steps.length > 0) {
            localStorage.setItem('timerState', JSON.stringify({
                timeLeft,
                isRunning,
                lastTimestamp: Date.now(),
                currentTimer,
                currentStepIndex
            })
            );
            localStorage.setItem('steps', JSON.stringify(steps));
            localStorage.setItem('currentStepIndex', currentStepIndex);
        }

    }, [timeLeft, isRunning, steps, currentStepIndex, currentTimer]);
 */
    return (

        <StepContext.Provider value={{
            timerState,
            steps,
            setSteps,
            currentStepIndex,
            setCurrentStepIndex,
            schedules,
            setSchedules,
            scheduleNames,
            schedule,
            stepCollapse,
            setStepCollapse,
            setSchedule,
            selectSchedule,
            addSchedule,
            //setTimeLeft,
            currentTimer,
            setCurrentTimer,
            isRunning,
            setIsRunning,
            formatTime,
            formatTimestamp,
            getHours,
            getMinutes,
            getSeconds,
            handleNextStep,
            handleRestartStep,
            toggleTimer,
            newStep,
            setNewStep,
            newHours,
            setNewHours,
            editIndex,
            setEditIndex,
            newMinutes,
            setNewMinutes,
            newSeconds,
            setNewSeconds,
            newNote,
            setNewNote,
            dialog,
            setDialog,
            newTimer,
            setNewTimer,
            updatedSteps,
            targetElementRef
        }}>
            {
                (validate(steps) !== null)
                    ? children
                    : <div>
                        WHOOOPSIE!
                    </div>
            }
        </StepContext.Provider>
    );
};
export const useStep = () => useContext(StepContext);

export default StepsParent;