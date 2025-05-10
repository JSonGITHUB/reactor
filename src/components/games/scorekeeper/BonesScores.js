import React, { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import dominoScoring from './dominoScoring';
import Dominos from './Dominos';
import getKey from '../../utils/KeyGenerator';

const BonesScores = () => {

    const {
        players,
        setPlayers,
        editPlayer,
        playersInGame
    } = useContext(PlayerContext);

    const activePlayers = players.filter(player => player['dominos'] === true);

    const winner = 200;

    const getActivePlayers = () => activePlayers.length;

    const getDominoTotal = (index) => {
        const newPlayers = [...activePlayers];
        const total = newPlayers[index].dominoScore;
        if (total === winner) localStorage.setItem('gameStatus', 'gameOver');
        return total;
    }
    const updateScores = () => {
        //const newPlayers = JSON.parse(localStorage.getItem('players'));
        //setPlayers(newPlayers);
    }
    const scorecard = (playerIndex, scoreIndex, score) => {

        const player = activePlayers[playerIndex];
        return <Dominos
            game={'dominos'}
            player={player}
            playerIndex={playerIndex}
            scoreIndex={scoreIndex}
            scoreTotal={player.dominoScore || 0}
            treeTotal={score}
            getDominoTotal={getDominoTotal}
            updateScores={updateScores}
            winner={winner}
            key={getKey((player.player || player.name))}
        />

    }

    return (
        <div className='containerBox'>
            <table border='0' style={{ width: '90%', textAlign: 'center', borderCollapse: 'collapse' }}>
                <thead>
                </thead>
                <tbody>
                    {
                        dominoScoring.map((score, scoreIndex) => <tr key={getKey(`${scoreIndex}`)}>
                            {activePlayers.map((player, playerIndex) => (
                                <React.Fragment key={player.name}>
                                    <th>
                                        <div key={getKey(`${player.name}${playerIndex}`)} className={`flex${getActivePlayers()}Column`}>
                                            <div className='flexContainer ml-20'>
                                                <div className={`flexColumn faded`}>
                                                    {scorecard(playerIndex, scoreIndex, score)}
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                    {playerIndex < activePlayers.length - 1 && <th>
                                        <span className={`size30 color-yellow bold`}>
                                            {score}
                                        </span>
                                    </th>}
                                </React.Fragment>
                            ))}
                        </tr>)
                    }
                </tbody>
            </table>
        </div>
    );
};

export default BonesScores;