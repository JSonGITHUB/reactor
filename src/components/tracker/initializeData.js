const initializeData = (category, initData) => {
    const savedData = localStorage.getItem(category);
    const containsCharacter = (str, char) => {
        //console.log(`containsCharacter1 => str: ${str}`);
        return str.includes(char);
    };
    if (!savedData) {
        return initData;
    } else if (containsCharacter(savedData, '[') || containsCharacter(savedData, '{')) {
        return JSON.parse(savedData);
    } else {
        return initData;
    }
}
export default initializeData