import React, { useState, useEffect, useRef } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';
//import InventoryManager from './InventoryManager';
const HOUSE_FOCUS_TASK_KEY = 'houseFocusTaskKey';
const makeTaskKey = (task) => `${task.description || ''}|${task.nextDue || ''}`;
const CATEGORIES_INIT = ['Kitchen', 'Garage', 'Electronics', 'Bathroom'];
// LocalStorage helpers
const getStoredInventory = () => {
    const stored = localStorage.getItem('homeInventory');
    return stored ? JSON.parse(stored) : [];
};

const saveInventory = (inventory) => {
    if (inventory && inventory.length > 0) {
        localStorage.setItem('homeInventory', JSON.stringify(inventory));
    }
};

const getStoredTasks = () => {
    const stored = localStorage.getItem('maintenanceTasks');
    return stored ? JSON.parse(stored) : [];
};
const getStoredMasterTasks = () => {
    const stored = localStorage.getItem('masterMaintenanceTasks');
    return stored ? JSON.parse(stored) : [];
};
const getStoredFutureTasks = () => {
    const stored = localStorage.getItem('futureMaintenanceTasks');
    return stored ? JSON.parse(stored) : [];
};

const Dashboard = () => {
    const taskRefs = useRef([]);
    const [inventory, setInventory] = useState(getStoredInventory());
    const [inventoryDisplay, setInventoryDisplay] = useState(true);
    const [categories, setCategories] = useState();
    const [newItem, setNewItem] = useState({ name: '', category: '', quantity: 1, notes: '' });
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [, setNewCategory] = useState('');
    const [inventoryForm, setInventoryForm] = useState(true);
    const [tasks, setTasks] = useState(getStoredTasks());
    const [masterTasks, setMasterTasks] = useState(getStoredMasterTasks());
    const [futureTasks, setFutureTasks] = useState(getStoredFutureTasks());
    const [newTask, setNewTask] = useState({ description: '', category: '', recurrence: 'Weekly', nextDue: new Date().toISOString().slice(0, 10) });
    const [searchMaintenance, setSearchMaintenance] = useState('');
    const [filterCompleted, setFilterCompleted] = useState('All');
    const [maintenanceDisplay, setMaintenanceDisplay] = useState(true);
    const [masterTasksDisplay, setMasterTasksDisplay] = useState(true);
    const [addTaskCollapse, setAddTaskCollapse] = useState(true);
    const [inventoryEdit, setInventoryEdit] = useState(-1);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [editTaskIndex, setEditTaskIndex] = useState(-1);
    const [editTask, setEditTask] = useState(null);
    const [focusTaskKey, setFocusTaskKey] = useState('');

    useEffect(() => {
        if (!filteredTasks.length || focusTaskKey) return;
        const todayStr = new Date().toISOString().slice(0, 10);
        let scrollIdx = filteredTasks.findIndex(task => task.nextDue >= todayStr && !task.completed);
        if (scrollIdx === -1) {
            scrollIdx = filteredTasks.length - 1;
        }
        if (taskRefs.current[scrollIdx]) {
            taskRefs.current[scrollIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [filteredTasks, focusTaskKey]);

    useEffect(() => {
        const focusFromStorage = () => {
            const key = localStorage.getItem(HOUSE_FOCUS_TASK_KEY) || '';
            if (!key) return;
            setMaintenanceDisplay(false);
            setFilterCompleted('All');
            setSearchMaintenance('');
            setFocusTaskKey(key);
        };

        focusFromStorage();
        window.addEventListener('house-focus-task', focusFromStorage);
        window.addEventListener('focus', focusFromStorage);
        return () => {
            window.removeEventListener('house-focus-task', focusFromStorage);
            window.removeEventListener('focus', focusFromStorage);
        };
    }, []);

    useEffect(() => {
        if (!focusTaskKey || !filteredTasks.length) return;
        const targetIndex = filteredTasks.findIndex((task) => makeTaskKey(task) === focusTaskKey);
        if (targetIndex < 0) {
            const todayStr = new Date().toISOString().slice(0, 10);
            let fallbackIndex = filteredTasks.findIndex(task => task.nextDue >= todayStr && !task.completed);
            if (fallbackIndex === -1) {
                fallbackIndex = filteredTasks.length - 1;
            }
            const fallbackTarget = taskRefs.current[fallbackIndex];
            if (fallbackTarget) {
                fallbackTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                fallbackTarget.classList.add('bg-lite');
                setTimeout(() => fallbackTarget.classList.remove('bg-lite'), 1800);
            }
            localStorage.removeItem(HOUSE_FOCUS_TASK_KEY);
            setFocusTaskKey('');
            return;
        }

        const target = taskRefs.current[targetIndex];
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.add('bg-lite');
            const timeout = setTimeout(() => {
                target.classList.remove('bg-lite');
            }, 1800);
            localStorage.removeItem(HOUSE_FOCUS_TASK_KEY);
            setFocusTaskKey('');
            return () => clearTimeout(timeout);
        }
    }, [filteredTasks, focusTaskKey]);
    useEffect(() => saveInventory(inventory), [inventory]);
    useEffect(() => {
        localStorage.setItem('maintenanceTasks', JSON.stringify(futureTasks));
        const newFilteredTasks = futureTasks.filter(task => {
            const matchesSearch = !searchMaintenance || task.description.toLowerCase().includes(searchMaintenance.toLowerCase());
            const matchesCompletion =
                filterCompleted === 'All' ||
                (filterCompleted === 'Completed' && task.completed) ||
                (filterCompleted === 'Pending' && !task.completed);
            return matchesSearch && matchesCompletion;
        });
        setFilteredTasks(newFilteredTasks);
    }, [futureTasks, searchMaintenance, filterCompleted]);
    useEffect(() => {
        const initializedCategories = initializeData('inventoryCategories', CATEGORIES_INIT);
        setCategories(initializedCategories);
    }, []);
    useEffect(() => {
        const newCategories = [];
        if (CATEGORIES_INIT && CATEGORIES_INIT.length > 0) {
            CATEGORIES_INIT.forEach(cat => {
                if (!newCategories.includes(cat)) {
                    newCategories.push(cat);
                }
            });
        }
        if (inventory.length > 0) {
            inventory.forEach(item => {
                if (item.category && !newCategories.includes(item.category)) {
                    newCategories.push(item.category);
                }
            });
            setCategories(newCategories);
        }
    }, [inventory]);
    useEffect(() => {
        if (categories && categories.length > 0) {
            localStorage.setItem('inventoryCategories', JSON.stringify(categories));
        }
    }, [categories]);
    const handleAddInventory = () => {
        console.log(`Dashboard => handleAddInventory => newItem: ${JSON.stringify(newItem, null, 2)}`);
        if (!newItem.name || !newItem.category) return;
        // Avoid duplicates
        //const exists = inventory.some(item => item.name.toLowerCase() === newItem.name.toLowerCase() && item.category === newItem.category);
        //if (!exists) {
            setInventory([{ ...newItem }, ...inventory]);
        //}
        setNewItem({ name: '', category: '', quantity: 1, notes: '' });
    };
    const handleEditInventory = () => {
        const newInventory = [...inventory];
        newInventory[inventoryEdit] = {...newItem};
        setInventory(newInventory);
        setInventoryEdit(-1);
        setNewItem({ name: '', category: '', quantity: 1, notes: '' });
        setInventoryForm(true);
    };
    // --- Maintenance Handlers ---
    const generateFutureTasks = (task) => {
        const futureTasks = [];
        let nextDate = new Date(task.nextDue);
    
        const today = new Date();
        // Show 3 months ahead, but allow custom recurrence intervals
        const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
        // Prevent infinite loop for invalid recurrence
        let count = 0, maxTasks = 100;
        while (nextDate <= endDate && count < maxTasks) {
            futureTasks.push({
                ...task,
                nextDue: new Date(nextDate).toISOString().slice(0, 10),
                completed: false
            });
    
            if (task.recurrence === 'Daily') nextDate.setDate(nextDate.getDate() + 1);
            else if (task.recurrence === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (task.recurrence === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (task.recurrence === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
            else break; // One-Time or Custom, only add the first
            count++;
        }
        // Sort by nextDue date before returning
        futureTasks.sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
        console.log(`Dashboard => generateFutureTasks => futureTasks: ${JSON.stringify(futureTasks, null, 2)}`);
        return futureTasks;
    };
    const toggleTaskCompletion = (index) => {
        const updated = [...futureTasks];
        updated[index].completed = !updated[index].completed;
        setFutureTasks(updated);
    };

    const startEditTask = (idx) => {
        setEditTaskIndex(idx);
        setEditTask({ ...filteredTasks[idx] });
    };

    const handleEditTaskChange = (field, value) => {
        setEditTask(prev => ({ ...prev, [field]: value }));
    };

    const saveEditedTask = () => {
        if (editTaskIndex < 0 || !editTask) return;
        // Find the index in the main tasks array
        const globalIdx = tasks.findIndex(t => t.nextDue === filteredTasks[editTaskIndex].nextDue && t.description === filteredTasks[editTaskIndex].description);
        if (globalIdx > -1) {
            const updatedTasks = [...tasks];
            updatedTasks[globalIdx] = { ...editTask };
            setTasks(updatedTasks.sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue)));
        }
        setEditTaskIndex(-1);
        setEditTask(null);
    };

    const cancelEditTask = () => {
        setEditTaskIndex(-1);
        setEditTask(null);
    };

    const deleteTask = (idx) => {
        // Find the index in the main tasks array
        const globalIdx = tasks.findIndex(t => t.nextDue === filteredTasks[idx].nextDue && t.description === filteredTasks[idx].description);
        if (globalIdx > -1) {
            const updatedTasks = [...tasks];
            updatedTasks.splice(globalIdx, 1);
            setTasks(updatedTasks);
        }
        setEditTaskIndex(-1);
        setEditTask(null);
    };

    // Generate future tasks from master tasks
    const generateFutureTasksFromMaster = (masterList) => {
        let allFuture = [];
        masterList.forEach(task => {
            allFuture = [
                ...allFuture,
                ...generateFutureTasks(task).map(ft => ({
                    ...ft,
                    masterId: task.id,
                    isDetached: false // not individually edited
                }))
            ];
        });
        allFuture.sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
        return allFuture;
    };

    // Add a new master task and regenerate future tasks
    const handleAddMasterTask = () => {
        if (!newTask.description) return;
        const id = Date.now().toString();
        const masterTask = { ...newTask, id };
        const updatedMaster = [masterTask, ...masterTasks];
        setMasterTasks(updatedMaster);
        // Regenerate future tasks
        setFutureTasks(generateFutureTasksFromMaster(updatedMaster));
        setNewTask({ description: '', category: '', recurrence: 'Weekly', nextDue: new Date().toISOString().slice(0, 10) });
    };

    // Edit master task and update all related future tasks
    const saveEditedMasterTask = () => {
        if (editTaskIndex < 0 || !editTask) return;
        const updatedMaster = masterTasks.map((t, idx) =>
            idx === editTaskIndex ? { ...editTask } : t
        );
        setMasterTasks(updatedMaster);
        // Regenerate future tasks for this master task
        setFutureTasks(prev =>
            prev
                .filter(ft => ft.masterId !== editTask.id || ft.isDetached)
                .concat(
                    generateFutureTasks(editTask).map(ft => ({
                        ...ft,
                        masterId: editTask.id,
                        isDetached: false
                    }))
                )
        );
        setEditTaskIndex(-1);
        setEditTask(null);
    };

    // Delete master task and all its future tasks
    const deleteMasterTask = (idx) => {
        const id = masterTasks[idx].id;
        setMasterTasks(masterTasks.filter((_, i) => i !== idx));
        setFutureTasks(futureTasks.filter(ft => ft.masterId !== id || ft.isDetached));
        setEditTaskIndex(-1);
        setEditTask(null);
    };

    // Persist master and future tasks
    useEffect(() => {
        localStorage.setItem('masterMaintenanceTasks', JSON.stringify(masterTasks));
    }, [masterTasks]);
    useEffect(() => {
        localStorage.setItem('futureMaintenanceTasks', JSON.stringify(futureTasks));
    }, [futureTasks]);

    // --- Filtered Data ---
    const filteredInventory = inventory.filter(item =>
        (!filterCategory || item.category === filterCategory) &&
        (!searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const deleteInventory = (index) => {
        const updated = [...inventory];
        updated.splice(index, 1);
        setInventory(updated);
    };
    const editInventory = (index) => {
        const item = inventory[index];
        //const newName = prompt('name:', item.name);
        //const newCategory = prompt('category:', item.category);
        //const newQuantity = prompt('quantity:', item.quantity);
        //const newNotes = prompt('notes:', item.notes);
        //const newValue = prompt('value:', item.value);
        //const updated = [...inventory];
        setNewItem({ name: item.name, category: item.category, quantity: item.quantity, notes: item.notes, value: item.value });
        //updated.splice(index, 1);
        //setInventory(updated);
        setInventoryEdit(index);
        setInventoryForm(false);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    };
    return (
        <div className=''>
            <div className=''>
                {
                    <div className='containerDetail bg-lite mt-5 mb-5'>
                        <div className='containerDetail size20 pt-10 pb-10 pl-10'>
                            <CollapseToggleButton
                                title={<span className='color-yellow contentLeft'>
                                    📋 Inventory</span>}
                                isCollapsed={inventoryDisplay}
                                setCollapse={setInventoryDisplay}
                                align='left'
                            />
                        </div>
                        {
                            (inventoryDisplay)
                            ? null
                            : <div className='containerDetail mt-5 mb-5'>
                                <div className='containerDetail'>
                                    <input
                                        placeholder='Search...'
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className='containerBox width--10'
                                    />
                                    <select
                                        value={filterCategory}
                                        onChange={e => setFilterCategory(e.target.value)}
                                        className='containerBox width--10'
                                    >
                                        <option value=''>All Categories</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className='containerDetail mt-5 mb-5 scrollHeight250'>
                                {
                                    filteredInventory.map((item, i) => (
                                        <div key={i} className='containerBox contentLeft bg-lite'>
                                            <div className='containerDetail flexContainer'>
                                                    <div className='color-yellow p-10 m-1 flex2Column'>
                                                    {item.name}
                                                </div>
                                                <div className='m-1 flexColumn w-40'>
                                                    <div className='containerDetail p-10 button size15' onClick={() => deleteInventory(i)}>
                                                        🗑️
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='pl-15'>
                                                <div className='m-1 size15'>
                                                    {item.notes && `${item.notes}`}
                                                </div>
                                                <div className='m-1 size15'>
                                                    {item.category}
                                                </div>
                                                <div className='m-1 size15'>
                                                    Qty: {item.quantity}
                                                </div>
                                                <div className='flexContainer'>
                                                    <div className='flex2Column m-1 size15'>
                                                        ${item.value}
                                                    </div>
                                                    <div className='m-1 flexColumn w-40'>
                                                        <div className='containerDetail mt--15 p-10 button size15' onClick={() => editInventory(i)}>✏️</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                                </div>
                            </div>
                        }
                        <div className='containerDetail mt-5 size20 pt-10 pb-10 pl-10 contentLeft bg-green'>
                            
                            <CollapseToggleButton
                                title={
                                    <span className='color-yellow'>
                                        {
                                            (inventoryEdit > -1)
                                                ? '✏️ Edit Inventory'
                                                : <span className='size20'>
                                                    <span className='text-outline-light'>
                                                        ➕
                                                    </span> Add Inventory
                                                </span>
                                        }
                                    </span>
                                }
                                isCollapsed={inventoryForm}
                                setCollapse={setInventoryForm}
                                align='left'
                            />
                        </div>
                        {
                            (inventoryForm)
                                ? null
                                : <div className='containerDetail mt-5'>
                                    <input
                                        placeholder='Item Name'
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        className='containerBox width--10'
                                    />
                                    <select
                                        value={newItem.category}
                                        onChange={e => {
                                            if (e.target.value === '__add__') {
                                                const cat = prompt('Enter new category:');
                                                if (cat && !categories.includes(cat)) {
                                                    setCategories([...categories, cat]);
                                                    setNewCategory(cat);
                                                    setNewItem({ ...newItem, category: cat });
                                                }
                                            } else {
                                                setNewItem({ ...newItem, category: e.target.value });
                                            }
                                        }}
                                        className='containerDetail color-lite p-10 size20 mb-5 width--10'
                                    >
                                        <option value=''>Select Category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        <option value='__add__'>➕ Add category</option>
                                    </select>
                                    <div className='containerDetail color-lite size20 m-5 flexContainer'>
                                        <div className='containerDetail mr-5 flex2Column contentRight p-10'>
                                            Quantity:
                                        </div>
                                        <input
                                            type='number'
                                            min='1'
                                            value={newItem.quantity}
                                            onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                            className='containerBox flexColumn width-50-percent'
                                        />
                                    </div>
                                    <div className='containerDetail color-lite size20 m-5 flexContainer'>
                                        <div className='containerDetail mr-5 flex2Column contentRight p-10'>
                                            Value:
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newItem.value ?? ''} // fallback to empty string when undefined/null
                                            onChange={e =>
                                                setNewItem({
                                                    ...newItem,
                                                    value: e.target.value === '' ? '' : Number(e.target.value),
                                                })
                                            }
                                            className="containerBox flexColumn width-50-percent"
                                        />
                                    </div>
                                    <input
                                        placeholder='Notes'
                                        value={newItem.notes}
                                        onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                                        className='containerDetail mr-5 flex2Column color-lite size20 p-10 bg-tintedMedium width--10 ml-5 mb-5'
                                    />
                                    <div
                                        onClick={(inventoryEdit > -1) ? handleEditInventory : handleAddInventory}
                                        className='containerBox width--10 button bg-blue'
                                    >
                                        {
                                            (inventoryEdit > -1)
                                                ? 'Save Changes'
                                                : 'Add Item'
                                        }
                                    </div>
                                    <div
                                        onClick={() => {
                                            setInventoryForm(true);
                                            setInventoryEdit(-1);
                                            setNewItem({ name: '', category: '', quantity: 1, notes: '' });
                                        }}
                                        className='containerBox width--10 button bg-lite'
                                    >
                                        Cancel
                                    </div>
                                </div>
                        }
                    </div> 
                }
            </div>
            <div className='containerDetail mt-5 mb-5 bg-lite'>
                <div className='containerDetail size20 pt-10 pb-10 pl-10'>
                    <CollapseToggleButton
                        title={<span className='color-yellow contentLeft'>🛠 Maintenance Tasks</span>}
                        isCollapsed={maintenanceDisplay}
                        setCollapse={setMaintenanceDisplay}
                        align='left'
                    />
                </div>
                {
                    (maintenanceDisplay)
                    ? null
                    : <div className='containerDetail color-lite mt-5'>
                        {editTaskIndex < 0 && !editTask && (
                        <div>
                            <div className='containerBox'>
                                <input
                                    placeholder='Search Tasks...'
                                    value={searchMaintenance}
                                    onChange={e => setSearchMaintenance(e.target.value)}
                                    className='containerBox width--10'
                                />
                                <select
                                    value={filterCompleted}
                                    onChange={e => setFilterCompleted(e.target.value)}
                                    className='containerBox width--10'
                                >
                                    <option value='All'>All</option>
                                    <option value='Completed'>Completed</option>
                                    <option value='Pending'>Pending</option>
                                </select>
                            </div>
                            <div className='containerDetail scrollHeight250 bg-tintedMedium m-5'>
                                {filteredTasks.length === 0 && (
                                    <div className='containerDetail color-lite'>No tasks yet.</div>
                                )}
                                {filteredTasks.map((task, i) => (
                                    <div
                                        key={i}
                                        ref={el => taskRefs.current[i] = el}
                                        className={`containerDetail mb-5 contentLeft button ${task.completed ? 'bg-lite' : ''}`}
                                        onClick={() => toggleTaskCompletion(i)}
                                    >
                                        <div className='containerDetail bg-dkGreen flexContainer mb-5'>
                                            <input
                                                type='checkbox'
                                                checked={task.completed}
                                                className='button ml-5 mr-10'
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    toggleTaskCompletion(i);
                                                }}
                                                readOnly
                                            />
                                            <div className='flex2Column pt-5'>
                                                {task.description}
                                            </div>
                                            <div className='flexColumn'>
                                                <button
                                                    className='p-5 r-5 button bg-lite color-lite m-1'
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        startEditTask(i);
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className='p-5 r-5 button bg-lite color-lite m-1'
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        deleteTask(i);
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <div className='pl-30 size15'>
                                            Due: {task.nextDue} {task.recurrence && `| Recurs: ${task.recurrence}`}
                                        </div>
                                        <div className='pl-30 size15'>
                                            ({task.category || 'General'})
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>
                }
                <div>
                    <div className='containerDetail size20 pt-20 pb-20 pl-20 contentLeft bg-green mt-5'>
                        <span
                            onClick={() => setAddTaskCollapse(prev => !prev)}
                            className='color-yellow button size20'
                        >
                            <span className='text-outline-light'>
                                ➕
                            </span> Add Task
                        </span>
                    </div>
                    {
                        (addTaskCollapse)
                        ? null
                        : <div className='containerDetail mt-5 bg-lite'>
                            <input
                                className='containerDetail color-lite size20 bg-tintedMedium p-10 mt-5 width--10'
                                placeholder='Task Description'
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                            />
                            <select
                                value={newTask.category}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                className='containerDetail color-lite size20 bg-tintedMedium p-10 mt-5 width--10'
                            >
                                <option value=''>Select Category</option>
                                <option value='Appliances'>Appliances</option>
                                <option value='Plumbing'>Plumbing</option>
                                <option value='HVAC'>HVAC</option>
                                <option value='General'>General</option>
                            </select>
                            <select
                                value={newTask.recurrence}
                                onChange={e => setNewTask({ ...newTask, recurrence: e.target.value })}
                                className='containerDetail color-lite size20 bg-tintedMedium p-10 mt-5 width--10'
                            >
                                <option value='One-Time'>One-Time</option>
                                <option value='Daily'>Daily</option>
                                <option value='Weekly'>Weekly</option>
                                <option value='Monthly'>Monthly</option>
                                <option value='Yearly'>Yearly</option>
                                <option value='Custom'>Custom</option>
                            </select>
                            <input
                                type='date'
                                value={newTask.nextDue}
                                onChange={e => setNewTask({ ...newTask, nextDue: e.target.value })}
                                className='containerDetail color-lite size20 bg-tintedMedium p-10 mt-5 width--10'
                            />
                            <div className='flexContainer'>
                                <div
                                    className='containerDetail button bg-green color-lite p-10 m-5 flex2Column size20'
                                    onClick={handleAddMasterTask}
                                >
                                    ➕ Add Task
                                </div>
                                <div
                                    className='containerDetail button bg-green color-lite pt-10 pb-10 m-5 flex2Column size20'
                                    onClick={() => setAddTaskCollapse(true)}
                                >
                                    Cancel
                                </div>
                            </div>
                            {/*
                            <div 
                                onClick={handleAddTask}
                                className='containerBox bg-blue button color-lite'
                            >
                                Add Task
                            </div>
                            <input
                                className='containerBox width--10 m-5'
                                placeholder='Task Description'
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                            /> 
                            <input
                                className='containerBox width--10 m-5'
                                placeholder='Category 1'
                                value={newTask.category}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                            />
                            <select
                                className='containerBox width--10 m-5'
                                value={newTask.recurrence}
                                onChange={e => setNewTask({ ...newTask, recurrence: e.target.value })}
                            >
                                <option value='One-Time'>One-Time</option>
                                <option value='Daily'>Daily</option>
                                <option value='Weekly'>Weekly</option>
                                <option value='Monthly'>Monthly</option>
                                <option value='Yearly'>Yearly</option>
                                <option value='Custom'>Custom</option>
                            </select>
                            <input
                                type='date'
                                className='containerBox width--10 m-5'
                                value={newTask.nextDue}
                                onChange={e => setNewTask({ ...newTask, nextDue: e.target.value })}
                            />
                            <button
                                className='containerDetail button bg-green color-lite m-5'
                                onClick={handleAddMasterTask}
                            >
                                ➕ Add Master Task
                            </button>
                        */}
                        </div>
                    }
                </div>
            </div>
            <div className='containerDetail mt-5 bg-lite'>
                {/* 
                    <div className='containerBox'>
                        <CollapseToggleButton
                            title={<span className='containerDetail color-yellow contentLeft'>🗂 Master Maintenance Tasks</span>}
                            isCollapsed={false}
                            setCollapse={() => { }}
                            align='left'
                        />
                    </div>
                */}
                <div className='containerDetail size20 pt-10 pb-10 pl-10'>
                    <CollapseToggleButton
                        title={<span className='color-yellow contentLeft'>🛠 Master Tasks</span>}
                        isCollapsed={masterTasksDisplay}
                        setCollapse={setMasterTasksDisplay}
                        align='left'
                    />
                </div>
                {   
                    (masterTasksDisplay)
                    ? null
                    : <div className='scrollHeight250'>
                        {masterTasks.length === 0 && (
                            <div className='containerDetail color-lite'>No master tasks yet.</div>
                        )}
                        {masterTasks.map((task, idx) => (
                            <div key={task.id || idx} className='containerBox bg-lite m-5 p-10'>
                                <div className='containerDetail'>
                                    <div className='containerBox color-yellow contentLeft'>{task.description}</div>
                                    <div className='ml-15 size15 contentLeft'>Recurs: {task.recurrence}</div>
                                    <div className='ml-15 size15 contentLeft'>Next Due: {task.nextDue}</div>
                                    <div className='ml-15 mb-10 size15 contentLeft'>{task.category}</div>
                                </div>
                                <div className='containerDetail flexContainer mt-5 mb-5 p-10'>
                                    <div
                                        className='containerDetail flex2Column button bg-lite w-40 color-lite mr-5 r-5'
                                        onClick={() => {
                                            setEditTaskIndex(idx);
                                            setEditTask({ ...task });
                                        }}
                                        title='edit'
                                    >
                                        ✏️
                                    </div>
                                    <div
                                        className='containerDetail flex2Column button w-40 bg-lite color-lite ml-5 r-5'
                                        onClick={() => deleteMasterTask(idx)}
                                        title='delete'
                                    >
                                        🗑️
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
                {editTaskIndex > -1 && editTask && (
                    <div className='modal-content containerBox bg-lite p-20'>
                        <div className='containerBox'>Edit Master Task</div>
                        <input
                            className='containerBox width--10 m-5'
                            value={editTask.description}
                            onChange={e => handleEditTaskChange('description', e.target.value)}
                            placeholder='Task Description'
                        />
                        <input
                            className='containerBox width--10 m-5'
                            value={editTask.category}
                            onChange={e => handleEditTaskChange('category', e.target.value)}
                            placeholder='Category 2'
                        />
                        <select
                            className='containerBox width--10 m-5'
                            value={editTask.recurrence}
                            onChange={e => handleEditTaskChange('recurrence', e.target.value)}
                        >
                            <option value='One-Time'>One-Time</option>
                            <option value='Daily'>Daily</option>
                            <option value='Weekly'>Weekly</option>
                            <option value='Monthly'>Monthly</option>
                            <option value='Yearly'>Yearly</option>
                            <option value='Custom'>Custom</option>
                        </select>
                        <input
                            type='date'
                            className='containerBox width--10 m-5'
                            value={editTask.nextDue}
                            onChange={e => handleEditTaskChange('nextDue', e.target.value)}
                        />
                        <div className='flexContainer'>
                            <button className='containerDetail button bg-green color-lite m-5' onClick={saveEditedMasterTask}>Save</button>
                            <button className='containerDetail button bg-lite color-dark m-5' onClick={cancelEditTask}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
            
            {editTaskIndex > -1 && editTask && (
                <div className='containerBox'>
                    <div className='modal-content containerBox bg-lite p-20'>
                        <div className='containerBox'>Edit Task</div>
                        <input
                            className='containerBox width--10 m-5'
                            value={editTask.description}
                            onChange={e => handleEditTaskChange('description', e.target.value)}
                            placeholder='Task Description'
                        />
                        <input
                            className='containerBox width--10 m-5'
                            value={editTask.category}
                            onChange={e => handleEditTaskChange('category', e.target.value)}
                            placeholder='Category 3'
                        />
                        <select
                            className='containerBox width--10 m-5'
                            value={editTask.recurrence}
                            onChange={e => handleEditTaskChange('recurrence', e.target.value)}
                        >
                            <option value='One-Time'>One-Time</option>
                            <option value='Daily'>Daily</option>
                            <option value='Weekly'>Weekly</option>
                            <option value='Monthly'>Monthly</option>
                            <option value='Yearly'>Yearly</option>
                            <option value='Custom'>Custom</option>
                        </select>
                        <input
                            type='date'
                            className='containerBox width--10 m-5'
                            value={editTask.nextDue}
                            onChange={e => handleEditTaskChange('nextDue', e.target.value)}
                        />
                        <div className='flexContainer'>
                            <button className='containerDetail button bg-green color-lite m-5' onClick={saveEditedTask}>Save</button>
                            <button className='containerDetail button bg-lite color-dark m-5' onClick={cancelEditTask}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;