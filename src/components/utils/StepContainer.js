import React, { useContext, useState, useEffect, useRef } from 'react';
import { StepContext } from '../context/StepContext';
import icons from '../site/icons';
import getKey from './KeyGenerator';
import validate from './validate';
import initializeData from './InitializeData';

const StepContainer = React.memo(( {
    index,
    step
}) => {

    const intervalRef = useRef(null);

    const {
        steps,
        setSteps,
        currentStepIndex,
        setCurrentStepIndex,
        schedules,
        schedule,
        //setTimeLeft,
        currentTimer,
        setCurrentTimer,
        isRunning,
        setIsRunning,
        formatTime,
        getHours,
        getMinutes,
        getSeconds,
        newStep,
        setNewStep,
        newHours,
        setNewHours,
        editIndex,
        setEditIndex,
        newMinutes,
        setNewMinutes,
        newSeconds,
        setNewSeconds,
        setDialog,
        setNewTimer,
        handleRestartStep,
        toggleTimer,
        timerState,
        updatedSteps
    } = useContext(StepContext);
    
    const [timeLeft, setTimeLeft] = useState(timerState.timeLeft || 0);
    const [wasRunning, setWasRunning] = useState(false);
    const [note, setNote] = useState(step?.note || '');

    const moveToNextStep = () => {
        const nextIndex = ((currentStepIndex >= 0) ? currentStepIndex : 0) + 1;
        const steps = updatedSteps();
        if (((nextIndex >= 0)) && (nextIndex < steps.length)) {
            setCurrentStepIndex(nextIndex);
            setTimeLeft(steps[nextIndex].timer);
            startTimer();
        } else {
            setIsRunning(false);
        }
    };
    const startTimer = () => {
        if (intervalRef.current) return;
        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    moveToNextStep();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    
    const editStep = (index) => {
        const newStep = prompt(`Edit step:`, steps[index].step);
        const newSteps = [...steps];
        if (newStep !== null) {
            newSteps[index].step = newStep;
            setSteps(newSteps);
        }
    }
    const editTimer = (index) => {
        //const newTimer = prompt(`Edit timer (${formatTime(steps[index].timer)}):`, steps[index].timer);
        const newHours = prompt(`Edit hours:`, getHours(steps[index].timer));
        const newMinutes = prompt(`Edit minutes:`, getMinutes(steps[index].timer));
        const newSeconds = prompt(`Edit seconds:`, getSeconds(steps[index].timer));
        const totalSeconds =
            parseInt((newHours !== null) ? newHours : getHours(steps[index].timer) || 0) * 3600 +
            parseInt((newMinutes !== null) ? newMinutes : getMinutes(steps[index].timer) || 0) * 60 +
            parseInt((newSeconds !== null) ? newSeconds : getSeconds(steps[index].timer) || 0);
        const newSteps = [...steps];
        newSteps[index].timer = totalSeconds;
        setSteps(newSteps);
    }
    const shiftStepUp = (id) => {
        const newSteps = [...steps];
        setSteps(swapItems(newSteps, id, (id - 1)));
    };
    const shiftStepDown = (id) => {
        const newSteps = [...steps];
        setSteps(swapItems(newSteps, id, (id + 1)));
    };
    const handleDeleteStep = (id) => {
        const newSteps = [...steps];
        newSteps.splice(id, 1);
        setSteps(newSteps);
    };
    const handleMouseEnter = () => {
        setWasRunning(isRunning);
        setIsRunning(false);
    };

    const handleMouseLeave = () => {
        if (wasRunning) {
            setIsRunning(true);
        }
    };

    const handleTouchStart = () => {
        setWasRunning(isRunning);
        setIsRunning(false);
    };

    const handleTouchEnd = () => {
        if (wasRunning) {
            setIsRunning(true);
        }
    };
    const swapItems = (array, index1, index2) => {
        if (
            index1 >= 0 && index1 < array.length &&
            index2 >= 0 && index2 < array.length &&
            index1 !== index2
        ) {
            const temp = array[index1];
            array[index1] = array[index2];
            array[index2] = temp;
        }
        return array;
    }
    const getNavBar = (index) => {
        const displaySteps = steps.length > 0 && (
            <div className='containerBox flexContainer'>
                {
                    (isRunning && (currentStepIndex === index))
                        ? <span className='button flex2Column size30 mr-20' title='reset timer' onClick={handleRestartStep}>{icons.start}</span>
                        : null
                }
                <span className='button flex2Column size30' title={(isRunning && (currentStepIndex === index)) ? 'pause' : 'play'} onClick={(currentStepIndex === index) ? toggleTimer : () => moveToSelectedStep(index)}>{(isRunning && (currentStepIndex === index)) ? icons.pause : icons.play}</span>
            </div>
        )
        return displaySteps;
    }
    const getEditDialog = (id) => {
        const newDialog = <div className='containerBox'>
            <input
                id='newStep'
                name='newStep'
                type='text'
                placeholder='Step Description'
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                className='containerDetail width-100-percent'
            />
            <br />
            <input
                id='hours'
                name='hours'
                type='number'
                placeholder='Hours'
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
            />
            <input
                id='minutes'
                name='minutes'
                type='number'
                placeholder='Minutes'
                value={newMinutes}
                onChange={(e) => setNewMinutes(e.target.value)}
            />
            <input
                id='seconds'
                name='seconds'
                type='number'
                placeholder='Seconds'
                value={newSeconds}
                onChange={(e) => setNewSeconds(e.target.value)}
            />
            <input
                id='note'
                name='note'
                type='string'
                placeholder='Add note'
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <button
                onClick={() => setDialog('')}
                className='containerBox'
            >
                SUBMIT
            </button>
            <button
                onClick={() => setDialog('')}
                className='containerBox'
            >
                CANCEL
            </button>
        </div>
        setNewStep(steps[id].step);
        setNewHours(getHours(steps[id].timer));
        setNewMinutes(getMinutes(steps[id].timer));
        setNewSeconds(getSeconds(steps[id].timer));
        setNewTimer(steps[id].timer)
        setDialog(newDialog);

    }
    const moveToSelectedStep = (index) => {
        setCurrentStepIndex(index);
        setTimeLeft(steps[index].timer);
        setCurrentTimer(steps[index].timer);
        //startTimer();
    };
    useEffect(() => {
        const newSchedules = [...schedules];
        newSchedules[schedule].steps[index].note = note;
        //setSteps(newSchedules);
    }, [note]);
    useEffect(() => {
        //console.log(`StepContainer => index: ${index}`);
        //console.log(`StepContainer => schedule: ${steps[index].title} step: ${JSON.stringify(steps[index], null, 2)}`);
        const currentStep = initializeData('currentStepIndex', 0);
        setTimeLeft(currentStep.currentTimer);
    }, []);
    useEffect(() => {
        if ((currentStepIndex >= 0) && currentTimer !== undefined && steps !== undefined && steps.length > 0) {
            localStorage.setItem('timerState', JSON.stringify({
                timeLeft,
                isRunning,
                lastTimestamp: Date.now(),
                currentTimer,
                currentStepIndex
            })
            );
            localStorage.setItem('steps', JSON.stringify(steps));
            localStorage.setItem('currentStepIndex', currentStepIndex);
        }

    }, [timeLeft, isRunning, steps, currentStepIndex, currentTimer]);
    useEffect(() => {
        const currentStep = initializeData('currentStepIndex', 0);
        setTimeLeft(currentStep.currentTimer);
    }, [schedules]);
    if (validate(step)) {
        return (
            <div key={index} className={`containerDetail`}>
                <div key={index} className={`${(currentStepIndex === index) ? 'incompletedSelector r-20' : ''} m-5`}>
                    <div key={index} className='containerBox contentLeft'>
                        <div className='containerBox color-yellow bold' onClick={() => editStep(index)}>
                            {index + 1}. {step.step}
                        </div>
                        <div className='containerDetail ml-10 mr-10 mt--10 mb-10 size15 color-neogreen'>
                        {
                            /*(formatTimestamp(step.startTime) === 'completed')*/ 
                            (index < currentStepIndex)
                            ? `${icons.check} ${step.startTime} - ${step.endTime}`
                            //? icons.check 
                            : `${step.startTime} - ${step.endTime}`
                        }
                        </div>
                        <div className='containerDetail bg-lite contentCenter p-15 size25 ml-10 mr-10 mt-5' onClick={() => editTimer(index)}>
                            {(currentStepIndex === index) ? formatTime(currentTimer) : formatTime(step.timer)}
                        </div>
                    </div>
                    <div className=''>
                        <input
                            id={`step${index}Note`}
                            name={`step${index}Note`}
                            type='string'
                            placeholder='Add note...'
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            className='containerBox'
                        />
                    </div>
                    <div className='flexContainer mr-10 p-10'>
                        {
                            (editIndex === index)
                                ? null
                                : getNavBar(index)
                        }
                        {
                            (editIndex === index)
                                ? <div title='shift up' className='size30 button flex4Column containerDetail p-10 columnCenterAlign' onClick={() => shiftStepUp(index)}>
                                    {icons.upArrow}
                                </div>
                                : null
                        }
                        {
                            (editIndex === index)
                                ? <div title='shift down' className='size30 button flex4Column containerDetail p-10 columnCenterAlign' onClick={() => shiftStepDown(index)}>
                                    {icons.downArrow}
                                </div>
                                : null
                        }
                        {
                            (editIndex === index)
                                ? <div title='delete' className='size30 button flex4Column containerDetail p-10 columnCenterAlign' onClick={() => handleDeleteStep(index)}>
                                    {icons.delete}
                                </div>
                                : null
                        }
                        <div title='toggle edit' className={`color-neogreen button containerDetail p-10 flex4Column ${(editIndex !== index) ? 'columnRightAlign' : null}`} onClick={() => setEditIndex((editIndex === index) ? null : index)}>
                            {
                                (editIndex === index)
                                    ? 'SAVE'
                                    : icons.edit
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return null
})

export default StepContainer