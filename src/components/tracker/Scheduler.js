import React, { useState, useEffect, useRef } from 'react';
import Sounds from '../sound/Sounds';

const parseSchedule = (rawText, baseStartTime = null) => {
    const now = baseStartTime ? new Date(baseStartTime) : new Date();
    let currentTime = new Date(now);
    const blocks = rawText.split(/\n\s*\n/).filter(Boolean);

    return blocks.map((block, index) => {
        const lines = block.split('\n').filter(Boolean);
        const firstLine = lines[0] || '';
        const rest = lines.slice(1).join('\n').trim();

        const match = firstLine.match(
            /^(?:✅\s*)?(.+?)\s*[–—-]\s*(\d+)\s*(min|mins|minutes|hr|hrs|hour|hours|s|sec|secs|seconds)\b/i
        ) ||
            firstLine.match(
                /^(?:✅\s*)?(.+?)\s*-\s*(\d+)\s*(min|mins|minutes|hr|hrs|hour|hours|s|sec|secs|seconds)\b/i
        );
        let title = '', durationStr = '', notes = rest;
        let timeInSeconds = 1800; // default 30 min

        if (match) {
            title = match[1].trim();
            durationStr = `${match[2]} ${match[3]}`;
            const num = parseInt(match[2], 10);
            const unit = match[3].toLowerCase();
            if (unit.startsWith('h')) timeInSeconds = num * 60 * 60;
            else if (unit.startsWith('m')) timeInSeconds = num * 60;
            else if (unit.startsWith('s')) timeInSeconds = num;
        } else {
            title = firstLine.trim();
        }

        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime.getTime() + timeInSeconds * 1000);
        currentTime = new Date(endTime);

        return {
            id: index,
            title,
            notes,
            duration: timeInSeconds,
            remaining: timeInSeconds,
            isActive: false,
            isCompleted: false,
            startTime,
            endTime,
            editingField: null, // 'title' | 'duration' | 'notes' | null
        };
    });
};

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    //if (s === '00') return <div>{m}<span className='copyright'>min</span></div>;
    return <div>{h}:{m}:{s}</div>;
};

const formatClock = (date) => {
    if (!date) return '';
    const d = new Date(date);
    let time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (time[0] === '0') time = time.slice(1);
    return time.replace(' PM', 'pm').replace(' AM', 'am');
};

