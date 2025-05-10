import React, { useState, useEffect } from 'react';
import Sounds from '../sound/Sounds.js';
import validate from '../utils/validate.js';
import initializeData from '../utils/InitializeData';

const TimerComponent = ({todo, index, setTodoCurrentTime, setTodos, todos, toggleCheckbox, onReset}) => {

    const templateData = [
        { 
            description: "Eat", 
            type: "checkbox",
            time: 0, 
            currentTime: 0, 
            activated: false, 
            completed: false 
        }, 
        { 
            description: "Excersize", 
            type: "timer", 
            time: 7200, 
            currentTime: 7200, 
            activated: false, 
            completed: false, 
            startTime: 1713812555544, 
            elapsedTime: 0 
        }, 
        { 
            description: "Sleep 20 minutes", 
            type: "timer", 
            time: 1200, 
            currentTime: 1200, 
            activated: false, 
            completed: false, 
            startTime: 1718995132263, 
            elapsedTime: 15 
        }
    ]
    const [clock, setClock] = useState('00:00:00');
    const [timerWorker, setTimerWorker] = useState(null);
    //const [startTime, setStartTime] = useState(null);
    const [localTodos, setLocalTodos] = useState(initializeData('todos', templateData));
    const [localTodo, setLocalTodo] = useState(todo);
    const [activated, setActivated] = useState(todo.activated)

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Number(timeInSeconds % 60).toFixed(0);
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    const getActivated = () => {
        console.log(`getActivated => ${localTodo.activated}`)
        return localTodo.activated
    }

    useEffect(() => {
        const newTime = localTodo.elapsedTime;
        console.log(`newTime: ${newTime}`)
        //alert(`newTime: ${newTime}`)
        const newTodos = [...localTodos];
        newTodos[index] = localTodo;
        newTodos[index].activated = false;
        //setTodos(newTodos);
        //setTodoCurrentTime(newTime);
        localStorage.setItem('todos', JSON.stringify(newTodos));
        setLocalTodos(newTodos);
        setClock(formatTime(newTime));
    }, [localTodo]);
    
    useEffect(() => {
        if (localTodo.activated) {
            startTimer();
        } else {
            stopTimer();
        }
    }, [activated]);

    useEffect(() => {
        if (timerWorker !== null) {
            timerWorker.onmessage = (event) => {
               // setClock(formatTime(event.data));
               //console.log(`event.data: ${event.data}`)
                
                const currentElapsedTime = () => {
                    let time = 0;
                    let elapsedTime = (localTodo.elapsedTime) ? localTodo.elapsedTime : todo.currentTime;
                    
                    //console.log(`localTodo.elapsedTime: ${localTodo.elapsedTime}`)
                    //console.log(`todo.elapsedTime: ${todo.elapsedTime}`)
                    
                    if (localTodo.type === 'track') {
                        time = Number(elapsedTime)+1;
                    } else {
                        time = Number(elapsedTime)-1;
                        if (time < 0) {
                            time = 0;
                            toggleCheckbox(index);
                        }
                    }
                    return time;
                }

                const newTime = currentElapsedTime();
                console.log(`newTime: ${newTime}`)
                
                const newLocalTodo = localTodo;
                newLocalTodo.elapsedTime = newTime;
                
                const newTodos = [...localTodos];
                newTodos[index] = newLocalTodo;
                localStorage.setItem('todos', JSON.stringify(newTodos));
                
                setClock(formatTime(newTime));
                if (newLocalTodo.type === 'timer' && newTime === 0 && newLocalTodo.activated) {
                    toggleCheckbox(index);
                    Sounds.siren();
                    //toggleTimer();
                    //alert(`Times up index: ${index} ${todo.description} `);
                    newLocalTodo.completed = true;
                    newLocalTodo.activated = false;
                    //toggleCheckbox(index);
                }
                if (!newLocalTodo.activated || !localTodo.activated || !activated || !todo.activated) {
                    if (newTime < 0) {
                        toggleCheckbox(index);
                        setClock(formatTime(0));
                    }
                    timerWorker.terminate();
                }
                setActivated(newLocalTodo.activated)
                console.log(`todo - ${index}: ${todo.description} elapsed time: ${newTime}`);
                console.log(`todo - ${index}: ${todo.description} completed: ${newLocalTodo.completed}`);
                console.log(`todo - ${index}: ${todo.description} activated: ${newLocalTodo.activated}`);
                setLocalTodo(newLocalTodo);
            }
        }
    }, [timerWorker]);

    useEffect(() => {
        //.log(`TimerComponent => todo: ${JSON.stringify(todo,null,2)}`)
        //if (todo.currentTime && todo.currentTime !== undefined) {
        if (validate(todo.currentTime) !== null) {
            const newLocalTodos = [...todos];
            newLocalTodos.map((todo, index) => todo.active = false);
            localStorage.setItem('todos', JSON.stringify(newLocalTodos));
            //setTodos(newLocalTodos);
            const currentTime = todo.currentTime;
            console.log(`todo.currentTime: ${currentTime}`)
            setLocalTodo(todo);
        }
    }, []);
    
    const startTimer = () => {
        //if (typeof (Worker) !== 'undefined') {
        if (validate(Worker) !== null) {
            if (timerWorker === null) {
                const worker = new Worker("timerWorker.js");
                setTimerWorker(worker);
                const elapsedTime = localTodo.elapsedTime;
                //setStartTime(Date.now() - elapsedTime);
                console.log(`startTimer => elapsedTime: ${elapsedTime}`);
            }
        } else {
            // Web workers are not supported by your browser
            setClock("Web Workers not supported...");
        }
        return () => {
            timerWorker.terminate();
        };
    }
    const stopTimer = () => {
        if (timerWorker != null) {
            timerWorker.terminate();
            //setStartTime(Date.now() - elapsedTime);
            const elapsedTime = localTodo.elapsedTime;
            //setTodoCurrentTime(index, elapsedTime)
            console.log(`stopTimer => elapsedTime: ${elapsedTime}`);
            setTimerWorker(null);
        }
    }
    /*
    const getClock = (id) => {
        if (todo.currentTime !== undefined) {
            const todoTime = todo.currentTime;
            return <div className='containerBox bold p-30'>
                <span className='size40'>
                    {formatTime(todoTime)}
                </span>
            </div>
        } else {
            return 'XXX'
        }

    }
    */
    const toggleTimer = (label) => {
        
        const elapsedTime = localTodo.elapsedTime;
        const activatedOnToggle = localTodo.activated;
        const completedOnToggle = localTodo.completed;
        Sounds.boop(0, 1);
        const newLocalTodo = localTodo;
        newLocalTodo.activated = (localTodo.completed)?false:!activatedOnToggle;
        //newLocalTodo.elapsedTime = (label === 'RESET') ? localTodo.time : newLocalTodo.elapsedTime;
        if (label === 'RESET') {
            onReset(index);
            //alert(`newTime: ${newLocalTodo.time}`)
            setClock(newLocalTodo.time)
        }
        if (label === 'START' && elapsedTime === 0) {
            newLocalTodo.elapsedTime = localTodo.time;
        }
        if (label === 'START') {
            newLocalTodo.activated = true;
            setActivated(true);
            startTimer();
        }
        //newLocalTodo.elapsedTime = 100;
        const newTodos = [...localTodos];
        newTodos[index] = newLocalTodo;
        newTodos[index].activated = newLocalTodo.activated;
        localStorage.setItem('todos', JSON.stringify(newTodos));
        setLocalTodo(newLocalTodo);
        setActivated(newLocalTodo.activated);
        //setClock(elapsedTime);
        console.log(`toggleTimer => 
                        type: ${newLocalTodo.type} 
                        timer: ${newLocalTodo.description} 
                        time: ${newLocalTodo.time}
                        localTodo.activated: ${newLocalTodo.activated} 
                        newLocalTodo.elapsedTime: ${newLocalTodo.elapsedTime}
                        activated: ${activated} 
                        localTodo.completed: ${newLocalTodo.completed} 
                        clock: ${clock}
                        elapsedTime: ${elapsedTime} - ${(newLocalTodo.activated) ? 'stop' : 'start'}}`
                    );
    }
    const buttonLabel = () => (getActivated()) ? 'STOP' : (localTodo.completed) ? 'RESET' : 'START';

    return <div>
                <div className='containerBox flexContainer bg-veryLite centeredContent'>
                    <div className='flex2Column m-10 size30'>
                            {clock}
                        {/*
                        <div className='flex3Column containerBox'>
                            <div className='containerBox flexContainer'>
                                todo.time: {todo.time}
                            </div>
                            <div className='containerBox flexContainer'>
                                todo.currentTime: {todo.currentTime}
                            </div>
                            <div className='containerBox flexContainer'>
                                todo.activated: {todo.activated}
                            </div>
                            <div className='containerBox flexContainer'>
                                todo.completed: {todo.completed}
                            </div>
                        </div>
                        <div className='flex3Column containerBox'>
                            <div className='containerBox flexContainer'>
                                localTodo.time: {localTodo.time}
                            </div>
                            <div className='containerBox flexContainer'>
                                localTodo.currentTime: {localTodo.currentTime}
                            </div>
                            <div className='containerBox flexContainer'>
                                localTodo.activated: {localTodo.activated}
                            </div>
                            <div className='containerBox flexContainer'>
                                localTodo.completed: {localTodo.completed}
                            </div>
                        </div>
                        */}
                    </div>
                    <div className='flex2Column'>
                        <div 
                            title={(buttonLabel())}
                            id={`toggleTimer${todo.description}`} 
                            name={`toggleTimer${todo.description}`} 
                            className={`width-100-percent r-10 p-15 greet bold button ${(localTodo.activated) ? 'bg-dkRed color-red' : 'bg-dkGreen color-neogreen'}`} 
                            onClick={() => toggleTimer(buttonLabel())
                        }>
                            {(buttonLabel())}
                        </div>
                    </div>
                </div>
            </div>
};

export default TimerComponent;