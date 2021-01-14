import React from 'react';
import PostDirectory from './PostDirectory.js';
import templateData from './TemplateData.js';
class LogId extends React.Component {
    
    postDirectory = new PostDirectory();
    
    constructor(props) {
        super(props);
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
        return newId;
    }
    setLogId = (logId, log) => this.setState({
        logId: logId,
        log: log
    });
    getLogId = () => this.state.logId;

    render() {   
        const { logId, log, postDirectory} = this.state;   
        console.log(`LastLogId => render: this.state.logId: ${logId} - this.state.log: ${log}`);
        return <p>Count: {postDirectory.length}</p> 
    }
    
}
export default LogId;