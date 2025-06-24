import React, { useState, useContext } from 'react';
import Selector from '../forms/FunctionalSelector';
import { CircuitContext } from '../context/CircuitContext';
import initCircuitTracking from '../tracker/initCircuitTracking';
import initializeData from '../tracker/initializeData';

const TimeSelectors = ({
    circuitGroupIndex,
    circuitIndex
}) => {

    const {
        circuits,
        setCircuits,
        setExcersizeTime,
        setRestTime,
        edit,
        setEdit
    } = useContext(CircuitContext);

    const totalTime = Number(circuits[circuitGroupIndex].circuits[circuitIndex].time);
    const totalRestTime = Number(circuits[circuitGroupIndex].circuits[circuitIndex].restTime);
    const getHours = (timeInSeconds) => Number(Math.floor(timeInSeconds / 3600));
    const getMinutes = (timeInSeconds) => Number(Math.floor((timeInSeconds % 3600) / 60));
    const getSeconds = (timeInSeconds) => Number(timeInSeconds % 60).toFixed(0);

    const [excersizeHours, setExcersizeHours] = useState(getHours(totalTime));
    const [excersizeMinutes, setExcersizeMinutes] = useState(getMinutes(totalTime));
    const [excersizeSeconds, setExcersizeSeconds] = useState(getSeconds(totalTime));
    const [restHours, setRestHours] = useState(getHours(totalRestTime));
    const [restMinutes, setRestMinutes] = useState(getMinutes(totalRestTime));
    const [restSeconds, setRestSeconds] = useState(getSeconds(totalRestTime));

    const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const timeSeconds = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const timeMinutes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];

    const updateHours = (groupTitle, label, newHours) => {
        const hours = (Number(newHours) * 60 * 60) || 0;
        const minutes = (Number(excersizeMinutes) * 60) || 0;
        const seconds = Number(excersizeSeconds) || 0;
        const totalTime = hours + minutes + seconds;
        console.log(`TimeSelectors - updateHours => ${circuits[circuitGroupIndex].circuits[circuitIndex].title} setExcersizeTime hours: ${hours} minutes: ${minutes} seconds: ${seconds} totalTime: ${totalTime}`);
        if (!isNaN(totalTime)) {
            setExcersizeHours(newHours);
            setExcersizeTime(totalTime, circuitGroupIndex, circuitIndex);
        }
    }
    const updateMinutes = (groupTitle, label, newMinutes) => {
        const hours = (Number(excersizeHours) * 60 * 60) || 0;
        const minutes = (Number(newMinutes) * 60) || 0;
        const seconds = Number(excersizeSeconds) || 0;
        const totalTime = hours + minutes + seconds;
        console.log(`TimeSelectors - updateMinutes => ${circuits[circuitGroupIndex].circuits[circuitIndex].title} setExcersizeTime hours: ${hours} minutes: ${minutes} seconds: ${seconds} totalTime: ${totalTime}`);
        if (!isNaN(totalTime)) {
            setExcersizeMinutes(newMinutes);
            setExcersizeTime(totalTime, circuitGroupIndex, circuitIndex);
        }
    }
    const updateSeconds = (groupTitle, label, newSeconds) => {
        const hours = (Number(excersizeHours) * 60 * 60) || 0;
        const minutes = (Number(excersizeMinutes) * 60) || 0;
        const seconds = Number(newSeconds) || 0;
        const totalTime = hours + minutes + seconds;
        console.log(`TimeSelectors - updateSeconds => ${circuits[circuitGroupIndex].circuits[circuitIndex].title} setExcersizeTime hours: ${hours} minutes: ${minutes} seconds: ${seconds} totalTime: ${totalTime}`);
        if (!isNaN(totalTime)) {
            setExcersizeSeconds(newSeconds)
            setExcersizeTime(totalTime, circuitGroupIndex, circuitIndex);
        }
    }
    const updateRestHours = (groupTitle, label, newHours) => {
        const hours = (Number(newHours) * 60 * 60) || 0;
        const minutes = (Number(restMinutes) * 60) || 0;
        const seconds = Number(restSeconds) || 0;
        const totalTime = hours + minutes + seconds;
        console.log(`TimeSelectors - updateRestHours => newHours: ${newHours} - ${circuits[circuitGroupIndex].circuits[circuitIndex].title} setRestTime hours: ${hours} minutes: ${minutes} seconds: ${seconds} totalTime: ${totalTime}`);
        if (!isNaN(totalTime)) {
            setRestHours(newHours);
            setRestTime(totalTime, circuitGroupIndex, circuitIndex);
        }
    }
    const updateRestMinutes = (groupTitle, label, newMinutes) => {
        const hours = (Number(restHours) * 60 * 60) || 0;
        const minutes = (Number(newMinutes) * 60) || 0;
        const seconds = Number(restSeconds) || 0;
        const totalTime = hours + minutes + seconds;
        console.log(`TimeSelectors - updateRestMinutes => ${circuits[circuitGroupIndex].circuits[circuitIndex].title} setRestTime hours: ${hours} minutes: ${minutes} seconds: ${seconds} totalTime: ${totalTime}`);
        if (!isNaN(totalTime)) {
            setRestMinutes(newMinutes);
            setRestTime(totalTime, circuitGroupIndex, circuitIndex);
        }
    }
    const updateRestSeconds = (groupTitle, label, newSeconds) => {
        const hours = (Number(restHours) * 60 * 60) || 0;
        const minutes = (Number(restMinutes) * 60) || 0;
        const seconds = Number(newSeconds) || 0;
        const totalTime = hours + minutes + seconds;
        console.log(`TimeSelectors - updateRestSeconds => ${circuits[circuitGroupIndex].circuits[circuitIndex].title} setRestTime hours: ${hours} minutes: ${minutes} seconds: ${seconds} totalTime: ${totalTime}`);
        if (!isNaN(totalTime)) {
            setRestSeconds(newSeconds)
            setRestTime(totalTime, circuitGroupIndex, circuitIndex);
        }
    }

    return <div className='grid300'>
        <div className='containerBox'>
            <div className='containerBox color-yellow p-20'>
                Session Times:
            </div>
            <div className='grid100'>
                <div className='containerBox'>
                    <div className='color-yellow contentCenter mb-5'>
                        hours
                    </div>
                    <div className='pr-10'>
                        <Selector
                            groupTitle='time'
                            label='Session time:'
                            items={hours}
                            selected={excersizeHours}
                            onChange={updateHours}
                            fontSize='25'
                            padding='10px'
                            width='100%'
                        />
                    </div>
                </div>
                <div className='containerBox'>
                    <div className='color-yellow contentCenter mb-5'>
                        minutes
                    </div>
                    <div className='pr-10'>
                        <Selector
                            groupTitle='time'
                            label='Session time:'
                            items={timeMinutes}
                            selected={excersizeMinutes}
                            onChange={updateMinutes}
                            fontSize='25'
                            padding='10px'
                            width='100%'
                        />
                    </div>
                </div>
                <div className='containerBox flex3Column'>
                    <div className='color-yellow contentCenter mb-5'>
                        seconds
                    </div>
                    <div className='pr-10'>
                        <Selector
                            groupTitle='time'
                            label='Session time:'
                            items={timeSeconds}
                            selected={excersizeSeconds}
                            onChange={updateSeconds}
                            fontSize='25'
                            padding='10px'
                            width='100%'
                        />
                    </div>
                </div>
            </div>
        </div>
        <div className='containerBox flex2Column'>
            <div className='containerBox color-yellow p-20'>
                Chill Times:
            </div>
            <div className='grid100'>
                <div className='containerBox'>
                    <div className='color-yellow contentCenter mb-5'>
                        hours
                    </div>
                    <div className='pr-10'>
                        <Selector
                            groupTitle='time'
                            label='Chill time:'
                            items={hours}
                            selected={restHours}
                            onChange={updateRestHours}
                            fontSize='25'
                            padding='10px'
                            width='50%'
                        />
                    </div>
                </div>
                <div className='containerBox flex3Column'>
                    <div className='color-yellow contentCenter mb-5'>
                        minutes
                    </div>
                    <div className='pr-10'>
                        <Selector
                            groupTitle='time'
                            label='Chill time:'
                            items={timeMinutes}
                            selected={restMinutes}
                            onChange={updateRestMinutes}
                            fontSize='25'
                            padding='10px'
                            width='50%'
                        />
                    </div>
                </div>
                <div className='containerBox flex3Column color-yellow'>
                    <div className='color-yellow contentCenter mb-5'>
                        seconds
                    </div>
                    <div className='pr-10'>
                        <Selector
                            groupTitle='time'
                            label='Chill time:'
                            items={timeSeconds}
                            selected={restSeconds}
                            onChange={updateRestSeconds}
                            fontSize='25'
                            padding='10px'
                            width='100%'
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
}
export default TimeSelectors;