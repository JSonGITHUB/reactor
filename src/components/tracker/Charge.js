import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const Charge = ({
    taskIndex,
    task,
    charges,
    handleStopTask,
    chargeProjectIndex,
    handleStartTask,
    handleDeleteTask
}) => {
    const [taskCollapse, setTaskCollapse] = useState(task.isCollapsed);

    useEffect(() => {
        const newCharges = [...charges];
        newCharges[chargeProjectIndex].tasks[taskIndex].isCollapsed = taskCollapse;
        const dataToString = JSON.stringify(newCharges);
        localStorage.setItem('chargeTracking', dataToString);
    }, [taskCollapse]);

    const taskSessions = () => <div className='containerBox'>
                            {task.sessions.map((session, sessionIndex) => (
                                <div key={`session${sessionIndex}`} className='color-lite'>
                                    <div className='containerBox'>
                                        <div className='columnLeftAlign size25 mb-5'>
                                            <span className='bold mr-10 color-yellow size20'>
                                                {sessionIndex + 1}.
                                            </span>
                                            {String(session.startDate).split(', ')[0]}
                                        </div>
                                        <div className='ml-30 columnLeftAlign size15'>
                                            {String(session.startDate).split(', ')[1]} - {String(session.endDate).split(', ')[1]}
                                        </div>
                                        <div className='ml-30 columnLeftAlign size20 bold'>
                                            {session.totalTime}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
    
    const taskNavigation = () => <div className='containerBox flexContainer'>
                                    {task.isRunning ? (
                                        <div 
                                            title='stop'
                                            className='containerBox flex2Column m-5 bg-lite button' 
                                            onClick={() => handleStopTask(chargeProjectIndex, taskIndex)}
                                        >
                                            {icons.stop}
                                        </div>
                                    ) : (
                                        <div 
                                            title='track'
                                            className='containerBox flex2Column m-5  bg-lite button' 
                                            onClick={() => handleStartTask(chargeProjectIndex, taskIndex)}
                                        >
                                            {icons.track}
                                        </div>
                                    )}
                                    <div
                                        title='delete' 
                                        className='containerBox flex2Column m-5  bg-lite button' 
                                        onClick={() => handleDeleteTask(chargeProjectIndex, taskIndex)}
                                    >
                                        {icons.delete}
                                    </div>
                                </div>

    return <div key={`task${taskIndex}`} className='containerBox lowerBorder'>
        <div className='containerBox bg-lite'>
            <div className='containerBox bold'>
               <CollapseToggleButton
                    title={task.description}
                    isCollapsed={taskCollapse}
                    setCollapse={setTaskCollapse}
                /> 
            </div>
            {
                (taskCollapse)
                ? null
                : <div className='containerBox color-lite size20'>
                    <div className='mb-20'>{task.sessions.length} Total</div>
                    <div className='containerBox bg-veryLite'>{task.runningTimeDisplay}</div>
                    {taskNavigation()}
                </div>
            }
        </div>
        {
            (taskCollapse)
            ? null
            : taskSessions()
        }
    </div>
}
export default Charge;