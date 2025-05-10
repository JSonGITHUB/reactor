import React, { createContext, useEffect, useState, useContext } from 'react';
import initializeData from '../utils/InitializeData';
import validate from '../utils/validate';
import { getSurfSpots, clearLocalData } from '../waves/SurfSpots';

export const WavesContext = createContext();

const WavesParent = ({
    children,
    targetElementRef
}) => {

    const [locations, setLocations] = useState(JSON.parse(localStorage.getItem('locations')));
    const [currentWave, setCurrentWave] = useState();
    const [edit, setEdit] = useState(false);

    //console.log(`WavesContext => locations: ${JSON.stringify(locations, null, 2)}`);

    useEffect(() => {
        if (locations && (locations !== undefined)) {
            //console.log(`WavesContext => locations: ${JSON.stringify(locations, null, 2)}`);
            localStorage.setItem('locations', JSON.stringify(locations));  
        }
    }, [locations]);
    useEffect(() => {
        //console.log(`WavesContext => currentWave: ${currentWave}`);
        if (currentWave !== undefined) {
            //console.log(`WavesContext => currentWave: ${currentWave}`);
            localStorage.setItem('currentWave', currentWave);
        }
    }, [currentWave]);
    useEffect(() => {
        const initLocations = initializeData('locations', getSurfSpots());
        //console.log(`WavesContext => initLocations: ${JSON.stringify(initLocations, null, 2)}`);
        setLocations(initLocations);
        setCurrentWave(localStorage.getItem('currentWave'));
    }, []);

    const handleResetLocations = () => {
        setLocations(clearLocalData());
        handleEditToggle();
        window.location = `/reactor/Waves`;
    }
    const handleEditToggle = () => {
        const edit = (initializeData('edit', 'false') === 'true') ? false : true;
        localStorage.setItem('edit', edit);
        setEdit(edit);
    }
    const updateLocations = (locations) => {
        //console.log(`updateLocations1 => ${JSON.stringify(locations, null, 2)}`);
        //console.log(`updateLocations2 => ${initializeData('locations', null)}`);
        setEdit(!edit);
        setLocations(locations);
    }; 

    return (

        <WavesContext.Provider
            value={{
                locations,
                setLocations,
                currentWave,
                setCurrentWave,
                handleResetLocations,
                handleEditToggle,
                updateLocations,
                edit,
                setEdit,
                targetElementRef
            }}>
            {
                (validate(locations) !== null)
                ? children
                : <div>WHOOOPSIE!</div>
            }
        </WavesContext.Provider>
    );

};
export const useWave = () => useContext(WavesContext);

export default WavesParent;