import React, { useState, useEffect, useRef } from 'react';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import Sounds from '../sound/Sounds';
import CheckBoxTimer from './CheckBoxTimer.js';
import ScheduleProvider, { useSchedule } from './ScheduleContext'; // <-- Use the provider and hook


const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKENDS = ['Sat', 'Sun'];
const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOSE_FOCUS_KEY = 'doseFocusKey';
const makeDoseKey = (dose) => `${dose.medicationId}-${new Date(dose.time).getTime()}`;

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
        dayEnd: '',
        endDate: '',   // New
        endTime: '',   // New
        dosingMode: 'interval',
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
    const [pushMinutes] = useState(30);
    const [undoStack, setUndoStack] = useState([]);
    const [focusDoseKey, setFocusDoseKey] = useState('');
    const collapseInitRef = useRef(false);

    const activeMedIds = new Set(meds.map((med) => med.id));
    const filteredTimeline = timeline.filter((dose) => activeMedIds.has(dose.medicationId));
    const grouped = () => filteredTimeline.reduce((acc, item) => {
        const dateKey = new Date(item.time).toDateString();
        const timeKey = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!acc[dateKey]) acc[dateKey] = {};
        if (!acc[dateKey][timeKey]) acc[dateKey][timeKey] = [];
        acc[dateKey][timeKey].push(item);
        return acc;
    }, {});
    const scrollToNextCurrentDose = () => {
        if (!scheduleRef.current) return false;
        const now = new Date();
        const doseElements = Array.from(scheduleRef.current.querySelectorAll('[data-dose-time]'));
        if (!doseElements.length) return false;

        let target = doseElements.find((el) => {
            const doseTimeValue = el.getAttribute('data-dose-time');
            const doseTime = new Date(doseTimeValue);
            return !Number.isNaN(doseTime.getTime()) && doseTime >= now;
        });

        if (!target) {
            target = doseElements[doseElements.length - 1];
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
    };
    const scrollToTop = () => {
        const body = document.body; // For Safari
        const html = document.documentElement; // Chrome, Firefox, IE and Opera places the overflow at the html level, unless else is specified. Therefore, we use the documentElement property for these browsers
        body.scrollLeft = 0;
        body.scrollTop = 0;
        html.scrollLeft = 0;
        html.scrollTop = 0;
    }
    const toLocalDateTimeInput = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const pad = (num) => String(num).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const toLocalTimeInput = (value) => {
        if (!value) return '';
        if (typeof value === 'string' && /^\d{2}:\d{2}/.test(value)) {
            return value.slice(0, 5);
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const pad = (num) => String(num).padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    useEffect(() => {
        if (typeof formCollapsed === 'boolean') {
            localStorage.setItem('formCollapsed', JSON.stringify(formCollapsed));
        }
    }, [formCollapsed]);
    useEffect(() => {
        if (typeof doseCollapsed === 'boolean') {
            localStorage.setItem('doseCollapsed', JSON.stringify(doseCollapsed));
        }
    }, [doseCollapsed]);
    
    useEffect(() => {
        if (form.name !== '' && formCollapsed !== false) {
            setFormCollapsed(false);
        }
    }, [form, formCollapsed]);

    useEffect(() => {
        if (Object.keys(editForm).length === 0) {
            setFormCollapsed(true);
        } else {
            setForm({
                ...editForm,
                dosingMode: editForm.dosingMode || 'interval',
                dayEnd: toLocalTimeInput(editForm.dayEnd || editForm.endTime),
                startTime: toLocalDateTimeInput(editForm.startTime)
            });
            setEdit(true);
            setFormCollapsed(false);
            scrollToTop();
        }
    }, [editForm]);

    useEffect(() => {
        if (!timeline || !timeline.length) {
            const localTimeline = JSON.parse(localStorage.getItem('medsTimeline'));
            if (localTimeline && localTimeline.length) {
                setTimeline(localTimeline);
            }
        }
    }, [timeline, setTimeline]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setTimeline((prev) => {
                if (!prev || prev.length === 0) return prev;
                let changed = false;
                const next = prev.map((dose) => {
                    const doseTime = new Date(dose.time);
                    const diff = doseTime - now;
                    if (Math.abs(diff) < 60000 && !dose.activated) {
                        if (typeof Sounds !== 'undefined' && typeof Sounds.drip === 'function') {
                            Sounds.drip();
                        }
                        changed = true;
                        return { ...dose, activated: true };
                    }
                    if (diff > 0 && diff < 5 * 60 * 1000 && !dose.notified) {
                        new Notification(`Upcoming Dose: ${dose.name}`, {
                            body: `Time: ${doseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${dose.warning ? `\n${dose.warning}` : ''}`
                        });
                        changed = true;
                        return { ...dose, notified: true };
                    }
                    return dose;
                });
                return changed ? next : prev;
            });
        }, 60000);

        return () => clearInterval(interval);
    }, [setTimeline]);

    useEffect(() => {
        if (filteredTimeline && filteredTimeline.length !== 0) {
            const groupKeys = Object.keys(grouped());
            const todayIndex = groupKeys.findIndex(date => date === today);
            const focusDose = focusDoseKey ? filteredTimeline.find((dose) => makeDoseKey(dose) === focusDoseKey) : null;
            const focusDateKey = focusDose ? new Date(focusDose.time).toDateString() : null;
            const focusDateIndex = (focusDateKey) ? groupKeys.findIndex((date) => date === focusDateKey) : -1;
            if (!collapseInitRef.current || isCollapsed.length !== groupKeys.length) {
                setCollapsed(
                    groupKeys.map((_, idx) => {
                        if (focusDateIndex >= 0) {
                            return idx !== focusDateIndex;
                        }
                        return idx !== todayIndex;
                    })
                );
                collapseInitRef.current = true;
            }
        }
    }, [filteredTimeline, isCollapsed.length, focusDoseKey]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
        const parseStoredBool = (value, fallback) => {
            if (value === null || value === 'undefined') return fallback;
            try {
                return JSON.parse(value);
            } catch (error) {
                return fallback;
            }
        };
        const formOpen = parseStoredBool(localStorage.getItem('formCollapsed'), true);
        const doseOpen = parseStoredBool(localStorage.getItem('doseCollapsed'), true);
        const focusKey = localStorage.getItem(DOSE_FOCUS_KEY) || '';
        setFocusDoseKey(focusKey);
        setFormCollapsed(focusKey ? true : formOpen);
        setDoseCollapsed(doseOpen);
        setTimeout(() => {
            scrollToNextCurrentDose();
        }, 200); // Delay to ensure the DOM is updated

    }, []);

    useEffect(() => {
        if (!focusDoseKey || !scheduleRef.current) return;
        const targetDose = scheduleRef.current.querySelector(`[data-dose-key="${focusDoseKey}"]`);
        if (!targetDose) {
            scrollToNextCurrentDose();
            localStorage.removeItem(DOSE_FOCUS_KEY);
            setFocusDoseKey('');
            return;
        }

        targetDose.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetDose.classList.add('bg-yellow');
        const timeout = setTimeout(() => {
            targetDose.classList.remove('bg-yellow');
        }, 1800);

        localStorage.removeItem(DOSE_FOCUS_KEY);
        setFocusDoseKey('');
        return () => clearTimeout(timeout);
    }, [focusDoseKey, isCollapsed]);

    const cancelEdit = () => {
        setEdit(false);
        setForm({})
        setEditForm({});
    }

    const addMed = () => {
        const parsedStart = new Date(form.startTime);
        if (Number.isNaN(parsedStart.getTime())) {
            alert('Please choose a valid start date/time before adding a medication.');
            return;
        }

        const isPerDay = form.dosingMode.startsWith('daily-');
        const dosesPerDay = isPerDay ? Number(form.dosingMode.replace('daily-', '')) : null;
        const intervalValue = isPerDay ? 24 : parseFloat(form.interval);
        if (!isPerDay && (!Number.isFinite(intervalValue) || intervalValue <= 0)) {
            alert('Please enter a valid interval greater than 0 hours.');
            return;
        }
        if (isPerDay && dosesPerDay > 1) {
            if (!form.dayEnd || !/^\d{2}:\d{2}$/.test(form.dayEnd)) {
                alert('Please choose a valid Day End time for multi-dose daily schedules.');
                return;
            }
            const [endHour, endMinute] = form.dayEnd.split(':').map(Number);
            const endDate = new Date(parsedStart);
            endDate.setHours(endHour, endMinute, 0, 0);
            if (endDate <= parsedStart) {
                alert('Day End must be later than Start time for 2-5 per day schedules.');
                return;
            }
        }

        const totalDosesValue = form.totalDoses ? parseInt(form.totalDoses) : null;
        const newMed = {
            ...form,
            id: form.id || Date.now(),
            startDate: today,
            startTime: parsedStart.toISOString(),
            dosingMode: isPerDay ? 'perDay' : 'interval',
            dosesPerDay: isPerDay ? dosesPerDay : null,
            dayEnd: isPerDay ? form.dayEnd : '',
            interval: intervalValue,
            totalDoses: totalDosesValue,
            continuous: !totalDosesValue
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
            dayEnd: '',
            endDate: '',   // New
            endTime: '',   // New
            dosingMode: 'interval',
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

    const handleResetTimeline = () => {
        const confirmed = window.confirm('Reset timeline? This will clear generated doses but keep your medications.');
        if (!confirmed) return;
        localStorage.removeItem('medsTimeline');
        setTimeline([]);
    };

    const handleDelete = (id) => {
        const confirmed = window.confirm(`Are you sure you want to delete ${meds.filter((m) => m.id !== id).name}?`);
        if (!confirmed) return;

        const updated = meds.filter((m) => m.id !== id);
        setUndoStack([...undoStack, meds]);
        setMeds(updated);
    };

    const handleToggleContinuous = (medId, nextValue) => {
        setMeds(meds.map((med) => {
            if (med.id !== medId) return med;
            return {
                ...med,
                continuous: nextValue,
                totalDoses: nextValue ? null : (med.totalDoses || 10)
            };
        }));
    };

    const displayAddForm = () => <div className=''>
        <div className='flexContainer containerDetail mt-10 mb-5 p-10'>
            <div className='p-10 flexColumn contentRight color-yellow'>
                💊 Substance:
            </div>
            <div className='flex2Column contentLeft'>
                <input 
                    className='containerDetail p-10 width--5 color-lite' 
                    placeholder='Substance' 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
            </div>
        </div>
        <div className='flexContainer containerDetail mb-5 p-10'>
            <div className='p-10 flexColumn contentRight color-yellow'>📋 Instructions:</div>
            <div className='flex2Column contentLeft'>
                <input
                    className='containerDetail p-10 width--5 color-lite' 
                    placeholder='Instruction' 
                    value={form.instruction} 
                    onChange={(e) => setForm({ ...form, instruction: e.target.value })} 
                />
            </div>
        </div>
        <div className='flexContainer containerDetail mb-5 p-10'>
            <div className='p-10 flexColumn contentRight color-yellow'>⚠️ Warnings:</div>
            <div className='flex2Column contentLeft'>
                <input
                    className='containerDetail p-10 width--5 color-lite' 
                    placeholder='Warnings (optional)' 
                    value={form.warning} 
                    onChange={(e) => setForm({ ...form, warning: e.target.value })} 
                />
            </div>
        </div>
        <div className='flexContainer containerDetail mb-5 p-10'>
            <div className='p-15 flexColumn contentRight color-yellow'>Start:</div>
            <div className='flex2Column contentLeft'>
                <input 
                    type='datetime-local' 
                    className='containerDetail p-10 width--10 color-lite' 
                    value={form.startTime} 
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })} 
                />
            </div>
            
        </div>
        <div className='flexContainer containerDetail mb-5 p-10'>
            <div className='p-10 flexColumn contentRight color-yellow'>Mode:</div>
            <div className='flex2Column contentLeft'>
                <select
                    className='containerDetail p-10 width--5 color-lite'
                    value={form.dosingMode || 'interval'}
                    onChange={(e) => setForm({ ...form, dosingMode: e.target.value })}
                >
                    <option value='interval'>By interval</option>
                    <option value='daily-1'>1 per day</option>
                    <option value='daily-2'>2 per day</option>
                    <option value='daily-3'>3 per day</option>
                    <option value='daily-4'>4 per day</option>
                    <option value='daily-5'>5 per day</option>
                </select>
            </div>
        </div>
        <div className='flexContainer containerDetail mb-5 p-10'>
            <div className='p-10 flexColumn contentRight color-yellow'>🌇 Day End:</div>
            <div className='flex2Column contentLeft'>
                <input
                    type='time'
                    className='containerDetail p-10 width--5 color-lite'
                    value={form.dayEnd || ''}
                    disabled={!form.dosingMode.startsWith('daily-')}
                    onChange={(e) => setForm({ ...form, dayEnd: e.target.value })}
                />
            </div>
        </div>
        <div className='flexContainer containerDetail mb-5 p-10'>
            <div className='p-10 flexColumn contentRight color-yellow'>⏱️ Interval:</div>
            <div className='flex2Column contentLeft'>
                <input 
                    type='number'
                    className='containerDetail p-10 width--5 color-lite'
                    placeholder='Interval (hrs)'
                    value={(form.dosingMode.startsWith('daily-')) ? 24 : form.interval}
                    disabled={form.dosingMode.startsWith('daily-')}
                    onChange={(e) => setForm({ ...form, interval: e.target.value })}
                />
            </div>
        </div>
        <div className='flexContainer containerDetail mb-5 p-10'>
            <div className='color-yellow p-10'>💊💊💊 Doses:</div>
            <div className='flex2Column contentLeft'>
                <input 
                    type='number'
                    className='containerDetail p-10 width--5 color-lite'
                    placeholder='Total Doses'
                    value={form.totalDoses || 0}
                    onChange={(e) => setForm({ ...form, totalDoses: e.target.value })}
                />
            </div>
        </div>
        <div className='containerDetail mb-5'>
            <div className='containerDetail p-15 mb-5 p-10 color-yellow contentLeft'>
                📅 Days:
            </div>
            <div className='contentLeft'>
                <div className='containerDetail mb-5'>
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
                <div className='flexContainer containerDetail'>
                    {ALL_DAYS.map(day => (
                        <label key={`dose-day-${day}`} className={`flex7Column size15 color-lite containerDetail m-1 ${((form.weekdays && form.weekdays.includes(day)) || false)? 'bg-blue': 'bg-lite'} contentCenter`}>
                            <input
                                className='m-5'
                                type='checkbox'
                                checked={(form.weekdays && form.weekdays.includes(day)) || false}
                                onChange={e => {
                                    const currentWeekdays = Array.isArray(form.weekdays) ? form.weekdays : [];
                                    setForm({
                                        ...form,
                                        weekdays: e.target.checked
                                            ? [...currentWeekdays, day]
                                            : currentWeekdays.filter(d => d !== day)
                                    });
                                }}
                            />
                            <div>{day}</div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
        <div className='flexContainer'>
            <div className='containerDetail flex2Column button p-20 bg-green color-lite' onClick={addMed}>
                {
                    
                        (edit)
                        ? 'Save'
                        : 'Add'
                }
            </div>
            {
                <div className='containerDetail ml-5 p-20 flex2Column bg-dkYellow color-lite button' onClick={(edit) ? cancelEdit : () => setFormCollapsed(true)}>
                    Cancel
                </div>
            }
        </div>
    </div>

    return (
            <div className='mt--30 width--10'>
                <div className='containerDetail p-20 color-yellow bg-lite size30 m-5 contentLeft'>
                    💊 Dose Reminder
                </div>
                <div className='containerDetail bg-lite m-5 size20'>
                    <div className='containerDetail bg-lite size20'>
                        <CollapseToggleButton
                            title={<span className='color-yellow'>Add Medication</span>}
                            isCollapsed={formCollapsed}
                            setCollapse={setFormCollapsed}
                            align='left'
                        />
                    </div>
                    {
                        (formCollapsed)
                        ? null
                        : displayAddForm()
                    }
                </div>
                <div className='containerDetail bg-lite m-5 size20'>
                    <div className='containerDetail bg-lite size20'>
                        <CollapseToggleButton
                            title={<span className='color-yellow'>Medications</span>}
                            isCollapsed={doseCollapsed}
                            setCollapse={setDoseCollapsed}
                            align='left'
                        />
                    </div>
                    {
                        (doseCollapsed)
                            ? null
                            : meds.map((med) => (
                                <div key={`dose-med-${String(med.id)}`} className='containerDetail mb-5'>
                                    {(() => {
                                        const isContinuous = (typeof med.continuous === 'boolean')
                                            ? med.continuous
                                            : !med.totalDoses;
                                        return (
                                    <>
                                        <div className='containerDetail contentLeft p-10 color-yellow mb-5'>
                                            {
                                                ((med.dosingMode === 'perDay') || (med.dosingMode === 'daily') || Number(med.dosesPerDay) > 0)
                                                    ? `${med.name} ${Number(med.dosesPerDay) || 1} per day${med.dayEnd ? ` (to ${med.dayEnd})` : ''} ${med.totalDoses ? `for ${med.totalDoses} doses` : '(ongoing)'}`
                                                    : `${med.name} every ${med.interval} hrs ${med.totalDoses ? `for ${med.totalDoses} doses` : '(ongoing)'}`
                                            }
                                        </div>
                                        <div className='containerDetail flexContainer mb-5'>
                                            <label className='flexContainer color-lite'>
                                                <input
                                                    className='m-5'
                                                    type='checkbox'
                                                    checked={isContinuous}
                                                    onChange={(e) => handleToggleContinuous(med.id, e.target.checked)}
                                                />
                                                <span>Continuous</span>
                                            </label>
                                        </div>
                                    </>
                                        );
                                    })()}
                                    <div className='flexContainer'>
                                        <div className='containerDetail flex2Column button bg-lite mr-5' onClick={() => setEditForm(med)}>✏️</div>
                                        <div className='containerDetail flex2Column button bg-lite' onClick={() => handleDelete(med.id)}>🗑️</div>
                                    </div>
                                </div>
                            ))
                    }
                </div>
                {
                    (undoStack.length > 0)
                        ? <div className='containerDetail button bg-red m-5' onClick={handleUndo}>
                            Undo Last Push
                            </div>
                        : null
                }

                <div className='containerDetail m-5' ref={scheduleRef}>
                {
                    (filteredTimeline && filteredTimeline.length !== 0) 
                    ? Object.entries(grouped()).map(([date, times], i) => (
                        <div key={`dose-date-group-${i}-${String(date)}`} className='mb-5'>
                            <div key={`dose-date-header-${i}-${String(date)}`} className={`containerDetail p-10 mb-5 bg-${(date === today) ? 'green color-lite' : 'lite'}`}>
                            <CollapseToggleButton
                                title={<div className={`${(date === today) ? 'color-yellow' : 'color-lite'} size20`}>{date}</div>}
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
                                    <div key={`dose-time-${i}-${j}-${String(time)}`} className={`containerDetail mb-5 bg-${display === 'missed' ? 'dkYellow' : display === 'upcoming' ? 'green' : 'lite'}`}>
                                        <div className={`containerDetail size20 p-10 color-${display === 'missed' ? 'red' : display === 'upcoming' ? 'yellow' : 'lite'}`}>
                                            {display} - {time}
                                        </div>
                                        {doses.map((dose, idx) => {
                                            const doseTime = new Date(dose.time);
                                            const status = doseTime < now ? 'missed' : (doseTime - now < 60 * 60 * 1000 ? 'upcoming' : '');
                                            return (
                                                <div key={`dose-item-${i}-${j}-${idx}-${makeDoseKey(dose)}`}>
                                                    <CheckBoxTimer
                                                        idx={idx}
                                                        dose={dose}
                                                        status={status}
                                                        pushDose={() => pushDose(idx, pushMinutes, false)}
                                                        doseTime={doseTime}
                                                        doseKey={makeDoseKey(dose)}
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
                <div className={`z1 bt-0 r-10 width-100-percent m-1 mb-5`}>
                    <div className='containerDetail button p-10 color-yellow size20 bg-green ml-5 width--20 mt-5' onClick={handleResetTimeline}>
                        Reset Timeline
                    </div>
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