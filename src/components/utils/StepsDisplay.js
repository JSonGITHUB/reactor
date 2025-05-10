import React, { useEffect, useState, useContext, useRef } from 'react'
import CollapseToggleButton from './CollapseToggleButton';
import { StepContext } from '../context/StepContext';
import icons from '../site/icons';
import getKey from './KeyGenerator';
import Sounds from '../sound/Sounds';
import Dialog from '../functional/Dialog';
import initStepSchedules from '../utils/initStepSchedules';
import CurrentTimer from './CurrentTimer';
import StepContainer from './StepContainer';

const StepsDisplay = React.memo(() => {

    const locationScrollerRef = useRef(null);

    const {
        stepCollapse,
        setStepCollapse,
        steps,
        setSteps,
        currentStepIndex,
        setCurrentStepIndex,
        schedules,
        setSchedules,
        schedule,
        setCurrentTimer,
        isRunning,
        setIsRunning,
        handleNextStep,
        newStep,
        setNewStep,
        newHours,
        setNewHours,
        newMinutes,
        setNewMinutes,
        newSeconds,
        setNewSeconds,
        setNewNote,
        newTimer,
        setNewTimer,
        handleRestartStep,
        toggleTimer
    } = useContext(StepContext);

    const [stepsCollapse, setStepsCollapse] = useState(true);
    const [noteCollapse, setNoteCollapse] = useState(false);

    const handlePreviousStep = () => {
        const previousStepIndex = currentStepIndex - 1;
        if (previousStepIndex > -1) {
            setCurrentStepIndex(previousStepIndex);
            setCurrentTimer(steps[previousStepIndex].timer);
        } else {
            setIsRunning(false);
            setCurrentStepIndex(-1);
        }
    };

    const handleSaveSteps = () => {
        localStorage.setItem('steps', JSON.stringify(steps));
        alert('Steps saved successfully!');
    };

    const handleStartSequence = () => {
        if (steps.length > 0) {
            setCurrentStepIndex(0);
            setCurrentTimer(steps[0].timer);
            setIsRunning(true);
        }
    };

    const handleAddStep = () => {
        if (newStep && newTimer > 0) {
            console.log(`handleAddStep1:`);
            setSteps([...steps, { step: newStep, timer: parseInt(newTimer) }]);
            setNewStep('');
            setNewTimer('');
        }
        const totalSeconds =
            parseInt(newHours || 0) * 3600 +
            parseInt(newMinutes || 0) * 60 +
            parseInt(newSeconds || 0);

        if (newStep && totalSeconds > 0) {
            console.log(`handleAddStep2:`);
            setSteps([...steps, {
                step: newStep,
                stepIndex: steps.length,
                timer: totalSeconds
            }]);
            const newSchedules = [...schedules];
            const newScheduleStep = {
                step: newStep,
                timer: totalSeconds,
                stepIndex: steps.length,
            };
            const newSchedule = { ...newSchedules[schedule] };
            console.log(`handleAddStep => newSchedule: ${newSchedule.title}`);
            newSchedule.steps = [...newSchedule.steps, newScheduleStep];
            console.log(`handleAddStep => newSchedule.steps: ${JSON.stringify(newSchedule.steps, null, 2)}`);
            newSchedules[schedule].steps = newSchedule.steps;
            setSchedules(newSchedules);
            setNewStep("");
            setNewHours("");
            setNewMinutes("");
            setNewSeconds("");
        }
    };

    const getSteps = () => {
        if (steps && steps.length > 0) {
            const displaySteps = steps.length > 0 && (
                <div className='containerBox pt-15 bg-lite'>
                    <span className='button size30 mr-15' title='previous step' onClick={handlePreviousStep}>{icons.up}</span>
                    <span className='button size30 mr-15' title='reset timer' onClick={handleRestartStep}>{icons.start}</span>
                    <span className='size30 mr-15' title='restart steps' onClick={handleStartSequence}>{icons.restart}</span>
                    <span className='size30 mr-15' title={isRunning ? 'pause' : 'play'} onClick={toggleTimer}>{isRunning ? icons.pause : icons.play}</span>
                    <span className='button size30 mr-15' title='next step' onClick={handleNextStep}>{icons.end}</span>
                    <span className='button size30' title='next step' onClick={handleNextStep}>{icons.down}</span>
                </div>
            )
            return displaySteps;
        }
        //setStepCollapse(false);
        return <div className='containerBox pt-15 bg-lite'>
            Add steps...
        </div>
    }
    const setScroll = () => {

        const height = () => currentStepIndex * 300;

        console.log(`StepTimerContainer => setScroll => height: ${height()}`);

        window.scrollTo({
            top: height(),
            behavior: 'smooth',
        });

        if (locationScrollerRef.current) {
            //console.log(`setScroll => height: ${height()}`)
            //console.log(`setScroll => locationScrollerRef.current.scrollHeight: ${locationScrollerRef.current.scrollHeight}`)
            locationScrollerRef.current.scrollTo({
                top: height(),
                left: 0,
                behavior: 'smooth',
            });
        }
    }
    useEffect(() => {
        setScroll();
    }, [currentStepIndex]);

    useEffect(() => {
        //console.log(`StepsDisplay => useEffect => steps.length: ${steps.length} schedules[${schedule}].steps.length: ${schedules[schedule].steps.length}`);
        if (!steps || steps.length < 1) {
            //console.log(`StepsDisplay => useEffect => 1 setStepCollapse(false) steps: ${JSON.stringify(steps, null, 2)}`);
            setStepCollapse(false);
        } else {
            //console.log(`StepsDisplay => useEffect => 2 setStepCollapse(true) steps: ${JSON.stringify(steps, null, 2)}`);
            setStepCollapse(true);
        }
    }, []);

    return (
        <div className='containerBox'>
            {
                (steps && steps.length > 0)
                ? <div className='containerBox'>
                    <div className='containerDetail '>
                        <div className='containerDetail color-yellow size35 bold p-20 bg-tintedMedium m-5 lh-30'>
                            {steps[currentStepIndex]?.step}
                        </div>
                        <div className='containerDetail color-yellow p-10 bg-tintedMedium m-5'>
                            {steps[currentStepIndex]?.startTime} - {steps[currentStepIndex]?.endTime}
                        </div>
                        <CurrentTimer />
                        {getSteps()}
                    </div>
                    <div className='containerBox color-yellow bold'>
                        <CollapseToggleButton
                            title={`Note`}
                            isCollapsed={noteCollapse}
                            setCollapse={setNoteCollapse}
                            align='left'
                        />
                    </div>
                    {
                        (noteCollapse)
                        ? null
                        : <div className='containerBox columnLeftAlign p-20'>
                            <input
                                id={steps[currentStepIndex]?.step}
                                name={steps[currentStepIndex]?.step}
                                type='string'
                                placeholder='Add note'
                                value={steps[currentStepIndex]?.note}
                                onChange={(e) => setNewNote(e.target.value)}
                            />
                        </div>
                    }
                </div>
                : null
            }
            <div className={`containerDetail color-yellow size25 bold`}>
                <CollapseToggleButton
                    title={`Add Steps`}
                    isCollapsed={stepCollapse}
                    setCollapse={setStepCollapse}
                    align='left'
                />
            </div>
            {
                (stepCollapse)
                ? null
                : <div className='containerBox'>
                    <input
                        id='newStep'
                        name='newStep'
                        type='text'
                        placeholder='Description'
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        className='containerBox width-100-percent'
                    />
                    <br />
                    {/*
                    <input
                        type='number'
                        placeholder='Timer (seconds)'
                        value={newTimer}
                        onChange={(e) => setNewTimer(e.target.value)}
                        className='containerBox bold width-50-percent'
                    />
                */}
                    <input
                        id='hours'
                        name='hours'
                        type='number'
                        placeholder='Hours'
                        value={newHours}
                        onChange={(e) => setNewHours(e.target.value)}
                        className='containerBox width-100-percent'
                    />
                    <input
                        id='minutes'
                        name='minutes'
                        type='number'
                        placeholder='Minutes'
                        value={newMinutes}
                        onChange={(e) => setNewMinutes(e.target.value)}
                        className='containerBox width-100-percent'
                    />
                    <input
                        id='seconds'
                        name='seconds'
                        type='number'
                        placeholder='Seconds'
                        value={newSeconds}
                        onChange={(e) => setNewSeconds(e.target.value)}
                        className='containerBox width-100-percent'
                    />
                    <br />
                    <button className='containerBox button color-lite width-100-percent bg-green' onClick={handleAddStep}>Add Step</button>
                </div>
            }
            {
                <div className={`containerDetail color-yellow size25 bold`}>
                    <CollapseToggleButton
                        title={`Display Steps`}
                        isCollapsed={stepsCollapse}
                        setCollapse={setStepsCollapse}
                        align='left'
                    />
                </div>
            }
            {
                (!stepsCollapse)
                ? null
                : <div className='containerBox contentCenter'>
                    <div className='containerDetail sides-auto'>
                        {
                            steps.map((step, index) => <div key={getKey(index)}>
                                <StepContainer
                                    index={index}
                                    step={step}
                                />
                            </div>)
                        }
                    </div>
                    {steps.length > 0 && <button className='containerBox button color-lite' onClick={handleSaveSteps}>Save Steps</button>}
                </div>
            }
        </div>
    )
})

export default StepsDisplay