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
            timerInterval = setInterval(() => {
                if (todo.type === 'timer') {
                    setCurrentTime((previousTime) => {
                        const nextTime = Math.max(0, Number(previousTime) - 1);
                        if (nextTime <= 10 && nextTime > 0) {
                            Sounds.boop(0, 1);
                        }
                        if (nextTime === 0) {
                            setPause(true);
                            toggleCheckbox(index);
                        }
                        return nextTime;
                    });
                } else {
                    setCurrentTime((previousTime) => Number(previousTime) + 1);
                }
            }, 1000);
        }
        return () => clearInterval(timerInterval);
    }, [pause, todo.type, index, toggleCheckbox]);

    useEffect(() => {
        console.log(`TodoTimer => ${todo.description}: `)
        const newTodos = [...todos];
        newTodos[index].activated = !pause;
        newTodos[index].currentTime = currentTime;
        newTodos[index].startTime = startTime;
        localStorage.setItem(localData, JSON.stringify(newTodos));
    }, [pause, currentTime, startTime, index, localData, todo.description, todos]);

    useEffect(() => {
        if (todo !== undefined) {
            console.log(`TodoTimer => todo: ${JSON.stringify(todo, null, 2)}`);
        }
        localStorage.setItem('time', time);
        setStartTime(todo.startTime);
    }, [time, todo]);

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
            <div className='containerDetail pt-15 flex3Column size25 bg-tinted color-yellow'>
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