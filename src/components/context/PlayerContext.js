import React, { createContext, useEffect, useState, useContext } from 'react';

import validate from '../utils/validate';
import { initNewPlayer, initPlayers } from '../games/scorekeeper/PlayerInit';
import golfScoring from '../games/scorekeeper/golfScoring';
import initializeData from '../utils/InitializeData';
import { initAllGolfShots, initGolfShots } from '../games/scorekeeper/initGolfShots';
//import initAndroidPlayers from './initAndroidPlayers';
export const PlayerContext = createContext();

const PlayerParent = ({
    children,
    targetElementRef
}) => {

    const [players, setPlayerData] = useState();
    const [edit, setEdit] = useState(false);
    const setPlayers = (newValue) => {
        //console.log(`setPlayers=> newValue.length: ${newValue.length} newValue: ${JSON.stringify(newValue, null, 2)}`);
        if (newValue.length > 0) {
            localStorage.setItem('players', JSON.stringify(newValue));
            setPlayerData(initializeData('players', initPlayers));
        }
    };
    const game = () => localStorage.getItem('game');
    const editPlayer = (index) => {
        const newPlayer = prompt('Enter new name', players[index].name);
        if (newPlayer !== null) {
            let newPlayers = [...players];
            newPlayers[index].name = newPlayer;
            if (newPlayers != []) {
                setPlayers(newPlayers);
            }
        }
    }
    const checkItemType = (item) => {
        if (Array.isArray(item)) {
            //console.log(`PlayerContext => checkItemType = Array => item: ${JSON.stringify(item, null, 2)}`);
            return 'Array';
        } else if (typeof item === 'object' && item !== null) {
            //console.log(`PlayerContext => checkItemType = Object => item: ${JSON.stringify(item, null, 2)}`);
            return 'Object';
        } else {
            //console.log(`PlayerContext => checkItemType = Niether => item: ${JSON.stringify(item, null, 2)}`);
            return 'Neither';
        }
    }
    useEffect(() => {
        const localPlayers = initializeData('players', initPlayers);
        //console.log(`PlayerContext => useEffect => localPlayers: ${JSON.stringify(localPlayers, null, 2)}`);
        const newPlayers = [...localPlayers];
        newPlayers.map((player, index) => {
            if (!player.cricketScores) {
                player.cricketScores = [0, 0, 0, 0, 0, 0, 0];
                player.dartsScore = 0;
            }
        });
        const initGolfStats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        newPlayers.map((player, index) => {
            if (!player.golfPutts || !player.golfFW || !player.golfGIR) {
                player.golfPutts = golfScoring;
                player.golfFW = initGolfStats;
                player.golfGIR = initGolfStats;
            }
        });
        newPlayers.map((player, index) => {
            if (!player.golfShots) {
                player.golfShots = initAllGolfShots;
            } else if (checkItemType(player.golfShots[0]) === 'Object' || checkItemType(player.golfShots[0]) === 'Neither') {
                player.golfShots = initAllGolfShots;
            }
        });
        setPlayers(newPlayers);
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

    const deletePlayer = (index) => {
        const newPlayers = [...players].slice();
        newPlayers.splice(index, 1);
        if (newPlayers != []) {
            setPlayers(newPlayers);
        }
    };

    return (
        
        <PlayerContext.Provider value={{
            players,
            setPlayers,
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
        </PlayerContext.Provider>
    );
};
export const usePlayers = () => useContext(PlayerContext);

export default PlayerParent;