let timerStart = true;
let myVar = null;


const myTimer = (valueOfDate) => {
    const dateNow = (new Date()).valueOf();
    const diff = ((dateNow - valueOfDate)/1000).toFixed(0);
    postMessage(diff);
}

if (timerStart) {
    const valueOfDate = (new Date()).valueOf();
    console.log(`date of: ${valueOfDate}`)
    myVar = setInterval(function () { myTimer(valueOfDate) }, 100);
    timerStart = false;
}