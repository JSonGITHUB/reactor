import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import getKey from './KeyGenerator';
import jerseyColors from '../games/scorekeeper/JerseyColors';
import surfScoring from '../games/scorekeeper/SurfScoring';

const AthleteDialog = ({
    playerId,
    isOpen,
    game,
    onClose,
}) => {

    const {
        players,
        setPlayers,
        editPlayer
    } = useContext(PlayerContext);
    
    useEffect(() => {
    }, []);

    const getScore = () => {
        window.location.pathname = '/reactor/Scores';
    }

    const resetSurfersScores = (playerId) => {
        const newPlayers = [...players];
        newPlayers[playerId].surfScore = 0;
        newPlayers[playerId].surfScores = surfScoring;
        setPlayers(newPlayers);
        getScore();
    }

    const selectJersey = (playerId, selection) => {
        const newPlayers = [...players];
        newPlayers[playerId].surfJerseyColor = (selection);
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
    }
    const getJerseyColorSelector = (playerId, color, index) => <button className={`bg-${color} ht-45 width50px button r-10`} onClick={() => selectJersey(playerId, index)}></button>;
    
    const deleteAthlete = (playerId) => {
        const newPlayers = [...players];
        newPlayers.splice(playerId, 1);
        setPlayers(newPlayers);
    }
    if (!isOpen) return null;

    return <div className='modal-overlay bg-tintedDark'>
                <div className='containerBox modal p-20 color-lite bg-lite'>
                    <div className='containerBox flexContainer bg-lite'>
                        <div className='p-15 flex2Column contentLeft'>
                            <span className='size30 bold' >Edit Athlete</span>
                        </div>
                        <div className='containerBox flexColumn bg-lite bold color-yellow button contentRight' onClick={() => onClose()}>
                            SAVE
                        </div>
                        
                    </div>
                    <div className='flexContainer containerBox color-lite bold contentCenter'>
                        <div className='flex1Auto containerBox'>
                            <span className='size30'>Name:</span>
                        </div>
                        <div className='flex2Column containerBox'>
                    <button className={`bg-${jerseyColors[players[playerId].surfJerseyColor] || 'dark'} size30 ${(jerseyColors[players[playerId].surfJerseyColor] === 'black') ? 'color-lite' : 'color-dark'} width-100-percent pb-10 pt-10 button r-10`} onClick={() => editPlayer(playerId)}>
                            {players[playerId].name}
                        </button>
                        </div>
                    </div>
                    <div className='containerBox size30'>
                        <div>
                            Jersey color:
                        </div>
                        <div className='width-100-percent mt-20'>
                            {jerseyColors.map((color, index) => <span key={getKey(`jerseyColor${index}`)} className='button'>
                                        {getJerseyColorSelector(playerId, color, index)}
                                    </span>
                            )}
                        </div>
                    </div>
                    <div className='containerBox flexContainer'>
                        <div className='flex2Column'>
                            <button
                                className='containerBox button r-10'
                                onClick={() => resetSurfersScores(playerId)}
                            >
                                Reset Scores
                            </button>
                        </div>
                        <div className='flex2Column'>
                            <button
                                className='containerBox button'
                                onClick={() => deleteAthlete(playerId)}
                            >
                                Delete Athlete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
};

export default AthleteDialog;