import React, { useState, useEffect } from 'react';
import Sounds from '../sound/Sounds';

const StopwatchTimer = ({

  todo,
  index,
  toggleCheckbox,
  onReset

}) => {

  const [localTodos, setLocalTodos] = useState(initializeData('todos', null));
  const [activated, setActivated] = useState();
  const [localTodo, setLocalTodo] = useState(todo);
  const [pause, setPause] = useState((initializeData('stopwatchPause', 'false') === 'true') ? true : false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const isStart = () => (elapsedTime === 0) ? true : false;

  const startTimer = () => {
    setPause(false);
  };

  const pauseTimer = () => {
    setPause(true);
  };

  const resetTimer = () => {
    setPause(true);
    setElapsedTime(0);
    onReset(index);
  };

  useEffect(() => {
    const newLocalTodo = localTodo;
    newLocalTodo.elapsedTime = elapsedTime;
    alert(`elapsedTime: ${elapsedTime}`)
    const newTodos = [...localTodos];
    newTodos[index] = newLocalTodo;
    localStorage.setItem('todos', JSON.stringify(newTodos));
    if (newLocalTodo.type === 'timer' && elapsedTime === 0 && newLocalTodo.activated) {
      toggleCheckbox(index);
      Sounds.siren();
      newLocalTodo.completed = true;
      newLocalTodo.activated = false;
    }
    if (!newLocalTodo.activated || !localTodo.activated || !activated || !todo.activated) {
      if (elapsedTime < 0) {
        toggleCheckbox(index);
      }
    }
    setActivated(newLocalTodo.activated)
    console.log(`todo - ${index}: ${todo.description} elapsed time: ${elapsedTime}`);
    console.log(`todo - ${index}: ${todo.description} completed: ${newLocalTodo.completed}`);
    console.log(`todo - ${index}: ${todo.description} activated: ${newLocalTodo.activated}`);
    setLocalTodo(newLocalTodo);
  }, [elapsedTime]);
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
  const newLocalTodo = localTodo;
  const newTodos = [...localTodos];
  newTodos[index] = newLocalTodo;
  newTodos[index].activated = newLocalTodo.activated;
  localStorage.setItem('todos', JSON.stringify(newTodos));
  return (
    <div className='containerBox flexContainer size20 bold'>
      <div className={`flex3Column r-10 pt-10 pb-10 button color-lite ${getTimerButtonClasses()}`} onClick={(pause) ? (elapsedTime === 0) ? resetTimer : startTimer : pauseTimer}>
        {!pause ? 'PAUSE' : (isStart()) ? 'START' : (elapsedTime === 0) ? 'RESTART' : 'RESUME'}
      </div>
      <div className='ml-5 mr-5 flex3Column size40 r-10 bg-tinted pt-10 pb-10 color-yellow'>
        <span>
          {formatTime(Number(elapsedTime))}
        </span>
      </div>
      <div className={`flex3Column r-10 pt-10 pb-10 color-lite button ${getTimerButtonClasses()}`} onClick={resetTimer}>
        RESET
      </div>
    </div>
  );
};

export default StopwatchTimer;