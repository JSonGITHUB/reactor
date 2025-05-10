import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import getKey from './KeyGenerator';
import clubs from '../games/scorekeeper/clubs';

const ShotDialog = ({
    shot,
    score,
    isOpen,
    onClose,
    pickClub
}) => {

    const {
        players,
        setPlayers,
        playersInGame
    } = useContext(PlayerContext);

    const [clubId, setClubId] = useState();

    const handleSubmit = () => {
        pickClub(clubId);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return <div className='modal-overlay bg-tintedDark'>
        <div className='containerBox modal p-20 color-lite bg-lite'>
            <div className='p-20 color-yellow bold contentCenter'>
                Select a club for swing: {shot}
            </div>
            <div className='containerBox form-group'>
                {
                    clubs.map((club, index) => <div key={getKey(`${index}`)}
                        className={`containerBox button`}
                        onClick={() => pickClub(index)}
                    >
                        <div>{club}</div>
                    </div>
                    )
                }
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

export default ShotDialog;