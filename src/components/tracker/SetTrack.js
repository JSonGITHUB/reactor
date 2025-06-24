import React, { useState, useEffect } from 'react';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';

const SetTrack = ({
    waves,
    waveProjectIndex,
    setIndex,
    set,
    addWave,
    subtractWave,
    handleDeleteSet,
    likeWave
}) => {

    const [setCollapse, setSetCollapse] = useState(set.isCollapsed);

    useEffect(() => {

        console.log(`setTrack: ${JSON.stringify(waves[waveProjectIndex],null,2)} setIndex: ${setIndex}`)
        const updatedTrackingData = [...waves];
        updatedTrackingData[waveProjectIndex].tasks[setIndex].isCollapsed = setCollapse;
        console.log(`waveCollapse: ${updatedTrackingData[waveProjectIndex].tasks[setIndex].description}.isCollapsed = ${updatedTrackingData[waveProjectIndex].tasks[setIndex].isCollapsed}`)
        const dataToString = JSON.stringify(updatedTrackingData);
        localStorage.setItem('waveTracking', dataToString);
    }, [setCollapse]);

    return <div key={`set${setIndex}`} className='containerBox lowerBorder'>
                <div className='containerBox bold'>
                    <div className='containerBox color-yellow size25'>
                        <CollapseToggleButton
                            title={set.description}
                            isCollapsed={setCollapse}
                            setCollapse={setSetCollapse}
                        />
                    </div>
                    <div>
                        Waves: {set.sessions.length}
                    </div>
                    <div className='mt-5'>
                        {
                            set.sessions.map((wave, waveIndex) => <span key={`wave${waveIndex}`} className={`${(wave.isLiked)?'size30':''}`}>
                                                                        {icons.wave}
                                                                    </span>)
                        }
                    </div>
                </div>
                {
                    (setCollapse)
                    ? null
                    : <div>
                        <div className='containerBox flexContainer'>
                            <div 
                                title='add wave'
                                className='containerBox flex3Column bg-lite button' 
                                onClick={() => addWave(waveProjectIndex, setIndex)}
                            >
                                + {icons.wave} 
                            </div>
                            <div 
                                title='remove wave'
                                className='containerBox flex3Column bg-lite button' 
                                onClick={() => subtractWave(waveProjectIndex, setIndex)}
                            >
                                - {icons.wave}
                            </div>
                            <div 
                                title='delete set'
                                className='containerBox flex3Column bg-lite button' 
                                onClick={() => handleDeleteSet(waveProjectIndex, setIndex)}
                            >
                                {icons.delete}
                            </div>
                        </div>
                        <div className='containerBox'>
                            {set.sessions.map((session, sessionIndex) => (
                                <div key={`session${sessionIndex}`} className='containerBox color-lite bg-lite coloumnCenter'>
                                    <div 
                                        title='like'
                                        className='flexContainer button width-200 m-auto' 
                                        onClick={() => likeWave(waveProjectIndex, setIndex, sessionIndex)}
                                    >
                                        <div className='flex2Column mr-5 size15 contentRight'>
                                            <span className='bold'>
                                                Wave {sessionIndex + 1}
                                            </span>
                                                - {String(session.startDate).split(', ')[1]}
                                        </div>
                                        <div className='flexColumn contentLeft pr-20'>
                                            {
                                                (set.sessions[sessionIndex].isLiked) 
                                                ? <div>{icons.good}</div>
                                                : <div className='mt-2 mb--2'>{icons.bad}</div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
}
export default SetTrack;