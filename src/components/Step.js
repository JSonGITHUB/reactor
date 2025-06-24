import { useState, useRef } from 'react';
import initializeData from './utils/InitializeData';

const Step = ({
    type,
    index,
    step,
    steps,
    stepSchedules,
    currentSchedule,
    scheduleIndex,
    setSchedules,
    formatDuration,
    handleTouchEnd,
    handleTouchStart,
    handleMouseEnter,
    handleMouseLeave
}) => {

    const [newStepDescription, setNewStepDescription] = useState('');
    const [newStepDuration, setNewStepDuration] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [newStepNote, setNewStepNote] = useState('');
    const [note, setNote] = useState('');
    const [collapseAdd, setCollapseAdd] = useState(false);
    const [tempNote, setTempNote] = useState(step.note || '');
    
    const noteInputRef = useRef(null);

    const submitNote = () => {
        const newSchedules = [...stepSchedules];
        newSchedules[scheduleIndex].steps[index].note = tempNote;
        setSchedules(newSchedules);
    }

    const handleNoteChange = (newNote) => {
        const note = newNote;
        setTempNote(note);
        //const newSchedules = [...stepSchedules];
        //newSchedules[scheduleIndex].steps[noteIndex].note = note;
        //setSchedules(newSchedules);
        //localStorage.setItem('tempNote', note);
    };

    const handleAddStep = () => {
        //console.log(`StepManager => handleAddStep => newStepDuration: ${JSON.stringify(newStepDuration, null, 2)}`);
        const durationInSeconds = newStepDuration.hours * 3600 + newStepDuration.minutes * 60 + newStepDuration.seconds;
        const newStep = {
            description: newStepDescription,
            duration: durationInSeconds,
            note: newStepNote,
        };
        const updatedSchedules = stepSchedules.map(schedule => {
            if (schedule.name === currentSchedule.name) {
                return {
                    ...schedule,
                    steps: [...schedule.steps, newStep],
                };
            }
            return schedule;
        });
        setSchedules(updatedSchedules);
        setNewStepDescription('');
        setNewStepDuration({ hours: 0, minutes: 0, seconds: 0 });
        setNewStepNote('');
    };

    const handleStepChange = (stepIndex, newStep) => {
        const newSchedules = [...stepSchedules];
        newSchedules[scheduleIndex].steps[stepIndex].description = newStep;
        setSchedules(newSchedules);
    };
    const handleDurationChange = (index, newDuration) => {
        const newSchedules = [...stepSchedules];
        newSchedules[scheduleIndex].steps[index].duration = newDuration;
        setSchedules(newSchedules);
    };

    const setStepDescription = (index, description) => {
        const newSchedules = [...stepSchedules];
        const newStep = {
            description: description,
            duration: 0,
            note: ''
        }
        if (newSchedules[scheduleIndex].steps[index]) {
            console.log(`StepManager => setStepDescription => step: ${JSON.stringify(newSchedules[scheduleIndex].steps[index].description, null, 2)}`);
            newSchedules[scheduleIndex].steps[index].description = description;
        } else {
            newSchedules[scheduleIndex].steps.push(newStep)
        }
        setSchedules(newSchedules);
    }
    const setStepHours = (index, hours) => {
        const newSchedules = [...stepSchedules];
        const durationHours = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[0])
        const durationMinutes = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[1])
        const durationSeconds = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[2])
        const durationInSeconds = hours * 3600 + durationMinutes * 60 + durationSeconds;
        newSchedules[scheduleIndex].steps[index].duration = durationInSeconds;
        setSchedules(newSchedules);
    }
    const setStepMinutes = (index, minutes) => {
        const newSchedules = [...stepSchedules];
        const durationHours = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[0])
        const durationMinutes = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[1])
        const durationSeconds = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[2])
        const durationInSeconds = durationHours * 3600 + minutes * 60 + durationSeconds;
        newSchedules[scheduleIndex].steps[index].duration = durationInSeconds;
        setSchedules(newSchedules);
    }
    const setStepSeconds = (index, seconds) => {
        const newSchedules = [...stepSchedules];
        const durationHours = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[0])
        const durationMinutes = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[1])
        const durationSeconds = Number(formatDuration(newSchedules[scheduleIndex].steps[index].duration).split(':')[2])
        const durationInSeconds = durationHours * 3600 + durationMinutes * 60 + seconds;
        newSchedules[scheduleIndex].steps[index].duration = durationInSeconds;
        setSchedules(newSchedules);
    }
    const removeStep = (index) => {
        const newSteps = [...stepSchedules[scheduleIndex].steps.slice(0, index), ...stepSchedules[scheduleIndex].steps.slice(index + 1)];
        const newSchedules = [...stepSchedules];
        newSchedules[scheduleIndex].steps = [...newSteps];
        console.log(`removeStep => newSchedules: ${JSON.stringify(newSchedules, null, 2)}`);
        setSchedules(newSchedules);
    }

    return <div className='containerBox'>
        {type !== 'add' && (
            <div className='containerBox flexContainer'>
                <div className='flex2Column centeredContent columnLeftAlign pl-10 color-yellow'>
                    {index + 1}. {step.description}
                </div>
                <div className='flex2Column columnRightAlign'>
                    <div
                        title='remove step'
                        className='w-50 rt-10 r-5 size15 bg-lite color-yellow button pr-20 pl-20 pt-10 pb-10'
                        onClick={() => removeStep(index)}
                    >
                        X
                    </div>
                </div>
            </div>
        )}
        {
            /* 
                <div className='containerBox'>
                    {type === 'add' ? (
                    <input
                        id={`notes${index}`}
                        name={`notes${index}`}
                        className='containerBox width--10 bg-dark'
                        type='text'
                        value={newStepDescription}
                        onChange={(e) => setNewStepDescription(e.target.value)}
                        placeholder='Step Description'
                    />
                    ) : (
                    <input
                        id={`notes${index}`}
                        name={`notes${index}`}
                        className='containerBox width--10 color-yellow bold bg-dark'
                        type='text'
                        value={step.description}
                        onChange={(e) => setStepDescription(index, e.target.value)}
                        placeholder='Step Description'
                    />
                    )}
                </div> 
            */
        }
        {
            ((step?.startTime === undefined || step?.endTime === undefined))
            ? null
            : <div className='containerDetail p-30 columnLeftAlign m-5 size15'>
                {/*`${steps[index]?.startTime} - ${steps[index]?.endTime}`*/}
            </div>
        }
        
        {/* <div className='containerBox flexContainer'>
        <div className='flex2Column color-yellow columnRightAlign pr-5'>
          Hours:
        </div>
        {type === 'add' ? (
          <input
            id={`hours${index}`}
            name={`hours${index}`}
            className='flex2Column columnLeftAlign bg-dark color-lite width-50-percent'
            type='number'
            value={newStepDuration.hours}
            onChange={(e) => setNewStepDuration({ ...newStepDuration, hours: e.target.value })}
            placeholder='Hours'
          />
        ) : (
          <input
            id={`hours${index}`}
            name={`hours${index}`}
            className='flex2Column columnLeftAlign bg-dark color-lite width-50-percent'
            type='number'
            value={Number(formatDuration(step.duration).split(':')[0])}
            onChange={(e) => setStepHours(index, e.target.value)}
            placeholder='Hours'
          />
        )}
      </div> */}
        {/* <div className='containerBox flexContainer'>
        <div className='flex2Column color-yellow columnRightAlign pr-5'>
          Minutes:
        </div>
        {type === 'add' ? (
          <input
            id={`minutes${index}`}
            name={`minutes${index}`}
            className='flex2Column columnLeftAlign bg-dark color-lite width-50-percent'
            type='number'
            value={newStepDuration.minutes}
            onChange={(e) => setNewStepDuration({ ...newStepDuration, minutes: e.target.value })}
            placeholder='Minutes'
          />
        ) : (
          <input
            id={`minutes${index}`}
            name={`minutes${index}`}
            className='flex2Column columnLeftAlign bg-dark color-lite width-50-percent'
            type='number'
            value={Number(formatDuration(step.duration).split(':')[1])}
            onChange={(e) => setStepMinutes(index, e.target.value)}
            placeholder='Minutes'
          />
        )}
      </div> */}
        {/* <div className='containerBox flexContainer'>
        <div className='flex2Column color-yellow columnRightAlign pr-5'>
          Seconds:
        </div>
        {type === 'add' ? (
          <input
            id={`seconds${index}`}
            name={`seconds${index}`}
            className='flex2Column columnLeftAlign bg-dark color-lite width-50-percent'
            type='number'
            value={newStepDuration.seconds}
            onChange={(e) => setNewStepDuration({ ...newStepDuration, seconds: e.target.value })}
            placeholder='Seconds'
          />
        ) : (
          <input
            id={`seconds${index}`}
            name={`seconds${index}`}
            className='flex2Column columnLeftAlign bg-dark color-lite width-50-percent'
            type='number'
            value={Number(formatDuration(step.duration).split(':')[2])}
            onChange={(e) => setStepSeconds(index, e.target.value)}
            placeholder='Seconds'
          />
        )}
      </div> */}
        {
            <div className='containerBox flexContainer'>
                <div className='flex2Column color-yellow columnRightAlign pr-5'>
                    Notes:
                </div>
                {type === 'add' ? (
                    <input
                        id={`notes${index}`}
                        name={`notes${index}`}
                        className='containerBox columnLeftAlign width--10'
                        type='text'
                        placeholder='Add notes...'
                        value={newStepNote}
                        onChange={(e) => setNewStepNote(e.target.value)}
                    />
                ) : (
                    <input
                        id={`notes${index}`}
                        name={`notes${index}`}
                        className='containerBox columnLeftAlign width--10'
                        type='text'
                        placeholder='Add notes...'
                        value={tempNote}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={submitNote}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                submitNote();
                            }
                        }}
                        ref={noteInputRef}
                    />
                )}
            </div>
        }
        {
            type === 'add' && (
                <div
                    title={`${type === 'add' ? 'Add' : 'Edit'} Step`}
                    className='containerBox button bg-green'
                    onClick={type === 'add' ? handleAddStep : handleStepChange}
                >
                    {type === 'add' ? 'Add' : 'Edit'} Step
                </div>
            )
        }
    </div>
}

export default Step