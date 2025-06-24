import React, { useState, useContext } from 'react';
import getKey from '../../utils/KeyGenerator';
import Sounds from '../../sound/Sounds.js';
import { PlayerContext } from '../../context/PlayerContext';
import icons from '../../site/icons.js';

const targets = ['15', '16', '17', '18', '19', '20', 'Bull'];

const CricketScoreboard = () => {

    const {
        players,
        setPlayers,
        edit,
        setEdit,
        editPlayer,
        deletePlayer
    } = useContext(PlayerContext);

    /* 
    const [players, setPlayers] = useState([
        { name: 'Player 1', scores: initializeScores() },
        { name: 'Player 2', scores: initializeScores() },
    ]);
    function initializeScores() {
        return targets.reduce((acc, target) => {
            acc[target] = 0;
            return acc;
        }, {});
    }
    */
    const scoreIndex = (target) => targets.indexOf(target);
    const handleScoreClick = (playerIndex, target) => {
        
        /* 
        setPlayers((prevPlayers) => {
            const updatedPlayers = [...prevPlayers];
            const player = updatedPlayers[playerIndex];

            if (player.scores[target] < 3) {
                player.scores[target] += 1;
            }
            if (players[playerIndex].cricketScores < 3) {
                player.scores[target] += 1;
            }
            return updatedPlayers;
        }); 
        */
        const newPlayers = [...players];
        let newScore = Number(newPlayers[playerIndex].cricketScores[scoreIndex(target)]) + 1;
        newScore = (newScore > 3) ? 0 : newScore;
        let total = 0;
        newPlayers[playerIndex].cricketScores[scoreIndex(target)] = newScore;
        newPlayers[playerIndex].cricketScores.forEach((score) => {
            total = total + score
        });
        newPlayers[playerIndex].dartsScore = total;
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }

        Sounds.boop(5);
        //updateScores();
        //setScore(newScore);
        //setRefresh(!refresh);
    };
    const formatScore = (score) => {
        switch (score) {
            case 1:
                return '/';
            case 2:
                return 'X';
            case 3:
                return 'O';
            default:
                return ' ';
        }
    };
    const activePlayers = players.filter(player => player['darts'] === true);
    const lastActivePlayer = (playerIndex) => {
        if (players[playerIndex] === activePlayers[activePlayers.length-1]) {
            return true;
        };
        return false;
    };
/* 
    const calculateTotalScore = (playerScores) => {
        return Object.values(playerScores).reduce((total, score) => total + score, 0);
    };
 */
    return (
        <div className='containerBox'>
            {/* 
            <div className=''>
                <div className='containerBox flexContainer'>
                    <div className='flex3Column containerDetail bg-tintedMedium'>
                        <div className='size35 pt-20 pb-10'>
                            {calculateTotalScore(players[0].scores)}
                        </div>
                    </div>
                    <div className='flex3Column'></div>
                    <div className='flex3Column containerDetail bg-tintedMedium'>
                        <div className='size35 pt-20 pb-10'>
                            {calculateTotalScore(players[1].scores)}
                        </div>
                    </div>
                </div>
                {targets.map((target) => (
                    <div key={getKey(target)} className='containerBox flexContainer'>
                        <div className='flex3Column' onClick={() => handleScoreClick(0, target)}>{formatScore(players[0].scores[target])}</div>
                        <div className='flex3Column'>{target}</div>
                        <div className='flex3Column' onClick={() => handleScoreClick(1, target)}>{formatScore(players[1].scores[target])}</div>
                    </div>
                ))}
            </div> */}
            <table className='width-100-percent'>
                <tbody>
                    {targets.map((target) => (
                        <tr key={target}>
                            {
                                players.map((player, playerIndex) => (
                                    (player.darts)
                                    ? <React.Fragment key={getKey(player.name)}>
                                            <td
                                                title='add score'
                                                className={`containerDetail p-20 r-10 button size40 ${(players[playerIndex].cricketScores[scoreIndex(target)] === 3) ? 'incompletedSelector' : ''}`}
                                                onClick={() => handleScoreClick(playerIndex, target)}
                                            >
                                                {/*formatScore(players[0].scores[target])*/}
                                                {formatScore(players[playerIndex].cricketScores[scoreIndex(target)])}
                                            </td>
                                            {
                                                (!lastActivePlayer(playerIndex))
                                                ? <td className={`containerDetail p-20 r-10 w-50 bg-lite color-yellow size35 bold`}>
                                                    <span className={(target === 'Bull') ? 'containerDetail pl-10 pr-10 w-50 bg-tintedLite' : ''}>
                                                        {(target === 'Bull') ? icons.darts : target}
                                                    </span>
                                                </td>
                                                :null
                                            }
                                        </React.Fragment>
                                    : null
                                ))
                            }
                            {/* 
                            <td
                                className={`containerDetail p-20 r-10 button size40 ${(players[1].cricketScores[scoreIndex(target)] === 3) ? 'incompletedSelector' : ''}`}
                                onClick={() => handleScoreClick(1, target)}
                            >
                                {//formatScore(players[1].scores[target])}
                                {formatScore(players[1].cricketScores[scoreIndex(target)])}
                            </td> 
                            */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CricketScoreboard;