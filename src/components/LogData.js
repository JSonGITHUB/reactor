import React from 'react';
import PostDirectory from './PostDirectory.js';
class LogData extends React.Component {
    
    postDirectory = new PostDirectory();

    getRecordId = () => {
        const date = new Date()
        const st = date.toDateString().replace(/ /g,"");
        const nd = date.toLocaleTimeString().replace(/ /g,"");
        localStorage.setItem("lastPostId", `${st}${nd}`);
        return `${st}${nd}`;
    }
    init = () => {
        const recordId = this.getRecordId();
        console.log(`LogData => init: this.state.recordId: ${recordId} - this.state.log: ${this.getLogTemplate}`);
        this.setState({
            log: this.getLogTemplate,
            recordId: recordId
        });
    }
    getLogTemplate = {
        Day: {
          Date: "2020-04-07T07:00:00.000Z",
          Day: 7,
          Month: 4,
          Year: 2020
        },
        Location: {
          Break: "HB: Sanchos"
        },
        Swell: {
          Direction: "W",
          Height: "head high",
          Report: "4ft"
        },
        Tide: {
          Phase: "High => Low",
          Height: "2ft"
        },
        Wind: {
          Direction: "N",
          Orientation: "Offshore",
          MPH: "5mph",
          Surface: "Glassy"
        },
        Conditions: {
          Conditions: "Firing"
        },
        Comments: {
          notes: "All time HB, pouring rain, glassy, peaky barrels."
        }
    }

    constructor(props) {
        super(props);
        console.log(`LOGDATA !!!!! props.recordId: ${props.recordId}`)
        console.log(`LOGDATA !!!!! postDirectory: ${JSON.stringify(this.postDirectory.getDirectory(),null, 2)}`)
        this.state = {
            recordId: (props.recordId === null) ? this.getRecordId() : props.recordId,
            log: (JSON.parse(localStorage.getItem(props.recordId)) === null) ? this.getLogTemplate : JSON.parse(localStorage.getItem(props.recordId))
        }
    }
    getDate = () => this.state.log.Day.Date;
    
    render() {      
        console.log(`LogData => render: this.state.recordId: ${this.state.recordId} - this.state.log: ${this.state.log}`);
        return <p>Count: {this.state.postDirectory.length}</p> 
    }
    
}
export default LogData;