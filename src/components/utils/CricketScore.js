import React, { useState } from 'react';

const CricketScore = ({ player, index, editPlayer, deletePlayer, game, updateTwoPlayerScores, winner }) => {

    const cricketKey = `${player}Cricket${index}`;
    const getScore = () => localStorage.getItem(cricketKey) || 0;
    const [ score, setScore ] = useState(getScore());
    // eslint-disable-next-line
    const [ edit, setEdit ] = useState(false);
    const dartsScores = ['-','/', 'X', 'O'];
    const getDartScore = (score) => <div className='white'>{dartsScores[score]}</div>;
    // eslint-disable-next-line
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
        newScore = (newScore > 3) ? 0 : newScore;
        updateCricketScore(newScore);       
    }
    // eslint-disable-next-line
    const subtractScore = () => {
        let newScore = Number(score)-1;
        newScore = (newScore < 0) ? 3 : newScore;
        updateCricketScore(newScore);
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
    const getButtonClass = 'glassy button flex3Column p-10 r-10 ' + buttonClass;
    // eslint-disable-next-line
    const dartClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    // eslint-disable-next-line
    const scoreButtonClasses = 'glassy flex3Column button bg-green m-10 r-10 color-neogreen navBranding centeredContent';
    return (
        <div>
            <div className={stockClasses}>
                <div className='flexContainer'>
                    <span 
                        className={getButtonClass} 
                        onClick={() => addScore()}
                    >
                        <div className='p-5 r-5 navBranding'>
                            {getDartScore(score)}
                        </div>
                    </span>
                </div>
            </div>
            {editNav()}
        </div>        
    )

}
   
export default CricketScore;