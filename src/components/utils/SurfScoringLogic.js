import React, { useState, useEffect } from 'react';
import surfScoring from './SurfScoring.js'
import jerseyColors from './JerseyColors.js';
import { findTwoHighestIndices, getTwoHighestScores } from './HighScores.js';

const SurfScoringLogic = (index, completed, players, /*setPlayers, editPlayer, deleteAthlete*/) => {

    const getSurfTotal = (player) => {
        let total = 0;
        const score = (index) => player.surfScores[index];
        const addToTotal = (value) => total = total + value;
        surfScoring.map((target, index) => {
                addToTotal(Number(score(index)))
            }
        );
        return total;
    }
    const getScore = () => window.location.pathname = '/reactor/ScoreKeeper';
    /*
    const resetSurfersScores = (playerId) => {
        const newPlayers = [...players];
        newPlayers[playerId].surfScore = 0;
        newPlayers[playerId].surfScores = surfScoring;
        setPlayers(newPlayers);
        getScore();
    }
    */
   /*
    const selectJersey = (playerId, selection) => {
        const newPlayers = [...players];
        newPlayers[playerId].surfJerseyColor = (selection);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(newPlayers);
    }
    */
    //const getJerseyColorSelector = (playerId, color, index) => <button className={`bg-${color} ht-45 width50px button r-10`} onClick={() => selectJersey(playerId, index)}></button>;
   /*
   const editSurfer = (playerId) => <div className='m-10 p-10 r-10 bg-darker'>
            <div className='size30 p-10'>Name:</div>
            <button className={`bg-lite size30 color-lite width-100-percent pb-10 pt-10 button r-10`} onClick={() => editPlayer(playerId)}>{players[playerId].name}</button>
            <div className='size30 p-10'>Jersey color:</div>
            <div>
                {jerseyColors.map((color,index) => 
                    index === Math.ceil(jerseyColors.length / 2) ? (
                        <React.Fragment key={index}>
                            <br />
                            {getJerseyColorSelector(playerId, color, index)}
                        </React.Fragment>
                    ) : (
                        getJerseyColorSelector(playerId, color, index)
                    )
                )}
            </div>
            <div>
                <button className='bg-lite size30 color-lite width-100-percent pb-10 pt-10 button r-10 m-5' onClick={() => resetSurfersScores(playerId)}>
                    Reset Scores
                </button>
                <button className='bg-lite size30 color-lite width-100-percent pb-10 pt-10 button r-10 m-5' onClick={() => deleteAthlete(playerId)}>
                    Delete Athlete
                </button>
            </div>
        </div>
    */
    const scoreTotal = (index, playersArray) => Number(highestScore(index, playersArray) + secondHighestScore(index, playersArray)).toFixed(2);
    
    const isTieScore = (index) => {
        const score = scoreTotal(index, players);
        if (index !== 0) {
            if (score === scoreTotal(index - 1, players)) {
                return true;
            }
        }
        return false;
    }
    const place = (index) => (isTieScore(index) && (index !== 0)) ? index : (index + 1);
    const placeSuffix = (index) => rank[(isTieScore(index) && (index !== 0)) ? (index-1) : (index > 2) ? 3 : (index)];
    const position = (index) => `${place} ${placeSuffix}`;
    const rank = ['st', 'nd', 'rd', 'th'];
    const highestScore = (index, playersArray) => {
        return playersArray[index].surfScores[getTwoHighestScores(index).highScoreIndex];
    }
    const secondHighestScore = (index, playersArray) => playersArray[index].surfScores[getTwoHighestScores(index).secondHighScoreIndex];
    
    const getScoreTotal = (index) => {
        const highestScore = players[index].surfScores[getTwoHighestScores(index).highScoreIndex]
        const secondHighestScore = players[index].surfScores[getTwoHighestScores(index).secondHighScoreIndex]
        const score = (highestScore + secondHighestScore);
        return score;
    }
    
    const playerId = index.index;
    //console.log(`SurfScoringLogic => index: ${index.index}`);
    //console.log(`SurfScoringLogic => players: ${JSON.stringify(index.players,null,2)}`);
    //console.log(`SurfScoringLogic => surfScores: ${index.players[playerId].surfScores}`);
    const scoreDifference = Number(index.players[(playerId === 0) ? 0 : (playerId - 1)].surfScore - index.players[(playerId === 0) ? 1 : (playerId)].surfScore);
    const difference = (scoreDifference < 0) ? (-1 * scoreDifference) : scoreDifference;
    const winningScore = Number(index.players[(playerId === 0) ? 0 : ((playerId < 3) ? (playerId - 1) : 1)].surfScore);
    const highestScoresIndices = findTwoHighestIndices(index.players[playerId].surfScores);
    //console.log(`SurfScoringLogic => index: ${index}`)
    //console.log(`SurfScoringLogic => players: ${players}`)
    const losersHeighestScore = index.players[playerId].surfScores[highestScoresIndices[0]];
    const need = (winningScore - losersHeighestScore) + .01;
    const winsBy = `${(completed)?'Won':'Wins'} by ${difference.toFixed(2)}`;
    const needs = `${(completed)?'Needed':'Needs'} ${need.toFixed(2)}`;
    if (playerId === 0) {
        return winsBy
    }
    return needs

}
export default SurfScoringLogic;