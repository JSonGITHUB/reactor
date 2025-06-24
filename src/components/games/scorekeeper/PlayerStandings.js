import React, { useState, useEffect } from 'react';
import initializeData from '../../tracker/initializeData';
import getMedal from './GetMedal';
import validate from '../../utils/validate';
import { gameIcons } from './games';

const PlayerStandings = ({
    game
}) => {

    const [currentGame, setCurrentGame] = useState(game);
    const [standings, setStandings] = useState([]);
    const [dataset, setDataset] = useState();

    useEffect(() => {
        //const game = localStorage.getItem('game');
        //setCurrentGame(game);
    }, [game]);
    useEffect(() => {
        //console.log(`GAME => ${game}`)
    }, []);
    useEffect(() => {
        //console.log(`currentGame: ${currentGame}`);
        if (currentGame !== 'surf') {
            const gameDataset = initializeData(`${game}Games`, []);
            //console.log(`gameDataset: ${JSON.stringify(gameDataset, null, 2)}`);
            setDataset(gameDataset);
        } else {
            const surfDataset = initializeData('heatLog', []);
            setDataset(surfDataset);
        }

    }, [currentGame]);

    useEffect(() => {
        if (dataset) {
            //console.log(`dataset: ${JSON.stringify(dataset, null, 2)}`);
            const playerWins = {};
            if (dataset != []) {

                dataset.forEach((game) => {
                    //console.log(`game: ${JSON.stringify(game, null, 2)}`);
                    //console.log(`game.scores: ${JSON.stringify(game.scores, null, 2)}`);
                    //console.log(`game.players: ${JSON.stringify(game.players, null, 2)}`);
                    let winner = null;

                    if (validate(game.scores) && game.scores.length > 0) {
                        winner = game.scores.reduce((prev, current) => (Number(prev.surfScore) > Number(current.surfScore)) ? prev : current, game.scores[0]);
                    } else if (game.players.length > 0) {
                        winner = game.players.reduce((prev, current) => {
                            const { score: prevScore } = prev;
                            const { score: currentScore } = current;
                            return (prevScore > currentScore) ? prev : current;
                        }, game.players[0]);
                    }

                    if (winner) {
                        if (playerWins[winner.name]) {
                            playerWins[winner.name] += 1;
                        } else {
                            playerWins[winner.name] = 1;
                        }
                    }

                    const sortedStandings = Object.entries(playerWins)
                        .map(([name, wins]) => ({ name, wins }));

                });
                const sortedStandings = Object.entries(playerWins)
                    .map(([name, wins]) => ({ name, wins }))
                    .sort((a, b) => b.wins - a.wins);

                setStandings(sortedStandings);
            }
        }
    }, [dataset]);

    return (
        <div>
            <div className='containerBox'>
                <div className='containerBox'>
                    {gameIcons[String(game).replace(' ', '')] || gameIcons['standard']}
                </div>
                {currentGame}
            </div>
            <div>
                {standings.map((player, index) => (
                    <div key={index} className='containerBox'>
                        <div className='p-5 ht-75 centeredContent'>
                            <div>
                                {getMedal(0)} x {player.wins}
                            </div>
                            <div>{player.name.split(' ')[0]}</div>
                            <div>{player.name.split(' ')[1]}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerStandings;