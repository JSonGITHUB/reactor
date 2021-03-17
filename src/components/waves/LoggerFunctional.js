import React, {useState, useEffect} from 'react';
import LogEntry from './LogEntryFunctional.js';
import Loader from '../utils/Loader.js';
import interfaceData from './InterfaceData.js'
import templateData from './LogTemplateData.js';
import generateNewLogId from './GenerateLogId.js';

const Logger = ({logId, location}) => { 
    console.log(`Logger => logId: ${logId}\nlocalStorage.getItem('logId'): ${localStorage.getItem('logId')}`); 
    const logExists = () => (localStorage.getItem(logId) === null) ? false : true;
    // eslint-disable-next-line
    const initLogId = () => (logExists()) ? logId : generateNewLogId();
    const initLog = () => (logExists()) ? JSON.parse(localStorage.getItem(logId)) : templateData;
    const [status, setStatus] = useState({
        //logID: initLogId(),
        logID: localStorage.getItem('logId'),
        log: initLog(),
        isLoaded: false,
        items: []
    })
    // eslint-disable-next-line
    const getSpot = () => localStorage.getItem("spot");
    useEffect(() => {
        // eslint-disable-next-line
        const { state } = location;
        const logId = localStorage.getItem('logId');
        console.log(`LoggerFunctional => componentDidMount -> SPOT: ${getSpot()}\ngetLogId: ${localStorage.getItem('logId')}\nlogId: ${logId}`); 
        
        if (localStorage.getItem(logId) === null) {
            setStatus(prevState => ({
                ...prevState,
                log: templateData,
                logID:generateNewLogId()
            }));
            console.log(`LoggerFunctional => componentDidMount -> 1\nSPOT: ${getSpot()}\nlogID: ${logId}\nlog: ${JSON.stringify(status.log, null, 2)}`); 
        
        } else {
            setStatus(prevState => ({
                ...prevState,
                log: JSON.parse(localStorage.getItem(logId)),
                logID: logId
            }));
            //console.log(`LoggerFunctional => componentDidMount -> 2\nSPOT: ${getSpot()}\nlogID: ${logId}\nlog: ${JSON.stringify(status.log, null, 2)}`); 
        }
        
        let data = interfaceData;
        const returnJSON = (response) => response.json();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        // eslint-disable-next-line
        const validate = (response) => (response.ok) ? returnJSON(response) : returnRejection(response);
        setStatus({
            log: JSON.parse(localStorage.getItem(logId)),
            logID: logId,
            items: data,
            isLoaded: true
        });
    }, [location, status.log])

    const updateLog = (groupTitle, label, selected, set) => {
        const log = (status.log !== null) ? status.log : templateData;
        //console.log(`updateLog => \ngroupTitle: ${groupTitle} \nlabel: ${label}\nselected: ${selected}\nset: ${set}\nlog: ${JSON.stringify(log, null, 2)}`)
        log[groupTitle][label] = selected;
        if (groupTitle !== undefined && groupTitle !== 1 && selected !== undefined && set) {
            setStatus(prevState => ({
                ...prevState,
                log: log
            }));
        }
    }
    const getStateLog = () => status.log;
          
    //console.log(`LoggerFunctional ===> ${JSON.stringify(status.items, null, 2)}`);
    let appInterface = <div className="App-content fadeIn">
                            <div className="flex3Column"></div>
                            <div className="flex3Column">
                                <Loader />
                            </div>
                            <div className="flex3Column"></div>
                        </div>;
    if (status.isLoaded) {
        appInterface = <div className="App-content fadeIn">
            <div className="flex3Column"></div>
            <div className="flex3Column">
                <LogEntry
                    logId={status.logID}
                    onChange={updateLog} 
                    getStateLog={getStateLog} 
                    title="Session Log" 
                    message="Add your session data"  
                    buttonLabel="submit" 
                    items={status.items}
                />
            </div>
            <div className="flex3Column"></div>
        </div>
        
    }
    return (
        appInterface            
    )
    
}
export default Logger;