const Scheduler = () => {
    const [rawInput, setRawInput] = useState('');
    const [tasks, setTasks] = useState([]);
    const [scheduleStart, setScheduleStart] = useState(null);
    const intervalRef = useRef(null);
    const [activeTaskId, setActiveTaskId] = useState(null);

    const scheduleRef = useRef(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedTasks = localStorage.getItem('schedulerTasks');
        const savedMeta = localStorage.getItem('schedulerMeta');
        console.log(`Scheduler => savedTasks: ${JSON.stringify(savedTasks, null, 2)}`);
        if (savedTasks && savedMeta) {
            try {
                const parsedTasks = JSON.parse(savedTasks);
                const meta = JSON.parse(savedMeta);
                setRawInput(meta.rawInput || '');
                setScheduleStart(meta.scheduleStart ? new Date(meta.scheduleStart) : null);
                const now = Date.now();
                const lastSaved = meta.lastSaved ? new Date(meta.lastSaved).getTime() : now;
                const elapsed = Math.floor((now - lastSaved) / 1000);
                let foundActive = false;
                const updatedTasks = parsedTasks.map(task => {
                    if (task.isActive && !task.isCompleted) {
                        foundActive = true;
                        let newRemaining = task.remaining - elapsed;
                        if (newRemaining <= 0) {
                            return { ...task, isActive: false, isCompleted: true, remaining: 0 };
                        }
                        return { ...task, remaining: newRemaining > 0 ? newRemaining : 0 };
                    }
                    return task;
                });
                setTasks(updatedTasks);
                if (foundActive) {
                    const activeTask = updatedTasks.find(t => t.isActive && !t.isCompleted);
                    if (activeTask) {
                        setActiveTaskId(activeTask.id);
                        startTask(activeTask.id, updatedTasks);
                    }
                }
            } catch (e) {
                //localStorage.removeItem('schedulerTasks');
                //localStorage.removeItem('schedulerMeta');
            }
        }
        // eslint-disable-next-line
    }, []);

    // Save to localStorage on every tasks/rawInput/scheduleStart change
    useEffect(() => {
        //if (tasks.length > 0) {
            localStorage.setItem('schedulerTasks', JSON.stringify(tasks));
            localStorage.setItem('schedulerMeta', JSON.stringify({
                rawInput,
                scheduleStart,
                lastSaved: new Date().toISOString()
            }));
        //}
    }, [tasks, rawInput, scheduleStart]);
    useEffect(() => {
        if (activeTaskId !== null && scheduleRef.current) {
            const activeEl = scheduleRef.current.querySelector(`[data-task-id="${activeTaskId}"]`);
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeTaskId]);

    // Inline editing logic
    const handleFieldEdit = (id, field) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, editingField: field } : { ...task, editingField: null }
            )
        );
    };

    const handleFieldChange = (id, field, value) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id ? { ...task, [field]: value } : task
            )
        );
    };

    const handleFieldSubmit = (id, field) => {
        setTasks(prev =>
            prev.map(task => {
                if (task.id === id) {
                    let timeInSeconds = task.duration;
                    if (field === 'duration') {
                        // Accept both "30 min" and "1800"
                        if (typeof task.duration === 'string') {
                            const timeRegex = /(\d+)\s*(sec|s|seconds|min|mins|minutes|hr|hrs|hour|hours)?\b/i;
                            const match = String(task.duration).match(timeRegex);
                            if (match) {
                                const num = parseInt(match[1], 10);
                                const unit = (match[2] || '').toLowerCase();
                                if (unit.startsWith('h')) timeInSeconds = num * 60 * 60;
                                else if (unit.startsWith('m')) timeInSeconds = num * 60;
                                else if (unit.startsWith('s')) timeInSeconds = num;
                                else timeInSeconds = num;
                            }
                        } else if (typeof task.duration === 'number') {
                            timeInSeconds = task.duration;
                        }
                    }
                    return {
                        ...task,
                        duration: field === 'duration' ? timeInSeconds : task.duration,
                        remaining: field === 'duration' ? timeInSeconds : task.remaining,
                        editingField: null,
                        // Optionally reset start/end time if duration changed
                        startTime: field === 'duration' ? new Date() : task.startTime,
                        endTime: field === 'duration' ? new Date(Date.now() + timeInSeconds * 1000) : task.endTime,
                    };
                }
                return { ...task, editingField: null };
            })
        );
    };

    // Timer and controls logic
    const recalculateTimes = (tasksArr, fromIndex = 0, baseTime = null) => {
        let currentTime = baseTime ? new Date(baseTime) : (tasksArr[fromIndex]?.startTime ? new Date(tasksArr[fromIndex].startTime) : new Date());
        return tasksArr.map((task, idx) => {
            if (idx < fromIndex) return task;
            const startTime = new Date(currentTime);
            const endTime = new Date(startTime.getTime() + task.remaining * 1000);
            currentTime = new Date(endTime);
            return { ...task, startTime, endTime };
        });
    };

    const startTask = (id, tasksOverride = null) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        setTasks(prev => {
            const prevTasks = tasksOverride || prev;
            const startIdx = prevTasks.findIndex(task => task.id === id);
            const now = new Date();
            const updated = recalculateTimes(
                prevTasks.map((task, idx) =>
                    idx === startIdx
                        ? { ...task, isActive: true, isCompleted: false, startTime: now, endTime: new Date(now.getTime() + task.remaining * 1000) }
                        : idx > startIdx
                            ? { ...task, isActive: false, isCompleted: false }
                            : { ...task, isActive: false }
                ),
                startIdx,
                now
            );
            return updated;
        });
        setActiveTaskId(id);

        intervalRef.current = setInterval(() => {
            setTasks(prev => {
                const startIdx = prev.findIndex(task => task.id === id);
                let updated = prev.map(task => ({ ...task }));
                if (updated[startIdx].remaining > 0) {
                    updated[startIdx].remaining -= 1;
                    updated[startIdx].endTime = new Date(updated[startIdx].endTime.getTime() - 1000);
                }
                if (updated[startIdx].remaining <= 0) {
                    Sounds.drip?.();
                    clearInterval(intervalRef.current);
                    updated[startIdx].isCompleted = true;
                    updated[startIdx].isActive = false;
                    updated[startIdx].remaining = 0;
                    updated = recalculateTimes(updated, startIdx + 1, updated[startIdx].endTime);
                    const next = updated.find((t, idx) => idx > startIdx && !t.isCompleted);
                    if (next) startTask(next.id);
                    else setActiveTaskId(null);
                }
                return updated;
            });
        }, 1000);
    };

    const pauseTask = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTasks(prev => prev.map(t => ((t.id === activeTaskId) ? { ...t, isActive: false, paused: true } : { ...t, isActive: false, paused: false })));
        setActiveTaskId(null);
    };

    const resetTask = (id) => {
        setTasks(prev => {
            const resetIdx = prev.findIndex(task => task.id === id);
            let updated = prev.map((task, idx) =>
                idx >= resetIdx
                    ? {
                        ...task,
                        remaining: task.duration,
                        isActive: false,
                        isCompleted: false,
                    }
                    : { ...task, isActive: false }
            );
            updated = recalculateTimes(updated, resetIdx, resetIdx === 0 ? scheduleStart : updated[resetIdx - 1].endTime);
            return updated;
        });
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActiveTaskId(null);
    };

    const skipTask = (id) => {
        setTasks(prev => {
            const idx = prev.findIndex(task => task.id === id);
            let updated = prev.map((task, i) =>
                i === idx
                    ? { ...task, isActive: false, isCompleted: true, skipped: true }
                    : { ...task, isActive: false }
            );
            const next = updated.find((t, i) => i > idx && !t.isCompleted && !t.paused && !t.skipped);
            if (next) {
                updated = updated.map((task, i) =>
                    task.id === next.id
                        ? { ...task, isActive: true, isCompleted: false, paused: false }
                        : task
                );
            } else {
                setActiveTaskId(null);
            }
            return updated;
        });
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
            setTasks(prev => {
                const next = prev.find((t, i) => !t.isCompleted && !t.paused && !t.skipped);
                if (next) {
                    setActiveTaskId(next.id);
                    startTask(next.id);
                }
                return prev;
            });
        }, 0);
    };
    const unCheckTask = (id) => {
        setTasks(prev => {
            const idx = prev.findIndex(task => task.id === id);
            let updated = prev.map((task, i) =>
                i === idx
                    ? { ...task, isActive: true, isCompleted: false, skipped: false }
                    : { ...task, isActive: false }
            );
            const next = updated.find((t, i) => i > idx && !t.isCompleted && !t.paused && !t.skipped);
            if (next) {
                updated = updated.map((task, i) =>
                    task.id === next.id
                        ? { ...task, isActive: false, isCompleted: true, paused: false }
                        : task
                );
            } else {
                setActiveTaskId(null);
            }
            return updated;
        });
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
            setTasks(prev => {
                const next = prev.find((t, i) => !t.isCompleted && !t.paused && !t.skipped);
                if (next) {
                    setActiveTaskId(next.id);
                    startTask(next.id);
                }
                return prev;
            });
        }, 0);
    };

    const handleParse = () => {
        const now = new Date();
        setScheduleStart(now);
        const parsed = parseSchedule(rawInput, now);
        setTasks(parsed);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActiveTaskId(null);
    };

    // UI
    return (
        <div className='mt--30' ref={scheduleRef}>
            <div className='containerDetail m-5 size20 bg-lite bottomBorderMedium'>
                <div className='containerDetail p-20 contentLeft color-yellow bg-lite'>
                    🕒 Scheduler
                </div>
                <textarea
                    className='containerDetail p-20 bg-dark width--5 mt-5'
                    rows={10}
                    placeholder={`Paste your schedule here...`}
                    value={rawInput}
                    onChange={(e) => {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            setActiveTaskId(null);
                            setTasks(prev => prev.map(t => ({ ...t, isActive: false, paused: false })));
                        }
                        setRawInput(e.target.value);
                    }}
                />
                <div className='containerDetail color-orange mt-5 pt-10 pb-10 size12 pl-15 pr-15 contentLeft lh-15'>
                    Each schedule item should be in this format:<br /><br />
                        ✅ Morning Movement — 30 mins<br />
                        Light surf<br />
                        stretch<br />
                        or bodyweight session<br /> 
                    – adjust intensity based on how you feel.<br />

                    <br />Separate options and tasks with a blank line.
                </div>
                <div className='containerDetail p-20 color-lite button bg-green' onClick={handleParse}>
                    Submit Schedule
                </div>
            </div>
            {tasks.map((task) => (
                <div
                    key={task.id}
                    data-task-id={task.id}
                    className={`containerDetail m-5 ${task.isCompleted ? 'bg-dkGreen' : task.isActive ? 'bg-silver' : task.paused ? 'bg-dkYellow' : 'bg-lite'}`}
                >
                    {/* Inline editable fields */}
                    <div className='contentLeft size20'>
                        {task.editingField === 'title' ? (
                            <input
                                value={task.title}
                                autoFocus
                                onChange={e => handleFieldChange(task.id, 'title', e.target.value)}
                                onBlur={() => handleFieldSubmit(task.id, 'title')}
                                onKeyDown={e => { if (e.key === 'Enter') handleFieldSubmit(task.id, 'title'); }}
                            />
                        ) : (
                            <div onClick={() => handleFieldEdit(task.id, 'title')} className=''>
                                <div className='containerDetail p-20 color-yellow bg-lite contentLeft'>
                                    {task.title}
                                 </div>
                                <div className='containerDetail bg-tintedMedium contentLeft p-20 mt-5 size20'>
                                    <div className='color-orange contentLeft'>
                                        {formatClock(task.startTime)} - {formatClock(task.endTime)}
                                    </div>
                                    {task.editingField === 'duration' ? (
                                        <input
                                            value={typeof task.duration === 'number' ? formatTime(task.duration) : task.duration}
                                            autoFocus
                                            onChange={e => handleFieldChange(task.id, 'duration', e.target.value)}
                                            onBlur={() => handleFieldSubmit(task.id, 'duration')}
                                            onKeyDown={e => { if (e.key === 'Enter') handleFieldSubmit(task.id, 'duration'); }}
                                        />
                                    ) : (
                                        <div onClick={() => handleFieldEdit(task.id, 'duration')} className='button mt-10 color-lite'>
                                            {formatTime(task.remaining)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className='containerDetail mt-5 pl-10 pr-20 color-lite bg-tintedMedium contentLeft'>
                            {task.editingField === 'notes' ? (
                                <textarea
                                    value={task.notes}
                                    autoFocus
                                    onChange={e => handleFieldChange(task.id, 'notes', e.target.value)}
                                    onBlur={() => handleFieldSubmit(task.id, 'notes')}
                                    onKeyDown={e => { if (e.key === 'Enter') handleFieldSubmit(task.id, 'notes'); }}
                                />
                            ) : (
                                <span onClick={() => handleFieldEdit(task.id, 'notes')} className='button'>
                                    {task.notes && task.notes.trim() ? (
                                        task.notes.includes('\n') ? (
                                            <ul>
                                                {task.notes.split('\n').filter(Boolean).map((line, i) => (
                                                    <li className='mb-10' key={i}>{line.trim()}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            task.notes
                                        )
                                    ) : (
                                        <div className='containerDetail i color-lite p-10'>➕ add note</div>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Timer controls */}
                    <div className='containerDetail p-10 mt-5 flexContainer bg-mediumDark'>
                        {!task.isCompleted && (
                            <>
                                {
                                    (!task.isActive)
                                    ? <div title='start' className='flex4Column' onClick={() => startTask(task.id)} disabled={task.isActive}>
                                        <div className='button size50 mt-10 mb-10'>
                                            ▶️
                                        </div>
                                    </div>
                                    : <div title='pause' className='flex4Column' onClick={pauseTask}>
                                        <div className='button size50 mt-10 mb-10'>
                                            ⏸️
                                        </div>
                                    </div>
                                }
                                <div title='skip' className='flex4Column' onClick={() => skipTask(task.id)}>
                                    <div className='button size50 mt-10 mb-10'>
                                        {(task.isCompleted) ? '✅' : '☑️'}
                                    </div>
                                </div>
                                <div title='reset' className='flex4Column' onClick={() => resetTask(task.id)}>
                                    <div className='button size50 mt-10 mb-10'>
                                        🔄
                                    </div>
                                </div>
                            </>
                        )}
                        {task.isCompleted && <span className='button color-neogreen' onClick={() => unCheckTask(task.id)}>✅ Completed</span>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Scheduler;