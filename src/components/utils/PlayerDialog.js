import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { initNewPlayer } from '../games/scorekeeper/PlayerInit';
import getKey from './KeyGenerator';
import icons from '../site/icons';

const PlayerDialog = ({ 
    isOpen,
    game,
    onClose,
}) => {

    const {
        players,
        setPlayers
    } = useContext(PlayerContext);

    const newPlayer = () => {
        const newPlayer = prompt('Enter new name', '');
        const initializedNewPlayer = initNewPlayer(newPlayer, game);
        let newPlayers = [...players];
        if (newPlayer !== null) {
            newPlayers.push(initializedNewPlayer);
            setPlayers(newPlayers);
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
        console.log(`players: ${JSON.stringify(players, null, 2)}`);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const togglePlayer = (index) => {
        const newPlayers = [...players];
        newPlayers[index] = {
            ...newPlayers[index],
            [game]: !newPlayers[index][game]
        };
        setPlayers(newPlayers);
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