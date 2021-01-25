import { set } from 'mobx';
import React, { useState, useEffect, useRef, useReducer } from 'react';
import ScoreCard from './ScoreCard.js';

const ScoreKeeper = () => {
    const  inputRef = useRef();
    
    const initPlayers = [];
    const [ players, setPlayers ] = useState(JSON.parse(localStorage.getItem("players"))|| initPlayers)
    const [ editStatus, setEdit ] = useState(false);
    console.log(`players: ${players}`)
    
    const clear = (event) => {
        //alert('Note was cleared: ' + value);
        localStorage.setItem("players", JSON.stringify(initPlayers));
        setPlayers(initPlayers);
    }
    const addPlayer = (event) => {
        //alert('Note was cleared: ' + value);
        const newPlayer = prompt("Enter new name", "");
        let newPlayers = players;
        newPlayers.push(newPlayer)
        localStorage.setItem("players", JSON.stringify(newPlayers));
        setPlayers(newPlayers);
        getScore();
    }
    const edit = (event) => {
        setEdit(!editStatus);
    }
    const editPlayer = (index) => {
        console.log(`edit: ${index}`);
        const newPlayer = prompt("Enter new name", players[index]);
        let newPlayers = players;
        newPlayers[index] = newPlayer;
        localStorage.setItem("players", JSON.stringify(newPlayers));
        setPlayers(newPlayers);
        getScore();
    }
    const getScore = () => window.location.pathname = "/reactor/ScoreKeeper";
    const deletePlayer = (index) => {
        //console.log(`state: ${JSON.stringify(state,null,2)}`)
        console.log(`delete at: ${index}`)
        let newPlayers = players;
        newPlayers.splice(index, 1);
        localStorage.setItem("players", JSON.stringify(newPlayers));
        setPlayers(newPlayers);
        getScore();
    }
    const scorecards = () => {
        console.log(`build Scorecards`)
        const scorecard = (player, index) => <ScoreCard player={player} index={index} editPlayer={editPlayer} deletePlayer={deletePlayer}/>
        const renderedItems = players.map((player, index) => scorecard(player, index));
        return renderedItems;
    }
    return (
        <div className="App-content fadeIn">
            {scorecards()}
            <div className="flexContainer width-100-percent">
                <div className="flex3Column"></div>
                <div className="flex3Column">
                    <div value="Submit" className="button greet p-20 r-10 mt-20 mb-20 width-100-percent bg-red brdr-red" onClick={() => clear()}>clear</div>
                    <div value="Submit" className="button greet p-20 r-10 mb-20 width-100-percent bg-green brdr-green" onClick={() => addPlayer()}>add player</div>
                </div>
                <div className="flex3Column"></div>
            </div>
        </div>
    );
}

export default ScoreKeeper;