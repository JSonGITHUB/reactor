import { useEffect, useState } from 'react';
import useCurrentTime from '../utils/useCurrentTime';

const useOceanData = (component, uri, params, setRetry) => {
  const [status, setStatus] = useState({
    oceanData: {},
    updated: false,
  });
  const defaultParams = {
    origin: '*',
    format: 'json',
  }
  
  const handleParams = () => {
    if (params === '') {
      return defaultParams;
    }
    return params;
  }
  const date = useCurrentTime()[0].startTime.split('%')[0];
  const MAX_RETRIES = 3;
  let retryCount = 0;
    const getOceanData = async () => {
    try {
      const url = new URL(uri);
      const params = handleParams();
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      localStorage.setItem(`${component}Data`, JSON.stringify(data));
      localStorage.setItem(`${component}Date`, date);
      setStatus((prevState) => ({
        ...prevState,
        oceanData: data,
        update: true,
      }));
      setRetry('');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setRetry(retryCount);
        setTimeout(getOceanData, 10000); // Retry after 10 seconds
      } else {
        console.error('Max retry attempts reached. Unable to fetch data.');
        // Handle failure scenario or notify the user
      }
    }
  };
  useEffect(() => {
    //console.log(`OceanData => ${ component }`)
    let ignore = false;
    //console.log(`useOceanData => CHECK\nstatus.oceanData: ${JSON.stringify(status.oceanData,null,2)}\ndate: ${date}`)
    if (!ignore && JSON.stringify(status.oceanData) === '{}') {
      getOceanData();
    }
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    //console.log(`useOceanData => component: ${component}`);
    //console.log(`useOceanData => uri: ${uri}`);
    //console.log(`useOceanData => params: ${JSON.stringify(params,null,2)}`);
    //console.log(`useOceanData => status: ${JSON.stringify(status,null,2)}`);
  }, [status]);

  return [status.oceanData, getOceanData];
};
export default useOceanData;
