import React, { useState } from 'react';


const ScoreCard = ({ player, index, editPlayer, deletePlayer }) => {
    const [ score, setScore ] = useState(0);
    const handleChange = (event) => setScore(event.target.value);
    const addScore = () => setScore(score+1);
    const subtractScore = () => setScore(score-1);
    return (
        <div className='r-10 bg-dkGreen m-1 mb-10 pb-20'>
            <div className='color-yellow p-10 bg-dkGreen r-5 mb-20'>{player}:</div>
            <div className="flexContainer mt-5">
                <div className="flex3Column">
                    <div className='button bg-red p-10 m-10 r-10' onClick={() => subtractScore()}>-</div>
                    <div className='button bg-red p-10 m-10 r-10' onClick={() => deletePlayer(index)}>DELETE</div>
                </div>
                <textarea cols='5'
                    className='flex3Column App bg-dark white'
                    type="text"
                    value={score}
                    onChange={e => handleChange}
                />
                <div className="flex3Column">
                    <div className='button bg-green p-10 m-10 r-10' onClick={() => addScore()}>+</div>
                    <div className='button bg-green p-10 m-10 r-10' onClick={() => editPlayer(index)}>EDIT</div>
                </div>
            </div>
        </div>
        
    )

}
   
export default ScoreCard;