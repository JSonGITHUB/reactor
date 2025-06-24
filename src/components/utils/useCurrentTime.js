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
        return '01'
    }
    currentDate = (currentDate<10) ? `0${currentDate}` : currentDate;
    return currentDate;
}
const getNextMonth = (currentMonth) => {
    // eslint-disable-next-line
    let endOfMonth = false;
    if (currentTime.getDate() === getDaysInMonth()) {
        currentMonth = currentMonth + 1;
    }
    const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
    return month
}

const useCurrentTime = () => {
    const getCurrentTime = new Date();

    // Extract year, month, date, hours, and minutes
    const year = getCurrentTime.getFullYear();
    const currentMonth = getCurrentTime.getMonth() + 1;
    const month = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
    const monthLong = months[currentMonth - 1];
    const monthNextLong = months[(currentMonth % 12)]; // Handles December to January transition
    const currentDate = getCurrentTime.getDate();
    const date = currentDate < 10 ? `0${currentDate}` : currentDate;
    const currentHour = getCurrentTime.getHours();
    const hours = currentHour < 10 ? `0${currentHour}` : currentHour;
    const currentMinutes = getCurrentTime.getMinutes();
    const minutes = currentMinutes < 10 ? `0${currentMinutes}` : currentMinutes;

    // Calculate startTime by subtracting 7 hours
    const startTimeObj = new Date(getCurrentTime.getTime());
    startTimeObj.setHours(startTimeObj.getHours() - 7);
    const startHour = startTimeObj.getHours();
    const startDate = startTimeObj.getDate();
    const startMonth = startTimeObj.getMonth() + 1;
    const formattedStartHour = startHour < 10 ? `0${startHour}` : startHour;
    const formattedStartDate = startDate < 10 ? `0${startDate}` : startDate;
    const formattedStartMonth = startMonth < 10 ? `0${startMonth}` : startMonth;

    const getStartTime = `${year}${formattedStartMonth}${formattedStartDate}%20${formattedStartHour}:00`;

    // Calculate endTime by adding 1 day to the current date
    const endTimeObj = new Date(getCurrentTime.getTime());
    endTimeObj.setDate(endTimeObj.getDate() + 1); // Adding 1 day to the current date for endTime
    const endYear = endTimeObj.getFullYear();
    const endMonth = endTimeObj.getMonth() + 1;
    const endDate = endTimeObj.getDate();
    //console.log(`useCurrentTime => endDate: ${endDate}`);
    const endHour = endTimeObj.getHours();
    const formattedEndMonth = endMonth < 10 ? `0${endMonth}` : endMonth;
    const formattedEndDate = endDate < 10 ? `0${endDate}` : endDate;
    const formattedEndHour = endHour < 10 ? `0${endHour}` : endHour;

    const getEndTime = `${endYear}${formattedEndMonth}${formattedEndDate}%20${formattedEndHour}:${minutes}`;

    // Tide start and end time calculation
    const getTideStartTime = `${year}${month}${date}%2004:00`;
    const getTideEndTime = `${year}${month}${date}%2021:00`;

    // Set up state
    const [startTime, setStartTime] = useState(getStartTime);
    const [tideStartTime, setTideStartTime] = useState(getTideStartTime);
    const [endTime, setEndTime] = useState(getEndTime);
    const [tideEndTime, setTideEndTime] = useState(getTideEndTime);
    const currentTime = new Date();

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
        endTime,
        tideStartTime,
        tideEndTime
    };

    return [time];
}

export default useCurrentTime;