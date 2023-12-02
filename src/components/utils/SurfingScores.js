import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator.js';
import jerseyColors from './JerseyColors.js';
import SurfScoringLogic from './SurfScoringLogic.js';
import { findTwoHighestIndices } from './HighScores.js';

const SurfingScores = (players, index, surfScoring, setPlayers, editPlayer, deletePlayer) => {

    console.log(`SurfingScores => players: ${JSON.stringify(players)} index: ${index}`)

    const[state, setState] = useState({
        editIndex: null,
        showButtons: false
    });
    const [timer, setTimer] = useState(null);
    const [showButtons, setShowButtons] = useState(false);
    const handleTouchStart = () => {
        console.log(`handleTouchStart`)
        setTimer(setTimeout(() => setShowButtons(true), 1000));
    };
    useEffect(() => {
        alert(`SurfingScores => timer: ${timer}`);
    }, [timer]);

    const handleTouchEnd = () => {
        clearTimeout(timer);
        //setShowButtons(false);
    };
    const rank = ['st', 'nd', 'rd', 'th'];

    const getTwoHighestScores = () => {
        const player = players[index];
        const scores = player.surfScores;
        const [highestIndex, secondHighestIndex] = findTwoHighestIndices(scores);
        //console.log(`getTwoHighestScores => playerIndex: ${index} player: ${JSON.stringify(player,null,2)} name: ${(player.player || player.name)}: Highest score at index ${highestIndex}, Second highest score at index ${secondHighestIndex}`);
        return {
            highScoreIndex: highestIndex,
            secondHighScoreIndex: secondHighestIndex
        };
    };
    const getScoreTotal = (index) => {
        const highestScore = players[index].surfScores[getTwoHighestScores(index).highScoreIndex]
        const secondHighestScore = players[index].surfScores[getTwoHighestScores(index).secondHighScoreIndex]
        const score = (highestScore + secondHighestScore);
        console.log(`getScoreTotal => player: ${index} score: ${score}`);
        return score;
    }
    const highestScore = (playersArray) => {
        //console.log(`highestScore = (index: ${index}, playersArray: ${JSON.stringify(playersArray, null, 2)})`)
        return playersArray[index].surfScores[getTwoHighestScores(index).highScoreIndex];
    }
    const secondHighestScore = (playersArray) => playersArray[index].surfScores[getTwoHighestScores(index).secondHighScoreIndex];
    const scoreTotal = (index, playersArray) => Number(highestScore(playersArray) + secondHighestScore(playersArray)).toFixed(2);

    const setSurfScore = (playerId, index, score) => {

        const newScore = prompt(`Enter ${players[playerId].player || players[playerId].name}'s score for wave ${index + 1}: `, Number(score || ''));
        const newPlayers = [...players];
        const currentScore = newPlayers[playerId].surfScores[index];
        const edit = (currentScore !== '' && currentScore !== 0) ? false : true;
        newPlayers[playerId].surfScores[index] = Number(newScore);
        newPlayers[playerId].surfScore = scoreTotal(playerId, newPlayers);
        if ((newPlayers[playerId].surfPriority === 1 || newPlayers[playerId].surfPriority === 0) && edit) {
            newPlayers.map((player, index) => {
                if (index === playerId) {
                    player.surfPriority = players.length;
                } else if (player.surfPriority != 0) {
                    player.surfPriority = player.surfPriority - 1;
                }
            });
        }
        const sortedPlayers = [...newPlayers];
        sortedPlayers.sort((a, b) => b.surfScore - a.surfScore);

        console.log('setSurfScore => sortedPlayers: ', sortedPlayers)

        localStorage.setItem('players', JSON.stringify(sortedPlayers, null, 2));
        setPlayers(sortedPlayers);
    }
    const get2ndHighestScore = (playerId) => {
        const highestScores = findTwoHighestIndices(players[playerId].surfScores);
        const secondHighestId = highestScores[1];
        return players[playerId].surfScores[secondHighestId];
    }
    const getWave = (playerId, index, score) => {
        const player = players[playerId];
        const theScore = player.surfScores[index];
        const highestScores = findTwoHighestIndices(players[playerId].surfScores);
        const highestId = highestScores[0];
        const secondHighestId = highestScores[1];
        const firstScore = (index === highestId) ? true : false;
        const secondScore = (index === secondHighestId) ? true : false;
        const getClasses = (firstScore || secondScore) ? 'size30 bold color-neogreen p-10' : 'size30 white p-10';
        const wave = <div className="column r-10" onClick={() => setSurfScore(playerId, index, score)} key={getKey(`wave${playerId}${index}${score}`)}>
            <div className='size30 bold color-yellow bg-dkYellow w-100 p-10'>{index + 1}</div>
            <div className={`ht-40 ${getClasses}`}>{score}</div>
        </div>
        return wave
    }
    const selectJersey = (index) => {
        const newPlayers = [...players];
        newPlayers[index].surfJerseyColor = Number(newPlayers[index].surfJerseyColor) + 1;
        newPlayers[index].surfJerseyColor = (newPlayers[index].surfJerseyColor > (jerseyColors.length - 1)) ? 0 : newPlayers[index].surfJerseyColor;
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(newPlayers);
    }
    const isTieScore = (index) => {
        const score = scoreTotal(index, players);
        if (index !== 0) {
            if (score === scoreTotal(index - 1, players)) {
                return true;
            }
        }
        return false;
    }
    const editSurfer = (index) => <div>
        <button onClick={alert(`Subtract ${index}`)}>-</button>
        <button onClick={alert(`Add ${index}`)}>+</button>
    </div>
    const getSurfTotal = (player) => {
        let total = 0;
        const score = (index) => player.surfScores[index];
        const addToTotal = (value) => total = total + value;
        surfScoring.map((target, index) => {
            //console.log(`getSurfTotal => player: ${player.name} index: ${index} score: ${score(index)}`)
            addToTotal(Number(score(index)))
        }
        );
        return total;
    }

    const surferScores = () => <div key={getKey(`${index}${(players[index].player || players[index].name)}`)}>
        {/*<div className={`flexContainer r-10 ml-10 mr-10 mb--10 color-dark text-outline-light bg-${jerseyColors[Number(players[index].surfJerseyColor)] || jerseyColors[0]}`} key={getKey(`${index}${(player.player || player.name)}`)}  onTouchStart={() => handleTouchStart(index)} onTouchEnd={handleTouchEnd}>*/}
        <div className={`flexContainer r-10 ml-10 mr-10 mb--10 color-dark text-outline-light bg-${jerseyColors[0] || jerseyColors[0]}`} key={getKey(`${index}${(players[index].player || players[index].name)}`)} onTouchStart={() => handleTouchStart(index)} onTouchEnd={handleTouchEnd}>
            <div className={`flex2Column contentLeft r-10-lft m-0 w-75 p-10`} onClick={() => selectJersey(index)}>
                <div>
                    <span className='size25 mt--10'>
                        {(isTieScore(index) && (index !== 0)) ? index : (index + 1)}
                    </span>
                    <span className='size15 mt--10'>
                        {rank[(isTieScore(index) && (index !== 0)) ? index : (index > 2) ? 3 : (index)]}
                    </span>
                </div>
                <div className='size30 mt-5 mb-5'>
                    {(players[index].player || players[index].name).split(' ')[0]}
                </div>
                <div className='size20'>
                    {(players[index].player || players[index].name).split(' ')[1]}
                </div>
            </div>
            <div className={`r-10-rt flex2Column contentRight m-0 mr-10 pb-10 pl-10 pr-10 pt-15`}>
                <div className='size40 bold'>{getSurfTotal(players[index])}</div>
                <div className='mt-10 bold'>
                    {/*
                        <SurfScoringLogic
                            index={index}
                            completed={false}
                            players={players}
                            //setPlayers={setPlayers}
                            //editPlayer={editPlayer}
                            //deleteAthlete={deletePlayer}
                        />
                    */}
                    Index: {index}
                    Players: {players}
                </div>
            </div>
        </div>
        <div>
            {showButtons && (
                editSurfer(index)
            )}
        </div>
        <div>
            <div>
                <div className='h-scroll color-white copyright ml-10 mr-10 mt-5'>
                    <div className="container mt-10">
                        {players[index].surfScores.map((score, wave) => getWave(index, wave, players[index].surfScores[wave]))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    return surferScores()
}
export default SurfingScores;