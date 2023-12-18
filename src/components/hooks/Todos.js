import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator.js';
import Sounds from '../utils/Sounds.js';

export default function Todos(props) {
    const initTodos = [
        {
            description: 'Eat',
            type: 'checkbox',
            time: 0,
            currentTime: 0,
            activated: false,
            completed: false
        },
        {
            description: 'Surf',
            type: 'track',
            time: 0,
            currentTime: 0,
            activated: false,
            completed: false
        },
        {
            description: 'Sleep 20 minutes',
            type: 'timer',
            time: (20 * 60),
            currentTime: (20 * 60),
            activated: false,
            completed: false
        }
    ]
    const getLocal = () => (localStorage.getItem('todos') === 'null' || localStorage.getItem('todos') === null) ? initTodos : JSON.parse(localStorage.getItem('todos'));
    const [todos, setTodos] = useState(getLocal());
    const [pausedTodos, setPausedTodos] = useState();
    const [edit, setEdit] = useState(false);
    const [timerOn, setTimerOn] = useState(false);
    const [paused, setPaused] = useState(false);
    const storeIt = () => localStorage.setItem('todos', JSON.stringify(todos));
    const todoInput = () => document.getElementById('todo').value;
    const clearInput = () => document.getElementById('todo').value = '';
    const getNewTodo = (todo) => todo.charAt(0).toUpperCase() + todo.slice(1);
    const [clock, setClock] = useState('00:00:00');
    const [timerWorker, setTimerWorker] = useState(null);

    useEffect(() => {
        storeIt();
        const timerActive = todos.some(obj => obj.activated);
        setTimerOn(timerActive);
    }, [todos]);
    
    useEffect(() => {
        if (timerWorker !== null) {
          timerWorker.onmessage = (event) => {
             setClock(event.data);
          }
        }
    }, [timerWorker]);

    useEffect(() => {
        let intervalId;
        if (timerOn) {
            intervalId = setInterval(() => {
                const newTodos = [...todos];
                newTodos.map((todo) => {
                    if (todo.activated) {
                        if (todo.type == 'timer' && todo.currentTime > 0) {
                            todo.currentTime = todo.currentTime - 1;
                            if (todo.currentTime == 0) {
                                Sounds.playSiren();
                                todo.activated = false;
                                todo.completed = true;
                                todo.currentTime = todo.time
                            }
                        } else if (todo.type == 'track') {
                            todo.currentTime = todo.currentTime + 1;
                        }
                    }
                });
                setTodos(newTodos);
                console.log(`tick`)
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [timerOn]);

    const addTodo = () => {
        const newTodo = {
            description: getNewTodo(todoInput()),
            type: 'checkbox',
            time: 0,
            currentTime: 0,
            activated: false,
            completed: false
        }
        console.log(`new todo: ${newTodo.description}`);
        const newTodos = [...todos];
        newTodos.push(newTodo);
        setTodos(newTodos);
        clearInput();
        Sounds.playSound(0, 1);
    };
    const removeTodo = (id) => {
        console.log(`remove todo: ${todos[id].description}`);
        const newTodos = [...todos];
        newTodos.splice(id, 1)
        setTodos(newTodos);
        Sounds.playSound(0, 1);
    }
    const editTodo = (id) => {
        console.log(`edit todo: ${todos[id].description}`);
        const newTodos = [...todos];
        const modifiedTodo = prompt('description: ', newTodos[id].description)
        newTodos[id].description = modifiedTodo;
        setTodos(newTodos);
        setEdit(!edit);
        Sounds.playSound(0, 1);
    }
    const trackTodo = (id) => {
        console.log(`time todo: ${todos[id].description}`);
        const newTodos = [...todos];
        newTodos[id].type = 'track';
        newTodos[id].time = 0;
        newTodos[id].currentTime = 0;
        setTodos(newTodos);
        setEdit(!edit);
        Sounds.playSound(0, 1);
    }
    const timerTodo = (id) => {
        console.log(`edit todo: ${todos[id].description} time:${todos[id].time / 60}`);
        const newTodos = [...todos];
        newTodos[id].type = 'timer';
        newTodos[id].time = todos[id].time / 60;
        const modifiedTodo = prompt('enter time (minutes): ', newTodos[id].time);
        newTodos[id].time = (Number(modifiedTodo * 60));
        newTodos[id].currentTime = (Number(modifiedTodo * 60));
        setTodos(newTodos);
        setEdit(!edit);
        Sounds.playSound(0, 1);
    }
    const toggleTimer = (id) => {
        console.log(`start timer: ${todos[id].description}`);
        const newTodos = [...todos];
        newTodos[id].activated = !newTodos[id].activated;
        if (newTodos[id].activated) {
            newTodos[id].completed = false;
        }
        setTodos(newTodos);
        Sounds.playSound(0, 1);
    }
    ///////////////////






    const startTimer = () => {
        if (typeof (Worker) !== 'undefined') {
            if (timerWorker == null) {
                const worker = new Worker("timerWorker.js");
                setTimerWorker(worker);
            }
        } else {
            // Web workers are not supported by your browser
            setClock("Web Workers not supported...");
        }
    }

    const stopTimer = () => {
        if (timerWorker != null) {
            timerWorker.terminate();
            //timerStart = true;
            setTimerWorker(null);
        }
    }





    //////////////
    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };
    const getClock = (id) => {
        const todoTime = todos[id].currentTime;
        return <div className='containerBox bold color-lite p-30'>
            <span className='size40'>
                {formatTime(todoTime)}
            </span>
        </div>
    }
    function makeMenu() {
        const makeMenu = (menu) => menu.map(item => <div className='button bg-green r-10 m-5 p-5'>{item}</div>);
        const menuData = ['one', 'two', 'thee'];
        return (
            <React.Fragment>{makeMenu(menuData)}</React.Fragment>
        )
    }
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
    };
    const toggleCheckbox = (index) => {
        const newTodos = [...todos];
        newTodos[index].completed = !newTodos[index].completed;
        if (newTodos[index].completed) {
            newTodos[index].activated = false;
        }
        setTodos(newTodos);
        Sounds.playSound(0, 1);
    };
    const togglePause = () => {
        const newTodos = [...todos];
        if (!paused) {
            const newPausedTodos = [...todos];
            localStorage.setItem('pausedTodos', JSON.stringify(newPausedTodos))
            setPausedTodos(JSON.parse(localStorage.getItem('pausedTodos')));
            newTodos.map((todo, index) => {
                todo.activated = false;
            })
        } else {
            newTodos.map((todo, index) => {
                const activated = pausedTodos[index].activated;
                todo.activated = activated;
            })
        }
        setTodos(newTodos);
        setTimerOn(paused);
        setPaused(!paused)
    }
    const reset = () => {
        const newTodos = [...todos];
        newTodos.map((todo) => {
            todo.completed = false;
            todo.activated = false;
            todo.currentTime = todo.time;
        })
        setTodos(newTodos);
        Sounds.playSound(0, 1);
    }
    const editTodos = () => {
        setEdit(!edit);
        Sounds.playSound(0, 1);
    }
    const clear = () => {
        setTodos([]);
        Sounds.playSound(0, 1);
    }
    return (
        <div className='mt--30'>
            <div className='containerBox'>
                <div className='flex2Column p-10 m-10 r-10 bg-dark color-neogreen bold'>
                    {clock}
                </div>
            </div>
            <div className='containerBox'>
                <button className='flex2Column button p-10 m-10 r-10 bg-green color-lite bold' onClick={() => startTimer()} id="button1">Start</button>
                <button className='flex2Column button p-10 m-10 r-10 bg-dkRed color-lite bold' onClick={() => stopTimer()} id="button2">Stop</button>
            </div>
            <div className='color-yellow p-5 r-10'>
                <div className='containerBox'>
                    <label className='flexContainer containerInput'>
                        <input className='inputField p-15 bold size25 r-10' type='text' id='todo' name='todo' placeholder='Enter a todo' onKeyDown={handleKeyDown} />
                        {/*<button className='r-10 greet bold bg-green m-5 p-20 flex2Column10Percent contentCenter' onClick={() => addTodo()}>ADD</button>*/}
                    </label>
                </div>
            </div>
            <div className='p-5 r-10'>
                <div id='list' className='p-5 r-10 bg-tinted'>
                    {todos.map((todo, index) => (
                        <div key={getKey('todo')} className='p-10 m-5 containerBox bold color-lite'>
                            <div className='color-lite size25 r-10'>
                                <div className='width-100-percent p-20 contentLeft bg-tinted r-10 mb-1'>
                                    <input className='regular-checkbox button mr-10' checked={todo.completed} type='checkbox' id='completed' onChange={() => toggleCheckbox(index)} />
                                    <span className='size40'>{todo.description}</span>
                                </div>
                                <div>
                                    {
                                        ((todo.type == 'timer' || todo.type == 'track') && !edit)
                                            ? <div className='flexContainer r-10'>
                                                <button id={`toggleTimer${index}`} name={`toggleTimer${todo.description}`} className={`size40 width-100-percent r-10 p-15 greet bold bg-tinted ${(todo.activated) ? 'bg-dkRed color-red' : 'bg-dkGreen color-neogreen'}`} onClick={() => toggleTimer(index)}>
                                                    {(todo.activated) ? 'STOP' : 'START'}
                                                </button>
                                                <div className='flex2Column'>
                                                    {getClock(index)}
                                                </div>
                                            </div>
                                            : null
                                    }
                                    {
                                        (edit)
                                            ? <div className='flexContainer'>
                                                <button id={`setTimert${index}`} name={`setTimer${todo.description}`} className='r-10 p-15 greet bold bg-tinted m-5 color-lite' onClick={() => timerTodo(index)}>set timer</button>
                                                <button id={`time${index}`} name={`time${todo.description}`} className='r-10 p-15 greet bold bg-tinted m-5 color-lite' onClick={() => trackTodo(index)}>track time</button>
                                                <button id={`edit${index}`} name={`edit${todo.description}`} className='r-10 p-15 greet bold bg-tinted m-5 color-lite' onClick={() => editTodo(index)}>edit</button>
                                                <button id={`remove${index}`} name={`remove${todo.description}`} className='r-10 p-15 greet bold bg-tinted m-5 color-lite' onClick={() => removeTodo(index)}>X</button>
                                            </div>
                                            : null
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                    {/*makeMenu()*/}
                    <div className='button color-lite r-10 bg-lite m-5 bold flex3Column p-20 size25 columnCenterAlign' onClick={() => togglePause()}>
                        {(paused) ? 'UNPAUSE' : 'PAUSE ALL CLOCKS'}
                    </div>
                    <div className='flexContainer'>
                        <div className='button color-neogreen r-10 bg-dkGreen m-5 bold flex3Column p-20 size25 columnCenterAlign' onClick={() => reset()}>
                            RESET
                        </div>
                        <div className='button color-yellow r-10 bg-dkYellow m-5 bold flex3Column p-20 size25 columnCenterAlign' onClick={() => editTodos()}>
                            EDIT
                        </div>
                        <div className='button color-red r-10 bg-dkRed m-5 bold flex3Column p-20 size25 columnCenterAlign' onClick={() => clear()}>
                            CLEAR
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}