import React, { useEffect, useState, useContext } from 'react';
import Sounds from '../sound/Sounds';
import icons from '../site/icons';
import { CircuitContext } from '../context/CircuitContext';

const BREATHING_INSTRUCTIONS = ['inhale', 'hold', 'exhale', ''];
const BREATHING_TIMES = [5, 5, 9, 0];
const BREATHING_SOUND_EFFECTS = [Sounds.tuningUp, '', Sounds.tuningDown, ''];

const Breathing = () => {
    
    const {
        breathing,
        setBreathing
    } = useContext(CircuitContext);

    const [index, setIndex] = useState(0);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
            const intervalId = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
            return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
            if (timer >= (BREATHING_TIMES[index])) {
                setTimeout(() => {
                    setTimer(0);
                    if (index === 3) {
                        setIndex(0);
                    } else {
                        setIndex((prevTimer) => prevTimer + 1);
                    }
                }, 1);
            }
    }, [timer, index]);
    useEffect(() => {
        if (breathing) {
            console.log(`Breathing => ${index}`);
            if ((index !== 1) && (index !== 3)) {
                BREATHING_SOUND_EFFECTS[index]();
            }
        }
    }, [index, breathing]);
    return (
        <div className='width-100-percent'>
            <div className='ball-container m-auto'>
                <div className='ball box-shadow'>
                    <div className='pt-15 size12 bold color-dark contentCenter'>
                        {BREATHING_INSTRUCTIONS[index]}
                    </div>
                </div>
            </div>
            <div 
                title='toggle sound' 
                className='containerBox button' 
                onClick={() => setBreathing(prev => !prev)}
            >
                {
                    (breathing) 
                    ? icons.soundOn 
                    : icons.soundOff
                }
            </div>
        </div>
    );
};

export default Breathing;