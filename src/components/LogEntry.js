import React from 'react';
import Dialog from './functional/Dialog.js';
import Selector from './forms/FunctionalSelector.js';
import RadioSelector from './forms/FormRadio.js';
import DatePicker from 'react-date-picker';
import getKey from './utils/KeyGenerator.js';
import PostDirectory from './PostDirectory.js';
import LogData from './LogData.js';
import {BrowserRouter as Router, Switch, Link, Route} from 'react-router-dom';

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

    constructor(props) {
        super(props);
        this.selectorStatus = [];
        this.buttonLabel = props.buttonLabel;
        this.title = props.title;
        this.message = props.message;
        this.logId = props.logId;
        this.log = {};
        if (props.logId !== undefined && props.logId !== "" ) {
            this.lastPostId = props.logId;
            console.log(`$$ logId1: ${props.logId}`);
            this.log = (localStorage.getItem(props.logId) === null) ? this.posts.getLastItem() : JSON.parse(localStorage.getItem(props.logId));
        } else {
            this.lastPostId = "ThuApr3020207:03:14PM";
            console.log(`logId2: ${this.lastPostId}`)
            this.log = JSON.parse(localStorage.getItem("ThuApr3020207:03:14PM"))
        }
        this.state = {
            date: new Date(),
            items: props.items,
            log: this.log,
            lastPostId: props.logId
        };
        this.handleSelection = this.handleSelection.bind(this);
        this.updateNotes = this.updateNotes.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    }
    setLogState() {
        this.setState({
            log: this.log
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
    getRecordId = () => {
        const date = new Date()
        const log = (this.state.log !== undefined && JSON.stringify(this.state.log, null, 2) !== "{}") ? JSON.stringify(this.state.log, null, 2) : JSON.stringify(this.log, null, 2);
        const st = date.toDateString().replace(/ /g,"");
        const nd = date.toLocaleTimeString().replace(/ /g,"");
        //console.log(`${st}${nd}: ${log}`)
        localStorage.setItem("lastPostId", `${st}${nd}`);
        return `${st}${nd}`;
    }
    handleSubmit(event) {
        const log = (this.state.log !== undefined && JSON.stringify(this.state.log, null, 2) !== "{}") ? this.state.log : this.log;
        console.log(`handleSubmit: ${log}`)
        const recordId = this.getRecordId();
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
        const log = (this.state.log !== undefined && JSON.stringify(this.state.log, null, 2) !== "{}") ? this.state.log : this.log;
        console.log(`handleSave: ${log}`)
        const recordId = this.state.lastPostId;
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
        console.log(`delete record: ${recordId} ${this.state.log.Location.Break}`);
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
    hasBeenSelected = (item,groupTitle) => ((item.selections.indexOf(this.log[groupTitle][item.description])) !== -1) ? true : false;
    defaultSelection = (item,groupTitle) => (this.hasBeenSelected(item,groupTitle)) ? (item.selections.indexOf(this.log[groupTitle][item.description])) : 0; 
    selectorColor = (item,groupTitle) => (this.hasBeenSelected(item,groupTitle)) ? "completedSelector" : "incompletedSelector";
    
    radioItems = (item, groupTitle) => <RadioSelector
                    header={groupTitle}
                    groupTitle={groupTitle} 
                    selected={this.defaultSelection(item,groupTitle)} 
                    label={item.description} 
                    items={item.selections} 
                    onChange={this.handleSelection}
                />;
    selector = (item, groupTitle) => {
            //console.log(`item: ${JSON.stringify(item, null, 2)}  groupTitle: ${groupTitle}`)
            //const setSelectorStatus = ((item.selections.indexOf(this.log[groupTitle][item.description])) !== -1) ? this.selectorStatus.push(true) : this.selectorStatus.push(false);
            
            return <div className={this.selectorColor(item,groupTitle) + " r-vw p-vw bg-green"}>
                <div className="mb-5">{item.description}: </div>
                <div className="mb-5">
                    <Selector 
                        groupTitle={groupTitle} 
                        selected={this.defaultSelection(item,groupTitle)} 
                        label={item.description} 
                        items={item.selections}
                        onChange={this.handleSelection}
                    />
                </div>
            </div>;
    }

    radio = (item, groupTitle) => <div className="r-vw bg-green">
                {this.radioItems(item, groupTitle)}
            </div>;
    group = (item) => item.group;
    selectionInterface = (item, groupTitle) => (item.type === "radio") ? this.radio(item, groupTitle) : this.selector(item, groupTitle);

    groups = () => this.items().map((item) => {
        const headerClasses = 'subHeader color-yellow';
        const selectorClasses = "greet p-vw bg-vdkGreen flex3Column";
        const groupClasses = (window.innerWidth < 500) ? "r-vw" : "flexContainer width-100-percent r-vw";
        const description = item.description;
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
                            <div key={getKey("selectorConainer")} className={selectorClasses}>
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
    dateEntry = () => {

            const logExists = (this.state.log !== undefined && JSON.stringify(this.state.log, null, 2) !== "{}") ? true : false;
            const stateLogDate = () => new Date(this.state.log.Day.Date);
            const getDate = () => (logExists === true) ? new Date(stateLogDate()) : new Date(this.state.date);
            const getTodaysDate = () => new Date();
            const getStateDate = () => this.state.date;
            //console.log(`getDate(): ${getDate()}`)
            //console.log(`getTodaysDate(): ${getTodaysDate()}`)
            //console.log(`this.state.log.Day.Date: ${this.state.log.Day.Date}`)
            //console.log(`this.state.date: ${getStateDate()}`)
            //console.log(`this.state.log: ${JSON.stringify(this.state.log, null,2)}`)
            //console.log(`this.lastPostId: ${this.lastPostId}`)
            return <div>
                <div className='mb-5 subHeader color-yellow'>Date</div>
                <div className='flexContainer width-100-percent bg-vdkGreen'>
                    <DatePicker
                        onChange={this.onDateChange}
                        value={getDate()} 
                        //value={getTodaysDate()} 
                        className='p-vw bg-green flex3Column r-vw m-vw'
                    /><br/>
                </div>
            </div>
    }
    
    render() {
        //console.log(`GET STATE LOG ${JSON.stringify(this.getStateLog(), null, 2)}`)
        return (
            <Dialog title={this.title} message={this.message}>
                <form onSubmit={this.handleSubmit}>
                    {this.dateEntry()}
                    {this.categories()}
                    <br/>
                    
                    <div className="mb-5">Additional Comments: </div>
                    <textarea rows="10" cols={window.innerWidth/15} value={this.state.log.Comments.notes} onChange={this.updateNotes} className="mt-10 greet p-10 r-10 brdr-green"/><br/><br/>
                    <Link
                        to="/LogDirectory"
                        onClick={() => this.handleSubmit()}>
                        <div onClick={this.handleSubmit} className="button m-1 greet p-20 r-10 bg-green brdr-green">
                            {this.buttonLabel}
                        </div>
                    </Link> 
                    <Link
                        to="/LogDirectory"
                        onClick={() => this.handleSave()}>
                        <div className="button m-1 greet p-20 r-10 bg-yellow brdr-yellow">
                            save
                        </div>
                    </Link>
                    <Link
                        to="/LogDirectory"
                        onClick={() => this.handleDelete()}>
                        <div  className="button m-1 greet p-20 r-10 bg-red brdr-red">
                            delete
                        </div>
                    </Link>
                    <PostDirectory />
                </form>
            </Dialog>
        );
    };
}

export default LogEntry;