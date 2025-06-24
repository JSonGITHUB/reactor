import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator';
import initTasks from './initTasks';
import initSession from './initSession';
import initTask from './initTask';
import Task from './Task';
import TimerDisplay from '../utils/TimerDisplay';
import icons from './icons';
import getTotalTime from './getTotalTime';
import { currentTime, currentDate } from '../utils/CurrentCalendar';

const TaskProject = ({
    
    project,
    projectIndex,
    projects,
    setProjects,
    getProjectTotalTime,
    deleteProject,
    isCollapsed

}) => {

    const [projectCollapse, setProjectCollapse] = useState(false);

    const getTaskTotalTime = (task) => task.sessions.reduce((total, session) => total + session.runningTime, 0);
    const getLocalProjectTotalTime = (projectIndex) => {
        const localTasks = initializeData('taskTracking', null);
        const totalTime = ((localTasks != []) && localTasks[projectIndex]) ? localTasks[projectIndex].totalTime : '00:00:00';
        const displayTime = (String(totalTime).indexOf(':') > -1) ? totalTime : (totalTime === 0) ? '00:00:00' : getTotalTime(totalTime);
        return displayTime;
    }

    const handleDeleteTask = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const project = updatedProjects[taskProjectIndex];
        project.tasks.splice(taskIndex, 1);
        updatedProjects.map((project, projectIndex) => {
            project.totalTime = getProjectTotalTime(project);
        })
        setProjects(updatedProjects);
    };
    const stopTimer = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        clearInterval(updatedProjects[taskProjectIndex].tasks[taskIndex].timerId);
        updatedProjects[taskProjectIndex].tasks[taskIndex].sessions.splice((updatedProjects[taskProjectIndex].tasks[taskIndex].sessions.length - 2), 1);

        const taskTotalTime = getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[taskIndex]);
        updatedProjects[taskProjectIndex].tasks[taskIndex].runningTimeDisplay = getTotalTime(taskTotalTime);
        updatedProjects[taskProjectIndex].tasks[taskIndex].totalTime = taskTotalTime;
        //const projectTotalTime = getProjectTotalTime(taskProjectIndex);
        //updatedProjects[taskProjectIndex].totalTime = getTotalTime(projectTotalTime);
        //updatedProjects[taskProjectIndex].totalTime = projectTotalTime;
        updatedProjects.map((project, projectIndex) => {
            project.totalTime = getProjectTotalTime(project);
        })
        //alert(`stopTimer => ${updatedProjects[taskProjectIndex].description} totalTime: ${updatedProjects[taskProjectIndex].totalTime} taskTotalTime: ${updatedProjects[taskProjectIndex].tasks[taskIndex].totalTime}`)
        setProjects(updatedProjects);
    };
    const startTimer = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[taskProjectIndex].tasks[taskIndex];

        task.timerId = setInterval(() => {
            updatedProjects.map((project, projectIndex) => {
                project.totalTime = getProjectTotalTime(project);
            });
            setProjects(updatedProjects);
        }, 1000);
    };
    const handleStartTask = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[taskProjectIndex].tasks[taskIndex];
        task.sessions = task.sessions ?? [];
        task.isRunning = true;
        task.sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0))
        updatedProjects.map((project, projectIndex) => {
            project.totalTime = getProjectTotalTime(project);
        })
        setProjects(updatedProjects);
        startTimer(taskProjectIndex, taskIndex);
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
        //alert(`runningTime: ${runningTime}`)
        const session = initSession(
            startDate,
            startTime,
            endDate,
            endTime,
            runningTime
        )
        //alert(JSON.stringify(session,null,2))
        task.runningTime = runningTime;
        //task.runningTimeDisplay = getTotalTime(runningTime);
        task.sessions.push(session);
        const taskTotalTime = getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[taskIndex]);
        task.runningTimeDisplay = getTotalTime(taskTotalTime);
        task.totalTime = taskTotalTime;
        //const projectTotalTime = getProjectTotalTime(taskProjectIndex);
        //project.totalTime = getTotalTime(projectTotalTime);
        //project.totalTime = projectTotalTime;
        //alert(`${project.description} totalTime: ${project.totalTime}`)
        updatedProjects.map((project, projectIndex) => {
            project.totalTime = getProjectTotalTime(project);
        })
        setProjects(updatedProjects);
        stopTimer(taskProjectIndex, taskIndex);
    };
    const addTask = (index) => {
        const taskDescription = prompt('Enter task description:');
        if (taskDescription) {
            const sessions = [];
            sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0));
            const task = initTask(taskDescription, sessions);
            const updatedProjects = [...projects];
            updatedProjects[index].tasks.unshift(task);
            updatedProjects[index].isCollapsed = false;
            updatedProjects.map((project, projectIndex) => {
                project.totalTime = getProjectTotalTime(project);
            })
            setProjects(updatedProjects);
        }
    };

    return <div key={getKey(`${project.description}${projectIndex}`)} className=''>
                <div className=''>
                    <div className='containerBox flexContainer'>
                        <div className='flex2Column color-yellow bold size25 contentLeft'>
                            {project.description}
                        </div>
                        <div className='flex2Column color-lite contentRight'>
                            <div className=''>{String(project.createdDate).split(', ')[0]}</div>
                        </div>
                    </div>
                    <div className='flexContainer'>
                        <div className='mt-15 ml-15 flex2Column color-lite contentLeft'>
                            {getTotalTime(project.totalTime)}
                        </div>
                        <div className='flex2Column'>
                            <div className='flexContainer'>
                                <div
                                    title='add task'
                                    className='flex3Column containerBox button'
                                    onClick={() => addTask(projectIndex)}
                                >
                                    + {icons.track}
                                </div>
                                <div
                                    title='delete project'
                                    className='flex3Column containerBox button'
                                    onClick={() => deleteProject(projectIndex)}
                                >
                                    {icons.delete}
                                </div>
                                <div
                                    title='expand/collapse'
                                    className='flex3Column containerBox button'
                                    onClick={() => setProjectCollapse(!projectCollapse)}
                                >
                                    {(project.isCollapsed || projectCollapse) ? icons.down : icons.up }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {((isCollapsed ?? project.isCollapsed) || projectCollapse)
                        ? null
                        : project.tasks.map((task, taskIndex) => (
                            <div key={getKey(`task${taskIndex}`)}>
                                <Task
                                    projects={projects}
                                    setProjects={setProjects}
                                    taskIndex={taskIndex}
                                    task={task}
                                    handleStopTask={handleStopTask}
                                    projectIndex={projectIndex}
                                    handleStartTask={handleStartTask}
                                    handleDeleteTask={handleDeleteTask}
                                    getTaskTotalTime={getTaskTotalTime}
                                    getTotalTime={getTotalTime}
                                    getProjectTotalTime={getProjectTotalTime}
                                />
                            </div>
                        ))}
                </div>
            </div>
}
export default TaskProject;