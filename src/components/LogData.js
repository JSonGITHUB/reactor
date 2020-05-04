import React from 'react';
import PostDirectory from './PostDirectory.js';
class LogData extends React.Component {
    
    postDirectory = new PostDirectory();
    constructor(props) {
        super(props);
        console.log(`LOGDATA !!!!! props.recordId: ${props.recordId}`)
        console.log(`LOGDATA !!!!! postDirectory: ${JSON.stringify(this.postDirectory.getDirectory(),null, 2)}`)
        this.state = {
            recordId: props.recordId,
            log: JSON.parse(localStorage.getItem(props.recordId))
        };
    }
    getDate = () => this.state.log.Day.Date;
    getLogTemplate = {
        Day: {},
        Location: {},
        Swell: {},
        Tide: {},
        Wind: {},
        Conditions: {},
        Comments: {}
    };
    
    render() {      
            return <p>Count: {this.state.postDirectory.length}</p> 
    }
    
}
export default LogData;