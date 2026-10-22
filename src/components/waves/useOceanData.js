import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import useCurrentTime from '../utils/useCurrentTime';

const useOceanData = (component, uri, params, setRetry) => {
  const [status, setStatus] = useState({
    oceanData: {},
    updated: false,
  });
  const defaultParams = useMemo(() => ({
    origin: '*',
    format: 'json',
  }), []);
  const handleParams = useCallback(() => {
    if (params === '') {
      return defaultParams;
    }
    return params;
  }, [params, defaultParams]);
  const currentTime = useCurrentTime();
  const date = useMemo(() => currentTime[0].startTime.split('%')[0], [currentTime]);
  const MAX_RETRIES = 3;
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const loggedFallbackRef = useRef(false);

  const getOceanData = useCallback(async (signal) => {
    try {
      const url = new URL(uri);
      const params = handleParams();
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
      const response = await fetch(url, {
        method: 'GET',
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (!mountedRef.current) {
        return;
      }
  
      localStorage.setItem(`${component}Data`, JSON.stringify(data));
      localStorage.setItem(`${component}Date`, date);
      setStatus((prevState) => ({
        ...prevState,
        oceanData: data,
        update: true,
      }));
      setRetry('');
    } catch (error) {
      if (error?.name === 'AbortError' || !mountedRef.current) {
        return;
      }

      const cachedRaw = localStorage.getItem(`${component}Data`);
      if (cachedRaw) {
        try {
          const cachedData = JSON.parse(cachedRaw);
          if (mountedRef.current) {
            setStatus((prevState) => ({
              ...prevState,
              oceanData: cachedData,
              update: true,
            }));
            setRetry('');
          }
          if (!loggedFallbackRef.current) {
            loggedFallbackRef.current = true;
            console.warn(`Using cached ${component} data due to fetch issue.`);
          }
          return;
        } catch (parseError) {
          // ignore parse failure and continue retry logic
        }
      }

      if (!loggedFallbackRef.current) {
        loggedFallbackRef.current = true;
        console.warn(`Failed to fetch ${component} data, retrying...`, error);
      }
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setRetry(retryCountRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          getOceanData();
        }, 10000);
      } else {
        if (!loggedFallbackRef.current) {
          console.warn('Max retry attempts reached. Unable to fetch data.');
        }
      }
    }
  }, [component, date, handleParams, uri, setRetry]);
  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    if (JSON.stringify(status.oceanData) === '{}') {
      getOceanData(controller.signal);
    }

    return () => {
      mountedRef.current = false;
      controller.abort();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [getOceanData, status.oceanData]);

  return [status.oceanData, getOceanData];
};
export default useOceanData;
