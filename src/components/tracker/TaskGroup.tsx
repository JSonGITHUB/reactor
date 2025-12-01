import React, { FC } from 'react';
import getKey from '../utils/KeyGenerator';
import Task from './Task';

type Session = {
	// original code has mixed formats; keep flexible types
	startDate: string | number;
	startTime: string | number;
	endDate?: string | number;
	endTime?: string | number;
	runningTime?: number;
	reason?: string;
	breakTime?: boolean;
	startEpoch?: number;
	// any other fields are allowed
	[key: string]: any;
};

type TaskType = {
	description: string;
	sessions: Session[];
	isRunning?: boolean;
	timerId?: any;
	runningTimeDisplay?: string;
	totalTime?: number;
	isCollapsed?: boolean;
	breakTime?: number;
	// any other fields
	[key: string]: any;
};

type Project = {
	description: string;
	tasks: TaskType[];
	totalTime?: number;
	// any other fields
	[key: string]: any;
};

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
	console.log('Rendering TaskGroup for tasks:', tasks.length || 0 );
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
		<div key={getKey(`${project.description}${index}`)} className="task-group m-5">
			<div className="containerDetail color-yellow contentLeft p-20">
				<div className='size30 mb-10'>{project.description}</div>
                <div className="project-total">Total: {formatDurationTime(getProjectTotalTime(project))}</div>
			</div>

			<div className="tasks-list">
				{project.tasks.map((task, taskIndex) => (
					<Task
						key={getKey(`${task.description}${taskIndex}`)}
						index={taskIndex}
						projects={tasks}
                        setProjects={setTasks}
                        taskIndex={taskIndex}
                        task={task}
                        projectIndex={index}
                        getProjectTotalTime={getProjectTotalTime}
                        tracking={tracking}
					/>
				))}
			</div>
		</div>
	);
};

export default TaskGroup;
