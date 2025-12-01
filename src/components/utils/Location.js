import React, { useState, useEffect } from 'react';
import GPSStatus from './GPS_Status';

const Location = ({ 
  currentPositionExists, 
  returnCoordinates,
  icon 
}) => {

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [activeIcon, setActiveIcon] = useState(icon);
  const toggleGPS = () => setActiveIcon(prev => !prev);
  useEffect(() => {
    let isMounted = true; // Track if component is mounted
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (latitude === 33.0933809 && longitude === -116.6081653) {
            localStorage.setItem('latitude', 33.086703);
            localStorage.setItem('longitude', -117.312817);
            if (isMounted) { // Only set state if component is still mounted
              setLocation({ latitude: 33.086703, longitude: -117.312817 });
              returnCoordinates({ latitude: 33.086703, longitude: -117.312817 });
            }
          } else {
            localStorage.setItem('latitude', latitude);
            localStorage.setItem('longitude', longitude);
            if (isMounted) { // Only set state if component is still mounted
              setLocation({ latitude, longitude });
              returnCoordinates({ latitude, longitude });
            }
          }
          if (isMounted) { // Only set state if component is still mounted
            currentPositionExists();
          }
        },
        (error) => {
          console.error("Error obtaining location:", error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else {
      console.log("Geolocation not available");
    }
    return () => {
      isMounted = false; // Clean up on unmount
    };
  }, [returnCoordinates]);

  return (
    <div className='containerDetail p-20'>
      {location.latitude && location.longitude ? (
        (!activeIcon)
          ? <div title='gps signal' onClick={toggleGPS} className='containerDetail size15 color-yellow button'>
            <div className=''>{location.longitude},</div> <div className=''>{location.latitude}</div>
          </div>
        : <div title='gps signal' onClick={toggleGPS} className='size40 button'>🛰️</div>
      ) : (
          /*Obtaining GPS coordinates...*/
          <GPSStatus />
      )}
    </div>
  );
};

export default Location;