import React, { useState, useEffect } from 'react';
import getTotalTime from '../utils/getTotalTime';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import Charge from './Charge';
import initSession from './initSession';
import getKey from '../utils/KeyGenerator';
import validate from '../utils/validate';

const ChargeProject = ({
    charges,
    setCharges,
    chargeProject,
    chargeProjectIndex,
    newProjectDescription,
    handleDeleteCharges,
    addCharge,  
    getProjectTime                         
}) => {
    const [projectCollapse, setProjectCollapse] = useState(chargeProject.isCollapsed);

    useEffect(() => {
        const newCharges = [...charges];
        newCharges[chargeProjectIndex].isCollapsed = projectCollapse;
        let dataToString = JSON.stringify(newCharges);
        localStorage.setItem('chargeTracking', dataToString);
    }, [projectCollapse]);

    const handleStopTask = (chargeProjectIndex, taskIndex) => {
        const updatedCharges = [...charges];
        const task = updatedCharges[chargeProjectIndex].tasks[taskIndex];
        task.sessions = task.sessions ?? [];
        task.isRunning = false;
        const startTime = task.sessions[task.sessions.length - 1].startTime;
        const startDate = task.sessions[task.sessions.length - 1].startDate;
        const endTime = currentTime();
        const endDate = currentDate();
        const totalTimeMilliseconds = Math.round(endTime - startTime);
        const totalTime = getTotalTime(totalTimeMilliseconds);
        let runningTime = task.sessions[task.sessions.length - 1].runningTime;
        //alert(`runningTime1: ${runningTime} task.sessions.length: ${task.sessions.length}`)
        //runningTime = (runningTime === undefined) ? task.sessions[task.sessions.length - 2].runningTime : runningTime;
        runningTime = (validate(runningTime) === null) ? task.sessions[task.sessions.length - 2].runningTime : runningTime;
        //alert(`runningTime2: ${runningTime}`)
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
        task.sessions.push(session);
        console.log(`handleStopTask => task:${JSON.stringify(task,null,2)}`)
        const taskRunningTime = calculateTotalRunningTime(task);
        const taskRunningTimeDisplay = getTotalTime(taskRunningTime);
        console.log(`handleStopTask => taskRunnningTime: ${taskRunningTime} taskRunningTimeDisplay: ${taskRunningTimeDisplay}`)
        task.runningTime = taskRunningTime;
        task.runningTimeDisplay = taskRunningTimeDisplay;
        task.sessions.map((session, index) => console.log(`handleStopTask => session(${index}): runningTime: ${session.runningTime} totalTime: ${session.totalTime}`));
        setCharges(updatedCharges);
        stopTimer(chargeProjectIndex, taskIndex);
    };

    const handleStartTask = (chargeProjectIndex, taskIndex) => {
        const updatedCharges = [...charges];
        const task = updatedCharges[chargeProjectIndex].tasks[taskIndex];
        task.sessions = task.sessions ?? [];
        task.isRunning = true;
        //task.startDate = currentDate();
        task.sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0))
        setCharges(updatedCharges);
        startTimer(chargeProjectIndex, taskIndex);
    };
    function calculateTotalRunningTime(task) {
        let totalRunningTime = 0;
        task.sessions.forEach((session) => {
            totalRunningTime += session.runningTime;
        });
        return totalRunningTime;
    }

    const startTimer = (chargeProjectIndex, taskIndex) => {
        const updatedCharges = [...charges];
        const task = updatedCharges[chargeProjectIndex].tasks[taskIndex];

        task.timerId = setInterval(() => {
            setCharges(updatedCharges);
        }, 1000);
    };

    const stopTimer = (chargeProjectIndex, taskIndex) => {
        const updatedCharges = [...charges];
        const task = updatedCharges[chargeProjectIndex].tasks[taskIndex];
        const session = task.sessions[task.sessions.length - 1]
        clearInterval(task.timerId);
        task.sessions.splice((task.sessions.length - 2), 1);
        task.totalTime = task.totalTime + session.runningTime;
        setCharges(updatedCharges);
    };
    const handleDeleteTask = (chargeProjectIndex, taskIndex) => {
        const updatedCharges = [...charges];
        updatedCharges[chargeProjectIndex].tasks.splice(taskIndex, 1);
        setCharges(updatedCharges);
    };
    
    const getTasks = (chargeProject, chargeProjectIndex) => {
        return (
            chargeProject.tasks.map((task, taskIndex) => (
                <div key={getKey(`chargeTask${taskIndex}`)}>
                    <Charge
                        taskIndex={taskIndex}
                        task={task}
                        charges={charges}
                        setCharges={setCharges}
                        handleStopTask={handleStopTask}
                        chargeProjectIndex={chargeProjectIndex}
                        handleStartTask={handleStartTask}
                        handleDeleteTask={handleDeleteTask}
                    >
                    </Charge>
                </div>
            ))
        )
    }

    return  <div key={`chargeProject${chargeProjectIndex}`} className='containerBox'>
                <div className='containerBox bg-lite'>
                    <div className='containerBox size30 mb-10 bold color-yellow'>
                        <CollapseToggleButton
                            title={chargeProject.description}
                            isCollapsed={projectCollapse}
                            setCollapse={setProjectCollapse}
                        />
                    </div>
                    <div className='containerBox bg-transparent'>
                        <div className='size20 bold m-5'>
                            {String(chargeProject.createdDate).replace(', ', ' - ')}
                            {/*String(chargeProject.createdDate).split(', ')[0]}
                            {String(chargeProject.createdDate).split(', ')[1]*/}
                        </div>
                        {/*
                            <div className='color-lite size20 m-10'>
                                {icons.track} Start {getTotalTime(getProjectTime(chargeProject))}
                            </div> 
                        */}
                        
                    </div>
                    {
                        (projectCollapse)
                        ? null
                        :<div className='containerBox flexContainer'>
                            <div 
                                title='add charge'
                                className='containerBox flex3Column m-10 bg-lite button' 
                                onClick={() => addCharge(chargeProjectIndex)}
                            >
                                + {icons.track}
                            </div>
                            <div 
                                title='delete charge'
                                className='containerBox flex3Column m-10 bg-lite button' 
                                onClick={() => handleDeleteCharges(chargeProjectIndex)}
                            >
                                {icons.delete}
                            </div>
                        </div>
                    }
                </div>
                <div>
                    {
                        (projectCollapse)
                            ? null
                            : getTasks(chargeProject, chargeProjectIndex)
                    }
                </div>
            </div>
}
export default ChargeProject;