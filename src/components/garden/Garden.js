import React, { useState, useEffect } from 'react';
import GardenItem from './GardenItem';
import gardenData from './gardenData.json';
import feedingPlans from './feedingPlans';
import initializeData from '../utils/InitializeData';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getKey from '../utils/KeyGenerator';
import FeedingPlan from './FeedingPlan'

const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Garden = () => {

    const [crops, setCrops] = useState();
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [search, setSearch] = useState(localStorage.getItem('search') || '');
    const [selectedMonth, setSelectedMonth] = useState(localStorage.getItem('selectedMonth') || '');
    const [selectedSoil, setSelectedSoil] = useState(localStorage.getItem('selectedSoil') || '');
    const [selectedFertilizer, setSelectedFertilizer] = useState(localStorage.getItem('selectedFertilizer') || '');
    const [selectedSun, setSelectedSun] = useState(localStorage.getItem('selectedSun') || null);
    const [sortOrder, setSortOrder] = useState(localStorage.getItem('sortOrder') || 'asc');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [modalData, setModalData] = useState(null);
    const [soils, setSoils] = useState();
    const [suns, setSuns] = useState();
    const [sun, setSun] = useState(initializeData('sun', null));
    const [fertilizers, setFertilizers] = useState();
    const [collapsed, setCollapsed] = useState(false);
    const [fertilizerCollapse, setFertilizerCollapse] = useState(true);
    const [feedingCollapse, setFeedingCollapse] = useState(true);
    const [planted, setPlanted] = useState(initializeData('planted', false));
    const [currentFertilizers, setCurrentFertilizers] = useState();
    const fertilized = [];

    useEffect(() => {
        localStorage.setItem('planted', planted);
    }, [planted]);
    useEffect(() => {
        localStorage.setItem('sun', sun);
    }, [sun]);
    useEffect(() => {
        fertilized.length = 0;
        if (currentFertilizers) {
            currentFertilizers.forEach((fertilizer) => {
                fertilized.push(false);
            });
        }
    }, [currentFertilizers]);
    // Save user settings to local storage
    useEffect(() => {
        localStorage.setItem('search', search);
        localStorage.setItem('selectedMonth', selectedMonth);
        localStorage.setItem('selectedSoil', selectedSoil);
        localStorage.setItem('selectedFertilizer', selectedFertilizer);
        localStorage.setItem('sortOrder', sortOrder);
        localStorage.setItem('darkMode', darkMode);
    }, [search, selectedMonth, selectedSoil, selectedFertilizer, sortOrder, darkMode]);
    useEffect(() => {
        if (crops) {
            //console.log(`Garden => crops: ${JSON.stringify(crops, null, 2)}`);
            localStorage.setItem('gardenData', JSON.stringify(crops));
            const newSoils = [];
            const newFertilizers = [];
            const newSuns = [];
            const removeDuplicates = (array) => [...new Set(array)];
            crops.forEach((crop) => {
                const subsoils = crop.soil.split(', ');
                newSuns.push(crop.sun_exposure);
                subsoils.forEach((soil) => {
                    const cleanSoil = String(soil).toLocaleLowerCase().replace(' soil', '').replace(' loam', '');
                    newSoils.push(cleanSoil);
                });
                const subAndfertilizer = crop.fertilizer.split(' and ');
                subAndfertilizer.forEach((fertilizer) => {
                    const fertilizerArray = crop.fertilizer.split(' or ');
                    fertilizerArray.forEach((fertilizer) => {
                        newFertilizers.push(fertilizer);
                    });
                });
                /* 
                subOrfertilizer.forEach((fertilizer) => {
                    const cleanFertilizer = String(fertilizer).toLocaleLowerCase().replace(' fertilizer', '');
                    newFertilizers.push(cleanFertilizer);
                 });
                 */
            });
            setSoils(removeDuplicates(newSoils));
            setSuns(removeDuplicates(newSuns));
            //setFertilizers(removeDuplicates(newFertilizers));
            const extractFertilizers = (data) => {
                const fertilizersSet = new Set(); // Use a Set to avoid duplicates

                data.forEach((plant) => {
                    if (plant.fertilizer) {
                        const ingredients = plant.fertilizer
                            .split(/ and | or /) // Split on 'and' or 'or'
                            .map((item) => item.trim()); // Remove extra spaces

                        ingredients.forEach((ingredient) => fertilizersSet.add(ingredient.toLocaleLowerCase().replace(' fertilizer', ''))); // Add unique fertilizers
                    }
                });

                return Array.from(fertilizersSet); // Convert Set to array
            };
            setFertilizers(extractFertilizers(crops));
            setCurrentFertilizers(extractFertilizers(filteredVegetables));

            /* crops.forEach((crop) => {
                if (crop.planted) alert(`${crop.name} planted!`)
            }); */
        }

    }, [crops]);
    useEffect(() => {
        const initGardenData = initializeData('gardenData', gardenData);
        const indexedGardenData = initGardenData.map((crop, index) => ({
            ...crop,
            index,
            planted: !!crop.planted
        }));
        //console.log(`Garden => indexedGardenData: ${JSON.stringify(indexedGardenData, null, 2)}`);
        localStorage.setItem('gardenData', JSON.stringify(indexedGardenData));
        setCrops(indexedGardenData);
        const sunValue = initializeData('sun', null);
        console.log(`local sun: ${sunValue}`)
        setSun(sunValue === 'null' ? null : sunValue);
    }, []);
    const plantingStatus = ['true', 'false', 'null'];
    const filteredVegetables = (!crops)
        ? null
        : crops.filter(item => {
            //console.log(`Garden => filteredVegetables => item: ${JSON.stringify(item, null, 2)} crops: ${JSON.stringify(crops, null, 2)}`);
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            //console.log(`Garden => ${item.name} matchesSearch: ${matchesSearch}`)
            const matchesMonth = selectedMonth ? item.months.includes(selectedMonth) : true;
            //console.log(`Garden => ${item.name} matchesMonth: ${matchesMonth}`)
            const soilArray = item.soil.toLowerCase().split(', ');
            const matchesSoil = (selectedSoil === '') ? true : soilArray.includes(selectedSoil.toLowerCase());
            //console.log(`Garden => ${item.name} matchesSoil: ${matchesSoil} - '${selectedSoil.toLowerCase()}'`)
            const matchesPlanted = (planted === null || planted === 'null' || String(item.planted) === String(planted)) ? true : false;
            //console.log(`Garden => ${item.name} planted: ${planted} ?? item: ${item.planted} matchesPlanted: ${matchesPlanted}`)
            const fertilizerArray = item.fertilizer.toLowerCase().split(', ');
            //const matchingSun = (selectedSun) ? 'Full sun' : 'Partial shade';
            const matchesSun = (!sun || sun === item.sun_exposure) ? true : false;
            //console.log(`Garden => ${item.name} sun: ${sun} ?? item: ${item.sun_exposure} matchesPlanted: ${matchesSun}`)
            const matchesFertilizer = item.fertilizer.toLowerCase().includes(selectedFertilizer.toLowerCase());
            //console.log(`Garden => ${item.name} matchesFertilizer: ${matchesFertilizer}`)
            //console.log(`Garden => name: ${item.name} planted: ${item.planted} matchesSoil: ${matchesSoil} selectedSoil: ${selectedSoil} soilArray: ${JSON.stringify(soilArray, null, 2)}`);
            return matchesSun && matchesSearch && matchesMonth && matchesPlanted && (matchesSoil || selectedSoil === '') && (matchesFertilizer || selectedFertilizer === '');
        })
            .sort((a, b) => sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

    const getFertilizerCheckBox = (fertilizer, index) => <input
        id={`${fertilizer}`}
        name={`${fertilizer}`}
        className='regular-checkbox button glassy ml-5 mr-10'
        checked={fertilized[index]}
        type='checkbox'
        onChange={() => { fertilized[index] = !fertilized[index] }}
    />
    return (
        <div className={`containerBox`}>
            <div className={`containerBox color-yellow bold bg-lite`}>
                <CollapseToggleButton
                    title='Fertilizers'
                    isCollapsed={fertilizerCollapse}
                    setCollapse={setFertilizerCollapse}
                    align='left'
                />
            </div>
            {
                (fertilizerCollapse)
                ? null
                : <div className='containerBox'>
                    {
                        (!currentFertilizers)
                        ? null
                        : currentFertilizers.map((item, index) => <div className='containerBox color-neogreen columnLeftAlign button'>
                                {getFertilizerCheckBox(item, index)} {item}
                            </div>
                        )
                    }
                </div>
            }
            <div className={`containerBox color-yellow bold bg-lite`}>
                <CollapseToggleButton
                    title='Feeding Plan'
                    isCollapsed={feedingCollapse}
                    setCollapse={setFeedingCollapse}
                    align='left'
                />
            </div>
            {
                (feedingCollapse)
                ? null
                : <div className='containerBox'>
                    {
                        feedingPlans?.map((plan, index) => (
                            <FeedingPlan 
                                key={getKey(index)} 
                                plan={plan} 
                                index={index} 
                            />
                        ))
                    }
                </div>

            }
            {/* Controls */}
            <div className={`containerBox color-yellow bold bg-lite`}>
                <CollapseToggleButton
                    title='Apply Filters'
                    isCollapsed={collapsed}
                    setCollapse={setCollapsed}
                    align='left'
                />
                {
                    (collapsed)
                        ? null
                        : <div className='containerBox flex gap-4'>
                            <input
                                type='text'
                                placeholder='🔍 Search vegetable...'
                                className='containerBox'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <select
                                className='containerBox'
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                            >
                                <option value=''>📅 Month</option>
                                {monthsList.map(month => (
                                    <option key={month} value={month}>📅 {month}</option>
                                ))}
                            </select>
                            <select
                                className='containerBox'
                                value={selectedSoil}
                                onChange={e => setSelectedSoil(e.target.value)}
                            >
                                <option value=''>🪴 Soil</option>
                                {soils && (soils.map(soil => (
                                    <option key={soil} value={soil}>🪴 {soil}</option>
                                )))}
                            </select>
                            <select
                                className='containerBox'
                                value={selectedFertilizer}
                                onChange={e => setSelectedFertilizer(e.target.value)}
                            >
                                <option value=''>🪴 Fertilizer</option>
                                {fertilizers && (fertilizers.map(fertilizer => (
                                    <option key={fertilizer} value={fertilizer}>🪴 {fertilizer}</option>
                                )))}
                            </select>
                            <button
                                className='containerBox'
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {sortOrder === 'asc' ? '🔼 A-Z' : '🔽 Z-A'}
                            </button>
                            <select
                                className='containerBox'
                                value={sun||'All Sun'}
                                onChange={e => setSun(e.target.value)}
                            >
                                <option value=''>🌞 All Sun</option>
                                {
                                    (!suns)
                                        ? null
                                        : suns.map(sun => {
                                            return <option key={sun} value={sun}>
                                                🌞 {sun}
                                            </option>
                                        }
                                        )}
                            </select>
                            <select
                                className='containerBox'
                                value={planted}
                                onChange={e => setPlanted((e.target.value === 'true') ? true : (e.target.value === 'false') ? false : null)}
                            >
                                <option value=''>Planted</option>
                                {
                                    plantingStatus.map(status => {
                                        const label = (status === 'true') ? 'planted' : (status === 'false') ? 'not planted' : 'all';
                                        return <option key={status} value={status}>
                                            🌱 {label}
                                        </option>
                                    }
                                    )}
                            </select>
                        </div>
                }
            </div>

            {/* Display Filtered Data */}
            <div className='containerBox space-y-2'>
                {filteredVegetables && filteredVegetables.length > 0 ? (
                    filteredVegetables.map((item, index) => (
                        <React.Fragment key={getKey(item.name + index)}>
                            <GardenItem
                                index={index}
                                item={item}
                                setModalData={setModalData}
                                crops={crops}
                                setCrops={setCrops}
                            />
                        </React.Fragment>
                    ))
                ) : (
                    <p className='text-gray-600 dark:text-gray-300'>No vegetables found matching the criteria.</p>
                )}
            </div>

            {/* Modal 
            {modalData && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
                    <div className='bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md'>
                        <h2 className='text-xl font-bold text-green-800 dark:text-green-300'>{modalData.name}</h2>
                        <img src={modalData.image} alt={modalData.name} className='w-full mt-2 rounded-lg' />
                        <button className='mt-4 p-2 bg-red-500 text-white rounded-lg' onClick={() => setModalData(null)}>Close</button>
                    </div>
                </div>
            )}
                */}
        </div>
    );
};

export default Garden;