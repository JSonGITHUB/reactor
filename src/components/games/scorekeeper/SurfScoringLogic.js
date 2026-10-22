import { findTwoHighestIndices } from './HighScores.js';

const SurfScoringLogic = ({
    heat,
    index,
    completed,
    oneLine
}) => {
    // Defensive: fallback if heat is not valid
    if (!Array.isArray(heat) || heat.length < 2 || !heat[index] || typeof heat[index].surfScore === 'undefined') {
        return <div className="color-red">Score unavailable</div>;
    }

    const playerId = index;
    const scoreDifference = () => {
        if (heat.length > 1) {
            const newPlayerId = (playerId === 0) ? 0 : (playerId - 1);
            const player1 = heat[newPlayerId]?.surfScore;
            const player2 = heat[(playerId === 0) ? 1 : playerId]?.surfScore;
            if (player1 !== undefined && player2 !== undefined) {
                const difference = Number(player1 - player2);
                return difference;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }
    const difference = (scoreDifference() < 0) ? (-1 * scoreDifference()) : scoreDifference();
    const winningScore = Number(heat[(playerId === 0) ? 0 : ((playerId < 3) ? (playerId - 1) : 1)]?.surfScore);
    const highestScoresIndices = (heat[playerId]) ? findTwoHighestIndices(heat[playerId].surfScores) : [];
    const losersHeighestScore = (heat[playerId]) ? heat[playerId].surfScores[highestScoresIndices[0]] : [];
    const need = (winningScore - losersHeighestScore) + .01;
    const winsBy = (oneLine === 'false')
        ? <div>
            <div>{`${(completed) ? 'Won' : 'Wins'} by`}</div>
            <div>{difference.toFixed(2)}</div>
        </div>
        : <div>
            {`${(completed) ? 'Won' : 'Wins'} by`} {difference.toFixed(2)}
        </div>

    const needs = (oneLine === 'false')
        ? <div>
                <div>{`${(completed) ? 'Needed' : 'Needs'}`}</div>
                <div>{need.toFixed(2)}</div>
            </div>
            : <div>{`${(completed) ? 'Needed' : 'Needs'}`} {need.toFixed(2)}</div>

    if (playerId === 0) {
        return <div>
                    {winsBy}
                    {
                (heat[playerId].surfPriority !== 0 && heat[playerId].surfPriority)
                        ? <div>
                            P {heat[playerId].surfPriority}
                        </div >
                        : null
                    }
                </div >
    }
    return <div>
                {
                    <div>
                        {needs}
                        {
                            (heat[playerId]?.surfPriority !== 0 && heat[playerId]?.surfPriority)
                            ?<div>
                                    P {heat[playerId]?.surfPriority}
                                </div>
                            : null
                        }
                    </div>
                }
            </div>
}
export default SurfScoringLogic;