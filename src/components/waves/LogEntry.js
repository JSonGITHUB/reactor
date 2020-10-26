import React from 'react';
import Dialog from '../functional/Dialog.js';
import Selector from '../forms/FunctionalSelector.js';
import RadioSelector from '../forms/FormRadio.js';
import DatePicker from 'react-date-picker';
import getKey from '../utils/KeyGenerator.js';
import PostDirectory from './PostDirectory.js';
import LogData from './LogData.js';
import {BrowserRouter as Router, Switch, Link, Route} from 'react-router-dom';
import LogId from './LogId.js';

class LogEntry extends React.Component {
    //log = JSON.parse(localStorage.getItem("ThuApr3020207:03:14PM"));
    posts = new PostDirectory();
    postDirectory = this.posts.getDirectory();
    setDefaultLastId = () => {
        //console.log(`lastPostId: "ThuApr3020207:03:14PM"`)
        return "ThuApr3020207:03:14PM"
    }
    lastPostId = (localStorage.getItem("lastPostId") === null) ? this.posts.getLastItem() : localStorage.getItem("lastPostId");
    logData = new LogData({recordId: this.lastPostId});
    templateData = {
        Day: {
            Date: "2020-01-17T08:00:00.000Z",
            Day: 17,
            Month: 1,
            Year: 2020
        },
        Location: {
            Break: "Notch"
        },
        Surf: {
            Height: "head high",
            Report: "4ft",
            Shape: "close-outs"
        },
        Swell1: {
            Height: "4ft",
            Direction: "NW",
            Angle: "280",
            Interval: "18 seconds",
        },
        Swell2: {
            Height: "1ft",
            Direction: "NW",
            Angle: "270",
            Interval: "8 seconds",
        },
        Swell3: {
            Height: "1ft",
            Direction: "NW",
            Angle: "180",
            Interval: "6 seconds",
        },
        Tide: {
            Phase: "High => Low",
            Height: "2ft"
        },
        Wind: {
            Direction: "NW",
            Orientation: "Offshore",
            MPH: "5mph",
            Surface: "Glassy"
        },
        Conditions: {
            Conditions: "Firing"
        },
        Comments: {
            "notes": "Biggest crowd but plenty of sick ones..."
        }
    };
    constructor(props) {
        super(props);
        this.selectorStatus = [];
        const {items, buttonLabel, title, message, logId } = props; 
        this.buttonLabel = buttonLabel;
        this.title = title;
        this.message = message;
        this.logId = logId;
        this.spot = localStorage.getItem('spot');
        //this.logData.init();
        console.log(`LogEntry => SPOT: ${this.spot} props.logId: ${logId} props: ${JSON.stringify(props,null,2)}`)
        if (logId !== undefined && logId !== "" ) {
            this.lastPostId = logId;
            console.log(`$$ logId1: ${logId}`);
            this.log = (localStorage.getItem(logId) === null) ? this.templateData : JSON.parse(localStorage.getItem(logId));
        } else {
            this.lastPostId = "ThuApr3020209:19:28PM";
            console.log(`logId2: ${this.lastPostId}`)
            this.log = JSON.parse(localStorage.getItem("ThuApr3020209:19:28PM"))
        }
        this.logIdComponent = new LogId({logId: this.props.logId, log: this.log});
        this.state = {
            date: new Date(),
            items: items,
            spot: this.spot,
            log: this.log,
            lastPostId: logId,
            change: false
        };
        this.handleSelection = this.handleSelection.bind(this);
        this.updateNotes = this.updateNotes.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    }
    setLogState() {
        this.setState({
            log: this.log,
            change: true
        });
    }
    handleSelection(groupTitle, label, selected) {
        if (typeof groupTitle === "string") {
            this.log[groupTitle][label] = selected;
            this.props.onChange(groupTitle, label, selected, true);
            this.setLogState();
        } 
    }
    updateNotes(event) {
        this.handleSelection("Comments", "notes", event.target.value);
    }
    handleSubmit(event) {
        let { log } = this.state;
        log = (log !== undefined && JSON.stringify(log, null, 2) !== "{}") ? log : this.log;
        console.log(`handleSubmit: ${JSON.stringify(log, null, 2)}`)
        const recordId = this.logIdComponent.generateNewLogId();
        console.log(`handleSubmit: recordId: ${recordId}`)
        let postDirectory = this.posts.getDirectory();
        let post = "";
        const logIt = () => {
            postDirectory.push(recordId);
            postDirectory = JSON.stringify(postDirectory);
            console.log(`postDirectory: ${postDirectory}`)
            post = JSON.stringify(log, null, 2);
            console.log(`post: ${post}`)
            localStorage.setItem(recordId, post);
            //localStorage.setItem("postDirectory", postDirectory);
            this.posts.add(recordId);
        }
        const selectorStatusComplete = (this.selectorStatus.includes(false)) ? window.confirm("Report is incomplete, submit anyway?") : true;
        if (selectorStatusComplete) {
            logIt();
        }
    }
    handleSave(event) {
        let { log, lastPostId } = this.state;
        log = (log !== undefined && JSON.stringify(log, null, 2) !== "{}") ? log : this.log;
        console.log(`handleSave: ${log}`)
        const recordId = lastPostId;
        let post = "";
        const logIt = () => {
            post = JSON.stringify(log, null, 2);
            console.log(`post: ${post}`)
            localStorage.setItem(recordId, post);
        }
        const selectorStatusComplete = (this.selectorStatus.includes(false)) ? window.confirm("Report is incomplete, submit anyway?") : true;
        if (selectorStatusComplete) {
            logIt();
        }
    }
    handleDelete(event) {
        const recordId = this.state.lastPostId;
        //console.log(`delete record: ${recordId} ${this.state.log.Location.Break}`);
        //localStorage.setItem("postDirectory", JSON.stringify(this.postDirectory));
        this.posts.delete(recordId);
    }
    onDateChange(date) {
        const pickerDate = date;
        date = String(date);
        const day = pickerDate.getDate();
        const month = pickerDate.getMonth()+1;
        const year = pickerDate.getFullYear();
        const logDate = {
            "month": month,
            "day": day,
            "year": year
        }
        this.handleSelection("Day", "Date", pickerDate);
        this.handleSelection("Day", "Day", day);
        this.handleSelection("Day", "Month", month);
        this.handleSelection("Day", "Year", year);
    }
    getStateLog = () => this.props.getStateLog();
    items = () => this.state.items;
    selected = (item,groupTitle) => ((item.selections.indexOf(this.log[groupTitle][item.description])) !== -1) ? true : false;
    defaultSelection = (item,groupTitle) => (this.selected(item,groupTitle)) ? (item.selections.indexOf(this.log[groupTitle][item.description])) : 0; 
    selectorColor = (item,groupTitle) => (this.selected(item,groupTitle)) ? "completedSelector" : "incompletedSelector";
    
