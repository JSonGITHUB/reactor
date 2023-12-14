const getKey = (label) => {
    const timeKey = Number(String(Date.now()).substring(7,13));
    const firstRandomKey = Math.random()*10;
    const secondRandomKey = Math.random()*10;
    const key = label+(timeKey + firstRandomKey + secondRandomKey).toFixed(3);
//    console.log(`key: ${key}`);
    return key            
}
export default getKey;  