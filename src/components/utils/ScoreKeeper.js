import React, { useState } from 'react';
import ScoreCard from './ScoreCard.js';
import CricketScore from './CricketScore.js';
import Selector from '../forms/FunctionalSelector.js';
import getKey from '../utils/KeyGenerator.js';

const ScoreKeeper = () => {
    
    const initPlayers = [];
    const initScores = localStorage.getItem('twoPlayerScores') || [0,0];
    const games = ["standard", "ping pong", "golf", "cornhole", "darts", "horse", "horseshoes", "bocci"];
    const winners = [5, 10, 11, 15, 20, 21];
    const [ players, setPlayers ] = useState(JSON.parse(localStorage.getItem("players")) || initPlayers);
    //const [ editStatus, setEdit ] = useState(false);
    const [ game, setGame ] = useState( localStorage.getItem("game") || "standard");
    const [ winner, setWinner ] = useState( Number(localStorage.getItem("winner")) || 21);
    const [ twoPlayerScores, setTwoPlayerScores ] = useState(initScores);
    //const [ twoPlayerWinner, setTwoPlayerWinner ] = useState(null);
    const darts = (game !== 'darts') ? false : true;
    const cricketKey = (player, index) => `${player}Cricket${index}`;
    //const dartsScores = ['-','/', 'X', 'O'];
    const dartScoring = [20,19,18,17,16,15,"B"];
    if (darts && winner !== 21) {
        localStorage.setItem("winner", 21);
        setWinner(Number(localStorage.getItem("winner")));
    }
    const getDartTotal = (player) => {
        let total = 0;
        const score = (index) => localStorage.getItem(cricketKey(player,index));
        const addToTotal = (value) => total = total + value;
        dartScoring.map((target,index) => addToTotal(Number(score(index))));
        //console.log(`getDartTotalplayer=> ${player}: ${total}`)
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
            localStorage.setItem("winner", 21);
            setWinner(Number(localStorage.getItem("winner")));
        }
    }
    const selectGame = (groupTitle, label, selected) => {
        localStorage.setItem("game", selected)
        setGame(localStorage.getItem("game"));
        set21();
    }
    const selectWinner = (groupTitle, label, selected) => {
        localStorage.setItem("winner", selected)
        setWinner(Number(localStorage.getItem("winner")));
    }
    const clear = (event) => {
        //alert('Note was cleared: ' + value);
        localStorage.setItem("players", JSON.stringify(initPlayers));
        setPlayers(JSON.parse(localStorage.getItem("players")));
    }
    const reset = (event) => {
        //alert('Note was cleared: ' + value);
        const cricketKey = (player,index) => `${player}Cricket${index}`;
        const id = (player,index) => (darts) ? cricketKey(player,index) : player;
        const initValue = 0;
        if (darts) {
            players.map((player) => dartScoring.map((target,index) => localStorage.setItem(id(player, index), initValue)));
        } else {
            players.map((player, index) => localStorage.setItem(id(player, index), initValue));
        }
        getScore();
    }
    const addPlayer = (event) => {
        //alert('Note was cleared: ' + value);
        const newPlayer = prompt("Enter new name", "");
        let newPlayers = players;
        newPlayers.push(newPlayer)
        localStorage.setItem("players", JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem("players")));
        //getScore();
    }
    /*
    const edit = (event) => {
        setEdit(!editStatus);
    }
    */
    const editPlayer = (index) => {
        //console.log(`edit: ${index}`);
        const newPlayer = prompt("Enter new name", players[index]);
        let newPlayers = players;
        newPlayers[index] = newPlayer;
        localStorage.setItem("players", JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem("players")));
        getScore();
    }
    const getScore = () => window.location.pathname = "/reactor/ScoreKeeper";
    const deletePlayer = (index) => {
        //console.log(`state: ${JSON.stringify(state,null,2)}`)
        //console.log(`delete at: ${index}`)
        let newPlayers = players;
        newPlayers.splice(index, 1);
        localStorage.setItem("players", JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem("players")));
        //getScore();
    }
    const scorecards = () => {
        //console.log(`build Scorecards`)
        const scorecard = (player, index) => {
            if (darts) {
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
        const getWinner = (playerIndex) => (getDartTotal(players[playerIndex]) >= winner) ? ' color-neogreen shakingShaka mt-20' : '';
        const dartClass = (playerIndex) => 'flex3Column p-20 size25 bold' + getWinner(playerIndex);
        const dartScoreboard = <div>
                        <div className='flexContainer width-100-percent mb-20 bg-green r-10'>
                            <div className={dartClass(0)}>{players[0]}:<div className="color-yellow mt-10">{getDartTotal(players[0])}</div></div>
                            <div className='p-20 bg-yellow navBranding w-200'>vs</div>
                            <div className={dartClass(1)}>{players[1]}:<div className="color-yellow mt-10">{getDartTotal(players[1])}</div></div>
                        </div>
                        {dartScores}
                    </div>
                    
        if (darts) return dartScoreboard
        else return renderedItems;
    }
    return (
        <div className="fadeIn mt--30">
            <div className="mb-20">
                <Selector 
                    groupTitle="game"  
                    label="item.description" 
                    items={games}
                    selected={game}
                    onChange={selectGame}
                    fontSize='25'
                    padding='10px'
                    width={(darts) ? '98%' : '65%'}
                />
                {
                    (darts) ? <div></div> : <Selector 
                                                groupTitle="winner"  
                                                label="i.description" 
                                                items={winners}
                                                selected={winner}
                                                onChange={selectWinner}
                                                fontSize='25'
                                                padding='10px'
                                                width='30%'
                                            />
                }
            </div>
            {scorecards()}
            <div className="flexContainer width-100-percent">
                <div className="flex3Column m-1">
                    <div value="Submit" className="glassy button greet p-20 r-10 mt-20 width-100-percent bg-green brdr-green color-yellow" onClick={() => addPlayer()}>add player</div>  
                </div>
                <div className="flex3Column m-1">
                    <div value="Submit" className="glassy button greet p-20 r-10 mt-20 mb-20 width-100-percent bg-yellow brdr-yellow color-black" onClick={() => reset()}>reset</div>
                </div>
                <div className="flex3Column m-1">
                    <div value="Submit" className="glassy button greet p-20 r-10 mt-20 mb-20 width-100-percent bg-red brdr-red color-yellow" onClick={() => clear()}>clear</div>
                </div>
            </div>
        </div>
    );
}

export default ScoreKeeper;