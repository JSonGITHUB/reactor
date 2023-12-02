import { getSurferIndexWithPriority, losePriority } from './SurfPriority.js';
import jerseyColors from './JerseyColors.js';

const getPriorityColor = (players, priorityIndex) => {
    const getJerseyColor = (surferIndex) => {
        if (players[surferIndex].surfJerseyColor === undefined) {
            const newPlayers = [...players];
            newPlayers[surferIndex].surfJerseyColor = surferIndex;
            localStorage.setItem('players', JSON.stringify(newPlayers))
            return 0;
        }
        return players[surferIndex].surfJerseyColor;
    }
    const surferIndex = getSurferIndexWithPriority(players, priorityIndex);
    const jerseyColorIndex = (surferIndex === null) ? null : getJerseyColor(surferIndex);
    const color = (jerseyColorIndex === null) ? 'white' : jerseyColors[jerseyColorIndex];
    return color;
}
export default getPriorityColor;