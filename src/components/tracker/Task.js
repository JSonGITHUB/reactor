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

    // Stop reason modal state
    const [showStopModal, setShowStopModal] = useState(false);
    const [stopModalInfo, setStopModalInfo] = useState(null); // { taskProjectIndex, taskIndex, sessionIndex }
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const STOP_REASONS = [
        'Coffee',
        'Lunch',
        'End of day',
        'Water',
        'Interruption',
        'Meeting',
        'Phone call',
        'Email triage',
        'Technical issue',
        'Waiting on input',
        'Personal errand',
        'Bathroom',
        'Break',
        'IT issue',
        'IT Network down',
        'IT VPN issue',
        'End subtask',
        'Other'
    ];

    const getTaskTotalTime = (task) => {
        return task.sessions.reduce((acc, session) => {
            const runTime = session.runningTime || 0;
            if (session.breakTime === true) {
                acc[1] += runTime; // break time
            } else {
                acc[0] += runTime; // work time
            }
            return acc;
        }, [0, 0]); // [workTime, breakTime]
    }
    // Helper: count sessions excluding breaks
    const getWorkSessionCount = (t) => {
        if (!t || !Array.isArray(t.sessions)) return 0;
        return t.sessions.length - t.sessions.filter(s => s?.breakTime === true).length;
    };

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
        const t = updatedProjects[taskProjectIndex].tasks[taskIndex];
        // Clear active timer
        if (t.timerId) {
            clearInterval(t.timerId);
            t.timerId = null;
        }
        t.isRunning = false;

        // Helper to convert stored date/time pair to ms
        const toMs = (dateStr, timeStr) => {
            if (!dateStr || !timeStr) return null;
            const d = new Date(`${dateStr} ${timeStr}`);
            const ms = d.getTime();
            return isNaN(ms) ? null : ms;
        };

        // Compute runningTime for any session lacking a valid duration
        t.sessions.forEach(s => {
            if (typeof s.runningTime !== 'number' || s.runningTime === 0) {
                const startMs = toMs(s.startDate, s.startTime);
                const endMs = toMs(s.endDate, s.endTime);
                if (startMs !== null && endMs !== null && endMs >= startMs) {
                    s.runningTime = endMs - startMs;
                }
            }
        });

        // Recompute task totals
        const [workTime, breakTime] = getTaskTotalTime(t);
        const taskTotalTime = workTime; // only work time counts toward task total
        t.totalTime = taskTotalTime;
        t.runningTimeDisplay = getTotalTime(taskTotalTime);
        t.breakTime = breakTime; // optionally store break time separately

        // Recompute project total
        updatedProjects[taskProjectIndex].totalTime = updatedProjects[taskProjectIndex].tasks.reduce(
            (pAcc, taskItem) => {
                const [wt] = getTaskTotalTime(taskItem);
                return pAcc + wt;
            },
            0
        );

        setProjects(updatedProjects);
    };

    // open modal to choose stop reason
    const handleStopTask = (taskProjectIndex, taskIndex, sessionIndex) => {
        setStopModalInfo({ taskProjectIndex, taskIndex, sessionIndex });
        setSelectedReason(STOP_REASONS[0]);
        setCustomReason('');
        setShowStopModal(true);
    };

    const performStopTask = () => {
        if (!stopModalInfo) {
            setShowStopModal(false);
            return;
        }
        const { taskProjectIndex, taskIndex, sessionIndex } = stopModalInfo;
        const updatedProjects = [...projects];
        const project = updatedProjects[taskProjectIndex];
        const task = project.tasks[taskIndex];
        const sesh = task.sessions[sessionIndex];

        let reason = sesh?.reason ? sesh.reason : '';
        const chosen = (selectedReason === 'Other') ? (customReason || 'Stopped') : selectedReason;

        task.sessions = task.sessions ?? [];
        task.isRunning = false;
        const startTime = task.sessions[task.sessions.length - 1].startTime;
        const startDate = task.sessions[task.sessions.length - 1].startDate;
        
        const endTime = currentTime();
        const endDate = currentDate();

        console.log(`Task => performStopTask => taskProjectIndex: ${taskProjectIndex} taskIndex: ${taskIndex} sessionIndex: ${sessionIndex} startTime: ${startTime} startDate: ${startDate} endTime: ${endTime} endDate: ${endDate}`);
        let runningTime = endTime - startTime;
        //runningTime = (validate(runningTime) === null)
            //? (task.sessions[task.sessions.length - 2] ? task.sessions[task.sessions.length - 2].runningTime : 0)
            //: runningTime;

        // Finalize the current session with its existing reason
        console.log(`Task => performStopTask => runningTime: ${runningTime}`);
        sesh.endDate = endDate;
        sesh.endTime = endTime;
        sesh.runningTime = runningTime;
        const currentSessionReason = sesh?.reason || 'Work session';
        const session = initSession(
            startDate,
            startTime,
            endDate,
            endTime,
            runningTime = runningTime,
            currentSessionReason,
            false
        );

        task.runningTime = runningTime;
        //task.sessions.push(session);

        // Create a new session with the stop reason (0 duration, same start/end time)
        const stopSession = initSession(
            endDate,
            endTime,
            endDate,
            endTime,
            0,
            chosen,
            true,
        );
        if (chosen !== 'End subtask') {
            task.sessions.push(stopSession);
        }
        const [workTime, breakTime] = getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[taskIndex]);
        task.runningTimeDisplay = getTotalTime(workTime);
        task.totalTime = workTime;
        task.breakTime = breakTime;

        console.log(`Task => performStopTask => runningTime: ${runningTime}`);
        // recompute project total
        let projectTotalTime = 0;
        updatedProjects[taskProjectIndex].tasks.forEach((t, i) => {
            const [wt] = getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[i]);
            projectTotalTime += wt;
        });
        updatedProjects[taskProjectIndex].totalTime = projectTotalTime;

        setProjects(updatedProjects);
        stopTimer(taskProjectIndex, taskIndex);

        // close modal
        setShowStopModal(false);
        setStopModalInfo(null);
    };

    const cancelStopModal = () => {
        setShowStopModal(false);
        setStopModalInfo(null);
    };

    const handleDeleteSession = (projectIndex, taskIndex, sessionIndex) => {
        const updatedProjects = [...projects];
        const project = updatedProjects[projectIndex];
        const task = project.tasks[taskIndex];
        task.sessions.splice(sessionIndex, 1);
        const [workTime, breakTime] = getTaskTotalTime(updatedProjects[projectIndex].tasks[taskIndex]);
        task.runningTimeDisplay = getTotalTime(workTime);
        task.totalTime = workTime;
        task.breakTime = breakTime;
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
        console.log(`Task => startTimer => taskProjectIndex: ${taskProjectIndex} taskIndex: ${taskIndex}`);
        const updatedProjects = [...projects];
        const task = updatedProjects[taskProjectIndex].tasks[taskIndex];
        task.timerId = setInterval(() => {
            setProjects(prevProjects => {
                const updated = [...prevProjects];
                // work with updated here
                return updated;
            });
        }, 1000);
    };
    const handleStartTask = (taskProjectIndex, taskIndex) => {
        const updatedProjects = [...projects];
        const task = updatedProjects[taskProjectIndex].tasks[taskIndex];
        task.sessions = task.sessions ?? [];
        task.isRunning = true;
        let reason = prompt('Reason for work:');
        if (reason === null || reason === '') {
            reason = 'continuing work';
        }

        const newStartDate = currentDate();
        const newStartTime = currentTime();

        // Update the previous session's end time if it exists and has matching start/end times
        if (task.sessions.length > 0) {
            const prevSession = task.sessions[task.sessions.length - 1];
            if (prevSession.startDate === prevSession.endDate && prevSession.startTime === prevSession.endTime) {
                prevSession.endDate = newStartDate;
                prevSession.endTime = newStartTime;
                prevSession.runningTime = newStartTime - prevSession.startTime;
            }
        }

        // Add the new work session
        task.sessions.push(
            initSession(
                newStartDate,
                newStartTime,
                newStartDate,
                newStartTime,
                0,
                reason,
                false
            )
        );

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
        <div className=''>
            <div className='centerVertical'>
                <div className='containerDetail color-yellow bg-tinted mt-5 p-10 size20'>
                    <CollapseToggleButton
                        title={`${task.description}`}
                        isCollapsed={collapse}
                        setCollapse={setCollapse}
                        align='left'
                    />
                </div>
            </div>
            <div className='containerDetail mt-5 flexContainer p-10 size15'>
                <div className='flex2Column color-lite contentLeft pl-10'>
                    Work: {getTotalTime(getTaskTotalTime(task)[0])}<br/>
                    {
                        (collapse)
                        ? null
                        : <div>Break: {getTotalTime(getTaskTotalTime(task)[1])}</div>
                    }
                </div>
                <div className='flex2Column color-lite contentRight pr-15'>
                    {getWorkSessionCount(task)} Session{getWorkSessionCount(task) === 1 ? '' : 's'}<br/>
                    {
                        (collapse)
                        ? null
                        : <div>{task.sessions.filter(s => s.breakTime === true).length} Break{task.sessions.filter(s => s.breakTime === true).length === 1 ? '' : 's'}</div>
                    }
                </div>
            </div>
        </div>
        {
            (collapse)
            ? null
            : <div className='containerDetail mt-5 flexContainer'>
                {
                    task.isRunning
                    ? <div
                        title='stop'
                                className='containerDetail p-10 button flex2Column bg-lite button m-5'
                                onClick={() => handleStopTask(projectIndex, taskIndex, (task.sessions.length-1))}
                    >
                        {icons.stop}
                    </div>
                    : <div
                        title='track'
                        className='containerDetail p-10 button flex2Column bg-lite button m-5'
                                onClick={() => handleStartTask(projectIndex, taskIndex, (task.sessions.length - 1))}
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
        {
            (collapse)
            ? null
            : <div className='containerDetail mt-5'>
                {
                    task.sessions.map((session, sessionIndex) => (
                        <div className='' key={getKey(`${task.description}${sessionIndex}`)}>
                            <div>
                                <div key={getKey(`${task.description}${sessionIndex}${String(session.startDate).split(', ')[0]}`)}>
                                    <div className={`containerDetail ${(session.breakTime)?'':'bg-lite'} ${(sessionIndex > 0) ? 'mt-5' : '' }`}>
                                        <div className='containerDetail color-lite p-10 flexContainer centerVertical'>
                                            <div className='flexColumn contentLeft'>
                                                <div className='color-lite size12'>{String(session.startDate).split(', ')[0]}</div>
                                                <div className='color-yellow'>{session.reason}</div>
                                            </div>
                                            <div className='flex1Auto contentRight'>
                                                <span
                                                    title='delete session'
                                                    className='containerDetail button bg-lite p-10'
                                                    onClick={() => handleDeleteSession(projectIndex, taskIndex, sessionIndex)}
                                                >
                                                    {icons.delete}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flexContainer p-10 size15'>
                                            <div className='flex2Column contentLeft color-lite'>
                                                {getTime(session.startDate)}-{getTime(session.endDate)}
                                            </div>
                                            <div
                                                title='toggle edit'
                                                className='flex2Column contentRight button color-yellow '
                                                onClick={() => toggleEditSessionTime(sessionIndex)}
                                            >
                                                {formatDurationTime(session.runningTime)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        }
        { /* place modal JSX near top level of returned content so it overlays */ }
        {showStopModal && (
            <div className="modal-overlay bg-dark" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 6999
            }}>
                <div className="modal containerDetail bg-lite contentLeft color-yellow p-20 m-20">
                    <div style={{ padding: 5, marginBottom: 10 }}>Reason for stopping</div>
                    <div style={{ marginBottom: 10 }}>
                        <select
                            value={selectedReason}
                            onChange={e => setSelectedReason(e.target.value)}
                            className='containerBox width--10'
                        >
                            {STOP_REASONS.map((r, i) => <option key={i} value={r}>{r}</option>)}
                        </select>
                    </div>
                    {selectedReason === 'Other' && (
                        <div style={{ marginBottom: 10 }}>
                            <input
                                type="text"
                                placeholder="Custom reason"
                                value={customReason}
                                onChange={e => setCustomReason(e.target.value)}
                                className='containerBox width-100-percent'
                            />
                        </div>
                    )}
                    <div className='flexContainer'>
                        <button className="button flex2Column containerBox color-lite" onClick={cancelStopModal} style={{ padding: '8px 12px', background: '#000000' }}>Cancel</button>
                        <button className="button flex2Column containerBox color-dark" onClick={performStopTask} style={{ padding: '8px 12px', background: '#f5b400' }}>Confirm</button>
                    </div>
                </div>
            </div>
        )}
    </div>
 }
 export default Task;