import React, { useState, useEffect, useRef } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackWaves from './TrackWaves';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initProjects from './initProjects';
import initWaves from './initWaves';
import initTasks from './initTasks';
import initCharges from './initCharges';
import initEvents from './initEvents';
import initLinkTracking from './initLinkTracking';
import initNoteTracking from './initNoteTracking';
import initJournalTracking from './initJournalTracking';
import mobileRecipeTracking from './data_mobile';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getKey from '../utils/KeyGenerator';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';

const Sets = () => {

    const [waves, setWaves] = useState(initializeData('waveTracking', initWaves));
    const [tracking, setTracking] = useState('waves');
    const [initialized, setInitialized] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState();
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [projects, setProjects] = useState(initializeData('projectTracking', initProjects));
    
    const trackingMap = {
        'waves': [waves, setWaves],
    };

    useEffect(() => {
        if (waves === null) setWaves(initWaves);
    }, []);


    useEffect(() => {

        if (initialized) {
            let updatedTrackingData = [...projects];
            if (tracking === 'waves') {
                updatedTrackingData = [...waves];
            }
            updatedTrackingData.map((group, groupIndex) => group.isCollapsed = isCollapsed);
            if (tracking === 'waves') {
                setWaves(updatedTrackingData);
            }
        } else {
            setInitialized(true);
        }
    }, [isCollapsed]);

    useEffect(() => {
        if (waves !== undefined || waves !== '') {
            localStorage.setItem('waveTracking', JSON.stringify(waves));
        }
    }, [waves]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            if (tracking === 'waves' && waves !== undefined) {
                const inWaveDescription = (wave) => wave.description.toLowerCase().includes(searchTerm);
                const filteredWaves = [...waves];
                filteredWaves.map((wave) => {
                    wave.display = false;
                    if (inWaveDescription(wave) || searchTerm === '' || searchTerm === ' ' || searchTerm === null) {
                        wave.display = true;
                    }
                });
                setWaves(filteredWaves);
            }
        }
    }, [newProjectDescription]);

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
        if ((tracking !== 'links' || tracking !== 'notes' || tracking !== 'journals' || tracking !== 'circuits' || tracking !== 'recipes') && trackingMap.hasOwnProperty(tracking)) {
            trackingMap[tracking][1](prev => [project, ...prev]);
        }
        setNewProjectDescription('');
    };

    const deleteProject = (index) => {
        let updatedTrackingData = [...projects];
        if (trackingMap.hasOwnProperty(tracking)) {
            updatedTrackingData = [...trackingMap[tracking][0]];
            updatedTrackingData.splice(index, 1);
            trackingMap[tracking][1](updatedTrackingData);
        }
    };

    const getProjectTime = (project) => {
        let projectTotal = 0;
        trackingMap[tracking][0].forEach((event) => {
            projectTotal += event.runningTime;
        });
        project.totalTime = projectTotal;
        return projectTotal;
    };

    return <div className='mt--30'>
        <div className='containerDetail color-lite bg-blue m-5 p-22 size30 contentLeft'>
            <span className='size40 m-5'>{icons.waveSet}</span> Sets
        </div>
        <div className='pt-5'>
            {
                (tracking !== '')
                    ? <AddProjectInterface
                        newProjectDescription={newProjectDescription}
                        setNewProjectDescription={setNewProjectDescription}
                        addProject={addProject}
                        tracking={tracking}
                    />
                    : <React.Fragment></React.Fragment>
            }
        </div>
        <div className=''>
            {
                (tracking === 'waves')
                    ? <TrackWaves
                        waves={waves}
                        setWaves={setWaves}
                        getProjectTime={getProjectTime}
                        deleteProject={deleteProject}
                    />
                    : <React.Fragment></React.Fragment>
            }
        </div>
    </div>
};

export default Sets