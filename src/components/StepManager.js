import React, { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';
import getKey from './utils/KeyGenerator';
import initializeData from './utils/InitializeData';
import CollapseToggleButton from './utils/CollapseToggleButton';
import icons from './site/icons';
import Step from './Step';

const StepManager = () => {

  const [stepSchedules, setSchedules] = useState(JSON.parse(localStorage.getItem('stepSchedules')) || []);
  const [steps, setSteps] = useState(JSON.parse(localStorage.getItem('steps')) || []);
  const [scheduleIndex, setScheduleIndex] = useState(initializeData('schedule', 0));
  const [currentSchedule, setCurrentSchedule] = useState(stepSchedules[scheduleIndex] || null);
  const [currentStepIndex, setCurrentStepIndex] = useState(initializeData('currentStep', 0));
  const [currentTimer, setCurrentTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [stepsCollapsed, setStepsCollapsed] = useState(true);
  const [addStepCollapsed, setAddStepCollapsed] = useState(true);
  const [wasRunning, setWasRunning] = useState(false);

  const formatTimestamp = (timestamp) => {
    
    if (!timestamp) return 'completed';

    const date = new Date(timestamp);

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    return `${hours}:${minutes}:${seconds} ${period}`;
  };
  const updatedSteps = () => {
    if (stepSchedules && stepSchedules[scheduleIndex] && stepSchedules[scheduleIndex].steps) {
      const now = Date.now(); // Get current timestamp in milliseconds
      const steps = [...stepSchedules[scheduleIndex].steps] || [];
      console.log(`StepManager => updatedSteps => steps: ${JSON.stringify(steps, null, 2)}`);

      // Calculate time offset for past steps
      const elapsedTime = steps
        .slice(0, currentStepIndex)
        .reduce((total, step) => total + step.duration * 1000, 0);

      console.log(`updatedSteps => currentStepIndex: ${currentStepIndex} elapsedTime: ${elapsedTime}`);

      let accumulatedTime = now - elapsedTime; // Adjust start time for past steps

      return steps.map((step, index) => {
        const startTime = accumulatedTime;
        const endTime = startTime + step.duration * 1000;
        accumulatedTime = endTime; // Move accumulated time forward

        return {
          ...step,
          startTime: formatTimestamp(startTime),
          endTime: formatTimestamp(endTime)
        };
      });
    }
  }

  useEffect(() => {
    if (stepSchedules.length > 0) {
      setCurrentSchedule(stepSchedules[scheduleIndex]);
      setSteps(updatedSteps());
    }
  }, [scheduleIndex]);
  useEffect(() => {
    if (stepSchedules.length > 0) {
      setCurrentSchedule(stepSchedules[scheduleIndex]);
      console.log(`StepManager => updatedSteps(): ${JSON.stringify(updatedSteps(), null, 2)}`);
      setSteps(updatedSteps())
    }
  }, [stepSchedules]);

  useEffect(() => {
    const storedState = JSON.parse(localStorage.getItem('stepManagerState'));
    if (storedState) {
      const { lastTime, scheduleName, stepIndex, timeLeft, running } = storedState;
      const elapsedTime = Math.floor((Date.now() - lastTime) / 1000);
      const selectedSchedule = stepSchedules.find(schedule => schedule.name === scheduleName);
      if (selectedSchedule) {
        setCurrentSchedule(selectedSchedule);
        let updatedStepIndex = Number(stepIndex);
        let updatedTimeLeft = timeLeft - elapsedTime;
        while (updatedTimeLeft <= 0 && selectedSchedule.steps && updatedStepIndex < selectedSchedule.steps.length - 1) {
          updatedStepIndex += 1;
          console.log(`StepManager => updatedStepIndex: ${updatedStepIndex}`);
          updatedTimeLeft += selectedSchedule.steps[updatedStepIndex].duration;
        }
        setCurrentStepIndex(updatedStepIndex);
        setCurrentTimer(updatedTimeLeft);
        setIsRunning(running);
      }
    }
    setSteps(updatedSteps());
  }, [stepSchedules]);

  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => {
        setCurrentTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning]);
  useEffect(() => {
    const stateToStore = {
      lastTime: Date.now(),
      scheduleName: currentSchedule?.name,
      stepIndex: currentStepIndex,
      timeLeft: currentTimer,
      running: isRunning,
    };
    localStorage.setItem('stepManagerState', JSON.stringify(stateToStore));
    localStorage.setItem('currentStep', currentStepIndex);
    setSteps(updatedSteps())
  }, [currentStepIndex]);

  useEffect(() => {
    localStorage.setItem('stepSchedules', JSON.stringify(stepSchedules));
  }, [stepSchedules]);

  useEffect(() => {
    if (currentTimer <= 0 && isRunning) {
      handleNextStep();
    }
  }, [currentTimer, isRunning]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const stateToStore = {
        lastTime: Date.now(),
        scheduleName: currentSchedule?.name,
        stepIndex: currentStepIndex,
        timeLeft: currentTimer,
        running: isRunning,
      };
      localStorage.setItem('stepManagerState', JSON.stringify(stateToStore));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSchedule, currentStepIndex, currentTimer, isRunning]);

  const handleNextStep = () => {
    if (currentStepIndex < currentSchedule.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentTimer(currentSchedule.steps[currentStepIndex + 1].duration);
    } else {
      setCurrentStepIndex(0);
      setCurrentTimer(currentSchedule.steps[0].duration);
    }
  };
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentTimer(currentSchedule.steps[currentStepIndex - 1].duration);
    } else {
      setIsRunning(false);
    }
  };
  const handleAddSchedule = () => {
    const newSchedule = {
      name: newScheduleName,
      steps: [],
    };
    setSchedules([...stepSchedules, newSchedule]);
    setNewScheduleName('');
  };

  const handleSelectSchedule = (e) => {
    if (String(e.target.value).includes('add')) {
      setCurrentSchedule(null);
    } else {
      const selectedScheduleIndex = parseInt(e.target.value, 10);
      setScheduleIndex(selectedScheduleIndex);
    }
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setCurrentStepIndex(0);
    setCurrentTimer(currentSchedule.steps[0]?.duration || 0);
    setIsRunning(false);
  };

  const handleSelectStep = (e) => {
    const selectedStepIndex = parseInt(e.target.value, 10);
    setCurrentStepIndex(selectedStepIndex);
    setCurrentTimer(currentSchedule.steps[selectedStepIndex].duration);
  };

  const formatDuration = (durationInSeconds) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

  return (
    <div className='containerBox'>
      <div className='containerBox color-yellow bold columnLeftAlign'>
        Step Schedules:
      </div>
      <div key={getKey('StepSchedule')} className='containerBox bg-lite color-yellow'>
        <div className='containerBox'>
          <select
            id='scheduleSelector'
            name='scheduleSelector'
            title='select schedule'
            className='containerBox button width-100-percent'
            value={scheduleIndex}
            onChange={handleSelectSchedule}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {stepSchedules.map((schedule, index) => (
              <option className='containerBox' key={getKey(schedule.name)} value={index}>
                {schedule.name}
              </option>
            ))}
            <option className='containerBox' value='add'>Add Schedule</option>
          </select>
        </div>
        {currentSchedule && (
          <div className='containerBox'>
            <div className='containerBox bg-lite'>
              <select
                id={`stepSelector`}
                name={`stepSelector`}
                value={currentStepIndex}
                onChange={handleSelectStep}
                //onMouseEnter={handleMouseEnter}
                //onMouseLeave={handleMouseLeave}
                //onTouchStart={handleTouchStart}
                //onTouchEnd={handleTouchEnd}
                className='containerDetail m-5  button width--10 color-yellow bold size40 p-10 columnCenterAlign'
              >
                {
                  (!currentSchedule.steps)
                    ? null
                    : currentSchedule.steps.map((step, index) => (
                      <option key={index} value={index}>{step.description}</option>
                    ))
                }
              </select>
              <div className='containerDetail m-5 p-30 bg-tintedMedium color-yellow bold size40'>
                {formatDuration(currentTimer)}
              </div>
              <div className='containerBox color-yellow'>
                {
                  (steps && steps[currentStepIndex] && steps[currentStepIndex].startTime && steps[currentStepIndex].endTime)
                    ? `${steps[currentStepIndex].startTime} - ${steps[currentStepIndex].endTime}`
                    : null
                }
              </div>
              <div className='containerBox flexContainer'>
                <div className='flex2Column columnRightAlign color-yellow m-10'>
                  Duration:
                </div>
                <div className='flex2Column columnLeftAlign m-10'>
                  {
                    (!currentSchedule.steps)
                      ? null
                      : formatDuration(currentSchedule.steps[currentStepIndex]?.duration)}
                </div>
              </div>
              <div className='containerBox'>
                {
                  (!currentSchedule.steps)
                    ? null
                    : currentSchedule.steps[currentStepIndex]?.note
                }
              </div>
            </div>
            <div className='containerBox flexContainer'>
              <div className='flex3Column navButton-container columnLeftAlign'>
                <div className='button size40' onClick={handlePreviousStep}>
                  {icons.leftArrow}
                </div>
              </div>
              <div className='flex3Column'>
                <div className='navButton-container'>
                  <div className='button size40' onClick={handleStart}>
                    {icons.play}
                  </div>
                  <div className='button size40' onClick={handlePause}>
                    {icons.pause}
                  </div>
                  <div className='button size40' onClick={handleReset}>
                    {icons.restart}
                  </div>
                </div>
              </div>
              <div className='flex3Column navButton-container columnRightAlign'>
                <div className='button size40' onClick={handleNextStep}>
                  {icons.rightArrow}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {currentSchedule && (
        <div>
          <div className='containerBox'>
            <CollapseToggleButton
              title={<span className='color-yellow bold size30'>Steps</span>}
              isCollapsed={stepsCollapsed}
              setCollapse={setStepsCollapsed}
              align='left'
            />
          </div>
          {
            (stepsCollapsed || !currentSchedule.steps)
              ? null
              : currentSchedule.steps.map((step, index) => (
                (!step.description)
                ? null
                : <div key={getKey(`${step.description}`)} className={`containerBox color-yellow bold p-20 size30 ${(index === currentStepIndex) ? 'bg-dkYellow' : 'bg-lite'}`}>
                  {
                    (stepSchedules[scheduleIndex].steps[index])
                    ? <Step
                        type='edit'
                        index={index}
                        step={step}
                        steps={steps}
                        stepSchedules={stepSchedules}
                        currentSchedule={currentSchedule}
                        scheduleIndex={scheduleIndex}
                        setSchedules={setSchedules}
                        formatDuration={formatDuration}
                        handleTouchEnd={handleTouchEnd}
                        handleTouchStart={handleTouchStart}
                        handleMouseEnter={handleMouseEnter}
                        handleMouseLeave={handleMouseLeave}
                      />
                    : null
                  }
                </div>
              ))
          }
        </div>
      )}
      {currentSchedule === null && (
        <div>
          <h2>Add Schedule</h2>
          <input
            id={`schedule`}
            name={`schedule`}
            type='text'
            value={newScheduleName}
            onChange={(e) => setNewScheduleName(e.target.value)}
            placeholder='Schedule Name'
          />
          <button onClick={handleAddSchedule}>Add Schedule</button>
        </div>
      )}
      {currentSchedule && (
        <div>
          <div className='containerBox'>
            <CollapseToggleButton
              title={<span className='color-yellow bold size30'>Add Step</span>}
              isCollapsed={addStepCollapsed}
              setCollapse={setAddStepCollapsed}
              align='left'
            />
          </div>
          {
            (addStepCollapsed)
            ? null
            : <Step
                type='add'
                index={currentSchedule.steps.length}
                step={null}
                steps={steps}
                stepSchedules={stepSchedules}
                currentSchedule={currentSchedule}
                scheduleIndex={scheduleIndex}
                setSchedules={setSchedules}
                formatDuration={formatDuration}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
              />
          }
        </div>
      )}
    </div>
  );
};

export default StepManager;