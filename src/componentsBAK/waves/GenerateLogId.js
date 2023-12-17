const generateNewLogId = () => {
    const date = new Date()
    const st = date.toDateString().replace(/ /g,"");
    const nd = date.toLocaleTimeString().replace(/ /g,"");
    localStorage.setItem("lastPostId", `${st}${nd}`);
    const newId = `${st}${nd}`;
    localStorage.setItem("logId", newId);
    console.log(`LogId: generateNewLogId => status.logId: ${newId}`);
    return newId;
}
export default generateNewLogId;