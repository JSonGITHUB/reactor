import { useState } from 'react';

const currentTime = new Date();
const getDaysInMonth = () => {
    const month = currentTime.getMonth()+1;
    const year = currentTime.getYear();
    return new Date(year, month, 0).getDate();
}
const getNextDay = (currentDate) => {
    currentDate = currentDate + 1;
    currentDate = (currentDate<10) ? `0${currentDate}` : currentDate;
    if (currentDate === getDaysInMonth()) {
        return '01'
    }
    //console.log(`getNextDay => ${currentDate}`);
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
    //console.log(`Air   - getStartTime: ${getStartTime} => getEndTime: ${getEndTime}`)
    // eslint-disable-next-line
    const [startTime, setStartTime] = useState(getStartTime);
    // eslint-disable-next-line
    const [endTime, setEndTime] = useState(getEndTime);
    const currentTime = new Date();
    const time = {   
        hours,
        minutes,
        date,
        month,
        year,
        currentTime,
        startTime,
        endTime
    }

    return [ time ]; 
            

}
export default useCurrentTime;