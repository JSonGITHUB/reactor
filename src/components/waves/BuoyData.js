import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BuoyData = () => {

  const fetch = require('node-fetch');  // If you're running this in Node.js
  const [swellHeight, setSwellHeight] = useState(null);
  const [data, setData] = useState(null);
  const buoyId = '46224';  // Buoy ID for Oceanside, California

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3002/buoy');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  function countSpaces(str) {
    let count = 0;
  
    for (let i = 0; i < str.length; i++) {
      if (str[i] === ' ') {
        count++;
      }
    }
  
    return count;
  }
  
  useEffect(() => {
    if (typeof(data) == 'string') {
      const recordsHeader = data.split('2023')[0];
      const firstRecord = data.split('2023')[1];
      const firstRecordArray = firstRecord.split(' ');
      const waveHeight = firstRecord;
      const keys = typeof(data);
      const spaces = countSpaces(waveHeight);
      console.log(`DATA[1]: ${waveHeight}`);
      console.log(`DATA Keys: ${keys}`);
      console.log(`DATA header: ${recordsHeader}`)
      console.log(`DATA record: ${firstRecord}`)
      console.log(`DATA FirstRecord Array: ${firstRecordArray}`)
    }
  
  }, [data]);

  return (
    <div>
      {data ? (
        <div>
          <h1>Data from API:</h1>
          <pre>{
            //JSON.stringify(data, null, 2)
            JSON.stringify(data).split('2023')[1]
          }</pre>
        </div>
      ) : (
        <div>Loading data...</div>
      )}
    </div>
  );


};

export default BuoyData;