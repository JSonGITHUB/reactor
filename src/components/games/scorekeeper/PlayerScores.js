import React, { useState, useEffect, useContext } from 'react';
import ScoreCard from './ScoreCard';
import CricketScore from './CricketScore';
import Dominos from './Dominos';
import SurfScores from './SurfScores';
import Selector from '../../forms/FunctionalSelector';
import getKey from '../../utils/KeyGenerator';
import jerseyColors from './JerseyColors';
import { newDate } from '../../utils/Dates';
import { findTwoHighestIndices, getTwoHighestScores } from './HighScores';
import GetAthleteScore from './GetAthleteScore';
import initHeatLog from './initHeatLog';
import getCurrentTime from '../../utils/getCurrentTime';
import { initNewPlayer, initPlayers } from './PlayerInit';
import surfScoring from './SurfScoring';
import { games, gameIcons } from './games';
import dominoWinners from './dominoWinners';
import heatLengths from './heatLengths';
import dartScoring from './dartScoring';
import golfScoring from './golfScoring';
import dominoScoring from './dominoScoring';
import getWinner from './getWinner';
import GolfScoreboard from './GolfScoreboard';
import NumberInputKeypad from './NumberInputKeypad';
import icons from '../../site/icons';
import CollapseToggleButton from '../../utils/CollapseToggleButton';
import getMedal from './GetMedal';
import { PlayerContext } from '../../context/PlayerContext';
import validate from '../../utils/validate';
import initializeData from '../../utils/InitializeData';
import PlayerDialog from '../../utils/PlayerDialog';
import ParDialog from '../../utils/ParDialog';
import AthleteDialog from '../../utils/AthleteDialog';
import PlayerStandings from './PlayerStandings';
import GameLeaderboard from './GameLeaderBoard';
import SurfScoringLogic from './SurfScoringLogic';
import { initGolfShots } from './initGolfShots';
import CricketScoreboard from './CricketScoreboard';
import BonesScores from './BonesScores';
import { GolfContext } from '../../context/GolfContext';
import getLocations from '../../waves/Locations'
import { WavesContext } from '../../context/WavesContext';

