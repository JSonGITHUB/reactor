import React, { useState, useEffect, useContext } from 'react';
import initializeData from './InitializeData';
import getKey from './KeyGenerator';
import parsDefault from '../games/scorekeeper/parsDefault';
import Selector from '../forms/FunctionalSelector';
import { GolfContext } from '../context/GolfContext';

const ParDialog = ({
    isOpen,
    onClose
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

    const parSelections = [1,2,3,4,5,6];
    useEffect(() => {
        setPars(initializeData('golfPars', null));
    }, []);
    
    const handleSubmit = () => {
        console.log('ParDialog => handleSubmit')
        //setPlayers(gamePlayers);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    const selectPar = (groupTitle, label, selected) => {
        console.log(`groupTitle: ${groupTitle} hole: ${label} selected par: ${selected}`);
        const newGolfPars = [...golfPars];
        newGolfPars[label] = Number(selected);
        setPars(newGolfPars);
    }
    const parSelector = (index) => <Selector
        groupTitle='pars'
        label={index}
        items={parSelections}
        selected={golfPars[index]}
        onChange={selectPar}
        fontSize='25'
        padding='10px'
        width={'auto'}
        bgColor={'bg-white'}
        color={'color-black'}
    />

    return <div className='modal-overlay bg-tintedDark'>
        <div className='containerBox modal p-20 color-lite bg-lite'>
            <div className='containerBox form-group'>
                <div className='containerBox bold'>
                    Set Pars:
                </div>
                <div className='containerBox scrollHeight300 contentCenter'>
                {
                    golfPars.map((par, hole) => <div key={getKey(`${hole}${par}`)}
                        className={`containerBox`}
                        onClick={() => console.log(`hole: ${hole} par: ${par}`)}
                    >
                        <div>
                            hole: {hole+1} 
                            {parSelector(hole)}
                        </div>
                    </div>
                    )
                }
                </div>
            </div>
            <div className='containerBox form-actions p-20 contentCenter'>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={handleSubmit}
                >
                    Submit
                </button>
                <button
                    className='containerBox p-20 contentCenter button'
                    type='button'
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
};

export default ParDialog;