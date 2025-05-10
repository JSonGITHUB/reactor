import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import getKey from '../utils/KeyGenerator';
import getTotalTime from '../utils/getTotalTime';
import initSession from './initSession';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';

const Task = ({

    projects,
    setProjects,
    taskIndex,
    task,
    projectIndex,
    getProjectTotalTime,
    tracking

}) => {

    const [collapse, setCollapse] = useState(task.isCollapsed || false);
    const getTaskTotalTime = (task) => task.sessions.reduce((total, session) => total + session.runningTime, 0);

    useEffect(() => {

        const newProjects = [...projects];
        newProjects[projectIndex].tasks[taskIndex].isCollapsed = collapse;

        let dataToString = JSON.stringify(newProjects);
        if (tracking === 'projects') {
            localStorage.setItem('projects', dataToString);
        } else {
            localStorage.setItem('taskTracking', dataToString);
        }
    }, [collapse]);

    const isValidFormat = (inputString) => {
        const regex = /^\d{2}:\d{2}:\d{2}$/
        return regex.test(inputString);
    }

    const toggleEditSessionTime = (sessionIndex) => {
        const newProjects = [...projects];
        const ogTime = projects[projectIndex].tasks[taskIndex].sessions[sessionIndex].totalTime;
        const selectedSession = newProjects[projectIndex].tasks[taskIndex].sessions[sessionIndex];
        selectedSession.totalTime = prompt('Edit time:', ogTime) || ogTime;
        if (String(selectedSession.totalTime) !== ogTime) {
            if (isValidFormat(String(selectedSession.totalTime))) {
                setProjects(newProjects);
            }
        }
    }

    const getTaskTotalDisplay = (task) => {
        if (task.runningTimeDisplay && task.runningTimeDisplay !== '') {
            return task.runningTimeDisplay;
        }
        return '';
    }
    const stopTimer = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        clearInterval(updatedProjects[taskProjectIndex].tasks[taskIndex].timerId);
        updatedProjects[taskProjectIndex].tasks[taskIndex].sessions.splice((updatedProjects[taskProjectIndex].tasks[taskIndex].sessions.length - 2), 1);

        const taskTotalTime = getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[taskIndex]);
        updatedProjects[taskProjectIndex].tasks[taskIndex].runningTimeDisplay = getTotalTime(taskTotalTime);
        updatedProjects[taskProjectIndex].tasks[taskIndex].totalTime = taskTotalTime;
        updatedProjects.map((project, projectIndex) => {
            //project.totalTime = getProjectTotalTime(project);
            return {
                ...project,
                totalTime: getProjectTotalTime(project)
            };
        })

        //alert(`stopTimer => ${updatedProjects[taskProjectIndex].description} totalTime: ${updatedProjects[taskProjectIndex].totalTime} taskTotalTime: ${updatedProjects[taskProjectIndex].tasks[taskIndex].totalTime}`)
        setProjects(updatedProjects);
    };

    const handleStopTask = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const project = updatedProjects[taskProjectIndex];
        const task = project.tasks[taskIndex];
        task.sessions = task.sessions ?? [];
        task.isRunning = false;
        const startTime = task.sessions[task.sessions.length - 1].startTime;
        const startDate = task.sessions[task.sessions.length - 1].startDate;
        const endTime = currentTime();
        const endDate = currentDate();

        let runningTime = task.sessions[task.sessions.length - 1].runningTime;
        //runningTime = (runningTime === undefined)
        runningTime = (validate(runningTime) === null)
            ? task.sessions[task.sessions.length - 2].runningTime
            : runningTime;
        const session = initSession(
            startDate,
            startTime,
            endDate,
            endTime,
            runningTime
        )
        task.runningTime = runningTime;
        task.sessions.push(session);
        const taskTotalTime = getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[taskIndex]);
        task.runningTimeDisplay = getTotalTime(taskTotalTime);
        task.totalTime = taskTotalTime;
        console.log(`handleStopTask => Project total time: ${updatedProjects[taskProjectIndex].totalTime}`);
        console.log(`handleStopTask => Project total time: ${getTotalTime(updatedProjects[taskProjectIndex].totalTime)}`);
        console.log(`handleStopTask => taskTotalTime: ${taskTotalTime}`);
        console.log(`handleStopTask => taskTotalTime: ${getTotalTime(taskTotalTime)}`);
        let projectTotalTime = 0;
        let index = 0
        updatedProjects[taskProjectIndex].tasks.forEach((task) => {
            projectTotalTime += getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[index])
            index++
        });
        console.log(`handleStopTask => projectTotalTime: ${getTotalTime(projectTotalTime)}`);
        updatedProjects[taskProjectIndex].totalTime = projectTotalTime;
        /* updatedProjects.map((project) => {
            const newProjectTotal = project.totalTime + taskTotalTime;
            console.log(`Task => handleStopTask => project: ${project.description} totalTime: ${newProjectTotal}`);
            return {
                ...project,
                totalTime: newProjectTotal
                //totalTime: getProjectTotalTime(project)
            };
        }) */
        setProjects(updatedProjects);
        stopTimer(taskProjectIndex, taskIndex);
    };
    const handleDeleteSession = (projectIndex, taskIndex, sessionIndex) => {
        const updatedProjects = [...projects];
        const project = updatedProjects[projectIndex];
        const task = project.tasks[taskIndex];
        task.sessions.splice(sessionIndex, 1);
        const taskTotalTime = getTaskTotalTime(updatedProjects[projectIndex].tasks[taskIndex]);
        task.runningTimeDisplay = getTotalTime(taskTotalTime);
        task.totalTime = taskTotalTime;
        //const projectTotalTime = getProjectTotalTime(projectIndex);
        //project.totalTime = getTotalTime(projectTotalTime);
        //project.totalTime = projectTotalTime;
        //alert(`${project.description} totalTime: ${updatedProjects[projectIndex].totalTime}`)
        updatedProjects.map((project, projectIndex) => {
            return {
                ...project,
                totalTime: getProjectTotalTime(project)
            };
        })
        setProjects(updatedProjects);
    };
    function formatDurationTime(milliseconds) {
        // Ensure the input is a non-negative number
        milliseconds = Math.max(0, milliseconds);

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

        // Format the result as HH:MM:SS
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return formattedTime;
    }
    const startTimer = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[taskProjectIndex].tasks[taskIndex];

        task.timerId = setInterval(() => {
            updatedProjects.map((project, projectIndex) => {
                return {
                    ...project,
                    totalTime: getProjectTotalTime(project)
                };
            });
            setProjects(updatedProjects);
        }, 1000);
    };
    const handleStartTask = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[taskProjectIndex].tasks[taskIndex];
        task.sessions = task.sessions ?? [];
        task.isRunning = true;
        //task.startDate = currentDate();
        task.sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0))
        updatedProjects.map((project, projectIndex) => {
            return {
                ...project,
                totalTime: getProjectTotalTime(project)
            };
        })
        setProjects(updatedProjects);
        startTimer(taskProjectIndex, taskIndex);
    };
    const handleDeleteTask = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const project = updatedProjects[taskProjectIndex];
        project.tasks.splice(taskIndex, 1);
        updatedProjects.map((project, projectIndex) => {
            return {
                ...project,
                totalTime: getProjectTotalTime(project)
            };
        })
        setProjects(updatedProjects);
    };

    const getTime = (date) => {
        const newDate = String(date).split(', ')[1].replace(' ', '');
        const timeArray = newDate.split(':');
        const hours = timeArray[0];
        const minutes = timeArray[1];
        const timeOfDay = timeArray[2].substring(2, 4);
        return `${hours}:${minutes}${timeOfDay}`
    }

    return <div key={getKey(`${task.description}${taskIndex}`)} className=''>
        <div className='containerBox'>
            <div className='centerVertical'>
                <div className='containerDetail color-yellow bg-tinted p-20'>
                    <CollapseToggleButton
                        title={`${task.description}`}
                        isCollapsed={collapse}
                        setCollapse={setCollapse}
                        align='left'
                    />
                </div>
            </div>
            <div className='containerBox flexContainer bg-transparent'>
                <div className='flex2Column color-lite contentLeft pl-10'>
                    {getTaskTotalDisplay(task)}
                </div>
                <div className='flex2Column color-lite contentRight pr-10'>
                    {task.sessions.length} Session{(task.sessions.length > 1) ? 's' : ''}
                </div>
            </div>
        </div>
        {
            (collapse)
            ? null
            : <div className='containerBox flexContainer'>
                {
                    task.isRunning
                    ? <div
                        title='stop'
                        className='containerBox flex2Column bg-lite button m-5'
                        onClick={() => handleStopTask(projectIndex, taskIndex)}
                    >
                        {icons.stop} Stop
                    </div>
                    : <div
                        title='track'
                        className='containerBox flex2Column bg-lite button m-5'
                        onClick={() => handleStartTask(projectIndex, taskIndex)}
                    >
                        {icons.track}
                    </div>
                }
                <div
                    title='delete'
                    className='containerBox flex2Column bg-lite button m-5'
                    onClick={() => handleDeleteTask(projectIndex, taskIndex)}
                >
                    {icons.delete}
                </div>
            </div>
        }
        <div className=''>
            {
                (collapse)
                ? null
                : task.sessions.map((session, sessionIndex) => (
                    <div className='' key={getKey(`${task.description}${sessionIndex}`)}>
                        <div>
                            <div key={getKey(`${task.description}${sessionIndex}${String(session.startDate).split(', ')[0]}`)}>
                                <div className='containerBox'>
                                    <div className='containerBox flexContainer centerVertical vp-20'>
                                        <div className='flexColumn contentLeft'>
                                            <div>{String(session.startDate).split(', ')[0]}</div>
                                            <div className='contentLeft size15'>
                                                {getTime(session.startDate)}-{getTime(session.endDate)}
                                            </div>
                                        </div>
                                        <div className='flex1Auto contentRight'>
                                            <span
                                                title='delete session'
                                                className='constainerBox button bg-tinted color-lite p-10'
                                                onClick={() => handleDeleteSession(projectIndex, taskIndex, sessionIndex)}
                                            >
                                                {icons.x}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='containerBox centerVertical contentLeft'>
                                        <span
                                            title='toggle edit'
                                            className='button'
                                            onClick={() => toggleEditSessionTime(sessionIndex)}
                                        >
                                            {formatDurationTime(session.runningTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    </div>
}
export default Task;