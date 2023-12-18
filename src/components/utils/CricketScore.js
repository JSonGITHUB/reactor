import React, { useState, useEffect } from 'react';
import Sounds from './Sounds.js';

const CricketScore = ({ player, playerIndex, scoreIndex, editPlayer, deletePlayer, game, updateScores, winner }) => {

    const [players, setPlayers] = useState(JSON.parse(localStorage.getItem('players')));
    const getScore = () => (players[playerIndex].cricketScores[scoreIndex]) || 0;
    const [score, setScore] = useState(getScore());
    // eslint-disable-next-line
    const [edit, setEdit] = useState(false);
    const dartsScores = ['-', '/', 'X', 'O'];
    const getDartScore = (score) => <div className='white'>{dartsScores[score]}</div>;

    const addScore = () => {
        let newScore = Number(score) + 1;
        newScore = (newScore > 3) ? 0 : newScore;
        const newPlayers = [...players];
        let total = 0;
        newPlayers[playerIndex].cricketScores[scoreIndex] = newScore;
        newPlayers[playerIndex].cricketScores.map((score, index) => total = total + score);
        newPlayers[playerIndex].dartsScore = total;
        //alert(`addScore => newPlayers[${playerIndex}].dartsScore: ${newPlayers[playerIndex].dartsScore}`)
        localStorage.setItem('players', JSON.stringify(newPlayers));
        //setPlayers(JSON.parse(localStorage.getItem(players)));
        Sounds.playSound(winner, total);
        updateScores();
        setScore(newScore);
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
    const buttonClass = 'bg-darker';
    const getButtonClass = 'button flex3Column p-10 r-10 ' + buttonClass;
    // eslint-disable-next-line
    const dartClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    // eslint-disable-next-line
    const scoreButtonClasses = 'flex3Column button bg-green r-10 color-neogreen navBranding centeredContent';
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