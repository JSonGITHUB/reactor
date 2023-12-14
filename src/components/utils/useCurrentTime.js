import { useState } from 'react';

const currentTime = new Date();
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const getDaysInMonth = () => {
    const month = currentTime.getMonth()+1;
    const year = currentTime.getYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    return daysInMonth;
}
const getNextDay = (currentDate) => {
    currentDate = Number(currentDate)+1;
    if (currentDate >= getDaysInMonth()) {
        //console.log(`getNextDay =>\nnextDay: 01\nDaysInMont: ${getDaysInMonth()}`);
        return '01'
    }
    currentDate = (currentDate<10) ? `0${currentDate}` : currentDate;
    //console.log(`getNextDay =>\nnextDay: ${currentDate}\nDaysInMont: ${getDaysInMonth()}`);
    return currentDate;
    //((currentTime.getMonth()+1 === 2) &&)
}
const getNextMonth = (currentMonth) => {
    // eslint-disable-next-line
    let endOfMonth = false;
    if (currentTime.getDate() === getDaysInMonth()) {
        currentMonth = currentMonth + 1;
    }
    const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
    
    return month
    //((currentTime.getMonth()+1 === 2) &&)
}

const useCurrentTime = () => {

    let getCurrentTime = new Date();
    const year = getCurrentTime.getFullYear();
    const currentMonth = getCurrentTime.getMonth()+1;
    const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
    const monthLong = months[currentMonth-1];
    const monthNextLong = months[currentMonth];
    const currentDate = getCurrentTime.getDate();
    const date = (currentDate<10) ? `0${currentDate}` : currentDate;
    const currentHour = getCurrentTime.getHours();
    const hours = (currentHour<10) ? `0${(currentHour<0) ? 0 : currentHour}` : currentHour;
    const startHour = ((currentHour-7)<10) ? `0${((currentHour-7)<0)?0:(currentHour-7)}` : (currentHour-7);
    const currentMinutes = getCurrentTime.getMinutes();
    const minutes = (currentMinutes<10) ? `0${currentMinutes}` : currentMinutes;
    //const getEndTime = `${year}${month}${date}%20${hours}:${minutes}`;
    const getEndTime = `${year}${getNextMonth(currentMonth)}${getNextDay(currentDate)}%20${hours}:${minutes}`;
    const getStartTime = `${year}${month}${date}%20${startHour}:00`;
    getCurrentTime = `${year}${month}${date}%20${hours}:${minutes}`;
    //console.log(`useCurrentTime - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
    // eslint-disable-next-line
    const [startTime, setStartTime] = useState(getStartTime);
    // eslint-disable-next-line
    const [endTime, setEndTime] = useState(getEndTime);
    const currentTime = new Date();
/*
    https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?
    product=predictions&
    application=NOS.COOPS.TAC.WL&
    begin_date=20210330%2003:00&
      end_date=20210330%2010:33&
    datum=MLLW&
    station=9410230&
    time_zone=lst_ldt&
    units=english&
    interval=hilo&
    format=json
*/   
    const time = {   
        hours,
        minutes,
        date,
        month,
        monthLong,
        monthNextLong,
        year,
        currentTime,
        startTime,
        endTime
    }

    return [ time ]; 
            

}
export default useCurrentTime;