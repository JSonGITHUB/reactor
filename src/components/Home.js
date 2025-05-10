import React, { useState } from 'react';
import Timer from './utils/Timer';
import Geolocator from './location/Geolocator';
import NavItems from './site/NavItems';
import getKey from './utils/KeyGenerator';
import icons from './site/icons';

//import Menu from './site/Menu';

const Home = () => {

  const [longitude, setLongitude] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [distance, setDistance] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [markedLongitude, setMarkedLongitude] = useState(null);
  const [markedLatitude, setMarkedLatitude] = useState(null);
  //const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = NavItems.slice(1);

  const calculateDistance = () => {
    const lat1 = markedLatitude;
    const lat2 = latitude;
    const lon1 = markedLongitude;
    const lon2 = longitude;
    let unit = 'feet';
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
      if (unit === 'Kilometers') {
        dist = dist * 1.609344;
      }
      if (unit === 'Nautical') {
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
          <div className='color-neogreen p-20 bold bigHeader bg-dkGreen r-5 m-20'>
            {getDistance()}
          </div>
          <div
            title='stop tracking'
            className='size20 bold button p-20 r-5 m-20 bg-red incompletedSelector color-yellow'
            onClick={stopTracking}
          >
            Stop Tracking
          </div>
        </div>
      ) : (
        <div className='containerBox'>
          <div className='color-neogreen p-20 bold bigHeader bg-dkGreen r-5 m-20'>
            {distance}
          </div>
          <div
            title='start tracking'
            className='size20 bold button p-20 r-5 m-20 bg-neogreen completedSelector color-black'
            onClick={startDistance}
          >
            Start Tracking
          </div>
        </div>
      );

    return tracker;
  };
  const classes = 'containerBox button bg-lite w-150 height-100 ml-auto mr-10 mt-10 mb-10';

  const portraitButton = (label) => <div
    className='ml-auto pl-10 pr-10 mr-auto'
    title={`${label}`}
    key={getKey('homeLink')}
    onClick={() => window.location = `/reactor/${label}`}
  >
    <div key={getKey(label)} className={classes}>
      <div className='size30 m-10 mt-20'>
        {icons[String(label).toLowerCase()]}
      </div>
      <div className='color-yellow'>
        {label}
      </div>
    </div>
  </div>;

  return (
    <div className=''>
      <div className='containerBox size20 bold'>
        {
          /*Current position:
          <Geolocator
            currentPositionExists='false'
            returnCurrentPosition={updateCurrentLocation}
          />*/
        }
        <div className='containerBox bg-gren'>
          <Timer />
        </div>
      </div>
      {/*<Menu closeMenu={closeMenu} />*/}
      <div className='containerBoxNoPad waveBackground bg-dark width-100-20 mt-10'>
        <div className='containerFade'>
          <div className='menu-container containerBox'>
            {menuItems.map((item, index) => portraitButton(item))}
          </div>
        </div>
      </div>
      <div className='containerBox'>
        <div className='containerBox'>
          <div className='button p-20 bold size20 r-10 bg-dkGreen' onClick={() => window.location = 'https://jsongithub.github.io/portfolio/'}>
            portfolio
          </div>
        </div>
        {/*getTracker()*/}
      </div>
    </div>
  );
};

export default Home;
