import React, { useState, useEffect } from 'react';
import { games, gameIcons } from './games';
import icons from '../../site/icons';
import getMedal from './GetMedal';
import initializeData from '../../tracker/initializeData';

const GameLeaderboard = () => {

    const [topPlayers, setTopPlayers] = useState([]);
    const [allGames, setAllGames] = useState(initializeData('games', games));
    const [gold, setGold] = useState([]);
    const [silver, setSilver] = useState([]);
    const [bronze, setBronze] = useState([]);
    const [shakas, setShakas] = useState([]);
    
    useEffect(() => {
        const add = 'add Game/Sport';
        const gamesDir = initializeData('games', games);
        //if (!gamesDir.includes(add)) {
            //const newGamesDir = ['add Game / Sport', ...gamesDir];
            //gamesDir.unshift('add Game/Sport');
            //setAllGames(newGamesDir);
        //} else {
            setAllGames(gamesDir);
        //}
    }, []);
    useEffect(() => {
       //console.log(`GameLeaderBoard => gold: ${JSON.stringify(gold, null, 2)}`); 
    }, [gold]);
    useEffect(() => {
        //console.log(`GameLeaderBoard => silver: ${JSON.stringify(silver, null, 2)}`); 
    }, [silver]);
    useEffect(() => {
        //console.log(`GameLeaderBoard => bronze: ${JSON.stringify(bronze, null, 2)}`);
    }, [bronze]);
    useEffect(() => {
        //console.log(`GameLeaderBoard => shakas: ${JSON.stringify(shakas, null, 2)}`);
    }, [shakas]);

    useEffect(() => {

        localStorage.setItem('games', JSON.stringify(allGames));
        const playerWins = {};
        allGames.forEach((gameCategory) => {
            if (gameCategory.includes('add')) {
            } else {
                let dataset = [];
                if (gameCategory === 'surf') {
                    dataset = initializeData('heatLog', []);
                } else {
                    dataset = initializeData(`${gameCategory}Games`, []);
                }
                if (dataset != []) {
                    if (gameCategory === 'surf') {
                        dataset.forEach((game) => {
                            const winner = game.scores.reduce((prev, current) =>
                                Number(prev.surfScore) > Number(current.surfScore) ? prev : current
                            );
                            if (playerWins[winner.name]) {
                                playerWins[winner.name] += 1;
                            } else {
                                playerWins[winner.name] = 1;
                            }
                            //console.log(`playerWins: ${JSON.stringify(playerWins, null, 2)}`);
                            game.scores.forEach((player) => {
                                //console.log(`GameLeaderBoard => ${player.name}.surfScore: ${player.surfScore}`)
                            })
                            //console.log(`GameLeaderBoard => playerWins: ${JSON.stringify(playerWins, null, 2)}`);
                        });
                        //console.log(`GameLeaderBoard => dataset: ${JSON.stringify(dataset, null, 2)}`);
                    } else {
                        //console.log(`GameLeaderBoard => dataset: ${JSON.stringify(dataset, null, 2)}`);
                        dataset.forEach((game) => {
                            if (game.players && game.players.length > 0) {
                                const winner = game.players.reduce((prev, current) =>
                                    prev.score > current.score ? prev : current
                                );
                                if (playerWins[winner.name]) {
                                    playerWins[winner.name] += 1;
                                } else {
                                    playerWins[winner.name] = 1;
                                }
                            }
                        });
                    }
                }
            } 
        });

        const sortedPlayers = Object.entries(playerWins)
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins);

        //console.log(`GameLeaderBoard => sortedPlayers: ${JSON.stringify(sortedPlayers, null, 2)}`);
        const goldArray = [];
        const getGold = sortedPlayers
            .map((player, index) => {
                if (sortedPlayers[0]?.wins === player.wins) {
                    return index;
                } else {
                    return null; // Explicitly return null
                }
            })
            .filter(index => index !== null);
        
        const silverArray = [];
        const getSilver = sortedPlayers
            .map((player, index) => {
                if (sortedPlayers[0]?.wins > player.wins && (sortedPlayers[silverArray[0]]?.wins === player.wins || silverArray.length < 1)) {
                    silverArray.push(index);
                    return index;
                } else {
                    return null; // Explicitly return null
                }
            })
            .filter(index => index !== null);
        
        const bronzeArray = [];
        const getBronze = sortedPlayers
            .map((player, index) => {
                if (sortedPlayers[silver[0]]?.wins > player.wins && (sortedPlayers[bronzeArray[0]]?.wins === player.wins || bronzeArray.length < 1)) {
                    bronzeArray.push(index);
                    return index;
                } else {
                    return null; // Explicitly return null
                }
            })
            .filter(index => index !== null);
        
        const shakasArray = [];
        const getShakas = sortedPlayers
            .map((player, index) => {
                if (sortedPlayers[bronze[0]]?.wins > player.wins && (sortedPlayers[shakasArray[0]]?.wins === player.wins || shakasArray.length<1)) {
                    shakasArray.push(index);
                    return index;
                } else {
                    return null; // Explicitly return null
                }
            })
            .filter(index => index !== null);

        setTopPlayers(sortedPlayers);
        setGold(getGold);
        setSilver(getSilver);
        setBronze(getBronze);
        setShakas(getShakas);
        
    }, [allGames]);

    const displayMedal = (index) => {

        if (gold.includes(index)) return 0
        if (silver.includes(index)) return 1
        if (bronze.includes(index)) return 2
        if (shakas.includes(index)) return 3

    }

    return (
    
        <div className='h-scroll relative containerBox flexContainer m-5 bg-veryLite'>
            {
                topPlayers.map((player, index) => (
                    <div key={index} className={`containerBox flex${topPlayers.length}Column`}>
                        <div className={`containerBox`}>
                            {getMedal(displayMedal(index)) || `${index} - ${icons.shaka}`}
                        </div>
                        <div>
                            {player.name} 
                        </div>
                        <div>
                            {player.wins} win{player.wins > 1 ? 's' : ''}
                        </div>
                    </div>
            ))}
        </div>
    );
};

export default GameLeaderboard;