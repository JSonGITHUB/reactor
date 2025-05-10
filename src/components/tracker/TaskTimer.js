import React, { useState, useEffect } from 'react';
import Sounds from '../sound/Sounds';
import initTodos from '../tracker/initTodos';

const TaskTimer = ({
    session,
    index,
    setTodoCurrentTime,
    todos,
    setTodos,
    time,
    //setTimesUp,
    toggleCheckbox,
    //recordHeatScores,
    onReset
}) => {

    const getLocalTodos = () => {
        const recordedTodos = initializeData('todos', initTodos);
        const newTodos = [...recordedTodos];
        return newTodos;
    }
    const initTaskData = [
        {
            'description':'Kitchen',
            'createdDate':'3/10/2024, 3:40:01 PM',
            'startTime':1710110401697,
            'tasks':[
                {
                    'startTime':1710110567760,
                    'endTime':'',
                    'description':'Get Saucy',
                    'sessions':[
                        {
                            'description':'Description',
                            'startDate':'3/10/2024, 3:42:47 PM',
                            'startTime':1710110567760,
                            'endDate':'3/10/2024, 4:00:51 PM',
                            'endTime':1710111651117,
                            'totalTime':'00:18:03',
                            'runningTime':1083357,
                            'runningTimeDisplay':'00:18:03'
                        }
                    ],
                    'isRunning':false,
                    'runningTime':0,
                    'runningTimeDisplay':'00:00:00',
                    'totalTime':null
                }
            ],
            'totalTime':null,
            'isCollapsed':false
        }
    ];
        
    const getRecordedCurrentTime = () => {
        const newTodos = getLocalTodos();
        const getTime = () => {
            if (session.type === 'timer') {
                return time;
            }
            return 0;
        }
        const recordedCurrentTime = (newTodos[index].currentTime) ? newTodos[index].currentTime : getTime();
        return Number(recordedCurrentTime);
    }
    const [pause, setPause] = useState((session.activated) ? false : true);
    const [startTime, setStartTime] = useState(session.startTime);
    const [currentTime, setCurrentTime] = useState(getRecordedCurrentTime());
    const isStart = () => (currentTime == time) ? true : false;
    const totalSeconds = (milliseconds) => Math.floor(milliseconds / 1000);
    const calculateTimeLeft = () => {
        const millisecondsRemaining = currentTime * 1000;
        const elapsedMilliseconds = Number(Date.now() - startTime);
        const remainingMilliseconds = Number(millisecondsRemaining - elapsedMilliseconds);
        const timeRemaining = totalSeconds(remainingMilliseconds);
        const secondsRemaining = (timeRemaining > -1) ? timeRemaining : 0;
        if (secondsRemaining <= 10 && secondsRemaining > 0) {
            Sounds.boop(0, 1);
        }
        if (timeRemaining <= 0) {
            Sounds.boop(0, secondsRemaining);
            //setTimesUp(true);
            //toggleCheckbox(index);
            //recordHeatScores();
            setPause(true);
            setCurrentTime(secondsRemaining);
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
        console.log(`currentTime: ${getRecordedCurrentTime()}`)
        setPause(false);
    };

    const pauseTimer = () => {
        setPause(true);
        //localStorage.setItem('currentTime', currentTime)
    };

    const resetTimer = () => {
        setPause(true);
        setStartTime(0);
        setCurrentTime((session.type === 'track')?0:time);
    };

    useEffect(() => {
        let timerInterval;

        if (!pause) {
            if (session.type === 'timer') {
                calculateTimeLeft();
            } else {
                calculateElapsedTime()
            }
            
            timerInterval = setInterval(() => {
                if (session.type === 'timer') {
                    calculateTimeLeft();
                } else {
                    calculateElapsedTime()
                }
            }, 1000);
        }

        return () => clearInterval(timerInterval);
    }, [pause/*, startTime*/]);

    useEffect(() => {
        const newTodos = getLocalTodos();
        newTodos[index].activated = !pause;
        newTodos[index].currentTime = currentTime;
        newTodos[index].startTime = startTime;
        localStorage.setItem('todos', JSON.stringify(newTodos));
    }, [pause, currentTime, startTime]);
    
    /*
      useEffect(() => {
        window.addEventListener('beforeunload', calculateTimeLeft);
        return () => {
          window.removeEventListener('beforeunload', calculateTimeLeft);
        };
      }, []);
    
    useEffect(() => {
        const localTime = Number(localStorage.getItem('time'));
        if ((isStart() || (time !== localTime)) && session.type === 'timer') {
            console.log(`time: ${time} localTime: ${localTime}`)
            setCurrentTime(time);
            resetTimer()
        }
        //console.log(`TaskTimer: currentTime: ${currentTime} time: ${time}`)
        //setPause(true);
        //console.log(`ContdownTimer => time: ${time}`);
        localStorage.setItem('time', time);
    }, [time]);
    */

    useEffect(() => {
        localStorage.setItem('time', time);
        let timerTime = getRecordedCurrentTime();
        if (timerTime < 0) {
            timerTime = 0;
        }
        const recordedTodos = getLocalTodos();
        setStartTime(recordedTodos[index].startTime);
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
        const timerClasses = (currentTime < 120 && session.type === 'timer') ? 'blinking-fade' : '';
        return timerClasses;
    }

    return (
        <div className='flexContainer size20 bold'>
            <div 
                title={!pause ? 'PAUSE' : (isStart()) ? 'START' : (currentTime == 0) ? 'RESTART' : 'RESUME'}
                className={`containerBox flex3Column button color-lite ${getTimerButtonClasses()}`} 
                onClick={(pause) ? ((session.type === 'timer') && (currentTime == 0)) ? resetTimer : startTimer : pauseTimer}
            >
                {!pause ? 'PAUSE' : (isStart()) ? 'START' : (currentTime == 0) ? 'RESTART' : 'RESUME'}
            </div>
            <div className='containerDetail pt-15 flex3Column size30 bg-tinted color-yellow'>
                <span className={getTimerClasses()}>
                    {formatTime(Number(currentTime))}
                </span>
            </div>
            <div
                title='reset' 
                className={`containerBox flex3Column color-lite button ${getTimerButtonClasses()}`} 
                onClick={resetTimer}
            >
                RESET
            </div>
        </div>
    );
};

export default TaskTimer;