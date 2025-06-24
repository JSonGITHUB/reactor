import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import getKey from '../utils/KeyGenerator';
import ActivitiesPieChart from './ActivitiesPieChart';
import validate from '../utils/validate';
import TimeSelectorDialog from '../utils/TimesSelectorDialog';
import defaultTrainingData from './defaultTrainingData';
import defaultGoalData from './defaultGoalData';
import { secondsToTime, timeToSeconds } from './TimeConversions';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';

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

    const setGoals = () => setGoalData(trainingData);
    const toggleAdmin = () => setAdmin(!admin);
    const toggleActiveTimer = () => setActiveTimers(!activeTimers);
    const convertSecondsToTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const paddedHours = String(hours).padStart(2, '0');
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    };

    const convertTimeToSeconds = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
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
            console.log(`TrainingLog => zeroData: ${JSON.stringify(zeroData, null, 2)}`);
            setTrainingData(zeroData); 
        }
    }
    const setTime = (time, category) => {
        if (category === 'training') {
            setTotalTime(time);
        } else if (category === 'goal') {
            setGoalTime(time);
        }
    }
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
    useEffect(() => {
        let timerInterval;
        if (timer) {
            console.log('timer started')
            timerInterval = setInterval(() => {
                setCurrentTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            console.log('timer stopped')
            return () => clearInterval(timerInterval);
        }
        return () => clearInterval(timerInterval);
    }, [timer]);

    useEffect(() => {
        if (validate(activeTimers) !== null) {
            localStorage.setItem('activeTimers', activeTimers);
        }
    }, [activeTimers]);

    const resetGoals = () => {
        localStorage.setItem('trainingData', JSON.stringify(defaultTrainingData));
        localStorage.setItem('goalData', JSON.stringify(defaultGoalData));
        setTrainingData(defaultTrainingData);
        setGoalData(defaultGoalData);
    }
    const restart = (training) => {
        const now = new Date();
        const storedStartTime = new Date(parseInt(initializeData('trainingStartTime', now.getTime()), 10));
        const storedElapsedTime = Number(initializeData('trainingElapsedTime', 0))
        const elapsedSeconds = Math.floor((now - storedStartTime) / 1000);
        const newTrainingData = [...training];
        console.log(`currentTime: ${currentTime} storedElapsedTime: ${storedElapsedTime}`);
        const storedActiveIndex = initializeData('trainingActiveIndex', false);

        if (storedActiveIndex && storedStartTime) {
            newTrainingData[storedActiveIndex].time = convertSecondsToTime(elapsedSeconds + storedElapsedTime);
        }
        const updatedActivities = calculatePercentages(newTrainingData, 'training');
        setTrainingData(updatedActivities);
    }
    useEffect(() => {
        
        const localData = initializeData('trainingData', defaultTrainingData);
        const localGoalData = initializeData('goalData', defaultGoalData);
        console.log(`TrainingLog => useEffect => localData: ${JSON.stringify(localData, null, 2)}`);
        //setTrainingData(localData);
        restart(localData);
        calculatePercentages(localData, 'training');
        
        const storedActiveTimers = initializeData('activeTimers', false);
        setActiveTimers(storedActiveTimers === 'true');
        const storedStartTime = initializeData('trainingStartTime', false);
        const storedActiveIndex = initializeData('trainingActiveIndex', false);
        
        if (storedActiveIndex && storedStartTime) {

            //setStartTime(new Date(parseInt(storedStartTime, 10)));
            setCurrentTime(convertTimeToSeconds(localData[storedActiveIndex].time));
            setTiming({
                index: storedActiveIndex,
                goal: localData[storedActiveIndex].skill,
                time: localData[storedActiveIndex].time
            });
            setTimer(true);
        }
        if (localGoalData === null || localGoalData === 'null') {
            setGoalData(defaultGoalData);
            calculatePercentages(defaultGoalData, 'goal');
        } else {
            setGoalData(localGoalData);
            calculatePercentages(localGoalData, 'goal');
        }
        const timer = setTimeout(() => {
            setCollapseTraining(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

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
    }, [currentTime]);

    useEffect(() => {
        if (timing) {
            console.log(`timing: ${timing.goal} time: ${timing.time}`)
        }
    }, [timing]);
    
    useEffect(() => {
        if (validate(goalData) !== null) {
            localStorage.setItem('goalData', JSON.stringify(goalData));
        }
    }, [goalData]);

    useEffect(() => {
        //console.log(`editIndex: ${editIndex} timeUnit: ${timeUnit}`);
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
        setEdit(!edit);
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
    }
    const stopTimer = () => {
        const now = new Date();
        const storedStartTime = new Date(parseInt(initializeData('trainingStartTime', now.getTime()), 10));
        const storedElapsedTime = Number(initializeData('trainingElapsedTime', 0))
        const elapsedSeconds = Math.floor((now - storedStartTime) / 1000);
        localStorage.removeItem('trainingStartTime');
        localStorage.removeItem('trainingActiveIndex');
        const newTrainingData = [...trainingData];
        console.log(`currentTime: ${currentTime} storedElapsedTime: ${storedElapsedTime}`);
        newTrainingData[timing.index].time = convertSecondsToTime(elapsedSeconds + storedElapsedTime);
        const updatedActivities = calculatePercentages(newTrainingData, 'training');
        localStorage.removeItem('trainingElapsedTime');
        setTrainingData(updatedActivities);
        setTiming(null);
        setTimer(false);
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

    return (
        <div className='mt--30 color-lite size20'>
            <div className='containerBox'>
                <CollapseToggleButton
                    title={'Training Log'}
                    isCollapsed={collapseTraining}
                    setCollapse={setCollapseTraining}
                />
            </div>
            {
                (collapseTraining)
                    ? null
                    : <div className='flexContainer'>
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
                                    ? categories.map((category, index) => <div key={getKey(category)} className='flex3Column'>
                                        <div className='containerDetail m-5 pt-10 pb-10 color-lite size20 bg-lite'>{(category === 'TIME') ? secondsToTime(totalTime) : (category === 'percentage') ? '%' : category}</div>
                                        {
                                            trainingData.map((training, index) => <div key={getKey(training)} className={`containerDetail m-5 pt-10 pb-10 flexContainer button size20  ${((isObjectWithGoal(timing)) && (timer && (timing.goal === training.skill))) ? 'brdr-blue' : ''}`} style={categoryStyle(index)}>
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
                                <div className='containerBox flex2Column button bg-green' onClick={() => resetZero()}>
                                    ZERO OUT
                                </div>
                                <div className='containerBox flex2Column button bg-green' onClick={() => reset()}>
                                    RESET TRAINING LOG
                                </div>
                            </div>
                            <div className='containerBox p-10 button bg-green' onClick={() => setGoals()}>
                                SET GOALS TO MATCH LOG
                            </div>
                        </div>
                    </div>
            }
            <div className='containerBox'>
                <CollapseToggleButton
                    title={'Goal Settings'}
                    isCollapsed={collapseGoals}
                    setCollapse={setCollapseGoals}
                />
            </div>
            {
                (collapseGoals)
                    ? null
                    : <div>
                        <div className='flexContainer'>
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
                                ? categories.map((category, index) => <div key={getKey(category)} className='flex3Column'>
                                    <div className='containerDetail m-5 pt-10 pb-10 color-lite size20 bg-lite'>
                                        {(category === 'TIME') ? secondsToTime(goalTime) : (category === 'percentage') ? '%' : category}
                                    </div>
                                    {
                                        goalData.map((training, index) => <div key={getKey(training)} className='containerDetail m-5 pt-10 pb-10 flexContainer button size20' style={categoryStyle(index)}>
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
                                <div className='flex2Column containerBox p-20 button text-outline-light bg-dkGreen' onClick={() => addGoal()}>
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
                                    USE ACTIVE TIMERS
                                </div>
                            </div>
                            <div className='mt-10 flex2Column'>
                                <div className='containerDetail p-10 button bg-lite m-5 p-20' onClick={() => resetGoals()}>
                                    RESET GOALS
                                </div>
                            </div>
                        </div>
                    </div>
            }
        </div>
    )
}

export default TrainingLog;