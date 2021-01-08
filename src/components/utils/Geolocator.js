import React, {useState, useEffect} from 'react';
import Loader from '../utils/Loader.js';

const Geolocate = ({ isMotionOn, returnCurrentPosition, currentPositionExists }) => {

    const [status, setStatus] = useState({
            longitude: null,
            latitude: null,
            errorMessage: null,
            returnCurrentPosition: returnCurrentPosition,
            currentPositionExists: currentPositionExists
        })

    const getCurrentPosition = () => {
        window.navigator.geolocation.getCurrentPosition(
            //position => console.log(position.coords.longitude),
           position => {
                const { longitude, latitude } = position.coords;
                returnCurrentPosition(longitude, latitude);
                //console.log(`getCurrentPosition => coords ^^^^^^^^^^^ ${longitude}, ${latitude}`)
                setStatus({
                    longitude: longitude,
                    latitude: latitude,
                    errorMessage: null,
                    returnCurrentPosition: returnCurrentPosition,
                    currentPositionExists: currentPositionExists
                });
                /*
                try {
                    //if (!currentPositionExists()) {
                        returnCurrentPosition(position.coords.longitude, position.coords.latitude);
                    //}
                }catch(err) {
                }
                */
            },
            err => {
                console.log(err)
                setStatus({
                    longitude: status.longitude,
                    latitude: status.latitude,
                    errorMessage: err.message,
                    returnCurrentPosition: returnCurrentPosition,
                    currentPositionExists: currentPositionExists
                });

            }
        )
    }
    const tick = () => {
        getCurrentPosition();
    }
    useEffect(() => {     		
        const timerID = setInterval(
            () => tick(),
            5000
        );
        return function cleanUp () {
            clearInterval(timerID);
        }
    },[]);
    const getLocation = () => `${status.latitude.toFixed(6)}, ${status.longitude.toFixed(6)} `;
    const percent = (window.innerWidth < 700) ? 'twentyfivePercent mt--70 mb--70' : 'fiftyPercent mt--40 mb--40';
    const loading = () => <div className={percent}>
                <Loader isMotionOn={isMotionOn}/>
            </div>;
    const latlon = () => status.latitude + "," + status.longitude;
    const { latitude, errorMessage } = status;
    const errorExists = (errorMessage) ? true : false;
    const latExists = (latitude) ? true : false;
    const errMessage = errorMessage;
    let geolocationStatus = (latExists) ? getLocation() : loading();
    geolocationStatus = (errorExists) ? `${errMessage}` : geolocationStatus;
    /*
    if (latExists) {
        if (!currentPositionExists()) {
            returnCurrentPosition(status.longitude, status.latitude);
        }
    }
    */
    return <div className="color-yellow greet">{geolocationStatus}</div>
}

export default Geolocate;