import React, { useState, useEffect, useRef, useContext } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackEvents from './TrackEvents';
import Sounds from '../sound/Sounds';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initSession from './initSession';
import initEvents from './initEvents';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';
import initProjects from './initProjects';

const Events = () => {

    const [projects, setProjects] = useState(initializeData('projects', initProjects));
    const [events, setEvents] = useState(initializeData('eventTracking', initEvents));
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [activated, setActivated] = useState(true);
   

    useEffect(() => {
        const storedEvents = initializeData('eventTracking', initEvents)
        if (storedEvents) {
            setEvents(storedEvents);
        } else {
            setEvents([initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0)]);
        }
        
        if (events === null) setEvents(initEvents);
    }, []);

    useEffect(() => {
        if (initialized) {
            let updatedTrackingData = [...events];
            updatedTrackingData.map((group, groupIndex) => group.isCollapsed = isCollapsed);
            setEvents(updatedTrackingData);
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]);

    useEffect(() => {
        if (events !== undefined || events !== '') {
            localStorage.setItem('eventTracking', JSON.stringify(events));
        }
    }, [events]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            localStorage.setItem('WorkOutSearch', searchTerm);
        }
    }, [newProjectDescription]);

    const toggleTimer = () => {
        Sounds.boop(0, 1);
        setActivated(prev => !prev);
    }

    const toggleParentTimer = () => toggleTimer();

    const addProject = () => {
        const project = {
            description: newProjectDescription,
            createdDate: currentDate(),
            startTime: currentTime(),
            tasks: [],
            journals: [],
            totalTime: 0,
            isCollapsed: false
        };
        setNewProjectDescription('');
    };

    const deleteProject = (index) => {
        let updatedTrackingData = [...events];
        updatedTrackingData.splice(index, 1);
        setEvents(updatedTrackingData);
    };
    const toggleCollapseSubmenu = (projectIndex) => {
        //setIsCollapsed(prev => !prev);
        const updatedProjects = [...projects];
        const project = updatedProjects[projectIndex];
        project.isCollapsed = !project.isCollapsed;

        setProjects(updatedProjects);
        //return (!project.isCollapsed) ? setIsCollapsed(false) : null;
        if (!project.isCollapsed) {
            setIsCollapsed(false);
        } else {
            setIsCollapsed(true);
        }
    };

    const getProjectTime = (project) => {
        let projectTotal = 0;
        events.forEach((event) => {
            projectTotal += event.runningTime;
        });
        project.totalTime = projectTotal;
        return projectTotal;
    };

    return <div className='mt--30'>
        <div className='containerDetail color-lite bg-red m-5 p-22 size30 contentLeft'>
            <span className='size40 m-5'>{icons.events}</span> Events
        </div>
        <div className=''>
            <AddProjectInterface
                newProjectDescription={newProjectDescription}
                setNewProjectDescription={setNewProjectDescription}
                addProject={addProject}
                tracking={'events'}
            />
        </div>
        <div className=''>
            {
                <TrackEvents
                    events={events}
                    setEvents={setEvents}
                    getProjectTime={getProjectTime}
                    deleteProject={deleteProject}
                    toggleCollapseSubmenu={toggleCollapseSubmenu}
                    toggleParentTimer={toggleParentTimer}
                />
            }
        </div>
    </div>
};

export default Events