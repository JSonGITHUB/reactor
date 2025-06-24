import React, { useEffect } from 'react';
import TaskGroup from './TaskGroup';
import getKey from '../utils/KeyGenerator';

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
            //console.log(`TrackTasks => getProjectTotalTime(project): ${getProjectTotalTime(project)}`);
            //console.log(`TrackTasks => project: ${project.description} => ${project.totalTime} time: ${getProjectTotalTime(project) }`);
            return time;
        })
        let dataToString = JSON.stringify(newTasks);
        if (tracking === 'projects') {
            localStorage.setItem('projects', dataToString);
        } else {
            localStorage.setItem('taskTracking', dataToString);
        }
    }, [tasks]);

    useEffect(() => {

        //tasks.map((task, index) => console.log(`TrackTasks => task.description(${index}): ${task.description}`) )
        /*
         const storedTasks = (tracking === 'projects') ? localStorage.getItem('projects') : localStorage.getItem('taskTracking');
         if (storedTasks) {
             setTasks(JSON.parse(storedTasks));
         } else {
             setTasks([initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0)]);
         }
         */
        const updatedTasks = [...tasks];
        updatedTasks.map((project, projectIndex) => {
            getProjectTotalTime(project)
            console.log(`TrackTasks => ${project.description} getProjectTotalTime(project): ${getProjectTotalTime(project)}`);
            /* return {
                ...project,
                totalTime: getProjectTotalTime(project)
            }; */
        })
        //setTasks(updatedTasks);
    }, []);

    return (
        <div>
            {
                tasks.map((taskGroup, index) => (
                    (taskGroup.display && taskGroup.display === true)
                    ? <div key={getKey('taskGroup')} className='containerBox'>
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