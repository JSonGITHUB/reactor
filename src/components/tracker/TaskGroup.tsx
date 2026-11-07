import React, { FC } from 'react';
import Task from './Task';
import type { Project } from './Task';

interface Props {
	tasks: Project[];
	setTasks: React.Dispatch<React.SetStateAction<Project[]>>;
	index: number;
	tracking?: string;
}

/**
 * Minimal TaskGroup.tsx replication.
 * Renders project title and tasks using the existing Task component.
 */
const TaskGroup: FC<Props> = ({ 

    index,
    tracking,
    tasks,
    setTasks
    
}) => {
    const project = tasks && tasks[index] || [];

	// compute project total time (sum of runningTime for all sessions of all tasks)
	const getProjectTotalTime = (p: Project) => {
		if (!p || !Array.isArray(p.tasks)) return 0;
		return p.tasks.reduce((taskAcc, t) => {
			const taskSum = (Array.isArray(t.sessions) ? t.sessions : []).reduce((sAcc, s) => {
				return sAcc + (((typeof s.runningTime === 'number') && !s.breakTime) ? s.runningTime : 0);
			}, 0);
			return taskAcc + taskSum;
		}, 0);
	};

	if (!project) return null;

    function formatDurationTime(milliseconds: number): string {
        milliseconds = Math.max(0, milliseconds);
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return formattedTime;
    }

	return (
		<div key={`task-group-tsx-${index}-${String(project.description || 'group')}`} className="task-group m-5">
			<div className="containerDetail color-yellow contentLeft p-20">
				<div className='size30 mb-10'>{project.description}</div>
                <div className="project-total">Total: {formatDurationTime(getProjectTotalTime(project))}</div>
			</div>

			<div className="tasks-list">
				{project.tasks.map((task, taskIndex) => (
					<Task
						key={`task-group-tsx-item-${index}-${taskIndex}-${String(task.description || 'task')}`}
						projects={tasks}
                        setProjects={setTasks}
                        taskIndex={taskIndex}
                        task={task}
                        projectIndex={index}
                        getProjectTotalTime={getProjectTotalTime}
						tracking={tracking || 'projects'}
					/>
				))}
			</div>
		</div>
	);
};

export default TaskGroup;
