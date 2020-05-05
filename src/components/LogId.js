import React from 'react';
import PostDirectory from './PostDirectory.js';
class LastLogId extends React.Component {
    
    postDirectory = new PostDirectory();

    generateNewLogId = () => {
        const date = new Date()
        const st = date.toDateString().replace(/ /g,"");
        const nd = date.toLocaleTimeString().replace(/ /g,"");
        //localStorage.setItem("lastPostId", `${st}${nd}`);
        const newId = `${st}${nd}`;
        console.log(`LogId: generateNewLogId => this.state.logId: ${newId}`);
        this.setState({
            logId: newId
        });
        return newId;
    }
    getCurrentLogId = () => this.state.logId;
    init = () => {
        const logId = this.generateNewLogId();
        console.log(`LastLogId => init: this.state.logId: ${logId}`);
        this.setState({
            logId: logId
        });
    }
    
    getLocalLastLogId = () => localStorage.getItem("lastPostId");
    lastLogId = () => (this.getLocalLastLogId() === null) ? this.postDirectory.getLastItem() : this.getLocalLastLogId();
    lastLogExists = () => (localStorage.getItem(this.getLocalLastLogId()) !== null) ? true : false;
    getLastLogId = () => (this.lastLogExists === true) ? this.getLocalLastLogId() : this.postDirectory.getLastId();
    getLogId = () => this.props.logId;
    
    constructor(props) {
        super(props);
        console.log(`LogId !!!!! props.logId: ${props.logId}`)
        console.log(`LogId !!!!! postDirectory: ${JSON.stringify(this.postDirectory.getDirectory(),null, 2)}`)
        this.state = {
            logId: (props.logId === null) ? this.generateNewLogId() : props.logId,
            log: (JSON.parse(localStorage.getItem(props.logId)) === null) ? this.getLogTemplate : JSON.parse(localStorage.getItem(props.logId))
        }
    }
    getDate = () => this.state.log.Day.Date;
    
    render() {      
        console.log(`LastLogId => render: this.state.logId: ${this.state.logId} - this.state.log: ${this.state.log}`);
        return <p>Count: {this.state.postDirectory.length}</p> 
    }
    
}
export default LastLogId;