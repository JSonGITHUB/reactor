const getTotalTime = (totalTimeMilliseconds) => {
    let hours = Math.floor(totalTimeMilliseconds / 3600000);
    if (hours.toString() !== 'NaN') {
        hours = (hours < 10) ? `0${hours}` : hours;
        let minutes = Math.floor((totalTimeMilliseconds % 3600000) / 60000);
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        let seconds = Math.floor((totalTimeMilliseconds % 60000) / 1000);
        seconds = (seconds < 10) ? `0${seconds}` : seconds;
        const totalTime = `${hours}:${minutes}:${seconds}`;
        //const totalTime = `${hours}:${minutes}`;
        return totalTime
    }
    return '00:00'
}
export default getTotalTime;