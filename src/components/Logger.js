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

    constructor(props) {
        super(props);
        this.log = this.templateData;
        this.state = {
            date: new Date(),
            log: {},
            items: [],
            isLoaded: false
        };
        this.updateLog = this.updateLog.bind(this);
        this.getStateLog = this.getStateLog.bind(this);
    }
    componentDidMount() {
        let data
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
        const uri = 'https://jsongithub.github.io/portfolio/assets/data/appData.json';
        //const uri = 'localhost:8080/writeSurfLog.json';
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                this.setState({
                    isLoaded: true,
                    items: data
                })
            })
            .catch(err => console.log("Something went wrong!\n", err));

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
                        onChange={this.updateLog} 
                        getStateLog={this.getStateLog} 
                        title="Session Log" 
                        message="Add your session data"  
                        buttonLabel="Submit" 
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