import {currentDate} from '../utils/CurrentCalendar';

const getCurrentTime = () => {
    return currentDate().split(', ')[1]
}
export default getCurrentTime;