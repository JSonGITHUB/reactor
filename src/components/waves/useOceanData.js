import { useEffect, useState } from "react";
import axios from "axios";
import useCurrentTime from "../utils/useCurrentTime.js";

const useOceanData = (component, uri) => {
  const [status, setStatus] = useState({
    oceanData: {},
    updated: false,
  });
  const date = useCurrentTime()[0].startTime.split("%")[0];
  const getOceanData = async () => {
    console.log(`getOceanData => SERVER: ${component}`);
    //console.log(`getOceanData => SERVER: ${component}\nuri: ${uri}`);
    const { data } = await axios.get(uri, {
      params: {
        origin: "*",
        format: "json",
        mode: "cors",
      },
    });
    //console.log(`getOceanData => SERVER: ${component}: \nstatus.updated: ${status.updated}\nuri: ${uri}\noceanData: ${JSON.stringify(data, null, 2)}`)
    //console.log(`getOceanData => data.data: ${JSON.stringify(data.data, null, 2)}`)
    //const lastElement = data.data[data.data.length-1];
    //console.log(`getOceanData => data.data[last]: ${JSON.stringify(lastElement)}`)
    //console.log(`getOceanData => data.data[last].v: ${lastElement.v}`)
    //console.log(`getOceanData => data.data[last].dr: ${lastElement.dr}`)
    //console.log(`getOceanData => data.data[last].t: ${lastElement.t}`)
    //console.log(`getOceanData => data.data[last].d: ${lastElement.d}`)
    //console.log(`getOceanData => data.data[last].g: ${lastElement.g}`)

    localStorage.setItem(`${component}Data`, JSON.stringify(data));
    localStorage.setItem(`${component}Date`, date);
    setStatus((prevState) => ({
      ...prevState,
      oceanData: data,
      update: true,
    }));
  };
  useEffect(() => {
    //console.log(`OceanData => ${ component }`)
    let ignore = false;
    //console.log(`useOceanData => CHECK\nstatus.oceanData: ${JSON.stringify(status.oceanData,null,2)}\ndate: ${date}`)
    if (!ignore && JSON.stringify(status.oceanData) === "{}") {
      getOceanData();
    }
    return () => {
      ignore = true;
    };
  }, []);

  return [status.oceanData, getOceanData];
};
export default useOceanData;


