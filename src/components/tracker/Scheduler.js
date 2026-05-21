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
        let title = '', notes = rest;
        let timeInSeconds = 1800; // default 30 min

        if (match) {
            title = match[1].trim();
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

    const getPersistedBool = (key, defaultVal) => {
        const val = localStorage.getItem(key);
        return val !== null ? val === 'true' : defaultVal;
    };
    const [scheduleFormOpen, setScheduleFormOpen] = useState(() => getPersistedBool('schedulerFormOpen', false));
    const [selectScheduleOpen, setSelectScheduleOpen] = useState(() => getPersistedBool('selectScheduleOpen', false));
    const [scheduleFormTab, setScheduleFormTab] = useState(() => localStorage.getItem('schedulerFormTab') || 'freeform');
    const [guidedEntries, setGuidedEntries] = useState([{ title: '', duration: '30', unit: 'min', notes: '' }]);

    const [schedulerLibrary, setSchedulerLibrary] = useState(() => {
        try { return JSON.parse(localStorage.getItem('schedulerLibrary') || '[]'); } catch { return []; }
    });
    const [activeScheduleId, setActiveScheduleId] = useState(() => localStorage.getItem('schedulerActiveId') || null);
    const [scheduleName, setScheduleName] = useState('');
    const [libraryOpen, setLibraryOpen] = useState(() => getPersistedBool('schedulerLibraryOpen', true));

    const scheduleRef = useRef(null);

    useEffect(() => {
        setScheduleFormOpen(true);
    }, [selectScheduleOpen]);
    // Load from localStorage on mount
    useEffect(() => {
        const savedTasks = localStorage.getItem('schedulerTasks');
        const savedMeta = localStorage.getItem('schedulerMeta');
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

    // --- SAVED SCHEDULES LIBRARY ---
    const generateScheduleId = () => `sched-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    const persistLibrary = (nextLibrary) => {
        localStorage.setItem('schedulerLibrary', JSON.stringify(nextLibrary));
        setSchedulerLibrary(nextLibrary);
    };

    const toggleLibraryOpen = () => {
        setLibraryOpen(prev => {
            const next = !prev;
            localStorage.setItem('schedulerLibraryOpen', String(next));
            return next;
        });
    };
    const deleteSchedule = () => {
        if (!activeScheduleId) return;
        const nextLibrary = schedulerLibrary.filter(s => s.id !== activeScheduleId);
        persistLibrary(nextLibrary);
        setActiveScheduleId(null);
        localStorage.removeItem('schedulerActiveId');
        loadScheduleFromLibrary(schedulerLibrary[0])
        setScheduleFormOpen(true);
    }

    const saveScheduleToLibrary = () => {
        const name = scheduleName.trim() || 'Untitled Schedule';
        const now = new Date().toISOString();
        const existingIndex = schedulerLibrary.findIndex(s => s.id === activeScheduleId);
        if (existingIndex >= 0) {
            const nextLibrary = schedulerLibrary.map((s, i) =>
                i === existingIndex
                    ? { ...s, name, rawInput, guidedEntries, updatedAt: now }
                    : s
            );
            persistLibrary(nextLibrary);
            setScheduleName(name);
        } else {
            const newSchedule = { id: generateScheduleId(), name, rawInput, guidedEntries, createdAt: now, updatedAt: now };
            const nextLibrary = [...schedulerLibrary, newSchedule];
            persistLibrary(nextLibrary);
            setActiveScheduleId(newSchedule.id);
            localStorage.setItem('schedulerActiveId', newSchedule.id);
            setScheduleName(name);
        }
        setScheduleFormOpen(true);
    };

    const saveScheduleAsNew = () => {
        const name = (scheduleName.trim() || 'Untitled Schedule') + (schedulerLibrary.length ? ` (${schedulerLibrary.length + 1})` : '');
        const now = new Date().toISOString();
        const newSchedule = { id: generateScheduleId(), name, rawInput, guidedEntries, createdAt: now, updatedAt: now };
        const nextLibrary = [...schedulerLibrary, newSchedule];
        persistLibrary(nextLibrary);
        setActiveScheduleId(newSchedule.id);
        localStorage.setItem('schedulerActiveId', newSchedule.id);
        setScheduleName(name);
        setScheduleFormOpen(true);
    };

    const loadScheduleFromLibrary = (schedule) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            setActiveTaskId(null);
        }
        const rawText = schedule.rawInput || '';
        setRawInput(rawText);
        setGuidedEntries(schedule.guidedEntries && schedule.guidedEntries.length
            ? schedule.guidedEntries
            : [{ title: '', duration: '30', unit: 'min', notes: '' }]
        );
        setScheduleName(schedule.name);
        setActiveScheduleId(schedule.id);
        localStorage.setItem('schedulerActiveId', schedule.id);
        if (rawText.trim()) {
            const now = new Date();
            setScheduleStart(now);
            setTasks(parseSchedule(rawText, now));
        } else {
            setTasks([]);
        }
        setScheduleFormOpen(true);
    };

    const deleteScheduleFromLibrary = (id) => {
        const nextLibrary = schedulerLibrary.filter(s => s.id !== id);
        persistLibrary(nextLibrary);
        if (activeScheduleId === id) {
            setActiveScheduleId(null);
            localStorage.removeItem('schedulerActiveId');
        }
    };

    // --- FORM OPEN/TAB PERSISTENCE ---
    const toggleScheduleForm = () => {
        setScheduleFormOpen(prev => {
            const next = !prev;
            localStorage.setItem('schedulerFormOpen', String(next));
            return next;
        });
    };

    const selectFormTab = (tab) => {
        setScheduleFormTab(tab);
        localStorage.setItem('schedulerFormTab', tab);
    };

    // --- GUIDED ENTRY HELPERS ---
    const DURATION_UNITS = ['min', 'hr', 'sec'];

    const addGuidedEntry = () => {
        setGuidedEntries(prev => [...prev, { title: '', duration: '30', unit: 'min', notes: '' }]);
    };

    const removeGuidedEntry = (index) => {
        setGuidedEntries(prev => prev.filter((_, i) => i !== index));
    };

    const updateGuidedEntry = (index, field, value) => {
        setGuidedEntries(prev => prev.map((entry, i) =>
            i === index ? { ...entry, [field]: value } : entry
        ));
    };

    const buildRawFromGuided = () => {
        return guidedEntries
            .filter(e => e.title.trim())
            .map(e => {
                const header = `${e.title.trim()} - ${e.duration || '30'} ${e.unit || 'min'}`;
                return e.notes.trim() ? `${header}\n${e.notes.trim()}` : header;
            })
            .join('\n\n');
    };

    const handleGuidedSubmit = () => {
        const raw = buildRawFromGuided();
        if (!raw.trim()) return;
        setRawInput(raw);
        const now = new Date();
        setScheduleStart(now);
        const parsed = parseSchedule(raw, now);
        setTasks(parsed);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActiveTaskId(null);
        setScheduleFormOpen(true);
    };

    const handleParse = () => {
        const now = new Date();
        setScheduleStart(now);
        const parsed = parseSchedule(rawInput, now);
        setTasks(parsed);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setActiveTaskId(null);
    };

    const startNewSchedule = () => {
        toggleScheduleForm();
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            setActiveTaskId(null);
        }
        setRawInput('');
        setGuidedEntries([{ title: '', duration: '30', unit: 'min', notes: '' }]);
        setScheduleName('');
        setActiveScheduleId(null);
        localStorage.removeItem('schedulerActiveId');
        setTasks([]);
    };

    // UI
    return (
        <div className='mt--30' ref={scheduleRef}>
            <div className='containerDetail m-5 size20 bg-lite bottomBorderMedium'>

                {/* Collapsible header */}
                <div
                    className='containerDetail flexContainer p-20 contentLeft color-yellow bg-lite button flexContainer'
                    onClick={() => setSelectScheduleOpen(prev => {
                        const next = !prev;
                        localStorage.setItem('selectScheduleOpen', String(next));
                        return next;
                    })}
                    style={{ userSelect: 'none', alignItems: 'center', gap: '10px' }}
                >
                    <div className='flex2Column'>
                        <div>
                            🕒 Scheduler
                        </div>
                        {activeScheduleId ? (
                            <div className='size12 color-orange ml-10'>
                                {scheduleName || 'Untitled Schedule'}
                            </div>
                        ) : (
                            <div className='size12 color-lime ml-10'>
                                + New Schedule
                            </div>
                        )}
                    </div>
                    <div className='flex2Column size14 color-yellow size20 contentRight'>
                        Select Schedule {selectScheduleOpen ? '▲' : '▼'}
                    </div>
                </div>

                {selectScheduleOpen && (
                    <div>
                        {/* Saved Schedules Panel */}
                        <div className='containerDetail mb-5'>
                            <div
                                className='flexContainer button p-10 bg-tintedMedium color-yellow'
                                onClick={toggleLibraryOpen}
                                style={{ alignItems: 'center', gap: '8px', userSelect: 'none' }}
                            >
                                <span className='size14' style={{ flex: 1 }}>
                                    📋 Saved Schedules ({schedulerLibrary.length})
                                </span>
                                <span className='size12'>{libraryOpen ? '▲' : '▼'}</span>
                            </div>

                            {libraryOpen && (
                                <div className='containerDetail bg-dark p-10'>
                                    {schedulerLibrary.length === 0 ? (
                                        <div className='size12 color-orange p-10 contentLeft'>No saved schedules yet. Fill in a schedule below and save it.</div>
                                    ) : (
                                        schedulerLibrary.map(schedule => {
                                            const isActive = activeScheduleId === schedule.id;
                                            return (
                                                <div
                                                    key={schedule.id}
                                                    className={`flexContainer p-10 mb-5 ${isActive ? 'bg-green' : 'bg-tintedMedium'}`}
                                                    style={{ borderRadius: '6px', alignItems: 'center', gap: '8px' }}
                                                    onClick={() => loadScheduleFromLibrary(schedule)}
                                                >
                                                    <div
                                                        className={`flex3Column contentLeft size14 ${isActive ? 'color-neogreen' : 'color-yellow'}`}
                                                    >
                                                        {schedule.name}
                                                        {isActive && <span className='size12 color-neogreen'> ● active</span>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* Save / Update controls */}
                                    <div className='mt-10'>
                                            {activeScheduleId && schedulerLibrary.some(s => s.id === activeScheduleId) ? (
                                                <div className='flexContainer mt-10'>
                                                    <div
                                                        className='containerDetail flex3Column button bg-green color-yellow p-10 contentCenter size12'
                                                        onClick={() => setScheduleFormOpen(false)}
                                                        title='Update the current schedule'
                                                    >
                                                        ✏️ Edit
                                                    </div>
                                                    <div
                                                        className='containerDetail ml-5 flex3Column button bg-dkOrange color-yellow p-10 contentCenter size12'
                                                        onClick={startNewSchedule}
                                                        title='Start a new blank schedule'
                                                    >
                                                        ➕ New
                                                    </div>
                                                    <div
                                                        className='containerDetail ml-5 flex3Column button bg-dkRed color-yellow p-10 contentCenter size12'
                                                        onClick={deleteSchedule}
                                                        title='Delete the current schedule'
                                                    >
                                                        🗑️ Delete
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div
                                                        className='flex2Column button bg-green color-neogreen p-10 contentCenter size12'
                                                        onClick={saveScheduleToLibrary}
                                                        title='Save this as a new schedule'
                                                    >
                                                        Save
                                                    </div>
                                                    <div
                                                        className='flex2Column button bg-tintedMedium color-orange p-10 contentCenter size12'
                                                        onClick={startNewSchedule}
                                                        title='Clear everything for a fresh start'
                                                    >
                                                        Add New
                                                    </div>
                                                </>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tab bar */}
                        {
                            (scheduleFormOpen)
                            ? null
                            : <div className='containerDetail contentLeft'>
                                <div className='size12 color-orange mb-10 contentLeft pl-10 pt-10'>
                                    {activeScheduleId && schedulerLibrary.some(s => s.id === activeScheduleId)
                                        ? '✎ Edit mode: Update existing or Save as new'
                                        : '+ Create mode: Give your schedule a name and save'}
                                </div>
                                <div className='size12 color-yellow mb-5 pl-10'>
                                    Schedule name
                                </div>
                                <input
                                    className='containerDetail ml-10 mb-20 p-10 bg-tintedMedium color-lite'
                                    placeholder='e.g. Morning Routine'
                                    value={scheduleName}
                                    onChange={e => setScheduleName(e.target.value)}
                                />
                                <div className='flexContainer' style={{ gap: '0', borderBottom: '2px solid #333' }}>
                                    {['freeform', 'guided'].map(tab => (
                                        <div
                                            key={tab}
                                            className={`button p-10 flex1Column contentCenter size14 ${scheduleFormTab === tab ? 'bg-green color-neogreen' : 'bg-tintedMedium color-yellow'}`}
                                            style={{ borderBottom: scheduleFormTab === tab ? '3px solid #2ec4b6' : '3px solid transparent' }}
                                            onClick={() => selectFormTab(tab)}
                                        >
                                            {tab === 'freeform' ? 'Free Form' : 'Guided Entry'}
                                        </div>
                                    ))}
                                </div>

                                {/* Free Form tab */}
                                {scheduleFormTab === 'freeform' && (
                                    <div>
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
                                            <br />Separate items with a blank line.
                                        </div>
                                        <div className='containerDetail p-20 color-lite button bg-green' onClick={handleParse}>
                                            Submit Schedule
                                        </div>
                                    </div>
                                )}

                                {/* Guided Entry tab */}
                                {scheduleFormTab === 'guided' && (
                                    <div className='containerDetail p-10'>
                                        <div className='size12 color-orange mb-10 contentLeft lh-15'>
                                            Add each schedule block below. Title and duration are required. Notes are optional.
                                        </div>

                                        {guidedEntries.map((entry, index) => (
                                            <div
                                                key={index}
                                                className='containerDetail bg-tintedMedium p-10 mb-10'
                                                style={{ borderRadius: '8px', border: '1px solid #334' }}
                                            >
                                                <div className='flexContainer mb-5' style={{ gap: '8px', alignItems: 'center' }}>
                                                    <div className='size12 color-yellow flex1Column contentLeft'>Item {index + 1}</div>
                                                    {guidedEntries.length > 1 && (
                                                        <div
                                                            className='button size12 color-orange'
                                                            onClick={() => removeGuidedEntry(index)}
                                                        >
                                                            ✕ Remove
                                                        </div>
                                                    )}
                                                </div>

                                                <div className='mb-5'>
                                                    <div className='size12 color-yellow mb-5 contentLeft'>Title</div>
                                                    <input
                                                        className='containerDetail p-10 bg-dark color-lite'
                                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                                        placeholder='e.g. Morning Movement'
                                                        value={entry.title}
                                                        onChange={e => updateGuidedEntry(index, 'title', e.target.value)}
                                                    />
                                                </div>

                                                <div className='flexContainer mb-5' style={{ gap: '8px', alignItems: 'flex-end' }}>
                                                    <div style={{ flex: 2 }}>
                                                        <div className='size12 color-yellow mb-5 contentLeft'>Duration</div>
                                                        <input
                                                            className='containerDetail p-10 bg-dark color-lite'
                                                            type='number'
                                                            min='1'
                                                            placeholder='30'
                                                            value={entry.duration}
                                                            onChange={e => updateGuidedEntry(index, 'duration', e.target.value)}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div className='size12 color-yellow mb-5 contentLeft'>Unit</div>
                                                        <select
                                                            className='containerDetail p-10 bg-dark color-lite'
                                                            value={entry.unit}
                                                            onChange={e => updateGuidedEntry(index, 'unit', e.target.value)}
                                                        >
                                                            {DURATION_UNITS.map(u => (
                                                                <option key={u} value={u}>{u}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className='size12 color-yellow mb-5 contentLeft'>Notes (optional)</div>
                                                    <textarea
                                                        className='containerDetail p-10 bg-dark color-lite'
                                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                                        rows={3}
                                                        placeholder='e.g. Light surf, stretch, bodyweight session'
                                                        value={entry.notes}
                                                        onChange={e => updateGuidedEntry(index, 'notes', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div className='flexContainer'>
                                            <div
                                                className='containerDetail flex2Column button bg-tintedMedium color-yellow p-20 contentCenter'
                                                onClick={addGuidedEntry}
                                            >
                                                + Add Item
                                            </div>
                                            <div
                                                className='containerDetail ml-5 flex2Column button bg-green color-neogreen p-20 contentCenter'
                                                onClick={handleGuidedSubmit}
                                            >
                                                Submit
                                            </div>
                                        </div>
                                            <div className='flexContainer mt-10'>
                                                <div
                                                    className='containerDetail flex2Column button bg-green color-yellow p-10 contentCenter size12'
                                                    onClick={saveScheduleToLibrary}
                                                    title='Update the current schedule'
                                                >
                                                    Update
                                                </div>
                                                <div
                                                    className='containerDetail ml-5 flex2Column button bg-tintedMedium color-yellow p-10 contentCenter size12'
                                                    onClick={saveScheduleAsNew}
                                                    title='Save as a new schedule'
                                                >
                                                    Save As New
                                                </div>
                                            </div>
                                    </div>
                                )}
                            </div>
                        }
                    </div>
                )}
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