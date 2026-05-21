import { useState, useEffect } from 'react';
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
    selectList,
    onShowShoppingHistory

}) => {

    const filter = (!shopFilter) ? 'Hide Filter' : 'Filter';
    const settings = [
        filter,
        'Sort by Name',
        'Font Size',
        'Tax',
        'Report',
        'Shopping History',
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
    }, [aisles]);

    // Add report display state
    const [showReport, setShowReport] = useState(false);

    const getSetting = (index) => {
        if (status.settings[index] === 'Report') {
            setShowReport(true);
            return;
        } else if (status.settings[index] === 'Shopping History') {
            if (typeof onShowShoppingHistory === 'function') {
                onShowShoppingHistory();
            }
            return;
        } else if (status.settings[index] === 'Clear') {
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
        // Add 'Items Left' and 'In Cart' to the categories list
        let categories = [];
        if (aisles) {
            categories = ['all', 'Items Left', 'In Cart', ...aisles];
        } else {
            const savedCategories = initializeData('aisles', aislesInit);
            categories = ['all', 'Items Left', 'In Cart', ...savedCategories];
        }
        return categories;
    }
    /* 
    const getCategories = () => { 
        if (itemMenuDefault.concat(aisles)) {
            return itemMenuDefault.concat(aisles).slice(5);
        }
        return itemMenuDefault.concat(aislesInit).slice(5);
    } 
    */
   const closeReport = () => {
       setShowReport(false);
       const newState = {...state};
       newState.displaySettings = false;
       setStatus(prevState => ({
           ...prevState,
           displaySettings: newState.displaySettings
       }))
    }
    // --- REPORT INTERFACE ---
    let reportContent = null;
    if (showReport) {
        // Lazy load the report component
        const Report = require('./ShopReport').default;
        reportContent = <Report onClose={() => closeReport()} />;
    }

    const settingsMenu = <div id='shopSettingsMenu' className='containerDetail bg-tintedDark'>
            {
                (state.displaySettings) 
                ? <>
                    {
                        (showReport)
                        ? reportContent
                        : null
                    }
                    {
                        (showReport)
                        ? null
                        : status.settings.map((item, index) => (
                                <div 
                                    title={status.settings[index]}
                                    key={getKey(status.settings[index])} 
                                    className='containerDetail p-15 button size20 m-5 color-yellow bg-lite' 
                                    onClick={() => getSetting(index)}
                                >
                                    { status.settings[index] }
                                </div>  
                            ))
                    }
                  </>
                : null
            }
            {!!shopFilter && (
                <div className='containerBox pr-20'>
                    <Selector
                        groupTitle='Category'
                        selected={category}
                        label={category}
                        items={getCategories()}
                        onChange={(groupTitle, id, selected) => {
                            if (selected === 'Items Left' || selected === 'In Cart') {
                                // Set a special category value for 'Items Left' or 'In Cart'
                                setCategory(selected);
                            } else {
                                updateCategory(groupTitle, id, selected);
                            }
                        }}
                        padding='5px'
                        fontSize='15'
                    />
                </div>
            )}
        </div>
    
    return settingsMenu
}

export default SettingsMenu