import React, {useState} from 'react';
import getKey from '../utils/KeyGenerator.js';
import WaveUtils from '../utils/WaveUtils.js';
import swell1 from '../../assets/images/wavePrimary.png'
import swell2 from '../../assets/images/waveSecondaryB.png'
import N from '../../assets/images/windN.png'
import NE from '../../assets/images/windNE.png'
import E from '../../assets/images/windE.png'
import SE from '../../assets/images/windSE.png'
import S from '../../assets/images/windS.png'
import SW from '../../assets/images/windSW.png'
import W from '../../assets/images/windW.png'
import NW from '../../assets/images/windNW.png'
import tideIcon from '../../assets/images/tide.png'
import PostDirectory from './PostDirectory.js';
import {BrowserRouter as Link} from 'react-router-dom';

const SurfLocation = ({state, item, matches, regionMatch}) => {
    
    const { edit, windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, height, stars } = state;
    // eslint-disable-next-line
    const [status, setStatus] = useState({
        module: 'SurfLocation',
        logged: false,
        edit: edit,
        windDirection: windDirection,
        windSpeed: windSpeed, 
        windGusts: windGusts,
        swell1Direction: swell1Direction, 
        swell2Direction: swell2Direction,
        swell1Angle: swell1Angle,
        swell2Angle: swell2Angle,
        swell1Height: swell1Height,
        swell2Height: swell2Height,
        swell1Interval: swell1Interval,
        swell2Interval: swell2Interval,
        tide: tide, 
        height: height,
        stars: stars
    });

    const posts = new PostDirectory();
    const getStarKind = (kind) => {
        let classes = "shaka r-20 p-2";
        classes = (kind === "wind") ? (classes + " bg-white") : classes; 
        return classes;
    }
    // eslint-disable-next-line
    const getTideIcon = <img src={tideIcon} className={`mb--5 ${getStarKind("tide")}`} alt="tide" />;
    // eslint-disable-next-line
    const getSwellIcon = (id) => {
        if (id === 1) {
            return <img src={swell1} className={`mb--5 ${getStarKind("tide")}`} alt="swell1" />
        } else {
            return <img src={swell2} className={`mb--5 ${getStarKind("tide")}`} alt="swell2" />;
        }
    }
    // eslint-disable-next-line
    const getWindIcon = () => {
        const windDirection = status.windDirection;
        if (windDirection === "N") {
            return <img src={N} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
            return <img src={NE} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "E") {
            return <img src={E} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
            return <img src={SE} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "S") {
            return <img src={S} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
            return <img src={SW} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "W") {
            return <img src={W} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
            return <img src={NW} className={`mb--5 ${getStarKind("tide")}`} alt={windDirection} />;
        }
    }
    const getMatchIcon = (kind) => {
        // eslint-disable-next-line
        let icon = (kind === "swell1") ? "swell1" : "swell2";
        icon = (kind === "wind") ? "wind" : icon;
        icon = (kind === "tide") ? "tide" : icon;
        if (kind === "swell1") {
            return <img src={swell1} className={getStarKind(kind)} alt={kind} />
        } else if (kind === "swell2") {
            return <img src={swell2} className={getStarKind(kind)} alt={kind} />;
        } else if (kind === "tide") {
            return <img src={tideIcon} className={getStarKind(kind)} alt={kind} />;
        } else if (kind === "wind") {
            const windDirection = status.windDirection;
            if (windDirection === "N") {
                return <img src={N} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
                return <img src={NE} className={getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "E") {
                return <img src={E} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
                return <img src={SE} className={getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "S") {
                return <img src={S} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
                return <img src={SW} className={getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "W") {
                return <img src={W} className={getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
                return <img src={NW} className={getStarKind(kind)} alt={kind} />;
            }
        }
    }
    const secondsToSec = () => "sec"
    const getStarDetails = (kind) => {
        let details = "";
        const {height, windSpeed, windGusts, swell1Height, swell1Angle,swell1Interval, swell2Height, swell2Angle, swell2Interval} = status;
        details = (kind === "tide") ? <div className="bold color-neogreen">{height}'</div> : details;
        details = (kind === "wind") ? <div className="bold color-neogreen">{windSpeed}-{windGusts}kts</div> : details;
        details = (kind === "swell1") ? <div><div className="bold color-neogreen">{`${swell1Height}${(swell1Height.includes("ft")) ? "" : "'"}`}</div><div className="bold color-neogreen">{swell1Angle}°</div><div className="bold color-neogreen">{swell1Interval.replace(" seconds",secondsToSec())}</div></div> : details;
        details = (kind === "swell2") ? <div><div className="bold color-neogreen">{`${swell2Height}${(swell2Height.includes("ft")) ? "" : "'"}`}</div><div className="bold color-neogreen">{swell2Angle}°</div><div className="bold color-neogreen">{swell2Interval.replace(" seconds",secondsToSec())}</div></div> : details;
        return details
    }
    const getState = (kind) => {
        const { swell1Direction, swell2Direction, tide, windDirection } = status;
        if (kind === "swell1") {
            return swell1Direction;
        } else if (kind === "swell2") {
            return swell2Direction;
        } else if (kind === "tide") {
            return tide;
        } else if (kind === "wind") {
            return windDirection;
        }
    }
    const star = (matchKind) => <div key={getKey("star")} className="flex3Column bg-lite mr-5 ml-5 p-10 r-10">
                            {getMatchIcon(matchKind)}
                            <div className="greet">{getState(matchKind)}{getStarDetails(matchKind)}</div>
                        </div>;
    const getStars = (stars) => stars.map((currentStar) => star(currentStar));
    const generateNewLogId = () => {
        const date = new Date()
        const st = date.toDateString().replace(/ /g,"");
        const nd = date.toLocaleTimeString().replace(/ /g,"");
        localStorage.setItem("lastPostId", `${st}${nd}`);
        const newId = `${st}${nd}`;
        console.log(`LogId: generateNewLogId => status.logId: ${newId}`);
        return newId;
    }
    const goToLog = () => window.location.pathname = "/reactor/SurfLog"
    const createLog = (item) => {
        console.log(`SurfLocation => createLog`);
        localStorage.setItem('spot', item.name);
        const recordId = generateNewLogId();
        let getCurrentTime = new Date();
        const year = getCurrentTime.getFullYear();
        const currentMonth = getCurrentTime.getMonth()+1;
        const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
        const currentDate = getCurrentTime.getDate();
        const date = (currentDate<10) ? `0${currentDate}` : currentDate;
        const currentHour = getCurrentTime.getHours();
        const hours = (currentHour<10) ? `0${currentHour}` : currentHour;
        const startHour = ((currentHour-1)<10) ? `0${(currentHour-1)}` : (currentHour-1);
        const currentMinutes = getCurrentTime.getMinutes();
        const minutes = (currentMinutes<10) ? `0${currentMinutes}` : currentMinutes;
        // eslint-disable-next-line
        const getEndTime = `${year}${month}${date}%20${hours}:${minutes}`;
        // eslint-disable-next-line
        const getStartTime = `${year}${month}${date}%20${startHour}:00`;
        getCurrentTime = `${year}${month}${date}%20${hours}:${minutes}`;
        const getWaveHeight = (height) => {
            const heights = ["knee high", "waist high", "shoulder high", "head high", "over head", "foot over head", "couple of feet over head", "couple of feet over head","couple of feet over head","couple of feet over head","couple of feet overhead","double over head","double over head","double over head","triple over head","triple over head","triple over head","triple over head"]
            height = height.replace("ft","");     
            height = Number(height) - 1;
            height = (height<0) ? heights[0] : heights[height];
            return height;     
        }
        
        const getWindMPH = () => {
            let mph = Number(status.windGusts)+1;
            mph = mph + "mph";
            return mph
        }
        const getSurface = () => {
            const surfaces = ["oily glass", "glassy", "textured", "choppy", "victory at sea"];
            let surface = Math.floor((Number(status.windGusts)+1)/3);
            surface = (surfaces > 3) ? surfaces[4] : surfaces[surface];
            return surface;
        }
        const getWindOrientation = () => {
            const directions = {
                "N": "sideshore => lefts",
                "NE": "sideshore => lefts",
                "ENE": "offshore",
                "NNE": "offshore",
                "NW": "onshore",
                "NNW": "sideshore => lefts",
                "W": "onshore",
                "WNW": "onshore",
                "E": "offshore",
                "ESE": "sideshore => rights",
                "S": "sideshore => rights",
                "SE": "sideshore => rights",
                "SSE": "sideshore => rights",
                "WSW": "onshore",
                "SW": "sideshore => rights",
                "SSW": "sideshore => rights"
            }
            return directions[status.windDirection]
        }
        const getNotes = () => {
            const { height, tide, windDirection, swell1Height, swell1Angle, swell1Direction, swell1Interval } = status;
            let notes = `${swell1Height}(${getWaveHeight(swell1Height)})`;
            notes = `${notes} out of the ${swell1Direction}`;
            notes = `${notes}(${swell1Angle})`;
            notes = `${notes} at ${swell1Interval}.`;
            notes = `${notes} It was a ${tide} tide`;
            notes = `${notes}(${Number(height).toFixed(0)}ft).`;
            notes = `${notes} the wind was ${getWindOrientation()} out of the ${windDirection} at ${getWindMPH()}.`;
            notes = `${notes} The conditions were ${getSurface()}.`;
            return notes;
        }
        const logObj = {
            Day: {
                Date: `${year}-${month}-${date}T${hours}:${minutes}:00.000Z`,
                Day: date,
                Month: month,
                Year: year
            },
            Location: {
                Break: item.name
            },
            Surf: {
                Height: getWaveHeight(status.swell1Height),
                Report: status.swell1Height,
                Shape: "close-outs"
            },
            Swell1: {
                Height: status.swell1Height,
                Direction: status.swell1Direction,
                Angle: status.swell1Angle,
                Interval: status.swell1Interval,
            },
            Swell2: {
                Height: status.swell2Height,
                Direction: status.swell2Direction,
                Angle: status.swell2Angle,
                Interval: status.swell2Interval,
            },
            Swell3: {
                Height: "1ft",
                Direction: "NW",
                Angle: "180",
                Interval: "6 seconds",
            },
            Tide: {
                Phase: status.tide,
                Height: Number(status.height).toFixed(0)+"ft"
            },
            Wind: {
                Direction: status.windDirection,
                Orientation: getWindOrientation(),
                MPH: getWindMPH(),
                Surface: getSurface()
            },
            Conditions: {
                Conditions: "Good"
            },
            Comments: {
                "notes": getNotes()
            }
        }
        //return logObj;
        let postDirectory = posts.getDirectory();
        let post = "";
        const logIt = () => {
            postDirectory.push(recordId);
            postDirectory = JSON.stringify(postDirectory);
            console.log(`postDirectory: ${postDirectory}`)
            post = JSON.stringify(logObj, null, 2);
            console.log(`post: ${post}`)
            localStorage.setItem(recordId, post);
            //localStorage.setItem("postDirectory", postDirectory);
            posts.add(recordId);
        }
        logIt();
        goToLog();
        /*
        this.setState({
            recordId: recordId,
            logged: true
        })
        */
    };
    const logLocation = (item) => (status.logged === true) ? alert("log already exists") : createLog(item);
    const logLocationButton = (item) => {
        return <div>
                    {
                        (localStorage.getItem("edit") === "true") ? <div>
                                <WaveUtils state={status} item={item} logLocation={() => logLocation(item)}></WaveUtils>
                            </div>
                        :
                        <div className="App button bg-yellow color-black p-10 r-10 mt-20" onClick={() => logLocation(item)}>
                            Log Session
                        </div>
                    }
                </div>
    }
    // eslint-disable-next-line
    const editLogButton = () => {
        return (
            <Link className="noUnderline" key={getKey("link")} to={{
                pathname: '/SurfLog?logId=ThuApr3020209:19:28PM',
                state: {
                    logId: status.recordId
                }
            }}>
                <div className="App button bg-yellow color-black p-10 r-10 mt-20">
                    Edit Log
                </div>
            </Link>
        );
    }
    
    const statusClass = (status) => (status === true) ? "color-neogreen" : "color-yellow"; 
    const subStatusClass = (status) => (status === true) ? "color-orange" : "color-yellow"; 
    const swell1Match = (item) => (item.swell.indexOf(swell1Direction)>-1) ? true : false;
    // eslint-disable-next-line
    const swell2Match = (item) => (item.swell.indexOf(swell2Direction)>-1) ? true : false;
    const windMatch = (item) => (item.wind.indexOf(windDirection)>-1) ? true : false;
    const tideMatch = (item) => (item.tide.indexOf(tide)>-1) ? true : false;
    const swell2DirectionMatch = (direction) => (direction===swell2Direction) ? true : false;
    const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
    const tideDirectionMatch = (direction) => (direction.tide === tide) ? true : false;
    return (
        <div key={getKey("loc")} /*onClick={() => this.props.editLocation()}*/>
            <div className="r-10 m-10 p-20 bg-dkGreen">
                    <div className="width100Percent flexContainer">{getStars(matches)}</div>
                    <div className="mt-10 navBranding">{item.name}</div>
                    <div className="greet color-yellow p-5 bg-dkGreen mt-15 mb-10 r-5">{`${regionMatch} miles`}</div>
                <div className="flexContainer">
                    <div className="flexContainer m-auto">
                        <div className="columnRight pr-10">
                            <div className="color-neogreen bold">Swell: </div>
                            <div className="color-neogreen bold">Wind: </div>
                            <div className="color-neogreen bold">Tide: </div>
                        </div>
                        <div className="columnLeft">
                            <div>{item.swell.map((swell, i) => <span key={getKey("swell")} className={(swell === status.swell1Direction) ? statusClass(swell1Match(item)) : subStatusClass(swell2DirectionMatch(swell))}>{swell}{((i+1) === item.swell.length)? "" : ", "}</span>)}</div>
                            <div className={statusClass(windMatch(item))}>
                                {item.wind.map((wind, i) => <span key={getKey("wind")} className={statusClass(windDirectionMatch({wind}))}>
                                                            {wind}{((i+1) === item.wind.length)? "" : ", "}
                                                        </span>)}
                            </div>
                            <div className={statusClass(tideMatch(item))}>{item.tide.map((tide,i) => <span key={getKey("tide")} className={statusClass(tideDirectionMatch({tide}))}>{tide}{((i+1) === item.tide.length)? "" : ", "}</span>)}</div>
                        </div>
                    </div>
                    
                </div>
                {
                    //(status.logged) ? editLogButton() : logLocationButton(item)
                    logLocationButton(item)
                }
            </div>
        </div>
    );
}
export default SurfLocation;