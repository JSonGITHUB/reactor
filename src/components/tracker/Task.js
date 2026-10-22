import React, { useState, useEffect, useRef } from 'react';
import icons from '../site/icons';
import getTotalTime from '../utils/getTotalTime';
import initSession from './initSession';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const Task = ({
    tasks,
    setTasks,
    taskIndex,
    task,
    projectIndex,
    getProjectTotalTime,
    tracking
}) => {

    const [collapse, setCollapse] = useState(task.isCollapsed || false);

    // Stop reason modal state
    //const [showStopModal, setShowStopModal] = useState(false); // Simple boolean
    const [stopModalInfo, setStopModalInfo] = useState(null);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [nowMs, setNowMs] = useState(() => Date.now());
    //const stopModalOpenRef = useRef(false);

    const stopModalOpenRef = useRef(false);
    const [showStopModal, setShowStopModal] = useState(false);
    const activeIntervalsRef = useRef(new Set());

    // Inline edit state for task description
    const [editingDescription, setEditingDescription] = useState(false);
    const [editedDescription, setEditedDescription] = useState(task.description || '');

    // Inline edit state for session reason
    const [editingSessionIndex, setEditingSessionIndex] = useState(null);
    const [editedSessionReason, setEditedSessionReason] = useState('');

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

    useEffect(() => {
        const activeIntervals = activeIntervalsRef.current;
        return () => {
            activeIntervals.forEach((intervalId) => {
                clearInterval(intervalId);
            });
            activeIntervals.clear();
        };
    }, []);

    useEffect(() => {
        if (!task?.isRunning) return;
        const tickInterval = setInterval(() => {
            setNowMs(Date.now());
        }, 1000);
        return () => clearInterval(tickInterval);
    }, [task?.isRunning]);
    // Helper: count sessions excluding breaks
    const getWorkSessionCount = (t) => {
        if (!t || !Array.isArray(t.sessions)) return 0;
        return t.sessions.length - t.sessions.filter(s => s?.breakTime === true).length;
    };

    useEffect(() => {
        const newProjects = [...tasks];
        newProjects[projectIndex].tasks[taskIndex].isCollapsed = collapse;

        let dataToString = JSON.stringify(newProjects);
        if (tracking === 'projects') {
            localStorage.setItem('projects', dataToString);
        } else {
            localStorage.setItem('taskTracking', dataToString);
        }
    }, [collapse, projectIndex, taskIndex, tasks, tracking]);

    const isValidFormat = (inputString) => {
        const regex = /^\d{2}:\d{2}:\d{2}$/
        return regex.test(inputString);
    }

    const toggleEditSessionTime = (sessionIndex) => {
        const newProjects = [...tasks];
        const ogTime = tasks[projectIndex].tasks[taskIndex].sessions[sessionIndex].totalTime;
        const selectedSession = newProjects[projectIndex].tasks[taskIndex].sessions[sessionIndex];
        selectedSession.totalTime = prompt('Edit time:', ogTime) || ogTime;
        if (String(selectedSession.totalTime) !== ogTime) {
            if (isValidFormat(String(selectedSession.totalTime))) {
                setTasks(newProjects);
            }
        }
    }

    const stopTimer = (taskProjectIndex, taskIndex) => {
        const updatedTasks = [...tasks];
        const t = updatedTasks[taskProjectIndex].tasks[taskIndex];
        // Clear active timer
        if (t.timerId) {
            clearInterval(t.timerId);
            activeIntervalsRef.current.delete(t.timerId);
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
        updatedTasks[taskProjectIndex].totalTime = updatedTasks[taskProjectIndex].tasks.reduce(
            (pAcc, taskItem) => {
                const [wt] = getTaskTotalTime(taskItem);
                return pAcc + wt;
            },
            0
        );

        setTasks(updatedTasks);
    };
    const stopRunningTimers = (taskProjectIndex, taskIndex, sessionIndex) => {
        const updatedTasks = [...tasks];
        const now = Date.now();
        updatedTasks.forEach((project, pIndex) => {
            project.tasks.forEach((taskItem, tIndex) => {
                if (taskItem.isRunning) {
                    // Clear active timer
                    if (taskItem.timerId) {
                        clearInterval(taskItem.timerId);
                        activeIntervalsRef.current.delete(taskItem.timerId);
                        taskItem.timerId = null;
                    }

                    const runningSession = (taskItem.sessions && taskItem.sessions.length > 0)
                        ? taskItem.sessions[taskItem.sessions.length - 1]
                        : null;

                    if (runningSession && !runningSession.breakTime) {
                        if (runningSession.startTimestamp) {
                            runningSession.runningTime = Math.max(0, now - runningSession.startTimestamp);
                        } else {
                            const startMs = new Date(`${runningSession.startDate} ${runningSession.startTime}`).getTime();
                            if (!Number.isNaN(startMs)) {
                                runningSession.runningTime = Math.max(0, now - startMs);
                            }
                        }
                    }

                    taskItem.isRunning = false;
                    const toMs = (dateStr, timeStr) => {
                        if (!dateStr || !timeStr) return null;
                        const d = new Date(`${dateStr} ${timeStr}`);
                        const ms = d.getTime();
                        return isNaN(ms) ? null : ms;
                    };

                    // Compute runningTime for any session lacking a valid duration
                    taskItem.sessions.forEach(s => {
                        if (typeof s.runningTime !== 'number' || s.runningTime === 0) {
                            const startMs = toMs(s.startDate, s.startTime);
                            const endMs = toMs(s.endDate, s.endTime);
                            if (startMs !== null && endMs !== null && endMs >= startMs) {
                                s.runningTime = endMs - startMs;
                            }
                        }
                    });

                    // Recompute task totals
                    const [workTime, breakTime] = getTaskTotalTime(taskItem);
                    const taskTotalTime = workTime; // only work time counts toward task total
                    taskItem.totalTime = taskTotalTime;
                    taskItem.runningTimeDisplay = getTotalTime(taskTotalTime);
                    taskItem.breakTime = breakTime; // optionally store break time separately
                }
            });

            // Recompute project total
            updatedTasks[pIndex].totalTime = updatedTasks[pIndex].tasks.reduce(
                (pAcc, taskItem) => {
                    const [wt] = getTaskTotalTime(taskItem);
                    return pAcc + wt;
                },
                0
            );
        });
        setTasks(updatedTasks);
        setStopModalInfo({ taskProjectIndex, taskIndex, sessionIndex });
        setSelectedReason(STOP_REASONS[0]);
        setCustomReason(''); 
        setShowStopModal(true); 
    }
    const performStopTask = () => {
        if (!stopModalInfo) {
            stopModalOpenRef.current = false;
            setShowStopModal(false);
            return;
        }
        const { taskProjectIndex, taskIndex, sessionIndex } = stopModalInfo;
        const updatedTasks = [...tasks];
        const task = updatedTasks[taskProjectIndex].tasks[taskIndex];
        const sesh = task.sessions[sessionIndex];

        const chosen = (selectedReason === 'Other') ? (customReason || 'Stopped') : selectedReason;

        const endTime = currentTime();
        const endDate = currentDate();
        const endTimestamp = Date.now();

        // Calculate actual running time
        let runningTime = 0;
        if (sesh.startTimestamp) {
            runningTime = endTimestamp - sesh.startTimestamp;
        } else {
            const startMs = new Date(`${sesh.startDate} ${sesh.startTime}`).getTime();
            if (!isNaN(startMs)) {
                runningTime = endTimestamp - startMs;
            }
        }

        // Finalize the current work session
        sesh.endDate = endDate;
        sesh.endTime = endTime;
        sesh.runningTime = runningTime;

        // Create a break session (no live timer - just records the stop)
        if (chosen !== 'End subtask') {
            const stopSession = initSession(
                endDate,
                endTime,
                endDate,
                endTime,
                0,
                chosen,
                true
            );
            stopSession.startTimestamp = endTimestamp;
            task.sessions.push(stopSession);
        }

        // Recompute totals
        const [workTime, breakTime] = getTaskTotalTime(task);
        task.runningTimeDisplay = getTotalTime(workTime);
        task.totalTime = workTime;
        task.breakTime = breakTime;

        // Recompute project total
        let projectTotalTime = 0;
        updatedTasks[taskProjectIndex].tasks.forEach((t) => {
            const [wt] = getTaskTotalTime(t);
            projectTotalTime += wt;
        });
        updatedTasks[taskProjectIndex].totalTime = projectTotalTime;
        setTasks(updatedTasks);
        stopTimer(taskProjectIndex, taskIndex); // Actually stop the timer

        // Close modal
        stopModalOpenRef.current = false;
        setShowStopModal(false);
        setStopModalInfo(null);
    };

    const cancelStopModal = () => {
        stopModalOpenRef.current = false;
        setShowStopModal(false);
        setStopModalInfo(null);
    };

    const handleDeleteSession = (projectIndex, taskIndex, sessionIndex) => {
        const updatedTasks = [...tasks];
        const project = updatedTasks[projectIndex];
        const task = project.tasks[taskIndex];
        task.sessions.splice(sessionIndex, 1);
        const [workTime, breakTime] = getTaskTotalTime(updatedTasks[projectIndex].tasks[taskIndex]);
        task.runningTimeDisplay = getTotalTime(workTime);
        task.totalTime = workTime;
        task.breakTime = breakTime;
        //const projectTotalTime = getProjectTotalTime(projectIndex);
        //project.totalTime = getTotalTime(projectTotalTime);
        //project.totalTime = projectTotalTime;
        //alert(`${project.description} totalTime: ${updatedTasks[projectIndex].totalTime}`)
        updatedTasks.map((project, projectIndex) => {
            return {
                ...project,
                totalTime: getProjectTotalTime(project)
            };
        })
        setTasks(updatedTasks);
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

    const getSessionElapsedDisplay = (session, sessionIndex) => {
        const isLatestSession = sessionIndex === (task.sessions.length - 1);
        const isActiveWorkSession = task.isRunning && isLatestSession && !session.breakTime;

        if (isActiveWorkSession && session.startTimestamp) {
            return formatDurationTime(nowMs - session.startTimestamp);
        }

        return formatDurationTime(Number(session.runningTime) || 0);
    }

    const startTimer = (taskProjectIndex, taskIndex) => {
        const updatedTasks = [...tasks];
        const task = updatedTasks[taskProjectIndex].tasks[taskIndex];
        task.timerId = setInterval(() => {
            if (!stopModalOpenRef.current && !showStopModal) { // Use ref instead of state
                setTasks(prevProjects => {
                    const updated = [...prevProjects];
                    const currentTask = updated[taskProjectIndex].tasks[taskIndex];
                    if (currentTask.isRunning && currentTask.sessions.length > 0) {
                        const runningSession = currentTask.sessions[currentTask.sessions.length - 1];
                        // Only update if it's a work session (not break)
                        if (!runningSession.breakTime) {
                            
                            const isActive = runningSession.startDate === runningSession.endDate && 
                                            runningSession.startTime === runningSession.endTime;
        
                            if (isActive && runningSession.startTimestamp) {
                                runningSession.runningTime = Date.now() - runningSession.startTimestamp;
                                
                                const [workTime, breakTime] = getTaskTotalTime(currentTask);
                                currentTask.totalTime = workTime;
                                currentTask.runningTimeDisplay = getTotalTime(workTime);
                                currentTask.breakTime = breakTime;
                                
                                updated[taskProjectIndex].totalTime = updated[taskProjectIndex].tasks.reduce(
                                    (acc, t) => {
                                        const [wt] = getTaskTotalTime(t);
                                        return acc + wt;
                                    },
                                    0
                                );
                            }
                        }
                    }
                    return updated;
                });
            }
        }, 1000);
        activeIntervalsRef.current.add(task.timerId);
        if (!stopModalOpenRef.current) {
            setTasks(updatedTasks);
        }
    };
    const handleStartTask = (taskProjectIndex, taskIndex) => {
        const updatedTasks = [...tasks];
        const task = updatedTasks[taskProjectIndex].tasks[taskIndex];
        task.sessions = task.sessions ?? [];
        task.isRunning = true;
        let reason = prompt('Reason for work:');
        if (reason === null || reason === '') {
            reason = 'continuing work';
        }

        const newStartDate = currentDate();
        const newStartTime = currentTime();
        const startTimestamp = Date.now(); // Add timestamp

        // Update the previous session's end time if it exists and has matching start/end times
        if (task.sessions.length > 0) {
            const prevSession = task.sessions[task.sessions.length - 1];
            if (prevSession.startDate === prevSession.endDate && prevSession.startTime === prevSession.endTime) {
                prevSession.endDate = newStartDate;
                prevSession.endTime = newStartTime;
                prevSession.runningTime = startTimestamp - (prevSession.startTimestamp || startTimestamp);
            }
        }

        // Add the new work session with timestamp
        const newSession = initSession(
            newStartDate,
            newStartTime,
            newStartDate,
            newStartTime,
            0,
            reason,
            false
        );
        newSession.startTimestamp = startTimestamp; // Store timestamp for accurate calculation
        task.sessions.push(newSession);

        updatedTasks.map((project, projectIndex) => {
            return {
                ...project,
                totalTime: getProjectTotalTime(project)
            };
        })
        setTasks(updatedTasks);
        startTimer(taskProjectIndex, taskIndex);
    };
    const handleDeleteTask = (taskProjectIndex, taskIndex) => {
        const updatedTasks = [...tasks];
        const project = updatedTasks[taskProjectIndex];
        project.tasks.splice(taskIndex, 1);
        updatedTasks.map((project, projectIndex) => {
            return {
                ...project,
                totalTime: getProjectTotalTime(project)
            };
        })
        setTasks(updatedTasks);
    };

    const handleSaveDescription = () => {
        if (editedDescription.trim() === '') return;
        const updatedTasks = [...tasks];
        updatedTasks[projectIndex].tasks[taskIndex].description = editedDescription.trim();
        setTasks(updatedTasks);
        setEditingDescription(false);
    };

    const handleCancelEditDescription = () => {
        setEditedDescription(task.description || '');
        setEditingDescription(false);
    };

    const handleSaveSessionReason = (sessionIndex) => {
        if (editedSessionReason.trim() === '') return;
        const updatedTasks = [...tasks];
        updatedTasks[projectIndex].tasks[taskIndex].sessions[sessionIndex].reason = editedSessionReason.trim();
        updatedTasks[projectIndex].tasks[taskIndex].sessions[sessionIndex].description = editedSessionReason.trim();
        setTasks(updatedTasks);
        setEditingSessionIndex(null);
    };

    const handleCancelEditSession = () => {
        setEditedSessionReason('');
        setEditingSessionIndex(null);
    };

    const getTime = (date) => {
        const newDate = String(date).split(', ')[1].replace(' ', '');
        const timeArray = newDate.split(':');
        const hours = timeArray[0];
        const minutes = timeArray[1];
        const timeOfDay = timeArray[2].substring(2, 4);
        return `${hours}:${minutes}${timeOfDay}`
    }
    const getTaskHeader = (task) => {
        console.log('getTaskHeader => task:', task.description);
        return <div className='flexContainer centerVertical'>
                    <div className='flex2Column contentLeft'>
                        {task.description || 'New Task'}
                    </div>
                    <div className='flex2Column contentRight'>
                        <span
                            className='button p-5 ml-5 mr-10 size12'
                            title='Edit task'
                            data-collapse-ignore='true'
                            style={{ position: 'relative', zIndex: 3 }}
                            onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                            }}
                            onTouchStart={(event) => {
                                event.stopPropagation();
                            }}
                            onClick={(event) => {
                                event.stopPropagation();
                                setEditedDescription(task.description || '');
                                setEditingDescription(true);
                            }}
                        >
                            ✏️
                        </span>
                    </div>
                </div>;
    }

    return <div key={`task-${projectIndex}-${taskIndex}-${String(task?.description || 'task')}`} className=''>
        <div className=''>
            <div className='centerVertical'>
                <div className='containerDetail color-yellow bg-tinted mt-5 p-10 size20'>
                    {
                        editingDescription
                        ? <div className='flexContainer centerVertical'>
                            <input
                                className='flex1Column size20 color-yellow bg-dark p-5 r-5'
                                style={{ border: '1px solid #0cf500', outline: 'none' }}
                                type='text'
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveDescription();
                                    if (e.key === 'Escape') handleCancelEditDescription();
                                }}
                                autoFocus
                            />
                            <span className='button p-5 ml-5 size25' onClick={handleSaveDescription}>✅</span>
                            <span className='button p-5 ml-10 size25' onClick={handleCancelEditDescription}>❌</span>
                        </div>
                        : <CollapseToggleButton
                            title={getTaskHeader(task)}
                            isCollapsed={collapse}
                            setCollapse={setCollapse}
                            align='left'
                        />
                    }
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
                                //onClick={() => handleStopTask(projectIndex, taskIndex, (task.sessions.length-1))}
                                onClick={() => stopRunningTimers(projectIndex, taskIndex, (task.sessions.length-1))}
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
                        <div className='' key={`task-session-${projectIndex}-${taskIndex}-${sessionIndex}`}>
                            <div>
                                <div key={`task-session-container-${projectIndex}-${taskIndex}-${sessionIndex}-${String(session?.startDate || 'date')}`}>
                                    <div className={`containerDetail ${(session.breakTime)?'':'bg-lite'} ${(sessionIndex > 0) ? 'mt-5' : '' }`}>
                                        <div className='containerDetail color-lite p-10 flexContainer centerVertical'>
                                            <div className='flex2Column contentLeft'>
                                                {
                                                    editingSessionIndex !== sessionIndex
                                                    ? <div className='color-lite size12'>{String(session.startDate).split(', ')[0]}</div>
                                                    : null
                                                }
                                                {
                                                    editingSessionIndex === sessionIndex
                                                    ? <div className='flexContainer centerVertical mt-5'>
                                                        <input
                                                            className='flex1Column size20 color-yellow bg-dark p-5 r-5'
                                                            style={{ border: '1px solid #0cf500', outline: 'none' }}
                                                            type='text'
                                                            value={editedSessionReason}
                                                            onChange={(e) => setEditedSessionReason(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveSessionReason(sessionIndex);
                                                                if (e.key === 'Escape') handleCancelEditSession();
                                                            }}
                                                            autoFocus
                                                        />
                                                        <span 
                                                            className='flexColumn button p-5 ml-5 size25' 
                                                            onClick={() => handleSaveSessionReason(sessionIndex)}
                                                        >
                                                            ✅
                                                        </span>
                                                        <span 
                                                            className='flexColumn button p-5 ml-5 size12' 
                                                            onClick={handleCancelEditSession}
                                                        >
                                                            ❌
                                                        </span>
                                                    </div>
                                                    : <div className='color-yellow flexContainer centerVertical contentLeft'>
                                                        <span>
                                                            {session.reason || `Session ${sessionIndex + 1}`}
                                                        </span>
                                                    </div>
                                                }
                                            </div>
                                            {
                                                editingSessionIndex !== sessionIndex
                                                ? <React.Fragment>
                                                        <div
                                                            className='flexColumn containerDetail bg-lite button p-12 ml-5 size10'
                                                            title='Edit session'
                                                            onClick={() => {
                                                                setEditedSessionReason(session.reason || session.description || '');
                                                                setEditingSessionIndex(sessionIndex);
                                                            }}
                                                        >
                                                            ✏️
                                                        </div>
                                                        <div className='flexColumncontentRight'>
                                                            <span
                                                                title='delete session'
                                                                className='containerDetail button bg-lite ml-5 p-10'
                                                                onClick={() => handleDeleteSession(projectIndex, taskIndex, sessionIndex)}
                                                            >
                                                                {icons.delete}
                                                            </span>
                                                        </div>
                                                    </React.Fragment>
                                                    : null
                                            }
                                        </div>
                                        <div className='flexContainer p-10 size15'>
                                            <div className='flex2Column contentLeft color-lite'>
                                                {getTime(session.startDate)}-{getTime(session.endDate)}
                                            </div>
                                            <div
                                                title='toggle edit'
                                                className='flex2Column contentRight button color-yellow'
                                                onClick={() => toggleEditSessionTime(sessionIndex)}
                                            >
                                                {getSessionElapsedDisplay(session, sessionIndex)}
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
        {showStopModal  && (
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