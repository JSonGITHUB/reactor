import { useEffect, useState } from 'react';
import axios from 'axios';

const useOceanData = (component, uri) => {
    const [oceanData, setOceanData] = useState({});
    const getOceanData = async () => {
        const { data } = await axios.get(uri, {
            params: {
                origin: '*',
                format: 'json',
                mode:'cors'
            }
        });
        //console.log(`getOceanData => ${component}: \nuri: ${uri}\noceanData: ${JSON.stringify(data, null, 2)}`)
        setOceanData(data)
    };
    useEffect(() => {
        console.log(`OceanData =>`)
        let ignore = false;
        if (!ignore) {
            getOceanData();
        }
        return () => { ignore = true; }
    }, [uri]);
        
    return [ oceanData, getOceanData ];    
}
export default useOceanData;