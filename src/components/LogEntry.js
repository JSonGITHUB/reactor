import React from 'react';
import Dialog from './functional/Dialog.js';
import Selector from './forms/FunctionalSelector.js';
import RadioSelector from './forms/FormRadio.js';
import DatePicker from 'react-date-picker';
import getKey from './utils/KeyGenerator.js';

class LogEntry extends React.Component {

    constructor(props) {
        super(props);
        this.selectorStatus = [];
        this.buttonLabel = props.buttonLabel;
        this.title = props.title;
        this.log = {
            Day: {},
            Location: {},
            Swell: {},
            Tide: {},
            Wind: {},
            Conditions: {},
            Comments: {}
        };
        this.message = props.message;
        this.state = {
            date: new Date(),
            items: props.items,
            log: {}
        };
        this.handleSelection = this.handleSelection.bind(this);
        this.updateNotes = this.updateNotes.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
    }
    handleSelection(groupTitle, label, selected) {
        if (typeof groupTitle === "string") {
            this.log[groupTitle][label] = selected;
            this.props.onChange(groupTitle, label, selected, true);
            this.setState({
                log: this.log
            });
        } 
    }
    updateNotes(event) {
        this.handleSelection("Comments", "notes", event.target.value);
    }
    
    handleSubmit(event) {
        const logExists = (this.state.log !== undefined && JSON.stringify(this.state.log, null, 2) !== "{}") ? true : false;
        const consoleStateLogData = () => console.log(`LogEntry.state.log: ${JSON.stringify(this.state.log, null, 2)}`);
        const consoleLogEntryData = () => console.log(`LogEntry.log: ${JSON.stringify(this.log, null, 2)}`)
        const logIt = () => (logExists) ? consoleStateLogData() : consoleLogEntryData();
        const selectorStatusComplete = (this.selectorStatus.includes(false)) ? window.confirm("Report is incomplete, submit anyway?") : true;
        if (selectorStatusComplete) {
            logIt();
        }
        event.preventDefault();
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

            const setSelectorStatus = ((item.selections.indexOf(this.log[groupTitle][item.description])) !== -1) ? this.selectorStatus.push(true) : this.selectorStatus.push(false);
            
            return <div className={this.selectorColor(item,groupTitle) + " radius-10 p-20 bg-green"}>
                <div className="mb-5">{item.description}: </div>
                <Selector 
                    groupTitle={groupTitle} 
                    selected={this.defaultSelection(item,groupTitle)} 
                    label={item.description} 
                    items={item.selections}
                    onChange={this.handleSelection}
                />
            </div>;
    }

    radio = (item, groupTitle) => <div className="radius-10 bg-green">
                {this.radioItems(item, groupTitle)}
            </div>;
    group = (item) => item.group;
    selectionInterface = (item, groupTitle) => (item.type === "radio") ? this.radio(item, groupTitle) : this.selector(item, groupTitle);

    groups = () => this.items().map((item) => {
        const headerClasses = 'subHeader color-yellow';
        const selectorClasses = "greet p-20 bg-vdk-green flex3Column";
        const groupClasses = "flexContainer radius-10";
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
            const stateLogDate = () => this.state.log.Day.Date;
            const getDate = () => (logExists) ? stateLogDate() : this.state.date;
            return <div>
                <div className='mb-5 subHeader color-yellow'>Date</div>
                <div className='flexContainer bg-vdk-green'>
                    <DatePicker
                        onChange={this.onDateChange}
                        value={getDate()} 
                        className='p-10 bg-green flex3Column radius-10 m-20'
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
                    <textarea rows="10" cols="75" value={this.state.entry} onChange={this.updateNotes} /><br/><br/>
                    <button onClick={this.handleSubmit}>
                        {this.buttonLabel}
                    </button>
                </form>
            </Dialog>
        );
    };
}

export default LogEntry;