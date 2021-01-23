import React from 'react';
import Selector from '../forms/FunctionalSelector.js';

const getLocalSpots = () => {
    let uniqueSpots = [...new Set(getUnique(JSON.parse(localStorage.getItem('spots'))))];
    return uniqueSpots;
}
const getUnique = (array) => {
    let uniqueSpots = [...new Set(array)];
    return uniqueSpots;
}
const selectorColor = (item, groupTitle, selected) => (selected(item,groupTitle)) ? "completedSelector" : "incompletedSelector";
    
const selector = (item, groupTitle, spot, defaultSelection, handleSelection, selected) => {
    //console.log(`selector: \nitem: ${JSON.stringify(item, null,2)}\ngroupTitle: ${groupTitle}\nspot: ${spot}\ndefaultSelection: ${defaultSelection}\nhandleSelection: ${handleSelection}\nselected: ${selected}`)
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
    
    return <div className={selectorColor(item, groupTitle, selected) + " r-vw p-vw bg-green"}>
        <div className="mb-5">{item.description}: </div>
        <div className="mb-5">
            <Selector 
                groupTitle={groupTitle}  
                label={item.description} 
                items={verifySpot()}
                selected={defaultSelection(item,groupTitle)}
                onChange={handleSelection}
            />
        </div>
    </div>;
}
export default selector