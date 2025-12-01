const initializeData = (category, initData) => {
    const savedData = localStorage.getItem(category);
    const containsCharacter = (str, char) => {
        //console.log(`containsCharacter1 => str: ${str}`);
        return str.includes(char);
    };
    if (!savedData) {
        console.log(`initializeData => 1 - ${category} => savedData: ${savedData}`);
        return initData;
    } else if (containsCharacter(savedData, '[') || containsCharacter(savedData, '{')) {
        console.log(`initializeData => 2 - ${category} => savedData: ${savedData}`);
        return JSON.parse(savedData);
    } else {
        console.log(`initializeData => 3 - ${category} => savedData: ${savedData}`);
        return savedData;
    }
}
export default initializeData