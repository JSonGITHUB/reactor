import React, { useState, useEffect } from 'react';
import DropDown from '../forms/DropDown.js';
import thumbsUp from '../../assets/images/ThumbsUp.png';
import thumbsDown from '../../assets/images/ThumbsDown.png';

const ProjectTaskTracker = () => {

    const [projects, setProjects] = useState(JSON.parse(localStorage.getItem('projects')) || []);
    const [tracking, setTracking] = useState(localStorage.getItem('tracking') || 'tasks');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [newProjectDescription, setNewProjectDescription] = useState((tracking === 'sets') ? 'WAVES' : (tracking === 'solar/battery') ? 'Solar / Battery Log' : '');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [activeProjectIndex, setActiveProjectIndex] = useState(-1);

    const trackables = ['tasks', 'sets', 'events', 'solar/battery'];

    useEffect(() => {
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
            setProjects(JSON.parse(storedProjects));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);
    /*
        useEffect(() => {
            localStorage.setItem('tracking', tracking);
            console.log(`tracking: ${JSON.stringify(tracking,null,2)}`)
            if (tracking === 'sets') {
                setNewProjectDescription('WAVES');
                return (projects.length<1) ? handleAddProject(): null;
            }
        }, [tracking]);
    */
    useEffect(() => {
        localStorage.setItem('tracking', tracking);
        if (tracking === 'sets') {
            setNewProjectDescription('WAVES');
            const storedProjects = localStorage.getItem('projects');
            if (storedProjects) {
                const currentProjects = JSON.parse(storedProjects);
                if (currentProjects.length < 1) {
                    handleAddProject();
                }
            }
        }
        if (tracking === 'solar/battery') {
            setNewProjectDescription('Solar / Battery Log');
            const storedProjects = localStorage.getItem('projects');
            if (storedProjects) {
                const currentProjects = JSON.parse(storedProjects);
                if (currentProjects.length < 1) {
                    handleAddProject();
                }
            }
        }
    }, [tracking]);

    const handleDropdownChange = (event) => {
        setTracking(event.target.value);
    };

    const handleAddProject = () => {
        const project = {
            description: newProjectDescription,
            createdDate: new Date().toLocaleString(),
            startTime: new Date().getTime(),
            tasks: []
        };
        setProjects(prevProjects => [project, ...prevProjects]);
    };

    const addTask = (projectIndex) => {
        const taskDescription = (tracking !== 'solar/battery') 
            ? prompt('Enter task description:') 
            : null;
        const batteryDescription = (tracking === 'solar/battery') 
            ? prompt('Battery Type:') 
            : null;
        const batteryLevel = (tracking === 'solar/battery') 
            ? prompt('Battery Level:') 
            : null;
        const solarDescription = (tracking === 'solar/battery') 
            ? prompt('Solar Type:') 
            : null;
        const solarLogDescription = `${batteryDescription} + ${solarDescription}: ${batteryLevel}-100%`
        if (taskDescription || batteryDescription) {
            const session = {
                startDate: new Date().toLocaleString(),
                startTime: new Date().getTime(),
                endTime: '',
                endDate: '',
                totalTime: '',
                runningTime: '0s'
            }
            const sessions = [];
            sessions.push(session);
            const task = {
                startTime: new Date().getTime(),
                endTime: '',
                description: (tracking === 'tasks') ? taskDescription : solarLogDescription,
                sessions: sessions,
                isRunning: true,
                runningTime: '0s'
            };
            const updatedProjects = [...projects];
            updatedProjects[projectIndex].tasks.unshift(task);
            updatedProjects[projectIndex].isCollapsed = false;
            setProjects(updatedProjects);
        }
    };

    const addSet = (projectIndex) => {
        const updatedProjects = [...projects];
        const taskDescription = `Set ${updatedProjects[projectIndex].tasks.length + 1}`;
        if (taskDescription) {
            const session = {
                startDate: new Date().toLocaleString(),
                startTime: new Date().getTime(),
                endTime: '',
                endDate: '',
                totalTime: '',
                runningTime: '0s'
            }
            const sessions = [];
            sessions.push(session);
            const task = {
                startTime: new Date().getTime(),
                endTime: '',
                description: taskDescription,
                sessions: sessions,
                isRunning: true,
                runningTime: '0s'
            };
            updatedProjects[projectIndex].tasks.unshift(task);
            updatedProjects[projectIndex].isCollapsed = false;
            setProjects(updatedProjects);
        }
    };

    const handleAddTask = (projectIndex) => {
        const task = {
            description: newTaskDescription,
            startDate: new Date().toLocaleString(),
            startTime: new Date().getTime(),
            endTime: '',
            endDate: '',
            totalTime: '',
            runningTime: '0s',
            isRunning: true
        };
        const updatedProjects = [...projects];
        updatedProjects[activeProjectIndex].tasks.unshift(task);
        setProjects(updatedProjects);
        setNewTaskDescription('');
        setActiveProjectIndex(projectIndex)
    };

    const handleDeleteProject = (index) => {
        const updatedProjects = [...projects];
        updatedProjects.splice(index, 1);
        setProjects(updatedProjects);
    };

    const handleDeleteTask = (projectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        updatedProjects[projectIndex].tasks.splice(taskIndex, 1);
        setProjects(updatedProjects);
    };

    const handleStartTask = (projectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[projectIndex].tasks[taskIndex];
        task.sessions = task.sessions || [];
        task.isRunning = true;
        //task.startDate = new Date().toLocaleString();
        const session = {
            startDate: new Date().toLocaleString(),
            startTime: new Date().getTime(),
            endTime: ''
        }
        task.sessions.push(session)
        setProjects(updatedProjects);
        startTimer(projectIndex, taskIndex);
    };
    const addWave = (projectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[projectIndex].tasks[taskIndex];
        task.sessions = task.sessions || [];
        task.isRunning = false;
        //task.startDate = new Date().toLocaleString();
        const session = {
            startDate: new Date().toLocaleString(),
            startTime: new Date().getTime(),
            endTime: new Date().getTime(),
        }
        task.sessions.push(session)
        setProjects(updatedProjects);
    };
    const subtractWave = (projectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[projectIndex].tasks[taskIndex];
        task.sessions = task.sessions || [];
        task.isRunning = false;
        task.sessions.pop();
        setProjects(updatedProjects);
    };
    const getTotalTime = (totalTimeMilliseconds) => {
        let hours = Math.floor(totalTimeMilliseconds / 3600000);
        hours = (hours < 10) ? `0${hours}` : hours;
        let minutes = Math.floor((totalTimeMilliseconds % 3600000) / 60000);
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        let seconds = Math.floor((totalTimeMilliseconds % 60000) / 1000);
        seconds = (seconds < 10) ? `0${seconds}` : seconds;
        const totalTime = `${hours}:${minutes}:${seconds}`;
        return totalTime
    }
    const handleStopTask = (projectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[projectIndex].tasks[taskIndex];
        task.sessions = task.sessions || [];
        task.isRunning = false;
        const startTime = task.sessions[task.sessions.length - 1].startTime;
        const startDate = task.sessions[task.sessions.length - 1].startDate;
        const endTime = new Date().getTime();
        const endDate = new Date().toLocaleString();
        const totalTimeMilliseconds = Math.round(endTime - startTime);
        const totalTime = getTotalTime(totalTimeMilliseconds);
        let runningTime = task.sessions[task.sessions.length - 1].runningTime;
        runningTime = (runningTime === undefined) ? task.sessions[task.sessions.length - 2].runningTime : runningTime;
        //alert(`runningTime: ${runningTime}`)
        runningTime = (runningTime === '0s') ? totalTimeMilliseconds : (runningTime + totalTimeMilliseconds);
        const runningTimeDisplay = getTotalTime(runningTime);
        const session = {
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            totalTime: totalTime,
            runningTime: runningTime,
            runningTimeDisplay: runningTimeDisplay
        }
        //alert(JSON.stringify(session,null,2))
        task.runningTime = runningTime;
        task.runningTimeDisplay = runningTimeDisplay;
        task.sessions.push(session)
        setProjects(updatedProjects);
        stopTimer(projectIndex, taskIndex);
    };

    const startTimer = (projectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[projectIndex].tasks[taskIndex];
        const startTime = new Date().getTime();
        const session = task.sessions[task.sessions.length - 1]

        task.timerId = setInterval(() => {
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - startTime;
            const seconds = Math.floor(elapsedTime / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const timeString = `${(hours < 10) ? `0${hours}` : hours}:${((minutes % 60) < 10) ? `0${(minutes % 60)}` : (minutes % 60)}:${((seconds % 60) < 10) ? `0${(seconds % 60)}` : (seconds % 60)}`;
            //task.runningTime = timeString;
            //task.runningTimeDisplay = timeString;
            //session.runningTime = timeString;
            //session.runningTimeDisplay = timeString;
            setProjects(updatedProjects);
        }, 1000);
    };

    const stopTimer = (projectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[projectIndex].tasks[taskIndex];
        const session = task.sessions[task.sessions.length - 1]
        clearInterval(task.timerId);
        task.sessions.splice((task.sessions.length - 2), 1);
        task.totalTime = task.totalTime + session.runningTime;
        setProjects(updatedProjects);
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };
    const handleProjectToggle = (projectIndex) => {
        //setIsCollapsed(!isCollapsed);
        const updatedProjects = [...projects];
        const project = updatedProjects[projectIndex];
        project.isCollapsed = !project.isCollapsed;

        setProjects(updatedProjects);
        return (!project.isCollapsed) ? setIsCollapsed(false) : null;
    };

    const getProjectTime = (project) => {
        let projectTotal = 0;
        project.tasks.forEach((task) => {
            console.log(`${project.description} task: ${getTotalTime(task.runningTime)}`)
            projectTotal += task.runningTime;
        });
        project.totalTime = projectTotal;
        console.log(`getProjectTime => ${project.description}: ${getTotalTime(projectTotal)}`)
        return projectTotal;
    };


    return (
        <div>
            <div className='color-dark'>
                <DropDown
                    value={tracking}
                    options={trackables}
                    onChange={handleDropdownChange}
                />
            </div>
            <h2>Project Task Tracker</h2>
            <button onClick={handleToggleCollapse}>{isCollapsed ? 'Expand All' : 'Collapse All'}</button>
            <br />
            <br />
            {(tracking === 'tasks') ?
                <React.Fragment>
                    <div>
                        <h3>Add Project</h3>
                        <input
                            type="text"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddProject();
                                }
                            }}
                        />

                        <button onClick={handleAddProject}>Add Project</button>
                    </div>
                    <br />
                    <div>
                        <h3>Projects</h3>
                        {projects.map((project, projectIndex) => (
                            <div key={projectIndex} className='r-10 bg-darker m-5 p-10'>
                                <div className='r-10 bg-black m-5 p-10'>
                                    <div className='greet bold color-yellow'>{project.description}</div>
                                    <div className='copyright color-light'>{project.createdDate} Time: {getTotalTime(getProjectTime(project))}</div>
                                    <button onClick={() => addTask(projectIndex)}>
                                        Add Task
                                    </button>
                                    <button onClick={() => handleDeleteProject(projectIndex)}>
                                        Delete Project
                                    </button>
                                    <button onClick={() => handleProjectToggle(projectIndex)}>
                                        {project.isCollapsed ? 'Expand' : 'Collapse'}
                                    </button>
                                </div>
                                <div className='color-green bold'>{(isCollapsed || project.isCollapsed) ? '' : `${project.description} Task List:`}</div>
                                <div>
                                    {(isCollapsed || project.isCollapsed) ? null : project.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className='bg-black m-5 p-10 lowerBorder'>
                                            <div className='p-10 r-10 m-10 bg-dark'>
                                                <div>{task.description}</div>
                                                <div>{task.sessions.length} Total: {task.runningTimeDisplay} </div>
                                            </div>
                                            <div className='p-10 r-10 m-10 bg-dark'>
                                                {task.sessions.map((session, sessionIndex) => (
                                                    <div className='copyright color-light'>{session.startDate} - {String(session.endDate).split(', ')[1]} {session.totalTime}
                                                    </div>
                                                ))}
                                            </div>
                                            {task.isRunning ? (
                                                <button onClick={() => handleStopTask(projectIndex, taskIndex)}>
                                                    Stop
                                                </button>
                                            ) : (
                                                <button onClick={() => handleStartTask(projectIndex, taskIndex)}>
                                                    Start
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteTask(projectIndex, taskIndex)}>
                                                Delete Task
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
                : <React.Fragment></React.Fragment>}
            
            {(tracking === 'solar/battery') ?
                <React.Fragment>
                    <div>
                        <h3>Solar/Battery Log</h3>
                        <input
                            type="text"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddProject();
                                }
                            }}
                        />

                        <button onClick={handleAddProject}>Add Project</button>
                    </div>
                    <br />
                    <div>
                        <h3>Projects</h3>
                        {projects.map((project, projectIndex) => (
                            <div key={projectIndex} className='r-10 bg-darker m-5 p-10'>
                                <div className='r-10 bg-black m-5 p-10'>
                                    <div className='greet bold color-yellow'>{project.description}</div>
                                    <div className='copyright color-light'>{project.createdDate} Time: {getTotalTime(getProjectTime(project))}</div>
                                    <button onClick={() => addTask(projectIndex)}>
                                        Add Task
                                    </button>
                                    <button onClick={() => handleDeleteProject(projectIndex)}>
                                        Delete Project
                                    </button>
                                    <button onClick={() => handleProjectToggle(projectIndex)}>
                                        {project.isCollapsed ? 'Expand' : 'Collapse'}
                                    </button>
                                </div>
                                <div className='color-green bold'>{(isCollapsed || project.isCollapsed) ? '' : `${project.description} Task List:`}</div>
                                <div>
                                    {(isCollapsed || project.isCollapsed) ? null : project.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className='bg-black m-5 p-10 lowerBorder'>
                                            <div className='p-10 r-10 m-10 bg-dark'>
                                                <div>{task.description}</div>
                                                <div>{task.sessions.length} Total: {task.runningTimeDisplay} </div>
                                            </div>
                                            <div className='p-10 r-10 m-10 bg-dark'>
                                                {task.sessions.map((session, sessionIndex) => (
                                                    <div className='copyright color-light'>{session.startDate} - {String(session.endDate).split(', ')[1]} {session.totalTime}
                                                    </div>
                                                ))}
                                            </div>
                                            {task.isRunning ? (
                                                <button onClick={() => handleStopTask(projectIndex, taskIndex)}>
                                                    Stop
                                                </button>
                                            ) : (
                                                <button onClick={() => handleStartTask(projectIndex, taskIndex)}>
                                                    Start
                                                </button>
                                            )}
                                            <button onClick={() => handleDeleteTask(projectIndex, taskIndex)}>
                                                Delete Task
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
                : <React.Fragment></React.Fragment>
            }

            {(tracking === 'sets') ?
                <React.Fragment>
                    <div>
                        <h3>Track Sets</h3>
                    </div>
                    <br />
                    <div>
                        {projects.map((project, projectIndex) => (
                            <div key={projectIndex} className='r-10 bg-darker m-5 p-10'>
                                <div className='r-10 bg-black m-5 p-10'>
                                    <div className='greet bold color-yellow'>{project.description}</div>
                                    <div className='copyright color-light'>{project.createdDate} Time: {getTotalTime(getProjectTime(project))}</div>
                                    <button onClick={() => addSet(projectIndex)}>
                                        Add Set
                                    </button>
                                    <button onClick={() => handleDeleteProject(projectIndex)}>
                                        Delete Log
                                    </button>
                                </div>
                                <div className='color-green bold'>{(isCollapsed || project.isCollapsed) ? '' : `${project.description} Task List:`}</div>
                                <div>
                                    {(isCollapsed || project.isCollapsed) ? null : project.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className='bg-black m-5 p-10 lowerBorder'>
                                            <div className='p-10 r-10 m-10 bg-dark'>
                                                <div>{task.description}</div>
                                                <div>Waves: {task.sessions.length}</div>
                                            </div>
                                            <React.Fragment>
                                                <button onClick={() => addWave(projectIndex, taskIndex)}>
                                                    Wave +
                                                </button>
                                                <button onClick={() => subtractWave(projectIndex, taskIndex)}>
                                                    Wave -
                                                </button>
                                            </React.Fragment>
                                            <button onClick={() => handleDeleteTask(projectIndex, taskIndex)}>
                                                Delete Set
                                            </button>
                                            <div className='p-10 r-10 m-10 bg-dark'>
                                                {task.sessions.map((session, sessionIndex) => (
                                                    <div className='copyright color-light p-10'>
                                                        <div className="button" onClick={() => task.sessions[sessionIndex].isLiked = !task.sessions[sessionIndex].isLiked}>
                                                            <span className='mr-5'>{String(session.startDate).split(', ')[1]}  - Wave {sessionIndex + 1}</span>
                                                            <img src={(task.sessions[sessionIndex].isLiked) ? thumbsUp : thumbsDown} alt='like' className='shaka mb--10' />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
                : <React.Fragment></React.Fragment>}
        </div>
    );
};

export default ProjectTaskTracker;
