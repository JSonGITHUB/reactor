import React from 'react';
import getKey from '../utils/KeyGenerator.js';
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

class SurfLocation extends React.Component {
    
    constructor(props) {
        super(props);
        const {windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, height, stars} = props.state;
        this.state = {
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
        details = (kind === "tide") ? <div className="bold color-neogreen">{this.state.height}'</div> : details;
        details = (kind === "wind") ? <div className="bold color-neogreen">{this.state.windSpeed}-{this.state.windGusts}kts</div> : details;
        details = (kind === "swell1") ? <div><div className="bold color-neogreen">{this.state.swell1Angle}°</div><div className="bold color-neogreen">{`${this.state.swell1Height}${(this.state.swell1Height.includes("ft")) ? "" : "'"}`}</div><div className="bold color-neogreen">{this.state.swell1Interval.replace("seconds",this.secondsToSec())}</div></div> : details;
        details = (kind === "swell2") ? <div><div className="bold color-neogreen">{this.state.swell2Angle}°</div><div className="bold color-neogreen">{`${this.state.swell2Height}${(this.state.swell2Height.includes("ft")) ? "" : "'"}`}</div><div className="bold color-neogreen">{this.state.swell2Interval.replace("seconds",this.secondsToSec())}</div></div> : details;
        return details
    }
    getState = (kind) => {
        if (kind === "swell1") {
            return this.state.swell1Direction;
        } else if (kind === "swell2") {
            return this.state.swell2Direction;
        } else if (kind === "tide") {
            return this.state.tide;
        } else if (kind === "wind") {
            return this.state.windDirection;
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
    createLog = (item) => {
        console.log("CREATE LOG");
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
                Height: "head high",
                Report: this.state.swell1Height,
                Shape: "Close-outs"
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
                Height: this.state.height
            },
            Wind: {
                Direction: this.state.windDirection,
                Orientation: "Offshore",
                MPH: "5mph",
                Surface: "Glassy"
            },
            Conditions: {
                Conditions: "Good"
            },
            Comments: {
                "notes": "Enter some text here..."
            }
        }
        console.log(`LogObject: ${JSON.stringify(logObj, null, 2)}`)
        //return logObj;
        /*let postDirectory = this.posts.getDirectory();
        let post = "";
        const logIt = () => {
            postDirectory.push(recordId);
            postDirectory = JSON.stringify(postDirectory);
            console.log(`postDirectory: ${postDirectory}`)
            post = JSON.stringify(log, null, 2);
            console.log(`post: ${post}`)
            localStorage.setItem(recordId, post);
            //localStorage.setItem("postDirectory", postDirectory);
            this.posts.add(recordId);
        }
        const selectorStatusComplete = (this.selectorStatus.includes(false)) ? window.confirm("Report is incomplete, submit anyway?") : true;
        if (selectorStatusComplete) {
            logIt();
        }
        */
    };
    render() {
        const item = this.props.item;
        const {windDirection, windSpeed, windGusts, swell1Direction, swell2Direction, swell1Angle, swell2Angle, swell1Height, swell2Height, swell1Interval, swell2Interval, tide, height, stars} = this.state;
        const statusClass = (status) => (status === true) ? "color-neogreen" : "color-yellow"; 
        const subStatusClass = (status) => (status === true) ? "color-orange" : "color-yellow"; 
        const swell1Match = (item) => (item.swell.indexOf(swell1Direction)>-1) ? true : false;
        const swell2Match = (item) => (item.swell.indexOf(swell2Direction)>-1) ? true : false;
        const windMatch = (item) => (item.wind.indexOf(windDirection)>-1) ? true : false;
        const tideMatch = (item) => (item.tide.indexOf(tide)>-1) ? true : false;
        const swell2DirectionMatch = (direction) => (direction===swell2Direction) ? true : false;
        const windDirectionMatch = (direction) => (direction.wind === windDirection) ? true : false;
        const tideDirectionMatch = (direction) => (direction.tide === tide) ? true : false;
        
        return (
            <div key={getKey("loc")} onClick={() => this.createLog(item)}>
                <div className="r-10 m-10 p-20 bg-dkGreen">
                        <div className="width100Percent flexContainer">{this.getStars(this.props.matches)}</div>
                        <div className="mt-10 navBranding">{item.name}</div>
                        <div className="greet color-yellow p-5 bg-dkGreen mt-15 mb-10 r-5">{`${this.props.regionMatch} miles`}</div>
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
                </div>
            </div>
        );
    }
}
export default SurfLocation;