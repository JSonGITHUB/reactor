import { useEffect, useState } from "react";
import axios from "axios";
import useCurrentTime from "./useCurrentTime.js";

const useOceanData = (component, uri) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const date = useCurrentTime()[0].startTime.split("%")[0];
  const getOceanData = useCallback(async () => {
    const { data } = await axios.get(uri, {
      params: {
        origin: "*",
        format: "json",
        mode: "cors",
      },
    });
    localStorage.setItem(`${component}Data`, JSON.stringify(data));
    localStorage.setItem(`${component}Date`, date);
    setStatus((prevState) => ({
      ...prevState,
      oceanData: data,
      update: true,
    }));
  }, [component, date, uri]);
  useEffect(() => {
    const storedData = localStorage.getItem(`${component}Data`);
    const storedDate = localStorage.getItem(`${component}Date`);

    if (storedData && storedDate && date === storedDate) {
      dispatch({ type: "FETCH_SUCCESS", payload: JSON.parse(storedData) });
    } else {
      getOceanData();
    }
  }, [component, date]);

  return [state.data, getOceanData, state.error];
};

const initialState = {
  data: {},
  error: null,
  isLoading: true,
};
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return { data: action.payload, error: null, isLoading: false };
    case "FETCH_ERROR":
      return { data: {}, error: action.payload, isLoading: false };
    default:
      return state;
  }
};
export default useOceanData;