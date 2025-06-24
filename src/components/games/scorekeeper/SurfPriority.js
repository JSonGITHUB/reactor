import React, { useContext } from 'react';
import Dialog from '../../functional/Dialog.js';
import { PlayerContext } from '../../context/PlayerContext';

export const useGetSurferIndexWithPriority = (priorityIndex) => {

    const {
        players,
        playersInGame
    } = useContext(PlayerContext);

    let index = 0;
    players.forEach((player) => {
        if (Number(player.surfPriority) === priorityIndex) {
            console.log(`useGetSurferIndexWithPriority => ${player.name} index: ${index} priorityIndex: ${priorityIndex} player.surfPriority: ${player.surfPriority}`)
            return index;
        }
        index++
    });
    return null;
}

const priorityDialog = (
    players,
    index,
    selectedPriority
) => <Dialog title={`Loss of priority:`} message={`Did ${players[index].name} interfere with priority?`}>
        <button
            title='yes'
            onClick={() => alert('yes')}
            className='ml-5 greet p-20 r-10 w-200 bg-green brdr-green'
        >
            Yes
        </button>
        <button
            title='no'
            onClick={() => alert('no')}
            className='ml-5 greet p-20 r-10 w-200 bg-green brdr-green'
        >
            No
        </button>
    </Dialog>

export const losePriority = (
    selectedPriority,
    players,
    setPlayers
) => {

    const playersInGame = () => players.filter(player => player.surf);
    //const newPlayers = [...playersInGame()];
    const newPlayers = [...players];
    //const interference = window.confirm('Was this an interference?');

/*
                        newPlayers.map((player, index) => {
                            if(player.surf) {
                                console.log(`losePriority => ${player.name} surfPriority: ${player.surfPriority} selectedPriority: ${selectedPriority}`);
                                if (player.surfPriority === selectedPriority) {
                                    priorityDialog(
                                        players,
                                        index,
                                        selectedPriority
                                    )
                                    console.log(`losePriority => 1: ${player.name} selectedPriority: ${selectedPriority}`);
                                    return {
                                        ...player,
                                        surfPriority: playersInGame().length,
                                    }
                                } else if (player.surfPriority !== 1 && selectedPriority !== playersInGame().length) {
                                    const shift = player.surfPriority - 1;
                                    const getPriority = (shift > 0) ? shift : playersInGame().length;
                                    console.log(`losePriority => 2: ${player.name} getPriority: ${getPriority} selectedPriority: ${selectedPriority}`);
                                    return {
                                        ...player,
                                        surfPriority: getPriority
                                    }
                                }
                            }
                        });
*/

    if (selectedPriority < playersInGame().length) {
        newPlayers.map((player, index) => {
            if (player.surf) {
                if (selectedPriority === player.surfPriority) {
                    player.surfPriority = playersInGame().length;
                } else if (player.surfPriority > 1) {
                    player.surfPriority = player.surfPriority - 1;
                }
            }
        });
    }
    //console.log(`losePriority => newPlayers: ${JSON.stringify(newPlayers, null, 2)}`);
    setPlayers(newPlayers);
}
export const shiftPriority = (
    priorityIndex,
    players,
    setPlayers
) => {

    const newPlayers = [...players];
    newPlayers.forEach((player) => {
        if (player.surfPriority === (priorityIndex - 1)) {
            return {
                ...player,
                surfPriority: priorityIndex
            }
        } else if (player.surfPriority === priorityIndex) {
            return {
                ...player,
                surfPriority: (priorityIndex - 1)
            }
        }
    });
    setPlayers(newPlayers);
}