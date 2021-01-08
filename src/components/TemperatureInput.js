import React from 'react';

const scaleNames = {
    c: 'Celsius',
    f: 'Fahrenheit'
};

const TemperatureInput = ({ scale, temperature, onTemperatureChange }) => {
    const handleChange = (e) => {
        temperature = e.target.value;
        onTemperatureChange(e.target.value);
    }
    return (
        <fieldset className="r-20">
            <legend>{scaleNames[scale]}:</legend>
            <input value={temperature} onChange={handleChange} className="greet p-20 r-10 w-200 brdr-red" placeholder="Enter here..."/>
        </fieldset>
    );
}

export default TemperatureInput;