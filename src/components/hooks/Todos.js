import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator';
import Sounds from '../sound/Sounds';
import icons from '../site/icons';
import TodoTimer from '../utils/TodoTimer';
import initTodos from '../tracker/initTodos';
import initializeData from '../utils/InitializeData';

export default function Todos(props) {

    const getLocal = () => initializeData('todos', initTodos);
    const [todos, setTodos] = useState(getLocal());
    const [pausedTodos, setPausedTodos] = useState();
    const [edit, setEdit] = useState(false);
    const [add, setAdd] = useState(false);
    const [timerOn, setTimerOn] = useState(false);
    const [paused, setPaused] = useState(false);
    const storeIt = () => localStorage.setItem('todos', JSON.stringify(todos));
    const todoInput = () => document.getElementById('todo').value;
    const clearInput = () => document.getElementById('todo').value = '';
    const getNewTodo = (todo) => todo.charAt(0).toUpperCase() + todo.slice(1);

    useEffect(() => {
        storeIt();
        console.log('TODOS CHANGED!!!!!!!!!!!!!!!!!!!!')
        //const timerActive = todos.some(obj => obj.activated);
        //setTimerOn(timerActive);
    }, [todos]);

    useEffect(() => {
        let intervalId;
        if (timerOn) {
            intervalId = setInterval(() => {
                const newTodos = [...todos];
                newTodos.map((todo) => {
                    if (todo.activated) {
                        if (todo.type === 'timer' && todo.currentTime > 0) {
                            if (todo.currentTime === 0) {
                                Sounds.siren();
                            }
                            return {
                                ...todo,
                                activated: (todo.currentTime === 0) ? false : todo.activated,
                                completed: (todo.completed === 0) ? true : todo.completed,
                                currentTime: (todo.currentTime === 0) ? todo.time : todo.currentTime - 1,
                            }
                        } else if (todo.type === 'track') {
                            return {
                                ...todo,
                                currentTime: todo.currentTime + 1
                            }
                        }
                    }
                    return {
                        ...todo
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
        Sounds.boop(0, 1);
        setAdd(true);
    };
    const removeTodo = (id) => {
        console.log(`remove todo: ${todos[id].description}`);
        const newTodos = [...todos];
        newTodos.splice(id, 1)
        setTodos(newTodos);
        Sounds.boop(0, 1);
    }
    const editTodo = (id) => {
        console.log(`edit todo: ${todos[id].description}`);
        const newTodos = [...todos];
        const modifiedTodo = prompt('description: ', newTodos[id].description)
        newTodos[id].description = modifiedTodo;
        setTodos(newTodos);
        setEdit(false);
        setAdd(false);
        Sounds.boop(0, 1);
    }
    const trackTodo = (id) => {
        console.log(`time todo: ${todos[id].description}`);
        const newTodos = [...todos];
        newTodos[id].type = 'track';
        newTodos[id].time = 0;
        newTodos[id].currentTime = 0;
        setTodos(newTodos);
        setEdit(false);
        setAdd(false);
        Sounds.boop(0, 1);
    }
    const setTodoCurrentTime = (id, time) => {
        console.log(`setTodoCurrentTime: ${todos[id].description} time: ${time}`);
        const newTodos = [...todos];
        newTodos[id].currentTime = time;
        setTodos(newTodos);
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
        setEdit(false);
        setAdd(false);
        Sounds.boop(0, 1);
    }
    const checkboxTodo = (id) => {
        console.log(`checkbox todo: ${todos[id].description}`);
        const newTodos = [...todos];
        newTodos[id].type = 'checkbox';
        newTodos[id].time = 0;
        newTodos[id].currentTime = 0;
        setTodos(newTodos);
        setEdit(false);
        setAdd(false);
        Sounds.boop(0, 1);
    }
    /*
    const makeMenu = () => {
        const makeMenu = (menu) => menu.map(item => <div className='button bg-green r-10 m-5 p-5'>{item}</div>);
        const menuData = ['one', 'two', 'thee'];
        return (
            <React.Fragment>{makeMenu(menuData)}</React.Fragment>
        )
    }
    */
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
    };
    const toggleCheckbox = (index) => {
        console.log(`toggleCheckbox: index: ${index}`)
        console.log(`toggleCheckbox: todos[${index}]: ${JSON.stringify(todos[index])}`)
        const newTodos = [...todos];
        newTodos[index].completed = !newTodos[index].completed;
        if (newTodos[index].completed) {
            newTodos[index].activated = false;
        } else {
            newTodos[index].currentTime = newTodos[index].time
            newTodos[index].elapsedTime = newTodos[index].time
        }
        setTodos(newTodos);
        Sounds.boop(0, 1);
    };
    const togglePause = () => {
        const newTodos = [...todos];
        let updatedTodos = [];
        if (!paused) {
            const newPausedTodos = [...todos];
            localStorage.setItem('pausedTodos', JSON.stringify(newPausedTodos))
            setPausedTodos(initializeData('pausedTodos', null));
            /*
            newTodos.map((todo, index) => {
                todo.activated = false;
            })
            */
            updatedTodos = newTodos.map(todo => ({
                ...todo,
                activated: false,
            }));

        } else {
            /*
            newTodos.map((todo, index) => {
                const activated = pausedTodos[index].activated;
                todo.activated = activated;
            })
            */
            updatedTodos = newTodos.map((todo, index) => ({
                ...todo,
                activated: pausedTodos[index].activated,
            }));
        }
        setTodos(updatedTodos);
        setTimerOn(paused);
        setPaused(!paused)
    }
    const resetTodos = () => {
        const newTodos = [...todos];
        
        let index = 0;
        newTodos.forEach((todo) => {
            if (todo.type === 'timer') {
                newTodos[index].currentTime = newTodos[index].time;
                newTodos[index].elapsedTime = 0;
            }
            index++
        });

        /* newTodos.map((todo, index) => {
            //console.log(`reset => todo: ${todo.description} todo.time: ${todo.time} todo.elapsedTime: ${todo.elapsedTime} todo.currentTime: ${todo.currentTime}`)
            return {
                ...todo,
                completed: false,
                activated: false,
                currentTime: todos[index].time,
                elapsedTime: 0
            }
        }) */
        setTodos(newTodos);
        Sounds.boop(0, 1);
    }
    const editTodos = () => {
        setEdit(!edit);
        Sounds.boop(0, 1);
    }
    const clear = () => {
        setTodos([]);
        Sounds.boop(0, 1);
    }

    const onReset = (index) => {
        //toggleCheckbox(index);
        const newTodos = [...todos];
        newTodos[index].completed = false;
        newTodos[index].activated = false;
        newTodos[index].currentTime = todos[index].time;
        newTodos[index].elapsedTime = 0;
        setTodos(newTodos);
        //resetTodos();
    }

    return (
        <div className='mt--30'>
            <div className='color-yellow p-5 r-10'>
                <div className='containerBox'>
                    <label className='flexContainer containerInput'>
                        <input 
                            id='todo'
                            name='todo'
                            className='inputField p-15 bold size25 r-10' 
                            type='text'
                            placeholder='Enter a todo' 
                            onKeyDown={handleKeyDown} 
                        />
                        {/*<div className='r-10 greet bold bg-green m-5 p-20 flex2Column10Percent contentCenter' onClick={() => addTodo()}>ADD</div>*/}
                    </label>
                </div>
            </div>
            <div id='list' className='height--360 scroll'>
                {todos.map((todo, index) => (
                    <div key={getKey('todo')} className='containerBox bold scrollSnapTop'>

                        <div className='containerBox p-20 flexContainer color-lite'>
                            <div className=''>
                                <input
                                    id='completed'
                                    name='completed'
                                    className='regular-checkbox button mr-10'
                                    checked={todo.completed}
                                    type='checkbox'
                                    onChange={() => toggleCheckbox(index)}
                                />
                            </div>
                            <div className=''>
                                {
                                    (todo.type === 'timer')
                                        ? <div className='size25'>{icons.timer}</div>
                                        : ((todo.type === 'track')
                                            ? <div className='size25'>{icons.track}</div>
                                            : '')
                                }
                            </div>
                            <div className='size25 ml-10'>
                                {todo.description}
                            </div>
                        </div>
                        <div>
                            {
                                ((todo.type === 'timer' || todo.type === 'track') && !edit)
                                    /*? <TimerComponent
                                            todo={todo}
                                            index={index}
                                            setTodoCurrentTime={setTodoCurrentTime}
                                            setTodos={setTodos}
                                            todos={todos}
                                        />
                                    */
                                    ? <div className='flexContainer'>
                                        <div className='flex2Column containerBox m-5'>
                                            {/*
                                                        <TimerComponent
                                                            todo={todo}
                                                            index={index}
                                                            setTodoCurrentTime={setTodoCurrentTime}
                                                            setTodos={setTodos}
                                                            todos={todos}
                                                            toggleCheckbox={toggleCheckbox}
                                                            onReset={onReset}
                                                        />
                                                   
                                                        <StopwatchTimer
                                                            todo={todo}
                                                            index={index}
                                                            setTodoCurrentTime={setTodoCurrentTime}
                                                            setTodos={setTodos}
                                                            todos={todos}
                                                            toggleCheckbox={toggleCheckbox}
                                                            onReset={onReset}
                                                        />
                                                    */}
                                            <TodoTimer
                                                todo={todo}
                                                index={index}
                                                setTodoCurrentTime={setTodoCurrentTime}
                                                todos={todos}
                                                setTodos={setTodos}
                                                localData='todos'
                                                time={todo.time}
                                                toggleCheckbox={toggleCheckbox}
                                                onReset={onReset}
                                            />
                                        </div>
                                    </div>
                                    : null
                            }
                            {
                                (edit || ((add === true) && (index === todos.length - 1)))
                                    ? <div className='flexContainer containerBox'>
                                        <div 
                                            title='checkbox' 
                                            id={`setTimert${index}`} 
                                            name={`setTimer${todo.description}`} 
                                            className='button flex4Column containerDetail size12 m-1' 
                                            onClick={() => checkboxTodo(index)}
                                        >
                                            {icons.checkbox} Check
                                        </div>
                                        <div 
                                            title={`${icons.timer} Timer`}
                                            id={`setTimert${index}`} 
                                            name={`setTimer${todo.description}`} 
                                            className='button flex4Column containerDetail size12 m-1' 
                                            onClick={() => timerTodo(index)}
                                        >
                                            {icons.timer} Timer
                                        </div>
                                        <div 
                                            title={`${icons.track} Track`}
                                            id={`time${index}`} 
                                            name={`time${todo.description}`} 
                                            className='button flex4Column containerDetail size12 m-1' 
                                            onClick={() => trackTodo(index)}
                                        >
                                            {icons.track} Track
                                        </div>
                                        <div 
                                            title={`${icons.edit} Edit`}
                                            id={`edit${index}`} 
                                            name={`edit${todo.description}`} 
                                            className='button flex4Column containerDetail size12 m-1' 
                                            onClick={() => editTodo(index)}
                                        >
                                            {icons.edit} Edit
                                        </div>
                                        <div 
                                            title={`${icons.delete} Delete`}
                                            id={`remove${index}`} 
                                            name={`remove${todo.description}`} 
                                            className='button flex4Column containerDetail size12' 
                                            onClick={() => removeTodo(index)}
                                        >
                                            {icons.delete} Delete
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                    </div>
                ))}
            </div>
            <div className='bt-0 containerBox width--10'>
                {/*makeMenu()*/}
                <div
                    title={`${(paused) ? 'UNPAUSE' : 'PAUSE ALL CLOCKS'}`}
                    className='button color-lite r-10 bg-lite m-5 bold flex3Column p-20 size25 columnCenterAlign' 
                    onClick={() => togglePause()}
                >
                    {(paused) ? 'UNPAUSE' : 'PAUSE ALL CLOCKS'}
                </div>
                <div className='flexContainer'>
                    <div 
                        title='RESET'
                        className='button color-neogreen r-10 bg-dkGreen m-5 bold flex3Column p-20 size25 columnCenterAlign' 
                        onClick={() => resetTodos()}
                    >
                        RESET
                    </div>
                    <div 
                        title='EDIT'
                        className='button color-yellow r-10 bg-dkYellow m-5 bold flex3Column p-20 size25 columnCenterAlign' 
                        onClick={() => editTodos()}
                    >
                        EDIT
                    </div>
                    <div 
                        title='CLEAR'
                        className='button color-red r-10 bg-dkRed m-5 bold flex3Column p-20 size25 columnCenterAlign' 
                        onClick={() => clear()}
                    >
                        CLEAR
                    </div>
                </div>
            </div>
        </div>
    );
}