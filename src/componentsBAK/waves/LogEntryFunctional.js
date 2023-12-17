import React, { useState } from 'react';
import Dialog from '../functional/Dialog.js';
import RadioSelector from '../forms/FormRadio.js';
import DatePicker from 'react-date-picker';
import getKey from '../utils/KeyGenerator.js';
import PostDirectory from './PostDirectory.js';
import { BrowserRouter as Router, Link, Route} from 'react-router-dom';
import Selector from './Selector.js';
import group from './Group.js';
import templateData from './TemplateData.js';
import generateNewLogId from './GenerateLogId.js';

const LogEntry = ({ logId, onChange, getStateLog, title, message, buttonLabel, items }) => {
    console.log(`LogEntry => logId: ${logId}`)
    const posts = new PostDirectory();
    const logIdExists = () => (logId !== undefined && logId !== "" ) ? false : true;
    const localLastPostIdExists = () => (localStorage.getItem("lastPostId") === null) ? false : true;
    const getLocalLastPostId = () => (localLastPostIdExists()) ? localStorage.getItem("lastPostId") : posts.getLastItem(); 
    const getLastPostId = () => (logIdExists()) ? logId : getLocalLastPostId();
    const localLogExists = () => (localStorage.getItem(logId) === null) ? false : true;
    const getLog = () => (localLogExists()) ? JSON.parse(localStorage.getItem(logId)) : templateData;
    //console.log(`LogEntry => logId: ${logId}\nlog: ${JSON.stringify(getLog(), null, 2)}`)
    // eslint-disable-next-line
    const classes = 'stripe p-10 color-black m-10 r-10 bg-soft';
    // eslint-disable-next-line
    const buttonClasses = 'button p-10 r-10 m-1 width-100-percent';

    const [status, setStatus] = useState({
        logId: logId,
        lastPostId: getLastPostId(),
        date: new Date(),
        log: getLog(),
        change: false,
        spot: localStorage.getItem('spot')
    });

    const handleSelection = (groupTitle, label, selected) => {
        console.log(`handleSelection => \ngroupTitle: ${groupTitle}\nlabel: ${label}\nselected: ${selected}`)
        if (typeof groupTitle === "string") {
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
        handleSelection("Comments", "notes", event.target.value);
    }
    const handleSubmit = (event) => {
        console.log(`handleSubmit: ${JSON.stringify(status.log, null, 2)}`)
        const recordId = generateNewLogId();
        console.log(`handleSubmit: recordId: ${recordId}`)
        let postDirectory = posts.getDirectory();
        let post = "";
        const logIt = () => {
            postDirectory.push(recordId);
            postDirectory = JSON.stringify(postDirectory);
            console.log(`postDirectory: ${postDirectory}`)
            post = JSON.stringify(status.log, null, 2);
            console.log(`post: ${post}`)
            localStorage.setItem(recordId, post);
            //localStorage.setItem("postDirectory", postDirectory);
            posts.add(recordId);
        }
        logIt();
        window.location.pathname = "/reactor/LogDirectory";
    }
    const handleSave = (event) => {
        console.log(`handleSave: ${status.log}`)
        const recordId = logId;
        let post = "";
        const logIt = () => {
            post = JSON.stringify(status.log, null, 2);
            console.log(`post: ${post}`)
            localStorage.setItem(recordId, post);
        }
        logIt();
        window.location.pathname = "/reactor/LogDirectory";
    }
    const handleDelete = () => {
        console.log(`handleDelete => `)
        const recordId = logId;
        console.log(`handleDelete => recordId: ${recordId}`)
        posts.delete(recordId);
        window.location.pathname = "/reactor/LogDirectory";
    }
    const onDateChange = (date) => {
        const day = date.getDate();
        const month = date.getMonth()+1;
        const year = date.getFullYear();
        handleSelection("Day", "Date", date);
        handleSelection("Day", "Day", day);
        handleSelection("Day", "Month", month);
        handleSelection("Day", "Year", year);
    }
    const getItems = () => items;
    const selected = (item, groupTitle) => ((item.selections.indexOf(status.log[groupTitle][item.description])) !== -1) ? true : false;
    const getWaveHeight = (height) => {
        console.log(`getWaveHeight(1) => height: ${height}`)
        let newHeight = height;
        const heights = ['knee high', 'waist high', 'chest high', 'shoulder high', 'head high', 'over head', 'foot over head', '2 feet over head' ,'double over head', 'triple over head']
        const size = ['1ft', '2ft', '3ft', '4ft', '5ft', '6ft', '7ft', '8ft' ,'9ft', '10ft'];
        const decimal = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0' ,'9.0', '10.0']
        newHeight = (size.indexOf(height)<0) ? height : size[heights.indexOf(height)];
        console.log(`getWaveHeight(2) => height: ${height}`);
        newHeight = (decimal.indexOf(height)<0) ? height : size[decimal.indexOf(height)];
        console.log(`getWaveHeight(3) => height: ${newHeight}`)
        return newHeight;     
    }
    const getTide = (height) => {
        const tide = Number(height.replace('ft','')).toFixed(0) + 'ft';
        console.log(`getTide => height: ${tide}`);
        return tide;
    }
    const defaultSelection = (item, groupTitle) => {
        console.log(`defaultSelection => status.log: ${JSON.stringify(status.log,null,2)}`);
        let selected = status.log[groupTitle][item.description];
        console.log(`defaultSelection => \nselected: ${selected}\ngroupTitle: ${groupTitle}\nitem.description: ${item.description}`);
        
        //selected = getWaveSize(selected);
        if ((item.description === 'Height' && (groupTitle === 'Swell1' || groupTitle === 'Swell2')) || (item.description === 'Report' && groupTitle === 'Surf')) {
            selected = getWaveHeight(selected);
        }
        if (item.description === 'Phase' && groupTitle === 'Tide') {
            console.log(`defaultSelection => Tide(1) => Phase: ${selected}`)
            if (selected === 'high' || selected === 'medium' || selected === 'low') {
            } else if (selected > 3) {
                selected = 'high';
            } else if (selected > 2) {
                selected = 'medium';
            } else {
                selected = 'low';
            }
            //selected = getTide(selected);
            console.log(`defaultSelection => Tide(2) => Phase: ${selected}`)
        }
        if (item.description === 'Height' && groupTitle === 'Tide') {
            if (selected === 'NaNft') {
                selected = status.log[groupTitle]['Phase'];
            }
            console.log(`defaultSelection => Tide => Height: ${selected}`)
            selected = getTide(selected);
        }
        if (selected === ('High => Low' || 'Low => High')) {
            selected = 'medium';
        }
        let selectedIndex = item.selections.indexOf(String(selected).toLocaleLowerCase());
        if (item.selections[selectedIndex] === undefined) {
            selectedIndex = item.selections.indexOf(String(selected));
        }
        console.log(`defaultSelection => ${item.description}: ${groupTitle} - ${selected}\nselections:${item.selections[selectedIndex]}\nitem: ${JSON.stringify(item, null, 2)}`);
        return selectedIndex; 
    }
    const radioItems = (item, groupTitle) => {
        return (
            <RadioSelector
                header={groupTitle}
                groupTitle={groupTitle} 
                selected={defaultSelection(item,groupTitle)} 
                label={item.description} 
                items={item.selections} 
                onChange={handleSelection}
            />
        )
    };

                            
    const radio = (item, groupTitle) => {
        console.log('RADIO button')
        return (
            <div className="r-vw">
                {radioItems(item, groupTitle)}
            </div>
        )
    };
    
    const selectionInterface = (item, groupTitle) => (item.type === 'radio') ? radio(item, groupTitle) : Selector(item, groupTitle, status.spot, defaultSelection, handleSelection, selected);
    const groups = () => getItems().map((item) => {
        const headerClasses = 'subHeader color-yellow p-20';
        const selectorClasses = 'greet p-vw flex3Column';
        const groupClasses = (window.innerWidth < 500) 
            ? "r-vw bg-dark r-10" 
            : "flexContainer width-100-percent r-vw bg-dark r-10";
        const description = item.description;
        //console.log(`description: ${description}`)
       return <div key={getKey("groupConainer")}>
                <div key={getKey("groupHeader")} className={headerClasses}>
                    {description}
                </div>
                <div className={groupClasses} key={getKey("groupSubConainer")}>
                    {group(item).map((group) => 
                        <div key={getKey("selectorContainer")} className={selectorClasses}>
                            {selectionInterface(group, description)}
                        </div>
                    )}
                </div>
            </div>
    });
    const categories = () => {
        status.selectorStatus = [];
        return <div className='description'>{groups()}</div>;
    }
    const getLogObject = () => status.log;
    const dateEntry = () => {
        const logExists = (status.log !== undefined && status.log !== null && JSON.stringify(status.log, null, 2) !== "{}") ? true : false;
        const stateLogDate = () => getLogObject().Day.Date;
        const getDate = () => (logExists === true) ? new Date(stateLogDate()) : new Date(status.date);
        return <React.Fragment>
                    <div className='mb-5 subHeader color-yellow'>Date</div>
                    <div className='flexContainer width-100-percent'>
                        <DatePicker
                            onChange={onDateChange}
                            value={getDate()} 
                            className='glassy p-vw bg-lite flex3Column r-vw m-vw p-20'
                        /><br/>
                    </div>
                </React.Fragment>
    }
    
    return (
        <Route>
            <form onSubmit={handleSubmit} className='bg-lite p-20 m-5 r-10'>
                {dateEntry()}
                {categories()}
                <br/>
                <div className="mb-5">Additional Comments: </div>
                <textarea 
                    rows="10" 
                    cols={window.innerWidth/15} 
                    value={status.log.Comments.notes} 
                    onChange={updateNotes} 
                    className="mt-10 greet p-10 r-10 brdr-green"
                />
                <PostDirectory />
                <Link className="noUnderline color-black"
                    to="/LogDirectory"
                    onClick={() => handleSubmit()}>
                    <div onClick={handleSubmit} className="button m-1 greet p-20 r-10 bg-green brdr-green glassy">
                        {buttonLabel}
                    </div>
                </Link> 
                <Link className="noUnderline color-black"
                    to="/LogDirectory"
                    onClick={() => handleSave()}>
                    <div onClick={handleSave} className="myButton m-1 greet p-20 r-10 bg-yellow brdr-yellow glassy">
                        save
                    </div>
                </Link>
                <Link className="noUnderline"
                    to="/LogDirectory"
                    onClick={() => handleDelete()}>
                    <div onClick={handleDelete} className="button m-1 color-black greet p-20 r-10 bg-red brdr-red glassy">
                        delete
                    </div>
                </Link>
            </form>
        </Route>
    );
}

export default LogEntry;