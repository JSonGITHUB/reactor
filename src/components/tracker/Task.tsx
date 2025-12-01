import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import getKey from '../utils/KeyGenerator';
import getTotalTime from '../utils/getTotalTime';
import initSession from './initSession';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import validate from '../utils/validate';

type MaybeNumberString = number | string;

interface Session {
  startDate: string;
  startTime: MaybeNumberString;
  endDate: string;
  endTime: MaybeNumberString;
  reason: string;
  runningTime: number;
  totalTime?: string;
  breakTime?: boolean;
}

interface TaskType {
  description?: string;
  isCollapsed?: boolean;
  isRunning?: boolean;
  sessions: Session[];
  timerId?: number | null;
  totalTime?: number;
  runningTimeDisplay?: string;
  runningTime?: number;
  breakTime?: number;
}

interface Project {
  description?: string;
  tasks: TaskType[];
  totalTime?: number;
}

interface StopModalInfo {
  taskProjectIndex: number;
  taskIndex: number;
  sessionIndex: number;
}

interface TaskProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  taskIndex: number;
  task: TaskType;
  projectIndex: number;
  getProjectTotalTime: (project: Project) => number;
  tracking: 'projects' | string;
}

export const Task: React.FC<TaskProps> = ({
  projects,
  setProjects,
  taskIndex,
  task,
  projectIndex,
  getProjectTotalTime,
  tracking
}) => {
  const [collapse, setCollapse] = useState<boolean>(task.isCollapsed || false);

  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [stopModalInfo, setStopModalInfo] = useState<StopModalInfo | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const STOP_REASONS: string[] = [
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

  // Tuple: [workTime, breakTime]
  const getTaskTotalTime = (t: TaskType): [number, number] => {
    return t.sessions.reduce<[number, number]>((acc, session) => {
      const runTime = session.runningTime || 0;
      if (session.breakTime === true) {
        acc[1] += runTime;
      } else {
        acc[0] += runTime;
      }
      return acc;
    }, [0, 0]);
  };

  const getWorkSessionCount = (t: TaskType): number => {
    if (!t || !Array.isArray(t.sessions)) return 0;
    return t.sessions.length - t.sessions.filter(s => s?.breakTime === true).length;
  };

  useEffect(() => {
    const newProjects = [...projects];
    newProjects[projectIndex].tasks[taskIndex].isCollapsed = collapse;
    const dataToString = JSON.stringify(newProjects);
    if (tracking === 'projects') {
      localStorage.setItem('projects', dataToString);
    } else {
      localStorage.setItem('taskTracking', dataToString);
    }
  }, [collapse]); // eslint-disable-line react-hooks/exhaustive-deps

  const isValidFormat = (inputString: string): boolean => {
    const regex = /^\d{2}:\d{2}:\d{2}$/;
    return regex.test(inputString);
  };

  const toggleEditSessionTime = (sessionIndex: number): void => {
    const newProjects = [...projects];
    const ogTime = String(projects[projectIndex].tasks[taskIndex].sessions[sessionIndex].totalTime || '');
    const selectedSession = newProjects[projectIndex].tasks[taskIndex].sessions[sessionIndex];
    const edited = prompt('Edit time:', ogTime) || ogTime;
    selectedSession.totalTime = edited;
    if (String(selectedSession.totalTime) !== ogTime) {
      if (isValidFormat(String(selectedSession.totalTime))) {
        setProjects(newProjects);
      }
    }
  };

  const getTaskTotalDisplay = (t: TaskType): string => {
    if (t.runningTimeDisplay && t.runningTimeDisplay !== '') {
      return t.runningTimeDisplay;
    }
    return '';
  };

  const stopTimer = (taskProjectIndex: number, tIndex: number): void => {
    const updatedProjects = [...projects];
    const t = updatedProjects[taskProjectIndex].tasks[tIndex];
    if (t.timerId) {
      clearInterval(t.timerId);
      t.timerId = null;
    }
    t.isRunning = false;

    const toMs = (dateStr?: string, timeVal?: MaybeNumberString): number | null => {
      if (!dateStr || timeVal === undefined || timeVal === null) return null;
      // If timeVal is a number epoch, use it; otherwise compose from date string
      if (typeof timeVal === 'number') return Number(timeVal);
      const composed = new Date(`${dateStr} ${String(timeVal)}`);
      const ms = composed.getTime();
      return isNaN(ms) ? null : ms;
    };

    t.sessions.forEach(s => {
      if (typeof s.runningTime !== 'number' || s.runningTime === 0) {
        const startMs = toMs(s.startDate, s.startTime);
        const endMs = toMs(s.endDate, s.endTime);
        if (startMs !== null && endMs !== null && endMs >= startMs) {
          s.runningTime = endMs - startMs;
        }
      }
    });

    const [workTime, breakTime] = getTaskTotalTime(t);
    const taskTotalTime = workTime;
    t.totalTime = taskTotalTime;
    t.runningTimeDisplay = getTotalTime(taskTotalTime);
    t.breakTime = breakTime;

    updatedProjects[taskProjectIndex].totalTime = updatedProjects[taskProjectIndex].tasks.reduce((pAcc, taskItem) => {
      const [wt] = getTaskTotalTime(taskItem);
      return pAcc + wt;
    }, 0);

    setProjects(updatedProjects);
  };

  const handleStopTask = (taskProjectIndex: number, tIndex: number, sessionIndex: number): void => {
    setStopModalInfo({ taskProjectIndex, taskIndex: tIndex, sessionIndex });
    setSelectedReason(STOP_REASONS[0]);
    setCustomReason('');
    setShowStopModal(true);
  };

  const performStopTask = (): void => {
    if (!stopModalInfo) {
      setShowStopModal(false);
      return;
    }
    const { taskProjectIndex, taskIndex: tIndex, sessionIndex } = stopModalInfo;
    const updatedProjects = [...projects];
    const project = updatedProjects[taskProjectIndex];
    const t = project.tasks[tIndex];
    const sesh = t.sessions[sessionIndex];

    const chosen = (selectedReason === 'Other') ? (customReason || 'Stopped') : selectedReason;

    t.sessions = t.sessions ?? [];
    t.isRunning = false;

    const startTime = t.sessions[t.sessions.length - 1]?.startTime;
    const startDate = t.sessions[t.sessions.length - 1]?.startDate;
    const endTime = currentTime();
    const endDate = currentDate();

    let startEpoch = 0;
    if (typeof startTime === 'number') startEpoch = startTime;
    else {
      const composed = new Date(`${startDate} ${String(startTime)}`);
      startEpoch = composed.getTime();
    }
    const runningTime = Math.max(0, Number(endTime) - Number(startEpoch));

    sesh.endDate = endDate;
    sesh.endTime = endTime;
    sesh.runningTime = runningTime;

    const stopSession: Session = initSession(
      endDate,
      endTime,
      endDate,
      endTime,
      0,
      chosen,
      true
    );
    if (chosen !== 'End subtask') {
      t.sessions.push(stopSession);
    }

    const [workTime, breakTime] = getTaskTotalTime(updatedProjects[taskProjectIndex].tasks[tIndex]);
    t.runningTimeDisplay = getTotalTime(workTime);
    t.totalTime = workTime;
    t.breakTime = breakTime;

    let projectTotalTime = 0;
    updatedProjects[taskProjectIndex].tasks.forEach((tk) => {
      const [wt] = getTaskTotalTime(tk);
      projectTotalTime += wt;
    });
    updatedProjects[taskProjectIndex].totalTime = projectTotalTime;

    setProjects(updatedProjects);
    stopTimer(taskProjectIndex, tIndex);

    setShowStopModal(false);
    setStopModalInfo(null);
  };

  const cancelStopModal = (): void => {
    setShowStopModal(false);
    setStopModalInfo(null);
  };

  const handleDeleteSession = (pIndex: number, tIndex: number, sessionIndex: number): void => {
    const updatedProjects = [...projects];
    const project = updatedProjects[pIndex];
    const t = project.tasks[tIndex];
    t.sessions.splice(sessionIndex, 1);
    const [workTime, breakTime] = getTaskTotalTime(updatedProjects[pIndex].tasks[tIndex]);
    t.runningTimeDisplay = getTotalTime(workTime);
    t.totalTime = workTime;
    t.breakTime = breakTime;

    updatedProjects.map((proj) => ({
      ...proj,
      totalTime: getProjectTotalTime(proj)
    }));
    setProjects(updatedProjects);
  };

  function formatDurationTime(milliseconds: number): string {
    milliseconds = Math.max(0, milliseconds);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return formattedTime;
  }

  const startTimer = (taskProjectIndex: number, tIndex: number): void => {
    const updatedProjects = [...projects];
    const currentTask = updatedProjects[taskProjectIndex].tasks[tIndex];
    currentTask.timerId = window.setInterval(() => {
      updatedProjects.map((proj) => ({
        ...proj,
        totalTime: getProjectTotalTime(proj)
      }));
      setProjects(updatedProjects);
    }, 1000);
  };

  const handleStartTask = (taskProjectIndex: number, tIndex: number): void => {
    const updatedProjects = [...projects];
    const t = updatedProjects[taskProjectIndex].tasks[tIndex];
    t.sessions = t.sessions ?? [];
    t.isRunning = true;
    let reason = prompt('Reason for work:') || '';
    if (reason === '') {
      reason = 'continuing work';
    }

    const newStartDate = currentDate();
    const newStartTime = currentTime();

    if (t.sessions.length > 0) {
      const prevSession = t.sessions[t.sessions.length - 1];
      if (prevSession.startDate === prevSession.endDate && prevSession.startTime === prevSession.endTime) {
        prevSession.endDate = newStartDate;
        prevSession.endTime = newStartTime;
        const prevStart = typeof prevSession.startTime === 'number'
          ? Number(prevSession.startTime)
          : new Date(`${prevSession.startDate} ${String(prevSession.startTime)}`).getTime();
        prevSession.runningTime = Math.max(0, Number(newStartTime) - prevStart);
      }
    }

    const newSession: Session = initSession(
      newStartDate,
      newStartTime,
      newStartDate,
      newStartTime,
      0,
      reason,
      false
    );
    t.sessions.push(newSession);

    updatedProjects.map((proj) => ({
      ...proj,
      totalTime: getProjectTotalTime(proj)
    }));
    setProjects(updatedProjects);
    startTimer(taskProjectIndex, tIndex);
  };

  const handleDeleteTask = (taskProjectIndex: number, tIndex: number): void => {
    const updatedProjects = [...projects];
    const project = updatedProjects[taskProjectIndex];
    project.tasks.splice(tIndex, 1);
    updatedProjects.map((proj) => ({
      ...proj,
      totalTime: getProjectTotalTime(proj)
    }));
    setProjects(updatedProjects);
  };

  const getTime = (date: string | number): string => {
    const newDate = String(date).split(', ')[1]?.replace(' ', '') || '';
    const timeArray = newDate.split(':');
    const hours = timeArray[0] || '';
    const minutes = timeArray[1] || '';
    const timeOfDay = (timeArray[2] || '').substring(2, 4);
    return `${hours}:${minutes}${timeOfDay}`;
  };

  return (
    <div key={getKey(`${task.description || ''}${taskIndex}`)} className=''>
      <div className=''>
        <div className='centerVertical'>
          <div className='containerDetail color-yellow bg-tinted p-20'>
            <CollapseToggleButton
              title={`${task.description || ''}`}
              isCollapsed={collapse}
              setCollapse={setCollapse}
              align='left'
            />
          </div>
        </div>
        <div className='containerDetail mt-5 flexContainer p-10 size15'>
          <div className='flex2Column color-lite contentLeft pl-20'>
            Work: {getTotalTime(getTaskTotalTime(task)[0])}<br />
            Break: {getTotalTime(getTaskTotalTime(task)[1])}
          </div>
          <div className='flex2Column color-lite contentRight pr-25'>
            {getWorkSessionCount(task)} Session{getWorkSessionCount(task) === 1 ? '' : 's'}<br />
            {task.sessions.filter(s => s.breakTime === true).length} Break{task.sessions.filter(s => s.breakTime === true).length === 1 ? '' : 's'}
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
                      onClick={() => handleStopTask(projectIndex, taskIndex, (task.sessions.length - 1))}
                    >
                      {icons.stop as React.ReactNode}
                    </div>
                  : <div
                      title='track'
                      className='containerDetail p-10 button flex2Column bg-lite button m-5'
                      onClick={() => handleStartTask(projectIndex, taskIndex)}
                    >
                      {icons.track as React.ReactNode}
                    </div>
              }
              <div
                title='delete'
                className='containerBox flex2Column bg-lite button m-5'
                onClick={() => handleDeleteTask(projectIndex, taskIndex)}
              >
                {icons.delete as React.ReactNode}
              </div>
            </div>
      }
      {
        (collapse)
          ? null
          : <div className='containerDetail mt-5'>
              {
                task.sessions.map((session, sessionIndex) => (
                  <div className='' key={getKey(`${task.description || ''}${sessionIndex}`)}>
                    <div>
                      <div key={getKey(`${task.description || ''}${sessionIndex}${String(session.startDate).split(', ')[0]}`)}>
                        <div className={`containerDetail ${(session.breakTime) ? '' : 'bg-lite'} ${(sessionIndex > 0) ? 'mt-5' : ''}`}>
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
                                {icons.delete as React.ReactNode}
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
  );
};

export default Task;
