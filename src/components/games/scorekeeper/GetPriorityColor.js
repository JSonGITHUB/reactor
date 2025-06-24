import { useContext } from 'react';
//import { useGetSurferIndexWithPriority } from './SurfPriority.js';
import jerseyColors from './JerseyColors.js';
import validate from '../../utils/validate.js';
import { PlayerContext } from '../../context/PlayerContext';

const useGetPriorityColor = (priorityIndex) => {

    const {
        players,
        setPlayers,
        playersInGame
    } = useContext(PlayerContext);

    const getJerseyColor = (surferIndex) => {
        console.log(`getJerseyColor => surferIndex: ${surferIndex}`)
        if (surferIndex !== null) {
            if( validate(players[surferIndex].surfJerseyColor) !== null && validate(players[surferIndex].surfJerseyColor) === null) {
                const newPlayers = [...players];
                newPlayers[surferIndex].surfJerseyColor = surferIndex;
                const allPlayers = [...players, ...newPlayers]
                setPlayers(allPlayers);
                return 0;
            }
            return players[surferIndex].surfJerseyColor;
        }
    }

    const getSurferIndexWithPriority = (priorityIndex) => {

        let index = 0;
        let playerIndex = 0;
        players.forEach((player, index) => {
            console.log(`getSurferIndexWithPriority => 1) ${player.name} index: ${index} priorityIndex: ${priorityIndex} player.surfPriority: ${player.surfPriority}`)
            if (player.surfPriority == priorityIndex) {
                console.log(`getSurferIndexWithPriority => 2)${player.name} index: ${index} priorityIndex: ${priorityIndex} player.surfPriority: ${player.surfPriority} player.surfJerseyColor: ${player.surfJerseyColor} jerseyColors[${player.surfJerseyColor}]: ${jerseyColors[player.surfJerseyColor]}`)
                //return jerseyColors[player.surfJerseyColor];
                playerIndex = index;
                console.log(`getSurferIndexWithPriority => 2) ${player.name} playerIndex: ${playerIndex} index: ${index} priorityIndex: ${priorityIndex} player.surfPriority: ${player.surfPriority} player.surfJerseyColor: ${player.surfJerseyColor} jerseyColors[${player.surfJerseyColor}]: ${jerseyColors[player.surfJerseyColor]}`)
            }
            index++
        });
        return playerIndex;
    }
    const surferIndex = () => getSurferIndexWithPriority(priorityIndex);
    const jerseyColorIndex = (surferIndex() === null) ? null : players[surferIndex()].surfJerseyColor;
    console.log(`useGetPriorityColor => getSurferIndexWithPriority(${priorityIndex}): ${getSurferIndexWithPriority(priorityIndex)} surferIndex: ${surferIndex()} has jerseyColorIndex: ${(jerseyColorIndex) ? jerseyColorIndex :'shit'}`);
    const color = (jerseyColorIndex === null) ? getSurferIndexWithPriority(priorityIndex) : getSurferIndexWithPriority(priorityIndex);
    return color;
    //return surferIndex();
}
export default useGetPriorityColor;