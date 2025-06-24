import React, { useContext } from 'react';
import GolfScores from './GolfScores';
import PlayerDialog from '../../utils/PlayerDialog';
import { PlayerContext } from '../../context/PlayerContext';
import initializeData from '../../utils/InitializeData';
import { initPlayers } from './PlayerInit';

const GolfScoreboard = ({ 
    updateScores, 
    isDialogOpen, 
    setPlayerDialog 
}) => {

    const {
        players,
        edit,
        setEdit
    } = useContext(PlayerContext);

    const localPlayers = initializeData('players', initPlayers);
    const cssClasses = 'flexContainer r-10 color-yellow p-20 size25 bold bg-lite width--60 ml-20 mr-20 mb-20';
    const getPlayerCount = () => {
        let count = 0;
        //players.map((player, index) => (player.golf)?count++:null);
        localPlayers.map((player, index) => (player.golf)?count++:null);
        console.log(`getPlayerCount => count: ${count}`)
        return count;
    }
    const toggleEdit = () => setEdit(!edit);
    const closeDialog = () => setPlayerDialog(false); 

    const golfScoreboard = () => <div className='bg-tinted p-10 m-5 r-10'>
        <div className=''>
            <PlayerDialog
                isOpen={edit}
                game='golf'
                onClose={toggleEdit}
            />
            <div className='scoreboard h-scroll'>
                {   
                    (players)
                    //? players.map((player, index) => (
                    ? localPlayers.map((player, index) => (
                        (player.golf)
                        ? <div key={index} className='player-score ml--20 scrollSnapLeft'>
                                <div title='edit players' className={cssClasses} onClick={() => setEdit(!edit)}>
                                    <div className='flex2Column columnLeftAlign'>{player.player || player.name}</div>
                                    <div className='size40 white flex2Column columnRightAlign'>{player.golfScore || 0}</div>
                                </div>
                                <div className='width--50 scoreboard-container'>
                                    <GolfScores
                                        playerIndex={index}
                                        updateScores={updateScores}
                                    />
                                </div>
                            </div>
                        : null
                    ))
                    : null
                }
            </div>
            {
                (getPlayerCount() === 0) 
                ? <div className='containerBox color-neogreen'>
                        Add players to the round
                    </div>
                : <div className='containerBox color-neogreen'></div>
            }
        </div>
    </div>

    return golfScoreboard();

}
export default GolfScoreboard;