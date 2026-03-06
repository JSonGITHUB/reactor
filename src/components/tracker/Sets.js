import React, { useState, useEffect } from 'react';
import AddProjectInterface from './AddProjectInterface';
import TrackWaves from './TrackWaves';
import { currentTime, currentDate } from '../utils/CurrentCalendar';
import initProjects from './initProjects';
import initWaves from './initWaves';
import icons from '../site/icons';
import initializeData from '../utils/InitializeData';

const Sets = () => {

    const [waves, setWaves] = useState(initializeData('waveTracking', initWaves));
    const [tracking] = useState('waves');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [projects] = useState(initializeData('projectTracking', initProjects));
    
    const trackingMap = {
        'waves': [waves, setWaves],
    };

    useEffect(() => {
        if (waves === null) setWaves(initWaves);
    }, [waves]);


    useEffect(() => {
        if (waves !== undefined || waves !== '') {
            localStorage.setItem('waveTracking', JSON.stringify(waves));
        }
    }, [waves]);

    useEffect(() => {
        if (newProjectDescription !== undefined) {
            const searchTerm = newProjectDescription.toLowerCase() || '';
            if (tracking === 'waves') {
                setWaves((prevWaves) => {
                    if (prevWaves === undefined) {
                        return prevWaves;
                    }
                    const inWaveDescription = (wave) => wave.description.toLowerCase().includes(searchTerm);
                    return prevWaves.map((wave) => {
                        const shouldDisplay = inWaveDescription(wave) || searchTerm === '' || searchTerm === ' ' || searchTerm === null;
                        return {
                            ...wave,
                            display: shouldDisplay
                        };
                    });
                });
            }
        }
    }, [newProjectDescription, tracking]);

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