import React, { useState, useEffect } from 'react';
//import ReactDOM from 'react-dom';
   
const Timer = () => {
    const timeItIs = ["shaka time!!!", "get a wave brah!", "keep froth alive..."];
    // eslint-disable-next-line
    const logos = [1,2,3];
    let x = 0;
    let interval = 0;
    let timeItIsNow = timeItIs[x];
    const stackIndex = 0;
    // eslint-disable-next-line
    const logoStacker = (value, index, array) => {
        //console.log(`index: ${index} array: ${array} value: ${value}`);
        let newId = value+stackIndex;
        newId = (newId > array.length) ? 1 : newId;
        //console.log(`logo${value} => z${newId}`)
        const logoClasses = "logo"+value+" z"+newId+" absolute logo height200 ml--100";
        document.getElementById('logo'+value).className = logoClasses;
    }
    const [date, setDate] = useState(new Date());
    const tick = () => {
        console.log(`Tick`);
        setDate(new Date());
    }
    useEffect(() => {     		
        const timerID = setInterval(
            () => tick(),
            1000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    },[]);
    interval = (interval === 3) ? 0 : (interval+1);
    x = (x === (timeItIs.length-1) && (interval === 0)) ? 0 : ((interval === 0) ? (x+1) : x);
    timeItIsNow = timeItIs[x];
    const localDate = date.toLocaleTimeString();
    const time = localDate.replace(" ","").toLocaleLowerCase();
    return (
        <div className="time p-20">
            <div className='color-red'>
                do you know what time it is?
            </div>
            <br/>
            <b>{time}</b>
            <br/>
            <br/>
            <div className='color-green'>
                <b>{ timeItIsNow }</b>
            </div>
        </div>
    )
}
export default Timer;
/*
ReactDOM.render(
    <Timer />,
    document.getElementById('time')
);


let initTimer = () => {
    ReactDOM.render(
        <Timer date={ new Date() } />,
        document.getElementById('time')
    )
}
setTimeout(initTimer, 1000);
*/