import React, { useState } from 'react';

const ScoreCard = ({ player, index, editPlayer, deletePlayer, game, updateTwoPlayerScores, winner }) => {

    const darts = (game !== 'darts') ? false : true;
    const cricketKey = `${player}Cricket${index}`;
    const getScore = () => (darts) ? (localStorage.getItem(cricketKey) || 0) : (localStorage.getItem(player) || 0);
    const [ score, setScore ] = useState(getScore());
    const [ edit, setEdit ] = useState(false);
    const dartsScores = ['-','/', 'X', 'O'];
    const getDartScore = (score) => <div className='white'>{dartsScores[score]}</div>;
    const updateScore = (newScore) => {
        localStorage.setItem(player, newScore);
        setScore(Number(localStorage.getItem(player)));
    }
    const updateCricketScore = (newScore) => {
        localStorage.setItem(cricketKey, newScore);
        setScore(localStorage.getItem(cricketKey));
        updateTwoPlayerScores(player, index, localStorage.getItem(cricketKey));
    }
    const addScore = () => {
        let newScore = Number(score) + 1;
        if(game === 'darts') {
            newScore = (newScore > 3) ? 0 : newScore;
            updateCricketScore(newScore);
        } else {
            updateScore(newScore);
        }        
    }
    const subtractScore = () => {
        let newScore = Number(score)-1;
        if(game === 'darts') {
            newScore = (newScore < 0) ? 3 : newScore;
            updateCricketScore(newScore);
        } else {
            updateScore(newScore);
        } 
    }
    const editNav = () => {
        if (edit) {
            return <div className='flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                        <div className="flex3Column"></div>
                        <div className="flex3Column">
                            <div className='button color-green description r-5 p-5 m-5 bg-yellow' onClick={() => editPlayer(index)}>EDIT</div>
                            <div className='button color-red description r-5 p-5 m-5 bg-yellow' onClick={() => deletePlayer(index)}>DELETE</div>
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
        'darts': 'bg-darker',
        'horse': 'bg-dkYellow',
        'horseshoes': 'bg-dkRed', 
        'bocci': 'bg-dkRed'
    }
    const buttonClass = (darts) ? 'bg-darker' : 'bg-dark';
    const getButtonClass = 'button flex3Column p-10 m-10 r-10 ' + buttonClass;
    const getClick = () => {
        if (game==='darts'){
            return addScore();
        }
        return setEdit(!edit);
    }
    const dartClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    const scoreButtonClasses = 'flex3Column button bg-green p-10 m-20 r-10 color-neogreen navBranding';
    return (
        <div className={stockClasses + gameClasses[game]}>
            <div className='flexContainer'>
                {
                    (game!=='darts') 
                    ? <span className={scoreButtonClasses} onClick={() => subtractScore()}>-</span> 
                    : <span></span>
                }
                <span 
                    className={getButtonClass} 
                    onClick={() => getClick()}
                >
                    <div></div>
                    {
                        (game === 'darts') 
                        ? <div></div> 
                        : <div className={dartClass()}>{player}: </div>
                    }
                    <div className='p-5 r-5 navBranding'>
                        {
                            (darts) 
                            ? getDartScore(score) 
                            : score
                        }
                    </div>
                </span>
                {
                    (game!=='darts') 
                    ? <span className={scoreButtonClasses} onClick={() => addScore()}>+</span> 
                    : <div></div>
                }
            </div>
            {editNav()}
        </div>
        
    )

}
   
export default ScoreCard;