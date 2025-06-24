import React, { useState, useEffect } from 'react';
import RadioSelector from '../forms/FormRadio';
import DatePicker from 'react-date-picker';
import getKey from '../utils/KeyGenerator';
import PostDirectory from './PostDirectory';
import { BrowserRouter as Route } from 'react-router-dom';
import Selector from './Selector';
import group from './Group';
import generateNewLogId from './GenerateLogId';
import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';

const LogEntry = ({ logId, onChange, getStateLog, title, message, items }) => {

    const [
        postDirectory,
        setPostDirectory,
        getLastIndex,
        getLastPost,
        addPost,
    ] = PostDirectory();

    const logExists = () => {
        const available = (postDirectory.includes(String(logId))) ? true : false;
        console.log(`LogEntryFunctional => logExists() available: ${available}`);
        console.log(`LogEntryFunctional => logExists() logId: '${logId}' Local.logId: ${initializeData(logId, null)}`);
        return available;
    }

    const localLogExists = () => (initializeData(logId, null) === null) ? false : true;
    console.log(`LogEntry => logId: ${logId} title: ${title} localLogExists: ${localLogExists()} logExists: ${logExists()} getLastPost: ${getLastPost()}`);
    
    const [status, setStatus] = useState({
        logId: logId,
        date: new Date(),
        log: getStateLog(),
        change: false,
        spot: initializeData('spot', "Ninja's")
    });

    useEffect(() => {
        //console.log(`LogEntryFunctional => log: ${JSON.stringify(status.log, null, 2)}`)
    }, []);

    const handleSelection = (groupTitle, label, selected) => {
        console.log(`handleSelection => \ngroupTitle: ${groupTitle}\nlabel: ${label}\nselected: ${selected}`)
        if (typeof groupTitle === 'string') {
            const currentLog = status.log;
            currentLog[groupTitle][label] = selected;
            setStatus(prevState => ({
                ...prevState,
                log: currentLog,
                change: true
            }));
            onChange(groupTitle, label, selected, true);
        }
    }

    const updateNotes = (event) => {
        handleSelection('Comments', 'notes', event.target.value);
    }

    const handleSubmit = (event) => {
        const recordId = generateNewLogId();
        const newPost = JSON.stringify(status.log);
        localStorage.setItem(recordId, newPost);
        console.log(`LogEntry => handleSubmit(${recordId})`);
        const newPostDirectory = [...postDirectory];
        newPostDirectory.push(recordId);
        setPostDirectory(newPostDirectory);
        window.location.pathname = '/reactor/Sessions';
    }

    const handleSave = (event) => {
        addPost(logId, status.log);
        window.location.pathname = '/reactor/Sessions';
    }
    const handleDelete = () => {
        const id = logId;
        const newPostDirectory = [...postDirectory];
        console.log(`LogEntryFunctional => handleDelete(${id})`)
        const index = newPostDirectory.indexOf(String(id));
        console.log(`LogEntryFunctional => handleDelete: ${index} of ${newPostDirectory.length}`)
        newPostDirectory.splice(index, 1);
        console.log(`LogEntryFunctional => handleDelete ${index} of ${newPostDirectory.length}`)
        localStorage.removeItem(id);
        localStorage.setItem('lastPostId', `${newPostDirectory[getLastIndex()]}`);
        setPostDirectory(newPostDirectory);
        window.location.pathname = '/reactor/Sessions';
    }
    const onDateChange = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        handleSelection('Day', 'Date', date);
        handleSelection('Day', 'Day', day);
        handleSelection('Day', 'Month', month);
        handleSelection('Day', 'Year', year);
    }
    const getWaveHeight = (height) => {
        let newHeight = height;
        const heights = ['flat', 'knee high', 'waist high', 'chest high', 'shoulder high', 'head high', 'over head', 'foot over head', '2 feet over head', 'double over head', 'triple over head']
        const size = ['1ft', '2ft', '3ft', '4ft', '5ft', '6ft', '7ft', '8ft', '9ft', '10ft'];
        const decimal = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0']
        newHeight = (size.indexOf(height) < 0) ? height : size[heights.indexOf(height)];
        newHeight = (decimal.indexOf(height) < 0) ? height : size[decimal.indexOf(height)];
        return newHeight;
    }
    const getTide = (height) => {
        const tide = Number(height.replace('ft', '')).toFixed(0) + 'ft';
        return tide;
    }
    const defaultSelection = (item, groupTitle) => {
        let selected = status.log[groupTitle][item.description];
        if ((item.description === 'Height' && (groupTitle === 'Swell1' || groupTitle === 'Swell2')) || (item.description === 'Report' && groupTitle === 'Surf')) {
            selected = getWaveHeight(selected);
        }
        if (item.description === 'Phase' && groupTitle === 'Tide') {
            if (selected === 'high' || selected === 'medium' || selected === 'low') {
            } else if (selected > 3) {
                selected = 'high';
            } else if (selected > 2) {
                selected = 'medium';
            } else {
                selected = 'low';
            }
        }
        if (item.description === 'Height' && groupTitle === 'Tide') {
            if (selected === 'NaNft') {
                selected = status.log[groupTitle]['Phase'];
            }
            selected = getTide(selected);
        }
        if (selected === ('High => Low' || 'Low => High')) {
            selected = 'medium';
        }
        let selectedIndex = item.selections.indexOf(String(selected).toLocaleLowerCase());
        if (validate(item.selections[selectedIndex]) === null) {
            selectedIndex = item.selections.indexOf(String(selected));
        }
        return selectedIndex;
    }
    const radioItems = (item, groupTitle) => {
        return (
            <RadioSelector
                header={groupTitle}
                groupTitle={groupTitle}
                selected={defaultSelection(item, groupTitle)}
                label={item.description}
                items={item.selections}
                onChange={handleSelection}
            />
        )
    };

    const radio = (item, groupTitle) => {
        return (
            <div className='containerBox' key={getKey(`radio${groupTitle}`)}>
                {radioItems(item, groupTitle)}
            </div>
        )
    };

    const selectionInterface = (item, groupTitle, selected) => (item.type === 'radio') ? radio(item, groupTitle, selected) : Selector(item, groupTitle, status.spot, defaultSelection, handleSelection, selected);
    const groups = () => items.map((item) => {
        const headerClasses = 'containerBox color-yellow size20 bold';
        const description = item.description;
        return <div key={getKey(`groupConainer${description}`)} className='containerBox'>
            <div key={getKey(`groupHeader${description}`)} className={headerClasses}>
                {description}
            </div>
            <div key={getKey(`groupSubConainer${description}`)}>
                {
                    (!status.log[description])
                    ? null
                    : group(item).map((group) => {
                            console.log(`groups => description: ${description}`);
                            console.log(`groups => group.description: ${group.description}`);
                            console.log(`groups => logId: ${logId}`);
                            console.log(`groups => status.log: ${JSON.stringify(status.log,null,2)}`);
                            console.log(`groups => selection: status.log.${description}.${group.description} => ${status.log[description][group.description]}`);
                            const selection = status.log[description][group.description];
                            return selectionInterface(group, description, selection)
                        })
                }
            </div>
        </div>
    });
    const categories = () => {
        status.selectorStatus = [];
        return groups();
    }
    const dateEntry = () => {
        const stateLogDate = () => status.log.Day.Date;
        const getDate = () => (logExists() === true) ? new Date(stateLogDate()) : (status.date === '')?logId:new Date(status.date);
        return <div className='containerBox'>
                    <div className='containerBox bold color-yellow'>Date</div>
                    <div className='containerBox'>
                        <DatePicker
                            onChange={onDateChange}
                            value={getDate()}
                            className='containerBox width-100-percent bg-yellow color-dark'
                        /><br />
                    </div>
                </div>
    }

    return (
        (!status.log.Comments)
            ? null
            :<Route>
                    <form onSubmit={()=>console.log(`Session/LogEntryFunctional => submit: logId: ${logId} `)}>
                        {dateEntry()}
                        {categories()}
                        <div className='containerBox'>
                            <div className='containerBox color-yellow bold'>Additional Comments: </div>
                            <div className='containerBox'>
                                <textarea
                                    rows='10'
                                    cols={window.innerWidth / 15}
                                    value={status.log.Comments.notes}
                                    onChange={updateNotes}
                                    className='mt-10 greet p-10 r-10 brdr-green'
                                />
                            </div>
                        </div>
                        <div className='containerBox color-yellow bold'>
                            <p>Count: {postDirectory.length}</p> 
                        </div>
                        <div className='containerBox flexContainer bold'>
                            <div 
                                onClick={(logExists())? handleSave : handleSubmit} 
                                className='flex3Column button containerBox bg-green brdr-green color-dark'
                            >
                                {
                                (logExists())
                                ? 'save'
                                : `submit`
                                }
                            </div>
                            <div onClick={handleDelete} className='flex3Column button containerBox bg-red brdr-red color-dark'>
                                delete
                            </div>
                        </div>
                    </form>
                </Route>
    );
}

export default LogEntry;