import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import SetTrack from './SetTrack';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getKey from '../utils/KeyGenerator';

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

    useEffect(() => {
        const updatedTrackingData = [...waves];
        updatedTrackingData[waveProjectIndex].isCollapsed = waveCollapse;
        console.log(`waveCollapse: ${waveProjectIndex}.isCollapsed = ${updatedTrackingData[waveProjectIndex].isCollapsed}`)
        const dataToString = JSON.stringify(updatedTrackingData);
        localStorage.setItem('waveTracking', dataToString);
    }, [waveCollapse]);

    return <div key={`wave${waveProjectIndex}`} className='containerBox'>
                <div className='containerBox'>
                    <div className='containerBox'>
                        <div className='bold'>
                            <CollapseToggleButton
                                title={wave.description}
                                isCollapsed={waveCollapse}
                                setCollapse={setWaveCollapse}
                                align='left'
                            />
                        </div>
                        <div>
                                <div className='flexContainer contentCenter pl-5 pr-3 pt-15'>   
                                    <div className='flex2Column columnLeftAlign color-lite'>
                                        {String(wave.createdDate).split(', ')[0]} - {String(wave.createdDate).split(', ')[1]}
                                    </div>
                                    <div  
                                        className='button' 
                                        onClick={() => deleteProject(waveProjectIndex)}
                                    >
                                        {icons.delete}
                                    </div>
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
                        <div key={getKey(`set${setIndex}`)}>
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