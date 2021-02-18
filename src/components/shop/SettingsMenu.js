import React, { useState } from 'react';
import getKey from '../utils/KeyGenerator.js';

const SettingsMenu = ({ state, updateAisles, sortName, revert, save, restore, getTotal, setTax, clear }) => {

    const settings = [
        'Sort by Name',
        'Font Size',
        'Tax',
        'Save', 
        'Restore',
        'Export',
        'Clear', 
        'Undo'
    ];
    const initState = () => {
        const newState = state;
        newState.settings = settings;
        return newState;
    }

    const [status, setStatus] = useState(initState());

    const getSetting = (index) => {
        if (status.settings[index] === 'Clear') {
            clear();
        } else if (status.settings[index] === 'Sort by Name') {
            sortName();
            settings.splice(0, 1, 'Sort by Index');
        } else if (status.settings[index] === 'Sort by Index') {
            settings.splice(0, 1, 'Sort by Name');
            updateAisles();
        } else if (status.settings[index] === 'Tax') {
            let newTax = prompt('Enter sales tax', localStorage.getItem('tax'));
            localStorage.setItem('tax', newTax);
            setTax();
        } else if (status.settings[index] === 'Font Size') {
            const newFontSize = prompt('Enter font size', status.fontSize);
            localStorage.setItem('fontSize', newFontSize);
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
    const settingsMenu = <div id='settingsMenu' className='bg-dark'>
            {
                status.settings.map((item, index) => {
                    return (
                        <div 
                            key={getKey(status.settings[index])} 
                            className='settingsButton' 
                            onClick={() => getSetting(index)}
                        >
                            { status.settings[index] }
                        </div>  
                    )
                })
            }
        </div>
    
    if (state.displaySettings) {
        return settingsMenu
    }
    return <div></div>
}

export default SettingsMenu