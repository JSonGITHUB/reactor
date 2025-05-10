import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator';
import initTask from './initTask';
import icons from '../site/icons';
import getTotalTime from '../utils/getTotalTime';
import Task from './Task';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initSession from './initSession';
import { currentTime, currentDate } from '../utils/CurrentCalendar';

const TaskGroup = ({

    index,
    tracking,
    tasks,
    taskGroup,
    setTasks,
    getProjectTotalTime,
    deleteProject

}) => {

    const [collapsed, setCollapsed] = useState(taskGroup.isCollapsed);
    //console.log(`TaskGroup => tasks: ${JSON.stringify(tasks, null, 2)}`)

    useEffect(() => {
        const newTasks = [...tasks];
        newTasks[index].isCollapsed = collapsed;

        let dataToString = JSON.stringify(newTasks);
        if (tracking === 'projects') {
            localStorage.setItem('projects', dataToString);
        } else {
            localStorage.setItem('taskTracking', dataToString);
        }
    }, [collapsed]);
    
    useEffect(() => {
        //console.log(`TaskGroup => tasks: ${JSON.stringify(tasks, null, 2)}`)
        //console.log(`TaskGroup => taskGroup: ${JSON.stringify(taskGroup, null, 2)}`)
    }, []);

    const addTask = (index) => {
        const taskDescription = prompt('Enter task description:');
        if (taskDescription) {
            const sessions = [];
            sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0));
            const task = initTask(taskDescription, sessions);
            const updatedTasks = [...tasks];
            updatedTasks[index].tasks.unshift(task);
            updatedTasks[index].isCollapsed = false;
            updatedTasks.map((project, projectIndex) => {
                return {
                    ...project,
                    totalTime: getProjectTotalTime(project)
                };
            })
            setTasks(updatedTasks);
        }
    };
    return <div key={getKey(`${taskGroup.description}${index}`)} className=''>
                <div className='containerBox bg-lite'>
                    <div className='centerVertical'>
                        <div className='containerBox color-yellow bg-tinted p-20'>
                            <CollapseToggleButton
                                title={`${taskGroup.description}`}
                                description={`${getTotalTime(taskGroup.totalTime)}`}
                                isCollapsed={collapsed}
                                setCollapse={setCollapsed}
                                align='left'
                                bold='true'
                            />
                        </div>
                    </div>
                    {
                        (collapsed)
                        ? null
                        : <div className='flexContainer'>
                            <div className='containerBox flex2Column color-lite contentLeft bg-transparent pl-20'>
                                <div className=''>{String(taskGroup.createdDate).split(', ')[0]}</div>
                            </div>
                            <div className='flex2Column'>
                                <div className='flexContainer'>
                                    <div
                                        title='add'
                                        className='flex2Column containerBox button'
                                        onClick={() => addTask(index)}
                                    >
                                        {icons.track}
                                    </div>
                                    <div
                                        title='delete'
                                        className='flex2Column containerBox button'
                                        onClick={() => deleteProject(index)}
                                    >
                                        {icons.delete}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <div>
                    {
                        (collapsed)
                        ? null
                        : taskGroup.tasks.map((task, taskIndex) => (
                            (task.display && task.display === true)
                            ? <div key={getKey(`Task${taskIndex}`)} className='containerBox lowerBorder'>
                                <Task
                                    projects={tasks}
                                    setProjects={setTasks}
                                    taskIndex={taskIndex}
                                    task={task}
                                    projectIndex={index}
                                    getProjectTotalTime={getProjectTotalTime}
                                    tracking={tracking}
                                />
                            </div>
                            : null
                        ))}
                </div>
            </div>
}

export default TaskGroup;