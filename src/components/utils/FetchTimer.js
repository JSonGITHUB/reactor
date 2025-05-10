
const fetchTimer = (component, dataServer, getData) => {

    const timer = [];
    const getCurrentTime = () => Date.now();
    const setTime = () => timer.push(getCurrentTime());
    const getResponseTime = () => (timer[1] - timer[0]);
    const logResponseTime = () => console.log(`FetchTimer => Response time for ${component} Data:`, getResponseTime());

    (async function () {
        setTime();
        await getData(dataServer);
        setTime();
        logResponseTime();
        timer.length = 0;
      })();
}
export default fetchTimer;