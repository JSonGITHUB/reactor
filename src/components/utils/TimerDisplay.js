import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import validate from './validate';

const TimerDisplay = ({
    totalTime
}) => {
    const [seconds, setSeconds] = useState(totalTime);
    const [isActive, setIsActive] = useState(false);
    const [timerWorker, setTimerWorker] = useState(null);
    
    const toggleTimer = () => {
       if (isActive) {
            setIsActive(false)
            stopTimer();
        } else {
            setIsActive(true);
            startTimer();
        }
    }
    
    useEffect(() => {
        if (timerWorker !== null) {
            timerWorker.onmessage = (event) => {
                const currentElapsedTime = () => {
                    const elapsedTime = Number(seconds) + Number(event.data);
                    return elapsedTime;
                }
                const newTime = currentElapsedTime();
                console.log(`message: ${event.data} newTime/seconds: ${newTime}`)
                setSeconds(newTime);
            }
        }
    }, [timerWorker]);

    useEffect(() => {
        if (isActive) {
        } else {
            console.log(`seconds: ${seconds}`)
        }
        
    }, [isActive]);
    
    useEffect(() => {
        console.log(`totalTime: ${totalTime}`);
        const timeArray = String(totalTime ?? '00:00').split(':');
        const minutes = Number(timeArray[0])*60;
        const seconds = Number(timeArray[1]);
        setSeconds(minutes+seconds)
    }, []);

    const startTimer = () => {
        if (validate(Worker) !== null) {
            if (timerWorker === null) {
                const worker = new Worker("timerWorker.js");
                setTimerWorker(worker);
                const elapsedTime = seconds;
                console.log(`startTimer => elapsedTime: ${elapsedTime}`);
            }
        } else {
            // Web workers are not supported by your browser
        }
        return () => {
            timerWorker.terminate();
        };
    }
    const stopTimer = () => {
        if (timerWorker != null) {
            timerWorker.terminate();
            const elapsedTime = seconds;
            console.log(`stopTimer => elapsedTime: ${elapsedTime}`);
            setTimerWorker(null);
        }
    }
    const getTimerClasses = () => {
        const timerClasses = (seconds < 0) ? 'blinking-fade' : '';
        return timerClasses;
    }
    const formatTime = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        const formatDigit = (num) => (num < 10 ? `0${num}` : num);
        return `${formatDigit(hours)}:${formatDigit(minutes)}:${formatDigit(seconds)}`;
    };
    const getTimerButtonClasses = () => {
        const timerButtonClasses = isActive ? 'bg-lite' : 'bg-tinted';
        return timerButtonClasses;
    }
    const restartTimer = () => {
        setIsActive(false);
        stopTimer();
        setSeconds(0);
    }
    return (
        <div>
            <div className='containerBox flexContainer size20 bold'>
                <div className={`flex3Column r-10 pt-10 pb-10 button color-lite ${getTimerButtonClasses()}`} onClick={() => toggleTimer()}>
                    {(isActive) ? `${icons.stop}` : `${icons.track}`}
                </div>
                <div className='ml-5 mr-5 flex3Column size25 r-10 bg-tinted pt-10 pb-10 color-lite'>
                    <div className={getTimerClasses()}>
                        {formatTime(seconds)}
                    </div>
                </div>
                <div className={`flex3Column r-10 pt-10 pb-10 color-lite button ${getTimerButtonClasses()}`} onClick={() => restartTimer()}>
                    {icons.restart}
                </div>
            </div>
        </div>
    );
};

export default TimerDisplay;
