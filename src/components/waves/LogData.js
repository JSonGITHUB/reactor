import React from 'react';
import PostDirectory from './PostDirectory.js';
import LogId from './LogId.js';

class LogData extends React.Component {
    logIdComponent = new LogId(this.props.recordId);
    postDirectory = new PostDirectory();

    constructor(props) {
        super(props);
        //console.log(`LOGDATA !!!!! props.recordId: ${props.recordId}`)
        //console.log(`LOGDATA !!!!! postDirectory: ${JSON.stringify(this.postDirectory.getDirectory(),null, 2)}`)
        this.state = {
            recordId: (props.recordId === null) ? this.logIdComponent.generateNewLogId() : props.recordId,
            log: (JSON.parse(localStorage.getItem(props.recordId)) === null) ? this.logIdComponent.templateData : JSON.parse(localStorage.getItem(props.recordId))
        }
    }
    getDate = () => this.state.log.Day.Date;
    
    render() {      
        console.log(`LogData => render: this.state.recordId: ${this.state.recordId} - this.state.log: ${this.state.log}`);
        return <p>Count: {this.state.postDirectory.length}</p> 
    }
    
}
export default LogData;