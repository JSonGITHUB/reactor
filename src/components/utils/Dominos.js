import React, { useState, useEffect } from 'react';
import LongPressButton from './LongPressButton';
import Sounds from './Sounds.js';

const Dominos = ({ player, playerIndex, scoreIndex, scoreTotal, treeTotal, editPlayer, deletePlayer, getDominoTotal, updateScores, winner }) => {

    //const dominoKey = `${(player.player||player.name)}Domino${scoreIndex}`;
    const indexArray = [0, 1, 2, 3];
    const getScore = () => {
        //let newScore = 0;
        //indexArray.map(scoreBox => {
        //const dominoKey = `${(player.player||player.name)}Domino${scoreBox}`;
        //console.log(`getScore => dominoKey: ${dominoKey}`)
        //console.log(`getScore => newScore: ${Number(localStorage.getItem(dominoKey) || 0)}`)
        //newScore = newScore + Number(localStorage.getItem(dominoKey) || 0);
        //});
        //return newScore;
        const localPlayers = JSON.parse(localStorage.getItem('players'));
        const localPlayer = localPlayers[playerIndex]
        return Number(localPlayer.dominoScore);
    }

    const [score, setScore] = useState(getScore());
    const [scoreTotalState, setScoreTotal] = useState(scoreTotal);
    // eslint-disable-next-line
    const [edit, setEdit] = useState(false);
    const [timer, setTimer] = useState(null);
    const [showButtons, setShowButtons] = useState(false);

    const handleTouchStart = () => {
        console.log(`handleTouchStart`)
        setTimer(setTimeout(() => setShowButtons(true), 1000));
    };

    const handleTouchEnd = () => {
        console.log(`handleTouchEnd`)
        clearTimeout(timer);
        //setShowButtons(false);
    };

    const quadrantScore = (quadrant) => {

        //const playerScore = Number(localStorage.getItem(dominoKey));
        //const playerScore = scoreTotalState;
        const playerScore = getScore();
        const scoreStart = treeTotal - (quadrant * 10);
        //console.log(`player: ${player.name} dominoKey: ${dominoKey} playerScore: ${playerScore} \nscoreTotalState: ${scoreTotalState} \ntreeTotal: ${treeTotal} \nscoreStart: ${scoreStart} \nquadrant: ${quadrant}`)
        console.log(`player: ${player.name} playerScore: ${playerScore} \nscoreTotalState: ${scoreTotalState} \ntreeTotal: ${treeTotal} \nscoreStart: ${scoreStart} \nquadrant: ${quadrant}`)
        //const scoreEnd = scoreStart+((quadrant-1)*10);
        if (playerScore > scoreStart && playerScore < scoreStart + 10) {
            return "/";
        } else if (playerScore <= scoreStart) {
            return "";
        } else {
            return "X";
        }

        //let quadrantScore = ['-','/', 'X'];
        //return score;
    }
    const getDominoScore = (quadrant) => <div className='white'>{quadrantScore(quadrant)}</div>;
    // eslint-disable-next-line
    const updateScore = (newScore) => {
        localStorage.setItem((player.player || player.name), newScore);
        //setScore(Number(localStorage.getItem(player)));
    }
    const updateDominos = () => {
        console.log(`updateDominos() => getScore(): ${getScore()} player: ${player.name} playerIndex: ${playerIndex} scoreIndex: ${scoreIndex}`);
        updateScores();
    }

    const addScore = () => {

        //const playerScore = Number(localStorage.getItem(dominoKey));
        const localPlayers = JSON.parse(localStorage.getItem('players'));
        const localPlayer = localPlayers[playerIndex];
        //const playerScore = Number(localStorage.getItem('players').split(',')[playerIndex]) || 0;
        const playerScore = Number(localPlayer.dominoScore) || 0;

        //console.log(`addScore => dominoKey: ${dominoKey} treeTotal: ${treeTotal} scoreTotalState: ${scoreTotalState}  score: ${score} getScore(): ${getScore()} getDominoTotal(): ${playerScore}`);
        console.log(`addScore => treeTotal: ${treeTotal} scoreTotalState: ${scoreTotalState}  score: ${score} getScore(): ${getScore()} getDominoTotal(): ${playerScore}`);

        if (score < Number(treeTotal) && score > Number(treeTotal - 51)) {
            let newScore = playerScore + 5;
            const players = JSON.parse(localStorage.getItem('players'));
            players[playerIndex].dominoScore = newScore;
            localStorage.setItem('players', JSON.stringify(players));
            //localStorage.setItem(dominoKey, newScore);
            const currentScore = getScore();
            setScore(currentScore);
            if (currentScore == winner) {
                Sounds.playSiren();
            } else {
                Sounds.playSound(winner, currentScore);
            }
            //console.log(`addScore => dominoKey: ${dominoKey} treeTotal: ${treeTotal} scoreTotalState: ${scoreTotalState}  score: ${score}  newScore: ${newScore} getScore(): ${getScore()} getDominoTotal(): ${playerScore}`);
            console.log(`addScore => treeTotal: ${treeTotal} scoreTotalState: ${scoreTotalState}  score: ${score}  newScore: ${newScore} getScore(): ${getScore()} getDominoTotal(): ${playerScore}`);
            updateDominos();
        }
    }

    const subtractScore = () => {
        console.log('subtractScore score: ', score)
        let newScore = Number(score) - 5;
        newScore = (newScore < 0) ? 0 : newScore;
        const players = JSON.parse(localStorage.getItem('players'));
        players[playerIndex].dominoScore = newScore;
        localStorage.setItem('players', JSON.stringify(players));

        //localStorage.setItem(dominoKey, newScore);
        updateDominos();
    }

    const editNav = () => {
        if (edit) {
            return <div className='subIndex t-0 relative flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                <div className="flex3Column"></div>
                <div className="flex3Column">
                    <div className='button color-green description r-5 p-5 m-5 bg-yellow' onClick={() => editPlayer(playerIndex)}>EDIT</div>
                    <div className='button color-red description r-5 p-5 m-5 bg-yellow' onClick={() => deletePlayer(playerIndex)}>DELETE</div>
                </div>
                <div className="flex3Column"></div>
            </div>
        }
    }
    
    const stockClasses = 'r-10 m-1 color-yellow bold bg-darker';
    const containerClasses = `ht-105 w-150 ${stockClasses}`;
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

        console.log(`quadrantClasses => treeTotal: ${treeTotal} scoreIndex: ${scoreIndex} score: ${getScore()} playerScore: ${playerScore}`)
        if (quadrant === 1) {
            return (showVerticalLine) ? ((showHorizontalLine) ? "quadrant on5Right onBottom10" : "quadrant on5Right") : "quadrant";
        } else if (quadrant === 2) {
            return (showVerticalLine) ? ((showHorizontalLine) ? "quadrant on5Left onBottom10" : "quadrant on5Left") : "quadrant";
        } else if (quadrant === 3) {
            return (showVerticalLine) ? ((showHorizontalLine) ? "quadrant on5Right onTop10" : "quadrant on5Right") : "quadrant";
        } else if (quadrant === 4) {
            return (showVerticalLine) ? ((showHorizontalLine) ? "quadrant on5Left onTop10" : "quadrant on5Left") : "quadrant";
        }
    }
    const editNavigation = () => {
        return <div>
            <button className='myButton p-22 size25' onClick={subtractScore}>-</button>
            <button className='myButton p-22 size25' onClick={addScore}>+</button>
        </div>
    }
    return (
        <div className='centeredContent'>
            <div className={containerClasses} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div id="container" onClick={() => addScore()}>
                    <div id="top-left" className={quadrantClasses(1, treeTotal)}>{scoreButton(1)}</div>
                    <div id="top-right" className={quadrantClasses(2, treeTotal)}>{scoreButton(2)}</div>
                    <div id="bottom-left" className={quadrantClasses(3, treeTotal)}>{scoreButton(3)}</div>
                    <div id="bottom-right" className={quadrantClasses(4, treeTotal)}>{scoreButton(4)}</div>
                </div>
            </div>
            {editNav()}
            {showButtons && (
                editNavigation()
            )}
        </div>

    )

}

export default Dominos;