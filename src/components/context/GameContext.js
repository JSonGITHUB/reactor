import React, { createContext, useEffect, useState, useContext } from 'react';

import validate from '../utils/validate';
import golfScoring from '../games/scorekeeper/golfScoring';
import initializeData from '../utils/InitializeData';

export const GameContext = createContext();

const GameParent = ({
    children,
    targetElementRef
}) => {

    const [games, setGameData] = useState();
    const [edit, setEdit] = useState(false);
    const setGames = (newValue) => {
        //console.log(`setGames=> newValue.length: ${newValue.length} newValue: ${JSON.stringify(newValue, null, 2)}`);
        if (newValue.length > 0) {
            localStorage.setItem('games', JSON.stringify(newValue));
            setGameData(initializeData('games', initGames));
        }
    };
    const game = () => localStorage.getItem('game');
    const editGame = (index) => {
        const newGame = prompt('Enter new name', players[index].name);
        if (newGame !== null) {
            let newGames = [...players];
            newGames[index].name = newGame;
            if (newGames != []) {
                setGames(newGames);
            }
        }
    }
    useEffect(() => {
        const localGames = initializeData('players', initGames);
        //console.log(`GameContext => useEffect => localGames: ${JSON.stringify(localGames, null, 2)}`);
        const newGames = [...localGames];
        setGames(newGames);
    }, []);

    useEffect(() => {
        if (JSON.stringify(players) !== '[]' && validate(players) !== null) {
            let index = 0;
            //console.log(`UseEffect => players: ${localStorage.getItem('players')}`)
            players.forEach((player) => {
                if (player[game()]) {
                    //console.log(`UseEffect => ${player.name} surfPriority: ${player.surfPriority} surfScore: ${player.surfScore} surfScores: ${JSON.stringify(player.surfScores,null,2)}`) 
                }
            });
            const surfersScores = [];
            localStorage.setItem('players', JSON.stringify(players));

            localStorage.setItem('surfersScores', JSON.stringify(surfersScores));
            //setShowButtons(false);
            setEdit(false);
        }
    }, [players]);
    useEffect(() => {
        console.log(`edit: ${edit}`);
    }, [edit]);

    const playersInGame = () => players.filter(player => player[game()]);

    const deleteGame = (index) => {
        const newGames = [...players].slice();
        newGames.splice(index, 1);
        if (newGames != []) {
            setGames(newGames);
        }
    };

    return (

        <GameContext.Provider value={{
            players,
            setGames,
            editPlayer,
            edit,
            setEdit,
            deletePlayer,
            playersInGame,
            targetElementRef
        }}>
            {
                (validate(players) !== null)
                    ? children
                    : <div>WHOOOPSIE!</div>
            }
        </GameContext.Provider>
    );
};
export const useGame = () => useContext(GameContext);

export default GameParent;