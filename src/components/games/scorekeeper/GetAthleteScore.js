
import React, { useContext } from 'react';
import getKey from '../../utils/KeyGenerator';
import SurfScoringLogic from './SurfScoringLogic';
import jerseyColors from './JerseyColors';
import getMedal from './GetMedal';
import { PlayerContext } from '../../context/PlayerContext';
import icons from '../../site/icons';

const GetAthleteScore = ({
    heat,
    index,
    player,
    playerCount,
    timesUp
}) => {
    /*
    const {
        players
    } = useContext(PlayerContext);
    */
    const highestScores = [];
    const athletes = (heat.scores === undefined) ? heat : heat.scores;
    //console.log(`GetAthleteScore => heat: ${JSON.stringify(heat, null, 2)}`);
    athletes.forEach((player) => {
        const surfScores = [...player.surfScores];
        const highestScore = Math.max(...surfScores.map(score => Number(score)));
        const displayHighScore = isNaN(highestScore) ? 0 : highestScore;
        highestScores.push(displayHighScore);
    });
    const heatHighestScore = Math.max(...highestScores.map(score => Number(score)));
    const playerIndex = [];
    let i = 0;
    //console.log(`heat: ${JSON.stringify(heat, null, 2)}`);
    athletes.forEach((player) => {
        const surfScores = [...player.surfScores];
        if (surfScores.includes(heatHighestScore)) {
            playerIndex.push(i);
        }
        i++
    });

    return <div className={`flex${playerCount}Column r-10 m-1 size20 bg-darker pt-10 pb-10`} key={getKey(`athleteScore`)}>
                <div className={`p-5 size30`}>{index+1}</div>
                <div className={`m-10 ht-5 bg-${jerseyColors[player.surfJerseyColor] || 'green'}`}></div>
                <div className='p-5 ht-75 centeredContent'>
                    <div>
                        {getMedal(index)}
                    </div>
                    {
                        (playerIndex.includes(index))
                        ? <div className='size15 color-yellow i'>
                                highest score: {heatHighestScore}
                            </div>
                        : null
                    }
                    <div>{player.name.split(' ')[0]}</div>
                    <div>{player.name.split(' ')[1]}</div>
                </div>
                <div className='p-5 bg-lite r-10 m-10'>
                    {player.surfScore}
                </div>
                <div className='greet'>
                    <SurfScoringLogic
                        heat={athletes}
                        index={index} 
                        completed={false}
                        oneLine='false'
                    />
                </div>
            </div>
}
export default GetAthleteScore;