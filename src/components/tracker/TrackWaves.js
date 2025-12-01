import React, { useEffect } from 'react';
import {currentTime, currentDate} from '../utils/CurrentCalendar';
import initSession from './initSession';
import WaveTrack from './WaveTrack';
import getKey from '../utils/KeyGenerator';
import initializeData from '../utils/InitializeData';

const TrackWaves = ({
    waves,
    setWaves,
    getProjectTime,
    deleteProject
}) => {
    
    useEffect(() => {
        localStorage.setItem('waveTracking', JSON.stringify(waves));
    }, [waves]);

    useEffect(() => {
        const initData = [initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0)];
        const storedWaves = initializeData('waveTracking', initData);
        setWaves(storedWaves);
    }, []);

    const likeWave = (waveProjectIndex, waveIndex, sessionIndex) => {
        const newWaves = [...waves];
        const updatedSession = newWaves[waveProjectIndex].tasks[waveIndex].sessions[sessionIndex];
        newWaves[waveProjectIndex].tasks[waveIndex].sessions[sessionIndex].isLiked = !updatedSession.isLiked;
        setWaves(newWaves);
    }

    const addSet = (waveProjectIndex) => {
        const updatedWaves = [...waves];
        const setDescription = `Set ${updatedWaves[waveProjectIndex].tasks.length + 1}`;
        if (setDescription) {
            const sessions = [];
            sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0));
            const wave = {
                startTime: currentTime(),
                endTime: '',
                description: setDescription,
                sessions: sessions,
                isRunning: true,
                runningTime: '0s'
            };
            updatedWaves[waveProjectIndex].tasks.unshift(wave);
            updatedWaves[waveProjectIndex].isCollapsed = false;
            setWaves(updatedWaves);
        }
    };

    const handleDeleteSet = (waveProjectIndex, waveIndex) => {
        const updatedWaves = [...waves];
        updatedWaves[waveProjectIndex].tasks.splice(waveIndex, 1);
        setWaves(updatedWaves);
    };

    const addWave = (waveProjectIndex, waveIndex) => {
        const updatedWaves = [...waves];
        const wave = updatedWaves[waveProjectIndex].tasks[waveIndex];
        console.log(`updatedWaves[${waveProjectIndex}].tasks: ${JSON.stringify(updatedWaves[waveProjectIndex].tasks, null,2)}`)
        wave.sessions = wave.sessions || [];
        wave.isRunning = false;
        //wave.startDate = currentDate();
        wave.sessions.push(initSession(currentDate(), currentTime(), currentDate(), currentTime(), 0))
        setWaves(updatedWaves);
    };
    const subtractWave = (waveProjectIndex, waveIndex) => {
        const updatedWaves = [...waves];
        const wave = updatedWaves[waveProjectIndex].tasks[waveIndex];
        wave.sessions = wave.sessions ?? [];
        wave.isRunning = false;
        wave.sessions.pop();
        setWaves(updatedWaves);
    };
    return (
        <div>
            {
                waves.map((wave, waveProjectIndex) => (
                    (wave.display && wave.display === true)
                    ? <div key={getKey(`wave${waveProjectIndex}`)}>
                        <WaveTrack
                            waveProjectIndex={waveProjectIndex}
                            wave={wave}
                            waves={waves}
                            setWaves={setWaves}
                            getProjectTime={getProjectTime}
                            deleteProject={deleteProject}
                            addSet={addSet}
                            addWave={addWave}
                            subtractWave={subtractWave}
                            handleDeleteSet={handleDeleteSet}
                            likeWave={likeWave}
                        >
                        </WaveTrack>
                    </div>
                    : null
                ))
            }
        </div>
    )
}

export default TrackWaves