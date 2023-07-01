import React, { useState } from 'react';
import ScoreCard from './ScoreCard.js';
import CricketScore from './CricketScore.js';
import Dominos from './Dominos.js';
import Selector from '../forms/FunctionalSelector.js';
import getKey from '../utils/KeyGenerator.js';

const ScoreKeeper = () => {
    
    const initPlayers = [];
    const initScores = localStorage.getItem('twoPlayerScores') || [0,0];
    const games = ['standard', 'ping pong', 'golf', 'cornhole', 'darts', 'dominos', 'horse', 'horseshoes', 'bocci'];
    const winners = [5, 10, 11, 15, 20, 21];
    const dominoWinners = [50, 100, 150, 200];
    const [ players, setPlayers ] = useState(JSON.parse(localStorage.getItem('players')) || initPlayers);
    //const [ editStatus, setEdit ] = useState(false);
    const [ game, setGame ] = useState( localStorage.getItem('game') || 'standard');
    const [ winner, setWinner ] = useState( Number(localStorage.getItem('winner')) || 21);
    const [ twoPlayerScores, setTwoPlayerScores ] = useState(initScores);
    //const [ twoPlayerWinner, setTwoPlayerWinner ] = useState(null);
    const darts = (game !== 'darts') ? false : true;
    const dominos = (game !== 'dominos') ? false : true;
    const golf = (game !== 'golf') ? false : true;
    const cricketKey = (player, index) => `${player}Cricket${index}`;
    const golfKey = (player, index) => `${player}Golf${index}`;
    const dominoKey = (player, index) => `${player}Domino${index}`;
    //const dartsScores = ['-','/', 'X', 'O'];
    const dartScoring = [20,19,18,17,16,15,'B'];
    const golfScoring = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
    const golfPars = [4,3,3,5,4,4,3,3,5,5,4,5,4,5,4,4,4,5];
    const dominoScoring = [50,100,150,200];
    const [ gameStatus, setGameStatus ] = useState( localStorage.getItem('gameStatus') || 'inProgress');
    
    if (darts && winner !== 21) {
        localStorage.setItem('winner', 21);
        setWinner(Number(localStorage.getItem('winner')));
    }
    /*
    if (dominos && winner !== 200) {
        localStorage.setItem('winner', 200);
        setWinner(Number(localStorage.getItem('winner')));
    }
    */
    const getDartTotal = (player) => {
        let total = 0;
        const score = (index) => localStorage.getItem(cricketKey(player,index));
        const addToTotal = (value) => total = total + value;
        dartScoring.map((target,index) => addToTotal(Number(score(index))));
        console.log(`getDartTotalplayer=> ${player}: ${total}`)
        if (total === winner) localStorage.setItem('gameStatus', 'gameOver');
        return total;
    }
    const getGolfTotal = (player) => {
        if (!golf) return;
        let total = 0;
        const score = (index) => localStorage.getItem(golfKey(player,index));
        const addToTotal = (value) => total = total + value;
        golfScoring.map((target,index) => {
                console.log(`getGolfTotal=> ${golfKey(player,index)} ${index}: ${total}`)
                addToTotal(Number(score(index)))
            }
        );
        //console.log(`getGolfTotalplayer=> ${player}: ${total}`)
        return total;
    }
    const getDominoTotal = (player) => {
        let total = 0;
        const score = (index) => localStorage.getItem(dominoKey(player,index));
        const addToTotal = (value) => total = total + value;
        dominoScoring.map((target,index) => addToTotal(Number(score(index))));
        //console.log(`getDominoTotalplayer=> ${player}: ${total}`)
        if (total === winner) localStorage.setItem('gameStatus', 'gameOver');
        return total;
    }
    const updateTwoPlayerScores = (player, index, score) => {
        const newScores = [];
        players.map((player,index) => newScores.push(getDartTotal(player)));
        //console.log(`updateTwoPlayerScores=>\nplayer: ${player}\nindex: ${index}\nscore: ${score}\nnewScore: ${JSON.stringify(newScores)}`)
        //console.log(`${players[0]}: ${twoPlayerScores[0]}\n${players[1]}: ${twoPlayerScores[1]}`)
        //const isWinner = (score) => (score >= winner) ? true : false;
        //players.map((player, index) => (isWinner(newScores[index])) ? setTwoPlayerWinner(index) : setTwoPlayerWinner(3));
        localStorage.setItem('winner', twoPlayerScores);
        localStorage.setItem('twoPlayerScores', twoPlayerScores);
        setTwoPlayerScores(newScores);
    }
    //console.log(`players: ${players}`)
    const set21 = () => {
        if (darts) {
            localStorage.setItem('winner', 21);
            setWinner(Number(localStorage.getItem('winner')));
        }
    }
    const selectGame = (groupTitle, label, selected) => {
        localStorage.setItem('game', selected)
        localStorage.setItem('gameStatus', 'inProgress');
        setGame(localStorage.getItem('game'));
        set21();
    }
    const selectWinner = (groupTitle, label, selected) => {
        localStorage.setItem('winner', selected)
        localStorage.setItem('gameStatus', 'gameOver');
        setWinner(Number(localStorage.getItem('winner')));
    }
    const clear = (event) => {
        alert('Note was cleared: ' + event.value);
        localStorage.setItem('players', JSON.stringify(initPlayers));
        localStorage.setItem('gameStatus', 'inProgress');
        setPlayers(JSON.parse(localStorage.getItem('players')));
    }
    const reset = (event) => {
        //alert('Note was cleared: ');
        //const cricketKey = (player,index) => `${player}Cricket${index}`;
        //const golfKey = (player,index) => `${player}Golf${index}`;
        //const dominoKey = (player,index) => `${player}Domino${index}`;
        let id = (player,index) => (darts) ? cricketKey(player,index) : player;
        id = (player,index) => (dominos) ? dominoKey(player,index) : player;
        id = (player,index) => (golf) ? golfKey(player,index) : player;
        const initValue = 0;
        if (darts) {
            players.map((player) => dartScoring.map((target,index) => localStorage.setItem(id(player, index), initValue)));
        } else if (dominos) {
            //players.map((player) => dominoScoring.map((target,index) => localStorage.setItem(id(player, index), initValue)));
            players.map((player) => dominoScoring.map((target,index) => localStorage.setItem(dominoKey(player, index), initValue)));
        } else {
            players.map((player, index) => localStorage.setItem(id(player, index), initValue));
        }
        localStorage.setItem('gameStatus', 'inProgress');
        getScore();
    }
    const addPlayer = (event) => {
        //alert('Note was cleared: ' + value);
        const newPlayer = prompt('Enter new name', '');
        let newPlayers = players;
        newPlayers.push(newPlayer)
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem('players')));
        //getScore();
    }
    /*
    const edit = (event) => {
        setEdit(!editStatus);
    }
    */
    const editPlayer = (index) => {
        //console.log(`edit: ${index}`);
        const newPlayer = prompt('Enter new name', players[index]);
        let newPlayers = players;
        newPlayers[index] = newPlayer;
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem('players')));
        getScore();
    }
    const getScore = () => window.location.pathname = '/reactor/ScoreKeeper';
    const deletePlayer = (index) => {
        //console.log(`state: ${JSON.stringify(state,null,2)}`)
        //console.log(`delete at: ${index}`)
        let newPlayers = players;
        newPlayers.splice(index, 1);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem('players')));
        //getScore();
    }
    const scorecards = () => {
        //console.log(`build Scorecards`)
        const scorecard = (player, index, score) => {
            if (darts) {
                console.log(`${game} - scorecard => player:${player} index: ${index} score: ${score}`)
                return <CricketScore 
                        game={game} 
                        player={player} 
                        index={index} 
                        editPlayer={editPlayer} 
                        deletePlayer={deletePlayer}
                        updateTwoPlayerScores={updateTwoPlayerScores}
                        winner={winner}
                        key={getKey(player)}
                    />
            }
            if (dominos) {
                console.log(`${game} - scorecard => player:${player} index: ${index} score: ${score}`)
                return <Dominos 
                        game={game} 
                        player={player} 
                        index={index}
                        scoreTotal={score}
                        editPlayer={editPlayer} 
                        deletePlayer={deletePlayer}
                        getDominoTotal={getDominoTotal}
                        updateTwoPlayerScores={updateTwoPlayerScores}
                        winner={winner}
                        key={getKey(player)}
                    />
            }
            if (golf) {
                console.log(`${game} - scorecard => player:${player} index: ${index} score: ${score}`)
                return <ScoreCard 
                        game={game} 
                        player={golfPars[index]} 
                        index={index} 
                        editPlayer={editPlayer} 
                        deletePlayer={deletePlayer}
                        updateTwoPlayerScores={updateTwoPlayerScores}
                        winner={winner}
                        key={getKey(player)}
                    />
            }
            console.log(`${game} - scorecard => player:${player} index: ${index} score: ${score}`)
            return <ScoreCard 
                        game={game} 
                        player={player} 
                        index={index} 
                        editPlayer={editPlayer} 
                        deletePlayer={deletePlayer}
                        updateTwoPlayerScores={updateTwoPlayerScores}
                        winner={winner}
                        key={getKey(player)}
                    />
        }
        const renderedItems = players.map((player, index) => scorecard(player, index));

        const dartScores = dartScoring.map((score, index) => <div className='flexContainer width-100-percent' key={getKey(score)}>
                                                                    <div className='flex3Column p-5'>
                                                                        {scorecard(players[0], index)}
                                                                    </div>
                                                                    <div className='p-20 r-5 font50 color-yellow m-auto'>
                                                                        {score}
                                                                    </div>
                                                                    <div className='flex3Column p-5'>
                                                                        {scorecard(players[1], index)}
                                                                    </div>
                                                                </div>);
        
        const golfScores = golfScoring.map((hole, index) => <div className='flexContainer width-100-percent' key={getKey(hole)}>
                                                                <div className='flex3Column p-5'>
                                                                    {scorecard(golfPars[index], index)}
                                                                </div>
                                                                <div className='p-20 r-5 font50 color-yellow m-auto'>
                                                                    {hole}
                                                                </div>
                                                                <div className='flex3Column p-5'>
                                                                    {scorecard(golfPars[index], index)}
                                                                </div>
                                                            </div>);


        const dominoScores = dominoScoring.map((score, index) => <div className='flexContainer width-100-percent' key={getKey(score)}>
                                                                    <div className='flex2Column10Percent p-5'>
                                                                        {scorecard(players[0], index, score)}
                                                                    </div>
                                                                    <div className='p-20 r-5 font50 color-yellow m-auto'>
                                                                        {score}
                                                                    </div>
                                                                    <div className='flex2Column10Percent p-5'>
                                                                        {scorecard(players[1], index, score)}
                                                                    </div>
                                                                </div>);

        const setGameOver = (playerIndex) => {
            localStorage.setItem('gameStatus', 'gameOver');
            localStorage.setItem(`player${playerIndex}`, 'winner');
            //setGameStatus('gameOver');
            return true;
        }
        const setGameInProgress = (playerIndex) => {
            if (playerIndex>0) {
                if (localStorage.getItem(`player${playerIndex-1}`) !== 'winner') {
                    localStorage.setItem('gameStatus', 'inProgress')
                }
            }
            localStorage.setItem(`player${playerIndex}`, 'loser');
            //setGameStatus('inProgress');
            return false;
        }
        const isWinner = (playerIndex) => (getDartTotal(players[playerIndex]) >= winner) ? setGameOver(playerIndex) : setGameInProgress(playerIndex);
        const isDominoWinner = (playerIndex) => (getDominoTotal(players[playerIndex]) >= winner) ? setGameOver(playerIndex) : setGameInProgress(playerIndex);
    
        const dartClass = (playerIndex) => 'flex3Column p-20 size25 bold' + ((isWinner(playerIndex)) ? ' color-neogreen shakingShaka mt-20' : '');
        const dominoClass = (playerIndex) => 'flex3Column p-20 size25 bold' + ((isDominoWinner(playerIndex)) ? ' color-neogreen shakingShaka mt-20' : '');

        const dartScoreboard = <React.Fragment>
                                    <div className='flexContainer glassy width-100-percent mb-20 bg-green r-10'>
                                        <div className={dartClass(0)}>{players[0]}:<div className='color-yellow mt-10'>{getDartTotal(players[0])}</div></div>
                                        <div className='p-20 bg-yellow navBranding w-200'>vs</div>
                                        <div className={dartClass(1)}>{players[1]}:<div className='color-yellow mt-10'>{getDartTotal(players[1])}</div></div>
                                    </div>
                                    {dartScores}
                                </React.Fragment>
        
        const golfScoreboard = <React.Fragment>
                                    <div className='flexContainer glassy width-100-percent mb-20 bg-green r-10'>
                                        <div className={dartClass(0)}>{players[0]}:<div className='color-yellow mt-10'>{getGolfTotal(players[0])}</div></div>
                                        <div className='p-20 bg-yellow navBranding w-200'>vs</div>
                                        <div className={dartClass(1)}>{players[1]}:<div className='color-yellow mt-10'>{getGolfTotal(players[1])}</div></div>
                                    </div>
                                    {golfScores}
                                </React.Fragment>
        
        const dominoScoreboard = <React.Fragment>
                                    <div className='flexContainer glassy width-100-percent mb-20 bg-green r-10'>
                                        <div className={dominoClass(0)}>{players[0]}:<div className='color-yellow mt-10'>{getDominoTotal(players[0])}</div></div>
                                        <div className='p-20 bg-yellow navBranding w-200'>vs</div>
                                        <div className={dominoClass(1)}>{players[1]}:<div className='color-yellow mt-10'>{getDominoTotal(players[1])}</div></div>
                                    </div>
                                    {dominoScores}
                                </React.Fragment>
                    
        if (darts) return dartScoreboard
        if (dominos) return dominoScoreboard
        if (golf) return golfScoreboard
        else return renderedItems;
    }
    console.log(`localStorage => game: ${localStorage.getItem('game')}`)
    console.log(`localStorage => gameStatus: ${localStorage.getItem('gameStatus')}`)
    console.log(`localStorage => players: ${localStorage.getItem('players')}`)
    console.log(`localStorage => winner: ${localStorage.getItem('winner')}`)
    console.log(`localStorage => twoPlayerScores: ${localStorage.getItem('twoPlayerScores')}`)
    console.log(`localStorage => players: ${localStorage.getItem('players')}`)
    console.log(`localStorage => player1: ${localStorage.getItem('players1')}`)
    console.log(`localStorage => player2: ${localStorage.getItem('players2')}`)
    
    return (
        <div className='fadeIn mt--30'>
            <div className='mb-20'>
                <Selector 
                    groupTitle='game'  
                    label='item.description' 
                    items={games}
                    selected={game}
                    onChange={selectGame}
                    fontSize='25'
                    padding='10px'
                    width={(darts || dominos) ? '98%' : '65%'}
                />
                {
                    (darts || golf) 
                        ? <React.Fragment></React.Fragment> 
                        : <Selector 
                            groupTitle='winner'  
                            label='i.description' 
                            items={ (dominos) ? dominoWinners : winners }
                            selected={winner}
                            onChange={selectWinner}
                            fontSize='25'
                            padding='10px'
                            width='30%'
                        />
                }
            </div>
            {scorecards()}
            <div className='flexContainer width-100-percent'>
                <div className='flex3Column m-1'>
                    <div value='Submit' className='glassy button greet p-20 r-10 mt-20 width-100-percent bg-green brdr-green color-yellow' onClick={() => addPlayer()}>add player</div>  
                </div>
                <div className='flex3Column m-1'>
                    <div value='Submit' className='glassy button greet p-20 r-10 mt-20 mb-20 width-100-percent bg-yellow brdr-yellow color-black' onClick={() => reset()}>reset</div>
                </div>
                <div className='flex3Column m-1'>
                    <div value='Submit' className='glassy button greet p-20 r-10 mt-20 mb-20 width-100-percent bg-red brdr-red color-yellow' onClick={() => clear()}>clear</div>
                </div>
            </div>
        </div>
    );
}

export default ScoreKeeper;