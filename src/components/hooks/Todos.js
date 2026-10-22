import React, { useState, useEffect, useRef } from 'react';
import Sounds from '../sound/Sounds';
import icons from '../site/icons';
import TodoTimer from '../utils/TodoTimer';
import initTodos from '../tracker/initTodos';
import initializeData from '../utils/InitializeData';

export default function Todos(props) {

    const getLocal = () => initializeData('todos', initTodos);
    // On mount, recalculate currentTime for active timers
    const recalcActiveTimers = (todosArr) => {
        const now = Date.now();
        return todosArr.map(todo => {
            if (todo.activated && (todo.type === 'timer' || todo.type === 'track') && todo.startTime > 0) {
                // For timer: countdown, for track: count up
                const elapsed = Math.floor((now - todo.startTime) / 1000);
                if (todo.type === 'timer') {
                    // Countdown: currentTime = max(0, original time - elapsed)
                    return { ...todo, currentTime: Math.max(0, (todo.time || 0) - elapsed) };
                } else {
                    // Track: currentTime = original + elapsed
                    return { ...todo, currentTime: (todo.currentTime || 0) + elapsed };
                }
            }
            return todo;
        });
    };
    const [todos, setTodos] = useState(() => recalcActiveTimers(getLocal()));
    const [pausedTodos, setPausedTodos] = useState();
    const [edit, setEdit] = useState(false);
    const [add, setAdd] = useState(false);
    const [paused, setPaused] = useState(false);
    const listRef = useRef(null);
    const todoInput = () => document.getElementById('todo').value;
    const clearInput = () => document.getElementById('todo').value = '';
    const getNewTodo = (todo) => todo.charAt(0).toUpperCase() + todo.slice(1);

    useEffect(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
        //console.log('TODOS CHANGED!!!!!!!!!!!!!!!!!!!!')
        //const timerActive = todos.some(obj => obj.activated);
        //setTimerOn(timerActive);
    }, [todos]);

    // On mount (or when component is shown), recalc timers from storage
    useEffect(() => {
        setTodos(recalcActiveTimers(getLocal()));
    }, []);

    useEffect(() => {
        if (add && listRef.current) {
            setTimeout(() => {
                const lastTodoElement = listRef.current?.lastElementChild;
                if (lastTodoElement) {
                    lastTodoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 0);
        }
    }, [add]);

    const addTodo = () => {
        const newTodo = {
            description: getNewTodo(todoInput()),
            type: 'checkbox',
            time: 0,
            currentTime: 0,
            counterValue: 0,
            counterTarget: 0,
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
    const moveTodo = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= todos.length || fromIndex === toIndex) {
            return;
        }
        const newTodos = [...todos];
        const [movedTodo] = newTodos.splice(fromIndex, 1);
        newTodos.splice(toIndex, 0, movedTodo);
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
    const counterTodo = (id) => {
        console.log(`counter todo: ${todos[id].description}`);
        const newTodos = [...todos];
        newTodos[id].type = 'counter';
        newTodos[id].counterValue = Number(newTodos[id].counterValue || 0);
        newTodos[id].counterTarget = Number(newTodos[id].counterTarget || 0);
        newTodos[id].time = 0;
        newTodos[id].currentTime = 0;
        setTodos(newTodos);
        setEdit(false);
        setAdd(false);
        Sounds.boop(0, 1);
    }
    const setCounterTarget = (id) => {
        const newTodos = [...todos];
        const currentTarget = Number(newTodos[id].counterTarget || 0);
        const updatedTarget = prompt('Enter counter target (0 clears target):', currentTarget);

        if (updatedTarget === null) {
            return;
        }

        const parsedTarget = Number(updatedTarget);
        if (!Number.isFinite(parsedTarget) || parsedTarget < 0) {
            return;
        }

        const normalizedTarget = Math.floor(parsedTarget);
        newTodos[id].counterTarget = normalizedTarget;

        const currentValue = Number(newTodos[id].counterValue || 0);
        if (normalizedTarget > 0) {
            newTodos[id].completed = currentValue >= normalizedTarget;
        }

        setTodos(newTodos);
        Sounds.boop(0, 1);
    }
    const updateCounter = (id, delta) => {
        const newTodos = [...todos];
        const currentValue = Number(newTodos[id].counterValue || 0);
        const nextValue = Math.max(0, currentValue + delta);
        newTodos[id].counterValue = nextValue;

        const targetValue = Number(newTodos[id].counterTarget || 0);
        if (targetValue > 0) {
            newTodos[id].completed = nextValue >= targetValue;
        }

        setTodos(newTodos);
        Sounds.boop(0, 1);
    }
    const resetCounter = (id) => {
        const newTodos = [...todos];
        newTodos[id].counterValue = 0;
        newTodos[id].completed = false;
        setTodos(newTodos);
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
        setPaused(prev => !prev)
    }
    const resetTodos = () => {
        const newTodos = [...todos];
        
        let index = 0;
        newTodos.forEach((todo) => {
            if (todo.type === 'timer') {
                newTodos[index].currentTime = newTodos[index].time;
                newTodos[index].elapsedTime = 0;
            }
            if (todo.type === 'counter') {
                newTodos[index].counterValue = 0;
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
        setEdit(prev => !prev);
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
                <div className='containerDetail p-10 size20'>
                    <label className='flexContainer containerInput'>
                        <input 
                            id='todo'
                            name='todo'
                            className='inputField p-15 size25 r-10' 
                            type='text'
                            placeholder='Enter a todo' 
                            onKeyDown={handleKeyDown} 
                        />
                        {/*<div className='r-10 greet bg-green m-5 p-20 flex2Column10Percent contentCenter' onClick={() => addTodo()}>ADD</div>*/}
                    </label>
                </div>
            </div>
            <div id='list' ref={listRef} className='height--360 scroll'>
                {todos.map((todo, index) => (
                    <div key={`${todo.description}-${index}`} className='containerDetail size20 scrollSnapTop bg-lite m-5'>

                        <div className='containerDetail p-10 size20 p-20 flexContainer color-yellow bg-lite'>
                            <div className=''>
                                {
                                    (todo.type === 'counter' && (todo.counterTarget > todo.counterValue))
                                    ? ''
                                    : <input
                                        name='completed'
                                        className='regular-checkbox button mr-10'
                                        checked={todo.completed}
                                        type='checkbox'
                                        onChange={() => toggleCheckbox(index)}
                                    />
                                }
                            </div>
                            <div className=''>
                                {
                                    (todo.type === 'timer')
                                        ? <div className='size25'>{icons.timer}</div>
                                        : ((todo.type === 'track')
                                            ? <div className='size25'>{icons.track}</div>
                                            : ((todo.type === 'counter')
                                                ? ((Number(todo.counterTarget || 0) > 0) && (todo.counterValue < todo.counterTarget) && todo.counterValue > 0) 
                                                    ? <div className='containerDetail brdr-lite p-10 size20 bg-lite'>
                                                        {
                                                            (todo.counterValue) 
                                                            ? <span className='color-yellow'>{todo.counterValue}</span> 
                                                            : '🔢'
                                                        }
                                                        </div> 
                                                    : '🔢'
                                                : ''))
                                }
                            </div>
                            <div className={`size25 ml-10 ${((todo.type === 'counter') && ((todo.counterValue < todo.counterTarget) && (todo.counterValue > 0))) ? 'mt-10' : ''}`}>
                                {todo.description}
                            </div>
                        </div>
                        <div>
                            {
                                ((todo.type === 'timer' || todo.type === 'track' || todo.type === 'counter') && !edit)
                                    /*? <TimerComponent
                                            todo={todo}
                                            index={index}
                                            setTodoCurrentTime={setTodoCurrentTime}
                                            setTodos={setTodos}
                                            todos={todos}
                                        />
                                    */
                                    ? <div className='flexContainer'>
                                        <div className='flex2Column size20 mt-5'>
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
                                            {
                                                (todo.type === 'counter')
                                                    ? <div className='flexContainer size20'>
                                                        <div className='containerDetail mr-1 flex2Column flexContainer size20'>
                                                            <div
                                                                title='reset counter'
                                                                className='containerDetail bg-dkGreen size30 flex5Column button color-lite mt-5 pt-20 mr-5'
                                                                onClick={() => resetCounter(index)}
                                                            >
                                                                ♻️
                                                            </div>
                                                            <div
                                                                title='set counter target'
                                                                className='containerDetail bg-dkYellow size35 flex5Column button color-lite mt-5 pt-15'
                                                                onClick={() => setCounterTarget(index)}
                                                            >
                                                                🎯<span className='copyright ml--10'>{todo.counterTarget || 0}</span>
                                                            </div>
                                                        </div>
                                                        <div className='containerDetail flex1Column flexContainer size20'>
                                                            <div
                                                                title='decrement'
                                                                className='containerDetail p-20 size20 flex3Column button color-lite bg-dkRed text-outline-lite'
                                                                onClick={() => updateCounter(index, -1)}
                                                            >
                                                                {icons.minus}
                                                            </div>
                                                            <div className='containerDetail pt-15 flex3Column ml-5 mr-5 size30 bg-lite color-yellow'>
                                                                {
                                                                    (todo.counterValue < todo.counterTarget)
                                                                    ? Number(todo.counterValue || 0)
                                                                    : <span className='color-red'>{Number(todo.counterValue || 0)}</span>
                                                                }
                                                                {
                                                                    Number(todo.counterTarget || 0) > 0
                                                                        ? <div className='size25 color-lite'>
                                                                            <span className='size12'>of {Number(todo.counterTarget || 0)}</span>
                                                                        </div>
                                                                        : null
                                                                }
                                                            </div>
                                                            <div
                                                                title='increment'
                                                                className='containerDetail p-20 size20 flex3Column button color-yellow bg-dkGreen text-outline-lite'
                                                                onClick={() => updateCounter(index, 1)}
                                                            >
                                                                {icons.plus}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    : <TodoTimer
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
                                            }
                                        </div>
                                    </div>
                                    : null
                            }
                            {
                                (edit || ((add === true) && (index === todos.length - 1)))
                                    ? <div className='flexContainer containerDetail p-10 size20 color-yellow'>
                                        <div 
                                            title='checkbox' 
                                            id={`setTimert${index}`} 
                                            name={`setTimer${todo.description}`} 
                                            className={`button flex4Column containerDetail size25 p-10 m-1 ${(todo.type === 'checkbox') ? 'brdr-green' : ''}`}
                                            onClick={() => checkboxTodo(index)}
                                        >
                                            {icons.checkbox}
                                        </div>
                                        <div 
                                            title={`${icons.timer} Timer`}
                                            id={`setTimert${index}`} 
                                            name={`setTimer${todo.description}`} 
                                            className={`button flex4Column containerDetail size25 p-10 m-1 ${(todo.type === 'timer') ? 'brdr-green' : ''}`}
                                            onClick={() => timerTodo(index)}
                                        >
                                            {icons.timer}
                                        </div>
                                        <div 
                                            title={`${icons.track} Track`}
                                            id={`time${index}`} 
                                            name={`time${todo.description}`} 
                                            className={`button flex4Column containerDetail size25 p-10 m-1 ${(todo.type === 'track') ? 'brdr-green' : ''}`} 
                                            onClick={() => trackTodo(index)}
                                        >
                                            {icons.track}
                                        </div>
                                        <div
                                            title='Counter'
                                            id={`counter${index}`}
                                            name={`counter${todo.description}`}
                                            className={`button flex4Column containerDetail size25 p-10 m-1 ${(todo.type === 'counter') ? 'brdr-green' : ''}`}
                                            onClick={() => counterTodo(index)}
                                        >
                                            🔢
                                        </div>
                                        <div
                                            title='Move up'
                                            id={`moveup${index}`}
                                            name={`moveup${todo.description}`}
                                            className={`button flex4Column containerDetail size25 p-10 m-1 ${(index === 0) ? 'opacity30' : ''}`}
                                            onClick={() => moveTodo(index, index - 1)}
                                        >
                                            {icons.upArrow}
                                        </div>
                                        <div
                                            title='Move down'
                                            id={`movedown${index}`}
                                            name={`movedown${todo.description}`}
                                            className={`button flex4Column containerDetail size25 p-10 m-1 ${(index === todos.length - 1) ? 'opacity30' : ''}`}
                                            onClick={() => moveTodo(index, index + 1)}
                                        >
                                            {icons.downArrow}
                                        </div>
                                        <div 
                                            title={`${icons.edit} Edit`}
                                            id={`edit${index}`} 
                                            name={`edit${todo.description}`} 
                                            className='button flex4Column containerDetail size25 p-10 m-1' 
                                            onClick={() => editTodo(index)}
                                        >
                                            {icons.edit}
                                        </div>
                                        <div 
                                            title={`${icons.delete} Delete`}
                                            id={`remove${index}`} 
                                            name={`remove${todo.description}`} 
                                            className='button flex4Column containerDetail size25 p-10' 
                                            onClick={() => removeTodo(index)}
                                        >
                                            {icons.delete}
                                        </div>
                                    </div>
                                    : null
                            }
                        </div>
                    </div>
                ))}
            </div>
            <div className='bt-0 containerDetail p-10 size20 width--10'>
                {/*makeMenu()*/}
                <div
                    title={`${(paused) ? 'UNPAUSE' : 'PAUSE ALL CLOCKS'}`}
                    className='button color-lite r-10 bg-lite m-5 flex3Column p-20 size25 columnCenterAlign' 
                    onClick={() => togglePause()}
                >
                    {(paused) ? 'UNPAUSE' : 'PAUSE ALL CLOCKS'}
                </div>
                <div className='flexContainer'>
                    <div 
                        title='RESET'
                        className='button color-neogreen r-10 bg-dkGreen m-5 flex3Column p-20 size25 columnCenterAlign' 
                        onClick={() => resetTodos()}
                    >
                        RESET
                    </div>
                    <div 
                        title='EDIT'
                        className='button color-yellow r-10 bg-dkYellow m-5 flex3Column p-20 size25 columnCenterAlign' 
                        onClick={() => editTodos()}
                    >
                        EDIT
                    </div>
                    <div 
                        title='CLEAR'
                        className='button color-red r-10 bg-dkRed m-5 flex3Column p-20 size25 columnCenterAlign' 
                        onClick={() => clear()}
                    >
                        CLEAR
                    </div>
                </div>
            </div>
        </div>
    );
}