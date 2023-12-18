const date = new Date().toLocaleString();
const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

export const newDate = () => `${months[Number(date.split(', ')[0].split('/')[0])-1]} ${date.split(', ')[0].split('/')[1]} ${date.split(', ')[0].split('/')[2]}`;