const PlayerScores = () => {

    const {
        players,
        setPlayers,
        editPlayer,
        playersInGame
    } = useContext(PlayerContext);
    
    const {
        currentWave,
        setCurrentWave,
        updateLocations
    } = useContext(WavesContext);

    const locations = initializeData('spots', []);

    //console.log(`PlayerScores => playersInGame: ${JSON.stringify(playersInGame(), null, 2)}`);

    const {
        golfPars,
        setPars,
        courses,
        setCourses,
        updatePar,
        updateDistance,
        course,
        setCourse,
        addCourse,
        editCourse,
        deleteCourse
    } = useContext(GolfContext);

    //console.log(`PlayerScores => playersInGame: ${JSON.stringify(playersInGame(), null, 2)}`);
    const [allGames, setAllGames] = useState(initializeData('games', games));
    const [game, setGame] = useState(initializeData('game', 'standard'));
    const [logData, setLogData] = useState(initializeData(`${game}Games`, []));
    const [logCollapse, setLogCollapse] = useState();
    const [standingsCollapse, setStandingsCollapse] = useState();
    const [gameCollapse, setGameCollapse] = useState();
    const winners = [5, 10, 11, 15, 20, 21];
    const defaultWinner = initializeData('winner', 21);
    const [winner, setWinner] = useState(
        (game === 'surf')
            ? Number(initializeData('surfWinner', defaultWinner))
            : 21
    );
    const medalColors = ['gold','silver','orange'];
    const [heatLength, setHeatLength] = useState(Number(initializeData('surfWinner', 21)) * 60);
    const isCurrentGame = (isGame) => (game !== isGame) ? false : true;
    const [showButtons, setShowButtons] = useState(false);
    const [heatLog, setHeatLog] = useState(initializeData('heatLog', []));
    const [startTime, setStartTime] = useState(getCurrentTime());
    const [buttonsVisible, setButtonsVisible] = useState(false);
    const [displayNumberPad, setDisplayNumberPad] = useState(false);
    const [currentScoreIndex, setIndex] = useState();
    const [playerId, setPlayerId] = useState();
    const [score, setScore] = useState();
    const [scoresCollapse, setScoresCollapse] = useState(false);
    const [heatsCollapse, setHeatsCollapse] = useState(true);
    const [priorityCollapse, setPriorityCollapse] = useState(true);
    const [statsCollapse, setStatsCollapse] = useState(true);
    const [playerDialog, setPlayerDialog] = useState(false);
    const [parDialog, setParDialog] = useState(false);

    const toggleButtons = () => {
        setButtonsVisible(!buttonsVisible);
    };
    /*
    useEffect(() => {
        if (JSON.stringify(players) !== '[]') {
            const surfersScores = [];
            localStorage.setItem('surfersScores', JSON.stringify(surfersScores))
            localStorage.setItem('players', JSON.stringify(players));
            setShowButtons(false);
        }
        setEdit(false);
    }, [players]);
    */
   useEffect(() => {
       //players.map((player) => console.log(`PlayerScores => ${player.name}: surfScore: ${player.surfScore}`))
       localStorage.setItem('players', JSON.stringify(players));
    }, [players]);
    useEffect(() => {
        localStorage.setItem('game', game)
        localStorage.setItem('gameStatus', 'inProgress');
        let newWinner = initializeData(`${game}Winner`, getWinner(game));
        if (isCurrentGame('golf')) {
            newWinner = 3000;
        }
        setWinner(newWinner);
        if (isCurrentGame('surf')) {
            setHeatLength(winner);
        }
        setLogData(initializeData(`${game}Games`, []));
    }, [game]);

    useEffect(() => {
        localStorage.setItem(`${game}Winner`, winner);
        if (isCurrentGame('surf')) {
            setHeatLength(winner);
        }
    }, [winner]);
    useEffect(() => {
        localStorage.setItem(`${game}Games`, JSON.stringify(logData));
    }, [logData]);
    useEffect(() => {
        localStorage.setItem('heatLog', JSON.stringify(heatLog));
    }, [heatLog]);
    /*
        const newPlayer = () => {
            const newPlayer = prompt('Enter new name', '');
            const initializedNewPlayer = initNewPlayer(newPlayer, game);
            let newPlayers = [...players];
            if (newPlayer !== null) {
                newPlayers.push(initializedNewPlayer);
                if (newPlayers != []) {
                    localStorage.setItem('players', JSON.stringify(newPlayers));
                    //setPlayers(initializeData('players', initPlayers));
                    setPlayers(newPlayers);
                }
                setPlayerDialog(false);
            }
        }
        */
    const addPlayer = () => {
        setPlayerDialog(true);
    }
    const parEdit = () => {
        setParDialog(true);
    }
    useEffect(() => {
        const add = 'add Game/Sport';
        const gamesDir = initializeData('games', games);
        if (!gamesDir.includes(add)) {
            const newGamesDir = ['add Game/Sport', ...gamesDir];
            //gamesDir.unshift('add Game/Sport');
            setAllGames(newGamesDir);
        }
        setAllGames(gamesDir);
    }, []);
    useEffect(() => {
        localStorage.setItem('games', JSON.stringify(allGames));
        const localPlayers = initializeData('players', initPlayers);
        if ((validate(localPlayers) !== null) && (localPlayers !== '[]')) {
            //setPlayers(localPlayers);
        } else {
            //setPlayers(initPlayers);
            //newPlayer();
        }
        const newPlayers = [...localPlayers];
        newPlayers.map((player) => {
            if (!player.cricketScores) {
                player.cricketScores = [0, 0, 0, 0, 0, 0, 0];
                player.dartsScore = 0;
            }
        });
        const initGolfStats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        newPlayers.map((player) => {
            if (!player.golfPutts || !player.golfFW || !player.golfGIR) {
                player.golfPutts = golfScoring;
                player.golfFW = initGolfStats;
                player.golfGIR = initGolfStats;
            }
        });
        
        setPlayers(newPlayers);
        setLogCollapse(true);
        setStandingsCollapse(true);
    }, [allGames]);
    const setGameInProgress = (playerIndex) => {
        if (playerIndex > 0) {
            if (initializeData(`player${playerIndex - 1}`, 'loser') !== 'winner') {
                localStorage.setItem('gameStatus', 'inProgress')
            }
        }
        localStorage.setItem(`player${playerIndex}`, 'loser');
        return false;
    }
    const isWinner = (playerIndex) => ((players)
        ? (getDartTotal(players[playerIndex]) >= winner)
            ? setGameOver(playerIndex)
            : setGameInProgress(playerIndex)
        : null
    );
    const setGameOver = (playerIndex) => {
        localStorage.setItem('gameStatus', 'gameOver');
        localStorage.setItem(`player${playerIndex}`, 'winner');
        return true;
    }

    if (isCurrentGame('darts') && winner !== 21) {
        localStorage.setItem('winner', 21);
        setWinner(Number(initializeData('winner', 21)));
    }
    const getDartTotal = (player) => {
        if (player) {
            const cricketScores = String(player.cricketScores).split(',');
            let total = 0;
            const addToTotal = (value) => total = total + value;
            cricketScores.map((score, index) => addToTotal(Number(score)));
            if (total === winner) localStorage.setItem('gameStatus', 'gameOver');
            return total;
        }
    }
    const getDominoTotal = (index) => {
        const newPlayers = initializeData('players', initPlayers);
        const total = newPlayers[index].dominoScore;
        if (total === winner) localStorage.setItem('gameStatus', 'gameOver');
        return total;
    }

    const updateScores = () => {
        //const newPlayers = JSON.parse(localStorage.getItem('players'));
        //setPlayers(newPlayers);
    }
    const set21 = () => {
        if (isCurrentGame('darts')) {
            localStorage.setItem('winner', 21);
            setWinner(Number(initializeData('winner', 21)));
        }
    }
    const selectGame = (groupTitle, label, selected) => {
        
        if (selected.includes('add')) {
            const newGame = prompt(`Add Game/Sport: `, '');
            if (validate(newGame) && newGame !== '') {
                const gamesDir = [...allGames];
                gamesDir.push(newGame);
                setAllGames(gamesDir);
                setGame(newGame);
                set21();
            }
        } else {
            setGame(selected);
            set21();
        }
        
    }
    const selectWinner = (groupTitle, label, selected) => {
        setWinner(selected);
    }
    const clear = (event) => {
        localStorage.setItem('gameStatus', 'inProgress');
        setPlayers(initPlayers);
    }
    const recordHeatScores = () => {
        const currentPlayers = initializeData('players', initPlayers);
        const heatData = currentPlayers.map((player, index) => {
            //////////
            return {
                name: player.name,
                surfScore: player.surfScore,
                surfScores: player.surfScores,
                surfJerseyColor: player.surfJerseyColor
            }
        });

        //console.log(`recordHeatScores => heatData: ${JSON.stringify(heatData, null, 2)}`);

        const newHeatLog = (heatLog === null) ? [...initHeatLog] : [...heatLog];

        const highestScores = [];
        heatData.forEach((player) => {
            const surfScores = [...player.surfScores];
            const highestScore = Math.max(...surfScores.map(score => Number(score)));
            const displayHighScore = isNaN(highestScore) ? 0 : highestScore;
            highestScores.push(displayHighScore);
        });
        
        const heatHighestScore = Math.max(...highestScores.map(score => Number(score)));
        const playerIndex = [];
        let index = 0;
        heatData.forEach((player) => {
            const surfScores = [...player.surfScores];
            if (surfScores.includes(heatHighestScore)) {
                playerIndex.push(index);
            }
            index++
        });

        newHeatLog.splice(
            0,
            0,
            {
                date: newDate(),
                location: `${(isCurrentGame('surf'))?currentWave:(isCurrentGame('golf'))?course:'no location specified'}`,
                time: startTime,
                length: heatLength,
                scores: heatData,
                heatHighestScore,
                highScoreIndex: playerIndex

            }
        );
        setHeatLog(newHeatLog);
    }

    const deleteHeat = (i) => {
        const newHeatLog = [...heatLog];
        newHeatLog.splice(i, 1);
        setHeatLog(newHeatLog);
    }

    const displayHeatLog = () => {
        const completed = true;
        const sortedData = heatLog.map(obj => {
            const dateTimeString = `${obj.date} ${obj.time}`;
            const dateTime = new Date(dateTimeString);
            return { ...obj, dateTime };
        }).sort((a, b) => b.dateTime - a.dateTime);

        const log = () => heatLog.map((heat, index) => <div className='scrollSnapTop relative size15 p-10 bg-tinted color-lite r-10 ml-10 mr-10 mt-10 mb-15' key={getKey(`heat${index}`)}>
            <div 
                title='delete' 
                className='absolute w-50 rt-15 top-15 r-5 size15 bg-lite bold color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight' 
                onClick={() => deleteHeat(index)}
            >
                X
            </div>
            <div className='m-10 size25 bold contentLeft color-yellow'>{heat.location || 'no location specified'}</div>
            <div className='m-10 size20 bold contentLeft color-yellow'>{heat.date}</div>
            <div className='m-10 contentLeft'>{heat.time} - {heat.length}min</div>
            <div className='m-10 contentLeft'>highest wave score: { heat.heatHighestScore }!!!</div>
            <div className='flexContainer width-100-percent h-scroll'>
                {heat.scores.map((player, index) => {
                    if ((player.surfScore !== 0) && (player.surfScores != ["", "", "", "", "", "", "", "", "", ""])) {
                        return <div className='flexContainer width-100-percent' key={getKey(`heatScore${index}`)}>
                                <GetAthleteScore
                                    //heat.scores
                                    heat={heat}
                                    index={index}
                                    player={player}
                                    playerCount={heat.scores.length}
                                    timesUp={completed}
                                />
                            </div>
                    } else { 
                        return null; 
                    }
                })}
            </div>
        </div>
        )
        return <div className='mr-10'>
            <div className='containerBox size15 mt-5 mb--5'>
                <CollapseToggleButton
                    title={'Recorded Heats'}
                    isCollapsed={heatsCollapse}
                    setCollapse={setHeatsCollapse}
                    align='left'
                />
            </div>
            {(heatsCollapse) ? <div></div> : <div className='scrollHeight400'>{log()}</div>}
        </div>
    }
    const displaySeasonStats = () => {
        const stats = () => {
            const athleteTotals = {};
            heatLog.forEach((heat) => {
                const { scores } = heat;
                let playerIndex = 0;
                scores.forEach((player) => {
                    const { name, surfScore, surfScores } = player;
                    const firstName = name.split(' ')[0]
                    const highestScore = Math.max(...surfScores.map(score => score));

                    if (!athleteTotals[firstName]) {
                        athleteTotals[firstName] = {
                            name,
                            totalScore: 0,
                            highestScore
                        };
                    }
                    const points = [4, 3, 2, 1];
                    athleteTotals[firstName].totalScore += (points[playerIndex] || 0);
                    athleteTotals[firstName].highestScore = highestScore;
                    playerIndex++
                });
            });

            const resultArray = [];
            for (const athlete in athleteTotals) {
                if (athleteTotals.hasOwnProperty(athlete)) {
                    resultArray.push(athleteTotals[athlete]);
                }
            }
            const sortedStats = resultArray.sort((a, b) => b.totalScore - a.totalScore);
            return sortedStats;
        }
        const colors = ['bg-gold', 'bg-silver', 'bg-orange'];
        let differenceAmount = 0;
        const isRankTie = (athleteIndex) => {
            if (athleteIndex !== 0) {
                if (stats()[athleteIndex].totalScore === stats()[athleteIndex - 1].totalScore) {
                    differenceAmount = differenceAmount + 1;
                }
            }
        }
        const seasonStats = () => stats().map((athlete, index) => {
            isRankTie(index);
            return <div className={`containerBox flexContainer scrollSnapTop size25 ${((index - differenceAmount) < 3) ? 'color-dark bold' : 'color-lite'} ${colors[(index - differenceAmount)]}`} key={getKey(`stat${index}`)}>
                <div className='containerBox columnLeftAlign flex3Column bg-tintedMedium'>
                    {(index - differenceAmount) + 1}. {athlete.name}
                </div>
                <div className='containerBox columnCenterAlign flex3Column size35 bg-tintedMedium'>
                    {getMedal((index - differenceAmount)) || icons.shaka}
                </div>
                <div className='containerBox columnRightAlign flex3Column bg-tintedMedium'>
                    {athlete.totalScore} Points
                </div>
            </div>
        })

        return <div className='mr-10'>
            <div className='containerBox size15 mt-5 mb--5'>
                <CollapseToggleButton
                    title={'Athlete Ranks'}
                    isCollapsed={statsCollapse}
                    setCollapse={setStatsCollapse}
                    align='left'
                />
            </div>
            {(statsCollapse) ? <div></div> : <div className=''>{seasonStats()}</div>}
        </div>
    }

    const reset = (event) => {
        let newPlayers = initializeData('players', initPlayers);
        //console.log(`reset => 1`);
        if (players && Array.isArray(players)) {
            //console.log(`reset => 2`);
            newPlayers = [...players];
            let updatedPlayers = [...newPlayers];
            const initValue = 0;
            if (isCurrentGame('darts')) {
                //console.log(`darts => players: ${JSON.stringify(players, null, 2)}`);
                updatedPlayers = newPlayers.map((player) => {
                    const newPlayer = {
                        ...player,
                        dartsScore: 0,
                        cricketScores: [0, 0, 0, 0, 0, 0, 0]
                    };
                    return newPlayer;
                });
            } else if (isCurrentGame('golf')) {
                //newPlayers = initializeData('players', initPlayers);
                newPlayers.map((player) => {
                    return {
                        ...player,
                        golfScore: 0,
                        golfScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        golfGIR: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
                        golfFW: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
                        golfPutts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    }
                });
            } else if (isCurrentGame('dominos')) {
                newPlayers = [...players];
                let index = 0;
                newPlayers.forEach((player) => {
                    newPlayers[index].dominoScore = 0;
                    index++
                });
            } else if (isCurrentGame('surf')) {
                //console.log(`reset => 3`);
                let index = 0;
                newPlayers.forEach((player) => {
                    newPlayers[index].surfScores = surfScoring;
                    newPlayers[index].surfScore = 0;
                    newPlayers[index].interferenceCount = 0;
                    newPlayers[index].surfPriority = 0;
                    index++
                });
                const sortedPlayers = [...newPlayers];
                sortedPlayers.sort((a, b) => getSurfTotal(b) - getSurfTotal(a));
                newPlayers = [...sortedPlayers];
            } else {
                newPlayers.map((player, index) => newPlayers[index][`${game}Score`] = initValue);
            }
            localStorage.setItem('gameStatus', 'inProgress');
            if (isCurrentGame('darts')) {
                setPlayers(updatedPlayers);
            } else {
                if (newPlayers != []) {
                    //console.log(`reset => 5`);
                    setPlayers(newPlayers);
                }
            }
            //getScore();
            //window.location.pathname = '/reactor/Scores';
        }
    }
    const getLog = (game) => {
        const log = game.players
            .sort((a, b) => b.score - a.score) // Sort players by score in descending order
            .map((player, index) => (
                <div className={`flex${game.players.length}Column r-10 m-1 size20 bg-darker pt-10 pb-10 color-lite`} key={getKey(`athleteScore`)}>
                    <div className={`p-5 size30`}>{index+1}</div>
                    <div className={`m-10 ht-5 bg-${medalColors[index] || 'lite'}`}></div>
                    <div className='p-5 ht-75 centeredContent'>
                        <div>
                            {getMedal(index)}
                        </div>
                        <div>{player.name.split(' ')[0]}</div>
                        <div>{player.name.split(' ')[1]}</div>
                    </div>
                    <div className='p-5 bg-lite r-10 m-10'>
                        {player.score}
                    </div>
                </div>
            ));

        return <div className='flexContainer'>
                    {log}
                </div>
    }
    const deleteLogItem = (index) => {
        setLogData((prevLogData) => {
            const updatedLogData = [...prevLogData];
            updatedLogData.splice(index, 1);
            return updatedLogData;
        });
    }
    const displayLog = () => {
        const logDisplay = () => logData.map((game, index) => <div className='relative containerDetail scrollSnapTop m-5 bg-veryLite' key={index}>
                <div className='containerBox min-height-60'>
                    <div 
                        title='delete' 
                        className='absolute w-50 rt-20 t-0 r-5 size15 bg-lite color-yellow button pr-20 pl-20 pt-10 pb-10 contentRight mt-20' 
                        onClick={() => deleteLogItem(index)}
                    >
                        X
                    </div>
                    {
                        (isCurrentGame('golf'))
                        ? <div className='min-height-40 columnLeftAlign color-yellow width--60'>
                                <div className='pl-10'>{game.location || 'No location specified'}</div>
                            </div>
                        : null
                    }
                    <div className='min-height-40 columnLeftAlign color-yellow width--60'>
                        <div className='pl-10'>{game.date} - {game.time.split(':')[0]}:{game.time.split(':')[1]} {game.time.split(' ')[1]}</div>
                    </div>
                </div>
                {getLog(game)}
            </div>
        
        )
        return logDisplay();
    }
    const recordData = (data) => {
        const approved = window.confirm('Record this game?');
        if (approved) {
            setLogData(data);
        }
    }
    const generateGamesData = () => {
        
        const gamesData = [...logData];
        const gameData = {
            date: newDate(),
            location: `${(game == 'golf') ? course.name : (game == 'surf') ? currentWave : 'Home'}`,
            time: getCurrentTime(),
            players: []
        };
        players.forEach(player => {
            if (player[game]) {
                const playerScore = player[`${(game == 'dominos') ? 'domino' : game}Score`] || 0;
                gameData.players.push({
                    name: player.name,
                    score: playerScore
                });
            }
        });
        //gamesData.unshift(gameData);
        const newGamesData = [gameData, ...gamesData];
        recordData(newGamesData);
        //localStorage.setItem(`${game}Games`, JSON.stringify(gamesData));
        return gamesData;
    };
    const newGame = (event) => {
        let newPlayers = initializeData('players', initPlayers);
        let index = 0;
        if (players && Array.isArray(players)) {
            newPlayers = [...players];
            let updatedPlayers = [...newPlayers];
            const initValue = 0;
            const gamesData = generateGamesData();
            //console.log(`gamesData: ${JSON.stringify(gamesData, null, 2)}`);
            if (isCurrentGame('darts')) {
                updatedPlayers = newPlayers.map((player) => {
                    const newPlayer = {
                        ...player,
                        dartsScore: 0,
                        cricketScores: [0, 0, 0, 0, 0, 0, 0]
                    };
                    return newPlayer;
                });
            } else if (isCurrentGame('golf')) {
                index = 0;
                newPlayers.forEach((player) => {
                    newPlayers[index].golfScore = 0;
                    newPlayers[index].golfScores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    newPlayers[index].golfGIR = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
                    newPlayers[index].golfFW = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
                    newPlayers[index].golfPutts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    newPlayers[index].golfShots = initGolfShots;
                    index++
                });
                index = 0;
            } else if (isCurrentGame('dominos')) {
                index = 0;
                newPlayers.forEach((player) => {
                    newPlayers[index].dominoScore = 0;
                    index++
                });
                newPlayers.forEach((player) => {
                    //console.log(`${player.name} dominoScore: ${player.dominoScore}`);
                });
            } else if (isCurrentGame('surf')) {
                let index = 0;
                newPlayers.forEach((player) => {
                    newPlayers[index].surfScores = surfScoring;
                    newPlayers[index].surfScore = 0;
                    newPlayers[index].interferenceCount = 0;
                    newPlayers[index].surfPriority = 0;
                    index++
                });
                const sortedPlayers = [...newPlayers];
                sortedPlayers.sort((a, b) => getSurfTotal(b) - getSurfTotal(a));
                newPlayers = [...sortedPlayers];
            } else {
                newPlayers.map((player, index) => newPlayers[index][`${game}Score`] = initValue);
            }
            localStorage.setItem('gameStatus', 'inProgress');
            if (isCurrentGame('darts')) {
                setPlayers(updatedPlayers);
            } else {
                if (newPlayers != []) {
                    setPlayers(newPlayers);
                }
            }
        }
    }
    /*
    const getScore = () => {
        setDisplayNumberPad(false);
        window.location.pathname = '/reactor/Scores';
    }
    
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
    const editSurfer = (playerId) => <div className='containerBox'>
        <div className='flexContainer containerBox color-lite bold contentCenter'>
            <div className='flex1Auto containerBox'>
                <span className='size30'>Name:</span>
            </div>
            <div className='flex2Column containerBox'>
                <button className={`bg-lite size30 color-lite width-100-percent pb-10 pt-10 button r-10`} onClick={() => editPlayer(playerId)}>
                    {players[playerId].name}
                </button>
            </div>
        </div>
        <div className='containerBox size30'>
            <div>
                Jersey color:
            </div>
            <div>
                {jerseyColors.map((color, index) =>
                    index === Math.ceil(jerseyColors.length / 2) ? (
                        <React.Fragment key={getKey(`jerseyColor${index}`)}>
                            <br />
                            {getJerseyColorSelector(playerId, color, index)}
                        </React.Fragment>
                    ) : (
                        getJerseyColorSelector(playerId, color, index)
                    )
                )}
            </div>
        </div>
        <div className='flexContainer'>
            <div className='flex2Column'>
                <button
                    className='bg-lite size30 color-lite width-100-percent pb-10 pt-10 button r-10 m-5'
                    onClick={() => resetSurfersScores(playerId)}
                >
                    Reset Scores
                </button>
            </div>
            <div className='flex2Column'>
                <button
                    className='bg-lite size30 color-lite width-100-percent pb-10 pt-10 button r-10 m-5'
                    onClick={() => deleteAthlete(playerId)}
                >
                    Delete Athlete
                </button>
            </div>
        </div>
    </div>
    */
    const getSurfTotal = (player) => {
        let total = 0;
        let index = 0;
        const score = (index) => player.surfScores[index];
        const addToTotal = (value) => total = total + value;
        surfScoring.forEach((target) => {
            addToTotal(Number(score(index)))
            index++
        });
        return total;
    }
    const highestScore = (index, playersArray) => {
        return playersArray[index].surfScores[getTwoHighestScores(playersArray, index).highScoreIndex];
    }
    const secondHighestScore = (index, playersArray) => playersArray[index].surfScores[getTwoHighestScores(players, index).secondHighScoreIndex];
    const scoreTotal = (playerId, playersArray) => {
        let highScore = Number(highestScore(playerId, playersArray));
        let secondHighScore = Number(secondHighestScore(playerId, playersArray));
        const interferenceCount = (playersArray[playerId].interferenceCount)
            ? Number(playersArray[playerId].interferenceCount)
            : 0;
        if (interferenceCount === 1) {
            secondHighScore = secondHighScore / 2;
        } else if (interferenceCount === 2) {
            secondHighScore = 0;
        } else if (interferenceCount === 3) {
            highScore = 0;
        }
        const newScoreTotal = (highScore + secondHighScore).toFixed(2);
        //alert(`${JSON.parse(localStorage.getItem('players'))[playerId].name} surfScore: ${JSON.parse(localStorage.getItem('players'))[playerId].surfScore} newScoreTotal: ${newScoreTotal}`)
        return newScoreTotal;
    };
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
    const placeSuffix = (index) => rank[(isTieScore(index) && (index !== 0)) ? (index - 1) : (index > 2) ? 3 : (index)];
    const rank = ['st', 'nd', 'rd', 'th'];
    const rankStatus = (player, index) => {
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
    const selectJersey = (playerId, selection) => {
        const newPlayers = [...players];
        newPlayers[playerId].surfJerseyColor = (selection);
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
    }
    const setNewStartTime = () => {
        setStartTime(getCurrentTime());
    };

    const setSurfScore = (playerId, index, score) => {
        //alert(`setSurfScore = (playerId: ${playerId}, index: ${index}, score: ${score})`);
        const newPlayers = [...players];
        const currentScore = newPlayers[playerId].surfScores[index];
        const change = (currentScore !== '' && currentScore !== 0) ? false : true;
        newPlayers[playerId].surfScores[index] = Number(score) || '';
        newPlayers[playerId].surfScore = scoreTotal(playerId, newPlayers);
        /*
        if ((newPlayers[playerId].surfPriority === 1 || newPlayers[playerId].surfPriority === 0) && change) {
            newPlayers.map((player, index) => {
                if (index === playerId) {
                    return {
                        ...player,
                        surfPriority: players.length
                    }
                } else if (player.surfPriority !== 0) {
                    return {
                        ...player,
                        surfPriority: player.surfPriority - 1
                    }
                }
                return {
                    ...player
                }
            });
        }
        */
        const sortedPlayers = [...newPlayers];
        sortedPlayers.sort((a, b) => b.surfScore - a.surfScore);
        //console.log('setSurfScore => sortedPlayers: ', sortedPlayers)
        setPlayers(sortedPlayers);
        setDisplayNumberPad(false);
    }
    const getSurfScore = (index, playerId, score) => {
        setIndex(index);
        setPlayerId(playerId);
        setScore(score);
        setDisplayNumberPad(true);
    }
    const setSurfScores = (newScore) => {
        //console.log(`setSurfScores => playerId: ${playerId})`);
        //console.log(`setSurfScores => newScore: ${newScore})`);
        //console.log(`setSurfScores => currentScoreIndex: ${currentScoreIndex})`);
        //const newPlayers = [...playersInGame()];
        //const newPlayers = [...players];
        const newPlayers = [...players] || [...initializeData('players', initPlayers)];
        const currentScore = newPlayers[playerId].surfScores[currentScoreIndex];
        //console.log(`setSurfScores => currentScore(${currentScoreIndex}): ${currentScore}`);
        const change = (currentScore !== '' && currentScore !== 0) ? false : true;
        const regex = new RegExp(icons.dont, 'g');
        const previousScore = players[playerId].surfScores[currentScoreIndex];
        //console.log(`setSurfScores => previousScore: ${previousScore}`);
        const interferenceCount = (score) => (String(score).match(regex) || []).length;
        const isPreviousScoreInterference = () => {
            let difference = 0;
            const wasInterference = (interferenceCount(previousScore) > 0) ? true : false;
            if (wasInterference) {
                if (previousScore === `NP ${icons.dont}`) {
                    difference = 1;
                } else if (previousScore === `P ${icons.dont}`) {
                    difference = 2;
                } else if (previousScore === `5Min ${icons.dont}`) {
                    difference = 3;
                }
            }
            return [wasInterference, difference];
        }
        const isNewScoreInterference = (interferenceCount(newScore) > 0) ? true : false;
        if (isPreviousScoreInterference[0] && !isNewScoreInterference) {
            newPlayers[playerId].interferenceCount = newPlayers[playerId].interferenceCount - isPreviousScoreInterference[1];
        }
        const scoreValue = (isNaN(newScore)) ? 0 : Number(newScore);
        //console.log(`setSurfScores => ${newPlayers[playerId-1].name} newPlayers[${playerId-1}].surfScores[${currentScoreIndex}] = ${newPlayers[playerId-1].surfScores[currentScoreIndex]}`);
        //console.log(`setSurfScores => ${newPlayers[playerId].name} newPlayers[${playerId}].surfScores[${currentScoreIndex}] = ${newPlayers[playerId].surfScores[currentScoreIndex]}`);
        //console.log(`setSurfScores => ${newPlayers[playerId+1].name} newPlayers[${playerId+1}].surfScores[${currentScoreIndex}] = ${newPlayers[playerId+1].surfScores[currentScoreIndex]}`);
        //console.log(`setSurfScores => newPlayers[${playerId}].surfScores[${currentScoreIndex}] = ${newScore}`);
        newPlayers[playerId].surfScores[currentScoreIndex] = (interferenceCount(newScore) > 0) ? newScore : scoreValue;
        //console.log(`setSurfScores =>=> ${newPlayers[playerId - 1].name} [newPlayers[${playerId - 1}].surfScores[${currentScoreIndex}]: ${newPlayers[playerId - 1].surfScores[currentScoreIndex]}`);

        //console.log(`setSurfScores =>=> ${newPlayers[playerId + 1].name} [newPlayers[${playerId + 1}].surfScores[${currentScoreIndex}]: ${newPlayers[playerId + 1}.surfScores[currentScoreIndex]}`);
        newPlayers[playerId].surfScore = scoreTotal(playerId, newPlayers);
        //console.log(`setSurfScores => ${newPlayers[playerId].name} newPlayers[${playerId}].surfScores[${currentScoreIndex}]: ${newPlayers[playerId].surfScores[currentScoreIndex]} newPlayers[${playerId}].surfScore: ${newPlayers[playerId].surfScore} newPlayers[${playerId}].surfPriority: ${newPlayers[playerId].surfPriority}`);
        if (newPlayers[playerId].surfPriority < playersInGame().length && change) {
            newPlayers.map((player, index) => {
                if (player[game]) {
                    if (index === playerId) {
                        player.surfPriority = playersInGame().length;
                    } else if (player.surfPriority > 1) {
                        player.surfPriority = player.surfPriority - 1;
                    }
                }
            });
        }
        const sortedPlayers = [...newPlayers];
        sortedPlayers.sort((a, b) => b.surfScore - a.surfScore);
        //console.log('setSurfScores => sortedPlayers: ', sortedPlayers)
        setPlayers(sortedPlayers);
        setDisplayNumberPad(false)
    }
    const scorecards = () => {
        const scorecard = (playerIndex, scoreIndex, score) => {
            const newPlayers = initializeData('players', initPlayers);
            const player = newPlayers[playerIndex];
            if (isCurrentGame('darts')) {
                if (players && player) {
                    return <CricketScore
                        players={newPlayers}
                        setPlayers={setPlayers}
                        game={game}
                        player={player}
                        playerIndex={playerIndex}
                        scoreIndex={scoreIndex}
                        updateScores={updateScores}
                        winner={winner}
                    />
                }
            }
            if (isCurrentGame('dominos')) {
                //console.log(`${game} - scorecard => player: ${(newPlayers.player || newPlayers.name)} playerIndex: ${playerIndex} scoreIndex: ${scoreIndex} scoreIndex: ${newPlayers.dominoScore} score: ${score}`)
                return <Dominos
                    game={game}
                    player={player}
                    playerIndex={playerIndex}
                    scoreIndex={scoreIndex}
                    scoreTotal={player.dominoScore || 0}
                    treeTotal={score}
                    getDominoTotal={getDominoTotal}
                    updateScores={updateScores}
                    winner={winner}
                    key={getKey((player.player || player.name))}
                />
            }
            if (isCurrentGame('golf')) {
                //console.log(`${game} - scorecard => player:${player.player || player.name}`);
                //console.log(`scoreIndex: ${scoreIndex}`);
                //console.log(`score: ${player.golfScores[scoreIndex]}`);
                //console.log(`scorecards => par: ${score}`);
                return
            }
            return <div className='containerBox' key={getKey(`scorecard${game}${playerIndex}`)}>
                <ScoreCard
                    game={game}
                    playerIndex={playerIndex}
                    scoreIndex={scoreIndex}
                    updateScores={updateScores}
                    winner={winner}
                />
            </div>
        }
        const getWave = (playerId, waveId, score) => {
            const highestScores = findTwoHighestIndices(players[playerId].surfScores);
            const highestId = highestScores[0];
            const secondHighestId = highestScores[1];
            const firstScore = (waveId === highestId) ? true : false;
            const secondScore = (waveId === secondHighestId) ? true : false;
            const getClasses = (firstScore || secondScore) ? 'size30 bold color-neogreen' : 'size30 white';

            const wave = <div key={getKey(`wave${playerId}${waveId}${score}`)}>
                <div className='column r-10 mr-1 bg-dkYellow'>
                    <div className='size30 bold color-yellow w-100 p-10'>{waveId + 1}</div>
                </div>

                <div
                    title='add/edit score'
                    className={`containerDetail ht-65 p-20 m-1 brdr-light contentCenter bold bg-dark size30 ${getClasses}`}
                    onClick={() => getSurfScore(waveId, playerId, score)}
                >
                    {score}
                </div>

            </div>
            return wave
        }
        const getPlayerCount = () => {
            let index = 0;
            let count = 0;
            players.forEach((player) => {
                if (player[game]) {
                    count++
                }
                index++
            });
            return count

        }

        const displayInterferenceCount = (playerId) => {
            const character = icons.dont;
            const count = (players[playerId].interferenceCount) ? Number(players[playerId].interferenceCount) : 0;
            return `${character.repeat(count)}`;
        }
        const editInterferenceCount = (playerId) => {
            const count = players[playerId].interferenceCount;
            const newCount = prompt(`How many interference calls does ${players[playerId].name} have?`, count);
            if (newCount !== null) {
                const newPlayers = [...players];
                newPlayers[playerId].interferenceCount = newCount;
                setPlayers(newPlayers); 
            }
        }
        const surfingScores = (player, index) => {
            const heat = players.filter(player => player[game]);
            return <div className='button scrollSnapTop' key={getKey(`${index}${(player.player || player.name)}`)}>
                <div className={`flexContainer ht-50 r-10 ml-10 mr-10 mb--5 color-dark text-outline-light bg-${jerseyColors[Number(players[index].surfJerseyColor)] || jerseyColors[0]}`} key={getKey(`${index}${(player.player || player.name)}`)}>
                    <div className={`flex2Column contentLeft r-10-lft m-0 w-75 p-10`}>
                        <div className='bold'>
                            <span className='size25 mt--10'>
                                {place(index)}
                            </span>
                            <span className='size15 mt--10'>
                                {placeSuffix(index)}
                            </span>
                            <span 
                                title='edit interference'
                                className='size25 m-10' 
                                onClick={() => editInterferenceCount(index)}
                            >
                                {displayInterferenceCount(index)}
                            </span>
                        </div>
                        <div 
                            title='edit player'
                            className='bold' onClick={() => setShowButtons((showButtons !== false) ? false : index)}
                        >
                            <div className='size30 mt-5 mb-5'>
                                {(player.player || player.name).split(' ')[0]}
                            </div>
                            <div className='size20'>
                                {(player.name.indexOf(' ') !== -1) ? player.name.substring(player.name.indexOf(' ') + 1) : null}
                            </div>
                        </div>
                    </div>
                    <div className={`r-10-rt flex2Column contentRight m-0 mr-10 pb-10 pl-10 pr-10 pt-15`}>
                        <div className='size40 bold'>{scoreTotal(index, players)}</div>
                        <div className='mt-10 bold'>
                            {/*rankStatus(player, index)*/}
                            <SurfScoringLogic
                                heat={heat}
                                index={index}
                                completed={false}
                                oneLine='true'
                            />
                        </div>
                    </div>
                </div>
                <div>
                    {showButtons === index && (
                        //editSurfer(index)
                        <div className='containerBox bg-neogreen'>
                            <AthleteDialog
                                playerId={index}
                                isOpen={true}
                                game={game}
                                onClose={closeDialog}
                            />
                        </div>
                    )}
                </div>
                <div>
                    <div>
                        <div className='h-scroll color-white copyright ml-10 mr-10 mt-5'>
                            <div className='container mt-10'>
                                {players[index].surfScores.map((score, wave) => getWave(index, wave, score))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }

        const renderedItems = () => players.map(
            (player, index) => (player[game]) ? scorecard(index, 0, 0) : null
        );
        const getColumns = () => (players.length * 2) - 1;
        const getPlayers = () => players.length;

        const anyMorePlayers = (playerIndex) => {
            if (!Array.isArray(players) || typeof game !== 'string') {
                console.error('Invalid players array or game string');
                return false;
            }

            return players.slice(playerIndex + 1).some(player => player[game]);
        };

        const dartScores = () => dartScoring.map((score, index) => <div key={getKey(`${score}${index}`)} className='flexContainer width-100-percent'>
            {
                players.map((player, playerIndex) => (player[game])
                    ? <div key={getKey(`${player.name}${playerIndex}`)} className={`flex${getPlayers()}Column`}>
                        <div className='width-50-percent flexContainer flex2Column'>
                            <div className={`flex2Column`}>
                                {scorecard(playerIndex, index, 0)}
                            </div>
                            <div className={`flex2Column pt-10 mr--50 mb-1 font50 color-yellow`}>
                                {
                                    (players[playerIndex + 1] && players[playerIndex + 1][game])
                                    ? score
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                    : null
                )
            }
            {
                //<div className='flex3Column'>
                //{scorecard(0, index, 0)}
                //</div>
                //<div className='ml-10 bg-tinted p-15 r-10 mb-1 font50 color-yellow flex3Column20Percent'>
                //{score}
                //</div>
                //<div className='flex3Column ml-10'>
                //{scorecard(1, index, 0)}
                //</div>
            }
        </div>);
        const bonesScores = () => dominoScoring.map((score, scoreIndex) => <div key={getKey(`${score}${scoreIndex}`)} className='flexContainer width-100-percent'>
            {
                players.map((player, playerIndex) => (player[game])
                    ? <div key={getKey(`${player.name}${playerIndex}`)} className={`flex${getPlayers()}Column`}>
                        <div className='flexContainer ml-20'>
                            <div className={`flexColumn faded`}>
                                {scorecard(playerIndex, scoreIndex, score)}
                            </div>
                            {
                                /* (players[playerIndex + 1] && players[playerIndex + 1][game]) */
                                (anyMorePlayers(playerIndex))
                                ? <div className={`flexColumn size30 color-yellow bold centeredContent`}>
                                    {score}
                                </div>
                                : null
                                //score
                            }
                        </div>
                    </div>
                    : null
                )
            }
        </div>);

        const surfingScoreboard = () => players.map((player, index) => (player[game]) ? surfingScores(player, index) : null);
        const firstPlayer = (playerIndex) => {
            let index = 0;

            const player = players.find((player) => {
                if (player[game]) {
                    if (index === playerIndex) {
                        //console.log(`firstPlayer: ${player.name} index: ${index} playerIndex: ${playerIndex}`);
                        return true;
                    }
                    index++;
                }
                return false;
            });
            return player || null;
        };


        const dominoScores = (playerIndex) => dominoScoring.map((score, scoreIndex) => (players[playerIndex][game]) ? <div className={`flex${getPlayers()}Column`}>
            <div className='flexContainer scrollSnapTop width-100-percent' key={getKey(`score${scoreIndex}${score}`)}>
                <div className={`flex${getPlayers()}Column contentCenter p-5 bg-white`}>
                    1
                </div>
                <div className={`flex${getColumns()}Column contentCenter p-5`}>
                    {scorecard(playerIndex, scoreIndex, score)}
                </div>
                <div className={`flexColumn r-5 size40 bold color-yellow`}>
                {
                    (anyMorePlayers(playerIndex))
                    ? {score}
                    : null
                }
                </div>
            </div>
        </div>
            : null
        );

        const isDominoWinner = (playerIndex) => (getDominoTotal(playerIndex) >= winner) ? setGameOver(playerIndex) : setGameInProgress(playerIndex);

        const dartClass = (playerIndex) => 'containerBox color-yellow flex3Column size25 bold bg-veryLite' + ((isWinner(playerIndex)) ? ' color-neogreen shakingShaka mt-20' : '');
        const dominoClass = (playerIndex) => 'color-yellow flex3Column p-20 size25 bold' + ((isDominoWinner(playerIndex)) ? ' color-neogreen shakingShaka mt-20' : '');

        const dartScoreboard = () => <div className='bg-tinted p-10 m-5 r-10'>
            <div className='flexContainer glassy mb-10 bg-veryLite r-10'>
                {
                    players.map((player, playerIndex) => {
                        return (player[game])
                            ? <div key={getKey(`${playerIndex}`)} className='flexContainer width-50-percent'>
                                <div className={`${dartClass(playerIndex)} flex3Column`}>
                                    {player.player || player.name}:
                                    <div className='mt-10 size40 white pt-10'>
                                        {getDartTotal(player)}
                                    </div>
                                </div>
                            </div>
                            : null
                    }
                    )
                }
            </div>
            <div className='width-100-percent h-scroll'>
                {/*dartScores()*/}
                 <CricketScoreboard/>
            </div>
        </div>

        const bonesScoreboard = () => <div className='containerBox'>
            <div>
                {bonesScores()}
            </div>
        </div>

        const dominoScoreboard = () => {
            const newPlayers = initializeData('players', initPlayers);
            return <div className='containerBox'>
                <div className='flexContainer glassy ml-5 mr-5 mb-10 bg-veryLite r-10'>
                    {
                        players.map((player, playerIndex) => {
                            return (player[game])
                                ? <div key={`${getKey(playerIndex)}`}className={dominoClass(playerIndex)}>
                                    {newPlayers[playerIndex].player || newPlayers[playerIndex].name}:
                                    <div className='mt-10 size40 white'>
                                        {getDominoTotal(playerIndex)}
                                    </div>
                                </div>
                                : null
                        })
                    }
                    {
                        /*
                        <div className={dominoClass(0)}>
                            {newPlayers[0].player || newPlayers[0].name}:
                            <div className='mt-10 size40 white'>
                                {getDominoTotal(0)}
                            </div>
                        </div>
                        <div className='p-20 bg-tinted navBranding w-200 color-yellow flex3Colum'>vs</div>
                        <div className={dominoClass(1)}>

                            {newPlayers[1].player || newPlayers[1].name}:
                            <div className='mt-10 size40 white'>
                                {getDominoTotal(1)}
                            </div>
                        </div>
                        */
                    }
                </div>
            </div>
        }

        if (isCurrentGame('darts')) return dartScoreboard()
        if (isCurrentGame('dominos')) return <div>
            <div>
                {dominoScoreboard()}
                {/*{bonesScores()} */}
                <BonesScores/>
            </div>
            {
                /*
                <div className='mt-5 height--300 scroll containerBox'>
                    <div className='flexContainer width-100-percent scrollSnapTop'>
                        {
                            players.map((player, playerIndex) => (player[game])
                                ? <div className={`flex${getPlayers()}Column bg-blue`}>
                                    {
                                        dominoScores(playerIndex)
                                    }
                                </div>
                                : null
                            )
                        }
                    </div>
                </div>
                */
            }
        </div>
        if (isCurrentGame('golf')) return <GolfScoreboard
            updateScores={updateScores}
            isDialogOpen={playerDialog}
            setPlayerDialog={setPlayerDialog}
        />
        if (isCurrentGame('surf')) return <div className='height-600'>
            {surfingScoreboard()}
        </div>

        else return renderedItems();
    }

    const closeDialog = () => {
        setPlayerDialog(false);
        setParDialog(false);
        setShowButtons(false);
    }
    const getStandings = () => {
        if (allGames != []) {
            const filteredGames = allGames.filter(game => !game.includes('add'));
            const standings = filteredGames.map((game, index) => (
                <div key={getKey(game)} className="containerDetail flexColumn scrollSnapLeft m-1">
                    <PlayerStandings game={game} />
                </div>
            ));
            return standings;
        }
        return
    }

    const addButton = `${icons.plus} Add Course`;
    const editButton = `${icons.edit} Edit Course`;
    const deleteButton = `${icons.delete} Delete Course`;

    const selectCourse = (groupTitle, label, selected) => {
        console.log(`PlayerScores selectCourse => groupTitle: ${groupTitle} label: ${label} selected: ${selected}`);
        if (selected === addButton) {
            addCourse();
        } else if (selected === editButton) {
            editCourse();
        } else if (selected === deleteButton) {
            deleteCourse();
        } else {
            const selectedCourse = courses.filter(course => course.name === selected);
            //console.log(`PlayerScores selectCourse => selectedCourse: ${JSON.stringify(selectedCourse[0], null, 2)}`);
            setCourse(selectedCourse[0]);
        }
    }
    const selectWave = (groupTitle, label, selected) => {
        console.log(`PlayerScores selectWave => groupTitle: ${groupTitle} label: ${label} selected: ${selected}`);
        const selectedWave = locations.filter(loc => loc === selected);
        console.log(`PlayerScores selectWave => selectedWave: ${selectedWave}`);
        setCurrentWave(selectedWave);
    }
    const courseNames = courses.map((course) => course.name);

    const addItemToArray = (array, item1, item2, item3) => {
        if (!Array.isArray(array)) {
            throw new Error("First argument must be an array.");
        }
        return [...array, item1, item2, item3];
    }

    return <div className='fadeIn mt--30'>
        <div>
            <div className='flexContainer containerBox'>
                <div className='flex2Column'>
                    <Selector
                        groupTitle='game'
                        label='game selector'
                        items={allGames}
                        selected={game}
                        onChange={selectGame}
                        fontSize='25'
                        padding='10px'
                        width={(isCurrentGame('darts') || isCurrentGame('dominos')) ? '98%' : '100%'}
                    />
                </div>
                <div className='flex2Column pl-5'>
                    {
                        (isCurrentGame('surf'))
                            ? <Selector
                                groupTitle='wave'
                                label='wave selector'
                                items={locations}
                                selected={currentWave}
                                onChange={selectWave}
                                fontSize='25'
                                padding='10px'
                                width='100%'
                            />
                            : null

                    }
                    {
                        (isCurrentGame('darts'))
                        ? <React.Fragment></React.Fragment>
                        : (isCurrentGame('golf'))
                            ? <Selector
                                groupTitle='course'
                                label='course selector'
                                items={addItemToArray(courseNames, editButton, addButton, deleteButton)}
                                selected={course?.name || courses[0].name}
                                onChange={selectCourse}
                                fontSize='25'
                                padding='10px'
                                width='100%'
                            />
                            : <Selector
                                    groupTitle='winner'
                                    label='winner selector'
                                    items={(isCurrentGame('dominos')) ? dominoWinners : ((isCurrentGame('surf')) ? heatLengths : winners)}
                                    selected={winner}
                                    onChange={selectWinner}
                                    fontSize='25'
                                    padding='10px'
                                    width='100%'
                                />
                    }
                </div>
            </div>
            {(isCurrentGame('surf')) ?
                <SurfScores
                    heatLength={winner}
                    setStartTime={setNewStartTime}
                    setSurfScore={setSurfScores}
                    recordHeatScores={recordHeatScores}
                    priorityCollapse={priorityCollapse}
                    setPriorityCollapse={setPriorityCollapse}
                    getSurfScore={getSurfScore}
                ></SurfScores>
                :
                <React.Fragment></React.Fragment>

            }
            <div className={`scrollHeight550 ${(priorityCollapse) ? 'sticky180' : 'sticky260'} z1 bg-mediumDark`}>
                {/*<div className={`scrollHeight550 z1 bg-mediumDark`}>*/}
                <div className='mt--10 t-0 absolute width-100-percent contentCenter z1'>
                    <NumberInputKeypad
                        onEnter={setSurfScores}
                        currentScoreIndex={currentScoreIndex}
                        playerId={playerId}
                        score={score}
                        displayNumberPad={displayNumberPad}
                    />
                </div>
                {
                    (isCurrentGame('surf'))
                        ? <div className='mr-10'>
                            <div className='containerBox'>
                                <CollapseToggleButton
                                    title={'Athlete Heat Scores'}
                                    isCollapsed={scoresCollapse}
                                    setCollapse={setScoresCollapse}
                                    align='left'
                                />
                            </div>
                        </div>
                        : null
                }
                {
                    (scoresCollapse && isCurrentGame('surf'))
                        ? <div></div>
                        : (isCurrentGame('surf'))
                            ? scorecards()
                            : <div>
                                <div className='containerBox size15 mt-5 mb--5'>
                                    <CollapseToggleButton
                                        title={'Current Game'}
                                        isCollapsed={gameCollapse}
                                        setCollapse={setGameCollapse}
                                        align='left'
                                    />
                                </div>
                                {
                                    (gameCollapse)
                                    ? null
                                    : scorecards()
                                }
                            </div>
                }
            </div>
            {(isCurrentGame('surf')) ? displaySeasonStats() : null}
            {(isCurrentGame('surf')) ? displayHeatLog() : null}
            <div className={`z1 bt-0 r-20 bg-tintedMediumDark ${(buttonsVisible) ? 'width-100-percent' : 'w-75'}`}>
                <div className={`button-container mr-5 ml-70 mt-5 ${(buttonsVisible) ? 'show-buttons fadeIn' : 'hide-buttons fadeOut'}`}>
                    <div className='scrollSnapRight'>
                        <div
                            title={`edit ${(isCurrentGame('surf')) ? 'athletes' : 'players'}`}
                            value='Submit'
                            className='glassy button greet p-20 r-10 width-100-percent bg-dark color-yellow bold mt-5'
                            onClick={() => addPlayer()}
                        >
                            {
                                (isCurrentGame('surf'))
                                ? 'athletes'
                                : 'players'
                            }
                        </div>
                    </div>
                    {
                        (isCurrentGame('golf'))
                            ? <div className='scrollSnapRight'>
                                <div
                                    title='edit pars'
                                    value='Submit'
                                    className='glassy button greet p-20 r-10 width-100-percent bg-dark color-yellow bold mt-5'
                                    onClick={() => parEdit()}
                                >
                                    edit pars
                                </div>
                            </div>
                            : null
                    }
                    <div className='scrollSnapRight'>
                        <div
                            title='reset'
                            value='Submit'
                            className='glassy button greet p-20 r-10 width-100-percent bg-dark color-yellow bold mt-5'
                            onClick={() => reset()}
                        >
                            reset
                        </div>
                    </div>
                    <div className='scrollSnapRight'>
                        <div
                            title={(isCurrentGame('surf')) ? 'new heat' : (isCurrentGame('golf')) ? 'new round' : 'new game'}
                            value='Submit'
                            className='glassy button greet p-20 r-10 width-100-percent bg-dark color-yellow bold mt-5'
                            onClick={() => newGame()}
                        >
                            {(isCurrentGame('surf')) ? 'new heat' : (isCurrentGame('golf')) ? 'new round' : 'new game'}
                        </div>
                    </div>
                    <div className='scrollSnapRight'>
                        <div
                            title='clear'
                            value='Submit'
                            className='glassy button greet p-20 r-10 width-100-percent bg-dark color-yellow bold mt-5'
                            onClick={() => clear()}
                        >
                            clear
                        </div>
                    </div>
                </div>
                <PlayerDialog
                    isOpen={playerDialog}
                    game={game}
                    onClose={closeDialog}
                />
                <ParDialog
                    isOpen={parDialog}
                    onClose={closeDialog}
                />
                <div
                    title='menu'
                    className='icon-container r-20 button box-shadow mb-20 ml-15 size25'
                    onClick={toggleButtons}
                >
                    <span className='repositon-icon'>
                        {gameIcons[String(game).replace(' ', '')] || gameIcons['standard']}
                    </span>
                </div>
            </div>
        </div>
        {
            (game !== 'surf')
            ? <div>
                <div className='containerBox size15 mt-5 mb--5'>
                    <CollapseToggleButton
                        title={'Recorded Games'}
                        isCollapsed={logCollapse}
                        setCollapse={setLogCollapse}
                        align='left'
                    />
                </div>
                    {
                        (logCollapse)
                        ? null
                        : displayLog()
                    }
                </div>
            : null
        }
        <div className={`containerBox size15 mt-5 mb--5 ${(game === 'surf')?'pr-20':'' }`}>
            <CollapseToggleButton
                title={'Overall Standings'}
                isCollapsed={standingsCollapse}
                setCollapse={setStandingsCollapse}
                align='left'
            />
        </div>
        {
            (standingsCollapse)
            ? null
            : <div>
                <GameLeaderboard />
                <div className='h-scroll relative flexContainer m-5 bg-veryLite'>
                    {getStandings()}
                </div>
            </div>
        }
        <div className='containerBox ht-100'></div>

    </div>
}

export default PlayerScores;