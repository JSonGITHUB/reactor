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
    const fBoil = (scale==='f' && temperature >= 212) ? true : false;
    const cBoil = (scale==='c' && temperature >= 100) ? true : false;
    const boiling = (fBoil||cBoil) ? true : false;
    const tempColor = (boiling) ?  'brdr-red' : 'brdr-blue'; 
    const classes = 'greet m-20 p-20 r-10 w-200 ' + tempColor;
    return (
        <fieldset className="r-20 mb-20">
            <legend><span className="p-10">{scaleNames[scale]}</span></legend>
            <input value={temperature} onChange={handleChange} className={classes} placeholder="Enter here..."/>
        </fieldset>
    );
}

export default TemperatureInput;