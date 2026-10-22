import React from 'react';
// import FunctionalSelector from '../forms/FunctionalSelector.js';
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
    const isLocation = (groupTitle === 'Location');
    const localLocations = !!initializeData('locations', false);
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

    // For interval selectors, show only numbers and label with 'seconds'
    const isInterval = item.description === 'Interval' && (groupTitle === 'Swell1' || groupTitle === 'Swell2' || groupTitle === 'Swell3');
    let displayItems = verifySpot();
    if (isInterval) {
        displayItems = displayItems.map(val => {
            // Extract number from 'N seconds' or just use number
            const match = String(val).match(/-?\d+/);
            return match ? Number(match[0]) : '';
        }).filter(v => v !== '');
    }

    return <div className='containerBox flexContainer bg-lite'>
        <div className='containerBox flex2Column'>{item.description}: </div>
        <div className='pr-10 flex2Column'>
            {isInterval ? (
                <label>
                    <select
                        value={Number(selected) || ''}
                        onChange={e => handleSelection(groupTitle, item.description, Number(e.target.value))}
                        className='containerDetail p-10 button width-100-percent color-soft bg-tintedMediumDark'
                        style={{ fontSize: 25, padding: '20px', width: '90%' }}
                    >
                        <option value=''>Select</option>
                        {displayItems.map((num, idx) => (
                            <option key={num + '-' + idx} value={num}>{num}</option>
                        ))}
                    </select>
                    <span style={{ marginLeft: 8 }}>seconds</span>
                </label>
            ) : (
                // fallback to original selector for non-interval
                // <FunctionalSelector ... />
                <select
                    value={selected || ''}
                    onChange={e => handleSelection(groupTitle, item.description, e.target.value)}
                    className='containerDetail p-10 button width-100-percent color-soft bg-tintedMediumDark'
                    style={{ fontSize: 25, padding: '20px', width: '90%' }}
                >
                    <option value=''>Select</option>
                    {displayItems.map((val, idx) => (
                        <option key={val + '-' + idx} value={val}>{val}</option>
                    ))}
                </select>
            )}
        </div>
    </div>;
}
export default Selector