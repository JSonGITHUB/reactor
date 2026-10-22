import React, { useState, useEffect } from 'react';
//import InventoryManager from './InventoryManager';
//import MaintenanceManager from './MaintenanceManager';
import Dashboard from './Dashboard'; 

const HOUSE_FOCUS_TASK_KEY = 'houseFocusTaskKey';

const getStoredMaintenanceTasks = () => {
    try {
        const futureStored = localStorage.getItem('futureMaintenanceTasks');
        const parsedFuture = futureStored ? JSON.parse(futureStored) : [];
        if (Array.isArray(parsedFuture) && parsedFuture.length > 0) {
            return parsedFuture;
        }
        const stored = localStorage.getItem('maintenanceTasks');
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

const makeTaskKey = (task) => `${task.description || ''}|${task.nextDue || ''}`;

export default function HomeManager() {
    // Load initial state from localStorage (or use defaults)
    const [inventory] = useState(() => {
        const stored = localStorage.getItem('inventory');
        return stored ? JSON.parse(stored) : [];
    });

    const [tasks] = useState(() => {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    });
    const [maintenanceTasks, setMaintenanceTasks] = useState(getStoredMaintenanceTasks);

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        const syncMaintenance = () => setMaintenanceTasks(getStoredMaintenanceTasks());
        syncMaintenance();
        window.addEventListener('focus', syncMaintenance);
        window.addEventListener('storage', syncMaintenance);
        return () => {
            window.removeEventListener('focus', syncMaintenance);
            window.removeEventListener('storage', syncMaintenance);
        };
    }, []);

    const today = new Date().toISOString().slice(0, 10);
    const pending = maintenanceTasks
        .filter((task) => task && !task.completed && task.description)
        .sort((left, right) => new Date(left.nextDue || today) - new Date(right.nextDue || today));
    const nextTask = pending.find((task) => (task.nextDue || today) >= today) || pending[0] || null;

    const openNextTask = () => {
        if (!nextTask) return;
        localStorage.setItem(HOUSE_FOCUS_TASK_KEY, makeTaskKey(nextTask));
        window.dispatchEvent(new Event('house-focus-task'));
    };

    return (
        <div className='containerDetail ml-5 mr-5 bg-lite mt--25'>
            <div className='containerDetail bg-lite color-yellow size20 p-20 contentLeft'>
                🏡 Home Manager
            </div>
            <div
                title='Open next House item'
                className='containerDetail button bg-dark color-lite p-10 m-5 contentCenter'
                onClick={openNextTask}
            >
                <div className='flexContainer'>
                    <div className='flexColumn'>
                        🏡
                    </div>
                    <div className='flexColumn copyright ml-10'>
                        {
                            nextTask
                                ? `${nextTask.nextDue || 'No date'} • ${nextTask.description}`
                                : 'No upcoming house items'
                        }
                    </div>
                </div>
            </div>
            <Dashboard inventory={inventory} tasks={tasks} />
            {/*
                <InventoryManager inventory={inventory} setInventory={setInventory} />
                <MaintenanceManager tasks={tasks} setTasks={setTasks} />
            */}
        </div>
    );
}