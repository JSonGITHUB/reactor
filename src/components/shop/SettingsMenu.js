import React, { useState, useEffect } from 'react';
import getKey from '../utils/KeyGenerator.js';
import initializeData from '../utils/InitializeData';
import Selector from '../forms/FunctionalSelector';

const SettingsMenu = ({ 

    state, 
    aisles,
    setAisles,
    updateAisles, 
    sortName, 
    revert, 
    save, 
    restore, 
    getTotal, 
    setTax, 
    clear,
    setShopFilter,
    shopFilter,
    category,
    setCategory,
    itemMenuDefault,
    aislesInit,
    updateCategory,
    deleteList,
    changeList,
    emptyCart,
    deselectList,
    selectList

}) => {

    const filter = (!shopFilter) ? 'Hide Filter' : 'Filter';
    const settings = [
        filter,
        'Sort by Name',
        'Font Size',
        'Tax',
        //'Save', 
        //'Restore',
        'Export',
        //'Clear' 
        //'Undo'
        'Delete Current List',
        'Apply Category',
        'Empty Cart',
        'Select List',
        'Deselect List'
    ];
    const initState = () => {
        const newState = state;
        newState.settings = settings;
        return newState;
    }

    const [status, setStatus] = useState(initState());

    useEffect(() => {
        console.log(`aislessss: ${JSON.stringify(aisles, null, 2)}`);
    }, []);
    useEffect(() => {
        console.log(`aislessss: ${JSON.stringify(aisles, null, 2)}`);
    }, [aisles]);

    const getSetting = (index) => {
        if (status.settings[index] === 'Clear') {
            clear();
        } else if (status.settings[index] === 'Sort by Name') {
            sortName();
            settings.splice(1, 1, 'Sort by Index');
        } else if (status.settings[index] === 'Sort by Index') {
            settings.splice(1, 1, 'Sort by Name');
            updateAisles();
        } else if (status.settings[index] === 'Filter') {
            settings.splice(0, 1, 'Hide Filter');
            setShopFilter(true);
        } else if (status.settings[index] === 'Hide Filter') {
            settings.splice(0, 1, 'Filter');
            setShopFilter(false);
        } else if (status.settings[index] === 'Tax') {
            let newTax = prompt('Enter sales tax', initializeData('tax', null));
            localStorage.setItem('tax', newTax);
            setTax();
        } else if (status.settings[index] === 'Font Size') {
            const newFontSize = prompt('Enter font size', status.fontSize);
            localStorage.setItem('fontSize', newFontSize);
        } else if (status.settings[index] === 'Delete Current List') {
            deleteList();
        } else if (status.settings[index] === 'Apply Category') {
            changeList();
        } else if (status.settings[index] === 'Empty Cart') {
            emptyCart();
        } else if (status.settings[index] === 'Select List') {
            selectList();
        } else if (status.settings[index] === 'Deselect List') {
            deselectList();
        } else if (status.settings[index] === 'Undo') {
            revert();
        } else if (status.settings[index] === 'Save') {
            save();
        } else if (status.settings[index] === 'Restore') {
            restore();
        } else if (status.settings[index] === 'Export') {
            console.log(JSON.stringify(status.todos));
        }
        state.displaySettings = !state.displaySettings
        setStatus(prevState => ({
            ...prevState,
            settings: settings,
            displaySettings: state.displaySettings
        }));
    };
    const getCategories = () => {
        //aisles.filter((_, index) => ![2, 3, 4].includes(index));
        if (aisles) {
            const newCategories = [ ...aisles];
            if (newCategories[0] !== 'all') {
                const categories = ['all', ...aisles];
                console.log(`categories: ${JSON.stringify(categories, null, 2)}`);
                return categories;
            }
            console.log(`newCategories: ${JSON.stringify(newCategories, null, 2)}`);
            return newCategories;
        }
        const savedCategories = initializeData('aisles', aislesInit);
        if (savedCategories[0] !== 'all') {
            //const newSavedCategories = savedCategories.unshift('all')
            const newSavedCategories = ['all', ...savedCategories];
            console.log(`newSavedCategories: ${JSON.stringify(newSavedCategories, null, 2)}`);
            return newSavedCategories;
        }
        console.log(`savedCategories: ${JSON.stringify(savedCategories, null, 2)}`);
        return savedCategories;

        /*         
        if (itemMenuDefault.concat(aisles)) {
            return itemMenuDefault.concat(aisles).slice(5);
        }
        return itemMenuDefault.concat(aislesInit).slice(5); 
        */
    }
    /* 
    const getCategories = () => { 
        if (itemMenuDefault.concat(aisles)) {
            return itemMenuDefault.concat(aisles).slice(5);
        }
        return itemMenuDefault.concat(aislesInit).slice(5);
    } 
    */
    const settingsMenu = <div id='settingsMenu' className='bg-dark'>
            {
                (state.displaySettings) 
                ? status.settings.map((item, index) => {
                    return (
                        <div 
                            title={status.settings[index]}
                            key={getKey(status.settings[index])} 
                            className='settingsButton' 
                            onClick={() => getSetting(index)}
                        >
                            { status.settings[index] }
                        </div>  
                    )
                })
                : null
            }
            {!!shopFilter && (
                <div className='containerBox pr-20'>
                    <Selector
                        groupTitle='Category'
                        selected={category}
                        label={category}
                        items={getCategories()}
                        onChange={updateCategory}
                        padding='5px'
                        fontSize='15'
                    />
                </div>
            )}
        </div>
    
    return settingsMenu
}

export default SettingsMenu