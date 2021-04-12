import React, { useState } from 'react';
import Selector from '../forms/FunctionalSelector.js';

const TemperatureInput = ({ scale, value, onValueChange, onUnitChange }) => {
    
    // eslint-disable-next-line
    const scaleNames = {
        c: 'Celsius',
        f: 'Fahrenheit',
        g: 'Gallons',
        l: 'Liters', 
        p: 'Pesos', 
        d: 'Dollars',
        m: 'Miles',
        k: 'Klometers'
    };
    const units = [
        'Celsius',
        'Fahrenheit',
        'Gallons',
        'Liters', 
        'Pesos', 
        'Dollars',
        'Miles',
        'Klometers'
    ];

    const [ unit, setUnit ] = useState(scale);
    // eslint-disable-next-line
    const [ unitValue, setUnitValue ] = useState(value);

    const handleChange = (e) => {
        onValueChange(e.target.value);
    }
    const handleUnitChange = (groupTitle, label, selected) => {
        onUnitChange(selected);
        setUnit(selected);
    }
    const fBoil = (scale==='f' && value >= 212) ? true : false;
    const cBoil = (scale==='c' && value >= 100) ? true : false;
    const boiling = (fBoil||cBoil) ? true : false;
    const tempColor = (boiling) ?  'brdr-red' : 'brdr-blue'; 
    const classes = 'greet m-20 p-20 r-10 w-100 ' + tempColor;
    return (
        <fieldset className="r-20 mb-20">
            <Selector
                groupTitle='Input'
                selected={unit} 
                label='unit'
                items={units}
                onChange={handleUnitChange}
                padding='14px'
            />
            <input value={value} onChange={handleChange} className={classes} placeholder="Enter here..." />
        </fieldset>
    );
}

export default TemperatureInput;