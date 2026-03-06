import React, { useState } from 'react';
import { useTaskBreakTimer, TIMER_MODE } from './useTaskBreakTimer';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getTotalTime from '../utils/getTotalTime';

export default function Group({
    tasks,
    setTasks,
    taskGroup,
    index,
    tracking
}) {
    
  const {
    itemsWithElapsed,
    mode,
    addAndStartTask,
    stopCurrentTask,
    addAndStartBreak,
    stopBreakAndStartTask,
  } = useTaskBreakTimer();

  const [showBreakModal, setShowBreakModal] = useState(false);
  const [collapse, setCollapse] = useState(true);
  const [selectedBreakType, setSelectedBreakType] = useState('Coffee');

  const stopsArray = ['Next Task', 'Coffee', 'Lunch', 'Personal', 'Break', 'Water', 'Stretch', 'Snack', 'Restroom', 'Other', 'End of Day'];

  const handleMainButtonClick = () => {
    if (mode === TIMER_MODE.IDLE) {
      // Add new task & start timer
      const newTask = prompt('Enter task label:', 'continued...');
      //addAndStartTask('New Task');
      addAndStartTask(newTask || 'continued...');
    } else if (mode === TIMER_MODE.TASK_RUNNING) {
      // Stop task, open modal for break
      stopCurrentTask();
      setShowBreakModal(true);
    } else if (mode === TIMER_MODE.BREAK_RUNNING) {
      // End break & start new task
      const newTask = prompt('Enter task label:', 'continued...');
      stopBreakAndStartTask(newTask || 'continued...');
    }
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

  const mainButtonLabel =
    mode === TIMER_MODE.IDLE
      ? 'Add Task'
      : mode === TIMER_MODE.TASK_RUNNING
        ? 'Stop Task / Add Break'
        : 'End Break / Add Task';

  const handleBreakConfirm = () => {
    addAndStartBreak(selectedBreakType);
    setShowBreakModal(false);
  };
  const getTime = (startTime) => {
        const startDate = new Date(startTime).toLocaleString()
        return startDate.split(', ')[1];
    }
    const getShortTime = (date) => {
        const startDate = new Date(date).toLocaleString()
        const startTime = startDate.split(', ')[1];
        const hours = startTime.split(':')[0];
        const minutes = startTime.split(':')[1];
        return `${hours}:${minutes}`;
    }
    const getDate = (startTime) => {
        const startDate = new Date(startTime).toLocaleString()
        return startDate.split(', ')[0];
    }
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
    const getTitleDate = (item) => {
        const date = (
            <div className='size12 color-lite'>
                {getDate(item.startTime)}
            </div>
        );
        return date;
    }
    const getDescription = (item) => {
        const description = (
                <div className='mt--5 size20'>
                    {item.label || item.description}
                </div>
        );
        return description;
    }
  return (
    <div className='containerDetail p-10 bg-lite size20 color-lite'>
        <div 
            className='button containerDetail mb-5 bg-green p-10 width-100-percent color-lite' 
            onClick={handleMainButtonClick}
        >
            {mainButtonLabel}
        </div>
        <div className='containerDetail p-10'>
            {tasks.map((item, itemIndex) => (
                <div className={`containerDetail mb-5 ${(item.type !== 'break') ? 'bg-lite' : ''}`} key={item.id || `group-task-${index}-${itemIndex}-${item.startTime || item.description || 'task'}`}>
                    
                    <div className='centerVertical'>
                        <div className='containerDetail color-yellow'>
                            <CollapseToggleButton
                                title={getTitleDate(item)}
                                isCollapsed={collapse}
                                setCollapse={setCollapse}
                                align='left'
                                description={getDescription(item)}
                            />
                        </div>
                    </div>
                    {
                        (collapse)
                        ? null
                        : <div className='containerDetail mt-5 flexContainer p-10 size15 mb-5'>
                            <div className='flex2Column color-lite contentLeft pl-10'>
                                Work: {getTotalTime(getTaskTotalTime(item)[0])}<br/>
                                Break: {getTotalTime(getTaskTotalTime(item)[1])}
                            </div>
                            <div className='flex2Column color-lite contentRight pr-15'>
                                {getWorkSessionCount(item)} Session{getWorkSessionCount(item) === 1 ? '' : 's'}<br/>
                                {
                                    (collapse)
                                    ? null
                                    : <div>{item.sessions.filter(s => s.breakTime === true).length} Break{item.sessions.filter(s => s.breakTime === true).length === 1 ? '' : 's'}</div>
                                }
                            </div>
                        </div>
                    }
                    <div className=' flexContainer size15 p-10 contentLeft'>
                        <div className='flex2Column contentLeft'>
                            <span className='ml-5 mr-5'>{getShortTime(item.sessions[item.sessions.length - 1].startTime)}</span>
                            - 
                        {
                            (item.endTime)
                            ? <span className='ml-10'>{getShortTime(item.endTime)}</span>
                            : (item.sessions && item.sessions.length > 0) ? <span className='ml-5'>{getShortTime(item.sessions[0].endDate)}</span> : <span className='ml-5 color-yellow'>Currently active</span>
                        }
                        </div>
                        <div className='flex2Column contentRight color-yellow pr-10'>
                            {item.runningTimeDisplay ||formatDurationTime(item.elapsedMs)}
                        </div>
                    </div>
                    <div>
                        {
                            item.sessions && item.sessions.length > 0 && !collapse && (
                                <div className='containerDetail mt-5 width-100-percent'>
                                    {item.sessions.map((session, idx) => (
                                        <div key={idx} className='containerDetail mb-5 bg-lite'>
                                            <div className='containerDetail flexContainer'>
                                                <div className='flex2Column contentLeft'>
                                                    <div className='p-10'>
                                                        <div className='size12'>{session.startDate.split(', ')[0]}</div>
                                                        <div className='size20 color-yellow mt--5'>{session.reason || `Session ${idx + 1}`}</div>
                                                    </div>
                                                </div>
                                                <div className='flexColumn contentRight color-yellow'>
                                                    <div className='containerDetail button bg-lite p-10 mr-10'>
                                                        {icons.delete}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='flexContainer mb-2 p-10 m-5 size15'>
                                                <div className='flex2Column contentLeft'>
                                                    <span className='mr-5'>{getShortTime(session.startDate)}</span>
                                                    - 
                                                    {
                                                        (session.endDate)
                                                        ? <span className='ml-5'>{getTime(session.endDate)}</span>
                                                        : <span className='ml-5 color-yellow'>Currently active</span>
                                                    }
                                                </div>
                                                <div className='flexColumn contentRight color-yellow'>
                                                    {formatDurationTime(session.runningTime || 0)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>
            ))}
        </div>
        <div className='containerDetail p-10'>
            {itemsWithElapsed.map((item) => (
                <div className={`containerDetail mb-5 ${(item.type !== 'break') ? 'bg-lite' : ''}`} key={item.id}>
                    <div className='containerDetail flexContainer color-yellow mb-5'>
                        <div className='flex2Column contentLeft pb-5 pl-5'>
                            <span className='size12 color-lite mb--5'>
                                {getDate(item.startTime)}
                            </span>
                            <br/>
                            {item.label || item.description} 
                        </div>
                        <div className='flexColumn contentRight p-5'>
                            <span className='containerDetail button bg-lite p-10 mr--5'>
                                {icons.delete}
                            </span>
                        </div>
                    </div>
                    <div className=' flexContainer size15 p-10 contentLeft'>
                        <div className='flex2Column contentLeft'>
                            <span className='mr-5'>{getTime(item.startTime)}</span>
                            - 
                        {
                            (item.endTime)
                            ? <span className='ml-5'>{getTime(item.endTime)}</span>
                            : <span className='ml-5 color-yellow'>Currently active</span>
                        }
                        </div>
                        <div className='flex2Column contentRight color-yellow'>
                            {formatDurationTime(item.elapsedMs)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        {showBreakModal && (
            <div className='containerDetail button bg-lite p-10 color-lite mt-5'>
                <select
                    className='containerDetail button p-10 color-lite mb-5 width-100-percent'
                    value={selectedBreakType}
                    onChange={(e) => setSelectedBreakType(e.target.value)}
                >
                    {
                        stopsArray.map((stop, idx) => <option value={stop} key={`stop${idx}`}>{stop}</option>)
                    }
                </select>
                <div onClick={handleBreakConfirm} className='containerDetail button bg-green p-10 color-lite'>Start Break</div>
            </div>
        )}
    </div>
  );
}
