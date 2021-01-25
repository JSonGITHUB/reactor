import React, { useState } from 'react';


const ScoreCard = ({ player, index, editPlayer, deletePlayer }) => {
    const [ score, setScore ] = useState(0);
    const handleChange = (event) => setScore(event.target.value);
    const addScore = () => setScore(score+1);
    const subtractScore = () => setScore(score-1);
    return (
        <div className='r-10 bg-dkGreen p-10 m-1 mb-10'>
            {player}:
            <div className="flexContainer width-100-percent mt-5">
                <div className="flex3Column">
                    <div className='button bg-red p-20 m-20 r-10' onClick={() => subtractScore()}>-</div>
                    <div className='button bg-red p-20 m-20 r-10' onClick={() => deletePlayer(index)}>DELETE</div>
                </div>
                <input
                    className='m-5 flex3Column App bg-dark bold white navBranding'
                    type="text"
                    value={score}
                    onChange={e => handleChange}
                />
                <div className="flex3Column">
                    <div className='button bg-green p-20 m-20 r-10' onClick={() => addScore()}>+</div>
                    <div className='button bg-green p-20 m-20 r-10' onClick={() => editPlayer(index)}>EDIT</div>
                </div>
            </div>
        </div>
        
    )

}
   
export default ScoreCard;