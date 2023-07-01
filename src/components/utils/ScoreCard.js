import React, { useState } from 'react';

const ScoreCard = ({ player, index, editPlayer, deletePlayer, game, updateTwoPlayerScores, winner }) => {

    const cricketKey = `${player}Cricket${index}`;
    const getScore = () => (localStorage.getItem(player) || 0);
    const [ score, setScore ] = useState(getScore());
    const [ edit, setEdit ] = useState(false);
    const updateScore = (newScore) => {

        localStorage.setItem(player, newScore);
        JSON.parse(localStorage.getItem('players')).map((player, index) => {
            console.log(`updateScore => ${index} player: ${player}: ${localStorage.getItem(player)}`);
            if (Number(localStorage.getItem(player)) < Number(winner)) {
                localStorage.setItem(`player${index}`, 'loser');
                localStorage.setItem('gameStatus', 'inProgress');
            } else {
                localStorage.setItem(`player${index}`, 'winner');
                localStorage.setItem('gameStatus', 'gameOver');
            }
        });
        
        console.log(`updateScore => index: ${index}`)
        console.log(`updateScore => game: ${game}`)
        console.log(`updateScore => winner: ${winner}`)
        console.log(`updateScore => newScore: ${newScore}`)
        console.log(`updateScore => player: ${player}`)
        console.log(`updateScore => playerScore: ${localStorage.getItem(player)}`)
        console.log(`updateScore => gameStatus: ${localStorage.getItem('gameStatus')}`)

        setScore(Number(localStorage.getItem(player)));
    }
    // eslint-disable-next-line
    const updateCricketScore = (newScore) => {
        localStorage.setItem(cricketKey, newScore);
        setScore(localStorage.getItem(cricketKey));
        updateTwoPlayerScores(player, index, localStorage.getItem(cricketKey));
    }
    const addScore = () => {
        let newScore = Number(score) + 1;
        updateScore(newScore);       
    }
    const subtractScore = () => {
        let newScore = Number(score)-1;
        updateScore(newScore);
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
    const stockClasses = 'r-10 m-1 color-yellow bold ';
    const gameClasses = {
        'standard': 'bg-dkGreen', 
        'ping pong': 'bg-dkGreen', 
        'golf': 'bg-dkGreen', 
        'cornhole': 'bg-dkYellow', 
        'horse': 'bg-dkYellow',
        'horseshoes': 'bg-dkRed', 
        'bocci': 'bg-dkRed'
    }
    const buttonClass = 'bg-dark';
    const getButtonClass = 'glassy button flex3Column p-10 r-10 m-1 ' + buttonClass;
    const dartClass = () => (score >= winner) ? 'color-neogreen shakingShaka' : 'white';
    const scoreButtonClasses = 'glassy flex3Column button bg-green r-10 color-neogreen navBranding centeredContent';
    return (
        <div>
            <div className={stockClasses + gameClasses[game]}>
                <div className='flexContainer'>
                    <span className={scoreButtonClasses} onClick={() => subtractScore()}>-</span>
                    <span 
                        className={getButtonClass} 
                        onClick={() => setEdit(!edit)}
                    >
                        <div></div>
                        <div className={dartClass()}>{player}</div>
                        <div className='p-5 r-5 navBranding'>
                            {score}
                        </div>
                    </span>
                    <span className={scoreButtonClasses} onClick={() => addScore()}>+</span>
                </div>
            </div>
            {editNav()}
        </div>        
    )

}
   
export default ScoreCard;