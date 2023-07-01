import React, { useEffect, useState } from 'react';

import useCurrentTime from './useCurrentTime.js';

const SlideShow = () => {
    const [ time ] = useCurrentTime();
    const times = [0, 6, 12, 18];
    const getHourIndex = (hour) => {
        const sortedTimes = times.sort((a, b) => a - b);
        let hourIndex = sortedTimes.findIndex((time) => time > hour+1);
        if (hourIndex === -1) hourIndex = sortedTimes.length;
        
        return hourIndex-1;
    };
    const getDaysInMonth = () => {
        const year = time.year;
        const month = time.month + 1; // Adding 1 because months are zero-based
        const firstDayOfNextMonth = new Date(year, month, 1);
        const lastDayOfCurrentMonth = new Date(firstDayOfNextMonth - 1);
        return lastDayOfCurrentMonth.getDate();
    };
    const getDaysInLastMonth = () => {
        const year = time.year;
        const month = time.month-1; // Adding 1 because months are zero-based
        const firstDayOfLastMonth = new Date(year, month, 1);
        const lastDayOfLastMonth = new Date(firstDayOfLastMonth - 1);
        return lastDayOfLastMonth.getDate();
    };
                                
    console.log(`SlideShow => time.hours: ${time.hours} \nmonth long: ${time.monthLong} \nmonth: ${time.month} \nday: ${time.date} \ndays this month: ${getDaysInMonth()} \ndays last month: ${getDaysInLastMonth()}`);
    const images = [];
    for (let x=1;x<=90;x++) {
        if (x<31) {
            images.push({ "image": "http://slcharts01.cdn-surfline.com/charts/socal/local/socal_large_"+x+".png" });
        } else if (x < 61) {
            images.push({ "image": "http://slcharts01.cdn-surfline.com/charts/nbaja/puntabaja/nearshore/puntabaja_large_"+(x-30)+".png" });
        } else {
            images.push({ "image": "http://slcharts01.cdn-surfline.com/charts/sbaja/local/sbaja_large_"+(x-60)+".png" });
        }
    };
    const [status, setStatus] = useState({
        nextMonthStatus: false,
        day: time.date,
        month: time.month,
        hourIndex: getHourIndex(time.hours),
        monthLong: time.monthLong,
        slideShow: true,
        index: 0,
        images: images,
        url1: images[0].image,
        url2: images[30].image,
        url3: images[60].image
    });
    useEffect(() => {
       const getImage = () => {
            //console.log(`status.index: ${status.index} slideShow: ${status.slideShow}`)
            if (status.slideShow) {
                const i = (status.index === 29) ? 1 : status.index+1; 
                const isBack = () => ((i === status.index+1) || (status.index === 29)) ? false : true;        
                const indexMinusOne = () => (status.hourIndex - 1);
                const indexPlusOne = () => (status.hourIndex + 1); 
                const goBackIndex = () => ((indexMinusOne() > 0) ? indexMinusOne() : 3);
                const goFowardIndex = () => ((indexPlusOne() <= 3) ? indexPlusOne() : 0)
                const goBackDay = () => ((status.day === 1) ? getDaysInLastMonth() : status.day-1);
                const getHourIndex = () => (isBack()) ? goBackIndex() : goFowardIndex();
                //console.log(`getImage => imgArray[${i}].image: ${status.images[i].image}`)
                console.log(`(status.day: ${status.day} === getDaysInMonth(): ${getDaysInMonth()})`)
                let thisDay = (getHourIndex() > status.hourIndex) ? status.day : ((isBack()) ? goBackDay() : ((status.day === getDaysInMonth()) ? 1 : status.day+1));
                thisDay = (i === 1) ? ((time.hours >= 18) ? (time.date+1) : time.date) : thisDay;
                const nextMonthStatus = ((i>1) && ((status.nextMonthStatus && ((thisDay === (status.day+1))||(thisDay === 1)||(thisDay === status.day))) || (!status.nextMonthStatus && (thisDay === 1)))) ? true : false;
                //((status.nextMonthStatus && (thisDay === (status.day+1))) || (!status.nextMonthStatus && (thisDay === 1))) ? true : false,
        
                console.log(`thisDay: ${thisDay}`)
                setStatus(prevState => ({
                    ...prevState,
                    day: thisDay,
                    nextMonthStatus: nextMonthStatus,
                    month: (!status.nextMonthStatus && (status.day > getDaysInMonth())) ? `0${Number(status.month)+1}` : status.month,
                    monthLong: time.monthLong,
                    //monthLong: (status.day === getDaysInMonth()) ? time.monthNextLong : time.monthLong,
                    monthNextLong: time.monthNextLong,
                    hourIndex: getHourIndex(),
                    index: i,
                    url1: status.images[i].image,
                    url2: status.images[i+30].image,
                    url3: status.images[i+60].image
                }))
            }
        }   		
        const timerID = setInterval(
            () => getImage(),
            700
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    },[status]);
    const toggleSlideShow = (e) => {
        e.persist();
        const position = () => e.clientX;
        const width = () => window.innerWidth;
        const back = () => width()/3;
        const halfway = () => width()/2;
        const next = () => width() - back();
        const getDirection = () => (position() > next()) ? 'next' : 'back';
        const isNext = () => (position() > next()) ? true : false;
        const isBack = () => (position() < back()) ? true : false;
        const isCenter = () => ((position() > back()) && (position() < next())) ? true : false;
        console.log(`$click\nwidth: ${width()}\nhalfway: ${halfway()}\nxpos: ${position()}\ndirection: ${getDirection()}\nback: ${back()}\nnext: ${next()}`)
        const updateStatus = () => ((isNext() || isBack()) && !isCenter() ) ? false : !status.slideShow;
        const getIndex = () => (isBack()) ? (status.index - 1) : (status.index + 1);
        const i = (getIndex() === 30) ? 1 : (getIndex() === 0) ? 29 : getIndex();
        const previousIndex = () => (status.hourIndex - 1);
        const nextIndex = () => (status.hourIndex + 1);
        const isPreviousIndexGreaterThanOne = () => (previousIndex > 0);
        let getHourIndex = () => (isBack()) ? (isPreviousIndexGreaterThanOne() ? previousIndex : 3) : ((nextIndex() <= 3) ? nextIndex() : 0);
        const goBackDay = () => ((status.day === 1) ? getDaysInLastMonth() : status.day-1);
        const isHourIndexGreater = () => (getHourIndex() > status.hourIndex);
        const addDay = () => ((status.day === getDaysInMonth()) ? 1 : status.day+1);
        let thisDay = isHourIndexGreater() ? status.day : ((isBack()) ? goBackDay() : addDay());
        //let thisDay = (getHourIndex() > status.hourIndex) ? status.day : ((isBack()) ? goBackDay() : ((status.day === getDaysInMonth()) ? 1 : status.day+1));
        thisDay = (i === 1) ? ((time.hours >= 18) ? (time.date+1) : time.date) : thisDay;
        const nextMonthStatus = ((i>1) && ((status.nextMonthStatus && ((thisDay === (status.day+1))||(thisDay === 1)||(thisDay === status.day))) || (!status.nextMonthStatus && (thisDay === 1)))) ? true : false;
        //console.log(`getImage => imgArray[${i}].image: ${status.images[i].image}`)
        setStatus(prevState => ({
            ...prevState,
            index: i,
            hourIndex: getHourIndex(),
            slideShow: updateStatus(),
            nextMonth: ((i>1) && (status.day === getDaysInMonth())) ? true : false,
            monthLong: (nextMonthStatus) ? time.monthNextLong : time.monthLong,
            monthNextLong: time.monthNextLong,
            nextMonthStatus: nextMonthStatus,
            day: thisDay,
            month: (!status.nextMonthStatus && (status.day > getDaysInMonth())) ? `0${Number(status.month)+1}` : status.month,
            url1: status.images[i].image,
            url2: status.images[i+30].image,
            url3: status.images[i+60].image
        }))
    }
    const displayHour = Number(times[Number(status.hourIndex)]);
    const displayDebug = () => <div className="color-dark p-20 bold bigHeader bg-dkGreen r-5 m-20 glassy">{time.hours} -- {times[Number(status.hourIndex)]}Z{status.day}{String(status.monthLong).substring(0,3).toUpperCase()}{time.year}</div>
    const displayDayDebug = () => <div className="mt-100 color-dark p-20 bold bigHeader bg-dkGreen r-5 m-20 glassy">{status.index} - {String(status.nextMonthStatus)} - {String(status.monthLong).substring(0,3).toUpperCase()} {status.day} {(displayHour > 12) ? (displayHour-12) : displayHour}:00{(displayHour >= 12) ? 'PM' : 'AM'}</div>    
    const displayDay = () => <div className="mt-100 color-dark p-20 bold bigHeader bg-dkGreen r-5 m-20 glassy">
                                <div className="p-5">{String(status.monthLong).substring(0,3).toUpperCase()} {status.day}</div>
                                <div className="p-5">{(displayHour > 12) ? (displayHour-12) : displayHour}:00{(displayHour >= 12) ? 'PM' : 'AM'}</div>
                            </div>    
    return (
        <div className='mt--30'>
            <div className='fixed lt-0 top-100'>            
                {displayDay()}
            </div>
            <img id="slideshow1" className="width-100-percent" src={status.url1} onClick={(e) => toggleSlideShow(e)} alt="California Sur Swell" />
            <br/>
            <img id="slideshow1" className="width-100-percent" src={status.url2} onClick={(e) => toggleSlideShow(e)} alt="Baja Norte Swell" />
            <br/>
            <img id="slideshow1" className="width-100-percent" src={status.url3} onClick={(e) => toggleSlideShow(e)} alt="Baja Sur Swell" />
        </div>
    )
}

export default SlideShow;