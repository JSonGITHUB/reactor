import React from 'react';
import { useSchedule } from './ScheduleContext';

const CheckBoxTimer = ({
    idx,
    dose,
    status,
    pushDose,
    doseTime,
    doseKey
}) => {

    const { handleCheck } = useSchedule();

    return (
        <div
            key={idx}
            className={`${status === 'missed' ? 'color-lite' : status === 'upcoming' ? 'color-orange' : 'color-lite'}`}
            data-dose-time={doseTime.toISOString()}
            data-dose-key={doseKey}
            onClick={() => handleCheck(dose, idx)}
        >
                <div className={`containerDetail mt-5 ${(!!dose.completed) ? 'bg-green' : 'bg-lite'}`}>
                <div className='containerDetail contentLeft'>
                    <div className='ml-10 mt-10 size25 bold'>
                        {dose.name}
                    </div>
                    <div className='pl-15 size15'>
                        {dose.instruction}
                    </div>
                    {dose.warning && (
                        <div className='i color-yellow mb-5 mt-5 ml-10 size15'>
                            ⚠️ {dose.warning}
                        </div>
                    )}
                </div>
                <div className='flexContainer'>
                    <div className={`containerDetail p-25 mt-5 size40 bg-${(!!dose.completed) ?'dkGreen':'dkRed'} flex2Column`}>
                        {
                            (!!dose.completed)
                            ? <span className=''>✔️</span>
                            : <span className=''>❌</span>
                        }
                    </div>
                    <div
                        title='Push Dose'
                        className={`containerDetail p-25 ml-5 mt-5 size40 bg-lite flex2Column`}
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
    );
};

export default CheckBoxTimer;