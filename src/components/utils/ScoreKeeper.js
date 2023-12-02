import React, { useState, useEffect } from 'react';
import ScoreCard from './ScoreCard.js';
import CricketScore from './CricketScore.js';
import Dominos from './Dominos.js';
import SurfScores from './SurfScores.js';
import SurfingScores from './SurfingScores.js';
import Selector from '../forms/FunctionalSelector.js';
import getKey from '../utils/KeyGenerator.js';
import jerseyColors from './JerseyColors.js';
//import { getSurferIndexWithPriority, losePriority } from './SurfPriority.js';
import { newDate } from './Dates.js'
//import SurfScoringLogic from './SurfScoringLogic.js';
import { findTwoHighestIndices, getTwoHighestScores } from './HighScores.js';
import getAthleteScore from './GetAthleteScore.js';

const ScoreKeeper = () => {

    const getCurrentTime = () => {
        const currentTime = new Date().toLocaleString();
        return currentTime.split(', ')[1]
    }

    const surfScoring = ['', '', '', '', '', '', '', '', '', ''];
    const initHeatLog = [{
        date:"Nov 25 2023",
        time: "11:50:07 AM",
        length: "30",
        scores:[
            {
                name:"Titus Kaiman Santucci",
                surfScore:"17.00",
                surfScores:[9,8,,,,,,,,],
                surfJerseyColor: "1"
            },
            {
                name:"Johnny",
                surfScore:"7.00",
                surfScores:[7,,,,,,,,,],
                surfJerseyColor: "2"
            },
            {
                name:"Lukas",
                surfScore:"5.00",
                surfScores:[5,,,,,,,,,],
                surfJerseyColor: "3"
            }
        ]
    }];

    const initPlayers = [
        {
            name: 'You',
            score: 0,
            dominoScore: 0,
            golfScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            golfGIR: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            golfFW: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            golfPutts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            surfScore: 0,
            surfScores: ['', '', '', '', '', '', '', '', '', ''],
            surfJerseyColor: 0,
            surfPriority: 0,
            cricketScores: [0, 0, 0, 0, 0, 0, 0]
        },
        {
            name: 'Me',
            score: 0,
            surfScore: 0,
            dominoScore: 0,
            golfScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            golfGIR: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            golfFW: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            golfPutts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            surfScores: ['', '', '', '', '', '', '', '', '', ''],
            surfJerseyColor: 0,
            surfPriority: 0,
            cricketScores: [0, 0, 0, 0, 0, 0, 0]
        }
    ];
    const initNewPlayer = (name) => {
        const newPlayer = {
            name: name,
            score: 0,
            surfScore: 0,
            dominoScore: 0,
            golfScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            golfGIR: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            golfFW: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            golfPutts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            surfScores: ['', '', '', '', '', '', '', '', '', ''],
            surfJerseyColor: 0,
            surfPriority: 0,
            cricketScores: [0, 0, 0, 0, 0, 0, 0]
        }
        return newPlayer;
    };
    const games = ['standard', 'ping pong', 'golf', 'cornhole', 'darts', 'dominos', 'horse', 'horseshoes', 'bocci', 'surf'];
    const winners = [5, 10, 11, 15, 20, 21];
    const dominoWinners = [50, 100, 150, 200];
    const heatLengths = [.5, 1, 3, 15, 20, 30, 45, 60];
    const [players, setPlayers] = useState(JSON.parse(localStorage.getItem('players')) || initPlayers);
    const [game, setGame] = useState(localStorage.getItem('game') || 'standard');
    const initScores = [players[0][`${game}Score`], players[1][`${game}Score`]] || [0, 0];
    const [winner, setWinner] = useState(Number(localStorage.getItem('winner')) || 21);
    const [heatLength, setHeatLength] = useState(winner * 60);
    const [waveCount, setWaveCount] = useState(['', '', '', '', '', '', '', '', '', '']);
    const [surfersScores, setSurfersScores] = useState(JSON.parse(localStorage.getItem('surfersScores')) || [])
    const darts = (game !== 'darts') ? false : true;
    const dominos = (game !== 'dominos') ? false : true;
    const surf = (game !== 'surf') ? false : true;
    const golf = (game !== 'golf') ? false : true;
    const cricketKey = (player, index) => `${(player.player || player.name)}Cricket${index}`;
    const golfKey = (player, index) => `${(player.player || player.name)}Golf${index}`;
    const surfKey = (player, index) => `${(player.player || player.name)}Surf${index}`;
    const parsDefault = [4, 3, 3, 5, 4, 4, 3, 3, 5, 5, 4, 5, 4, 5, 4, 4, 4, 5];
    const dartScoring = [20, 19, 18, 17, 16, 15, '.B.'];
    const golfScoring = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const [golfPars, setGolfPars] = useState(JSON.parse(localStorage.getItem('golfPars')) || parsDefault);
    const dominoScoring = [50, 100, 150, 200];
    const [gameStatus, setGameStatus] = useState(localStorage.getItem('gameStatus') || 'inProgress');
    const [showButtons, setShowButtons] = useState(false);
    const [heatLog, setHeatLog] = useState(JSON.parse(localStorage.getItem('heatLog'))|| initHeatLog);
    const [startTime, setStartTime] = useState(getCurrentTime())
    
    useEffect(() => {
        if (JSON.stringify(players, null, 2) !== '[]') {
            const surfersScores = [];
            localStorage.setItem('surfersScores', JSON.stringify(surfersScores))
            localStorage.setItem('players', JSON.stringify(players));
            setShowButtons(false)
        }
    }, [players]);
    useEffect(() => {
        //localStorage.setItem(`${game}Winner`, winner)

        localStorage.setItem('game', game)
        localStorage.setItem('gameStatus', 'inProgress');
        //localStorage.setItem(`${game}Winner`, selected)
        let newWinner = localStorage.getItem(`${game}Winner`);
        if (newWinner == null) {
            if (game == 'darts') {
                newWinner = 21;
            } else if (game == 'golf') {
                newWinner = 3000;
            } else if (game == 'surf') {
                newWinner = 15;
            } else if (game == 'dominos') {
                newWinner = 200;
            } else {
                newWinner = 21;
            }
            localStorage.setItem(`${game}Winner`, newWinner);
        }
        if (game == 'golf') {
            newWinner = 3000;
            localStorage.setItem(`${game}Winner`, newWinner);
        }
        setWinner(newWinner);
        if (game == 'surf') {
            setHeatLength(winner);
        }
    }, [game]);
    useEffect(() => {
        localStorage.setItem(`${game}Winner`, winner);
        if (game == 'surf') {
            setHeatLength(winner);
        }
    }, [winner]);
    useEffect(() => {
        localStorage.setItem('heatLog', JSON.stringify(heatLog));
    }, [heatLog]);

    useEffect(() => {
        localStorage.setItem('golfPars', JSON.stringify(golfPars));
    }, [golfPars]);

    useEffect(() => {
        //alert(localStorage.getItem('players'));
        if (!localStorage.getItem('players') || (localStorage.getItem('players') === '[]')) {
            //const playersValue = localStorage.getItem('players');
            //alert(`localStorage.players: ${playersValue}`)
            //alert('Length:', playersValue.length);
            newPlayer();
        }
        if (heatLog == null) {
            localStorage.setItem('heatLog', JSON.stringify(initHeatLog));
            setHeatLog(initHeatLog);
        }
        const newPlayers = [...players];
        if (!players[0].cricketScores || !players[1].cricketScores) {
            if (!players[0].cricketScores) {
                newPlayers[0].cricketScores = [0, 0, 0, 0, 0, 0, 0];
                newPlayers[0].dartsScore = 0;
            }
            if (!players[1].cricketScores) {
                newPlayers[1].cricketScores = [0, 0, 0, 0, 0, 0, 0];
                newPlayers[1].dartsScore = 0;
            }
        }
        const initGolfStats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        if (!players[0].golfPutts || !players[0].golfFW || !players[0].golfGIR) {
            newPlayers[0].golfPutts = golfScoring;
            newPlayers[0].golfFW = initGolfStats;
            newPlayers[0].golfGIR = initGolfStats;
        }
        if (!players[1].golfPutts || !players[1].golfFW || !players[1].golfGIR) {
            newPlayers[1].golfPutts = golfScoring;
            newPlayers[1].golfFW = initGolfStats;
            newPlayers[1].golfGIR = initGolfStats;
        }
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem('players')));
    }, []);

    const setGameInProgress = (playerIndex) => {
        if (playerIndex > 0) {
            if (localStorage.getItem(`player${playerIndex - 1}`) !== 'winner') {
                localStorage.setItem('gameStatus', 'inProgress')
            }
        }
        localStorage.setItem(`player${playerIndex}`, 'loser');
        return false;
    }
    const isWinner = (playerIndex) => (getDartTotal(players[playerIndex]) >= winner) ? setGameOver(playerIndex) : setGameInProgress(playerIndex);
    const playerScores = [
        { name: 'Player 1', scores: [90, 85, 92, 78, 95, 87, 84, 89, 91, 88] },
        { name: 'Player 2', scores: [75, 82, 80, 79, 88, 84, 76, 85, 90, 81] },
        { name: 'Player 3', scores: [86, 82, 90, 88, 91, 79, 85, 87, 83, 89] },
    ];
    const setGameOver = (playerIndex) => {
        localStorage.setItem('gameStatus', 'gameOver');
        localStorage.setItem(`player${playerIndex}`, 'winner');
        return true;
    }

    if (darts && winner !== 21) {
        localStorage.setItem('winner', 21);
        setWinner(Number(localStorage.getItem('winner')));
    }
    const getDartTotal = (player) => {
        const cricketScores = String(player.cricketScores).split(',');
        let total = 0;
        const addToTotal = (value) => total = total + value;
        cricketScores.map((score, index) => addToTotal(Number(score)));
        if (total === winner) localStorage.setItem('gameStatus', 'gameOver');
        return total;
    }
    const getGolfTotal = (player) => {
        if (!golf) return;
        let total = 0;
        const newPlayers = JSON.parse(localStorage.getItem('players'));
        const addToTotal = (value) => total = total + Number(value);
        newPlayers.map((player) => {
            player.golfScores.map((score) => addToTotal(score))
            player.golfScore = total;
        });
        localStorage.setItem('players', JSON.stringify(newPlayers));
        return total;
    }
    const getDominoTotal = (index) => {
        const newScores = [players[0].dominoScore, players[1].dominoScore] || [0, 0];
        const total = newScores[index];
        console.log(`getDominoTotal => player: ${players[index].name}: ${total} ? winner: ${winner}`)
        if (total === winner) localStorage.setItem('gameStatus', 'gameOver');
        return total;
    }

    const updateScores = () => {
        const newPlayers = JSON.parse(localStorage.getItem('players'));
        setPlayers(newPlayers);
    }
    const set21 = () => {
        if (darts) {
            localStorage.setItem('winner', 21);
            setWinner(Number(localStorage.getItem('winner')));
        }
    }
    const selectGame = (groupTitle, label, selected) => {
        setGame(selected);
        set21();
        getScore();
    }
    const selectWinner = (groupTitle, label, selected) => {
        setWinner(selected);
        getScore();
    }
    const clear = (event) => {
        //alert('Note was cleared: ' + event.value);
        localStorage.setItem('players', JSON.stringify(initPlayers));
        console.log(`localStorage.getItem('players') => ${localStorage.getItem('players')}`)
        localStorage.setItem('gameStatus', 'inProgress');
        setPlayers(JSON.parse(localStorage.getItem('players')));
    }
    const recordHeatScores = () => {
        const currentPlayers = JSON.parse(localStorage.getItem('players'));
        const heatData = currentPlayers.map((player, index) => {
            //console.log(`recordHeatScores=> name: ${player.name} score: ${player.surfScore}`);
            return {
                name: player.name,
                surfScore: player.surfScore,
                surfScores: player.surfScores,
                surfJerseyColor: player.surfJerseyColor
            }
        });
        console.log(`recordHeatScores => heatData: ${JSON.stringify(heatData,null,2)}`);
        const newHeatLog = [...heatLog];
        newHeatLog.push({
            date: newDate(),
            time: startTime,
            length: heatLength,
            scores: heatData
        });
        localStorage.setItem('heatLog', JSON.stringify(heatLog));
        setHeatLog(newHeatLog);
    }
    const deleteHeat = (i) => {
        const newHeatLog = [...heatLog];
        newHeatLog.splice(i, 1);
        setHeatLog(newHeatLog);
    }
    const displayHeatLog = () => {
        console.log(`initHeatLog: ${JSON.stringify(initHeatLog,null,2)}`)
        console.log(`heatLog: ${heatLog}`)
        //localStorage.setItem('heatLog', JSON.stringify(initHeatLog));
        //const heatLog = JSON.parse(localStorage.getItem('heatLog'));
        const log = () => heatLog.map((heat, index) => <div className='relative size15 p-10 bg-tinted color-lite r-10 ml-10 mr-10 mt-10 mb-15'>
                    <div className='absolute w-50 rt-10 t-10 r-5 color-dkRed bg-red brdr-red p-5 m-5 button bold' onClick={() => deleteHeat(index)}>X</div>
                    <div className='m-10 size25 bold'>{heat.date}</div>
                    <div className='m-5'>{heat.time} - {heat.length}min</div>
                    <div className='flexContainer width-100-percent'>
                        {heat.scores.map((player, index) => <div className='flexContainer width-100-percent'>
                                    {getAthleteScore(heat.scores, index)}
                                </div>
                        )}
                    </div>
                </div>
        )
        return <div>
            <div className='size15 bold p-10 bg-darker ml-10 mr-10 mt-10 mb--5 r-10'>Recorded Heats</div>
            <div className='scroll'>{log()}</div>
        </div>
    }

    const reset = (event) => {
        let newPlayers = JSON.parse(localStorage.getItem('players'));
        const getDominoKey = (player, index) => `${player.name}Domino${index}`;

        const id = (player, index) => {
            if (darts) {
                return cricketKey(player, index);
            } else if (dominos) {
                return getDominoKey(player, index);
            } else if (golf) {
                return golfKey(player, index);
            } else if (surf) {
                return surfKey(player, index);
            }
            return (player.player || player.name);
        }

        const initValue = 0;
        if (darts) {
            newPlayers.map((player) => {
                player.dartsScore = 0;
                player.cricketScores = [0, 0, 0, 0, 0, 0, 0];
            });
        } else if (golf) {
            newPlayers.map((player) => {
                player.golfScore = 0;
                player.golfScores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                player.golfGIR = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
                player.golfFW = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
                player.golfPutts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            });
        } else if (dominos) {
            newPlayers[0].dominoScore = 0;
            newPlayers[1].dominoScore = 0;
        } else if (surf) {
            recordHeatScores();
            newPlayers.map((player, index) => {
                player.surfScores = surfScoring;
                player.surfScore = 0;
                player.surfPriority = 0;
            });
            const sortedPlayers = [...newPlayers];
            sortedPlayers.sort((a, b) => getSurfTotal(b) - getSurfTotal(a));
            newPlayers = [...sortedPlayers];
        } else {
            newPlayers.map((player, index) => newPlayers[index][`${game}Score`] = initValue);
        }
        localStorage.setItem('gameStatus', 'inProgress');
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(JSON.parse(localStorage.getItem('players')));
        getScore();
    }
    const newPlayer = () => {
        const newPlayer = prompt('Enter new name', '');
        const initializedNewPlayer = initNewPlayer(newPlayer);
        let newPlayers = [...players];
        if (newPlayer !== null) {
            newPlayers.push(initializedNewPlayer);
            localStorage.setItem('players', JSON.stringify(newPlayers));
            console.log(`localStorage.getItem('players') => ${localStorage.getItem('players')}`)
            setPlayers(JSON.parse(localStorage.getItem('players')));
        }
    }
    const addPlayer = (event) => {
        newPlayer();
    }
    const editPlayer = (index) => {
        const newPlayer = prompt('Enter new name', players[index].name);
        if (newPlayer !== null) {
            let newPlayers = [...players];
            newPlayers[index].name = newPlayer;
            localStorage.setItem('players', JSON.stringify(newPlayers));
            //console.log(`localStorage.getItem('players') => ${localStorage.getItem('players')}`)
            setPlayers(JSON.parse(localStorage.getItem('players')));
        }
    }
    const getScore = () => window.location.pathname = '/reactor/ScoreKeeper';

    const deletePlayer = (index) => {
        console.log(`deletePlayer => ${index}`)
        const newPlayers = [...players].slice();
        newPlayers.splice(index, 1);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        console.log(`localStorage.getItem('players') => ${localStorage.getItem('players')}`)
        setPlayers(JSON.parse(localStorage.getItem('players')));
    };
    /*
    const getSurferIndexWithPriority = (priorityIndex) => {
        for (let i = 0; i < players.length; i++) {
            if (Number(players[i].surfPriority) === priorityIndex) {
                return i;
            }
        }
        return null;
    }
    const losePriority = (selectedPriority) => {
        const newPlayers = [...players];
        newPlayers.map((player, index) => {
            if (player.surfPriority == selectedPriority) {
                player.surfPriority = newPlayers.length;
            } else if (player.surfPriority != 1 && selectedPriority != newPlayers.length) {
                const shift = player.surfPriority - 1;
                player.surfPriority = (shift > 0) ? shift : newPlayers.length;
            }
        });
        localStorage.setItem('players', JSON.stringify(newPlayers, null, 2));
        setPlayers(newPlayers);
    }
    const shiftPriority = (priorityIndex) => {
        const newPlayers = [...players];
        newPlayers.map((player, index) => {
            if (player.surfPriority === (priorityIndex - 1)) {
                player.surfPriority = priorityIndex;
            } else if (player.surfPriority === priorityIndex) {
                player.surfPriority = (priorityIndex - 1);
            }
        });
        localStorage.setItem('players', JSON.stringify(newPlayers, null, 2));
        setPlayers(newPlayers);
    }
    */
    const resetSurfersScores = (playerId) => {
        const newPlayers = [...players];
        newPlayers[playerId].surfScore = 0;
        newPlayers[playerId].surfScores = surfScoring;
        setPlayers(newPlayers);
        getScore();
    }
    const deleteAthlete = (playerId) => {
        const newPlayers = [...players];
        newPlayers.splice(playerId, 1);
        setPlayers(newPlayers);
    }
    const getJerseyColorSelector = (playerId, color, index) => <button className={`bg-${color} ht-45 width50px button r-10`} onClick={() => selectJersey(playerId, index)}></button>;
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
    const isTieScore = (index) => {
        const score = scoreTotal(index, players);
        if (index !== 0) {
            if (score === scoreTotal(index - 1, players)) {
                return true;
            }
        }
        return false;
    }
    const getHeatTotals = () => <div>
                {players.map((player, index) => <div>{surferTotals(player, index)}</div>)}
            </div>
    const place = (index) => (isTieScore(index) && (index !== 0)) ? index : (index + 1);
    const placeSuffix = (index) => rank[(isTieScore(index) && (index !== 0)) ? (index-1) : (index > 2) ? 3 : (index)];
    const position = (index) => `${place} ${placeSuffix}`;
    const surferTotals = (player, index) => <div>{position(index)} {players[index].name} {players[index].surfScore} {rankStatus(player, index)}</div>;
    const rank = ['st', 'nd', 'rd', 'th'];
    const rankStatus = (player, index) => {
        const score = getSurfTotal(player);
        const scoreDifference = Number(players[(index === 0) ? 0 : (index - 1)].surfScore - players[(index === 0) ? 1 : (index)].surfScore);
        const difference = (scoreDifference < 0) ? (-1 * scoreDifference) : scoreDifference;
        const winningScore = Number(players[(index === 0) ? 0 : ((index < 3) ? (index - 1) : 1)].surfScore);
        const highestScoresIndices = findTwoHighestIndices(players[index].surfScores);
        const losersHeighestScore = players[index].surfScores[highestScoresIndices[0]];
        const need = (winningScore - losersHeighestScore) + .01;
        const winsBy = `Wins by ${difference.toFixed(2)}`;
        const needs = `Needs ${need.toFixed(2)}`;
        if (index === 0) {
            return winsBy;
        }
        return needs;
    }
    const getScoreTotal = (index) => {
        const highestScore = players[index].surfScores[getTwoHighestScores(players, index).highScoreIndex]
        const secondHighestScore = players[index].surfScores[getTwoHighestScores(players, index).secondHighScoreIndex]
        const score = (highestScore + secondHighestScore);
        return score;
    }
    const highestScore = (index, playersArray) => {
        return playersArray[index].surfScores[getTwoHighestScores(playersArray, index).highScoreIndex];
    }
    const secondHighestScore = (index, playersArray) => playersArray[index].surfScores[getTwoHighestScores(players, index).secondHighScoreIndex];
    const scoreTotal = (index, playersArray) => Number(highestScore(index, playersArray) + secondHighestScore(index, playersArray)).toFixed(2);

    const selectJersey = (playerId, selection) => {
        const newPlayers = [...players];
        newPlayers[playerId].surfJerseyColor = (selection);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(newPlayers);
    }
    const setNewStartTime = () => {
        setStartTime(getCurrentTime());
    };
    const scorecards = () => {
        const scorecard = (playerIndex, scoreIndex, score) => {
            const player = players[playerIndex];
            if (darts) {
                console.log(`${game} - scorecard => player: ${(player.player || player.name)} scoreIndex: ${scoreIndex} score(${scoreIndex}): ${player.score}`)
                return <CricketScore
                    game={game}
                    player={player}
                    playerIndex={playerIndex}
                    scoreIndex={scoreIndex}
                    editPlayer={editPlayer}
                    deletePlayer={deletePlayer}
                    updateScores={updateScores}
                    winner={winner}
                    key={getKey((player.player || player.name))}
                />
            }
            if (dominos) {
                console.log(`${game} - scorecard => player: ${(player.player || player.name)} playerIndex: ${playerIndex} scoreIndex: ${scoreIndex} scoreIndex: ${player.dominoScore} score: ${score}`)
                return <Dominos
                    game={game}
                    player={player}
                    playerIndex={playerIndex}
                    scoreIndex={scoreIndex}
                    scoreTotal={player.dominoScore || 0}
                    treeTotal={score}
                    editPlayer={editPlayer}
                    deletePlayer={deletePlayer}
                    getDominoTotal={getDominoTotal}
                    updateScores={updateScores}
                    winner={winner}
                    key={getKey((player.player || player.name))}
                />
            }
            if (golf) {
                console.log(`${game} - scorecard => player:${player.player || player.name}`);
                console.log(`scoreIndex: ${scoreIndex}`);
                console.log(`score: ${player.golfScores[scoreIndex]}`);
                console.log(`scorecards => par: ${score}`);
                return <ScoreCard
                    game={game}
                    players={players}
                    playerIndex={playerIndex}
                    scoreIndex={scoreIndex}
                    editPlayer={editPlayer}
                    deletePlayer={deletePlayer}
                    updateScores={updateScores}
                    winner={golfPars[scoreIndex]}
                />
            }
            return <ScoreCard
                game={game}
                players={players}
                playerIndex={playerIndex}
                scoreIndex={scoreIndex}
                editPlayer={editPlayer}
                deletePlayer={deletePlayer}
                updateScores={updateScores}
                winner={winner}
            />
        }
        /////////////////////////////////
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
        const getSurfScore = (index) => {
            const newPlayers = [...players];
            const surfScore = scoreTotal(index, newPlayers);

            newPlayers[index].score = surfScore;
            newPlayers[index].surfScore = surfScore;
            localStorage.setItem('players', JSON.stringify(newPlayers));
            return surfScore;
        };
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
        const surferScores = (player, index) => <div className='button' key={getKey(`${index}${(player.player || player.name)}`)}>
            <div className={`flexContainer ht-50 r-10 ml-10 mr-10 mb--10 color-dark text-outline-light bg-${jerseyColors[Number(players[index].surfJerseyColor)] || jerseyColors[0]}`} key={getKey(`${index}${(player.player || player.name)}`)}>
                <div className={`flex2Column contentLeft r-10-lft m-0 w-75 p-10`}>
                    <div className='bold'>
                        <span className='size25 mt--10'>
                            {place(index)}
                        </span>
                        <span className='size15 mt--10'>
                            {placeSuffix(index)}
                        </span>
                    </div>
                    <div className='bold' onClick={()=>setShowButtons((showButtons!==false)?false:index)}>
                        <div className='size30 mt-5 mb-5'>
                            {(player.player || player.name).split(' ')[0]}
                        </div>
                        <div className='size20'>
                            {(player.name.indexOf(' ') !== -1)?player.name.substring(player.name.indexOf(' ') + 1):null}
                        </div>
                    </div>
                </div>
                <div className={`r-10-rt flex2Column contentRight m-0 mr-10 pb-10 pl-10 pr-10 pt-15`}>
                    <div className='size40 bold'>{getScoreTotal(index)}</div>
                    <div className='mt-10 bold'>{rankStatus(player, index)}</div>
                </div>
            </div>
            <div>
                {showButtons === index && (
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

        /////////////////////////////////
        const surfingScores = (player, index) => {
            return surferScores(player, index);
            /*if (players != undefined && index != undefined && player != undefined) {
                return <SurfingScores
                    players={players}
                    player={player}
                    index={index}
                    surfScoring={surfScoring}
                    setPlayers={setPlayers}
                    key={getKey(index)}
                >
                </SurfingScores>
            } 
            */
        }

        const renderedItems = () => players.map((player, index) => scorecard(index, 0, 0));

        const dartScores = () => dartScoring.map((score, index) => <div className='flexContainer width-100-percent' key={getKey(score)}>
            <div className='flex3Column'>
                {scorecard(0, index, 0)}
            </div>
            <div className='ml-10 bg-tinted p-15 r-10 mb-1 font50 color-yellow flex3Column20Percent'>
                {score}
            </div>
            <div className='flex3Column ml-10'>
                {scorecard(1, index, 0)}
            </div>
        </div>);

        const editGolfPar = (hole) => {
            const newPars = [...golfPars];
            const newPar = prompt(`Enter par for hole ${hole}:`, golfPars[hole]);
            newPars[hole] = newPar;
            setGolfPars(newPars);
        }

        const golfScores = () => golfScoring.map((hole, index) => <div key={getKey(hole)}>
            <div className='contentCenter bg-darker r-10 m-5 mt-35'>
                <div>
                    <span className='copyright greet color-yellow'>
                        Hole:
                    </span>
                    <span className='size40 bold pt-5 pl-15 pr-15 bg-darker r-10'>
                        {index + 1}
                    </span>
                    <span className='copyright greet color-yellow'>
                        Par:
                    </span>
                    <span className='size20 bold color-lite mt--5'>
                        {golfPars[index]}
                    </span>
                </div>
                <div className='flexContainer'>
                    <div className='flex2Column p-5'>
                        {scorecard(0, index, golfPars[index])}
                    </div>
                    <div className='flex2Column p-5'>
                        {scorecard(1, index, golfPars[index])}
                    </div>
                </div>
            </div>
        </div>);

        const surfingScoreboard = () => players.map((player, index) => surfingScores(player, index));

        const dominoScores = () => dominoScoring.map((score, index) => <div className='flexContainer width-100-percent' key={getKey(score)}>
            <div className='flex2Column10Percent contentCenter p-5'>
                {scorecard(0, index, score)}
            </div>
            <div className='r-5 font50 color-yellow m-auto w-100'>
                {score}
            </div>
            <div className='flex2Column10Percent contentCenter p-5'>
                {scorecard(1, index, score)}
            </div>
        </div>);

        const isDominoWinner = (playerIndex) => (getDominoTotal(playerIndex) >= winner) ? setGameOver(playerIndex) : setGameInProgress(playerIndex);

        const dartClass = (playerIndex) => 'r-10 color-yellow flex3Column p-20 size25 bold bg-veryLite' + ((isWinner(playerIndex)) ? ' color-neogreen shakingShaka mt-20' : '');
        const dominoClass = (playerIndex) => 'color-yellow flex3Column p-20 size25 bold' + ((isDominoWinner(playerIndex)) ? ' color-neogreen shakingShaka mt-20' : '');

        const dartScoreboard = () => <div className='bg-tinted p-10 m-5 r-10'>
            <div className='flexContainer glassy mb-10 bg-veryLite r-10'>
                <div className={dartClass(0)}>
                    {players[0].player || players[0].name}:
                    <div className='mt-10 size40 white pt-10'>
                        {getDartTotal(players[0])}
                    </div>
                </div>
                <div className='p-20 bg-tinted navBranding w-200 color-yellow'>
                    vs
                </div>
                <div className={dartClass(1)}>
                    {players[1].player || players[1].name}:
                    <div className='mt-10 size40 white pt-10'>
                        {getDartTotal(players[1])}
                    </div>
                </div>
            </div>
            {dartScores()}
        </div>

        const golfScoreboard = () => <div className='bg-tinted p-10 m-5 r-10'>
            <div className='flexContainer glassy m-5 mb-20 bg-veryLite r-10'>
                <div className={dartClass(0)}>
                    {players[0].player || players[0].name}:<div className='mt-10 size40 white'>{players[0].golfScore}</div>
                </div>
                <div className='p-20 bg-tinted navBranding w-200 color-yellow'>vs</div>
                <div className={dartClass(1)}>
                    {players[1].player || players[1].name}:<div className='mt-10  size40 white'>{players[1].golfScore}</div>
                </div>
            </div>
            <div className='scrollHeight500'>
                {golfScores()}
            </div>
        </div>

        const dominoScoreboard = () => <div className='bg-tinted p-10 m-5 r-10'>
            <div className='flexContainer glassy ml-5 mr-5 mb-10 bg-veryLite r-10'>
                <div className={dominoClass(0)}>
                    {players[0].player || players[0].name}:
                    <div className='mt-10 size40 white'>
                        {getDominoTotal(0)}
                    </div>
                </div>
                <div className='p-20 bg-tinted navBranding w-200 color-yellow'>vs</div>
                <div className={dominoClass(1)}>
                    {players[1].player || players[1].name}:
                    <div className='mt-10 size40 white'>
                        {getDominoTotal(1)}
                    </div>
                </div>
            </div>
            {dominoScores()}
        </div>
            
        if (darts) return dartScoreboard()
        if (dominos) return dominoScoreboard()
        if (golf) return golfScoreboard()
        //if (surf) return surfScoreboard
        if (surf) return surfingScoreboard()
        else return renderedItems();
    }

    return (
        <div className='fadeIn mt--30 mb-55 pb-50'>
            <div className='mb-10'>
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
                        : <Selector className='fl-left'
                            groupTitle='winner'
                            label='i.description'
                            items={(dominos) ? dominoWinners : ((surf) ? heatLengths : winners)}
                            selected={winner}
                            onChange={selectWinner}
                            fontSize='25'
                            padding='10px'
                            width='30%'
                        />
                }
                {(surf) ?
                    <SurfScores
                        players={players}
                        setPlayers={setPlayers}
                        heatLength={winner}
                        isWinner={isWinner}
                        editPlayer={editPlayer} 
                        deletePlayer={deletePlayer}
                        setGameStatus={setGameStatus}
                        setStartTime={setNewStartTime}
                    ></SurfScores>
                    :
                    <React.Fragment></React.Fragment>

                }
            </div>
            <div className='scrollHeight550'>
                {scorecards()}
            </div>
            {(surf)?displayHeatLog():null}
            <div className='flexContainer width-100-percent bt-0'>
                <div className='flex3Column m-1'>
                    <div value='Submit' className='glassy button greet p-20 r-10 mb-5 width-100-percent bg-green brdr-green color-yellow' onClick={() => addPlayer()}>add player</div>
                </div>
                <div className='flex3Column m-1'>
                    <div value='Submit' className='glassy button greet p-20 r-10 mb-5 width-100-percent bg-yellow brdr-yellow color-black' onClick={() => reset()}>reset</div>
                </div>
                <div className='flex3Column m-1'>
                    <div value='Submit' className='glassy button greet p-20 r-10 mb-5 width-100-percent bg-red brdr-red color-yellow' onClick={() => clear()}>clear</div>
                </div>
            </div>
        </div>
    );
}

export default ScoreKeeper;