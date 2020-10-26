import React from 'react';
import LogEntry from './LogEntry.js';
import Loader from '../utils/Loader.js';
import LogId from './LogId.js';
class Logger extends React.Component {

    logIdComponent = new LogId(this.props.logId);
    
    constructor(props) {
        super(props);
//        console.log(`Logger => constructor -> props.logId: ${this.logIdComponent.getLogId()}`)
//        console.log(`Logger => constructor -> localStorage.getItem: ${this.logIdComponent.getLogId()} ====> ${localStorage.getItem(this.logIdComponent.getLogId())}`)
        if (localStorage.getItem(this.logIdComponent.getLogId()) === null) {
            this.log = this.logIdComponent.templateData;
            this.lodId = this.logIdComponent.generateNewLogId();
        } else {
            this.log = JSON.parse(localStorage.getItem(this.logIdComponent.getLogId()));
            this.logId = this.logIdComponent.getLogId()
        }
//        console.log(`Logger => constructor -> log: ${JSON.stringify(this.log,null,2)}`)
        this.state = {
            date: new Date(),
            log: this.log,
            items: [],
            isLoaded: false,
            logId: this.logId
        };
        this.updateLog = this.updateLog.bind(this);
        this.getStateLog = this.getStateLog.bind(this);
    }
    //getSpot = () => (this.state.spot) ? this.state.spot : this.log.Location.Break;
    getSpot = () => localStorage.getItem("spot");
    componentDidMount() {
        //const logId = (this.props.location.state === undefined) ? this.logIdComponent.getLastRecordId() : this.props.location.state.logId.item;
        const { state } = this.props.location;
        console.log(`Logger => componentDidMount -> SPOT: ${this.getSpot()}`); 
        const logId = (state === undefined) ? this.logIdComponent.getLogId() : state.logId.item;
        //console.log(`Logger => componentDidMount -> logId: ${logId}`)
        if (localStorage.getItem(this.logIdComponent.getLogId()) === null) {
            this.log = this.logIdComponent.templateData;
            this.lodId = this.logIdComponent.generateNewLogId();
        } else {
            this.log = JSON.parse(localStorage.getItem(this.logIdComponent.getLogId()));
            this.logId = this.logIdComponent.getLogId()
        }
        console.log(`logId$$$$$$$$$$: ${this.logIdComponent.getLogId()} --- localStorage.${this.logIdComponent.getLogId()} ==== ${JSON.stringify(this.log,null,2)} AND logId::::: ${logId}`)
//      console.log(`Logger => constructor -> log: ${JSON.stringify(this.log,null,2)}`)
        let data;
        //localStorage.setItem('spot', this.getSpot());
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        /*
        const requestInit = {
            method:'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default'
        };
        */
        //const uri = new Request('https://jsongithub.github.io/portfolio/assets/data/appData.json', requestInit);
        //GOOD const uri = 'https://jsongithub.github.io/portfolio/assets/data/appData.json';
        const uri = 'https://jsongithub.github.io/portfolio/assets/data/appData.json';
        //const uri = 'localhost:8080/writeSurfLog.json';
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                this.setState({
                    isLoaded: true,
                    items: data,
                    //logId: this.logIdComponent.getLogId()
                    logId: logId
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));
       
    }

    updateLog(groupTitle, label, selected, set) {
        this.log[groupTitle][label] = selected;
        if (groupTitle !== undefined && groupTitle !== 1 && selected !== undefined && set) {
            this.setState({log: this.log});
        }
    }
    getStateLog = () => this.state.log;
    
    render() {      
        let {isLoaded, items} = this.state;
//        console.log(`Logger ===> ${JSON.stringify(items[0].group.selections, null, 2)}`);
        let appInterface = <div className="App-content fadeIn">
                                <div className="flex3Column"></div>
                                <div className="flex3Column">
                                    <Loader />
                                </div>
                                <div className="flex3Column"></div>
                            </div>;
        if (isLoaded) {
            appInterface = <div className="App-content fadeIn">
                <div className="flex3Column"></div>
                <div className="flex3Column">
                    <LogEntry
                       // logId={this.logIdComponent.getLogId()}
                        logId={this.state.logId}
                        onChange={this.updateLog} 
                        getStateLog={this.getStateLog} 
                        title="Session Log" 
                        message="Add your session data"  
                        buttonLabel="submit" 
                        items={items}
                    />
                </div>
                <div className="flex3Column"></div>
            </div>
            
        }
        return (
            appInterface            
        )
    }
    
}
export default Logger;