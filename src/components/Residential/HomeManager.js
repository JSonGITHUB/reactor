import React, { useState, useEffect } from 'react';
//import InventoryManager from './InventoryManager';
//import MaintenanceManager from './MaintenanceManager';
import Dashboard from './Dashboard'; 

export default function HomeManager() {
    // Load initial state from localStorage (or use defaults)
    const [inventory, setInventory] = useState(() => {
        const stored = localStorage.getItem('inventory');
        return stored ? JSON.parse(stored) : [];
    });

    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    return (
        <div className='containerDetail ml-5 mr-5 bg-lite mt--25'>
            <div className='containerDetail bg-lite color-yellow size20 p-20 contentLeft'>
                🏡 Home Manager
            </div>
            <Dashboard inventory={inventory} tasks={tasks} />
            {/*
                <InventoryManager inventory={inventory} setInventory={setInventory} />
                <MaintenanceManager tasks={tasks} setTasks={setTasks} />
            */}
        </div>
    );
}