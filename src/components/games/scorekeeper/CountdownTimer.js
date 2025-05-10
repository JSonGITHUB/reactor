import React, { useState, useEffect } from 'react';
import Sounds from '../../sound/Sounds';
import initializeData from '../../utils/InitializeData';

const CountdownTimer = ({
  time,
  setTimesUp,
  recordHeatScores
}) => {

  const [pause, setPause] = useState(initializeData('timerPause', false));
  const [startTime, setStartTime] = useState(initializeData('timerStartTime', 0));
  const [timeLeft, setTimeLeft] = useState();

  const isStart = () => (timeLeft === time) ? true : false;
  const remainingSeconds = (milliseconds) => Math.floor(milliseconds / 1000);

  const calculateTimeLeft = () => {
    const millisecondsRemaining = timeLeft * 1000;
    const elapsedMilliseconds =  Number(Date.now() - startTime);
    const remainingMilliseconds = Number(millisecondsRemaining - elapsedMilliseconds);
    const timeRemaining = remainingSeconds(remainingMilliseconds);
    
    const secondsRemaining = (timeRemaining > -1) ? timeRemaining : 0;

    if (secondsRemaining <= 10 && secondsRemaining > 0 ) {
      Sounds.boop(0, secondsRemaining);
    }
    if (timeRemaining <= 0) {
        Sounds.boop(0, secondsRemaining);
        setTimesUp(true);
        recordHeatScores();
        setPause(true);
        setTimeLeft(secondsRemaining);
    }
    setTimeLeft(timeRemaining);
  };

  const startTimer = () => {
    setStartTime(Date.now());
    console.log(`timeLeft: ${Number(initializeData('timerLeft', 0))}`)
    setPause(false);
  };

  const pauseTimer = () => {
    setPause(true);
    //localStorage.setItem('timeLeft', timeLeft)
  };

  const resetTimer = () => {
    setPause(true);
    setStartTime(0);
    setTimeLeft(time);
    setTimesUp(false)
  };
  
  useEffect(() => {
    if (timeLeft > 0) {
      localStorage.setItem('timeLeft', timeLeft);
    }
  }, [timeLeft]);

  useEffect(() => {
    let timerInterval;

    if (!pause) {
      calculateTimeLeft();
      timerInterval = setInterval(() => {
        calculateTimeLeft();
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [pause, startTime]);

  useEffect(() => {
    localStorage.setItem('timerPause', pause);
  }, [pause]);
  useEffect(() => {
    localStorage.setItem('timerStartTime', startTime);
  }, [startTime]);
  useEffect(() => {
    const localTime = Number(initializeData('time', 0));
    if (isStart() || (time !== localTime)) {
      console.log(`time: ${time} localTime: ${localTime}`)
      setTimeLeft(time);
      resetTimer()
    }
    localStorage.setItem('time', time);
  }, [time]);

  useEffect(() => {
    localStorage.setItem('time', time);
    let timerTimeLeft = Number(initializeData('timeLeft', time));
    if (timerTimeLeft < 0) {
      timerTimeLeft = 0;
    }

    const timerStart = () => {
      const timerStartTime = initializeData('timerStartTime', false);
      if (timerStartTime) {
        setTimeLeft(timerTimeLeft);
        return timerStartTime
      }
      return null
    }
    setStartTime(timerStart());
    if (timeLeft === time) {
      //setPause(true);
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
  const getTimerClasses = () => {
    const timerClasses = (timeLeft < 120) ? 'blinking-fade' : '';
    return timerClasses;
  }

  return (
    <div className='containerBox flexContainer size20 bold'>
      <div 
        title={!pause ? 'PAUSE' : (isStart()) ? 'START' : (timeLeft === 0) ? 'RESTART' : 'RESUME'}
        className={`flex3Column r-10 pt-10 pb-10 button color-lite ${getTimerButtonClasses()}`} 
        onClick={(pause) ? (timeLeft === 0) ? resetTimer : startTimer : pauseTimer}
      >
        {!pause ? 'PAUSE' : (isStart()) ? 'START' : (timeLeft === 0)?'RESTART':'RESUME'}
      </div>
      <div className='ml-5 mr-5 flex3Column size40 r-10 bg-tinted pt-10 pb-10 color-yellow'>
        <span className={getTimerClasses()}>
          {formatTime(Number(timeLeft))}
        </span>
      </div>
      <div 
        title='reset'
        className={`flex3Column r-10 pt-10 pb-10 color-lite button ${getTimerButtonClasses()}`} 
        onClick={resetTimer}
      >
        RESET
      </div>
    </div>
  );
};

export default CountdownTimer;