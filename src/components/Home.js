import React, { useState } from "react";
import Timer from "./utils/Timer.js";
import Geolocator from "./utils/Geolocator.js";

const Home = () => {
  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [distance, setDistance] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [markedLongitude, setMarkedLongitude] = useState(null);
  const [markedLatitude, setMarkedLatitude] = useState(null);

  const calculateDistance = () => {
    const lat1 = markedLatitude;
    const lat2 = latitude;
    const lon1 = markedLongitude;
    const lon2 = longitude;
    let unit = "feet";
    console.log(
      `lat1: ${lat1} === lat2: ${lat2}) && (lon1: ${lon1} === lon2: ${lon2}`
    );
    if ((lat1 === lat2 && lon1 === lon2) || !lat1 || !lat2 || !lon1 || !lon2) {
      return 0;
    } else if (tracking === true) {
      const radlat1 = (Math.PI * lat1) / 180;
      const radlat2 = (Math.PI * lat2) / 180;
      const theta = lon1 - lon2;
      const radtheta = (Math.PI * theta) / 180;
      const feetOrYards = (dist) =>
        dist * 5280 > 30
          ? `${(dist * 1760).toFixed(2)} yards`
          : `${(dist * 5280).toFixed(2)} feet`;
      let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist < 0.25 ? feetOrYards(dist) : `${dist.toFixed(2)} miles`;
      if (unit === "Kilometers") {
        dist = dist * 1.609344;
      }
      if (unit === "Nautical") {
        dist = dist * 0.8684;
      }
      console.log(`DISTANCE => ${dist}`);
      return dist;
    }
    return distance;
  };
  const updateCurrentLocation = (longitude, latitude) => {
    console.log(
      `UPDATING CURRENT POSITION ======> longitude: ${longitude} latitude: ${latitude}`
    );
    setLongitude(longitude);
    setLatitude(latitude);
    setDistance(calculateDistance());
  };
  const startDistance = () => {
    setTracking(true);
    setMarkedLatitude(latitude);
    setMarkedLongitude(longitude);
  };
  const stopTracking = () => {
    setTracking(false);
  };
  const getDistance = () => distance;
  const getTracker = () => {
    const tracker =
      tracking === true ? (
        <div className='containerBox'>
          <div className="color-neogreen p-20 bold bigHeader bg-dkGreen r-5 m-20">
            {getDistance()}
          </div>
          <div
            className="size20 bold button p-20 r-5 m-20 bg-red incompletedSelector color-yellow"
            onClick={stopTracking}
          >
            Stop Tracking
          </div>
        </div>
      ) : (
        <div className='containerBox'>
          <div className="color-neogreen p-20 bold bigHeader bg-dkGreen r-5 m-20">
            {distance}
          </div>
          <div
            className="size20 bold button p-20 r-5 m-20 bg-neogreen completedSelector color-black"
            onClick={startDistance}
          >
            Start Tracking
          </div>
        </div>
      );

    return tracker;
  };

  return (<div>
            <div className="containerBox color-lite">
              <div className="containerBox">
                <div className='button p-20 bold size20 r-10 bg-dkGreen' onClick={()=>window.location="https://jsongithub.github.io/portfolio/"}>
                    portfolio
                </div>
              </div>
              <div className="containerBox">
                <Timer />
              </div>
              <div className='containerBox'>
                <div className='p-10 size20 bold'>
                  Current position:
                </div>
                <Geolocator
                  currentPositionExists="false"
                  returnCurrentPosition={updateCurrentLocation}
                />
              </div>
              {getTracker()}
            </div>
          </div>
  );
};

export default Home;
