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
        const { recordId } = props;
        this.state = {
            recordId: (recordId === null) ? this.logIdComponent.generateNewLogId() : recordId,
            log: (JSON.parse(localStorage.getItem(recordId)) === null) ? this.logIdComponent.templateData : JSON.parse(localStorage.getItem(recordId))
        }
    }
    getDate = () => this.state.log.Day.Date;
    
    render() {  
        const { recordId, log, postDirectory } = this.state;    
        console.log(`LogData => render: this.state.recordId: ${recordId} - this.state.log: ${log}`);
        return <p>Count: {postDirectory.length}</p> 
    }
    
}
export default LogData;