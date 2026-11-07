import React, { useState, useEffect, useRef } from 'react';
import Sounds from '../sound/Sounds';
import icons from '../site/icons';
import TodoTimer from '../utils/TodoTimer';
import initTodos from '../tracker/initTodos';
import initializeData from '../utils/InitializeData';
import CollapseToggleButton from '../utils/CollapseToggleButton';

export default function Todos(props) {
    const getLocal = () => initializeData('todos', initTodos);
    const CATEGORY_STORAGE_KEY = 'todoCategories';
    const SELECTED_CATEGORY_STORAGE_KEY = 'selectedTodoCategory';
    const DEFAULT_CATEGORY = 'General';

    const getStoredCategories = () => {
        try {
            const rawCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
            if (!rawCategories) return [DEFAULT_CATEGORY];
            const parsedCategories = JSON.parse(rawCategories);
            if (!Array.isArray(parsedCategories) || parsedCategories.length === 0) {
                return [DEFAULT_CATEGORY];
            }
            const cleanedCategories = parsedCategories
                .map((category) => String(category || '').trim())
                .filter(Boolean);
            return cleanedCategories.length > 0 ? cleanedCategories : [DEFAULT_CATEGORY];
        } catch {
            return [DEFAULT_CATEGORY];
        }
    };

    const getStoredSelectedCategory = () => {
        try {
            const storedSelectedCategory = localStorage.getItem(SELECTED_CATEGORY_STORAGE_KEY);
            return storedSelectedCategory && storedSelectedCategory.trim() ? storedSelectedCategory : DEFAULT_CATEGORY;
        } catch {
            return DEFAULT_CATEGORY;
        }
    };
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
    const [todoCategories, setTodoCategories] = useState(getStoredCategories);
    const [selectedTodoCategory, setSelectedTodoCategory] = useState(getStoredSelectedCategory);
    const [pausedTodos, setPausedTodos] = useState();
    const [edit, setEdit] = useState(false);
    const [add, setAdd] = useState(false);
    const [paused, setPaused] = useState(false);
    const [todoSearch, setTodoSearch] = useState('');
    const [showCompleted, setShowCompleted] = useState(true);
    const [isItemCategoryCollapsed, setIsItemCategoryCollapsed] = useState(true);
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

    useEffect(() => {
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(todoCategories));
    }, [todoCategories]);

    useEffect(() => {
        localStorage.setItem(SELECTED_CATEGORY_STORAGE_KEY, selectedTodoCategory);
    }, [selectedTodoCategory]);

    useEffect(() => {
        if (!todoCategories.includes(selectedTodoCategory)) {
            setSelectedTodoCategory(todoCategories[0] || DEFAULT_CATEGORY);
        }
    }, [todoCategories, selectedTodoCategory]);

    useEffect(() => {
        const categoriesFromTodos = Array.from(new Set(
            todos
                .map((todo) => String(todo.category || '').trim())
                .filter(Boolean)
        ));

        if (categoriesFromTodos.length === 0) {
            return;
        }

        const hasMissingCategory = categoriesFromTodos.some((category) => !todoCategories.includes(category));
        if (hasMissingCategory) {
            setTodoCategories((previousCategories) => {
                const mergedCategories = [...previousCategories];
                categoriesFromTodos.forEach((category) => {
                    if (!mergedCategories.includes(category)) {
                        mergedCategories.push(category);
                    }
                });
                return mergedCategories;
            });
        }
    }, [todos, todoCategories]);

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
        const rawInput = todoInput();
        if (!rawInput || !rawInput.trim()) {
            return;
        }

        const activeCategory = selectedTodoCategory || DEFAULT_CATEGORY;
        const newTodo = {
            description: getNewTodo(rawInput.trim()),
            category: activeCategory,
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

    const addCategory = () => {
        const enteredCategory = prompt('Add category:', '');
        const cleanedCategory = String(enteredCategory || '').trim();

        if (!cleanedCategory) return;
        if (todoCategories.includes(cleanedCategory)) {
            setSelectedTodoCategory(cleanedCategory);
            return;
        }

        setTodoCategories((previousCategories) => [...previousCategories, cleanedCategory]);
        setSelectedTodoCategory(cleanedCategory);
        Sounds.boop(0, 1);
    };

    const renameCategory = () => {
        const previousCategory = selectedTodoCategory;
        const enteredCategory = prompt('Rename category:', previousCategory);
        const cleanedCategory = String(enteredCategory || '').trim();

        if (!cleanedCategory || cleanedCategory === previousCategory) return;

        setTodoCategories((previousCategories) => previousCategories.map((category) => (
            category === previousCategory ? cleanedCategory : category
        )));

        setTodos((previousTodos) => previousTodos.map((todo) => {
            if ((todo.category || DEFAULT_CATEGORY) !== previousCategory) {
                return todo;
            }
            return {
                ...todo,
                category: cleanedCategory,
            };
        }));

        setSelectedTodoCategory(cleanedCategory);
        Sounds.boop(0, 1);
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
    const productTodo = (id) => {
        console.log(`product todo: ${todos[id].description}`);
        const newTodos = [...todos];
        const currentSku = String(newTodos[id].sku || '').trim();
        const enteredSku = prompt('Enter product SKU:', currentSku);

        if (enteredSku !== null) {
            newTodos[id].type = 'productTodo';
            newTodos[id].sku = String(enteredSku || '').trim();
            newTodos[id].time = 0;
            newTodos[id].currentTime = 0;
            setTodos(newTodos);
        }
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

        if (newTodos[id].type === 'productTodo') {
            newTodos[id].completed = nextValue > 0;
            setTodos(newTodos);
            Sounds.boop(0, 1);
            return;
        }

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
        const newTodos = todos.map((todo) => {
            const category = String(todo.category || DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY;
            if (category !== selectedTodoCategory) {
                return todo;
            }

            if (todo.type === 'timer') {
                return {
                    ...todo,
                    completed: false,
                    activated: false,
                    currentTime: todo.time,
                    elapsedTime: 0,
                };
            }

            if (todo.type === 'track') {
                return {
                    ...todo,
                    completed: false,
                    activated: false,
                    currentTime: 0,
                    elapsedTime: 0,
                };
            }

            if (todo.type === 'counter') {
                return {
                    ...todo,
                    completed: false,
                    activated: false,
                    counterValue: 0,
                    currentTime: 0,
                    elapsedTime: 0,
                };
            }

            if (todo.type === 'productTodo') {
                return {
                    ...todo,
                    completed: false,
                    activated: false,
                    currentTime: 0,
                    elapsedTime: 0,
                };
            }

            return {
                ...todo,
                completed: false,
                activated: false,
            };
        });

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

    const selectedCategoryTodoItems = todos
        .map((todo, index) => ({ todo, index }))
        .filter(({ todo }) => {
            const category = String(todo.category || DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY;
            return category === selectedTodoCategory;
        });

    const groupedTodos = (() => {
        const groupedMap = {};

        selectedCategoryTodoItems.forEach(({ todo, index }) => {
            const category = String(todo.category || DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY;
            if (!groupedMap[category]) groupedMap[category] = [];
            groupedMap[category].push({ todo, index });
        });

        const orderedCategories = [
            ...todoCategories,
            ...Object.keys(groupedMap).filter((category) => !todoCategories.includes(category)),
        ];

        return orderedCategories
            .filter((category) => groupedMap[category] && groupedMap[category].length > 0)
            .map((category) => ({
                category,
                items: groupedMap[category],
            }));
    })();

    const filteredGroupedTodos = groupedTodos
        .map((group) => {
            const filteredItems = group.items.filter(({ todo }) => {
                const matchesCompleted = showCompleted || !todo.completed;
                const matchesSearch = !todoSearch.trim()
                    || String(todo.description || '').toLowerCase().includes(todoSearch.trim().toLowerCase());
                return matchesCompleted && matchesSearch;
            });

            return {
                ...group,
                items: filteredItems,
            };
        })
        .filter((group) => group.items.length > 0);

    const totalTodos = selectedCategoryTodoItems.length;
    const completedTodos = selectedCategoryTodoItems.filter(({ todo }) => todo.completed).length;
    const remainingTodos = Math.max(0, totalTodos - completedTodos);
    const progressPercent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    return (
        <div className='mt--30'>
            <div className='containerDetail p-10 size20'>
                <div className='flexContainer'>
                    <div className='flex2Column'>
                        <label className='flexContainer'>
                            <div className='containerDetail flexColumn bg-lite color-yellow contentLeft p-20 size20'>
                                Todo Category
                            </div>
                            <select
                                className='containerDetail mt--1 ml-5 flex2Column size20 p-15 color-lite bg-lite'
                                value={selectedTodoCategory}
                                onChange={(event) => setSelectedTodoCategory(event.target.value)}
                            >
                                {todoCategories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            </div>
            <div className='containerDetail mt-5 bg-lite m-5'>
                <CollapseToggleButton
                    component={(
                        <div className='flexContainer contentLeft size20 color-yellow'>
                            <div className='mr-10 ml-5'><span className='text-outline-yellow'>➕</span> Item <span className='text-outline-yellow'>➕</span> Category ⏚ 🔎</div>
                        </div>
                    )}
                    isCollapsed={isItemCategoryCollapsed}
                    setCollapse={setIsItemCategoryCollapsed}
                    align='left'
                />
                {!isItemCategoryCollapsed && (
                    <div className='p-10 pt-0'>
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
                                    <div
                                        className='button color-lite r-10 bg-dkGreen m-5 p-20 flex2Column contentCenter'
                                        onClick={addTodo}
                                        title='Add todo'
                                    >
                                        ADD
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className='flexContainer mt-5'>
                            <div
                                title='Add category'
                                className='button color-yellow r-10 bg-dkGreen m-5 flex3Column p-15 size20 columnCenterAlign'
                                onClick={addCategory}
                            >
                                + Category
                            </div>
                            <div
                                title='Rename selected category'
                                className='button color-yellow r-10 bg-dkYellow m-5 flex3Column p-15 size20 columnCenterAlign'
                                onClick={renameCategory}
                            >
                                Rename Category
                            </div>
                        </div>
                        <div className='containerDetail p-10 m-5 bg-lite'>
                            <div className='flexContainer'>
                                <div className='flex2Column'>
                                    <input
                                        className='inputField p-10 size20 r-10 width-100-percent'
                                        value={todoSearch}
                                        onChange={(event) => setTodoSearch(event.target.value)}
                                        placeholder='Search todos...'
                                        aria-label='Search todos'
                                    />
                                </div>
                                <div
                                    className='button color-yellow r-10 bg-dark m-5 p-10 size20 flex2Column contentCenter'
                                    onClick={() => setShowCompleted((previousState) => !previousState)}
                                    title='Toggle completed visibility'
                                >
                                    {showCompleted ? 'Hide Completed' : 'Show Completed'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='containerDetail p-10 m-5 bg-dark color-lite' style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
                <span className='mr-10'>Total: {totalTodos}</span>
                <span className='mr-10'>Completed: {completedTodos}</span>
                <span className='mr-10'>Remaining: {remainingTodos}</span>
                <span className='color-yellow'>{progressPercent}%</span>
            </div>
            <div className='containerDetail mt-5 m-5' style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.15)' }}>
                <div
                    style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        borderRadius: 8,
                        transition: 'width 180ms ease',
                        background: 'linear-gradient(90deg, #2e7d32, #81c784)'
                    }}
                />
            </div>
            {/*
                <div
                    id='list'
                    ref={listRef}
                    className='height--600 scroll'
                    style={{
                        scrollBehavior: 'smooth',
                        padding: '8px 6px 12px 6px',
                        paddingBottom: 8,
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(0,0,0,0.22)'
                    }}
                >
                    {filteredGroupedTodos.length === 0 && (
                        <div className='containerDetail m-5 p-20 bg-dark color-lite size20'>
                            No matching todos. Adjust search or filters, or add a new task above.
                        </div>
                    )}
                </div>
            */}
            <div className='mb-100 pb-100'>
            {filteredGroupedTodos.map((group, idx) => (
                <div
                    key={group.category}
                    className={`containerDetail ${idx === filteredGroupedTodos.length - 1 ? 'pb-50' : ''}`}
                    style={{
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(12,12,12,0.45)'
                    }}
                >
                    <div
                        className='containerDetail size20 bg-dark color-yellow pl-10 contentLeft flexContainer'
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 5,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}
                    >
                        <span>{group.category}</span>
                        <span className='color-lite ml-10 size15'>
                            {group.items.filter(({ todo }) => todo.completed).length}/{group.items.length} shown complete
                        </span>
                    </div>
                    {group.items.map(({ todo, index }) => (
                        <div
                            key={`${group.category}-${todo.description}-${index}`}
                            className='containerDetail size20 scrollSnapTop bg-lite m-5 contentLeft'
                            style={{
                                border: todo.completed ? '2px solid #2e7d32' : '1px solid rgba(255,255,255,0.08)',
                                opacity: todo.completed ? 0.8 : 1,
                                borderRadius: 8,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            }}
                        >

                            <div className='containerDetail p-10 size20 p-20 flexContainer color-yellow bg-lite' style={{ alignItems: 'center' }}>
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
                                                    : ((todo.type === 'productTodo')
                                                        ? <div className='containerDetail brdr-lite p-8 size18 bg-lite'>📦</div>
                                                        : '')))
                                    }
                                </div>
                                <div className={`size20 ml-10 ${((todo.type === 'counter') && ((todo.counterValue < todo.counterTarget) && (todo.counterValue > 0))) ? 'mt-10' : ''}`} style={{ flex: 1 }}>
                                    {todo.type === 'productTodo' && (
                                        <div className='size12 color-orange'>
                                            {String(todo.sku || '').trim() || 'No SKU'}
                                        </div>
                                    )}
                                    <div className='size20 mb-5'>
                                        {todo.description}
                                    </div>
                                        
                                        {todo.type === 'productTodo' && (
                                            <div className='flex2Column containerDetail flexContainer size20' style={{ alignItems: 'center', gap: 4 }}>
                                                <div
                                                    title='decrement product quantity'
                                                    className='containerDetail p-10 size18 flex3Column button color-lite bg-dkRed text-outline-lite contentCenter'
                                                    onClick={() => updateCounter(index, -1)}
                                                >
                                                    {icons.minus}
                                                </div>
                                                <div className='containerDetail pt-10 pl-10 pr-10 flex3Column ml-2 mr-2 size24 bg-lite color-yellow' style={{ minWidth: 54, textAlign: 'center' }}>
                                                    {Number(todo.counterValue || 0)}
                                                </div>
                                                <div
                                                    title='increment product quantity'
                                                    className='containerDetail p-10 size18 flex3Column button color-yellow bg-dkGreen text-outline-lite contentCenter'
                                                    onClick={() => updateCounter(index, 1)}
                                                >
                                                    {icons.plus}
                                                </div>
                                            </div>
                                        )}
                                    {!['productTodo'].includes(todo.type) && (
                                        <div className='size12 color-orange'>
                                            {todo.completed ? 'Completed' : 'In progress'}
                                        </div>
                                    )}
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
                                                                    className='containerDetail bg-dkYellow size30 flex9Column contentCenter button color-lite mt-5 pt-15 w-50'
                                                                    onClick={() => setCounterTarget(index)}
                                                                >
                                                                    🎯
                                                                    <span className='copyright ml--10'>
                                                                        {todo.counterTarget || 0}
                                                                    </span>
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
                                                                <div className='containerDetail pt-15 pl-10 flex3Column ml-5 mr-5 size30 bg-lite color-yellow'>
                                                                    {
                                                                        (todo.counterValue < todo.counterTarget)
                                                                            ? Number(todo.counterValue || 0)
                                                                            : <span className='color-red'>{Number(todo.counterValue || 0)}</span>
                                                                    }
                                                                    {
                                                                        Number(todo.counterTarget || 0) > 0
                                                                            ? <div className='color-lite'>
                                                                                <span className='size12 ml-5'>of {Number(todo.counterTarget || 0)}</span>
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
                                        ? <div
                                            className='containerDetail p-10 size20 color-yellow'
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 4,
                                                overflowX: 'auto',
                                                whiteSpace: 'nowrap',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <div
                                                title='checkbox'
                                                id={`setTimert${index}`}
                                                name={`setTimer${todo.description}`}
                                                className={`button flex9Column containerDetail contentCenter size25 p-10 m-1 ${(todo.type === 'checkbox') ? 'brdr-green' : ''}`}
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => checkboxTodo(index)}
                                            >
                                                {icons.checkbox}
                                            </div>
                                            <div
                                                title={`${icons.timer} Timer`}
                                                id={`setTimert${index}`}
                                                name={`setTimer${todo.description}`}
                                                className={`button flex9Column containerDetail contentCenter size25 p-10 m-1 ${(todo.type === 'timer') ? 'brdr-green' : ''}`}
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => timerTodo(index)}
                                            >
                                                {icons.timer}
                                            </div>
                                            <div
                                                title={`${icons.track} Track`}
                                                id={`time${index}`}
                                                name={`time${todo.description}`}
                                                className={`button flex9Column containerDetail contentCenter size25 p-10 m-1 ${(todo.type === 'track') ? 'brdr-green' : ''}`}
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => trackTodo(index)}
                                            >
                                                {icons.track}
                                            </div>
                                            <div
                                                title='Counter'
                                                id={`counter${index}`}
                                                name={`counter${todo.description}`}
                                                className={`button flex9Column containerDetail contentCenter size25 p-10 m-1 ${(todo.type === 'counter') ? 'brdr-green' : ''}`}
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => counterTodo(index)}
                                            >
                                                🔢
                                            </div>
                                            <div
                                                title='Product SKU'
                                                id={`producttodo${index}`}
                                                name={`producttodo${todo.description}`}
                                                className={`button flex9Column containerDetail contentCenter size25 p-10 m-1 ${(todo.type === 'productTodo') ? 'brdr-green' : ''}`}
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => productTodo(index)}
                                            >
                                                📦
                                            </div>
                                            <div
                                                title='Move up'
                                                id={`moveup${index}`}
                                                name={`moveup${todo.description}`}
                                                className={`button flex9Column containerDetail contentCenter size25 p-10 m-1 ${(index === 0) ? 'opacity30' : ''}`}
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => moveTodo(index, index - 1)}
                                            >
                                                {icons.upArrow}
                                            </div>
                                            <div
                                                title='Move down'
                                                id={`movedown${index}`}
                                                name={`movedown${todo.description}`}
                                                className={`button flex9Column containerDetail contentCenter size25 p-10 m-1 ${(index === todos.length - 1) ? 'opacity30' : ''}`}
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => moveTodo(index, index + 1)}
                                            >
                                                {icons.downArrow}
                                            </div>
                                            <div
                                                title={`${icons.edit} Edit`}
                                                id={`edit${index}`}
                                                name={`edit${todo.description}`}
                                                className='button flex9Column containerDetail contentCenter size25 p-10 m-1'
                                                style={{ pointerEvents: 'auto' }}
                                                onClick={() => editTodo(index)}
                                            >
                                                {icons.edit}
                                            </div>
                                            <div
                                                title={`${icons.delete} Delete`}
                                                id={`remove${index}`}
                                                name={`remove${todo.description}`}
                                                className='button flex9Column contentCenter containerDetail size25 p-10'
                                                style={{ pointerEvents: 'auto' }}
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
            ))}
            </div>
            <div className='bt-0 containerDetail bg-dark p-10 size20 width--10'>
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