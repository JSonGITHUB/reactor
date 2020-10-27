import React from 'react';
import getKey from '../utils/KeyGenerator.js';
import WaveUtils from '../utils/WaveUtils.js';
import Tide from './Tide.js';
import WaterTemp from './WaterTemp.js';
import AirTemp from './AirTemp.js';
import WindDirection from './WindDirection.js';
import Selector from '../forms/FunctionalSelector.js';
import Dialog from '../functional/Dialog.js';
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
import tide from '../../assets/images/tide.png'
import PostDirectory from './PostDirectory.js';
import {BrowserRouter as Router, Switch, Link, Route} from 'react-router-dom';

class SurfLocation extends React.Component {
    
    constructor(props) {
        super(props);
        const { edit, windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, height, stars } = props.state;
        this.state = {
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
        };
        this.createLog = this.createLog.bind(this);
    }

    posts = new PostDirectory();
    getStarKind = (kind) => {
        let classes = "shaka r-20 p-2";
        classes = (kind === "wind") ? (classes + " bg-white") : classes; 
        return classes;
    }
    getTideIcon = <img src={tide} className={`mb--5 ${this.getStarKind("tide")}`} alt="tide" />;
    getSwellIcon = (id) => {
        if (id === 1) {
            return <img src={swell1} className={`mb--5 ${this.getStarKind("tide")}`} alt="swell1" />
        } else {
            return <img src={swell2} className={`mb--5 ${this.getStarKind("tide")}`} alt="swell2" />;
        }
    }
    getWindIcon = () => {
        const windDirection = this.state.windDirection;
        if (windDirection === "N") {
            return <img src={N} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
            return <img src={NE} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "E") {
            return <img src={E} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
            return <img src={SE} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "S") {
            return <img src={S} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
            return <img src={SW} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if (windDirection === "W") {
            return <img src={W} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
            return <img src={NW} className={`mb--5 ${this.getStarKind("tide")}`} alt={windDirection} />;
        }
    }
    getMatchIcon = (kind) => {
        let icon = (kind === "swell1") ? "swell1" : "swell2";
        icon = (kind === "wind") ? "wind" : icon;
        icon = (kind === "tide") ? "tide" : icon;
        if (kind === "swell1") {
            return <img src={swell1} className={this.getStarKind(kind)} alt={kind} />
        } else if (kind === "swell2") {
            return <img src={swell2} className={this.getStarKind(kind)} alt={kind} />;
        } else if (kind === "tide") {
            return <img src={tide} className={this.getStarKind(kind)} alt={kind} />;
        } else if (kind === "wind") {
            const windDirection = this.state.windDirection;
            if (windDirection === "N") {
                return <img src={N} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NE") || (windDirection === "NNE") || (windDirection === "ENE")) {
                return <img src={NE} className={this.getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "E") {
                return <img src={E} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SE") || (windDirection === "SSE") || (windDirection === "ESE")) {
                return <img src={SE} className={this.getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "S") {
                return <img src={S} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "SW") || (windDirection === "SSW") || (windDirection === "WSW")) {
                return <img src={SW} className={this.getStarKind(kind)} alt={kind} />;
            } else if (windDirection === "W") {
                return <img src={W} className={this.getStarKind(kind)} alt={kind} />;
            } else if ((windDirection === "NW") || (windDirection === "NNW") || (windDirection === "WNW")) {
                return <img src={NW} className={this.getStarKind(kind)} alt={kind} />;
            }
        }
    }
    secondsToSec = () => "sec"
    getStarDetails = (kind) => {
        let details = "";
        const {height, windSpeed, windGusts, swell1Height, swell1Angle,swell1Interval, swell2Height, swell2Angle, swell2Interval} = this.state;
        details = (kind === "tide") ? <div className="bold color-neogreen">{height}'</div> : details;
        details = (kind === "wind") ? <div className="bold color-neogreen">{windSpeed}-{windGusts}kts</div> : details;
        details = (kind === "swell1") ? <div><div className="bold color-neogreen">{`${swell1Height}${(swell1Height.includes("ft")) ? "" : "'"}`}</div><div className="bold color-neogreen">{swell1Angle}°</div><div className="bold color-neogreen">{swell1Interval.replace(" seconds",this.secondsToSec())}</div></div> : details;
        details = (kind === "swell2") ? <div><div className="bold color-neogreen">{`${swell2Height}${(swell2Height.includes("ft")) ? "" : "'"}`}</div><div className="bold color-neogreen">{swell2Angle}°</div><div className="bold color-neogreen">{swell2Interval.replace(" seconds",this.secondsToSec())}</div></div> : details;
        return details
    }
    getState = (kind) => {
        const { swell1Direction, swell2Direction, tide, windDirection } = this.state;
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
    star = (matchKind) => <div key={getKey("star")} className="flex3Column bg-lite mr-5 ml-5 p-10 r-10">
                            {this.getMatchIcon(matchKind)}
                            <div className="greet">{this.getState(matchKind)}{this.getStarDetails(matchKind)}</div>
                        </div>;
    getStars = (stars) => stars.map((star) => this.star(star));
    generateNewLogId = () => {
        const date = new Date()
        const st = date.toDateString().replace(/ /g,"");
        const nd = date.toLocaleTimeString().replace(/ /g,"");
        localStorage.setItem("lastPostId", `${st}${nd}`);
        const newId = `${st}${nd}`;
        console.log(`LogId: generateNewLogId => this.state.logId: ${newId}`);
        return newId;
    }
    goToLog = () => window.location.pathname = "/reactor/SurfLog"
    createLog = (item) => {
        localStorage.setItem('spot', item.name);
        const recordId = this.generateNewLogId();
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
        const getEndTime = `${year}${month}${date}%20${hours}:${minutes}`;
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
            let mph = Number(this.state.windGusts)+1;
            mph = mph + "mph";
            return mph
        }
        const getSurface = () => {
            const surfaces = ["oily glass", "glassy", "textured", "choppy", "victory at sea"];
            let surface = Math.floor((Number(this.state.windGusts)+1)/3);
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
            return directions[this.state.windDirection]
        }
        const getNotes = () => {
            const { height, tide, windDirection, swell1Height, swell1Angle, swell1Direction, swell1Interval } = this.state;
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
                Height: getWaveHeight(this.state.swell1Height),
                Report: this.state.swell1Height,
                Shape: "close-outs"
            },
            Swell1: {
                Height: this.state.swell1Height,
                Direction: this.state.swell1Direction,
                Angle: this.state.swell1Angle,
                Interval: this.state.swell1Interval,
            },
            Swell2: {
                Height: this.state.swell2Height,
                Direction: this.state.swell2Direction,
                Angle: this.state.swell2Angle,
                Interval: this.state.swell2Interval,
            },
            Swell3: {
                Height: "1ft",
                Direction: "NW",
                Angle: "180",
                Interval: "6 seconds",
            },
            Tide: {
                Phase: this.state.tide,
                Height: Number(this.state.height).toFixed(0)+"ft"
            },
            Wind: {
                Direction: this.state.windDirection,
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
        let postDirectory = this.posts.getDirectory();
        let post = "";
        const logIt = () => {
            postDirectory.push(recordId);
            postDirectory = JSON.stringify(postDirectory);
            console.log(`postDirectory: ${postDirectory}`)
            post = JSON.stringify(logObj, null, 2);
            console.log(`post: ${post}`)
            localStorage.setItem(recordId, post);
            //localStorage.setItem("postDirectory", postDirectory);
            this.posts.add(recordId);
        }
        logIt();
        this.goToLog();
        /*
        this.setState({
            recordId: recordId,
            logged: true
        })
        */
    };
    logLocation = (item) => (this.state.logged === true) ? alert("log already exists") : this.createLog(item);
    logLocationButton = (item) => {
        return <div>
                    {
                        (localStorage.getItem("edit") === "true") ? <div>
                                <WaveUtils state={this.state} item={item} logLocation={() => this.logLocation(item)}></WaveUtils>
                            </div>
                        :
                        <div className="App button bg-yellow color-black p-10 r-10 mt-20" onClick={() => this.logLocation(item)}>
                            Log Session
                        </div>
                    }
                </div>
    }
    editLogButton = () => {
        return (
            <Link className="noUnderline" key={getKey("link")} to={{
                pathname: '/SurfLog?logId=ThuApr3020209:19:28PM',
                state: {
                    logId: this.state.recordId
                }
            }}>
                <div className="App button bg-yellow color-black p-10 r-10 mt-20">
                    Edit Log
                </div>
            </Link>
        );
    }
    
    render() {
        const item = this.props.item;
        const { windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, height, stars } = this.state;
        const statusClass = (status) => (status === true) ? "color-neogreen" : "color-yellow"; 
        const subStatusClass = (status) => (status === true) ? "color-orange" : "color-yellow"; 
        const swell1Match = (item) => (item.swell.indexOf(swell1Direction)>-1) ? true : false;
        const swell2Match = (item) => (item.swell.indexOf(swell2Direction)>-1) ? true : false;
        const windMatch = (item) => (item.wind.indexOf(windDirection)>-1) ? true : false;
        const tideMatch = (item) => (item.tide.indexOf(tide)>-1) ? true : false;
        const swell2DirectionMatch = (direction) => (direction===swell2Direction) ? true : false;
        const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
        const tideDirectionMatch = (direction) => (direction.tide === tide) ? true : false;
        const {matches, regionMatch} = this.props;
        return (
            <div key={getKey("loc")} /*onClick={() => this.props.editLocation()}*/>
                <div className="r-10 m-10 p-20 bg-dkGreen">
                        <div className="width100Percent flexContainer">{this.getStars(matches)}</div>
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
                                <div>{item.swell.map((swell, i) => <span key={getKey("swell")} className={(swell === this.state.swell1Direction) ? statusClass(swell1Match(item)) : subStatusClass(swell2DirectionMatch(swell))}>{swell}{((i+1) === item.swell.length)? "" : ", "}</span>)}</div>
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
                        //(this.state.logged) ? this.editLogButton() : this.logLocationButton(item)
                        this.logLocationButton(item)
                    }
                </div>
            </div>
        );
    }
}
export default SurfLocation;