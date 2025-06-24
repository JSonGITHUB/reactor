import React, { useState, useEffect } from 'react';

const TodoApp = () => {

    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        setTasks(savedTasks);
    }, []);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (newTask.trim() === '') return;
        setTasks([...tasks, { text: newTask, completed: false }]);
        setNewTask('');
    };

    const deleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    const toggleCompletion = (index) => {
        const updatedTasks = tasks.map((task, i) =>
            i === index ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
    };

    return (
        <div>
            <h1>To-Do List</h1>
            <input
                id='task'
                name='task'
                type='text'
                placeholder='Add a new task'
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
            />
            <button onClick={addTask}>Add Task</button>
            <div>
                {tasks.map((task, index) => (
                    <div key={index} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                        <input
                            id='taskStatus'
                            name='taskStatus'
                            type='checkbox'
                            checked={task.completed}
                            onChange={() => toggleCompletion(index)}
                        />
                        {task.text}
                        <button onClick={() => deleteTask(index)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoApp;