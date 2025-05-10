export const currentTime = () => new Date().getTime();
export const currentDate = () => new Date().toLocaleString();
export const date = () => new Date();
export const day = () => currentDate().split('/')[1];
export const month = () => currentDate().split('/')[0];
export const year = () => currentDate().split('/')[2].split(',')[0];