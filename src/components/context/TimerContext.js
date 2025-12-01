import React, { createContext, useEffect, useState, useContext, useRef } from 'react';
import validate from '../utils/validate';
import Sounds from '../sound/Sounds';
import icons from '../site/icons';

export const TimerContext = createContext();

const TimerParent = ({
    children,
    targetElementRef
}) => {

    const [steps, setSteps] = useState(JSON.parse(localStorage.getItem('steps')) || []);
    const [currentIndex, setCurrentIndex] = useState(JSON.parse(localStorage.getItem('timerState')).currentIndex || 0);
    const [newHours, setNewHours] = useState('');
    const [newMinutes, setNewMinutes] = useState('');
    const [newSeconds, setNewSeconds] = useState('');
    const [currentTimer, setCurrentTimer] = useState(Number(JSON.parse(localStorage.getItem('timerState')).currentTimer) || 0);
    const [isRunning, setIsRunning] = useState(JSON.parse(localStorage.getItem('timerState')).isRunning || false);
    const [newStep, setNewStep] = useState('');
    const [newTimer, setNewTimer] = useState('');
    const [timeLeft, setTimeLeft] = useState(JSON.parse(localStorage.getItem('timerState')).timeLeft || 0);
    const timerRef = useRef(null);
    const intervalRef = useRef(null);
    const [stepCollapse, setStepCollapse] = useState(true);
    const [stepsCollapse, setStepsCollapse] = useState(true);
    const [dialog, setDialog] = useState('');
    const stepDuration = 60;

    const totalSeconds =
        parseInt(newHours || 0) * 3600 +
        parseInt(newMinutes || 0) * 60 +
        parseInt(newSeconds || 0);

    const handleAddStep = () => {

        if (newStep && newTimer > 0) {
            setSteps([...steps, { step: newStep, timer: parseInt(newTimer) }]);
            setNewStep('');
            setNewTimer('');
        }

        const totalSeconds =
            parseInt(newHours || 0) * 3600 +
            parseInt(newMinutes || 0) * 60 +
            parseInt(newSeconds || 0);

        if (newStep && totalSeconds > 0) {
            setSteps([...steps, { step: newStep, timer: totalSeconds }]);
            setNewStep("");
            setNewHours("");
            setNewMinutes("");
            setNewSeconds("");
        }
    };

    const handleDeleteStep = (id) => {
        const newSteps = [...steps];
        newSteps.splice(id, 1);
        setSteps(newSteps);
    };

    const handleStartSequence = () => {
        if (steps.length > 0) {
            setCurrentIndex(0);
            setCurrentTimer(steps[0].timer);
            setIsRunning(true);
        }
    };

    const handleRestartStep = () => {
        if (steps.length > 0) {
            setCurrentTimer(steps[currentIndex].timer);
            setIsRunning(true);
        }
    };

    const toggleTimer = () => {
        setIsRunning((prev) => !prev);
    };

    const startTimer = () => {
        if (intervalRef.current) return; // Prevent multiple intervals
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

    const pauseTimer = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
    };

    const moveToNextStep = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentIndex(nextIndex);
            setTimeLeft(steps[nextIndex].timer);
            startTimer();
        } else {
            setIsRunning(false);
        }
    };

    useEffect(() => {
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
        if (currentTimer === 0 && isRunning) {
            Sounds['boop'](5);
        }
        console.log(`isRunning: ${isRunning}`);
        console.log(`currentIndex: ${currentIndex}`);
        localStorage.setItem('timerState', JSON.stringify({
            timeLeft,
            isRunning,
            lastTimestamp: Date.now(),
            currentTimer,
            currentIndex
        })
        );
        localStorage.setItem('steps', JSON.stringify(steps));
        console.log(`currentIndex: ${currentIndex}`);
        localStorage.setItem('currentIndex', currentIndex);
        localStorage.setItem('currentTimer', currentTimer);
        localStorage.setItem('isRunning', isRunning);
        if (isRunning) {
            localStorage.setItem('lastTimeStamp', Date.now());
        }
    }, [timeLeft, isRunning, steps, currentIndex, currentTimer]);

    useEffect(() => {

        const savedState = JSON.parse(localStorage.getItem('timerState'));
        const storedIsRunning = localStorage.getItem('isRunning') === 'true';
        const storedCurrentTimer = localStorage.getItem('currentTimer');
        const storedCurrentIndex = localStorage.getItem('currentIndex');
        const storedLastTimeStamp = localStorage.getItem('lastTimeStamp');
        const storedTimeLeft = localStorage.getItem('timeLeft');

        /////
        if (savedState) {
            const { lastTimestamp, timeLeft: savedTimeLeft, isRunning: wasRunning, currentTimer: savedCurrentTimer, currentIndex: savedCurrentIndex } = savedState;
            const elapsed = Math.floor((lastTimestamp - Date.now()) / 1000);
            console.log(`elapsed: ${JSON.stringify(elapsed, null, 2)}`);
            if (wasRunning) {
                const updatedTimeLeft = Math.max(savedTimeLeft - elapsed, 0);
                setTimeLeft(updatedTimeLeft);
                setCurrentTimer(Math.max(savedCurrentTimer - elapsed, 0));
                setCurrentIndex(savedCurrentIndex);

                if (updatedTimeLeft > 0) {
                    startTimer();
                } else {
                    moveToNextStep();
                }
            } else {
                setTimeLeft(savedTimeLeft);
                setCurrentTimer(savedCurrentTimer);
                setCurrentIndex(savedCurrentIndex);
            }
            setIsRunning(wasRunning);
        } else if (steps[currentIndex]) {
            setTimeLeft(steps[currentIndex].timer);
            setCurrentTimer(steps[currentIndex].timer);
        } 
        ////
        if (!isNaN(storedCurrentTimer)) {
            setCurrentTimer(storedCurrentTimer);
        }
        /*         if (!isNaN(storedCurrentIndex)) {
                    setCurrentIndex(storedCurrentIndex);
                } */
        setCurrentIndex(storedCurrentIndex);
        setIsRunning(storedIsRunning);

        if (storedIsRunning && !isNaN(storedLastTimeStamp)) {
            const currentTime = Date.now();
            const elapsedTime = Math.floor((currentTime - storedLastTimeStamp) / 1000);
            const newTimer = storedCurrentTimer - elapsedTime;
            const newStepIndex = Math.floor(newTimer / stepDuration);

            setCurrentTimer(newTimer);
            //setCurrentIndex(newStepIndex);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('steps', JSON.stringify(steps));
    }, [steps]);

    useEffect(() => {
        const totalSeconds =
            parseInt(newHours || 0) * 3600 +
            parseInt(newMinutes || 0) * 60 +
            parseInt(newSeconds || 0);

        /* if (newStep && totalSeconds > 0) {
            setSteps([...steps, { step: newStep, timer: totalSeconds }]);
            setNewStep("");
            setNewHours("");
            setNewMinutes("");
            setNewSeconds("");
        } */
    }, [newHours, newMinutes, newSeconds]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getHours = (totalSeconds) => Math.floor(totalSeconds / 3600);
    const getMinutes = (totalSeconds) => Math.floor((totalSeconds % 3600) / 60);
    const getSeconds = (totalSeconds) => totalSeconds % 60;

    const handleNextStep = () => {
        const nextStepIndex = Number(currentIndex) + 1;
        if (nextStepIndex < steps.length) {
            setCurrentIndex(nextStepIndex);
            setCurrentTimer(steps[nextStepIndex].timer);
        } else {
            setIsRunning(false);
            setCurrentIndex(-1);
        }
    };
    const handlePreviousStep = () => {
        const previousStepIndex = Number(currentIndex) - 1;
        if (previousStepIndex > -1) {
            setCurrentIndex(previousStepIndex);
            setCurrentTimer(steps[previousStepIndex].timer);
        } else {
            setIsRunning(false);
            setCurrentIndex(-1);
        }
    };

    const handleSaveSteps = () => {
        localStorage.setItem('steps', JSON.stringify(steps));
        alert('Steps saved successfully!');
    };

    useEffect(() => {
        let timer;
        if (isRunning) {
            timer = setInterval(() => {
                setCurrentTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning]);

    const getSteps = () => {
        const displaySteps = steps.length > 0 && (
            <div className='containerBox pt-20 bg-lite'>
                <span className='button size30 mr-15' title='previous step' onClick={handlePreviousStep}>{icons.up}</span>
                <span className='button size30 mr-15' title='reset timer' onClick={handleRestartStep}>{icons.start}</span>
                <span className='size30 mr-15' title='restart steps' onClick={handleStartSequence}>{icons.restart}</span>
                <span className='size30 mr-15' title={isRunning ? 'pause' : 'play'} onClick={toggleTimer}>{isRunning ? icons.pause : icons.play}</span>
                <span className='button size30 mr-15' title='next step' onClick={handleNextStep}>{icons.end}</span>
                <span className='button size30' title='next step' onClick={handleNextStep}>{icons.down}</span>
            </div>
        )
        return displaySteps;
    }


    const editStep = (index) => {
        const newStep = prompt(`Edit step:`, steps[index].step);
        const newSteps = [...steps];
        newSteps[index].step = newStep;
        setSteps(newSteps);
    }
    const editTimer = (index) => {
        //const newTimer = prompt(`Edit timer (${formatTime(steps[index].timer)}):`, steps[index].timer);
        const newHours = prompt(`Edit hours:`, getHours(steps[index].timer));
        const newMinutes = prompt(`Edit minutes:`, getMinutes(steps[index].timer));
        const newSeconds = prompt(`Edit seconds:`, getSeconds(steps[index].timer));
        const totalSeconds =
            parseInt(newHours || 0) * 3600 +
            parseInt(newMinutes || 0) * 60 +
            parseInt(newSeconds || 0);
        const newSteps = [...steps];
        newSteps[index].timer = totalSeconds;
        setSteps(newSteps);
    }
    const editSteps = (index) => {
        editStep(index);
        editTimer(index);
    }

    return (

        <TimerContext.Provider
            value={{
                steps,
                setSteps,
                currentIndex,
                setCurrentIndex,
                newHours,
                setNewHours,
                newMinutes,
                setNewMinutes,
                newSeconds,
                setNewSeconds,
                currentTimer,
                setCurrentTimer,
                isRunning,
                setIsRunning,
                newStep,
                setNewStep,
                newTimer,
                setNewTimer,
                timeLeft,
                setTimeLeft,
                timerRef,
                intervalRef,
                stepCollapse,
                setStepCollapse,
                stepsCollapse,
                setStepsCollapse,
                dialog,
                setDialog,
                stepDuration,
                getHours,
                getMinutes,
                getSeconds,
                getSteps,
                handleAddStep,
                editStep,
                editTimer,
                formatTime,
                editSteps,
                handleDeleteStep,
                handleSaveSteps,
                targetElementRef
            }}>
            {
                (validate(steps) !== null)
                    ? children
                    : <div>WHOOOPSIE!</div>
            }
        </TimerContext.Provider>
    );

};
export const useTimer = () => useContext(TimerContext);

export default TimerParent;