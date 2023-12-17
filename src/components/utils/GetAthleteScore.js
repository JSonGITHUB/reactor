
import getKey from '../utils/KeyGenerator.js';
import SurfScoringLogic from './SurfScoringLogic.js';
import getPriorityColor from './GetPriorityColor.js';
import jerseyColors from './JerseyColors.js';

const getAthleteScore = (players, index) => {
    console.log(`getAthleteScore => index: ${index} players: ${players.length}`)
    return <div className={`flex${players.length}Column r-10 m-5 size20 bg-darker p-10`} key={getKey(`athleteScore`)}>
                <div className={`p-5 size30`}>{index+1}</div>
                <div className={`m-10 ht-5 bg-${jerseyColors[players[index].surfJerseyColor]}`}></div>
                <div className='p-5 ht-75 centeredContent'>{players[index].name}</div>
                <div className='p-5 bg-lite r-10 m-10'>{players[index].surfScore}</div>
                <div className='greet'>
                    <SurfScoringLogic
                        index={index} 
                        completed={true}
                        players={players}
                        //setPlayers={setPlayers}
                        //editPlayer={editPlayer}
                        //deleteAthlete={deletePlayer}
                        />
                </div>
            </div>
}
export default getAthleteScore;