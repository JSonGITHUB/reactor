import React, { useEffect } from 'react';
import getKey from '../utils/KeyGenerator';
import TimerDisplay from '../utils/TimerDisplay';
import {currentTime, currentDate} from '../utils/CurrentCalendar.js';
import initSession from './initSession.js';
import getTotalTime from '../utils/getTotalTime';
import icons from '../site/icons';
import validate from '../utils/validate.js';
import initializeData from '../utils/InitializeData';

const TrackEvents = ({
    events,
    setEvents,
    getProjectTime,
    deleteProject,
    toggleCollapseSubmenu,
    toggleParentTimer
}) => {

    useEffect(() => {
        localStorage.setItem('eventTracking', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        const storedEvents = initializeData('eventTracking', [initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0)]);
        setEvents(storedEvents);
    }, []);

    const addEvent = (index) => {
        const eventDescription = prompt('Enter event description:');
        if (eventDescription) {
            const sessions = [];
            sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0));
            const event = {
                startTime: currentTime(),
                endTime: '',
                description: eventDescription,
                sessions: sessions,
                isRunning: true,
                runningTime: '0s',

            };
            const updateEvents = [...events];
            console.log(`TrackEvents => index: ${index} updateEvents: ${JSON.stringify(updateEvents[index], null, 2)}`);
            updateEvents[index].tasks.unshift(event);
            updateEvents[index].isCollapsed = false;
            setEvents(updateEvents);
        }
    };
    const handleStartEvent = (eventProjectIndex, eventIndex) => {
        const updateEvents = [...events];
        const event = updateEvents[eventProjectIndex].events[eventIndex];
        event.sessions = event.sessions ?? [];
        event.isRunning = true;
        //event.startDate = currentDate();
        event.sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0))
        setEvents(updateEvents);
        startTimer(eventProjectIndex, eventIndex);
    };
    const handleStopEvent = (eventProjectIndex, eventIndex) => {
        const updateEvents = [...events];
        const event = updateEvents[eventProjectIndex].events[eventIndex];
        event.sessions = event.sessions ?? [];
        event.isRunning = false;
        const startTime = event.sessions[event.sessions.length - 1].startTime;
        const startDate = event.sessions[event.sessions.length - 1].startDate;
        const endTime = currentTime();
        const endDate = currentDate();
        const totalTimeMilliseconds = Math.round(endTime - startTime);
        const totalTime = getTotalTime(totalTimeMilliseconds);
        let runningTime = event.sessions[event.sessions.length - 1].runningTime;
        //runningTime = (runningTime === undefined) ? event.sessions[event.sessions.length - 2].runningTime : runningTime;
        runningTime = (validate(runningTime) === null) ? event.sessions[event.sessions.length - 2].runningTime : runningTime;
        //alert(`runningTime: ${runningTime}`)
        runningTime = (runningTime === '0s') ? totalTimeMilliseconds : (runningTime + totalTimeMilliseconds);
        const runningTimeDisplay = getTotalTime(runningTime);
        const session = {
            startDate: startDate,
            startTime: startTime,
            subEvents: [{
                startDate: startDate,
                startTime: startTime,
                endDate: endDate,
                endTime: endTime,
            }],
            endDate: endDate,
            endTime: endTime,
            totalTime: totalTime,
            runningTime: runningTime,
            runningTimeDisplay: runningTimeDisplay
        }
        //alert(JSON.stringify(session,null,2))
        event.runningTime = runningTime;
        event.runningTimeDisplay = runningTimeDisplay;
        event.sessions.push(session)
        setEvents(updateEvents);
        stopTimer(eventProjectIndex, eventIndex);
    };
    const startTimer = (eventProjectIndex, eventIndex) => {
        const updateEvents = [...events];
        const event = updateEvents[eventProjectIndex].events[eventIndex];

        event.timerId = setInterval(() => {
            setEvents(updateEvents);
        }, 1000);
    };

    const stopTimer = (eventProjectIndex, eventIndex) => {
        const updateEvents = [...events];
        const event = updateEvents[eventProjectIndex].events[eventIndex];
        const session = event.sessions[event.sessions.length - 1]
        clearInterval(event.timerId);
        event.sessions.splice((event.sessions.length - 2), 1);
        event.totalTime = event.totalTime + session.runningTime;
        setEvents(updateEvents);
    };

    const handleStartSubEvent = (eventProjectIndex, eventIndex) => {
        console.log(`handleStartSubEvent => eventProjectIndex: ${eventProjectIndex}, eventIndex: ${eventIndex}`);
        const updatedEvents = [...events];
        const event = updatedEvents[eventProjectIndex].events[eventIndex];
        event.sessions = event.sessions ?? [];
        event.isRunning = true;
        const subevent = {
            startDate: currentDate(),
            startTime: currentTime(),
            endTime: '',
            endDate: ''
        };
        event.sessions.push(subevent)
        updatedEvents[eventProjectIndex].events[eventIndex].sessions.push(subevent)
        setEvents(updatedEvents);
        startTimer(eventProjectIndex, eventIndex);
    };
    const handleStopSubEvent = (eventProjectIndex, eventIndex) => {
        const updatedEvents = [...events];
        const event = updatedEvents[eventProjectIndex].events[eventIndex];
        event.sessions = event.sessions ?? [];
        event.isRunning = false;
        const startTime = event.sessions[event.sessions.length - 1].startTime;
        const startDate = event.sessions[event.sessions.length - 1].startDate;
        const endTime = currentTime(); 
        const endDate = currentDate();
        const totalTimeMilliseconds = Math.round(endTime - startTime);
        const totalTime = getTotalTime(totalTimeMilliseconds);
        let runningTime = event.sessions[event.sessions.length - 1].runningTime;
        //runningTime = (runningTime === undefined) ? event.sessions[event.sessions.length - 2].runningTime : runningTime;
        runningTime = (validate(runningTime) === null) ? event.sessions[event.sessions.length - 2].runningTime : runningTime;
        //alert(`runningTime: ${runningTime}`)
        runningTime = (runningTime === '0s') ? totalTimeMilliseconds : (runningTime + totalTimeMilliseconds);
        const runningTimeDisplay = getTotalTime(runningTime);
        const session = {
            startDate: startDate,
            startTime: startTime,
            subEvents: [{
                startDate: startDate,
                startTime: startTime,
                endDate: endDate,
                endTime: endTime,
            }],
            endDate: endDate,
            endTime: endTime,
            totalTime: totalTime,
            runningTime: runningTime,
            runningTimeDisplay: runningTimeDisplay
        }
        //alert(JSON.stringify(session,null,2))
        event.runningTime = runningTime;
        event.runningTimeDisplay = runningTimeDisplay;
        event.sessions.push(session)
        setEvents(updatedEvents);
        stopTimer(eventProjectIndex, eventIndex);
    };
    const handleDeleteEvent = (eventProjectIndex, eventIndex) => {
        const updatedEvents = [...events];
        updatedEvents[eventProjectIndex].events.splice(eventIndex, 1);
        setEvents(updatedEvents);
    };

    return <div> 
        {events.map((event, index) => (
            <div key={index} className='containerBox'>
                <div className='containerBox'>
                    <div className='containerBox bold color-neogreen m-10 size30 lh-30'>
                        {event.description}
                    </div>
                    <div className='containerBox contentCentered'>
                        <div className='containerBox color-lite size25 bold m-5 contentCentered'>
                            {
                                (event.createdDate)
                                ? <span>
                                    {String(event.createdDate).split(', ')[0]} - {String(event.createdDate).split(', ')[1].split(':')[0]}:{String(event.createdDate).split(', ')[1].split(':')[1]}
                                </span>
                                : null
                            }
                        </div>
                        <div className=' color-lite size20 m-10 contentCentered'>
                            {icons.track} Start {getTotalTime(getProjectTime(event))}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div 
                            title='start'
                            className='containerBox flex3Column m-10 bg-lite button' 
                            onClick={() => addEvent(index)}
                        >
                            + {icons.track} Start
                        </div>
                        <div 
                            title='delete'
                            className='containerBox flex3Column m-10 bg-lite button' 
                            onClick={() => deleteProject(index)}
                        >
                            {icons.delete} Delete
                        </div>
                        <div 
                            title={event.isCollapsed ? 'Expand' : 'Collapse'}
                            className='containerBox flex3Column m-10 bg-lite button' 
                            onClick={() => toggleCollapseSubmenu(index)}
                        >
                            {event.isCollapsed ? 'Expand' : 'Collapse'}
                        </div>
                    </div>
                </div>
                <div className='color-lite size15 bold containerBox'>
                    {
                        (event.isCollapsed) 
                        ? '' 
                        : `${event.description} Events:`
                    }
                </div>
                <div>
                    {
                        (event.isCollapsed) 
                        ? null 
                            : (event.events)
                                ? event.events.map((event, eventIndex) => (
                                    <div key={eventIndex} className='containerBox lowerBorder'>
                                        <div className='containerBox'>
                                            <div className='bold color-yellow size25 lh-30'>{event.description}</div>
                                            <div>{event.sessions.length} Total: {event.runningTimeDisplay} </div>
                                        </div>
                                        {event.sessions.map((session, sessionIndex) => (
                                            <div className='color-lite containerBox' key={getKey('tracker')}>
                                                {event.sessions.map((session, sessionIndex) => (
                                                    <div>
                                                        <div className='containerBox flexContainer'>
                                                            <div className='flex1Auto'>
                                                                {String(session.startDate).split(', ')[0]}
                                                            </div>
                                                            <div className='flex3Column'>
                                                                {String(session.startDate).split(', ')[1]}
                                                            </div>
                                                            <div className='columnLeftAlign flex3Column'>
                                                                {String(session.endDate).split(', ')[1]} 
                                                            </div>
                                                        </div>
                                                        <div className='containerBox flexContainer color-neogreen'>
                                                            <div className='flex1Auto'>
                                                            </div>
                                                            <div className='flex3Column'>
                                                                {String(session.subEvents[0].startDate).split(', ')[1]}
                                                            </div>
                                                            <div className='columnLeftAlign flex3Column'>
                                                                {String(session.subEvents[0].endDate).split(', ')[1]}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className='width-100-percent'>
                                                <TimerDisplay 
                                                        totalTime={session.totalTime} 
                                                        toggleParentTimer={toggleParentTimer} 
                                                        index={index} 
                                                        taskIndex={eventIndex} 
                                                        handleStopSubEvent={handleStopSubEvent}
                                                        handleStartSubEvent={handleStartSubEvent}
                                                    />
                                                    {/*
                                                    <TimerComponent
                                                        todo={todo}
                                                        index={index}
                                                        setTodoCurrentTime={setTodoCurrentTime}
                                                        setTodos={setTodos}
                                                        todos={todos}
                                                        toggleCheckbox={toggleCheckbox}
                                                        onReset={onReset}
                                                    />*/}
                                                </div>
                                            </div>
                                        ))}
                                        <div className='containerBox flexContainer'>
                                            {event.isRunning ? (
                                                <div 
                                                    className='containerBox flex2Column bg-lite button m-5' 
                                                    onClick={() => handleStopEvent(index, eventIndex)}
                                                >
                                                    {icons.stop}
                                                </div>
                                            ) : (
                                                <div 
                                                    className='containerBox flex2Column bg-lite button m-5' 
                                                    onClick={() => handleStartEvent(index, eventIndex)}
                                                >
                                                    {icons.track}
                                                </div>
                                            )}
                                            <div 
                                                className='containerBox flex2Column bg-lite button m-5' 
                                                onClick={() => handleDeleteEvent(index, eventIndex)}
                                            >
                                                {icons.delete} Delete
                                            </div>
                                        </div>
                                    </div>))
                                : null
                    }
                </div>
            </div>
        ))}
    </div>
}

export default TrackEvents;