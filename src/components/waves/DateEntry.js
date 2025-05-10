import React, { useState } from 'react';
import DatePicker from 'react-date-picker';
import validate from '../utils/validate';

const dateEntry = (state, handleSelection) => {
    const {log, date} = state;
    //const logExists = (log !== undefined && log !== null && JSON.stringify(log, null, 2) !== "{}") ? true : false;
    const logExists = (validate(log) !== null && JSON.stringify(log) !== "{}") ? true : false;
    const stateLogDate = () => log.Day.Date;
    const getDate = () => (logExists === true) ? new Date(stateLogDate()) : new Date(date);
    const onDateChange = (date) => {
        const pickerDate = date;
        date = String(date);
        const day = pickerDate.getDate();
        const month = pickerDate.getMonth()+1;
        const year = pickerDate.getFullYear();
        handleSelection("Day", "Date", pickerDate);
        handleSelection("Day", "Day", day);
        handleSelection("Day", "Month", month);
        handleSelection("Day", "Year", year);
    }
    return <React.Fragment>
                <div className='mb-5 subHeader color-yellow'>Date</div>
                <div className='flexContainer width-100-percent bg-vdkGreen'>
                    <DatePicker
                        onChange={onDateChange}
                        value={getDate()} 
                        className='p-vw bg-green flex3Column r-vw m-vw'
                    /><br/>
                </div>
            </React.Fragment>
}
export default dateEntry;