const initializeData = (category, initData) => {
    const savedData = localStorage.getItem(category);
    const containsCharacter = (str, char) => {
        return str.includes(char);
    };
    if (!savedData) {
        return initData;
    } else if (containsCharacter(savedData, '[') || containsCharacter(savedData, '{')) {
        return JSON.parse(savedData);
    } else {
        return savedData;
    }
}
export default initializeData