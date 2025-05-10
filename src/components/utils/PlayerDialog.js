import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import initializeData from './InitializeData';
import { initNewPlayer, initPlayers } from '../games/scorekeeper/PlayerInit';
import getKey from './KeyGenerator';
import icons from '../site/icons';

const PlayerDialog = ({ 
    isOpen,
    game,
    onClose,
}) => {

    const {
        players,
        setPlayers,
        playersInGame
    } = useContext(PlayerContext);

    const [gamePlayers, setGamePlayers] = useState();

    useEffect(() => {
        const playerArray = [...players || initializeData('players', initPlayers)];
        setGamePlayers(playerArray);
    }, []);

    const newPlayer = () => {
        const newPlayer = prompt('Enter new name', '');
        const initializedNewPlayer = initNewPlayer(newPlayer, game);
        let newPlayers = [...players];
        if (newPlayer !== null) {
            newPlayers.push(initializedNewPlayer);
            if (newPlayers != []) {
                setPlayers(newPlayers);
            }
            onClose();
        }
    }

    const deletePlayer = (index) => {
        // eslint-disable-next-line no-alert
        //const isDelete = confirm(`delete ${players[index].name}?`);
        let newPlayers = [...players];
        if (index >= 0 && index < newPlayers.length) {
            newPlayers.splice(index, 1);
            setPlayers(newPlayers);
        }                
    }

    const handleSubmit = () => {
        console.log('PlayerDialog => handleSubmit')
        console.log(`gamePlayers: ${JSON.stringify(gamePlayers, null, 2)}`);
        //setPlayers(gamePlayers);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const togglePlayer = (index) => {
        const newPlayers = [...players];
        newPlayers[index][game] = !newPlayers[index][game];
        const udatedGamePlayers = newPlayers.filter(player => player[game] === true);
        setGamePlayers(udatedGamePlayers);
    }

    if (!isOpen) return null;

    return <div className='modal-overlay bg-tintedDark'>
        <div className='containerBox modal p-20 color-lite bg-lite'>
            <div className='p-20 color-yellow bold contentCenter'>
                Select {game} players
            </div>
            <div className='containerBox form-group'>
                <div className='containerBox'>
                    Players:
                </div>
                <div className='containerBox scrollHeight300'>
                {
                    players.map((player, index) => <div key={getKey(`${index}`)}
                                                className={`containerBox flexContainer`}
                                            >
                                                <div className='containerBox flexColumn' onClick={() => togglePlayer(index)}>
                                                    <input 
                                                        id={`player${index}`} 
                                                        name={`player${index}`} 
                                                        className='regular-checkbox button glassy ml-5 p-10 mr-10' 
                                                        checked={player[game]} 
                                                        type='checkbox' 
                                                        onChange={() => console.log(`player${index} game:${player[game]}`)}
                                                    />
                                                </div>
                                                <div className='containerBox flex2Column contentLeft button' onClick={() => togglePlayer(index)}>
                                                    <div>{player.name}</div>
                                                </div>
                                                <div
                                                    title='delete'
                                                    className='containerBox flexColumn bg-lite button contentCenter'
                                                    onClick={() => deletePlayer(index)}
                                                >
                                                    {icons.delete}
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
                    onClick={newPlayer}
                >
                    Add New Player
                </button>
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

export default PlayerDialog;