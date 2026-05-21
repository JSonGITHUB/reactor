import React, { useState, useEffect, useContext } from 'react';
import { CircuitContext } from '../context/CircuitContext';
import CircuitCheckbox from './CircuitCheckbox';
import CircuitTimer from './CircuitTimer';
import Breathing from '../breathing/Breathing';
import AnimatedLine from '../breathing/AnimatedLine';
//import FullWidthButton from '../utils/FullWidthButton';

const CircuitContainer = ({
    index,
    circuit,
    goal,
    category,
    circuitIndex,
    circuitGroupIndex,
    editCircuit,
    toggleCheckbox,
    deleteGoal
}) => {

    const {
        circuits,
        activeIndex,
        setActiveIndex,
        setVideoId,
        setVideoActive
    } = useContext(CircuitContext);

    const [active, setActive] = useState(false);
    const chillComplete = () => {};
    const getVideoID = () => {
        if (goal.link.includes('/shorts/')) {
            return goal.link.split('/shorts/')[1];
        } else {
            return goal.link.split('=')[1];
        }
    }
    useEffect(() => {
        if (activeIndex === `sessionindex${index}groupIndex${circuitGroupIndex}subgroupIndex${circuitIndex}`) {
            setActive(true);
            if (goal.link.includes('youtu')) {
                setVideoId(getVideoID());
                setVideoActive(true);
            }
        } else {
            setActive(false);
        }
    }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps
    
    const triggerChill = (index, groupIndex, subgroupIndex) => {
        const nextIndex = `chillindex${Number(index)}groupIndex${groupIndex}subgroupIndex${subgroupIndex}`;
        setActiveIndex(nextIndex);
        setVideoActive(false);
    }
    const triggerTimer = (index, groupIndex, subgroupIndex) => {
        const nextIndex = `sessionindex${Number(index + 1)}groupIndex${groupIndex}subgroupIndex${subgroupIndex}`;
        setActiveIndex(nextIndex);
    }

    const getCircuitPlayer = (index, goal) => <div>
        {
            (active && goal.link.includes('youtu'))
                ? (goal.link.includes('youtu'))
                    ? <div className='width-100-percent' style={{ aspectRatio: '16 / 9' }}>
                        <iframe
                            title='videoPlayer'
                            width='100%'
                            height='100%'
                            frameBorder='0'
                            className='r-5 width-100-percent'
                            allowFullScreen
                            allow='autoplay; encrypted-media'
                            src={`${videoSource}&autoplay=1&mute=1&playsinline=1`}
                        >
                        </iframe>
                    </div>
                    : <div className='mt-20'>
                        <img className='width-100-percent button' src={goal.link} alt={goal.title} />
                    </div>
                : null
        }
        <CircuitTimer
            category='session'
            excersize={goal}
            index={index}
            groupIndex={circuitGroupIndex}
            subgroupIndex={circuitIndex}
            circuits={circuits}
            time={Number(circuits[circuitGroupIndex].circuits[circuitIndex].time) ?? 5}
            toggleCheckbox={toggleCheckbox}
            triggerNextTimer={triggerChill}
        />
    </div>

    const sessionTimer = (index, goal) => {
    return (
        getCircuitPlayer(index, goal)
    )
}

    const getCircuitDetails = (index, goal) => <div
                            key={`circuit-goal-${circuitGroupIndex}-${circuitIndex}-${index}-${String(goal?.title || 'goal')}`}
                            className={`containerBox centerVertical ${(active) ? 'bg-dark' : 'bg-lite'}`}
                        >
                            <CircuitCheckbox
                                index={index}
                                goal={goal}
                                category={category}
                                circuitIndex={circuitIndex}
                                circuitGroupIndex={circuitGroupIndex}
                                editCircuit={editCircuit}
                                toggleCheckbox={toggleCheckbox}
                                deleteGoal={deleteGoal}
                            />
                            {sessionTimer(index, goal)}
                            {chillTimer(index, goal)}
                        </div>
                
    const chillTimer = (index, goal) => {
        return (
            <div>
                {
                    (activeIndex === `chillindex${Number(index)}groupIndex${circuitGroupIndex}subgroupIndex${circuitIndex}`)
                    ? <div>
                        <div className='width-100-percent contentCenter'>
                            <AnimatedLine />
                        </div>
                        <div className='width-100-percent mt--180 contentCenter'>
                            <Breathing />
                        </div>
                    </div>
                    :null
                }
                <CircuitTimer
                    category='chill'
                    excersize={goal}
                    index={index}
                    groupIndex={circuitGroupIndex}
                    subgroupIndex={circuitIndex}
                    time={circuit.restTime}
                    toggleCheckbox={chillComplete}
                    triggerNextTimer={triggerTimer}
                />
            </div>
        )
    }
    const videoSource = `https://www.youtube.com/embed/${getVideoID()}?autoplay=1&mute=1&playsinline=1`;
    return getCircuitDetails(index, goal);
    
}
export default CircuitContainer;