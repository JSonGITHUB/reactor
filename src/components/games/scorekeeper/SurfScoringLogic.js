import { useContext } from 'react';
import { findTwoHighestIndices } from './HighScores.js';
import { PlayerContext } from '../../context/PlayerContext';

const SurfScoringLogic = ({
    heat,
    index,
    completed,
    oneLine
}) => {

    const {
        players
    } = useContext(PlayerContext);

    const playerId = index;
    const scoreDifference = () => {
        if (heat.length > 1) {
            //console.log(`SurfScoringLogic => scoreDifference -> heat.length: ${heat.length}`);
            //console.log(`SurfScoringLogic => scoreDifference -> players ${heat.map((player)=>player.name)}`);
            //console.log(`SurfScoringLogic => scoreDifference -> players ${heat.map((player) => JSON.stringify(player,null,2))}`);
            const newPlayerId = (playerId === 0) ? 0 : (playerId - 1);   
            //const difference = Number((heat[newPlayerId].surfScore) - heat[(playerId === 0) ? 1 : (playerId)].surfScore);    
            const player1 = heat[newPlayerId]?.surfScore; // Check if heat[newPlayerId] exists and has surfScore
            //console.log(`SurfScoringLogic => scoreDifference -> player1: ${JSON.stringify(player1,null,2)}`);
            const player2 = heat[(playerId === 0) ? 1 : playerId]?.surfScore; // Check if heat[playerId] exists and has surfScore
            //console.log(`SurfScoringLogic => scoreDifference -> player2: ${JSON.stringify(player2, null, 2)}`);
            if (player1 !== undefined && player2 !== undefined) {
                const difference = Number(player1 - player2);
                //console.log(`Difference: ${difference}`);
                //console.log(`SurfScoringLogic => scoreDifference: ${heat[newPlayerId].name} - ${difference}`);
                return difference;
            } else {
                return 0;
                console.error("Invalid player ID or missing surfScore.");
            }
        } else {
            return 0;
        }
                
    }
    const difference = (scoreDifference() < 0) ? (-1 * scoreDifference()) : scoreDifference();
    const winningScore = Number(heat[(playerId === 0) ? 0 : ((playerId < 3) ? (playerId - 1) : 1)]?.surfScore);
    //console.log(`SurfScoringLogic => winningScore: ${winningScore}`);
    //console.log(`SurfScoringLogic => player: ${heat[playerId]?.name} surfScores: ${heat[playerId]?.surfScores}`);
    const highestScoresIndices = (heat[playerId]) ? findTwoHighestIndices(heat[playerId].surfScores) : [];
    const losersHeighestScore = (heat[playerId]) ? heat[playerId].surfScores[highestScoresIndices[0]] : [];
    //console.log(`SurfScoringLogic => losersHeighestScore: ${losersHeighestScore}`)
    const need = (winningScore - losersHeighestScore) + .01;
    //console.log(`SurfScoringLogic => need: ${need}`)
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