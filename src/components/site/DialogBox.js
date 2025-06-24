import React, { useState, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';

const DialogBox = ({
    playerIndex
}) => {

    const {
        edit,
        editPlayer,
        deletePlayer
    } = useContext(PlayerContext);

    const modifyPlayer = () => {
        editPlayer(playerIndex);
    }

    const removePlayer = () => {
        deletePlayer(playerIndex);
    }

    if (edit && playerIndex) {
        return <div className='containerBox t-0 relative flexContainer color-yellow bold'>
            <div className="flex2Column">
                <div
                    title='edit' 
                    className='containerBox button' 
                    onClick={modifyPlayer}
                >
                    EDIT
                </div>
            </div>
            <div className="flex2Column">
                <div 
                    title='delete'
                    className='containerBox button' 
                    onClick={removePlayer}
                >
                    DELETE
                </div>
            </div>
        </div>
    }
    return null;
};

export default DialogBox;