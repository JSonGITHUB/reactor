import { currentTime } from '../utils/CurrentCalendar.js';

const initTask = (logDescription, sessions) => {
    return {
        startTime: currentTime(),
        endTime: '',
        description: logDescription,
        sessions: sessions,
        isRunning: true,
        runningTime: '0s'
    }
};

export default initTask;