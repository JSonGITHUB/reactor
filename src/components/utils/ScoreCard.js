import React, { useState } from 'react';
import Sounds from './Sounds.js';
import Selector from '../forms/FunctionalSelector.js';

const ScoreCard = ({ game, players, playerIndex, scoreIndex, editPlayer, deletePlayer, updateScores, winner}) => {
 
    const player = players[playerIndex];
    console.log(`ScoreCard => game: ${game} scoreIndex: ${scoreIndex} player: ${player.name} or ${JSON.stringify(player,null,2)} winner: ${winner}`)
    const cricketKey = `${player}Cricket${scoreIndex}`;
    //const getScore = () => (localStorage.getItem(player.name) || 0);
    const initGolfStats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    const initGolfPutts = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const puttsArray = [0,1,2,3,4,5,6,7,8,9,10];
    const getScore = () => {
        if (game === 'golf') {
            const newPlayers = JSON.parse(localStorage.getItem('players'));
            return newPlayers[playerIndex].golfScores[scoreIndex];
        } 
        return player[`${game}Score`] || 0;
    }
    const [ score, setScore ] = useState(getScore());
    const [ edit, setEdit ] = useState(false);
    const updateScore = (newScore) => {

        //localStorage.setItem((player.player||player.name), newScore);
        let total = 0;
        const addToTotal = (value) => total = total + value;
        if (game === 'golf') {
            const newPlayers = JSON.parse(localStorage.getItem('players'));
            //alert(`updateScore => ${game}: hole: ${scoreIndex} newScore: ${newScore} player: ${player.name}`);
            newPlayers[playerIndex].golfScores[scoreIndex] = newScore;
            newPlayers[playerIndex].golfScores.map((score) => addToTotal(score));
            newPlayers[playerIndex].golfScore = total;
            if (!newPlayers[playerIndex].golfFW) {
                newPlayers[playerIndex].golfFW = initGolfStats;
            }
            if (!newPlayers[playerIndex].golfGIR) {
                newPlayers[playerIndex].golfGIR = initGolfStats;
            }
            if (!newPlayers[playerIndex].golfPutts) {
                newPlayers[playerIndex].golfPutts = initGolfPutts;
            }
            localStorage.setItem('players', JSON.stringify(newPlayers));
        } else {
            player[`${game}Score`] = newScore;
            players.map((player, index) => {
                if (index === playerIndex) {
                    //players[index].score = newScore;
                    players[index][`${game}Score`] = newScore;
                }
                console.log(`updateScore => ${index} player: ${(player.player||player.name)}: ${newScore}`);
                if (game === 'golf' || (newScore < Number(winner))) {
                    //localStorage.setItem(`player${index}`, 'loser');
                    localStorage.setItem('gameStatus', 'inProgress');
                } else {
                    //localStorage.setItem(`player${index}`, 'winner');
                    localStorage.setItem('gameStatus', 'gameOver');
                }
            });
            localStorage.setItem('players', JSON.stringify(players));
        }
        
        Sounds.playSound((game==='golf')?3000:winner, newScore);
       
        console.log(`updateScore => playerIndex: ${playerIndex}`)
        console.log(`updateScore => scoreIndex: ${scoreIndex}`)
        console.log(`updateScore => game: ${game}`)
        console.log(`updateScore => winner: ${winner}`)
        console.log(`updateScore => newScore: ${newScore}`)
        console.log(`updateScore => player: ${(player.player||player.name)}`)
        console.log(`updateScore => playerScore: ${(game === 'golf') ? total : newScore}`)
        console.log(`updateScore => gameStatus: ${localStorage.getItem('gameStatus')}`)
        
        setScore(newScore);
        updateScores();
    }
    // eslint-disable-next-line
    const addScore = () => {
        const newScore = Number(score) + 1;
        updateScore(newScore);       
    }
    const subtractScore = () => {
        const newScore = Number(score) - 1;
        updateScore(newScore);
    }
    const editNav = () => {
        if (edit) {
            return <div className='t-0 relative flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                        <div className="flex3Column"></div>
                        <div className="flex3Column">
                            <div className='button color-green description r-5 p-5 m-5 bg-yellow' onClick={() => editPlayer(playerIndex)}>EDIT</div>
                            <div className='button color-red description r-5 p-5 m-5 bg-yellow' onClick={() => deletePlayer(playerIndex)}>DELETE</div>
                        </div>                    
                        <div className="flex3Column"></div>
                    </div>
        }
    }
    const stockClasses = 'r-10 m-1 color-yellow bold ';
    const gameClasses = {
        'standard': 'bg-dkGreen', 
        'ping pong': 'bg-dkGreen', 
        'golf': 'bg-dkGreen', 
        'cornhole': 'bg-dkYellow', 
        'horse': 'bg-dkYellow',
        'horseshoes': 'bg-dkRed', 
        'bocci': 'bg-dkRed'
    }
    const buttonClass = (game === 'golf') ? 'bg-darker' : 'bg-darker';
    const getButtonClass = 'glassy button flex3Column p-5 r-10 m-1 ' + buttonClass;
    const dartClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    const scoreButtonClasses = 'glassy flex3Column button bg-green r-10 color-neogreen centeredContent';
    console.log(`PLAYER: ${(players[playerIndex].player || players[playerIndex].name)} or ${JSON.stringify(players[playerIndex],null,2)} ${game==='golf'?'par:':'winner:'} ${winner} score: ${score}`)
    const isEagle = (score, par) => (score === (par-1)) ? true : false;
    const isBoagie = (score, par) => ((score > par) && (score < (Number(par)+3))) ? true : false;
    const isDoubleBoagie = (score, par) => (score === (Number(par)+2)) ? true : false;
    const getOuterCSS = (score, winner) => {
        if (game==='golf'&&isEagle(score, winner)) return 'completedSelector r-50-percent pb-5 pt-3';
        if (game==='golf'&&isDoubleBoagie(score, winner)) return 'brdr-light p-5 r-10';
        return 'brdr-transparent r-10';
    }
    const getInnerCSS = (score,winner) => {
        if (game==='golf'&&isBoagie(score,winner)&&isDoubleBoagie(score,winner)) return 'brdr-light r-5 font50 ht-50 pt-12 pl-10 pr-10';
        if (game==='golf'&&isBoagie(score,winner)) return 'brdr-light r-5 font50 ht-50 pt-12 pl-10 pr-10 mt-5 mb-5';
        if (game==='golf'&&!isDoubleBoagie(score,winner)&&!isEagle(score,winner)) return 'ht-40 p-5 r-5 font50 m-10';
        return 'p-5 r-5 font50 m-10';
    }
    const toggleFW = () => {
        const newPlayers = [...players];
        if (newPlayers[playerIndex].golfFW[scoreIndex] != true) {
            newPlayers[playerIndex].golfFW[scoreIndex] = true;
        } else {
            newPlayers[playerIndex].golfFW[scoreIndex] = false;
        }
        Sounds.playSound(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        updateScores();
    };
    const toggleGIR = () => {
        const newPlayers = [...players];
        if (newPlayers[playerIndex].golfGIR[scoreIndex] != true) {
            newPlayers[playerIndex].golfGIR[scoreIndex] = true;
        } else {
            newPlayers[playerIndex].golfGIR[scoreIndex] = false;
        }
        Sounds.playSound(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        updateScores();
    };
    const getFW_Checkbox = () => {
        if (!players[playerIndex].golfFW) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfFW = initGolfStats;
            localStorage.setItem('players', JSON.stringify(newPlayers));
            updateScores();
        }
        const FW = players[playerIndex].golfFW[scoreIndex] || false;
        let checkBox = <input className='regular-checkbox button glassy ml-5' checked type='checkbox' id='fw' />
        if (FW != true) {
            checkBox = <input className='regular-checkbox button glassy ml-5' type='checkbox' id='fw' />
        }
        return checkBox;
    }
    const getGIR_Checkbox = () => {
        if (!players[playerIndex].golfGIR) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfGIR = initGolfStats;
            localStorage.setItem('players', JSON.stringify(newPlayers));
            updateScores();
        }
        const GIR = players[playerIndex].golfGIR[scoreIndex] || false;
        let checkBox = <input className='regular-checkbox button glassy ml-5 mr-10' checked type='checkbox' id='gir' />
        if (GIR != true) {
            checkBox = <input className='regular-checkbox button glassy ml-5 mr-10' type='checkbox' id='gir' />
        }
        return checkBox;
    }
    const selectPutts = (groupTitle, label, selected) => {
        const newPlayers = [...players];
        const previouslySetPutts = newPlayers[playerIndex].golfPutts[scoreIndex];
        const newSelectionDifference = selected - previouslySetPutts;
        const currentScore = newPlayers[playerIndex].golfScores[scoreIndex];
        newPlayers[playerIndex].golfScores[scoreIndex] = currentScore + newSelectionDifference;
        newPlayers[playerIndex].golfPutts[scoreIndex] = selected;
        newPlayers[playerIndex].golfScore = newPlayers[playerIndex].golfScore + newSelectionDifference;
        Sounds.playSound(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        updateScores();
    }
    const getPuttCount_Selector = () => {
        if (!players[playerIndex].golfPutts) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfPutts = initGolfPutts;
            localStorage.setItem('players', JSON.stringify(newPlayers));
            updateScores();
        }
        const putts = players[playerIndex].golfPutts[scoreIndex] || 0;
        let puttSelector = <Selector
                                groupTitle='putts'
                                label='putts'
                                items={puttsArray}
                                selected={putts}
                                onChange={selectPutts}
                                fontSize='25'
                                padding='10px'
                                width={'auto'}
                            />
        return <div className='columnCenterAlign bg-lite r-10 button m-2'>
                    <span className="size20">Putts:</span>
                    <span className='m-5'>{puttSelector}</span>
                </div>
    }
    const getGolfLowerNav = () => <div className='flexContainer m-1'>
        <div className={`columnCenterAlign size20 p-10 mt-5 mb-5 ${scoreButtonClasses}`} onClick={() => toggleFW()}>
            <span>FW</span>
            {getFW_Checkbox()}
        </div>
        <div className="flex3Column"></div>
        <div className={`columnCenterAlign size20 pt-10 pb-10 pl-10 mt-5 mb-5 ${scoreButtonClasses}`} onClick={() => toggleGIR()}>
            <span>GIR</span>
            {getGIR_Checkbox()}
        </div>
    </div>

    return (
        <div>
            <div className={stockClasses + gameClasses[game]}>
                <div className='flexContainer'>
                    <span className={`navBranding ${scoreButtonClasses}`} onClick={() => subtractScore()}>-</span>
                    <span 
                        className={getButtonClass} 
                        onClick={() => setEdit(!edit)}
                    >
                        <div></div>
                        <div className={dartClass()}>{(game==='golf')?null:(players[playerIndex].player || players[playerIndex].name)}</div>
                        <div className={getOuterCSS(score, winner)}>
                            <div className={getInnerCSS(score, winner)}>
                                {score}
                            </div>
                        </div>
                    </span>
                    <span className={`navBranding ${scoreButtonClasses}`} onClick={() => addScore()}>+</span>
                </div>
                {(game === 'golf') ? getGolfLowerNav() : null}
                {(game === 'golf') ? getPuttCount_Selector(): null} 
            </div>
            {editNav()}
        </div>
    )
}
   
export default ScoreCard;