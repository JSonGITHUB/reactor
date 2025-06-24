import React, { useState, useEffect } from 'react';
import initializeData from '../utils/InitializeData';

const TodoStopwatch = ({
    category,
    todo,
    index,
    groupIndex,
    subgroupIndex,
    todos,
    localData,
    time
}) => {
  
    const [pause, setPause] = useState((todo.activated) ? false : true);
    const [startTime, setStartTime] = useState(todo.startTime);
    const [currentTime, setCurrentTime] = useState(todo.currentTime);
    const isStart = () => (currentTime == time) ? true : false;
    const totalSeconds = (milliseconds) => Math.floor(milliseconds / 1000);
    const calculateElapsedTime = () => {
        const millisecondsElapsed = currentTime * 1000;
        const dateNow = Date.now();
        const elapsedMilliseconds = Number(dateNow - startTime);
        const totalMilliseconds = Number(millisecondsElapsed + elapsedMilliseconds);
        const timeElapsed = totalSeconds(totalMilliseconds);
        setCurrentTime(timeElapsed);
    };
    const startTimer = () => {
        setStartTime(Date.now());
        setPause(false);
    };
    const pauseTimer = () => {
        setPause(true);
    };
    const resetTimer = () => {
        setPause(true);
        setStartTime(0);
        setCurrentTime((todo.type === 'track')?0:time);
    };
    useEffect(() => {
        resetTimer();
    }, [time]);
    useEffect(() => {
        let timerInterval;
        if (!pause) {
            calculateElapsedTime();
            timerInterval = setInterval(() => {
                calculateElapsedTime()
            }, 1000);
        }
        return () => clearInterval(timerInterval);
    }, [pause/*, startTime*/]);

    useEffect(() => {
        const newTodos = [...todos];
        if (category === 'todo') {
            newTodos[index].activated = !pause;
            newTodos[index].currentTime = currentTime;
            newTodos[index].startTime = startTime;
        } else if (category === 'circuit') {
            if (newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].title === 'Squats') {
                console.log(`${newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].title} activated: ${newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].activated}`);
                console.log(`${newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].title} complete: ${newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].complete}`);
            }
            newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].activated = !pause;
            newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].currentTime = currentTime;
            newTodos[groupIndex].circuits[subgroupIndex].excersizes[index].startTime = startTime;
        }
        localStorage.setItem(localData, JSON.stringify(newTodos));
    }, [pause, currentTime, startTime]);

    useEffect(() => {
        localStorage.setItem('time', time);
        if (category === 'circuit') {
            if (initializeData('activated', null) == index) {
                startTimer();
            }
        }
    }, []);

    const formatTime = (seconds) => {
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
        <div className='flexContainer size20 bold'>
            <div className={`containerBox flex3Column button color-lite ${getTimerButtonClasses()}`} onClick={(pause) ? startTimer : pauseTimer}>
                {!pause ? 'PAUSE' : (isStart()) ? 'START' : (currentTime == 0) ? 'RESTART' : 'RESUME'}
            </div>
            <div className='containerDetail pt-15 flex3Column size30 bg-tinted color-yellow'>
                {formatTime(Number(currentTime))}
            </div>
            <div className={`containerBox flex3Column color-lite button ${getTimerButtonClasses()}`} onClick={resetTimer}>
                RESET
            </div>
        </div>
    );
};

export default TodoStopwatch;