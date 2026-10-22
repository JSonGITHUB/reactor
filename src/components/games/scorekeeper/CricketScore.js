import React, { useState, useContext, useEffect } from 'react';
import Sounds from '../../sound/Sounds.js';
import { PlayerContext } from '../../context/PlayerContext';
import initializeData from '../../utils/InitializeData';
import PlayerDialog from '../../utils/PlayerDialog';
import { initPlayers } from './PlayerInit';

const CricketScore = ({ playerIndex, scoreIndex, updateScores, winner }) => {

    const {
        players,
        setPlayers,
        edit,
        setEdit
    } = useContext(PlayerContext);

    const getScore = () => {
        if (
            Array.isArray(players) &&
            players.length > playerIndex &&
            Array.isArray(players[playerIndex]?.cricketScores)
        ) {
            return players[playerIndex].cricketScores[scoreIndex] || 0;
        }
        const localPlayers = initializeData('players', initPlayers);
        return (localPlayers[playerIndex]?.cricketScores)
            ? (localPlayers[playerIndex].cricketScores[scoreIndex])
            : 0;
    };

    const [score, setScore] = useState(getScore());

    useEffect(() => {
        const player = players[playerIndex];
        if (!players || players.length === 0) {
            const localPlayers = initializeData('players', initPlayers);
            if (localPlayers) {
                const newPlayers = [...localPlayers];
                setPlayers(newPlayers);
            }
            return;
        } else if (!player) {
            return;
        } else if (!Array.isArray(player.cricketScores)) {
            return;
        } else {
            setScore(players[playerIndex].cricketScores[scoreIndex] || 0);
        }
    }, [players, playerIndex, scoreIndex, setPlayers]);

    // eslint-disable-next-line
    const dartsScores = ['-', '/', 'X', 'O'];

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
        if (newPlayers.length > 0) {
            setPlayers(newPlayers);
        }
        
        Sounds.boop(winner, total);
        updateScores();
        setScore(newScore);
    };

    const toggleEdit = () => setEdit(prev => !prev);
    
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
        </div>
    );
};
export default CricketScore;