    radioItems = (item, groupTitle) => {
        return (
            <RadioSelector
                header={groupTitle}
                groupTitle={groupTitle} 
                selected={this.defaultSelection(item,groupTitle)} 
                label={item.description} 
                items={item.selections} 
                onChange={this.handleSelection}
            />
        )
    };
    getUnique = (array) => {
        let uniqueSpots = [...new Set(array)];
        return uniqueSpots;
    }
    getLocalSpots = () => {
        let uniqueSpots = [...new Set(this.getUnique(JSON.parse(localStorage.getItem('spots'))))];
        return uniqueSpots;
    }
    selector = (item, groupTitle) => {
        //console.log(`item: ${JSON.stringify(item, null, 2)}  groupTitle: ${groupTitle}`)
        //const setSelectorStatus = ((item.selections.indexOf(this.log[groupTitle][item.description])) !== -1) ? this.selectorStatus.push(true) : this.selectorStatus.push(false);
        console.log(`SELECTIONS Location? ${groupTitle === 'Location'} contains ${this.state.spot} => ${item.selections.includes(this.state.spot)} : \n${JSON.stringify(item.selections, null, 2)}`);
        const spot = this.state.spot;
        const isLocation = (groupTitle === 'Location') ? true : false;
        const localLocations = (localStorage.getItem('spots')) ? true : false;
        let items = item.selections;
        const setLocal = () => (isLocation && !localLocations) ? localStorage.setItem('spots', JSON.stringify(items)) : null;
        setLocal();
        items = (isLocation && localLocations) ? this.getLocalSpots() : this.getUnique(items);
        item.selections = items;
        const addSpot = () => {
            items.push(spot);
            items = this.getUnique(items);
            localStorage.setItem('spots', JSON.stringify(items))
            return items;
        }
        const verifySpot = () => {
            return (isLocation && !item.selections.includes(spot)) ? addSpot() : items;
        }
        console.log(`spot: ${spot} \n verifySpot(): ${verifySpot()} \nselected: ${this.defaultSelection(item,groupTitle)}`)
        
        return <div className={this.selectorColor(item,groupTitle) + " r-vw p-vw bg-green"}>
            <div className="mb-5">{item.description}: </div>
            <div className="mb-5">
                <Selector 
                    groupTitle={groupTitle}  
                    label={item.description} 
                    items={verifySpot()}
                    selected={this.defaultSelection(item,groupTitle)}
                    onChange={this.handleSelection}
                />
            </div>
        </div>;
    }

