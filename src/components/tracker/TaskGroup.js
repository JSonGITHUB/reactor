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
            let reason = prompt('Reason for work:');
            sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0, reason));
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
    return <div key={getKey(`${taskGroup.description}${index}`)} className='m-5'>
                <div className='containerDetail bg-lite'>
                    <div className='centerVertical'>
                        <div className='containerDetail color-yellow bg-tinted size25'>
                            <CollapseToggleButton
                                title={`${taskGroup.description}`}
                                description={`${getTotalTime(taskGroup.totalTime)}`}
                                isCollapsed={collapsed}
                                setCollapse={setCollapsed}
                                align='left'
                            />
                        </div>
                    </div>
                    {
                        (collapsed)
                        ? null
                        : <div className='flexContainer'>
                            <div className='containerDetail flex2Column color-lite contentLeft pl-20 pt-10 mt-5 mr-5'>
                                <div className=''>{String(taskGroup.createdDate).split(', ')[0]}</div>
                            </div>
                            <div className='flex2Column'>
                                <div className='flexContainer'>
                                    <div
                                        title='add'
                                        className='flex2Column containerDetail button p-10 size20 mt-5'
                                        onClick={() => addTask(index)}
                                    >
                                        {icons.track}
                                    </div>
                                    <div
                                        title='delete'
                                        className='flex2Column containerDetail button p-10 size20 ml-5 mt-5'
                                        onClick={() => deleteProject(index)}
                                    >
                                        {icons.delete}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <div>
                    {
                        (collapsed)
                        ? null
                        : <div className=''>
                            {taskGroup.tasks.map((task, taskIndex) => (
                            (!task.display || (task.display && task.display === true))
                                ? <div key={getKey(`Task${taskIndex}`)} className='containerDetail lowerBorder mt-5 size20 bg-lite'>
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
                    }
                    </div>
                </div>
            </div>
}

export default TaskGroup;