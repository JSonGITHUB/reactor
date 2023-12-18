let timerStart = true;
let myVar = null;

const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};
const myTimer = (valueOfDate) => {
    const dateNow = (new Date()).valueOf();
    const diff = ((dateNow - valueOfDate)/1000).toFixed(0);
    let hours = Math.floor(diff / 1000 / 60 / 60);
    let minutes = Math.floor(diff / 1000 / 60);
    let seconds = Math.floor(diff / 1000) - minutes * 60;
    myVar = null;
    minutes = minutes.toString();
    if (minutes.length == 1) {
        minutes = "0" + minutes;
    }
    seconds = seconds.toString();
    if (seconds.length == 1) {
        seconds = "0" + seconds;
    }
    //postMessage(minutes + ":" + seconds);
    postMessage(formatTime(diff));
}

if (timerStart) {
    const valueOfDate = (new Date()).valueOf();
    console.log(`date of: ${valueOfDate}`)
    myVar = setInterval(function () { myTimer(valueOfDate) }, 100);
    timerStart = false;
}