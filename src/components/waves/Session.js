import React, {useState, useEffect} from 'react';
import LogEntry from './LogEntryFunctional';
import Loader from '../site/Loader';
import interfaceData from './InterfaceData'
import templateData from './LogTemplateData';
import generateNewLogId from './GenerateLogId';
import PostDirectory from './PostDirectory';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';

const Session = ({logId, location}) => { 

    const [
        getLastPost
    ] = PostDirectory();
    
    console.log(`Session => logId: ${logId}\nlocalStorage.getItem('logId'): ${initializeData('logId', null)}`); 
    const logExists = () => {
        const available = (initializeData('logId', null) === null) ? false : true;
        console.log(`Session => logExists() available: ${available}`);
        console.log(`Session => logExists() logId: '${logId}' Local.logId: ${initializeData('logId', null)}`);
        return available;
    }
    // eslint-disable-next-line
    const initLogId = () => (logExists()) ? logId : generateNewLogId();
    const initLog = () => (logExists() && logId !== '') ? (initializeData('logId', null)) ? initializeData('logId', null) : getLastPost() : templateData;
    console.log(`Session => initLog: ${JSON.stringify(initLog(),null,2)}`)
    const [status, setStatus] = useState({
        logID: initLogId(),
        //log: getLastPost() || templateData,
        log: templateData,
        isLoaded: false,
        items: []
    })
    // eslint-disable-next-line
    const getSpot = () => initializeData('spot', null);

    useEffect(() => {
        // eslint-disable-next-line
        const { state } = location;
        const logId = initializeData('logId', null);
        console.log(`Session => useEffect => logId: ${logId}`)

        if (logId === null) {
            const lastPost = getLastPost() || templateData;
            console.log(`Session => useEffect => lastPost: ${lastPost}`)
            setStatus(prevState => ({
                ...prevState,
                //log: templateData,
                log: ((lastPost===0)||(lastPost===null))?initLog():lastPost,
                logID:generateNewLogId(),
                items: interfaceData,
                isLoaded: true
            }));
        } else {
            const localLog = initializeData('logId', null)
            console.log(`Session => useEffect => localLog: ${JSON.stringify(localLog,null,2)}`)
            setStatus(prevState => ({
                ...prevState,
                log: localLog ,
                logID: logId,
                items: interfaceData,
                isLoaded: true
            }));
        }
    }, []);

    useEffect(() => {
       console.log(`Session => useEffect => status.log: ${JSON.stringify(status.log,null,2)}`)
    }, [status]);

    const updateLog = (groupTitle, label, selected, set) => {
        const log = (status.log !== null) ? status.log : templateData;
        console.log(`updateLog => \ngroupTitle: ${groupTitle} \nlabel: ${label}\nselected: ${selected}\nset: ${set}\nlog: ${JSON.stringify(log, null, 2)}`)
        if (validate(groupTitle) !== null && groupTitle !== 1 && validate(selected) !== null && set) {
            setStatus(prevState => ({
                ...prevState,
                log: log
            }));
        }
    }
    const getStateLog = () => {
        const statusLog = status.log;
        const log = (statusLog.day) ? statusLog : templateData;
        console.log(`Session => getStateLog => log: ${log}`)
        return log;
    }
          
    let appInterface = <div className='App-content pb-400 sizeMobile fadeIn'>
                            <div className='flex3Column'></div>
                            <div className='flex3Column'>
                                <Loader />
                            </div>
                            <div className='flex3Column'></div>
                        </div>;
                        
    if (status.isLoaded) {
        console.log(`Session => status.logID: ${status.logID}`)
        appInterface = <div className='fadeIn mt--40 mb-20 bg-lite pt-10 pb-20'>
            <LogEntry
                logId={status.logID}
                onChange={updateLog} 
                getStateLog={getStateLog} 
                title='Session Log' 
                message='Add your session data'
                items={status.items}
            />
        </div>
        
    }
    if (status.log) {
        return (
            appInterface
        )
    }
    return
    
}
export default Session;