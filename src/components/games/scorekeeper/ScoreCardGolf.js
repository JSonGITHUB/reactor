import React, { useState, useContext, useEffect } from 'react';
import Sounds from '../../sound/Sounds.js';
import Selector from '../../forms/FunctionalSelector';
import { PlayerContext } from '../../context/PlayerContext';
import { GolfContext } from '../../context/GolfContext';
import initializeData from '../../utils/InitializeData';
import { initPlayers } from '../scorekeeper/PlayerInit';
import Location from '../../utils/Location'
import getKey from '../../utils/KeyGenerator';
import { initAllGolfShots } from './initGolfShots';
import ShotDialog from '../../utils/ShotDialog';
import clubs from './clubs';
import icons from '../../site/icons.js';

const ScoreCardGolf = ({
    playerIndex,
    scoreIndex,
    updateScores
}) => {

    const {
        players,
        setPlayers,
    } = useContext(PlayerContext);

    const {
        golfPars,
        course,
        updateDistance,
        courses,
        setCourses,
    } = useContext(GolfContext);

    const getScore = () => {
        const newPlayers = initializeData('players', initPlayers);
        return newPlayers[playerIndex].golfScores[scoreIndex];
    }
    const [score, setScore] = useState(getScore());
    const initGolfStats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
    const initGolfPutts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const puttsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const [currentLongitude, setCurrentLongitude] = useState();
    const [currentLatitude, setCurrentLatitude] = useState();
    const [init, setInit] = useState(false);
    const [longitude, setLongitude] = useState();
    const [latitude, setLatitude] = useState();
    const [distance, setDistance] = useState(0);
    const [markedLongitude, setMarkedLongitude] = useState();
    const [markedLatitude, setMarkedLatitude] = useState();
    const [shotDialog, setShotDialog] = useState(false);
    const [shot, setShot] = useState();

    const toggleShotDialog = () => {
        setShotDialog(prev => !prev);
    }
    const clubSelection = (shotIndex) => {
        setShot(shotIndex);
        toggleShotDialog();
    }
    const shotDistance = (start = [0, 0], end = [0, 0]) => {

        //console.log(`start: ${JSON.stringify(start, null, 2)}`);
        //console.log(`end: ${JSON.stringify(end, null, 2)}`);

        const lat1 = start[0];
        const lat2 = end[0];
        const lon1 = start[1];
        const lon2 = end[1];
        //if ((lat1 === lat2) && (lon1 === lon2)) {
        //return 0;
        //} else {
        const dist = haversineDistance(lat1, lon1, lat2, lon2).toFixed(2);
        //console.log(`dist: ${dist}`);
        return Number(dist);
        //}
    }
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (degrees) => degrees * (Math.PI / 180);

        const R = 3958.8; // Radius of the Earth in miles
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const feetInMiles = 5280;
        return ((R * c) * feetInMiles) / 3;

    };
    useEffect(() => {
        if (players[playerIndex].golfShots[scoreIndex] && players[playerIndex].golfShots[scoreIndex].length>0){
            let newDistance = 0;
            players[playerIndex].golfShots[scoreIndex].forEach((shot) => {
                if (shot !== null) {
                    if (shot.distance !== null) {
                        newDistance = newDistance + (Number(shot.distance || 0));
                        //console.log(`shot distance: ${shot.distance} newDistance: ${newDistance}`);
                    }
                }
            });
            setDistance(newDistance);
        }
        //console.log(`ScoreCardGolf => currentLongitude: ${currentLongitude} currentLatitude: ${currentLatitude}]`);
        //console.log(`ScoreCardGolf => markedLongitude: ${markedLongitude}, markedLatitude: ${markedLatitude}`);
    }, [markedLongitude, markedLatitude, players, playerIndex, scoreIndex]);
    useEffect(() => {
        //setDistance(shotDistance([markedLongitude, markedLatitude], [currentLongitude, currentLatitude]));
        //console.log(`ScoreCardGolf => currentLongitude: ${currentLongitude} currentLatitude: ${currentLatitude}, markedLatitude: ${markedLatitude}]`);
    }, [currentLongitude, currentLatitude]);
    useEffect(() => {
        //console.log(`ScoreCardGolf => distance: ${distance} markedLongitude: ${markedLongitude}, markedLatitude: ${markedLatitude}]`);
    }, [distance]);
    useEffect(() => {
        //console.log(`ScoreCardGolf => players: ${JSON.stringify(players, null, 2)}`);
    }, [players]);
    const checkItemType = (item) => {
        if (Array.isArray(item)) {
            return 'Array';
        } else if (typeof item === 'object' && item !== null) {
            return 'Object';
        } else {
            return 'Neither';
        }
    }
    useEffect(() => {
        //console.log(`ScoreCardGolf => players: ${JSON.stringify(players, null, 2)}`);
        const newPlayers = [...players];
        newPlayers.forEach((player) => {
            if (!player.golfShots) {
                player.golfShots = initAllGolfShots;
            } else if (checkItemType(player.golfShots[0]) === 'Object') {
                player.golfShots = initAllGolfShots;
            }
        });
        //console.log(`ScoreCardGolf => newPlayers: ${JSON.stringify(newPlayers, null, 2)}`);
        //setPlayers(newPlayers);
    }, [players]);
    const updateScore = (newScore) => {
        let total = 0;
        const addToTotal = (value) => total = total + value;
        const newPlayers = initializeData('players', initPlayers);
        if (currentPositionExists()) {
            setLongitude(currentLongitude);
            setLatitude(currentLatitude);
            if (!newPlayers[playerIndex].golfShots) {
                newPlayers[playerIndex].golfShots = initAllGolfShots;
            } else if (newScore < 1) {
                newPlayers[playerIndex].golfShots[scoreIndex][newScore] = {
                    coords: [0, 0],
                    distance: 0
                }
            }
            if (!newPlayers[playerIndex].golfShots) {
                newPlayers[playerIndex].golfShots = [];
            }
            /*
            newPlayers[playerIndex].golfShots.splice(newScore, 1, {
                coords: [currentLongitude, currentLatitude],
                distance: shotDistance(newPlayers[playerIndex].golfShots[newScore - 1].coords || [longitude, latitude], [currentLongitude, currentLatitude])
            });
            */
            //newPlayers[playerIndex].golfShots[scoreButtonClasses][newScore] = null;
            newPlayers[playerIndex].golfShots[scoreIndex][newScore] = null;

            newPlayers[playerIndex].golfShots[scoreIndex].splice((Number(newScore)), 1, {
                coords: [currentLongitude, currentLatitude],
                distance: shotDistance(newPlayers[playerIndex].golfShots[scoreIndex][newScore - 1]?.coords || [longitude, latitude], [currentLongitude, currentLatitude])
            });

        }
        //console.log(`golfShots: ${JSON.stringify(newPlayers[playerIndex].golfShots, null, 2)}`);
        newPlayers[playerIndex].golfScores[scoreIndex] = newScore;
        newPlayers[playerIndex].golfScores.map((score) => addToTotal(score));
        newPlayers[playerIndex].golfScore = total;
        if (!newPlayers[playerIndex].golfFW) {
            newPlayers[playerIndex].golfFW = initGolfStats;
        }
        if (!newPlayers[playerIndex].golfGIR) {
            newPlayers[playerIndex].golfGIR = initGolfStats;
        }
        if (!newPlayers[playerIndex].golfPutts) {
            newPlayers[playerIndex].golfPutts = initGolfPutts;
        }
        localStorage.setItem('players', JSON.stringify(newPlayers))
        if (newPlayers.length !== 0) {
            setPlayers(newPlayers);
        }

        Sounds.boop(3000, newScore);

        setScore(newScore);
        
        updateScores();
        
    }
    const updateCurrentLocation = ({
        latitude,
        longitude
    }) => {
        //console.log(`UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`)
        if ((Math.abs(currentLongitude - longitude) > .0001) || (Math.abs(currentLatitude - latitude) > .0001) || (init === false)) {
            console.log(`updateCurrentLocation => satus coords ^^^^^^^^^^^ ${longitude}, ${latitude}`)
            setCurrentLongitude(longitude);
            setCurrentLatitude(latitude);
            setInit(true);
        } else if ((Math.abs(Number(initializeData('longitude', null)) - longitude) > .000003) || (Math.abs(initializeData('latitude', null) - latitude) > .000003)) {
            console.log(`updateCurrentLocation => local coords ^^^^^^^^^^^ ${longitude}, ${latitude}`)
            setCurrentLongitude(longitude);
            setCurrentLatitude(latitude);
            setInit(true);
        }
        //setDistance(calculateDistance());
        //setDistance(shotDistance([markedLongitude, markedLatitude], [longitude, latitude]));

    }
    // eslint-disable-next-line
    const addScore = () => {
        startDistance();
        const newScore = Number(score) + 1;
        updateScore(newScore);
    }
    const subtractScore = () => {
        const newPlayers = [...players];
        newPlayers[playerIndex].golfShots[scoreIndex][score] = {};
        const newScore = Number(score) - 1;
        localStorage.setItem('players', JSON.stringify(newPlayers));
        setPlayers(newScore)
        updateScore(newScore);
    }
    const stockClasses = 'containerDetail color-yellow bold ';
    const buttonClass = 'bg-darker';
    const getButtonClass = 'glassy button flex3Column p-5 r-10 m-1 ' + buttonClass;
    const scoreButtonClasses = 'flex2Column button r-10 color-dark centeredContent';
    const isEagle = (score, par) => (score === (par - 1)) ? true : false;
    const isBoagie = (score, par) => ((score > par) && (score < (Number(par) + 3))) ? true : false;
    const isDoubleBoagie = (score, par) => (score === (Number(par) + 2)) ? true : false;
    const getOuterCSS = (score, par) => {
        if (isEagle(score, par)) return 'completedSelector r-50-percent pb-20 pt-30';
        if (isDoubleBoagie(score, par)) return 'brdr-light p-5 r-10';
        return 'brdr-transparent r-10';
    }
    const getInnerCSS = (score, par) => {
        if (isBoagie(score, par) && isDoubleBoagie(score, par)) return 'brdr-light r-5 font50 pt-12 pl-10 pr-10';
        if (isBoagie(score, par)) return 'brdr-light r-5 font50 pt-12 pl-10 pr-10 mt-5 mb-5';
        if (!isDoubleBoagie(score, par) && !isEagle(score, par)) return 'p-5 r-5 font50 m-10 mt-20';
        return 'p-5 r-5 font50 m-10';
    }
    const toggleFW = () => {
        const newPlayers = [...players];
        if (newPlayers[playerIndex].golfFW[scoreIndex] !== true) {
            newPlayers[playerIndex].golfFW[scoreIndex] = true;
        } else {
            newPlayers[playerIndex].golfFW[scoreIndex] = false;
        }
        Sounds.boop(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        if (newPlayers.length !== 0) {
            setPlayers(newPlayers);
        }
        updateScores();
    };
    const toggleGIR = () => {
        const newPlayers = [...players];
        if (newPlayers[playerIndex].golfGIR[scoreIndex] !== true) {
            newPlayers[playerIndex].golfGIR[scoreIndex] = true;
        } else {
            newPlayers[playerIndex].golfGIR[scoreIndex] = false;
        }
        Sounds.boop(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        if (newPlayers.length !== 0) {
            setPlayers(newPlayers);
        }
        updateScores();
    };
    const getFW_Checkbox = () => {
        if (players[playerIndex] && !players[playerIndex].golfFW) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfFW = initGolfStats;
            if (newPlayers.length !== 0) {
                setPlayers(newPlayers);
            }
            updateScores();
        }
        const FW = (players[playerIndex]) ? players[playerIndex].golfFW[scoreIndex] || false : false;
        const fwId = `fw-${playerIndex}-${scoreIndex}`;
        let checkBox = <input
                            id={fwId}
                            name={fwId}
                            className='regular-checkbox button glassy ml-5'
                            checked type='checkbox'
                            onChange={() => console.log(`fw`)}
                        />
        if (FW !== true) {
            checkBox = <input 
                            id={fwId}
                            name={fwId}
                            className='regular-checkbox button glassy ml-5' 
                            type='checkbox'
                        />
        }
        return checkBox;
    }
    const getGIR_Checkbox = () => {
        if (players[playerIndex] && !players[playerIndex].golfGIR) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfGIR = initGolfStats;
            if (newPlayers.length !== 0) {
                setPlayers(newPlayers);
            }
            updateScores();
        }
        const GIR = (players[playerIndex]) ? (players[playerIndex].golfGIR[scoreIndex] || false) : false;
        const girId = `gir-${playerIndex}-${scoreIndex}`;
        let checkBox = <input
                            id={girId}
                            name={girId}
                            className='regular-checkbox button glassy ml-5 mr-10'
                            checked type='checkbox'
                            onChange={() => console.log(`gir`)}
                        />
        if (GIR !== true) {
            checkBox = <input 
                            id={girId}
                            name={girId}
                            className='regular-checkbox button glassy ml-5 mr-10' 
                            type='checkbox'  
                        />
        }
        return checkBox;
    }
    const selectPutts = (groupTitle, label, selected) => {
        const newPlayers = [...players];
        const previouslySetPutts = newPlayers[playerIndex].golfPutts[scoreIndex];
        const newSelectionDifference = selected - previouslySetPutts;
        const currentScore = newPlayers[playerIndex].golfScores[scoreIndex];
        newPlayers[playerIndex].golfScores[scoreIndex] = currentScore + newSelectionDifference;
        newPlayers[playerIndex].golfPutts[scoreIndex] = selected;
        newPlayers[playerIndex].golfScore = newPlayers[playerIndex].golfScore + newSelectionDifference;
        Sounds.boop(3000, newPlayers[playerIndex].golfScores[scoreIndex]);
        if (newPlayers.length !== 0) {
            setPlayers(newPlayers);
        }
        updateScores();
    }
    const getPuttCount_Selector = () => {
        if (players[playerIndex] && !players[playerIndex].golfPutts) {
            const newPlayers = [...players];
            newPlayers[playerIndex].golfPutts = initGolfPutts;
            if (newPlayers.length !== 0) {
                setPlayers(newPlayers);
            }
            updateScores();
        }
        const putts = (players[playerIndex]) ? (players[playerIndex].golfPutts[scoreIndex] || 0) : 0;
        let puttSelector = <Selector
            groupTitle='putts'
            label='putts'
            items={puttsArray}
            selected={putts}
            onChange={selectPutts}
            fontSize='25'
            padding='10px'
            width={'auto'}
            bgColor={'bg-white'}
            color={'color-black'}
        />
        return <div className={`columnCenterAlign r-10 button m-2 ${getButtonClass}`}>
            <span className='size20'>Putts:</span>
            <span className='m-5'>{puttSelector}</span>
        </div>
    }
    const getGolfLowerNav = () => <div className={`flexContainer m-1 ${getButtonClass}`}>
        <div 
            title='fairway'
            className={`columnCenterAlign size20 ${scoreButtonClasses} containerBox bg-white`} 
            onClick={() => toggleFW()}
        >
            <span>FW</span>
            {getFW_Checkbox()}
        </div>
        <div className='flex3Column'></div>
        <div 
            title='green in regulation'
            className={`columnCenterAlign size20 ${scoreButtonClasses} containerBox bg-white`} 
            onClick={() => toggleGIR()}
        >
            <span>GIR</span>
            {getGIR_Checkbox()}
        </div>
    </div>

    const currentPositionExists = () => (currentLongitude) ? true : false;

    const startDistance = () => {
        if (markedLongitude !== undefined) {
            console.log(`startDistance => distance: ${distance} markedLongitude: ${markedLongitude} markedLatitude: ${markedLatitude}`);
            let newDistance = (distance !== undefined) ? (distance + 1) : 0;
            //setDistance(newDistance + (Number(shotDistance([markedLongitude, markedLatitude], [currentLongitude, currentLatitude])) || newDistance));
            console.log(`setDistance(distance:${newDistance} + Number:(${shotDistance([markedLongitude, markedLatitude], [currentLongitude, currentLatitude])})`);
            console.log(`ScoreCardGolf => startDistance currentLongitude: ${currentLongitude} currentLatitude: ${currentLatitude}`);
            console.log(`ScoreCardGolf => startDistance markedLongititude: ${markedLongitude}  markedLatitude: ${markedLatitude}`);
        }
        setMarkedLatitude(currentLatitude);
        setMarkedLongitude(currentLongitude);
    };
    const editGolfDistance = (hole) => {
        const newDistance = Number(prompt(`Enter distance for hole ${hole + 1}:`, course.holes[hole].distance));
        updateDistance(hole, newDistance);
    }
    const locationSelected = () => {
        const edit = window.confirm('Update coords?');
        if (!edit) {
            window.location = `https://www.google.com/maps?q=${course.holes[scoreIndex].latitude},${course.holes[scoreIndex].longitude}`
        } else {
            const newLatitude = prompt('Latitude:', `${course.holes[scoreIndex].latitude}`);
            const newLongitude = prompt('Longitude:', `${course.holes[scoreIndex].longitude}`);
            const newCourses = [...courses];
            newCourses.holes[scoreIndex].latitude = newLatitude;
            newCourses.holes[scoreIndex].longitude = newLongitude;
            setCourses(newCourses);
        }
    }
    const getTracker = () => {
        //console.log(`ScoreCardGolf => getTracker : players[${playerIndex}].golfShots: ${JSON.stringify(players[playerIndex].golfShots, null, 2)}`);
        //console.log(`ScoreCardGolf => getTracker : score: ${score} `);
        const tracker = <div className='containerBox'>
            <div className=''>
                <div>
                    <div className='mr-10 color-yellow'>
                        <span
                            title='map/edit'
                            className='button size20 mr-5 ml-2'
                            onClick={() => locationSelected()}
                        >
                            {icons.globe}
                        </span>
                        Total: <span title='edit distance' className='button' onClick={() => editGolfDistance(scoreIndex)}>
                            {course.holes[scoreIndex].distance} yds
                            </span>
                    </div>
                    <div className='mr-10 mt-10'>
                        Current:
                        {
                            (score > 1)
                            ? (distance >= 1)
                                ? distance.toFixed(2)
                                : (distance * 3).toFixed(2)
                            : null
                        }
                        {
                            (score > 1)
                            ? (distance >= 1)
                                ? ` yd`
                                : ` ft`
                            : null
                        }
                    </div>
                </div>
            </div>
            <div className='size10 color-medium mb--10'>
                <div className='scrollSnapTop'>
                    <Location currentPositionExists={currentPositionExists} returnCoordinates={updateCurrentLocation} icon='true' />
                </div>
            </div>
        </div>

        return tracker;
    };
    const getShotDistance = (shot, index) => {
        const shotObject = players[playerIndex].golfShots[scoreIndex][index - 1];
        const distance = () => shotDistance(shot?.coords, ((index > 0 && shotObject?.coords) ? shotObject?.coords : [0, 0]))
        const shotDisplay = (distance() < 1760)
            ? (distance() > 1)
                ? Number(distance()).toFixed(0)
                : (Number(distance()) * 3).toFixed(0)
            : null

        const shotDistanceDisplay = (distance() < 1760)
            ? (Number(distance()) >= 1)
                ? <div className='containerDetail pl-10 pr-10'>
                    {shotDisplay} yd
                </div>
                : <div className='containerDetail pl-10 pr-10'>
                    {shotDisplay} ft
                </div>
            : null

        return shotDistanceDisplay;
    }
    const pickClub = (value) => {
        const newPlayers = [...players];
        newPlayers[playerIndex].golfShots[scoreIndex][shot ?? score].club = clubs[value];
        setPlayers(newPlayers);
    }
    
    return (
        <div>
            {getTracker()}
            <ShotDialog
                shot={shot}
                score={score}
                isOpen={shotDialog}
                onClose={toggleShotDialog}
                pickClub={pickClub}
            />
            <div className={`scrollHeight50 mt--10`}>
                <div>
                    {
                        ((getScore() > 0) && players[playerIndex].golfShots[scoreIndex])
                            ? (checkItemType(players[playerIndex].golfShots[scoreIndex]) === 'Array')
                                ? players[playerIndex].golfShots[scoreIndex].map((shot, index) => (shot?.coords)
                                    ? <div key={`${index}${getKey(index)}`} className='containerBox bg-lite'>
                                        <div className='flexContainer'>
                                            <div className='flex2Column color-yellow columnLeftAlign'>
                                                <span className='color-white mr-5'>{index}.</span>{getShotDistance(shot, index)} <span title='choose club' onClick={() => clubSelection(index)}>{shot.club ?? '?'}</span>
                                            </div>
                                            <div className='flex2Column size10 color-medium columnRightAlign'>
                                                <span>
                                                    <div
                                                        title='map'
                                                        className='button'
                                                        onClick={() => window.location = `https://www.google.com/maps?q=${shot.coords[1]},${shot.coords[0]}`}>
                                                        {icons.globe}
                                                    </div>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    : null

                                ).reverse()
                                : null
                            : null
                    }
                </div>
            </div>
            <div className={`${stockClasses} bg-dkDark`}>
                <div className={`flexContainer ${getButtonClass}`}>
                    <span title='subtract score' className={`size30 pb-5 ${scoreButtonClasses} bg-white r-150`} onClick={() => subtractScore()}>
                        -
                    </span>
                    <span className='p-20'>
                        <div></div>
                        <div>{null}</div>
                        <div title='choose club' className={getOuterCSS(score, golfPars[scoreIndex])} onClick={() => toggleShotDialog()}>
                            <div className={`${getInnerCSS(score, golfPars[scoreIndex])} pt-40 pb-25 w-100`}>
                                <span className='size100'>{score}</span>
                            </div>
                        </div>
                    </span>
                    <span 
                        title='add score'
                        className={`size30 pb-5 ${scoreButtonClasses} bg-white r-150`} 
                        onClick={() => { addScore(); clubSelection(score+1); }}
                    >
                        +
                    </span>
                </div>
                {getPuttCount_Selector()}
                {getGolfLowerNav()}
            </div>
            {/*editNav()*/}
        </div>
    )
}

export default ScoreCardGolf;