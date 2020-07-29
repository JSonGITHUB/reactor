import React from 'react';
import PostDirectory from './PostDirectory.js';
class LogId extends React.Component {
    
    postDirectory = new PostDirectory();
    
    constructor(props) {
        super(props);
        //console.log(`LogId !!!!! props.logId: ${props.logId}`)
        //console.log(`LogId !!!!! postDirectory: ${JSON.stringify(this.postDirectory.getDirectory(),null, 2)}`)
        const { logId } = props;
        this.state = {
            logId: (logId === null || logId === undefined) ? this.postDirectory.getLastId() : logId,
            log: (JSON.parse(localStorage.getItem(logId)) === null) ? this.getLogTemplate : JSON.parse(localStorage.getItem(logId))
        }
    }
    getDate = () => this.state.log.Day.Date;
    generateNewLogId = () => {
        const date = new Date()
        const st = date.toDateString().replace(/ /g,"");
        const nd = date.toLocaleTimeString().replace(/ /g,"");
        localStorage.setItem("lastPostId", `${st}${nd}`);
        const newId = `${st}${nd}`;
        console.log(`LogId: generateNewLogId => this.state.logId: ${newId}`);
        /*
        this.setState({
            logId: newId
        });
        */
        return newId;
    }
    setLogId = (logId, log) => this.setState({
        logId: logId,
        log: log
    });
    //getLocalLastRecordId = () => localStorage.getItem("lastPostId");
    //lastRecordIdExists = () => (this.getLocalLastRecordId() === null) ? false : true; 
    //lastRecordExists = () => (this.lastRecordIdExists() === true && localStorage.getItem(this.getLocalLastRecordId()) !== null) ? true : false
    //getLastRecordId = () => (localStorage.getItem("lastPostId") === null) ? this.generateNewLogId() : localStorage.getItem("lastPostId");
    getLogId = () => this.state.logId;

    templateData = {
        Day: {
            Date: "2020-01-17T08:00:00.000Z",
            Day: 17,
            Month: 1,
            Year: 2020
        },
        Location: {
            Break: "Notch"
        },
        Surf: {
            Height: "head high",
            Report: "4ft",
            Shape: "close-outs"
        },
        Swell1: {
            Height: "4ft",
            Direction: "NW",
            Angle: 280,
            Interval: 18,
        },
        Swell2: {
            Height: "2ft",
            Direction: "NW",
            Angle: 270,
            Interval: 8,
        },
        Swell3: {
            Height: "1ft",
            Direction: "NW",
            Angle: 180,
            Interval: 6,
        },
        Tide: {
            Phase: "High => Low",
            Height: "2ft"
        },
        Wind: {
            Direction: "NW",
            Orientation: "Offshore",
            MPH: "5mph",
            Surface: "Glassy"
        },
        Conditions: {
            Conditions: "Firing"
        },
        Comments: {
            "notes": "Biggest crowd but plenty of sick ones..."
        }
    };
    
    render() {   
        const { logId, log, postDirectory} = this.state;   
        console.log(`LastLogId => render: this.state.logId: ${logId} - this.state.log: ${log}`);
        return <p>Count: {postDirectory.length}</p> 
    }
    
}
export default LogId;