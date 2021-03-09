import getNotes from './GetNotes.js';
import PostDirectory from './PostDirectory.js';
import getWaveHeight from './GetWaveHeight.js';
import getWindOrientation from './GetWindOrientation.js';
import getWindMPH from './GetWindMPH.js';
import getSurface from './GetSurface.js';
const createLog = (item, status) => {
    const posts = new PostDirectory();
    console.log(`SurfLocation => createLog`);
    localStorage.setItem('spot', item.name);
    const goToLog = () => window.location.pathname = `/reactor/SurfLog`;
    const generateNewLogId = () => {
        const date = new Date()
        const st = date.toDateString().replace(/ /g,'');
        const nd = date.toLocaleTimeString().replace(/ /g,'');
        localStorage.setItem('lastPostId', `${st}${nd}`);
        const newId = `${st}${nd}`;
        console.log(`LogId: generateNewLogId => status.logId: ${newId}`);
        return newId;
    }
    const recordId = generateNewLogId();
    let getCurrentTime = new Date();
    const year = getCurrentTime.getFullYear();
    const currentMonth = getCurrentTime.getMonth()+1;
    const month = ((currentMonth)<10) ? `0${(currentMonth)}` : currentMonth;
    const currentDate = getCurrentTime.getDate();
    const date = (currentDate<10) ? `0${currentDate}` : currentDate;
    const currentHour = getCurrentTime.getHours();
    const hours = (currentHour<10) ? `0${currentHour}` : currentHour;
    const startHour = ((currentHour-1)<10) ? `0${(currentHour-1)}` : (currentHour-1);
    const currentMinutes = getCurrentTime.getMinutes();
    const minutes = (currentMinutes<10) ? `0${currentMinutes}` : currentMinutes;
    // eslint-disable-next-line
    const getEndTime = `${year}${month}${date}%20${hours}:${minutes}`;
    // eslint-disable-next-line
    const getStartTime = `${year}${month}${date}%20${startHour}:00`;
    getCurrentTime = `${year}${month}${date}%20${hours}:${minutes}`;
    const getWaveSize = (height) => {
        height = height.split('.')[0];     
        height = (height.includes("FT")) ? height.replace("FT","ft") : height;
        height = (!height.includes("ft")) ? String(height+"ft") : height;
        return height;     
    }
    const logObj = {
        Day: {
            Date: `${year}-${month}-${date}T${hours}:${minutes}:00.000Z`,
            Day: date,
            Month: month,
            Year: year
        },
        Location: {
            Break: item.name
        },
        Surf: {
            Height: getWaveHeight(status.swell1Height),
            Report: getWaveSize(status.swell1Height),
            Shape: 'peaky'
        },
        Swell1: {
            Height: getWaveHeight(status.swell1Height),
            Direction: status.swell1Direction,
            Angle: status.swell1Angle,
            Interval: status.swell1Interval,
        },
        Swell2: {
            Height: getWaveHeight(status.swell2Height),
            Direction: status.swell2Direction,
            Angle: status.swell2Angle,
            Interval: status.swell2Interval,
        },
        Swell3: {
            Height: '1ft',
            Direction: 'NW',
            Angle: '180',
            Interval: '6 seconds',
        },
        Tide: {
            Phase: status.tide,
            Height: Number(status.height).toFixed(0)+'ft'
        },
        Wind: {
            Direction: status.windDirection,
            Orientation: getWindOrientation(status.windDirection),
            MPH: getWindMPH(status.windGusts),
            Surface: getSurface(status.windGusts)
        },
        Conditions: {
            Conditions: 'Good'
        },
        Comments: {
            'notes': getNotes()
        }
    }
    //return logObj;
    let postDirectory = posts.getDirectory();
    let post = '';
    const logIt = () => {
        postDirectory.push(recordId);
        postDirectory = JSON.stringify(postDirectory);
        console.log(`postDirectory: ${postDirectory}`)
        post = JSON.stringify(logObj, null, 2);
        console.log(`post: ${post}`)
        localStorage.setItem('logId', recordId)
        localStorage.setItem('spot', item.name)
        localStorage.setItem(recordId, post);
        //localStorage.setItem('postDirectory', postDirectory);
        posts.add(recordId);
    }   
    logIt();
    goToLog();
    /*
    this.setState({
        recordId: recordId,
        logged: true
    })
    */
};
export default createLog;