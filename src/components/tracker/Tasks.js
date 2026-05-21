import React, { useState, useEffect } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackTasks from './TrackTasks';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initProjects from './initProjects';
import initTasks from './initTasks';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';

const Tasks = () => {

    const [projects, setProjects] = useState(initializeData('projects', initProjects));
    const [tasks, setTasks] = useState(initializeData('taskTracking', initTasks));
    const [newProjectDescription, setNewProjectDescription] = useState('');

    const trackingMap = {
        'projects': [projects, setProjects],
        'tasks': [tasks, setTasks],
    };

    useEffect(() => {
        if (projects === null) setProjects(initProjects);
        if (tasks === null) setTasks(initTasks);
    }, [projects, tasks]);

    useEffect(() => {
        if (projects !== undefined || projects !== '') {
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }, [projects]);

    useEffect(() => {
        if (tasks !== undefined || tasks !== '') {
            localStorage.setItem('taskTracking', JSON.stringify(tasks));
        }
    }, [tasks]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('WorkOutSearch', searchTerm);
            setTasks((prevTasks) => {
                if (prevTasks === undefined) {
                    return prevTasks;
                }
                const inTaskGoupDescription = (taskGroup) => {
                    const result = taskGroup.description.toLowerCase().includes(searchTerm);
                    return result;
                };
                const inTaskDescription = (task) => {
                    const result = task.description.toLowerCase().includes(searchTerm);
                    return result;
                };
                const inTaskSessionDescription = (task) => {
                    if (task.sessions && task.sessions.length > 0) {
                        return task.sessions.some(
                            (session) =>
                                session.description &&
                                session.description.toLowerCase().includes(searchTerm)
                        );
                    }
                    return false;
                };
                const category = localStorage.getItem('tasksCategory') || 'all';
                const filteredTasks = prevTasks.map((taskGroup) => {
                    const nextTaskGroup = {
                        ...taskGroup,
                        tasks: taskGroup.tasks.map((task) => ({ ...task })),
                        display: inTaskGoupDescription(taskGroup)
                    };
                    nextTaskGroup.tasks.forEach((task) => {
                        if ((inTaskGoupDescription(taskGroup) || inTaskDescription(task) || inTaskSessionDescription(task) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) && (category === 'all' || taskGroup.category === category)) {
                            task.display = true;
                            nextTaskGroup.display = true;
                        }
                    });
                    return nextTaskGroup;
                });
                return filteredTasks;
            });
        }
    }, [newProjectDescription]);

    const addProject = () => {
        const startExpandedInTaskView = true;
        const project = {
            description: newProjectDescription,
            createdDate: currentDate(),
            startTime: currentTime(),
            tasks: [],
            journals: [],
            totalTime: 0,
            isCollapsed: startExpandedInTaskView
        };
        if (trackingMap.hasOwnProperty('tasks')) {
            trackingMap['tasks'][1](prev => [project, ...prev]);
        }
        setNewProjectDescription('');
    };

    const deleteProject = (index) => {
        let updatedTrackingData = [...projects];
        if (trackingMap.hasOwnProperty('tasks')) {
            updatedTrackingData = [...trackingMap['tasks'][0]];
            updatedTrackingData.splice(index, 1);
            trackingMap['tasks'][1](updatedTrackingData);
        }
    };

    return <div className='mt--30'>
        <div className='containerDetail color-lite bg-lite m-5 p-22 size30 contentLeft'>
            <span className='size40 m-5'>{icons.tasks}</span> Tasks
        </div>
        <div className='pt-5'>
            {
                <AddProjectInterface
                    newProjectDescription={newProjectDescription}
                    setNewProjectDescription={setNewProjectDescription}
                    addProject={addProject}
                    tracking={'tasks'}
                />
            }
        </div>
        <div className=''>
            <TrackTasks
                tracking={'tasks'}
                tasks={tasks}
                setTasks={setTasks}
                deleteProject={deleteProject}
            />
        </div>
    </div>
};

export default Tasks