import getTotalTime from '../utils/getTotalTime.js';

const initSession = (
        startDate, 
        startTime, 
        endDate, 
        endTime, 
        runningTime,
        reason,
        breakTime
    ) => {
        const totalTimeMilliseconds = Math.round(endTime - startTime);
        let newRunningTime = runningTime;
        newRunningTime = (runningTime === '0s') 
            ? totalTimeMilliseconds 
            : (runningTime + totalTimeMilliseconds);

        const totalTime = getTotalTime(totalTimeMilliseconds);
        const runningTimeDisplay = getTotalTime(newRunningTime);
        return ({
                    'description': 'Description',
                    'startDate': startDate,
                    'startTime': startTime,
                    'reason': reason,
                    'breakTime': breakTime,
                    'subTasks': [{
                        'startDate': startDate,
                        'startTime': startTime,
                        'endDate': endDate,
                        'endTime': endTime,
                        'reason': reason
                    }],
                    'endDate': endDate,
                    'endTime': endTime,
                    'totalTime': totalTime,
                    'runningTime': newRunningTime,
                    'runningTimeDisplay': runningTimeDisplay
                })
};
export default initSession;