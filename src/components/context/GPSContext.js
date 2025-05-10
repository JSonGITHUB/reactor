import React, { createContext, useEffect, useState, useContext } from 'react';

import validate from '../utils/validate';
import initializeData from '../utils/InitializeData';
export const GPSContext = createContext();

const GPSParent = ({
    children,
    targetElementRef
}) => {

    const [latitude, setLatitude] = useState();
    const [longitude, setLongitude] = useState();

    useEffect(() => {
        setLatitude(localStorage.getItem('latitude'));
        setLongitude(localStorage.getItem('longitude'));
    }, []);

    return (

        <GPSContext.Provider value={{
            latitude,
            longitude,
            setLatitude,
            setLongitude,
            targetElementRef
        }}>
            {
                (validate(longitude) !== null && validate(latitude) !== null)
                ? children
                : <div>
                    WHOOOPSIE! {`longitude: ${longitude} latitude: ${latitude}`}
                </div>
            }
        </GPSContext.Provider>
    );
};
export const useGPS = () => useContext(GPSContext);

export default GPSParent;