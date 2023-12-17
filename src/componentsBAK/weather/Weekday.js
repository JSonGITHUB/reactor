const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
// eslint-disable-next-line
const getWeekdayIndex = (day) => weekdays.findIndex(weekDay => weekDay.includes(day));
//const Weekday = (day) => weekdays[getWeekdayIndex(day)];
const Weekday = (day) => day;

export default Weekday;