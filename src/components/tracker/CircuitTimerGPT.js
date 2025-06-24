import React, { useEffect, useState } from 'react';

const CircuitTimer = ({ 

    index,
    duration,
    onComplete, 
    type, 
    triggerNextTimer

}) => {
  const [startTime, setStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [timerId, setTimerId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const startTimer = () => {
    if (!startTime) {
      setStartTime(Date.now());
      localStorage.setItem('timerStartTime', Date.now().toString());
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    clearInterval(timerId);
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(timerId);
    setStartTime(null);
    setTimeRemaining(duration);
    setIsRunning(false);
    localStorage.removeItem('timerStartTime');
    localStorage.removeItem('timerTimeRemaining');
  };

  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
      setTimerId(timer);
    } else {
      clearInterval(timerId);
    }

    return () => clearInterval(timerId);
  //}, [isRunning, timerId]);
}, [isRunning]);

  useEffect(() => {
    if (timeRemaining === 0) {
      onComplete(index);
      if (triggerNextTimer) {
        triggerNextTimer(index);
      }
      resetTimer();
    }
    localStorage.setItem('timerTimeRemaining', timeRemaining.toString());
  }, [timeRemaining, onComplete, triggerNextTimer]);

  useEffect(() => {
    // Check if the timer was running before unmounting
    const storedStartTime = initializeData('timerStartTime', null);
    const storedTimeRemaining = initializeData('timerTimeRemaining', null);
    if (storedStartTime && storedTimeRemaining) {
      const elapsedTime = Date.now() - parseInt(storedStartTime, 10);
      const remainingTime = parseInt(storedTimeRemaining, 10);
      if (elapsedTime < remainingTime * 1000 || type === 'track') {
        // Resume timer or start a new one if it was track timer
        setStartTime(Date.now() - elapsedTime);
        setTimeRemaining(Math.ceil((remainingTime * 1000 - elapsedTime) / 1000));
        setIsRunning(true);
      }
    }
  }, [type]);

  const formatTime = (seconds) => {
    const hoursDisplay = Math.floor(seconds / 3600);
    const minutesDisplay = Math.floor((seconds % 3600) / 60);
    const secondsDisplay = seconds % 60;

    return `${hoursDisplay < 10 ? '0' : ''}${hoursDisplay}:${minutesDisplay < 10 ? '0' : ''}${minutesDisplay}:${secondsDisplay < 10 ? '0' : ''}${secondsDisplay}`;
};

  return (
    <div>
      <div>
        {type === 'timer'
          ? `Countdown CircuitTimer: ${formatTime(timeRemaining)}`
          : `Duration CircuitTimer: ${formatTime(timeRemaining)}`}
      </div>
      <button 
        title='start'
        onClick={startTimer} 
        disabled={isRunning}
      >
        Start
      </button>
      <button 
        title='pause'
        onClick={pauseTimer} 
        disabled={!isRunning}
      >
        Pause
      </button>
      <button 
        title='reset'
        onClick={resetTimer}
      >
        Reset
        </button>
    </div>
  );
};

export default CircuitTimer;
