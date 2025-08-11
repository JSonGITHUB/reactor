import React, { useState, useEffect, useRef } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from './initializeData';
import Sounds from '../sound/Sounds';
import getKey from '../utils/KeyGenerator';
import CheckBoxTimer from './CheckBoxTimer.js';
import ScheduleProvider, {useSchedule } from './ScheduleContext'; // <-- Use the provider and hook


const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKENDS = ['Sat', 'Sun'];
const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DoseContent = () => {
    // Use context hook for state
    const { 
        timeline, 
        setTimeline, 
        meds, 
        setMeds 
    } = useSchedule();

    const scheduleRef = useRef(null);
    const today = new Date().toDateString();
    const [doseCollapsed, setDoseCollapsed] = useState();
    const [formCollapsed, setFormCollapsed] = useState();
    const [isCollapsed, setCollapsed] = useState([]);
    const [form, setForm] = useState({
        id: null,
        name: '',
        instruction: '',
        warning: '',
        startDate: today, // New
        startTime: '', // New
        endDate: '',   // New
        endTime: '',   // New
        continuous: true,
        interval: 8,
        timeRangeStart: '',
        timeRangeEnd: '',
        repeat: 'none', // none, weekly, bi-weekly, monthly
        weekdays: [], // ['Mon', 'Tue', ...]
        totalDoses: 10
      });
    const [edit, setEdit] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [pushMinutes, setPushMinutes] = useState(30);
    const [undoStack, setUndoStack] = useState([]);

    const limitToToday = () => meds.every((med) => !med.totalDoses);
    const visibleTimeline = () => timeline.filter((t) => !limitToToday() || new Date(t.time).toDateString() === today);
    const grouped = () => timeline.reduce((acc, item) => {
        const dateKey = new Date(item.time).toDateString();
        const timeKey = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!acc[dateKey]) acc[dateKey] = {};
        if (!acc[dateKey][timeKey]) acc[dateKey][timeKey] = [];
        acc[dateKey][timeKey].push(item);
        return acc;
    }, {});

    useEffect(() => {
        localStorage.setItem('formCollapsed', JSON.stringify(formCollapsed));
        console.log(`Dose => useEffect => formCollapsed: ${formCollapsed}, doseOpen: ${doseCollapsed}`);
    }, [formCollapsed]);
    useEffect(() => {
        localStorage.setItem('doseCollapsed', JSON.stringify(doseCollapsed));
        console.log(`Dose => useEffect => formCollapsed: ${formCollapsed}, doseOpen: ${doseCollapsed}`);
    }, [doseCollapsed]);
    
    useEffect(() => {
        if (form.name !== '') {
            setFormCollapsed(false);
        }
    }, [form]);

    useEffect(() => {
        if (Object.keys(editForm).length === 0) {
            setFormCollapsed(true);
        } else {
            setForm(editForm);
            setEdit(true);
            setFormCollapsed(false);
        }
    }, [editForm]);

    useEffect(() => {
        console.log(`Dose => useEffect => timeline: ${JSON.stringify(timeline, null, 2)}`);
        if (!timeline || !timeline.length) {
            const localTimeline = JSON.parse(localStorage.getItem('medsTimeline'));
            setTimeline(localTimeline);
        }   
        const interval = setInterval(() => {
            const now = new Date();
            setTimeline((prev) =>
                prev.map((dose) => {
                    const doseTime = new Date(dose.time);
                    const diff = doseTime - now;
                    // Play sound when the scheduled time matches the current time (within 1 minute)
                    if (Math.abs(diff) < 60000 && !dose.activated) {
                        if (typeof Sounds !== 'undefined' && typeof Sounds.drip === 'function') {
                            Sounds.drip();
                        }
                        return { ...dose, activated: true };
                    }
                    if (diff > 0 && diff < 5 * 60 * 1000 && !dose.notified) {
                        new Notification(`Upcoming Dose: ${dose.name}`, {
                            body: `Time: ${doseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${dose.warning ? `\n${dose.warning}` : ''}`
                        });
                        return { ...dose, completed: true, notified: true };
                    }
                    return dose;
                })
            );
        }, 60000);

        if (timeline && timeline.length !== 0) {
            const groupCount = Object.keys(grouped()).length;
            const groupKeys = Object.keys(grouped());
            const todayIndex = groupKeys.findIndex(date => date === today);

            setCollapsed(
                groupKeys.map((_, idx) => idx !== todayIndex)
            );
        }

        return () => clearInterval(interval);
    }, [timeline]);

    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
        const localFormCollapsed = localStorage.getItem('formCollapsed');
        const localDoseCollapsed = localStorage.getItem('doseCollapsed');
        const formOpen = (localFormCollapsed !== 'undefined' || localFormCollapsed !== undefined || localFormCollapsed !== null) ? localFormCollapsed : true;
        const doseOpen = (localDoseCollapsed !== 'undefined' || localDoseCollapsed !== undefined || localDoseCollapsed !== null) ? localDoseCollapsed : true;
        console.log(`Dose => useEffect => formOpen: ${formOpen}, doseOpen: ${doseOpen}`);
        setFormCollapsed(formOpen);
        setDoseCollapsed(doseOpen);
        // Find the first upcoming dose
        const now = new Date();
        let found = false;
        setTimeout(() => {
            if (scheduleRef.current) {
                const doseElements = scheduleRef.current.querySelectorAll('[data-dose-time]');
                for (let el of doseElements) {
                    const doseTime = new Date(el.getAttribute('data-dose-time'));
                    if (!found && doseTime >= now) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        found = true;
                        break;
                    }
                }
            }
        }, 200); // Delay to ensure the DOM is updated

    }, []);

    const cancelEdit = () => {
        setEdit(false);
        setForm({})
        setEditForm({});
    }

    const addMed = () => {
        const newMed = {
            ...form,
            id: form.id || Date.now(),
            startTime: new Date(form.startTime).toISOString(),
            interval: parseFloat(form.interval),
            totalDoses: form.totalDoses ? parseInt(form.totalDoses) : null
        };
        const updatedMeds = form.id
            ? meds.map((m) => (m.id === form.id ? newMed : m))
            : [...meds, newMed];

        setMeds(updatedMeds);
        setForm({
            id: null,
            name: '',
            instruction: '',
            warning: '',
            startDate: today, // New
            startTime: '', // New
            endDate: '',   // New
            endTime: '',   // New
            continuous: true,
            interval: 8,
            timeRangeStart: '',
            timeRangeEnd: '',
            repeat: 'none', // none, weekly, bi-weekly, monthly
            weekdays: [], // ['Mon', 'Tue', ...]
            totalDoses: 10
          });
        if (edit) {
            setEdit(false)
        }
        setFormCollapsed(true);
    };

    const pushDose = (index, minutes, confirmAll) => {
        const medToPush = timeline[index].medicationId;
        const medIndex = meds.findIndex((m) => m.id === medToPush);
        const originalTime = new Date(timeline[index].time);
        const newStart = originalTime.getTime() + minutes * 60000;

        setUndoStack([...undoStack, meds]);

        if (confirmAll) {
            const updatedMed = { ...meds[medIndex], startTime: new Date(newStart).toISOString() };
            const updatedMeds = [...meds];
            updatedMeds[medIndex] = updatedMed;
            setMeds(updatedMeds);
        } else {
            const dose = timeline[index];
            const newDose = { ...dose, time: new Date(newStart) };
            const newTimeline = [...timeline];
            newTimeline[index] = newDose;
            setTimeline(newTimeline);
        }
    };

    const handleUndo = () => {
        if (undoStack.length > 0) {
            const previous = undoStack[undoStack.length - 1];
            setUndoStack(undoStack.slice(0, -1));
            setMeds(previous);
        }
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(`Are you sure you want to delete ${meds.filter((m) => m.id !== id).name}?`);
        if (!confirmed) return;

        const updated = meds.filter((m) => m.id !== id);
        setUndoStack([...undoStack, meds]);
        setMeds(updated);
    };

    const displayAddForm = () => <div className=''>
        <div className='flexContainer containerBox'>
            <div className='containerBox flex2Column contentRight'>
                💊 Substance:
            </div>
            <div className='flex2Column contentLeft'>
                <input className='containerDetail p-10 width--10 color-lite' placeholder='Substance' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
        </div>
        <div className='flexContainer containerBox'>
            <div className='containerBox flex2Column contentRight'>📋 Instructions:</div>
            <div className='flex2Column contentLeft'>
                <input className='containerDetail p-10 width--10 color-lite' placeholder='Instruction' value={form.instruction} onChange={(e) => setForm({ ...form, instruction: e.target.value })} />
            </div>
        </div>
        <div className='flexContainer containerBox'>
            <div className='containerBox flex2Column contentRight'>⚠️ Warnings:</div>
            <div className='flex2Column contentLeft'>
                <input className='containerDetail p-10 width--10 color-lite' placeholder='Warnings (optional)' value={form.warning} onChange={(e) => setForm({ ...form, warning: e.target.value })} />
            </div>
        </div>
        <div className='flexContainer containerBox'>
            <div className='containerBox flex2Column contentRight'>▶️ Start:</div>
            <div className='flex2Column contentLeft'>
                <input type='datetime-local' className='containerDetail p-10 width--30 mr-10 color-lite' value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            
        </div>
        <div className='flexContainer containerBox'>
            <div className='containerBox flex2Column contentRight'>⏱️ Interval:</div>
            <div className='flex2Column contentLeft'>
                <input type='number' className='containerDetail p-10 width--10 color-lite' placeholder='Interval (hours)' value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })} />
            </div>
        </div>
        <div className='flexContainer containerBox'>
            <div className='containerBox'>💊💊💊 Total Doses:</div>
            <div className='flex2Column contentLeft'>
                <input type='number' className='containerDetail p-10 width--10 color-lite' placeholder='Total Doses' value={form.totalDoses || 0} onChange={(e) => setForm({ ...form, totalDoses: e.target.value })} />
            </div>
        </div>
        <div className='containerBox'>
            <div className='containerBox contentLeft'>📅 Days:</div>
            <div className='contentLeft'>
                <div className='containerBox'>
                    <button
                        className='containerDetail button bg-lite m-5 color-lite p-10 size20'
                        type='button'
                        onClick={() => setForm({ ...form, weekdays: [...ALL_DAYS] })}
                    >All</button>
                    <button
                        className='containerDetail button bg-lite m-5 color-lite p-10 size20'
                        type='button'
                        onClick={() => setForm({ ...form, weekdays: [...WEEKDAYS] })}
                    >Weekdays</button>
                    <button
                        className='containerDetail button bg-lite m-5 color-lite p-10 size20'
                        type='button'
                        onClick={() => setForm({ ...form, weekdays: [...WEEKENDS] })}
                    >Weekends</button>
                </div>
                <div className='flexContainer containerBox'>
                    {ALL_DAYS.map(day => (
                        <label key={getKey(day)} className={`flex7Column containerDetail m-1 ${((form.weekdays && form.weekdays.includes(day)) || false)? 'bg-blue': 'bg-lite'} contentCenter`}>
                            <input
                                className='m-5'
                                type='checkbox'
                                checked={(form.weekdays && form.weekdays.includes(day)) || false}
                                onChange={e => {
                                    setForm({
                                        ...form,
                                        weekdays: e.target.checked
                                            ? [...form.weekdays, day]
                                            : form.weekdays.filter(d => d !== day)
                                    });
                                }}
                            />
                            {day}
                        </label>
                    ))}
                </div>
            </div>
        </div>
        <div className='flexContainer containerBox bg-lite'>
            <div className='containerBox flex2Column button bg-green' onClick={addMed}>
                {
                    
                        (edit)
                        ? 'Save'
                        : 'Add'
                }
            </div>
            {
                (edit)
                    ? <div className='containerBox  flex2Column bg-dkYellow button' onClick={cancelEdit}>
                        Cancel
                        </div>
                    : null
            }
        </div>
    </div>

    return (
        
            <div>
                <div className='containerDetail p-20 color-orange bg-blue size30 m-5'>
                    💊 Dose Reminder
                </div>
                <div className='containerBox bg-lite'>
                    <CollapseToggleButton
                        title={<span className='color-yellow'>Add Medication</span>}
                        isCollapsed={formCollapsed}
                        setCollapse={setFormCollapsed}
                        align='left'
                    />
                    {
                        (formCollapsed)
                            ? null
                            : displayAddForm()
                        }
                </div>
                <div className='containerBox bg-lite'>
                    <CollapseToggleButton
                        title={<span className='color-yellow'>Medications</span>}
                        isCollapsed={doseCollapsed}
                        setCollapse={setDoseCollapsed}
                        align='left'
                    />
                    {
                        (doseCollapsed)
                            ? null
                            : meds.map((med) => (
                                <div key={getKey(med.id)} className='containerBox'>
                                    <div className='containerBox contentLeft'>
                                        {med.name} every {med.interval} hrs {med.totalDoses ? `for ${med.totalDoses} doses` : '(ongoing)'}
                                    </div>
                                    <div className='flexContainer containerBox'>
                                        <div className='containerDetail flex2Column button bg-lite m-5' onClick={() => setEditForm(med)}>✏️</div>
                                        <div className='containerDetail flex2Column button bg-lite m-5' onClick={() => handleDelete(med.id)}>🗑️</div>
                                    </div>
                                </div>
                            ))
                    }
                </div>
                {
                    (undoStack.length > 0)
                        ? <div className='containerBox button bg-red m-5' onClick={handleUndo}>
                            Undo Last Push
                            </div>
                        : null
                }
                <div className='containerBox' ref={scheduleRef}>
                {
                    (timeline && timeline.length !== 0) 
                    ? Object.entries(grouped()).map(([date, times], i) => (
                        <div key={getKey(i)} className='containerBox'>
                            <div key={getKey(i)} className={`containerBox bg-${(date == today) ? 'neogreen' : 'yellow'}`}>
                            <CollapseToggleButton
                                title={<div className='color-dark size30'>{date}</div>}
                                isCollapsed={isCollapsed[i]}
                                setCollapse={() => {
                                    const newCollapsed = [...isCollapsed];
                                    newCollapsed[i] = !newCollapsed[i];
                                    setCollapsed(newCollapsed);
                            }}
                            align='left'
                        />
                        </div>
                        {
                            (!isCollapsed[i])
                            ? Object.entries(times).map(([time, doses], j) => {
                                const now = new Date();
                                // Parse time string to Date for accurate comparison
                                const intervalDate = new Date(`${date} ${time}`);
                                const display =
                                    intervalDate < now
                                        ? 'missed'
                                        : (intervalDate - now < 60 * 60 * 1000 ? 'upcoming' : '');

                                return (
                                    <div key={getKey(j)} className={`containerBox bg-${display === 'missed' ? 'dkYellow' : display === 'upcoming' ? 'green' : 'lite'}`}>
                                        <div className={`containerBox bg-lite color-${display === 'missed' ? 'dkYellow' : display === 'upcoming' ? 'yellow' : 'lite'}`}>
                                            {time}
                                        </div>
                                        {doses.map((dose, idx) => {
                                            const doseTime = new Date(dose.time);
                                            const status = doseTime < now ? 'missed' : (doseTime - now < 60 * 60 * 1000 ? 'upcoming' : '');
                                            return (
                                                <div key={getKey(idx)}>
                                                    <CheckBoxTimer
                                                        idx={idx}
                                                        dose={dose}
                                                        status={status}
                                                        pushDose={() => pushDose(idx, pushMinutes, false)}
                                                        doseTime={doseTime}  
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })
                            : null
                        }
                        </div>
                    ))
                    : null
                }
                </div>
            </div>
    );
};

const Dose = () => (
    <ScheduleProvider>
        <DoseContent />
    </ScheduleProvider>
);

export default Dose;