    radio = (item, groupTitle) => <div className="r-vw bg-green">
                {this.radioItems(item, groupTitle)}
            </div>;
    group = (item) => {
        if (item.description === "Location") {
            console.log(`GROUP => local spots: ${this.getLocalSpots()}`)
          //  return this.getLocalSpots();
        }
        return item.group;
        
    };
    selectionInterface = (item, groupTitle) => (item.type === "radio") ? this.radio(item, groupTitle) : this.selector(item, groupTitle);

    groups = () => this.items().map((item) => {
        const headerClasses = 'subHeader color-yellow';
        const selectorClasses = "greet p-vw bg-vdkGreen flex3Column";
        const groupClasses = (window.innerWidth < 500) ? "r-vw" : "flexContainer width-100-percent r-vw";
        const description = item.description;
        console.log(`description: ${JSON.stringify(item,null,2)}`)
        const addToLogs = (group) => {
            this.log[description][group.description] = group.selections[this.defaultSelection(group, description)]
            //this.props.onChange(description, group.description, group.selections[this.defaultSelection(group, description)], false);
        }
       // const logger = this.group(item).map((group) => addToLogs(group));
        return <div key={getKey("groupConainer")}>
                    <div key={getKey("groupHeader")} className={headerClasses}>
                        {item.description}
                    </div>
                    <div className={groupClasses} key={getKey("groupSubConainer")}>
                        {this.group(item).map((group) => 
                            <div key={getKey("selectorContainer")} className={selectorClasses}>
                                {this.selectionInterface(group, description)}
                            </div>
                        )}
                    </div>
                </div>
    })
    categories = () => {
        this.selectorStatus = [];
        return <div className='description'>{this.groups()}</div>;
    }
    getLogObject = () => this.state.log;
    dateEntry = () => {
        //console.log(`this.state.log: ${this.state.log}`)
        const {log, date } = this.state;
        const logExists = (log !== undefined && log !== null && JSON.stringify(log, null, 2) !== "{}") ? true : false;
        //console.log(`LogEntry => this.state.log: ${JSON.stringify(this.state.log, null, 2)}`)
        const stateLogDate = () => this.getLogObject().Day.Date;
        const getDate = () => (logExists === true) ? new Date(stateLogDate()) : new Date(date);
        const getTodaysDate = () => new Date();
        const getStateDate = () => date;
        //console.log(`getDate(): ${getDate()}`)
        //console.log(`getTodaysDate(): ${getTodaysDate()}`)
        //console.log(`this.state.log.Day.Date: ${this.state.log.Day.Date}`)
        //console.log(`this.state.date: ${getStateDate()}`)
        //console.log(`this.state.log: ${JSON.stringify(this.state.log, null,2)}`)
        //console.log(`this.lastPostId: ${this.lastPostId}`)
        return <React.Fragment>
                    <div className='mb-5 subHeader color-yellow'>Date</div>
                    <div className='flexContainer width-100-percent bg-vdkGreen'>
                        <DatePicker
                            onChange={this.onDateChange}
                            value={getDate()} 
                            //value={getTodaysDate()} 
                            className='p-vw bg-green flex3Column r-vw m-vw'
                        /><br/>
                    </div>
                </React.Fragment>
    }
    
    render() {
        //console.log(`GET STATE LOG ${JSON.stringify(this.getStateLog(), null, 2)}`)
        return (
            <Route>
                <Dialog title={this.title} message={this.message}>
                    <form onSubmit={this.handleSubmit}>
                        {this.dateEntry()}
                        {this.categories()}
                        <br/>
                        
                        <div className="mb-5">Additional Comments: </div>
                        <textarea 
                            rows="10" 
                            cols={window.innerWidth/15} 
                            value={this.state.log.Comments.notes} 
                            onChange={this.updateNotes} 
                            className="mt-10 greet p-10 r-10 brdr-green"
                        /><br/><br/>
                        <Link className="noUnderline color-black"
                            to="/LogDirectory"
                            onClick={() => this.handleSubmit()}>
                            <div onClick={this.handleSubmit} className="button m-1 greet p-20 r-10 bg-green brdr-green">
                                {this.buttonLabel}
                            </div>
                        </Link> 
                        <Link className="noUnderline color-black"
                            to="/LogDirectory"
                            onClick={() => this.handleSave()}>
                            <div className="button m-1 greet p-20 r-10 bg-yellow brdr-yellow">
                                save
                            </div>
                        </Link>
                        <Link className="noUnderline color-black"
                            to="/LogDirectory"
                            onClick={() => this.handleDelete()}>
                            <div  className="button m-1 greet p-20 r-10 bg-red brdr-red">
                                delete
                            </div>
                        </Link>
                        <PostDirectory />
                    </form>
                </Dialog>
            </Route>
        );
    };
}

export default LogEntry;