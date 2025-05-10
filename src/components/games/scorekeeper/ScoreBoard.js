import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import getKey from '../../utils/KeyGenerator';
import GetAthleteScore from './GetAthleteScore';

const ScoreBoard = ({
    scoreboardCollapse,
    addNewScore,
    timesUp
}) => {

    const {
        players
    } = useContext(PlayerContext);

    const athletes = [];

    players.forEach((player) => {
        if (player.surf) {
            athletes.push(player);
        }
    });

    const playerCount = () => {
        let index = 0;
        players.forEach((player) => {
            if (player.surf) {
                athletes.push(player);
                index++
            }
        });
        return index;
    }

    return (
        !scoreboardCollapse 
        ? <div className='containerBox flexContainer h-scroll'>
                {
                    athletes.map((player, index) => <div
                            title='add score'
                            key={getKey(`SurfAthlete${index}`)}
                            className={` button flex${playerCount()}Column`}
                            onClick={() => addNewScore(index)}
                        >
                            <GetAthleteScore
                                heat={athletes}
                                index={index}
                                player={player}
                                playerCount={playerCount()}
                                timesUp={timesUp}
                            />
                        </div>
                    )
                }
            </div>
        : <div>
                {/* Add the content you want to render when scoreboardCollapse is true */}
            </div>
    );
}
export default ScoreBoard;