//stateful component
import React, { useState, useEffect } from 'react';
import TemperatureInput from './TemperatureInput';
import BoilingVerdict, {tryConvert, toCelsius, toFahrenheit} from './BoilingVerdict';
// eslint-disable-next-line
import { toGallons, toLiters } from './LiquidVerdict';

// eslint-disable-next-line
import templateData from '../waves/TemplateData';

const Calculator = () => {

    const [value1, setValue1] = useState(0);
    const [value2, setValue2] = useState(0);
    const [unit1, setUnit1] = useState('Celsius');
    const [unit2, setUnit2] = useState('Fahrenheit');

    const handleSetUnit1 = (value) => {
        console.log(`handleSetUnit1 => unit1: ${unit1} value1: ${value}`)
        setValue1(value);
    }

    const handleSetUnit2 = (value) => {
        console.log(`handleSetUnit2 => unit2: ${unit2} value2: ${value}`)
        setValue2(value);
    }
    const handleUnit1Change = (unit) => {
        console.log(`handleUnit1Change => unit1: ${unit}`)
        setUnit1(unit);
    }
    const handleUnit2Change = (unit) => {
        console.log(`handleUnit2Change => unit2: ${unit}`)
        setUnit2(unit);
    }
    const celsius = () => {
        
        const display = (unit1 === 'Fahrenheit') ? tryConvert(value1, toCelsius) : value1;
        return display;
    }
    const fahrenheit = () => (unit2 === 'Celsius') ? tryConvert(value2, toFahrenheit) : value2;
    // eslint-disable-next-line
    const gallons = () => (unit1 === 'Gallons') ? tryConvert(value1, toLiters) : value1;
    // eslint-disable-next-line
    const liters = () => (unit2 === 'Liters') ? tryConvert(value2, toGallons) : value2;

    useEffect(() => {
        console.log(`unit1 => ${unit1}`);
        console.log(`unit1: ${unit1} value1: ${value1}`); 
        console.log(`unit2: ${unit2} value2: ${value2}`);      
    }, [unit1]);
    useEffect(() => {
        console.log(`unit2 => ${unit2}`); 
        console.log(`unit1: ${unit1} value1: ${value1}`); 
        console.log(`unit2: ${unit2} value2: ${value2}`);
    }, [unit2]);
    useEffect(() => {
        console.log(`value1 => ${value1}`); 
        console.log(`unit1: ${unit1} value1: ${value1}`); 
        console.log(`unit2: ${unit2} value2: ${value2}`);
    }, [value1]);
    useEffect(() => {
        console.log(`value2 => ${value2}`); 
        console.log(`unit1: ${unit1} value1: ${value1}`); 
        console.log(`unit2: ${unit2} value2: ${value2}`);
    }, [value2]);
    
    return (
        <div className="fadeIn mt--14">
            <TemperatureInput
                scale={value1}
                value={celsius()}
                unit={unit1}
                onValueChange={handleSetUnit1} 
                onUnitChange={handleUnit1Change} 
                id="celsius"
            />
            <TemperatureInput
                scale={unit2}
                value={fahrenheit()}
                onValueChange={handleSetUnit2}
                onUnitChange={handleUnit2Change} 
                id="fahrenheit"
            />
            <BoilingVerdict celsius={parseFloat(celsius())} />
        </div>
    );
}

  export default Calculator;