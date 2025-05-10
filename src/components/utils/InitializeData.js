const initializeData = (key, initData) => {

    //console.log(`key: ${key}`)

    const getData = () => {
        const storedData = localStorage.getItem(key);
        if (!storedData) {
            return initData;
        }
        if (storedData === '[]' || storedData === 'undefined') {
            return initData;
        }
        const containsCharacter = (str, char) => {
            //console.log(`containsCharacter1 => str: ${str}`);
            return str.includes(char);
        };
        if (containsCharacter(storedData, '[') || containsCharacter(storedData, '{')) {
            //console.log(`containsCharacter2 => str: ${storedData}`);
            try {
                return JSON.parse(storedData);
            } catch (error) {
                console.error(`${storedData} \nError parsing localStorage data for key "${key}":`, error);
                return storedData;
            }
        }
        return storedData
        
    }
    return getData()
}
export default initializeData;