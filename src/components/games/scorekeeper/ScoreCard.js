import React, { useState, useEffect, useContext } from 'react';
import Sounds from '../../sound/Sounds';
import Selector from '../../forms/FunctionalSelector';
import { PlayerContext } from '../../context/PlayerContext';
import initializeData from '../../utils/InitializeData';
import DialogBox from '../../site/DialogBox';
import PlayerDialog from '../../utils/PlayerDialog';
import { initPlayers } from './PlayerInit';

const ScoreCard = ({ game, playerIndex, scoreIndex, updateScores, winner }) => {
    
    const {
        players,
        setPlayers,
        edit,
        editPlayer,
        setEdit, 
        deletePlayer
    } = useContext(PlayerContext);

    const player = players[playerIndex];
    const initGolfStats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    const initGolfPutts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const puttsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const getScore = () => {
        if (game === 'golf') {
            //const newPlayers = initializeData('players', initPlayers);
            const newPlayers = [...players] || initializeData('players', initPlayers);
            return newPlayers[playerIndex].golfScores[scoreIndex];
        }
        if (players && player) {
            return player[`${game}Score`] || 0;
        }
    }
    const [score, setScore] = useState(getScore());

    useEffect(() => {
        setScore(getScore());
    }, [game]);

    const toggleEdit = () => {
        setEdit(!edit);
    }
    const updateScore = (newScore) => {
        let total = 0;
        const addToTotal = (value) => total = total + value;
        const newPlayers = [...players] || initializeData('players', initPlayers);
        if (game === 'golf') {
            //const newPlayers = initializeData('players', initPlayers);
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
            if (newPlayers != []) {
                setPlayers(newPlayers);
            }
        } else {
            //player[`${game}Score`] = newScore;
            newPlayers.map((player, index) => {
                if (index === playerIndex) {
                    player[`${game}Score`] = newScore;
                    console.log(`updateScore => ${index} player: ${(player.player || player.name)}: ${newScore}`);
                }
            });
            if (game === 'golf' || (newScore < Number(winner))) {
                localStorage.setItem('gameStatus', 'inProgress');
            } else {
                localStorage.setItem('gameStatus', 'gameOver');
            }
            setPlayers(newPlayers)

        }
        Sounds.boop((game === 'golf') ? 3000 : winner, newScore);
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
    const modifyPlayer = (playerIndex) => {
        editPlayer(playerIndex);
    }
    const editNav = () => {
        if (edit) {
            return <PlayerDialog
                isOpen={edit}
                game={game}
                onClose={toggleEdit}
            />
            /*
            return <DialogBox
                        playerIndex={playerIndex}
                    />
            
            return <div className='t-0 relative flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                <div className="flex3Column"></div>
                <div className="flex3Column">
                    <div className='button color-green description r-5 p-5 m-5 bg-yellow' onClick={() => modifyPlayer(playerIndex)}>EDIT</div>
                    <div className='button color-red description r-5 p-5 m-5 bg-yellow' onClick={() => deletePlayer(playerIndex)}>DELETE</div>
                </div>
                <div className="flex3Column"></div>
            </div>
            */
        }
    }
    const stockClasses = 'r-10 m-1 color-yellow bold ';
    const gameClasses = {
        'standard': 'bg-dkDark',
        'ping pong': 'bg-dkDark',
        'golf': 'bg-dkDark',
        'cornhole': 'bg-dkDark',
        'horse': 'bg-dkDark',
        'horseshoes': 'bg-dkDark',
        'bocci': 'bg-dkDark'
    }
    const buttonClass = (game === 'golf') ? 'bg-darker' : 'bg-darker';
    const getButtonClass = 'glassy button flex3Column p-5 r-10 m-1 ' + buttonClass;
    const dartClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    const scoreButtonClasses = 'flex3Column button bg-lite r-10 color-lite centeredContent';
    const isEagle = (score, par) => (score === (par - 1)) ? true : false;
    const isBoagie = (score, par) => ((score > par) && (score < (Number(par) + 3))) ? true : false;
    const isDoubleBoagie = (score, par) => (score === (Number(par) + 2)) ? true : false;
    const getOuterCSS = (score, winner) => {
        if (game === 'golf' && isEagle(score, winner)) return 'completedSelector r-50-percent pb-5 pt-3';
        if (game === 'golf' && isDoubleBoagie(score, winner)) return 'brdr-light p-5 r-10';
        return 'brdr-transparent r-10';
    }
    const getInnerCSS = (score, winner) => {
        if (game === 'golf' && isBoagie(score, winner) && isDoubleBoagie(score, winner)) return 'brdr-light r-5 font50 ht-50 pt-12 pl-10 pr-10';
        if (game === 'golf' && isBoagie(score, winner)) return 'brdr-light r-5 font50 ht-50 pt-12 pl-10 pr-10 mt-5 mb-5';
        if (game === 'golf' && !isDoubleBoagie(score, winner) && !isEagle(score, winner)) return 'ht-40 p-5 r-5 font50 m-10';
        return 'p-5 r-5 font50 m-10';
    }
    const toggleFW = () => {
        const newPlayers = [...players];
        if (newPlayers[playerIndex].golfFW[scoreIndex] !== true) {
            newPlayers[playerIndex].golfFW[scoreIndex] = true;
        } else {
            newPlayers[playerIndex].golfFW[scoreIndex] = false;
        }
        Sounds.boop(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
        updateScores();
    };
    const toggleGIR = () => {
        const newPlayers = [...players];
        if (newPlayers[playerIndex].golfGIR[scoreIndex] !== true) {
            newPlayers[playerIndex].golfGIR[scoreIndex] = true;
        } else {
            newPlayers[playerIndex].golfGIR[scoreIndex] = false;
        }
        Sounds.boop(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
        updateScores();
    };
    const getFW_Checkbox = () => {
        if (!players[playerIndex].golfFW) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfFW = initGolfStats;
            if (newPlayers != []) {
                setPlayers(newPlayers);
            }
            updateScores();
        }
        const FW = players[playerIndex].golfFW[scoreIndex] || false;
        let checkBox = <input 
                            id='fw'
                            name='fw'
                            className='regular-checkbox button glassy ml-5' 
                            checked 
                            type='checkbox'  
                            onChange={() => console.log(`fw`)}
                        />
        if (FW !== true) {
            checkBox = <input 
                            id='fw'
                            name='fw'
                            className='regular-checkbox button glassy ml-5' 
                            type='checkbox'  
                        />
        }
        return checkBox;
    }
    const getGIR_Checkbox = () => {
        if (!players[playerIndex].golfGIR) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfGIR = initGolfStats;
            if (newPlayers != []) {
                setPlayers(newPlayers);
            }
            updateScores();
        }
        const GIR = players[playerIndex].golfGIR[scoreIndex] || false;
        let checkBox = <input 
                            id='gir'
                            name='gir'
                            className='regular-checkbox button glassy ml-5 mr-10' 
                            checked type='checkbox'
                            onChange={() => console.log(`gir`)}
                        />
        if (GIR !== true) {
            checkBox = <input 
                        id='gir'
                        name='gir'
                        className='regular-checkbox button glassy ml-5 mr-10' 
                        type='checkbox'  
                    />
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
        Sounds.boop(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
        updateScores();
    }
    const getPuttCount_Selector = () => {
        if (!players[playerIndex].golfPutts) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfPutts = initGolfPutts;
            setPlayers(newPlayers);
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
        <div 
            title='fairway'
            className={`columnCenterAlign size20 p-10 mt-5 mb-5 ${scoreButtonClasses}`} 
            onClick={() => toggleFW()}
        >
            <span>FW</span>
            {getFW_Checkbox()}
        </div>
        <div className="flex3Column"></div>
        <div 
            title='green in regulation'
            className={`columnCenterAlign size20 pt-10 pb-10 pl-10 mt-5 mb-5 ${scoreButtonClasses}`} 
            onClick={() => toggleGIR()}
        >
            <span>GIR</span>
            {getGIR_Checkbox()}
        </div>
    </div>

    return (
        <div>
            <div className={stockClasses + gameClasses[game]}>
                <div className='flexContainer'>
                    <span 
                        title='subtract score'
                        className={`navBranding ${scoreButtonClasses}`} 
                        onClick={() => subtractScore()}
                    >
                        -
                    </span>
                    <span
                        title='edit players'
                        className={getButtonClass}
                        onClick={() => setEdit(!edit)}
                    >
                        <div></div>
                        <div className={dartClass()}>{
                            (game === 'golf') 
                            ? null 
                            : (players && player) 
                                ? (players[playerIndex].player || players[playerIndex].name)
                                :null}
                        </div>
                        <div className={getOuterCSS(score, winner)}>
                            <div className={getInnerCSS(score, winner)}>
                                {score}
                            </div>
                        </div>
                    </span>
                    <span 
                        title='add score'
                        className={`navBranding ${scoreButtonClasses}`} 
                        onClick={() => addScore()}
                    >
                        +
                    </span>
                </div>
                {(game === 'golf') ? getGolfLowerNav() : null}
                {(game === 'golf') ? getPuttCount_Selector() : null}
            </div>
            {editNav()}
        </div>
    )
}

export default ScoreCard;