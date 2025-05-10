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
import initializeData from '../../utils/InitializeData';
import jerseyColors from './JerseyColors';

const SurfScores = ({ 
    heatLength, 
    setStartTime, 
    setSurfScore, 
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
    const [time, setTime] = useState(Number(initializeData('surfWinner', heatLength) * 60));
    const [playerIdScored, setPlayerIdScored] = useState();
    const [scoreIdScored, setScoreIdScored] = useState();
    const [scoreboardCollapse, setScoreboardCollapse] = useState(true);

    const getPriorityColor = (prio) => {
        return players.map((player) => (player.surfPriority == prio)
            ? jerseyColors[player.surfJerseyColor]
            : null
        )
    }
    const getPriorityAthlete = (prio) => {
        return players.map((player, index) => (player.surfPriority == prio)
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
        newHeatTimer();
    }, [heatLength]);
    
    const newHeatTimer = () => {
        setTime(heatLength*60);
        //setTimerOn(false);
    }
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
            {index}
        </div>
       
    const GetPriorityDisplay = () => <div className='mr-10'>
                <div className='containerBox'>
                    <div className='bold'/*flex2Column*/>
                        <CollapseToggleButton
                            title={'PRIORITY:'}
                            isCollapsed={priorityCollapse}
                            setCollapse={setPriorityCollapse}
                            align='left'
                        />
                    </div>
                    <div className='flexContainer color-dark text-outline-light pt-10' >
                    {
                        (!priorityCollapse)
                        ? playersInGame().map((player, index) => (player.surf) 
                            ? <div key={getKey(`${player.name}${index}`)} className={`m-5 flex${getPlayers()}Column`}>
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
        </div>
        
    const setNewScore = (playerId, scoreId) => {
        const newScore = prompt(`Enter ${players[playerId].player || players[playerId].name}'s score for wave ${scoreId + 1}: `, '');
        //setSurfScore(playerId, scoreId, newScore);
        setSurfScore(newScore);
        setPlayerIdScored(playerId);
        setScoreIdScored(scoreId);
    }
    const addNewScore = (playerId) => {
        const emptyScore = players[playerId].surfScores.indexOf('');
        const zeroScore = players[playerId].surfScores.indexOf(0);
        const isScoringComplete = (zeroScore === -1 && emptyScore === -1) ? true : false;
        if (isScoringComplete) {
            alert(`${players[playerId].name} has ${players[playerId].surfScores.length} waves. Selet the wave/score you wish to edit in the scorecard below.`)
            return
        }
        const scoreId = (zeroScore !== -1 && zeroScore < emptyScore) ? zeroScore : emptyScore;
        const isPlayerRepeat = (playerIdScored === playerId) ? true : false;
        const isScoreRepeat = (scoreIdScored === scoreId) ? true : false;
        const score = players[playerId].surfScores[scoreId];
        //setNewScore(playerId, scoreId);
        getSurfScore(scoreId, playerId, score);
    }
        
    const getScoreDisplay = () => {
        return <div className='mr-10'>
                    <div className=''>
                        <div className='containerBox color-lite'>
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
                        */
                        }             
                        <ScoreBoard 
                            scoreboardCollapse={scoreboardCollapse}
                            addNewScore={addNewScore}
                            timesUp={timesUp}
                        />
                    </div>
                </div>
    }

    return <React.Fragment>
                <div className='bg-mediumDark sticky50 z1'>
                    <CountdownTimer 
                        time={time}
                        setTimesUp={setTimesUp}
                        recordHeatScores={recordHeatScores}
                    />
                    <GetPriorityDisplay />
                </div>
                {getScoreDisplay()}
            </React.Fragment>

}

export default SurfScores;