import React, { useState, useEffect, useContext } from 'react';
import getKey from '../../utils/KeyGenerator';
import golfScoring from './golfScoring';
import parsDefault from './parsDefault';
import ScoreCardGolf from './ScoreCardGolf';
import initializeData from '../../utils/InitializeData';
import { GolfContext } from '../../context/GolfContext';
import icons from '../../site/icons';

const GolfScores = ({ 
    playerIndex, 
    updateScores 
}) => {
    
    const {
        golfPars,
        setPars, 
        course,
        setCourse,
        updatePar,
        updateDistance,
        courses,
        setCourses,
        addCourse,
        editCourse,
        deleteCourse
    } = useContext(GolfContext);

    const editGolfPar = (hole) => {
        const newPars = [...golfPars];
        const newPar = Number(prompt(`Enter par for hole ${hole+1}:`, golfPars[hole]));
        newPars[hole] = newPar;
        updatePar(hole, newPar);
        setPars(newPars);
    }
    const buttonClass = 'bg-darker scrollSnapTop';
    const getButtonClass = 'glassy button' + buttonClass;
    const golfScores = () => course.holes.map((hole, index) => <div key={getKey(hole)} className={`containerBox mb-55 pt-1 ${getButtonClass}`}>
        <div className={`contentCenter bg-darker r-10 m-5 mt-25`}>
            <div>
                <span className='size25 greet color-yellow bold'>
                    Hole:
                </span>
                <span className='size50 bold pl-15 pr-15 bg-darker r-10 color-white'>
                    {index + 1}{icons.golf}
                </span>
                <span className='size25 greet color-yellow bold mr-5'>
                    Par:
                </span>
                <span 
                    title='edit par'
                    className='size20 bold color-lite mt--5 button' 
                    onClick={() => editGolfPar(index)}
                >
                    {golfPars[index]}
                </span>
            </div>
            <ScoreCardGolf
                playerIndex={playerIndex}
                scoreIndex={index}
                updateScores={updateScores}
            />
        </div>
    </div>);

    return golfScores();
}

export default GolfScores;