import { useEffect, useState, useMemo, useRef } from 'react';
import initializeData from '../utils/InitializeData';
import initTasks from './initTasks';
import getTotalTime from '../utils/getTotalTime';

export const TIMER_MODE = {
  IDLE: 'IDLE',
  TASK_RUNNING: 'TASK_RUNNING',
  BREAK_RUNNING: 'BREAK_RUNNING',
};

const createId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * Manage a timeline of tasks & breaks with a single active timer.
 *
 * API:
 * - addAndStartTask(label)
 * - stopCurrentTask()
 * - addAndStartBreak(label)
 * - stopBreakAndStartTask(taskLabel)
 * - stopActiveItem()
 *
 * Exposes:
 * - items
 * - itemsWithElapsed
 * - mode
 * - activeItem
 * - activeItemId
 * - getElapsedFor(itemOrId)
 */
export function useTaskBreakTimer(initialItems = []) {
    const [tasks, setTasks] = useState(initializeData('taskTracking', initTasks));
    const [items, setItems] = useState(initialItems);
    const [mode, setMode] = useState(TIMER_MODE.IDLE);
    const [activeItemId, setActiveItemId] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [showStopModal, setShowStopModal] = useState(false);
    const stopModalOpenRef = useRef(false);

    const getTaskTotalTime = (task) => {
        if (!task.tasks) {
            return 0;
        }
        return task.tasks.reduce((total, task) => total + task.totalTime, 0);
    }

  // Global-ish ticker for live durations
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const activeItem = useMemo(
    () => items.find((it) => it.id === activeItemId) || null,
    [items, activeItemId]
  );

  const getElapsedMs = (itemOrId) => {
    let item = itemOrId;
    if (typeof itemOrId === 'string') {
      item = items.find((it) => it.id === itemOrId);
    }
    if (!item) return 0;
    const end = item.endTime || now;
    return Math.max(0, end - item.startTime);
  };

  const itemsWithElapsed = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        elapsedMs: getElapsedMs(it),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, now]
  );

  /**
   * Add a new task and start its timer.
   * If a break is currently running, it will be stopped first.
   */
  const addAndStartTask = (label) => {

    setItems((prevItems) => {
      const updated = [...prevItems];

      // If a break is running, stop it
      if (mode === TIMER_MODE.BREAK_RUNNING && activeItemId) {
        const idx = updated.findIndex((it) => it.id === activeItemId);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            endTime: Date.now(),
          };
        }
      }

      const newTask = {
        id: createId(),
        type: 'task',
        label: label || 'New Task',
        startTime: Date.now(),
        endTime: null,
      };

      updated.push(newTask);

      // Update active state & mode
      setActiveItemId(newTask.id);
      setMode(TIMER_MODE.TASK_RUNNING);

      return updated;
      
    });
  };
  /////////////////////////////////
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
        if (!stopModalOpenRef.current) {
            setTasks(updatedTasks);
        }
    };
    /////////////////////////////////

  /**
   * Stop the currently running task.
   * This does NOT start a break automatically.
   * Typically you call this when the user hits "Stop"
   * and THEN show your break modal.
   */
  const stopCurrentTask = () => {
    if (mode !== TIMER_MODE.TASK_RUNNING || !activeItemId) return;

    setItems((prevItems) => {
      const updated = prevItems.map((it) =>
        it.id === activeItemId ? { ...it, endTime: Date.now() } : it
      );
      return updated;
    });

    setActiveItemId(null);
    setMode(TIMER_MODE.IDLE);
  };

  /**
   * Add a break item and start its timer.
   * You would normally call this AFTER stopCurrentTask()
   * once the user chose a break type from your modal.
   */
  const addAndStartBreak = (breakLabel) => {
    const label = breakLabel || 'Break';

    const newBreak = {
      id: createId(),
      type: 'break',
      label,
      startTime: Date.now(),
      endTime: null,
    };

    setItems((prevItems) => [...prevItems, newBreak]);

    setActiveItemId(newBreak.id);
    setMode(TIMER_MODE.BREAK_RUNNING);
  };

  /**
   * Stop the currently running break and immediately
   * start a new task.
   */
  const stopBreakAndStartTask = (taskLabel) => {
    if (mode !== TIMER_MODE.BREAK_RUNNING || !activeItemId) {
      // If no break is running, just start a task
      addAndStartTask(taskLabel);
      return;
    }

    setItems((prevItems) => {
      const updated = prevItems.map((it) =>
        it.id === activeItemId ? { ...it, endTime: Date.now() } : it
      );

      const newTask = {
        id: createId(),
        type: 'task',
        label: taskLabel || 'New Task',
        startTime: Date.now(),
        endTime: null,
      };

      updated.push(newTask);

      // update outer state
      setActiveItemId(newTask.id);
      setMode(TIMER_MODE.TASK_RUNNING);

      return updated;
    });
  };

  /**
   * Stop whatever is active (task or break) and return to IDLE.
   */
  const stopActiveItem = () => {
    if (!activeItemId) return;

    setItems((prevItems) =>
      prevItems.map((it) =>
        it.id === activeItemId && it.endTime == null
          ? { ...it, endTime: Date.now() }
          : it
      )
    );
    setActiveItemId(null);
    setMode(TIMER_MODE.IDLE);
  };

  return {
    items,
    itemsWithElapsed,   // each has elapsedMs
    mode,
    activeItem,
    activeItemId,
    addAndStartTask,
    stopCurrentTask,
    addAndStartBreak,
    stopBreakAndStartTask,
    stopActiveItem,
    getElapsedMs,
    startTimer,
    stopModalOpenRef,
    showStopModal,
    setShowStopModal
  };
}