import React from 'react';
import Sounds from '../sound/Sounds';
import ScheduleParent, { useSchedule } from './ScheduleContext';

const CheckBoxTimer = ({
    idx,
    dose,
    status,
    pushDose,
    doseTime
}) => {

    const { 
        timeline, 
        setTimeline, 
        meds, 
        setMeds,
        handleCheck
    } = useSchedule();

    return (
        <ScheduleParent>
        <div
            key={idx}
                className={`${status === 'missed' ? 'color-lite' : status === 'upcoming' ? 'color-orange' : 'color-lite'}`}
            data-dose-time={doseTime.toISOString()}
            onClick={() => handleCheck(dose, idx)}
        >
                <div className={`containerDetail m-10 ${(!!dose.completed) ? 'bg-green' : 'bg-lite'}`}>
                <div className='containerDetail m-5 contentLeft'>
                    <div className='ml-10 mt-10 size30 bold'>{dose.name}</div>
                    <div className='pl-15 size15'>{dose.instruction}</div>
                    {dose.warning && (
                        <div className='i color-yellow mb-5 mt-5 ml-10 size15'>
                            ⚠️ {dose.warning}
                        </div>
                    )}
                </div>
                <div className='containerDetail flexContainer bg-lite'>
                        <div className={`containerDetail p-25 m-5 size40 bg-${(!!dose.completed) ?'dkGreen':'dkRed'} flex2Column`}>
                        {
                                (!!dose.completed)
                                ? <span className=''>✔️</span>
                                : <span className=''>❌</span>
                        }
                    </div>
                    <div
                        title='Push Dose'
                        className={`containerDetail p-25 m-5 size40 bg-lite flex2Column`}
                        onClick={e => {
                            e.stopPropagation();
                            const minutes = Number(prompt('Enter time in minutes to push', dose.pushInput || 0));
                            if (!minutes || minutes < 1 || minutes > 60) {
                                alert('Please enter a valid push time (1–60 minutes).');
                                return;
                            }
                            const confirmAll = window.confirm(
                                `Push by ${minutes} minutes?\nOK = apply to all future doses for '${dose.name}'\nCancel = apply to just this dose`
                            );
                            pushDose(idx, minutes, confirmAll);
                        }}
                    >
                        ➕⏱️
                    </div>
                </div>
            </div>
        </div>
        </ScheduleParent>
    );
};

export default CheckBoxTimer;