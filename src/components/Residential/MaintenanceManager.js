import React, { useState } from 'react';

const MaintenanceManager = ({ tasks, setTasks }) => {
    
    const [newTask, setNewTask] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [recurrence, setRecurrence] = useState(''); // e.g., 'Daily', 'Weekly'
    const [searchTerm, setSearchTerm] = useState(''); // filter by task text
    const [filterCompleted, setFilterCompleted] = useState(''); // All / Completed / Pending


    const handleAddTask = () => {
        if (!newTask.trim()) return;
        const updatedTasks = [
            ...tasks,
            { task: newTask.trim(), dueDate, completed: false },
        ];
        setTasks(updatedTasks);
        setNewTask('');
        setDueDate('');
    };

    const toggleCompleted = (index) => {
        const updatedTasks = [...tasks];
        updatedTasks[index].completed = !updatedTasks[index].completed;
        setTasks(updatedTasks);
    };

    const handleRemoveTask = (index) => {
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);
    };

    return (
        <div className='mt--10'>
            <div className='containerDetail p-10 m-5'>
                <input
                    type='text'
                    placeholder='Task description'
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className='containerBox width--10'
                />
                <input
                    type='date'
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className='containerBox width--10'
                />
                <div
                    onClick={handleAddTask}
                    className='containerBox button bg-blue width--10'
                >
                    Add
                </div>
            </div>

            <ul>
                {tasks.map((task, index) => (
                    <li
                        key={index}
                        className='flex justify-between items-center border-b py-1'
                    >
                        <span
                            className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''
                                }`}
                        >
                            {task.task} {task.dueDate ? `(${task.dueDate})` : ''}
                        </span>
                        <button
                            onClick={() => toggleCompleted(index)}
                            className='text-blue-600 mr-2'
                        >
                            {task.completed ? 'Undo' : 'Done'}
                        </button>
                        <button
                            onClick={() => handleRemoveTask(index)}
                            className='text-red-600'
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MaintenanceManager;