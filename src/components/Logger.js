import React from 'react';
import LogEntry from './LogEntry.js';
import Loader from './utils/Loader.js';
class Logger extends React.Component {

    templateData = {
        Day: {},
        Location: {},
        Swell: {},
        Wind: {},
        Tide: {},
        Conditions: {},
        Comments: {}
    };
    getLogId = () => (this.props.location.state === undefined) ? localStorage.getItem("lastPostId") : this.props.location.state.logId.item;
    
    constructor(props) {
        super(props);
        this.log = this.templateData;
        console.log(`Logger => constructor -> props.logId: ${this.getLogId()}`)
        console.log(`Logger => constructor -> localStorage.getItem: ${this.getLogId()} ====> ${localStorage.getItem(this.getLogId())}`)
        this.state = {
            date: new Date(),
            log: {},
            items: [],
            isLoaded: false,
            logId: this.getLogId()
        };
        this.updateLog = this.updateLog.bind(this);
        this.getStateLog = this.getStateLog.bind(this);
    }
    componentDidMount() {
        //const getLastId = () => (localStorage.getItem(localStorage.getItem("lastPostId")) === null) ? this.postDirectory[this.postDirectory.length-1] : localStorage.getItem("lastPostId");
        //const logId = (this.props.location.state === undefined) ? getLastId() : this.props.location.state.logId.item;
        //console.log(`Logger => componentDidMount -> logId: ${logId}`)
        let data;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        const requestInit = {
            method:'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'default'
        };
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
                    logId: this.getLogId()
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
        //console.log(`Logger => ${JSON.stringify(this.state, null, 2)}`);
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
                        logId={this.getLogId()}
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