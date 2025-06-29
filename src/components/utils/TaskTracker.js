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
    const capitalizeString = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const getCategory = (category) => {
        let label = capitalizeString(category);
        if (label.endsWith('s')) {
            label =  capitalizeString(label).slice(0, -1);
        }
        return label;
    }

    return <div className='mt--30'>
                <div className='bg-tintedMedium p-10 r-10 m-10'>
                    <div className='flexContainer bg-tinted r-10 m-10 p-10'>
                        <div className='flex2Column columnRightAlign size20 r-5 bold color-soft'>
                            Tracking:
                        </div>
                        <div className='flex2Column size20 columnLeftAlign width-50-percent color-lite '>
                            <DropDown
                                value={tracking}
                                options={trackables}
                                onChange={handleDropdownChange}
                            />
                        </div>
                    </div>
                    <div className='bg-tinted p-10 r-10 m-10'>
                        <input
                            className='p-10 r-5 m-5 flex2Column size25 bold bg-dark color-lite'
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
                        <button className='bold p-10 r-5 m-5 flex2Column bg-green color-light size20' onClick={handleAddProject}>
                            Add {getCategory(tracking)}
                        </button>
                    </div>
                </div>
                <div className='bg-tinted r-10 m-5 p-10 m-10'>
                    <div className='bg-tinted p-10 r-10 m-10'>
                        <button className='p-10 r-5 m-5 flex3Column size20 color-lite bg-lite bold' onClick={handleToggleCollapse}>
                            {isCollapsed ? 'Expand All' : 'Collapse All'}
                        </button>
                    </div>
                    <div className='bg-tinted p-10 r-10 m-10'>
                        {(tracking === 'tasks') ?
                            <React.Fragment>
                                <div>
                                    {projects.map((project, projectIndex) => (
                                        <div key={projectIndex} className='r-10 bg-darker m-5 p-10'>
                                            <div className='r-10 bg-tinted m-5 p-10'>
                                                <div className='bold color-neogreen size25 m-10'>{project.description}</div>
                                                <div className='color-lite size15 bold p-10 bg-tinted r-10'>{project.createdDate} Time: {getTotalTime(getProjectTime(project))}</div>
                                                <button className='p-10 r-5 m-5 flex3Column size15 color-lite bg-lite bold' onClick={() => addTask(projectIndex)}>
                                                    Add Task
                                                </button>
                                                <button className='p-10 r-5 m-5 flex3Column size15 color-lite bg-lite bold' onClick={() => handleDeleteProject(projectIndex)}>
                                                    Delete Project
                                                </button>
                                                <button className='p-10 r-5 m-5 flex3Column size15 color-lite bg-lite bold' onClick={() => handleProjectToggle(projectIndex)}>
                                                    {project.isCollapsed ? 'Expand' : 'Collapse'}
                                                </button>
                                            </div>
                                            <div className='color-lite size15 m-5 bold p-10 bg-tintedMedium r-10'>{(isCollapsed || project.isCollapsed) ? '' : `${project.description} Tasks:`}</div>
                                            <div>
                                                {(isCollapsed || project.isCollapsed) ? null : project.tasks.map((task, taskIndex) => (
                                                    <div key={taskIndex} className='bg-tinted r-10 m-5 p-5 lowerBorder'>
                                                        <div className='p-10 r-10 ml-5 mr-5 mb-5 mt-5 bg-tinted'>
                                                            <div className='bold color-yellow'>{task.description}</div>
                                                            <div>{task.sessions.length} Total: {task.runningTimeDisplay} </div>
                                                        </div>
                                                        <div className='p-10 r-10 ml-5 mr-5 bg-tinted'>
                                                            {task.sessions.map((session, sessionIndex) => (
                                                                <div className='description color-lite'>{session.startDate} - {String(session.endDate).split(', ')[1]} {session.totalTime}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {task.isRunning ? (
                                                            <button className='p-10 r-5 m-5 flex3Column size15 color-lite bg-lite bold' onClick={() => handleStopTask(projectIndex, taskIndex)}>
                                                                Stop
                                                            </button>
                                                        ) : (
                                                            <button className='p-10 r-5 m-5 flex3Column size15 color-lite bg-lite bold' onClick={() => handleStartTask(projectIndex, taskIndex)}>
                                                                Start
                                                            </button>
                                                        )}
                                                        <button className='p-10 r-5 m-5 flex3Column size15 color-lite bg-lite bold' onClick={() => handleDeleteTask(projectIndex, taskIndex)}>
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
                                        className='p-10 r-5 m-5'
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

                                    <button className='p-10 r-5 m-5' onClick={handleAddProject}>Add Project</button>
                                </div>
                                <br />
                                <div>
                                    {projects.map((project, projectIndex) => (
                                        <div key={projectIndex} className='r-10 bg-darker m-5 p-10'>
                                            <div className='r-10 bg-black m-5 p-10'>
                                                <div className='greet bold color-neogreen'>{project.description}</div>
                                                <div className='description color-lite'>{project.createdDate} Time: {getTotalTime(getProjectTime(project))}</div>
                                                <button className='p-10 r-5 m-5' onClick={() => addTask(projectIndex)}>
                                                    Add Task
                                                </button>
                                                <button className='p-10 r-5 m-5' onClick={() => handleDeleteProject(projectIndex)}>
                                                    Delete Project
                                                </button>
                                                <button className='p-10 r-5 m-5' onClick={() => handleProjectToggle(projectIndex)}>
                                                    {project.isCollapsed ? 'Expand' : 'Collapse'}
                                                </button>
                                            </div>
                                            <div>
                                                {(isCollapsed || project.isCollapsed) ? null : project.tasks.map((task, taskIndex) => (
                                                    <div key={taskIndex} className='bg-black m-5 p-10 lowerBorder'>
                                                        <div className='p-10 r-10 m-10 bg-dark'>
                                                            <div className='bold color-yellow'>{task.description}</div>
                                                            <div>{task.sessions.length} Total: {task.runningTimeDisplay} </div>
                                                        </div>
                                                        <div className='p-10 r-10 m-10 bg-dark'>
                                                            {task.sessions.map((session, sessionIndex) => (
                                                                <div className='description color-lite'>{session.startDate} - {String(session.endDate).split(', ')[1]} {session.totalTime}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {task.isRunning ? (
                                                            <button className='p-10 r-5 m-5' onClick={() => handleStopTask(projectIndex, taskIndex)}>
                                                                Stop
                                                            </button>
                                                        ) : (
                                                            <button className='p-10 r-5 m-5' onClick={() => handleStartTask(projectIndex, taskIndex)}>
                                                                Start
                                                            </button>
                                                        )}
                                                        <button className='p-10 r-5 m-5' onClick={() => handleDeleteTask(projectIndex, taskIndex)}>
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
                                                <div className='greet bold color-neogreen'>{project.description}</div>
                                                <div className='description color-lite'>{project.createdDate} Time: {getTotalTime(getProjectTime(project))}</div>
                                                <button className='p-10 r-5 m-5' onClick={() => addSet(projectIndex)}>
                                                    Add Set
                                                </button>
                                                <button className='p-10 r-5 m-5' onClick={() => handleDeleteProject(projectIndex)}>
                                                    Delete Log
                                                </button>
                                            </div>
                                            <div className='color-neogreen bold'>{(isCollapsed || project.isCollapsed) ? '' : `${project.description} Task List:`}</div>
                                            <div>
                                                {(isCollapsed || project.isCollapsed) ? null : project.tasks.map((task, taskIndex) => (
                                                    <div key={taskIndex} className='bg-black m-5 p-10 lowerBorder'>
                                                        <div className='p-10 r-10 m-10 bg-dark'>
                                                            <div className='bold color-yellow'>{task.description}</div>
                                                            <div>Waves: {task.sessions.length}</div>
                                                        </div>
                                                        <React.Fragment>
                                                            <button className='p-10 r-5 m-5' onClick={() => addWave(projectIndex, taskIndex)}>
                                                                Wave +
                                                            </button>
                                                            <button className='p-10 r-5 m-5' onClick={() => subtractWave(projectIndex, taskIndex)}>
                                                                Wave -
                                                            </button>
                                                        </React.Fragment>
                                                        <button className='p-10 r-5 m-5' onClick={() => handleDeleteTask(projectIndex, taskIndex)}>
                                                            Delete Set
                                                        </button>
                                                        <div className='p-10 r-10 m-10 bg-dark'>
                                                            {task.sessions.map((session, sessionIndex) => (
                                                                <div className='description color-lite p-10'>
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
                </div>
            </div>
};

export default ProjectTaskTracker;
