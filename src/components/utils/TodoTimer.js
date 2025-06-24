import React, { useState, useEffect } from 'react';
import Sounds from '../sound/Sounds';

const TodoTimer = ({
    todo,
    index,
    setTodoCurrentTime,
    todos,
    setTodos,
    localData,
    time,
    //setTimesUp,
    toggleCheckbox,
    //recordHeatScores,
    onReset
}) => {
    
    const [pause, setPause] = useState((todo.activated) ? false : true);
    const [startTime, setStartTime] = useState(todo.startTime);
    const [currentTime, setCurrentTime] = useState(todo.currentTime);

    const isStart = () => (currentTime === time) ? true : false;
    const totalSeconds = (milliseconds) => Math.floor(milliseconds / 1000);

    const calculateTimeLeft = () => {
        const millisecondsRemaining = currentTime * 1000;
        const elapsedMilliseconds = Number(Date.now() - startTime);
        const remainingMilliseconds = Number(millisecondsRemaining - elapsedMilliseconds);
        const timeRemaining = totalSeconds(remainingMilliseconds);
        const secondsRemaining = (timeRemaining > 0) ? timeRemaining : 0;
        if (secondsRemaining <= 10 && secondsRemaining > 0) {
            Sounds.boop(0, 1);
        }
        if (timeRemaining <= 0) {
            Sounds.boop(0, secondsRemaining);
            setCurrentTime(secondsRemaining);
            setPause(true);
            toggleCheckbox(index);
        } else {
            setCurrentTime(timeRemaining);
        }
    };

    const calculateElapsedTime = () => {
        const millisecondsElapsed = currentTime * 1000;
        console.log(`calculateElapsedTime => millisecondsElapsed: ${millisecondsElapsed}`)
        const dateNow = Date.now();
        const elapsedMilliseconds = Number(dateNow - startTime);
        console.log(`calculateElapsedTime => elapsedMilliseconds: ${elapsedMilliseconds}`);
        const totalMilliseconds = Number(millisecondsElapsed + elapsedMilliseconds);
        console.log(`calculateElapsedTime => totalMilliseconds: ${totalMilliseconds}`)
        const timeElapsed = totalSeconds(totalMilliseconds);
        console.log(`calculateElapsedTime => timeElapsed: ${timeElapsed}`)
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
        let timerInterval;
        if (!pause) {
            if (todo.type === 'timer') {
                calculateTimeLeft();
            } else {
                calculateElapsedTime()
            }
            timerInterval = setInterval(() => {
                if (todo.type === 'timer') {
                    calculateTimeLeft();
                } else {
                    calculateElapsedTime()
                }
            }, 1000);
        }
        return () => clearInterval(timerInterval);
    }, [pause]);

    useEffect(() => {
        console.log(`TodoTimer => ${todo.description}: `)
        const newTodos = [...todos];
        newTodos[index].activated = !pause;
        newTodos[index].currentTime = currentTime;
        newTodos[index].startTime = startTime;
        localStorage.setItem(localData, JSON.stringify(newTodos));
    }, [pause, currentTime, startTime]);

    useEffect(() => {
        if (todo !== undefined) {
            console.log(`TodoTimer => todo: ${JSON.stringify(todo, null, 2)}`);
        }
        localStorage.setItem('time', time);
        setStartTime(todo.startTime);
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
    const getTimerClasses = () => {
        const timerClasses = (currentTime < 120 && todo.type === 'timer') ? 'blinking-fade' : '';
        return timerClasses;
    }

    return (
        <div className='flexContainer size20 bold'>
            <div className={`containerBox flex3Column button color-lite ${getTimerButtonClasses()}`} onClick={(pause) ? ((todo.type === 'timer') && (currentTime === 0)) ? resetTimer : startTimer : pauseTimer}>
                {!pause ? 'PAUSE' : (isStart()) ? 'START' : (currentTime === 0) ? 'RESTART' : 'RESUME'}
            </div>
            <div className='containerDetail pt-15 flex3Column size30 bg-tinted color-yellow'>
                <span className={getTimerClasses()}>
                    {formatTime(Number(currentTime))}
                </span>
            </div>
            <div className={`containerBox flex3Column color-lite button ${getTimerButtonClasses()}`} onClick={resetTimer}>
                RESET
            </div>
        </div>
    );
};

export default TodoTimer;