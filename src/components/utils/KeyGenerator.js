import { v4 as uuidv4 } from 'uuid';

const getKey = () => {
    const key = uuidv4();
    //console.log(`key: ${key}`);
    return key;
}

export default getKey;