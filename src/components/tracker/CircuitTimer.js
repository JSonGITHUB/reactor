import React, { useState, useEffect, useContext } from 'react';
import Sounds from '../sound/Sounds';
import { CircuitContext } from '../context/CircuitContext';
import initializeData from '../utils/InitializeData';

const CircuitTimer = ({
    category,
    excersize,
    index,
    groupIndex,
    subgroupIndex,
    time,
    toggleCheckbox,
    triggerNextTimer
}) => {

    const {
        circuits,
        activeIndex,
        setActiveIndex,
        setNextActiveIndex,
        activated,
        setActivated,
        ticker,
        countdown,
        jumpToActive,
        edit,
        setEdit
    } = useContext(CircuitContext);

    const getInitTime = () => {
        const localData = [...circuits];
        const currentLocalExcersize = localData[groupIndex].circuits[subgroupIndex].excersizes[index];
        if (category === 'session') {
            return Number(currentLocalExcersize.currentTime) || time;
        } else {
            return Number(currentLocalExcersize.restTime) || time;
        }
    }
    const [pause, setPause] = useState((excersize.activated) ? false : true);
    const [startTime, setStartTime] = useState(excersize.startTime);
    const [currentTime, setCurrentTime] = useState(getInitTime());

    const isStart = () => (currentTime === time) ? true : false;
    const totalSeconds = (milliseconds) => Math.floor(milliseconds / 1000);
    const id = `${category}index${index}groupIndex${groupIndex}subgroupIndex${subgroupIndex}`;

    const calculateTimeLeft = () => {
        const millisecondsRemaining = currentTime * 1000;
        const elapsedMilliseconds = Number(Date.now() - startTime);
        const remainingMilliseconds = Number(millisecondsRemaining - elapsedMilliseconds);
        const timeRemaining = totalSeconds(remainingMilliseconds);
        const secondsRemaining = (timeRemaining > 0) ? timeRemaining : 0;
        if (secondsRemaining <= 5 && secondsRemaining > 0 && countdown) {
            Sounds.clank();
        } else if (secondsRemaining > 5 && ticker) {
            Sounds.softBell(.95);
        }
        setCurrentTime(timeRemaining);
        if (timeRemaining <= 0) {            
            setPause(true);
            toggleCheckbox(index, groupIndex, subgroupIndex);
            setTimeout(() => {
                triggerNextTimer(index, groupIndex, subgroupIndex)
            }, 1000);
            Sounds.drip();
        }
    };

    const startTimer = () => {
        setStartTime(Date.now());
        localStorage.setItem('activated', true);
        setPause(false);
    };
    const startManualTimer = () => {
        setActivated(true);
        setActiveIndex(id);
        setNextActiveIndex(id);
        startTimer();
    }

    const pauseTimer = () => {
        const updatedCircuits = [...circuits];
        updatedCircuits[groupIndex].circuits[subgroupIndex].excersizes[index].activated = false;
        if (category === 'session') {
            updatedCircuits[groupIndex].circuits[subgroupIndex].excersizes[index].currentTime = currentTime;
        } else {
            updatedCircuits[groupIndex].circuits[subgroupIndex].excersizes[index].restTime = currentTime;
        }
        localStorage.setItem('circuitTracking', JSON.stringify(updatedCircuits));
        console.log(`localStorage.setItem('circuitTracking')6`)
        localStorage.setItem('activated', false);
        setPause(true);
    };

    const resetTimer = () => {
        setPause(true);
        setStartTime(0);
        setCurrentTime((excersize.type === 'track') ? 0 : time);
    };
    
    useEffect(() => {
        localStorage.setItem('activated', activated);
        jumpToActive()
    }, [activated]);

    useEffect(() => {
        let timerInterval;
        if (!pause) {
            calculateTimeLeft();
            timerInterval = setInterval(() => {
                calculateTimeLeft();
            }, 1000);
        }
        return () => clearInterval(timerInterval);

    }, [pause]);
    
    useEffect(() => {
        localStorage.setItem('time', time);
        const localActivated = initializeData('activated', 'false');
        if (activeIndex === id && localActivated === 'true') {
            startTimer();
            jumpToActive();
        }
    }, []);
    const formatTime = (seconds) => {
        if (activeIndex === id) {
            localStorage.setItem('activeCircuitTime', seconds);
        }
        const hoursDisplay = Math.floor(seconds / 3600);
        const minutesDisplay = Math.floor((seconds % 3600) / 60);
        const secondsDisplay = seconds % 60;
        return `${hoursDisplay < 10 ? '0' : ''}${hoursDisplay}:${minutesDisplay < 10 ? '0' : ''}${minutesDisplay}:${secondsDisplay < 10 ? '0' : ''}${secondsDisplay}`;
    };

    const getTimerButtonClasses = () => {
        const timerButtonClasses = pause ? 'bg-dkGreen' : 'bg-dkRed';
        return timerButtonClasses;
    }

    return (
        <div id={id} className='flexContainer bold'>
            <div 
                title={(pause) ? ((excersize.type === 'timer') && (currentTime === 0)) ? 'reset' : 'start' : 'pause'}
                className={`containerBox flex3Column button color-lite contentCenter ${getTimerButtonClasses()}`} 
                onClick={(pause) ? ((excersize.type === 'timer') && (currentTime === 0)) ? resetTimer : startManualTimer : pauseTimer}
            >
                {!pause ? 'PAUSE' : (isStart()) ? 'START' : (currentTime === 0) ? 'RESTART' : 'RESUME'}
            </div>
            <div className='containerDetail flex3Column bg-tinted color-yellow contentCenter size25 pt-10 mt-5 mb-5'>
                {formatTime(Number(currentTime))}
            </div>
            <div 
                title='reset'
                className={`containerBox flex3Column color-lite button contentCenter ${getTimerButtonClasses()}`} 
                onClick={resetTimer}
            >
                RESET
            </div>
        </div>
    );
};

export default CircuitTimer;