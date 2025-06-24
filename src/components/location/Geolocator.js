import React, { useState, useEffect } from "react";
import Loader from "../site/Loader.js";
import GPSStatus from "../utils/GPS_Status.js";

const Geolocate = ({
  isMotionOn,
  returnCurrentPosition,
  currentPositionExists,
}) => {
  const [status, setStatus] = useState({
    paused: false,
    longitude: null,
    latitude: null,
    errorMessage: null,
    returnCurrentPosition: returnCurrentPosition,
    currentPositionExists: currentPositionExists,
  });

  useEffect(() => {
    const getCurrentPosition = () => {
      window.navigator.geolocation.getCurrentPosition(
        //position => console.log(position.coords.longitude),
        (position) => {
          if (!status.paused) {
            const { longitude, latitude } = position.coords;
            returnCurrentPosition(longitude, latitude);
            if ((Math.abs(status.longitude - longitude)>2) || (Math.abs(status.latitude - latitude)>(2))) {
              console.log(`getCurrentPosition => paused?: ${status.paused} coords ^^^^^^^^^^^ ${longitude}, ${latitude}`)
                setStatus(prevState => ({
                  ...prevState,
                  paused: true,//remove to continously check
                  longitude: longitude,
                  latitude: latitude,
                  errorMessage: null,
                  returnCurrentPosition: returnCurrentPosition,
                  currentPositionExists: currentPositionExists,
                }));
            }
          }
          /*
                    try {
                        //if (!currentPositionExists()) {
                            returnCurrentPosition(position.coords.longitude, position.coords.latitude);
                        //}
                    }catch(err) {
                    }
                    */
        },
        (err) => {
          console.log(err);
          setStatus({
            longitude: status.longitude,
            latitude: status.latitude,
            errorMessage: err.message,
            returnCurrentPosition: returnCurrentPosition,
            currentPositionExists: currentPositionExists,
          });
        }
      );
    };
    const tick = () => {
      getCurrentPosition();
    };
    const timerID = setInterval(() => tick(), 5000);
    return function cleanUp() {
      clearInterval(timerID);
    };
  }, [currentPositionExists, returnCurrentPosition, status]);

  const togglePause = () => {
    const newStatus = Array.isArray(status) ? [...status] : status;
    console.log(`togglePause1 => newStatus.paused: ${newStatus.paused} newStatus: ${JSON.stringify(newStatus,null,2)}`)
    newStatus.paused = !newStatus.paused;
    console.log(`togglePause2 => newStatus.paused: ${newStatus.paused} newStatus: ${JSON.stringify(newStatus,null,2)}`)
    setStatus(newStatus);
    console.log(`togglePause3 => status.paused: ${status.paused}`)
    returnCurrentPosition(status.longitude, status.latitude);
  }
  const getLocation = () => {
    const lat = status.latitude.toFixed(6);
    const long = status.longitude.toFixed(6);
    localStorage.setItem('longitude', long);
    localStorage.setItem('latitude', lat);
    return `${lat}, ${long} `;
  }
  const percent =
    window.innerWidth < 700
      ? "twentyfivePercent mt--70 mb--70"
      : "fiftyPercent mt--40 mb--40";
  const loading = () => (
  
    <div className='containerBox'>
      <GPSStatus />
    {/*<div className={percent}>
      <Loader isMotionOn={isMotionOn} />*/}
    
    </div>
  );
  // eslint-disable-next-line
  const latlon = () => status.latitude + "," + status.longitude;
  const { latitude, errorMessage } = status;
  const errorExists = errorMessage ? true : false;
  const latExists = latitude ? true : false;
  const errMessage = errorMessage;
  let geolocationStatus = latExists ? getLocation() : loading();
  geolocationStatus = errorExists ? `${errMessage}` : geolocationStatus;
  /*
    if (latExists) {
        if (!currentPositionExists()) {
            returnCurrentPosition(status.longitude, status.latitude);
        }
    }
    */
  return <div 
            title={`${(status.paused) ? 'resume gps' : 'pause gps'}`}
            className={`button r-10 bg-tinted p-20 width-100-pecent ${(status.paused)?'color-red':'color-yellow'} greet`} 
            onClick={() => togglePause()}
          >
            {geolocationStatus}
          </div>;
};

export default Geolocate;
