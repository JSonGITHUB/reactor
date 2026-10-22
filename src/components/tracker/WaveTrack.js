import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import SetTrack from './SetTrack';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const WaveTrack = ({
    
    waveProjectIndex,
    wave,
    waves,
    setWaves,
    deleteProject,
    addSet,
    addWave,
    subtractWave,
    handleDeleteSet,
    likeWave

}) => {

    const [waveCollapse, setWaveCollapse] = useState(wave.isCollapsed);

    const setCount = wave.tasks?.length || 0;
    const totalWaves = wave.tasks?.reduce((sum, set) => sum + (set.sessions?.length || 0), 0) || 0;
    const avgWavesPerSet = setCount ? (totalWaves / setCount).toFixed(1) : '0.0';

    const orderedSets = (wave.tasks || [])
        .map(set => {
            const firstSession = set.sessions?.[0];
            const lastSession = set.sessions?.[set.sessions.length - 1];
            const firstStartTime = firstSession?.startTime;
            const lastEndTime = lastSession?.endTime ?? lastSession?.startTime;
            return {
                firstStartTime,
                lastEndTime,
            };
        })
        .filter(setTimes => Number.isFinite(setTimes.firstStartTime))
        .sort((a, b) => a.firstStartTime - b.firstStartTime);

    const setIntervalsMs = orderedSets.slice(1).map((setTimes, index) => {
        const prevSetEnd = orderedSets[index].lastEndTime ?? orderedSets[index].firstStartTime;
        const nextSetStart = setTimes.firstStartTime;
        if (!Number.isFinite(prevSetEnd) || !Number.isFinite(nextSetStart)) return null;
        return Math.max(0, nextSetStart - prevSetEnd);
    }).filter(interval => Number.isFinite(interval));

    const avgSetIntervalMs = setIntervalsMs.length
        ? Math.round(setIntervalsMs.reduce((sum, interval) => sum + interval, 0) / setIntervalsMs.length)
        : 0;

    const avgSetIntervalMinutes = avgSetIntervalMs ? (avgSetIntervalMs / 60000) : 0;
    const avgSetIntervalDisplay = setIntervalsMs.length
        ? `${avgSetIntervalMinutes.toFixed(1)} min`
        : 'N/A';

    useEffect(() => {
        const updatedTrackingData = [...waves];
        updatedTrackingData[waveProjectIndex].isCollapsed = waveCollapse;
        const dataToString = JSON.stringify(updatedTrackingData);
        localStorage.setItem('waveTracking', dataToString);
    }, [waveCollapse, waves, waveProjectIndex]);

    return <div key={`wave${waveProjectIndex}`} className='containerDetail bg-lite m-5'>
                <div className='containerDetail m-5'>
                    <div className='containerBox'>
                        <div className='color-yellow size25'>
                            <CollapseToggleButton
                                title={wave.description}
                                isCollapsed={waveCollapse}
                                setCollapse={setWaveCollapse}
                                align='left'
                            />
                        </div>
                        <div className='flexContainer contentCenter pl-10 pr-5'>   
                            <div className='flex2Column columnLeftAlign color-lite size15'>
                                <div className='flex2Column'>
                                    <div>
                                        {String(wave.createdDate).split(', ')[0]} - {String(wave.createdDate).split(', ')[1]}
                                    </div>
                                    <div className='flexContainer mt-5 size12'>
                                        <div className='flexColumn contentLeft w-70'>
                                            <span className='color-yellow mr-5'>
                                                Sets:
                                            </span><br/>
                                            {setCount}
                                        </div>
                                        <div className='flex2Column contentLeft size12'>
                                            <span className='color-yellow mr-5'>
                                                Avg set interval:
                                            </span><br/>    
                                            {avgSetIntervalDisplay}
                                        </div>
                                        <div className='flex2Column contentLeft size12 pr-10'>
                                            <span className='color-yellow mr-5'>
                                                Avg waves/set:
                                            </span><br />
                                            {avgWavesPerSet}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div  
                                className='containerDetail flexColumn button bg-lite p-10 size15 r-5 m-5' 
                                onClick={() => deleteProject(waveProjectIndex)}
                            >
                                {icons.delete}
                            </div>
                        </div>
                    </div>
                    <div className='containerBox'>
                        <div 
                            className='containerBox m-10 bg-lite button' 
                            onClick={() => addSet(waveProjectIndex)}
                        >
                            + {icons.waveSet}
                        </div>
                    </div>
                </div>
                <div>
                    {(waveCollapse) 
                    ? null 
                    : wave.tasks.map((set, setIndex) => (
                        <div key={`wave-set-${waveProjectIndex}-${setIndex}-${String(set?.description || 'set')}`}>
                            <SetTrack
                                waves={waves}
                                setWaves={setWaves}
                                waveProjectIndex={waveProjectIndex}
                                setIndex={setIndex}
                                set={set}
                                addWave={addWave}
                                subtractWave={subtractWave}
                                handleDeleteSet={handleDeleteSet}
                                likeWave={likeWave}
                            >
                            </SetTrack>
                        </div>
                    ))}
                </div>
            </div>
}
export default WaveTrack;