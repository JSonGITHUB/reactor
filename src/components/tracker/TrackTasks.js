import React, { useEffect } from 'react';
import TaskGroup from './TaskGroup';

const TrackTasks = ({

    tracking,
    tasks,
    setTasks,
    deleteProject

}) => {

    const getProjectTotalTime = (project) => {
        if (!project.tasks) {
            return 0;
        }
        return project.tasks.reduce((total, task) => total + task.totalTime, 0);
    }

    useEffect(() => {
        const newTasks = [...tasks];
        newTasks.map((project) => {
            const time = {
                ...project,
                totalTime: getProjectTotalTime(project)
            }
            return time;
        })
        let dataToString = JSON.stringify(newTasks);
        if (tracking === 'projects') {
            localStorage.setItem('projects', dataToString);
        } else {
            localStorage.setItem('taskTracking', dataToString);
        }
    }, [tasks, tracking]);

    return (
        <div>
            {
                tasks.map((taskGroup, index) => (
                    (taskGroup.display && taskGroup.display === true)
                    ? <div key={`task-group-${index}-${String(taskGroup?.description || 'group')}`} className=''>
                        <TaskGroup
                            index={index}
                            tracking={tracking}
                            tasks={tasks}
                            taskGroup={taskGroup}
                            setTasks={setTasks}
                            getProjectTotalTime={getProjectTotalTime}
                            deleteProject={deleteProject}
                        />
                    </div>
                    : null
                ))
            }
        </div>
    )
}

export default TrackTasks;