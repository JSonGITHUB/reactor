import React, { useState, useEffect } from 'react';
import LongPressButton from './LongPressButton.js';

const Dominos = ({ player, index, scoreTotal, editPlayer, deletePlayer, getDominoTotal, updateTwoPlayerScores, winner }) => {
    
    const dominoKey = `${player}Domino${index}`;
    const indexArray = [0,1,2,3]
    const getScore = () => {
        let newScore = 0;
        indexArray.map(scoreBox => {
            const dominoKey = `${player}Domino${scoreBox}`;
            newScore = newScore + Number(localStorage.getItem(dominoKey) || 0);
        });
        return newScore;
    }
    
    const [ score, setScore ] = useState(getScore());
    const [ scoreTotalState, setScoreTotal ] = useState(scoreTotal);
    // eslint-disable-next-line
    const [edit, setEdit] = useState(false);
    const [timer, setTimer] = useState(null);
    const [showButtons, setShowButtons] = useState(false);

    const handleTouchStart = () => {
        console.log(`handleTouchStart`)
        setTimer(setTimeout(() => setShowButtons(true), 1000));
    };

    const handleTouchEnd = () => {
        clearTimeout(timer);
        //setShowButtons(false);
    };

    const quadrantScore = (quadrant) => {

        //const playerScore = Number(localStorage.getItem(dominoKey));
        const playerScore = score;
        const scoreStart = scoreTotalState - (quadrant*10);
        console.log(`playerScore: ${playerScore} \nscoreTotalState: ${scoreTotalState} \nscoreStart: ${scoreStart} \nquadrant: ${quadrant}`)
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
        localStorage.setItem(player, newScore);
        //setScore(Number(localStorage.getItem(player)));
    }
    const updateDominos = () => {
        updateTwoPlayerScores(player, index, localStorage.getItem(dominoKey));
    }
    const addScore = () => {
        
        const playerScore = Number(localStorage.getItem(dominoKey));

        if (score < Number(scoreTotalState) && score > Number(scoreTotalState-51)) {
            let newScore = playerScore + 5;
            localStorage.setItem(dominoKey, newScore);
            //setScore(newScore);
            //console.log(`addScore => scoreTotalState: ${scoreTotalState}  score: ${score}  newScore: ${newScore} getScore(): ${getScore()} getDominoTotal(): ${playerScore}`);  
            updateDominos(); 
        }
    }

    const subtractScore = () => {
        console.log('subtractScore score: ', score)
        let newScore = Number(score)-5;
        newScore = (newScore < 0) ? 0 : newScore;
        localStorage.setItem(dominoKey, newScore);
        updateDominos();
    }

    const editNav = () => {
        if (edit) {
            return <div className='subIndex t-0 relative flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                        <div className="flex3Column"></div>
                        <div className="flex3Column">
                            <div className='button color-green description r-5 p-5 m-5 bg-yellow' onClick={() => editPlayer(index)}>EDIT</div>
                            <div className='button color-red description r-5 p-5 m-5 bg-yellow' onClick={() => deletePlayer(index)}>DELETE</div>
                        </div>                    
                        <div className="flex3Column"></div>
                    </div>
        }
    }
    const stockClasses = 'r-10 m-1 color-yellow bold bg-darker';
    const buttonClass = 'bg-darker';
    const getButtonClass = 'button flex3Column p-10 r-10 ' + buttonClass;
    // eslint-disable-next-line
    const dominoClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    // eslint-disable-next-line
    const scoreButtonClasses = 'glassy flex3Column button bg-green m-10 r-10 color-neogreen navBranding centeredContent';
    const scoreButton = (quadrant) => {
       return <div className={stockClasses}>
                <div className='flexContainer'>
                    <span className={getButtonClass}>
                        <div className='p-5 r-5 navBranding'>
                            {getDominoScore(quadrant)}
                        </div>
                    </span>
                </div>
            </div>
    }
    const quadrantClasses = (quadrant) => {

        const playerScore = Number(localStorage.getItem(dominoKey));
            
        if (quadrant === 1) {
            return (playerScore > 4) ? ((playerScore > 9) ? "quadrant on5Right onBottom10" : "quadrant on5Right") : "quadrant";
        } else if (quadrant === 2) {
            return (playerScore > 4) ? ((playerScore > 9) ? "quadrant on5Left onBottom10" : "quadrant on5Left") : "quadrant";
        } else if (quadrant === 3) {
            return (playerScore > 4) ? ((playerScore > 9) ? "quadrant on5Right onTop10" : "quadrant on5Right") : "quadrant";
        } else if (quadrant === 4) {
            return (playerScore > 4) ? ((playerScore > 9) ? "quadrant on5Left onTop10" : "quadrant on5Left") : "quadrant";
        }
    }
    const editNavigation = () => {
        return <div>
                    <button className='myButton p-22 size25' onClick={subtractScore}>-</button>
                    <button className='myButton p-22 size25' onClick={addScore}>+</button>
                </div>
    }
    return (
        <div>
            <div className='yellow'>{scoreTotal}</div>
            <div className={stockClasses} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div id="container" onClick={() => addScore()}>
                    <div id="top-left" className={quadrantClasses(1)}>{scoreButton(1)}</div>
                    <div id="top-right" className={quadrantClasses(2)}>{scoreButton(2)}</div>
                    <div id="bottom-left" className={quadrantClasses(3)}>{scoreButton(3)}</div>
                    <div id="bottom-right" className={quadrantClasses(4)}>{scoreButton(4)}</div>
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