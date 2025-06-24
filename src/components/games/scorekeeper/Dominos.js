import React, { useState, useContext } from 'react';
import Sounds from '../../sound/Sounds.js';
import { PlayerContext } from '../../context/PlayerContext.js';
import initializeData from '../../utils/InitializeData';
import DialogBox from '../../site/DialogBox.js';
import { initPlayers } from './PlayerInit.js';

const Dominos = ({ 
    player, 
    playerIndex, 
    scoreIndex, 
    scoreTotal, 
    treeTotal, 
    getDominoTotal, 
    updateScores, 
    winner 
}) => {

    const getScore = () => {
        const localPlayers = initializeData('players', initPlayers);
        const localPlayer = localPlayers[playerIndex]
        return Number(localPlayer.dominoScore);
    }
    const {
        players,
        setPlayers,
        edit,
        editPlayer,
        deletePlayer
    } = useContext(PlayerContext);
        

    const [score, setScore] = useState(getScore());
    // eslint-disable-next-line
    const [timer, setTimer] = useState(null);
    const [showButtons, setShowButtons] = useState(false);

    const handleTouchStart = () => {
        //console.log(`handleTouchStart`)
        setTimer(setTimeout(() => setShowButtons(true), 1000));
    };

    const handleTouchEnd = () => {
        //console.log(`handleTouchEnd`)
        clearTimeout(timer);
    };

    const quadrantScore = (quadrant) => {

        const playerScore = getScore();
        const scoreStart = treeTotal - (quadrant * 10);
        if (playerScore > scoreStart && playerScore < scoreStart + 10) {
            return '/';
        } else if (playerScore <= scoreStart) {
            return '';
        } else {
            return 'X';
        }
    }
    const getDominoScore = (quadrant) => <div className='white'>{quadrantScore(quadrant)}</div>;
    // eslint-disable-next-line
    const updateScore = (newScore) => {
        localStorage.setItem((player.player || player.name), newScore);
    }
    const updateDominos = () => {
        //console.log(`updateDominos() => getScore(): ${getScore()} player: ${player.name} playerIndex: ${playerIndex} scoreIndex: ${scoreIndex}`);
        updateScores();
    }

    const addScore = () => {
        //const localPlayers = initializeData('players', initPlayers);
        //const localPlayer = localPlayers[playerIndex];
        //const playerScore = Number(localPlayer.dominoScore) || 0;
        console.log(`Dominos => addScore => player: ${JSON.stringify(player, null, 2)}`);
        const newPlayers = [...players];
        const playerScore = Number(newPlayers[playerIndex].dominoScore) || 0;
        if (score < Number(treeTotal) && score > Number(treeTotal - 51)) {
            let newScore = playerScore + 5;
            //const players = [...localPlayers];
            newPlayers[playerIndex].dominoScore = newScore;
            player.dominoScore = newScore;
            console.log(`Dominos => addScore => player: ${JSON.stringify(newPlayers, null, 2)}`);
            setPlayers(newPlayers);
            const currentScore = getScore();
            setScore(currentScore);
            if (currentScore === winner) {
                Sounds.siren();
            } else {
                Sounds.boop(winner, currentScore);
            }
            updateDominos();
        }
    }

    const subtractScore = () => {
        //console.log('subtractScore score: ', score)
        let newScore = Number(score) - 5;
        newScore = (newScore < 0) ? 0 : newScore;
        const newPlayers = initializeData('players', initPlayers);
        newPlayers[playerIndex].dominoScore = newScore;
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
        updateDominos();
    }

    const editNav = () => {
        if (edit) {
            return <div className='subIndex t-0 relative flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                <div className='flex3Column'></div>
                <div className='flex3Column'>
                    <div 
                        title='edit'
                        className='button color-green description r-5 p-5 m-5 bg-yellow' 
                        onClick={() => editPlayer(playerIndex)}
                    >
                        EDIT
                    </div>
                    <div 
                        title='delete'
                        className='button color-red description r-5 p-5 m-5 bg-yellow' 
                        onClick={() => deletePlayer(playerIndex)}
                    >
                        DELETE
                    </div>
                </div>
                <div className='flex3Column'></div>
            </div>
        }
    }
    
    const stockClasses = 'r-10 m-1 color-yellow bold bg-darker';
    const containerClasses = `ht-105 w-110 ${stockClasses}`;
    const buttonClass = 'bg-darker';
    const getButtonClass = 'button flex3Column p-10 r-10 ' + buttonClass;
    // eslint-disable-next-line
    const dominoClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    // eslint-disable-next-line
    const scoreButtonClasses = 'glassy flex3Column button bg-green m-10 r-10 color-neogreen navBranding centeredContent';
    const scoreButton = (quadrant) => {
        return <div className='{stockClasses}'>
                    <div className='flexContainer'>
                        <span className={getButtonClass}>
                            <div className='p-5 r-5 navBranding'>
                                {getDominoScore(quadrant)}
                            </div>
                        </span>
                    </div>
                </div>
    }
    const quadrantClasses = (quadrant, treeTotal) => {

        const playerScore = getScore();
        const startScore = treeTotal - 50;
        const verticalLineScore = startScore + 5;
        const horizontalLineScore = startScore + 10;
        const showVerticalLine = (playerScore >= verticalLineScore) ? true : false;
        const showHorizontalLine = (playerScore >= horizontalLineScore) ? true : false;

        //console.log(`quadrantClasses => treeTotal: ${treeTotal} scoreIndex: ${scoreIndex} score: ${getScore()} playerScore: ${playerScore}`)
        if (quadrant === 1) {
            return (showVerticalLine) ? ((showHorizontalLine) ? 'quadrant on5Right onBottom10' : 'quadrant on5Right') : 'quadrant';
        } else if (quadrant === 2) {
            return (showVerticalLine) ? ((showHorizontalLine) ? 'quadrant on5Left onBottom10' : 'quadrant on5Left') : 'quadrant';
        } else if (quadrant === 3) {
            return (showVerticalLine) ? ((showHorizontalLine) ? 'quadrant on5Right onTop10' : 'quadrant on5Right') : 'quadrant';
        } else if (quadrant === 4) {
            return (showVerticalLine) ? ((showHorizontalLine) ? 'quadrant on5Left onTop10' : 'quadrant on5Left') : 'quadrant';
        }
    }
    const editNavigation = () => {
        return <div>
            <button title='subtract score' className='myButton p-22 size25' onClick={subtractScore}>-</button>
            <button title='add score' className='myButton p-22 size25' onClick={addScore}>+</button>
        </div>
    }
    //console.log(`Dominos => treeTotal: ${treeTotal}`)
    return (
        <div className='centeredContent'>
            <div className={`${containerClasses}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div title='add score' id='container' onClick={() => addScore()}>
                    <div id='top-left' className={quadrantClasses(1, treeTotal)}>{scoreButton(1)}</div>
                    <div id='top-right' className={quadrantClasses(2, treeTotal)}>{scoreButton(2)}</div>
                    <div id='bottom-left' className={quadrantClasses(3, treeTotal)}>{scoreButton(3)}</div>
                    <div id='bottom-right' className={quadrantClasses(4, treeTotal)}>{scoreButton(4)}</div>
                </div>
            </div>
            <DialogBox
                playerIndex={playerIndex}
            />
            {/*editNav()*/}
            {showButtons && (
                editNavigation()
            )}
        </div>

    )

}

export default Dominos;