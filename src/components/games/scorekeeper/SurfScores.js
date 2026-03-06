import React, { useState, useEffect, useContext } from 'react';
import getKey from '../../utils/KeyGenerator';
import { newDate } from '../../utils/Dates';
import { losePriority } from './SurfPriority';
//import useGetPriorityColor from './GetPriorityColor';
//import Sounds from '../../sound/Sounds';
import CountdownTimer from './CountdownTimer';
import CollapseToggleButton from '../../utils/CollapseToggleButton';
import { PlayerContext } from '../../context/PlayerContext';
import ScoreBoard from './ScoreBoard';
import jerseyColors from './JerseyColors';

const SurfScores = ({ 
    heatLength, 
    time,
    setTime,
    recordHeatScores,
    priorityCollapse, 
    setPriorityCollapse,
    getSurfScore
}) => {

    const {
        players,
        setPlayers,
        playersInGame
    } = useContext(PlayerContext);
    
    //const [timerOn, setTimerOn] = useState(false);
    const [timesUp, setTimesUp] = useState(false);
    const [scoreboardCollapse, setScoreboardCollapse] = useState(true);

    const getPriorityColor = (prio) => {
        return players.map((player) => (player.surfPriority === prio)
            ? jerseyColors[player.surfJerseyColor]
            : null
        )
    }
    const getPriorityAthlete = (prio) => {
        return players.map((player, index) => (player.surfPriority === prio)
            ? index
            : null
        )
    }
    useEffect(() => {
        /*
        if (timesUp) {
            setTimerOn(false);
        }
        */
    }, [timesUp]);

    useEffect(() => {
        console.log(`useEffect => time: ${time}`);
    }, [time]);

    /* 
    const newHeatTimer = () => {
        setTime(heatLength*60);
        //setTimerOn(false);
    } 
    */

    useEffect(() => {
        setTime(heatLength * 60);
    }, [heatLength, setTime]);
    
    const getPlayers = () => {
        let index = 0;
        players.forEach((player) => {
            if (player.surf) {
                index++ 
            }
        });
        return index;
    }
    
    const GetPriorityItem = ({
        index
    }) => <div 
            title={(String(getPriorityAthlete(index)).replace(/,/g, '') === '') ? `priority ${index}` : `lose priority ${index} - ${players[Number(String(getPriorityAthlete(index)).replace(/,/g, ''))].name}`}
            className={`button width-100-percent r-10 m-5 w-75 size40 pt-20 pb-20 bg-${String(getPriorityColor(index)).replace(/,/g, '')}`} 
            key={getKey(`priorityFlag`)} 
            onClick={() => losePriority(index, players, setPlayers)}
        >
            {index/*players[Number(String(getPriorityAthlete(index)).replace(/,/g, ''))].name*/}
        </div>
       
    const GetPriorityDisplay = () => <div className='containerDetail bg-lite ml-5 mr-5'>
                     <div className='containerBox color-yellow'>
                        <CollapseToggleButton
                            title={'Priority:'}
                            isCollapsed={priorityCollapse}
                            setCollapse={setPriorityCollapse}
                            align='left'
                        />
                    </div>
                    <div className='pb-5 flexContainer color-dark text-outline-light' >
                    {
                        (!priorityCollapse)
                        ? playersInGame().map((player, index) => (player.surf) 
                            ? <div key={getKey(`${player.name}${index}`)} className={`mr-10 flex${getPlayers()}Column`}>
                                <GetPriorityItem
                                    index={index+1}
                                />
                            </div>
                            : null
                        )
                        : null
                    }
                    </div>
                </div>
        
    const addNewScore = (playerId) => {
        const emptyScore = players[playerId].surfScores.indexOf('');
        const zeroScore = players[playerId].surfScores.indexOf(0);
        const isScoringComplete = (zeroScore === -1 && emptyScore === -1) ? true : false;
        if (isScoringComplete) {
            alert(`${players[playerId].name} has ${players[playerId].surfScores.length} waves. Selet the wave/score you wish to edit in the scorecard below.`)
            return
        }
        const scoreId = (zeroScore !== -1 && zeroScore < emptyScore) ? zeroScore : emptyScore;
        const score = players[playerId].surfScores[scoreId];
        getSurfScore(scoreId, playerId, score);
    }
        
    const getScoreDisplay = () => {
        return <div className='containerDetail bg-lite m-5'>
                        <div className='containerBox color-yellow'>
                            <CollapseToggleButton
                                title={`Scoreboard - ${newDate()}`}
                                isCollapsed={scoreboardCollapse}
                                setCollapse={setScoreboardCollapse}
                                align='left'
                            />
                        </div>
                        {/*
                            (!scoreboardCollapse)
                            ? <div className='containerBox flexContainer h-scroll'>
                                    {players.map((player, index) => <div 
                                                                        key={getKey(`SurfAthlete${index}`)}
                                                                        className={` button flex${players.length}Column`} 
                                                                        onClick={() => addNewScore(index)}
                                                                    >
                                                <GetAthleteScore
                                                    index={index}
                                                    timesUp={timesUp}
                                                />
                                            </div>
                                    )}
                                </div>
                            : null
                        */}             
                        <ScoreBoard 
                            scoreboardCollapse={scoreboardCollapse}
                            addNewScore={addNewScore}
                            timesUp={timesUp}
                        />
                    </div>
    }

    return <React.Fragment>
                <div className='sticky65 z4 bg-stealthLite pb-1'>
                    <CountdownTimer 
                        time={time}
                        setTimesUp={setTimesUp}
                        recordHeatScores={recordHeatScores}
                    />
                    <GetPriorityDisplay />
                </div>
                <div className='z5'>
                    {getScoreDisplay()}
                </div>
            </React.Fragment>

}

export default SurfScores;