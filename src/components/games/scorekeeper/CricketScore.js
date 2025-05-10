import React, { useState, useContext, useEffect } from 'react';
import Sounds from '../../sound/Sounds.js';
import { PlayerContext } from '../../context/PlayerContext';
import { validate } from 'uuid';
import initializeData from '../../utils/InitializeData';
import DialogBox from '../../site/DialogBox';
import PlayerDialog from '../../utils/PlayerDialog';
import { initNewPlayer, initPlayers } from './PlayerInit';

const CricketScore = ({ playerIndex, scoreIndex, updateScores, winner }) => {

    const {
        players,
        setPlayers,
        edit,
        setEdit,
        editPlayer,
        deletePlayer
    } = useContext(PlayerContext);

    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        setRefresh((prev) => !prev);
    }, [players]);

    const getScore = () => {
        if (players !== '[]' && players != [] && validate(players)) {
            return (players[playerIndex].cricketScores)
                    ? (players[playerIndex].cricketScores[scoreIndex]) 
                    : 0;
        }
        const localPlayers = initializeData('players', initPlayers);
        return (localPlayers[playerIndex].cricketScores)
            ? (localPlayers[playerIndex].cricketScores[scoreIndex])
            : 0;
        
    }
    const [score, setScore] = useState(getScore());
    useEffect(() => {
        const player = players[playerIndex];
        if (!players || players.length == 0 || players === '[]') {
            const localPlayers = initializeData('players', initPlayers);
            if (localPlayers) {
                const newPlayers = [...localPlayers];
                setPlayers(newPlayers)
            }
            throw new Error('Players not found');
        } else if (!player) {
            throw new Error('Player not found');
        } else if (!Array.isArray(player.cricketScores)) {
            throw new Error('cricketScores not found');
        } else {
            const cricketScores = player.cricketScores;
            if (players != [] && players != '[]') {
                if (players[playerIndex].cricketScores && players[playerIndex].cricketScores != [] && players[playerIndex].cricketScoresv != '[]') {
                    setScore(players[playerIndex].cricketScores[scoreIndex]);
                    setRefresh((prev) => !prev);
                }
            }
        }
    }, [players]);
    // eslint-disable-next-line
    const dartsScores = ['-', '/', 'X', 'O'];
    const getDartScore = (score) => <div className='white'>{dartsScores[score]}</div>;

    const addScore = () => {
        let newScore = Number(score) + 1;
        newScore = (newScore > 3) ? 0 : newScore;
        const newPlayers = [...players];
        let total = 0;
        newPlayers[playerIndex].cricketScores[scoreIndex] = newScore;
        newPlayers[playerIndex].cricketScores.forEach((score) => {
            total = total + score
        });
        newPlayers[playerIndex].dartsScore = total;
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
        
        Sounds.boop(winner, total);
        updateScores();
        setScore(newScore);
        setRefresh(!refresh);
    }
    const toggleEdit = () => setEdit(!edit);
    const editNav = () => {
        if (edit) {
            return <div className='subIndex t-0 relative flexContainer color-yellow p-1 bg-dkGreen r-5 bold'>
                <div className="flex3Column"></div>
                <div className="flex3Column">
                    <div 
                        title='edit'
                        className='button color-green description r-5 p-5 m-5 bg-yellow' 
                        onClick={() => editPlayer(playerIndex)}
                    >
                        EDIT
                    </div>
                    <div 
                        title='delete'
                        className='button color-red description r-5 p-5 m-5 bg-yellow' 
                        onClick={() => deletePlayer(playerIndex)}
                    >
                        DELETE
                    </div>
                </div>
                <div className="flex3Column"></div>
            </div>
        }
    }
    
    return (
        <div>
            <div className='r-10 m-1 color-yellow bold'>
                    <div
                        title='add score'
                        className='button p-10 r-10 bg-neogreen '
                        onClick={() => addScore()}
                    >
                        <div className='p-5 r-5 navBranding'>
                            <div>{dartsScores[score]}</div>
                        </div>
                    </div>
            </div>
            <PlayerDialog
                isOpen={edit}
                game='darts'
                onClose={toggleEdit}
            />
            {/*
            <DialogBox
                playerIndex={playerIndex}
            />
            editNav()
            */}
        </div>
    )

}

export default CricketScore;