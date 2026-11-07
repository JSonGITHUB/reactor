import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import ActivitiesPieChart from './ActivitiesPieChart';
import validate from '../utils/validate';
import TimeSelectorDialog from '../utils/TimesSelectorDialog';
import defaultTrainingData from './defaultTrainingData';
import defaultGoalData from './defaultGoalData';
import { secondsToTime, timeToSeconds } from './TimeConversions';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';
import { useLayout } from '../utils/LayoutContext';

const TRAINING_STATUS_EVENT = 'trainingTimerStatusChanged';
const TRAINING_LOGS_STORAGE_KEY = 'trainingLogsCollection';
const TRAINING_LOG_SELECTED_KEY = 'trainingLogSelectedId';

const cloneActivities = (items = []) => items.map((item) => ({ ...item }));

const createTrainingLog = (name, trainingData, goalData) => ({
    id: `training-log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    trainingData: cloneActivities(trainingData),
    goalData: cloneActivities(goalData),
});

const parseStoredLogs = () => {
    try {
        const raw = localStorage.getItem(TRAINING_LOGS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((log) => (
            log
            && typeof log.id === 'string'
            && typeof log.name === 'string'
            && Array.isArray(log.trainingData)
            && Array.isArray(log.goalData)
        ));
    } catch {
        return [];
    }
};

const TrainingLog = () => {
    const categories = ['SKILL', 'TIME', 'percentage'];
    const colors = [
        '#0088FE',  // Blue
        '#00C49F',  // Green
        '#FFBB28',  // Yellow
        '#FF8042',  // Orange
        '#A569BD',  // Purple
        '#5DADE2',  // Light Blue
        '#F1948A',  // Light Red
        '#52BE80',  // Light Green
        '#F7DC6F',  // Light Yellow
        '#DC7633'   // Brown
    ];

    //const [startTime, setStartTime] = useState();
    const [edit, setEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editCategory, setEditCategory] = useState(null);
    const [timeUnit, setTimeUnit] = useState(null);
    const [trainingData, setTrainingData] = useState();
    const [goalData, setGoalData] = useState();
    const [totalTime, setTotalTime] = useState(0);
    const [goalTime, setGoalTime] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [collapseTraining, setCollapseTraining] = useState(true);
    const [collapseGoals, setCollapseGoals] = useState(true);
    const [timer, setTimer] = useState(false);
    const [timing, setTiming] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeTimers, setActiveTimers] = useState();
    const [admin, setAdmin] = useState(false);
    const [trainingLogs, setTrainingLogs] = useState([]);
    const [selectedLogId, setSelectedLogId] = useState('');

    const convertSecondsToTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const paddedHours = String(hours).padStart(2, '0');
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    };
    const setTime = (time, category) => {
        if (category === 'training') {
            setTotalTime(time);
        } else if (category === 'goal') {
            setGoalTime(time);
        }
    };

    const setGoals = () => setGoalData(trainingData);
    const toggleAdmin = () => setAdmin(prev => !prev);
    const toggleActiveTimer = () => setActiveTimers(prev => !prev);

    const syncSelectedLogData = (nextTrainingData, nextGoalData) => {
        if (!selectedLogId) return;
        setTrainingLogs((prev) => {
            let changed = false;
            const updated = prev.map((log) => {
                if (log.id !== selectedLogId) return log;
                changed = true;
                return {
                    ...log,
                    trainingData: cloneActivities(nextTrainingData),
                    goalData: cloneActivities(nextGoalData),
                };
            });
            return changed ? updated : prev;
        });
    };

    const convertTimeToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
    };

    const calculatePercentages = (activities, category) => {
        const totalSeconds = activities.reduce((total, activity) => {
            const activityTime = timeToSeconds(activity.time);
            return total + activityTime;
        }, 0);
        setTime(totalSeconds, category);
        return activities.map((activity) => {
            const activitySeconds = timeToSeconds(activity.time);
            const percentage = (activitySeconds / totalSeconds) * 100;
            return {
                ...activity,
                percentage: percentage.toFixed(2)
            };
        });
    };

    const reset = () => {
        // eslint-disable-next-line no-restricted-globals
        const check = confirm('Are you sure you want to reset training log?');
        if (check) {
            const newTrainingData = [...goalData];
            newTrainingData.map((goal) => {
                return {
                    ...goal,
                    time: '00:00:00',
                    percentage:'0'
                }
            })
            setTrainingData(newTrainingData);
        }
    }
    const resetZero = () => {
        // eslint-disable-next-line no-restricted-globals
        const check = confirm('Are you sure you want to zero?');
        if (check) {
            const newTrainingData = [...goalData];
            const zeroData = newTrainingData.map(goal => ({
                ...goal,
                time: '00:00:00',
                percentage: '0'
            }));
            setTrainingData(zeroData); 
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        let timerInterval;
        if (timer) {
            timerInterval = setInterval(() => {
                setCurrentTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            return () => clearInterval(timerInterval);
        }
        return () => clearInterval(timerInterval);
    }, [timer]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (validate(activeTimers) !== null) {
            localStorage.setItem('activeTimers', activeTimers);
        }
    }, [activeTimers]);

    useEffect(() => {
        if (!Array.isArray(trainingLogs) || !trainingLogs.length) return;
        localStorage.setItem(TRAINING_LOGS_STORAGE_KEY, JSON.stringify(trainingLogs));
        if (selectedLogId) localStorage.setItem(TRAINING_LOG_SELECTED_KEY, selectedLogId);
    }, [trainingLogs, selectedLogId]);

    const resetGoals = () => {
        localStorage.setItem('trainingData', JSON.stringify(defaultTrainingData));
        localStorage.setItem('goalData', JSON.stringify(defaultGoalData));
        setTrainingData(defaultTrainingData);
        setGoalData(defaultGoalData);
    }
    
    useEffect(() => {

        const restart = (training) => {
            const now = new Date();
            const storedStartTime = new Date(parseInt(initializeData('trainingStartTime', now.getTime()), 10));
            const storedElapsedTime = Number(initializeData('trainingElapsedTime', 0))
            const elapsedSeconds = Math.floor((now - storedStartTime) / 1000);
            const newTrainingData = [...training];
            const storedActiveIndex = initializeData('trainingActiveIndex', false);

            if (storedActiveIndex && storedStartTime) {
                newTrainingData[storedActiveIndex].time = convertSecondsToTime(elapsedSeconds + storedElapsedTime);
            }
            const updatedActivities = calculatePercentages(newTrainingData, 'training');
            setTrainingData(updatedActivities);
        }
        
        const localData = initializeData('trainingData', defaultTrainingData);
        const localGoalData = initializeData('goalData', defaultGoalData);

        const normalizedTrainingData = Array.isArray(localData) ? localData : defaultTrainingData;
        const normalizedGoalData = Array.isArray(localGoalData) ? localGoalData : defaultGoalData;

        let initialLogs = parseStoredLogs();
        if (!initialLogs.length) {
            initialLogs = [createTrainingLog('Primary Log', normalizedTrainingData, normalizedGoalData)];
        }

        const storedSelectedLogId = localStorage.getItem(TRAINING_LOG_SELECTED_KEY);
        const hasStoredSelected = initialLogs.some((log) => log.id === storedSelectedLogId);
        const initialSelectedLogId = hasStoredSelected ? storedSelectedLogId : initialLogs[0].id;
        const selectedLog = initialLogs.find((log) => log.id === initialSelectedLogId) || initialLogs[0];

        setTrainingLogs(initialLogs);
        setSelectedLogId(initialSelectedLogId);
        restart(selectedLog.trainingData);
        calculatePercentages(selectedLog.trainingData, 'training');
        
        const storedActiveTimers = initializeData('activeTimers', false);
        setActiveTimers(storedActiveTimers === 'true');
        const storedStartTime = initializeData('trainingStartTime', false);
        const storedActiveIndex = initializeData('trainingActiveIndex', false);
        
        if (storedActiveIndex && storedStartTime) {

            //setStartTime(new Date(parseInt(storedStartTime, 10)));
            setCurrentTime(convertTimeToSeconds(selectedLog.trainingData[storedActiveIndex].time));
            setTiming({
                index: storedActiveIndex,
                goal: selectedLog.trainingData[storedActiveIndex].skill,
                time: selectedLog.trainingData[storedActiveIndex].time
            });
            setTimer(true);
        }
        if (!Array.isArray(selectedLog.goalData) || selectedLog.goalData === null || selectedLog.goalData === 'null') {
            setGoalData(defaultGoalData);
            calculatePercentages(defaultGoalData, 'goal');
        } else {
            setGoalData(selectedLog.goalData);
            calculatePercentages(selectedLog.goalData, 'goal');
        }
        const timer = setTimeout(() => {
            setCollapseTraining(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (validate(trainingData) !== null && trainingData !== undefined) {
            localStorage.setItem('trainingData', JSON.stringify(trainingData));
        } else {
            const savedTrainingData = initializeData('trainingData', defaultTrainingData);
            setTrainingData(savedTrainingData);
        }
    }, [trainingData]);

    useEffect(() => {
        if (trainingData && (timing !== null)) {
            const newData = [...trainingData];
            newData[timing.index].time = convertSecondsToTime(currentTime);
            const updatedActivities = calculatePercentages(newData, 'training');
            setTrainingData(updatedActivities);
        }
    }, [currentTime]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (timing) {
        }
    }, [timing]);
    
    useEffect(() => {
        if (validate(goalData) !== null) {
            localStorage.setItem('goalData', JSON.stringify(goalData));
        }
    }, [goalData]);

    useEffect(() => {
        if (!selectedLogId || !Array.isArray(trainingData) || !Array.isArray(goalData)) return;
        syncSelectedLogData(trainingData, goalData);
    }, [trainingData, goalData, selectedLogId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
    }, [editIndex]);

    const toggleEdit = (index, category, unit/*, timeUnits*/) => {
        if (!edit) {
            setEditIndex(index);
            setEditCategory(category);
            setIsDialogOpen(true);
        } else {
            setEditIndex(null);
            setEditCategory(null);
            setIsDialogOpen(false);
        }
        setEdit(prev => !prev);
    }

    const showArrows = (category) => (category === 'TIME') ? false : false;
    const editGoal = (index) => {
        const newGoal = prompt('New goal', goalData[index].skill);
        if (validate(newGoal) !== null) {
            const newTrainingData = [...trainingData];
            const newGoalData = [...goalData];
            newTrainingData[index].skill = newGoal;
            newGoalData[index].skill = newGoal;
            setTrainingData(newTrainingData);
            setGoalData(newGoalData);
        }
    };
    const addGoal = () => {
        const newGoalLabel = prompt(`Add new goal: `, '');
        if (validate(newGoalLabel) !== null) {
            const newTrainingData = [...trainingData];
            const newGoalData = [...goalData];
            const newGoal = {
                skill: newGoalLabel,
                time: '00:00:00',
                percentage: '0'
            }
            newTrainingData.push(newGoal);
            newGoalData.push(newGoal);
            setTrainingData(newTrainingData);
            setGoalData(newGoalData);
        }
    };
    const addTime = (index) => {
        const newTrainingData = [...trainingData];
        const time = newTrainingData[index].time;
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const date = new Date();
        if (timeUnit === 'seconds') {
            date.setHours(hours, minutes, seconds + 1);
        } else if (timeUnit === 'minutes') {
            date.setHours(hours, minutes + 1, seconds);
        } else if (timeUnit === 'hours') {
            date.setHours(hours + 1, minutes, seconds);
        }

        const newTime = date.toTimeString().slice(0, 8);
        newTrainingData[index].time = newTime;
        const updatedActivities = calculatePercentages(newTrainingData, 'training');
        setTrainingData(updatedActivities);
    };
    const removeTime = (index) => {
        const newTrainingData = [...trainingData];
        const time = newTrainingData[index].time;
        const [hours, minutes, seconds] = time.split(':').map(Number);
        const date = new Date();
        if (timeUnit === 'seconds') {
            date.setHours(hours, minutes, seconds - 1);
        } else if (timeUnit === 'minutes') {
            date.setHours(hours, minutes - 1, seconds);
        } else if (timeUnit === 'hours') {
            date.setHours(hours - 1, minutes, seconds);
        }

        const newTime = date.toTimeString().slice(0, 8);
        newTrainingData[index].time = newTime;
        const updatedActivities = calculatePercentages(newTrainingData, 'training');
        setTrainingData(updatedActivities);
    };

    const handleTimeChange = (newTime) => {
        const newData = (editCategory === 'goal') ? [...goalData] : [...trainingData];
        newData[editIndex].time = newTime;
        const updatedActivities = calculatePercentages(newData, editCategory);
        if (editCategory === 'training') {
            setTrainingData(updatedActivities);
        } else if (editCategory === 'goal') {
            setGoalData(updatedActivities);
        }
        calculatePercentages(updatedActivities, editCategory);
        setIsDialogOpen(false);
        setEditIndex(null);
        setTimeUnit(null);
        toggleEdit(null, null, null);
    };
    const categoryStyle = (index) => {
        return {
            fontColor: colors[index],
            color: colors[index]
        }
    };
    const startTimer = (training, index) => {
        //trainingData[index].time
        const now = new Date();
        //setStartTime(now);
        localStorage.setItem('trainingStartTime', now.getTime());
        const time = training.time;
        const goal = training.skill;
        localStorage.setItem('trainingElapsedTime', convertTimeToSeconds(time));
        localStorage.setItem('trainingActiveIndex', index);
        setCurrentTime(convertTimeToSeconds(time));
        setTiming({
            index,
            goal,
            time
        })
        setTimer(true);
        window.dispatchEvent(new Event(TRAINING_STATUS_EVENT));
    }
    const stopTimer = () => {
        const now = new Date();
        const storedStartTime = new Date(parseInt(initializeData('trainingStartTime', now.getTime()), 10));
        const storedElapsedTime = Number(initializeData('trainingElapsedTime', 0))
        const elapsedSeconds = Math.floor((now - storedStartTime) / 1000);
        localStorage.removeItem('trainingStartTime');
        localStorage.removeItem('trainingActiveIndex');
        const newTrainingData = [...trainingData];
        newTrainingData[timing.index].time = convertSecondsToTime(elapsedSeconds + storedElapsedTime);
        const updatedActivities = calculatePercentages(newTrainingData, 'training');
        localStorage.removeItem('trainingElapsedTime');
        setTrainingData(updatedActivities);
        setTiming(null);
        setTimer(false);
        window.dispatchEvent(new Event(TRAINING_STATUS_EVENT));
    }
    const toggleTimer = (training, index) => {
        if (timer) {
            stopTimer();
        } else {
            startTimer(training, index);
        }
    }
    const isObjectWithGoal = (variable) => {
        if (variable !== null && typeof variable === 'object') {
            return variable.hasOwnProperty('goal');
        }
        return false;
    };
    const deleteGoal = (index) => {
        const deleteItem = window.confirm(`Delete ${trainingData[index].skill}`)
        if (deleteItem) {
            const newTrainingData = [...trainingData];
            const newGoalData = [...goalData];
            newTrainingData.splice(index, 1);
            newGoalData.splice(index, 1);
            setTrainingData(newTrainingData);
            setGoalData(newGoalData);
        }
    }

    const applyTrainingLogSelection = (targetLog) => {
        if (!targetLog) return;
        setSelectedLogId(targetLog.id);
        setTimer(false);
        setTiming(null);
        setCurrentTime(0);
        localStorage.removeItem('trainingStartTime');
        localStorage.removeItem('trainingActiveIndex');
        localStorage.removeItem('trainingElapsedTime');

        const nextTrainingData = calculatePercentages(cloneActivities(targetLog.trainingData), 'training');
        const nextGoalData = calculatePercentages(cloneActivities(targetLog.goalData), 'goal');
        setTrainingData(nextTrainingData);
        setGoalData(nextGoalData);
        window.dispatchEvent(new Event(TRAINING_STATUS_EVENT));
    };

    const selectTrainingLog = (logId) => {
        const targetLog = trainingLogs.find((log) => log.id === logId);
        applyTrainingLogSelection(targetLog);
    };

    const addTrainingLog = () => {
        const newName = prompt('New training log name', 'New Training Log');
        if (validate(newName) === null) return;
        const nextLog = createTrainingLog(newName, defaultTrainingData, defaultGoalData);
        setTrainingLogs((prev) => [...prev, nextLog]);
        applyTrainingLogSelection(nextLog);
    };

    const renameTrainingLog = () => {
        const selectedLog = trainingLogs.find((log) => log.id === selectedLogId);
        if (!selectedLog) return;
        const nextName = prompt('Rename training log', selectedLog.name);
        if (validate(nextName) === null) return;
        setTrainingLogs((prev) => prev.map((log) => (
            log.id === selectedLogId ? { ...log, name: nextName } : log
        )));
    };

    const deleteTrainingLog = () => {
        if (!Array.isArray(trainingLogs) || trainingLogs.length <= 1) {
            alert('At least one training log is required.');
            return;
        }
        const selectedLog = trainingLogs.find((log) => log.id === selectedLogId);
        if (!selectedLog) return;
        const check = window.confirm(`Delete training log: ${selectedLog.name}?`);
        if (!check) return;

        const remainingLogs = trainingLogs.filter((log) => log.id !== selectedLogId);
        const replacementLog = remainingLogs[0];
        setTrainingLogs(remainingLogs);
        applyTrainingLogSelection(replacementLog);
    };

    const layout = useLayout();
    const appBg = layout?.colors?.background;
    const appPrimaryColor = layout?.colors?.primary;
    const headerBackground = layout?.colors?.headerBackground;

    return (
        <div className='mt--30 color-lite size20'>
            <div className='containerDetail bg-lite m-5 p-10'>
                <div className='containerDetail size20 color-yellow contentLeft p-10'>
                    Training Logs
                </div>
                <div className='flexContainer mt-5'>
                    <div className='flex2Column contentLeft'>
                        <select
                            className='containerDetail p-10 bg-tintedMedium color-lite width-100-percent mt--1'
                            value={selectedLogId}
                            onChange={(e) => selectTrainingLog(e.target.value)}
                            aria-label='Select training log'
                        >
                            {trainingLogs.map((log) => (
                                <option key={log.id} value={log.id}>{log.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex2Column ml-5'>
                        <div className='containerDetail flexContainer'>
                            <button type='button' className='containerDetail button bg-dkGreen color-lite p-10 flex3Column' onClick={addTrainingLog} aria-label='Add training log'>
                                {icons.plus}
                            </button>
                            <button type='button' className='containerDetail button bg-oceanblue color-lite p-10 flex3Column ml-5' onClick={renameTrainingLog} aria-label='Rename selected training log'>
                                {icons.edit || '✏️'}
                            </button>
                            <button type='button' className='containerDetail button bg-dkRed color-lite p-10 flex3Column ml-5' onClick={deleteTrainingLog} aria-label='Delete selected training log'>
                                {icons.delete}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='containerDetail bg-lite m-5'>
                <div 
                    className='containerDetail bg-lite'
                    style={{
                        color: appPrimaryColor,
                        background: headerBackground,
                    }}
                >
                    <CollapseToggleButton
                        title={<div className='ml--30 color-yellow size20 contentLeft' style={{
                            color: appPrimaryColor
                        }}>⚙️ Goal Settings</div>}
                        isCollapsed={collapseGoals}
                        setCollapse={setCollapseGoals}
                    />
                </div>
                {
                    (collapseGoals)
                    ? null
                    : <div>
                        <div className='containerDetail flexContainer bg-tintedMedium mt-5'>
                            <div className='flex3Column'>
                            </div>
                            <div className='flex3Column'>
                                {
                                    (trainingData)
                                        ? <ActivitiesPieChart
                                            trainingData={trainingData}
                                            goalData={goalData}
                                            colors={colors}
                                            category='goals'
                                            categories={categories}
                                        />
                                        : null
                                }
                            </div>
                            <div className='flex3Column'>
                            </div>
                        </div>
                        <div className='flexContainer'>
                            {
                                (categories && goalData !== null)
                                ? categories.map((category, i) => <div key={`training-goal-category-${i}-${String(category)}`} className='flex3Column mr-5'>
                                    <div className={`containerDetail mt-5 ${(i === 1) ? '': null} pt-5 pb-5 color-lite size20 bg-lite`}>
                                        {(category === 'TIME') ? secondsToTime(goalTime) : (category === 'percentage') ? '%' : category}
                                    </div>
                                    {
                                        goalData.map((training, index) => <div key={`training-goal-row-${i}-${index}-${String(training?.skill || 'training')}`} className={`containerDetail mt-5 ${(index === 1) ? '': null} pt-10 pb-10 flexContainer button size20`} style={categoryStyle(index)}>
                                            <div className='flex3Column'>
                                                {
                                                    (category === 'TIME')
                                                    ? <div onClick={() => toggleEdit(index, 'goal', 'time')}>
                                                        <span
                                                            className={`button`}
                                                        >
                                                            {training[category.toLowerCase()].split(':')[0]}:
                                                        </span>
                                                        <span className={`button`}>
                                                            {training[category.toLowerCase()].split(':')[1]}:
                                                        </span>
                                                        <span className={`button`}>
                                                            {training[category.toLowerCase()].split(':')[2]}
                                                        </span>
                                                    </div>
                                                    : (category === 'SKILL')
                                                        ? (!admin)
                                                            ? <div className='button' onClick={() => editGoal(index)}>
                                                                {`${training[category.toLowerCase()]}`}
                                                            </div>
                                                            : <div className='flexContainer'>
                                                                <div className='flex9Column button' onClick={() => deleteGoal(index)}>
                                                                    {icons.delete}
                                                                </div>
                                                                <div className='flex2Column button' onClick={() => editGoal(index)}>
                                                                    {`${training[category.toLowerCase()]}`}
                                                                </div>
                                                            </div>
                                                        : <div>
                                                            {`${training[category.toLowerCase()]}${(category === 'percentage') ? ' %' : ''}`}
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                        )
                                    }
                                </div>
                                )
                                : null

                            }

                        </div>
                        <div className='containerBox'>
                            <div className='flexContainer'>
                                <div className='flex2Column containerBox p-20 button text-outline-lite bg-dkGreen' onClick={() => addGoal()}>
                                    {icons.plus}
                                </div>
                                <div className='flex2Column containerBox button p-20 bg-dkRed' onClick={() => toggleAdmin()}>
                                    <div className='centerVertical'>
                                        {icons.delete}
                                    </div>
                                </div>
                            </div>
                            <div className='containerBox button bg-oceanblue p-20' onClick={() => toggleActiveTimer()}>
                                <div className='centerVertical'>
                                    <input
                                        id='activeTimers'
                                        name='activeTimers'
                                        className='regular-checkbox button glassy mr-10 mb--4'
                                        type='checkbox'
                                        checked={activeTimers}
                                        onChange={() => toggleActiveTimer()}
                                    />
                                    Use Active Timers
                                </div>
                            </div>
                            <div className='mt-10 flex2Column'>
                                <div className='containerDetail p-10 button bg-lite m-5 p-20' onClick={() => resetGoals()}>
                                    Rest Goals
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            <div className='containerDetail bg-lite m-5'>
                <div 
                    className='containerDetail bg-lite'
                    style={{
                        color: appPrimaryColor,
                        background: headerBackground,
                    }}
                >
                    <CollapseToggleButton
                        title={<div className='ml--30 color-yellow size20 contentLeft' style={{
                            color: appPrimaryColor
                        }}>🏋 Training Log</div>}
                        isCollapsed={collapseTraining}
                        setCollapse={setCollapseTraining}
                    />
                </div>
                {
                    (collapseTraining)
                    ? null
                        : <div className='containerDetail flexContainer bg-tintedMedium mt-5'>
                            <div className='flexColumn'>
                            </div>
                            <div className='flexColumn'>
                                {
                                    (trainingData)
                                        ? <ActivitiesPieChart
                                            trainingData={trainingData}
                                            goalData={goalData}
                                            colors={colors}
                                            category='training'
                                            categories={categories}
                                        />
                                        : null
                                }
                            </div>
                            <div className='flexColumn'>
                            </div>
                        </div>
                }
                <TimeSelectorDialog
                    index={editIndex}
                    category={editCategory}
                    data={(editCategory === 'goal') ? goalData : trainingData}
                    handleTimeChange={handleTimeChange}
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    categoryStyle={categoryStyle}
                />
                {
                    (collapseTraining)
                        ? null
                        : <div>
                            <div className='flexContainer'>
                                {
                                    (categories && trainingData !== null)
                                        ? categories.map((category, index) => <div key={`training-category-${index}-${String(category)}`} className='flex3Column'>
                                            <div className='containerDetail m-5 pt-10 pb-10 color-lite size20 bg-lite'>{(category === 'TIME') ? secondsToTime(totalTime) : (category === 'percentage') ? '%' : category}</div>
                                            {
                                                trainingData.map((training, index) => <div key={`training-row-${category}-${index}-${String(training?.skill || 'training')}`} className={`containerDetail m-5 pt-10 pb-10 flexContainer button size20  ${((isObjectWithGoal(timing)) && (timer && (timing.goal === training.skill))) ? 'brdr-blue' : ''}`} style={categoryStyle(index)}>
                                                    {
                                                        (showArrows(category) && edit && (index === editIndex))
                                                            ? <div className='flex3Column button' onClick={() => removeTime(index)}>
                                                                <span className=''>
                                                                    {icons.back}
                                                                </span>
                                                            </div>
                                                            : null
                                                    }
                                                    <div className='flex3Column'>
                                                        {
                                                            (category === 'TIME')
                                                                ? <div className='flexContainer contentCenter'>
                                                                    {
                                                                        (activeTimers)
                                                                            ? <div
                                                                                className={`flex1Auto ml-5 button`}
                                                                                onClick={() => toggleTimer(training, index)}
                                                                            >
                                                                                {icons.track}
                                                                            </div>
                                                                            : null
                                                                    }
                                                                    <div className={`button ${(activeTimers) ? 'flex2Column' : ''} contentLeft`} onClick={() => toggleEdit(index, 'training', 'time')}>
                                                                        <span className={`button ${(timeUnit === 'hours' && editIndex === index) ? 'color-neogreen' : ''}`}
                                                                        //onClick={() => toggleEdit(index, 'hours', 'time')}
                                                                        >
                                                                            {
                                                                                (((isObjectWithGoal(timing)) && timer) && (timing.goal === training.skill))
                                                                                    ? <span>
                                                                                        {convertSecondsToTime(currentTime).split(':')[0]}
                                                                                    </span>
                                                                                    : <span>
                                                                                        {training[category.toLowerCase()].split(':')[0]}
                                                                                    </span>
                                                                            }:
                                                                        </span>
                                                                        <span
                                                                            className={`button ${(timeUnit === 'minutes' && editIndex === index) ? 'color-neogreen' : ''}`}
                                                                        //onClick={() => toggleEdit(index, 'minutes', 'time')}
                                                                        >
                                                                            {
                                                                                (((isObjectWithGoal(timing)) && timer) && (timing.goal === training.skill))
                                                                                    ? <span>
                                                                                        {convertSecondsToTime(currentTime).split(':')[1]}
                                                                                    </span>
                                                                                    : <span>
                                                                                        {training[category.toLowerCase()].split(':')[1]}
                                                                                    </span>
                                                                            }:
                                                                        </span>
                                                                        <span
                                                                            className={`button ${(timeUnit === 'seconds' && editIndex === index) ? 'color-neogreen' : ''}`}
                                                                        //onClick={() => toggleEdit(index, 'seconds', 'time')}
                                                                        >
                                                                            {
                                                                                (((isObjectWithGoal(timing)) && timer) && (timing.goal === training.skill))
                                                                                    ? <span>
                                                                                        {convertSecondsToTime(currentTime).split(':')[2]}
                                                                                    </span>
                                                                                    : <span>
                                                                                        {training[category.toLowerCase()].split(':')[2]}
                                                                                    </span>
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                : <div>
                                                                    {`${training[category.toLowerCase()]}${(category === 'percentage') ? ' %' : ''}`}
                                                                </div>
                                                        }
                                                    </div>
                                                    {
                                                        (showArrows(category) && edit && (index === editIndex))
                                                            ? <div className='flex3Column button' onClick={() => addTime(index)}>
                                                                <span className=''>
                                                                    {icons.play}
                                                                </span>
                                                            </div>
                                                            : null
                                                    }
                                                </div>
                                                )
                                            }
                                        </div>
                                        )
                                        : null
                                }
                            </div>
                            <div className='containerBox p-20'>
                                <div className='flexContainer'>
                                    <div className='containerBox flex2Column button bg-green centerVertical' onClick={() => resetZero()}>
                                        Clear
                                    </div>
                                    <div className='containerBox flex2Column button bg-green' onClick={() => reset()}>
                                        Default
                                    </div>
                                </div>
                                <div className='containerBox button bg-green' onClick={() => setGoals()}>
                                    Set Goals To Match Log
                                </div>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}

export default TrainingLog;