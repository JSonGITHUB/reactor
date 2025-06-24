import React, { useEffect, useState, useContext } from 'react';
import Sounds from '../sound/Sounds';
import icons from '../site/icons';
import { CircuitContext } from '../context/CircuitContext';

const Breathing = () => {
    
    const {
        breathing,
        setBreathing
    } = useContext(CircuitContext);

    const [index, setIndex] = useState(0);
    const instructions = ['inhale', 'hold', 'exhale', ''];
    const soundEffects = [Sounds.tuningUp, '', Sounds.tuningDown, ''];
    const times = [5, 5, 9, 0];
    const [timer, setTimer] = useState(0);

    useEffect(() => {
            const intervalId = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
            return () => clearInterval(intervalId);
    }, []);
    useEffect(() => {
            if (timer >= (times[index])) {
                setTimeout(() => {
                    setTimer(0);
                    if (index === 3) {
                        setIndex(0);
                    } else {
                        setIndex((prevTimer) => prevTimer + 1);
                    }
                }, 1);
            }
    }, [timer]);
    useEffect(() => {
        if (breathing) {
            console.log(`Breathing => ${index}`);
            if ((index !== 1) && (index !== 3)) {
                soundEffects[index]();
            }
        }
    }, [index]);
    return (
        <div className='width-100-percent'>
            <div className='ball-container m-auto'>
                <div className='ball box-shadow'>
                    <div className='pt-15 size12 bold color-dark contentCenter'>
                        {instructions[index]}
                    </div>
                </div>
            </div>
            <div 
                title='toggle sound' 
                className='containerBox button' 
                onClick={() => setBreathing(!breathing)}
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