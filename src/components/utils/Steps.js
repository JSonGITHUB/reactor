import React, { useContext, useEffect } from 'react';
import CollapseToggleButton from './CollapseToggleButton';
import icons from '../site/icons';
import { TimerContext } from '../context/TimerContext';

const Steps = () => {

    const {
        steps,
        currentIndex,
        newHours,
        setNewHours,
        newMinutes,
        setNewMinutes,
        newSeconds,
        setNewSeconds,
        currentTimer,
        newStep,
        setNewStep,
        setNewTimer,
        stepCollapse,
        setStepCollapse,
        stepsCollapse,
        setStepsCollapse,
        setDialog,
        getHours,
        getMinutes,
        getSeconds,
        getSteps,
        handleAddStep,
        editStep,
        editTimer,
        formatTime,
        editSteps,
        handleDeleteStep,
        handleSaveSteps
    } = useContext(TimerContext);

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
                id='minuts'
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

    return (
        <div className='containerBox'>
            {/* <div className='containerBox'>
                    {dialog}
                </div> */}
            <div className='containerBox'>
                <div className='containerDetail '>
                    <div className='contentCenter color-yellow size35 bold pt-20'>
                        {currentIndex} - {steps[currentIndex]?.step}
                    </div>
                    <div className='size30 pt-20 pb-20 flexColumn contentCenter'>
                    {
                        formatTime(currentTimer)
                    }
                    </div>
                    {getSteps()}
                </div>
            </div>
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
                            id='step'
                            name='step'
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
            <div className={`containerDetail color-yellow size25 bold`}>
                <CollapseToggleButton
                    title={`Display Steps`}
                    isCollapsed={stepsCollapse}
                    setCollapse={setStepsCollapse}
                    align='left'
                />
            </div>
            {
                (stepsCollapse)
                ? null
                : <div className='containerBox contentCenter'>
                    <div className='containerDetail sides-auto'>
                        {steps.map((step, index) => (
                            <div key={index} className='flexContainer'>
                                <div key={index} className='containerBox flex2Column contentLeft'>
                                    <div className='containerBox color-yellow bold' onClick={() => editStep(index)}>{index + 1}. {step.step}</div>
                                    <div className='containerBox bg-lite contentCenter' onClick={() => editTimer(index)}>{formatTime(step.timer)}</div>
                                </div>
                                <div className='containerBox flexColumn flexContainer'>
                                    <div className='button flex2Column containerBox columnCenterAlign' onClick={() => editSteps(index)}>
                                        {icons.edit}
                                    </div>
                                    <div className='button flex2Column containerBox columnCenterAlign' onClick={() => handleDeleteStep(index)}>
                                        {icons.delete}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {steps.length > 0 && <button className='containerBox button color-lite' onClick={handleSaveSteps}>Save Steps</button>}
                </div>
            }
        </div>
    );
};

export default Steps;