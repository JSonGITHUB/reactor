import React from 'react';
import FunctionalSelector from '../forms/FunctionalSelector.js';

const getLocalSpots = () => {
    let uniqueSpots = [...new Set(getUnique(JSON.parse(localStorage.getItem('spots'))))];
    return uniqueSpots;
}
const getUnique = (array) => {
    let uniqueSpots = [...new Set(array)];
    return uniqueSpots;
}
const selectorColor = (item, groupTitle, selected) => (selected(item,groupTitle)) ? "completedSelector" : "incompletedSelector";
    
const Selector = (item, groupTitle, spot, defaultSelection, handleSelection, selected) => {
    //console.log(`Selector: \nitem: ${JSON.stringify(item, null,2)}\ngroupTitle: ${groupTitle}\nspot: ${spot}\ndefaultSelection: ${defaultSelection}\nhandleSelection: ${handleSelection}\nselected: ${selected}`)
    const isLocation = (groupTitle === 'Location') ? true : false;
    const localLocations = (localStorage.getItem('spots')) ? true : false;
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
    //console.log(`spot: ${spot} \n verifySpot(): ${verifySpot()} \nselected: ${defaultSelection(item,groupTitle)}`)
    
    return <div className={"r-vw p-vw"}>
        <div className="mb-5">{item.description}: </div>
        <div className="mb-5">
            <FunctionalSelector 
                groupTitle={groupTitle}  
                label={item.description} 
                items={verifySpot()}
                selected={defaultSelection(item,groupTitle)}
                onChange={handleSelection}
                fontSize='25'
                padding='20px'
                width='90%'
            />
        </div>
    </div>;
}
export default Selector