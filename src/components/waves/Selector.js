import React from 'react';
import FunctionalSelector from '../forms/FunctionalSelector.js';
import getKey from '../utils/KeyGenerator.js';
import getSurfSpots from './SurfSpots.js';
import initializeData from '../utils/InitializeData';

const getLocalSpots = () => {
    const spotNames = () => getSurfSpots().map((spot,index) => spot.name)
    let uniqueSpots = [...new Set(getUnique(spotNames ()))];
    return uniqueSpots;
}
const getUnique = (array) => {
    let uniqueSpots = [...new Set(array)];
    return uniqueSpots;
}    
const Selector = (item, groupTitle, spot, defaultSelection, handleSelection, selected) => {
    const isLocation = (groupTitle === 'Location') ? true : false;
    const localLocations = (initializeData('locations', false)) 
                            ? true 
                            : false;
    let items = item.selections;
    const setLocal = () => (isLocation && !localLocations) ? localStorage.setItem('spots', JSON.stringify(items)) : null;
    setLocal();
    items = (isLocation && localLocations) ? getLocalSpots() : getUnique(items);
    item.selections = items;
    const addSpot = () => {
        items.push(spot);
        items = getUnique(items);
        localStorage.setItem('spots', JSON.stringify(items))
        return items;
    }
    const verifySpot = () => {
        return (isLocation && !item.selections.includes(spot)) ? addSpot() : items;
    }
    
    return <div key={getKey('selectorContainer')} className='containerBox'>
        <div className='containerBox'>{item.description}: </div>
        <div className='pr-10'>
            <FunctionalSelector 
                groupTitle={groupTitle}  
                label={item.description} 
                items={verifySpot()}
                //selected={defaultSelection(item,groupTitle)}
                selected={selected}
                onChange={handleSelection}
                fontSize='25'
                padding='20px'
                width='90%'
            />
        </div>
    </div>;
}
export default Selector