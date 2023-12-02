import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator.js';
import { newDate } from './Dates.js';
import { losePriority } from './SurfPriority.js';
import getAthleteScore from './GetAthleteScore.js';
import getPriorityColor from './GetPriorityColor.js';
import Sounds from './Sounds.js';

const SurfScores = ({ players, setPlayers, heatLength, isWinner, editPlayer, deletePlayer, setStartTime}) => {
    console.log(`SurfScores => heatLength: ${heatLength}`)
    console.log(`SurfScores => surfWinner: ${localStorage.getItem('surfWinner')}`)
    const [timerOn, setTimerOn] = useState(false);
    const [timesUp, setTimesUp] = useState(false);
    const [time, setTime] = useState((Number(localStorage.getItem('surfWinner')) || heatLength) * 60); // Initial time in seconds (e.g., 1 hour)
   
    useEffect(() => {
        let intervalId;
        if (timerOn) {
            intervalId = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime - 1;
                    if (newTime <= 10 && newTime > 0 ) {
                        Sounds.playSound(0, newTime);
                    }
                    if (newTime <= 0) {
                        Sounds.playSound(0, newTime);
                        clearInterval(intervalId);
                        setTimesUp(true);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [timerOn]);

    useEffect(() => {
        console.log(`SurfScores => time: ${time}`)
        if (time == 0) {
            //getAthleteScore();
        }
    }, [time]);

    useEffect(() => {
        if (timesUp) {
            setTimerOn(false);
            //setTime(heatLength);
            console.log(`heatLength: ${heatLength}`)
            setTimesUp(true);
        }
    }, [timesUp]);

    const toggleTimer = () => {
        if (timerOn) {
            setTimerOn(false)
        } else {
            console.log(`time: ${time}`)
            if (time === 0) {
                setTime(heatLength*60);
            }
            setTimerOn(true)
            setStartTime();
        }
    }
    const restartTimer = () => {
        setTime(heatLength*60);
        setTimerOn(true);
    }

    const surfClass = (playerIndex) => 'flex3Column p-20 size25 bold' + ((isWinner(playerIndex)) ? ' color-neogreen shakingShaka mt-20' : '');
    const getTimerButtonClasses = () => {
        const timerButtonClasses = timerOn ? 'bg-lite' : 'bg-tinted';
        return timerButtonClasses;
    }
    const getTimerClasses = () => {
        const timerClasses = (time < 120) ? 'blinking-fade' : '';
        return timerClasses;
    }
    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    const jerseyColors = ['white', 'yellow', 'neogreen', 'black', 'blue', 'orange', 'pink', 'red'];
    const getPriorityItem = (index) => {
            return <div className={`button flex${players.length}Column r-10 m-5 w-75 size40 pt-20 pb-20 bg-${getPriorityColor(players, index)}`} key={getKey(`priorityFlag`)} onClick={() => losePriority(players, setPlayers, index)}>
                        {index}
                    </div>
    }
       
    const getPriorityDisplay = () => {
        return <div>
            <div className='centeredContent bold size25 p-10 bg-tinted r-10 ml-10 mr-10 mt-10 mb-5'>
                <div>Priority</div>
                <div className='flexContainer ml-5 mt-10 mr-5 bg-darker p-10 width-100-percent r-10 color-dark text-outline-light' >
                    {players.map((player, index) => getPriorityItem(index+1))}
                </div>
            </div>
        </div>
    }
        
    const getScoreDisplay = () => {
        return <div>
            <div className='bold size25 p-10 bg-tinted color-lite r-10 ml-10 mr-10 mt-10 mb-15'>
                <div className='color-lite m-10'>Scoreboard - {newDate()}</div>
                <div className='flexContainer ml-5 mr-5 width-100-percent' >
                    {players.map((player, index) => getAthleteScore(players, index))}
                </div>
            </div>
        </div>
    }

    return <React.Fragment>
        {getScoreDisplay()}
        {getPriorityDisplay()}
        <div className='flexContainer p-5 bg-tinted r-10 m-10'>
            <div className={`flex3Column m-5 r-10 bold size20 p-20 color-lite ${getTimerButtonClasses()}`} onClick={() => toggleTimer()}>
                {(timerOn) ? 'STOP' : 'START'}
            </div>
            <div className='flex3Column m-5 r-10 bg-tinted bold size25 p-20 color-lite'>
                <span className={getTimerClasses()}>
                    {formatTime(time)}
                </span>
            </div>
            <div className={`flex3Column m-5 r-10 bold size20 p-20 color-lite ${getTimerButtonClasses()}`} onClick={() => restartTimer()}>
                RESTART
            </div>
        </div>
    </React.Fragment>

}

export default SurfScores;