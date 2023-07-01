import React from 'react';

const toCelsius = (fahrenheit) => (fahrenheit - 32) * 5 / 9;
const tryConvert = (temperature, convert) => {
    const input = parseFloat(temperature);
    if (Number.isNaN(input)) {
        return '';
    }
    const output = convert(input);
    const rounded = Math.round(output * 1000) / 1000;
    return rounded.toString();
};
const toFahrenheit = (celsius) => (celsius * 9 / 5) + 32;
const BoilingVerdict = props => {
    const { celsius } = props;
    if (celsius >= 100) { return <p className='color-red'>water is boiling...</p> }
    if (celsius <= 0) { return <p className='color-blue'>water is freezing...</p> }
    return <p className='color-yellow'>water is not boiling or freezing...</p>;
}

export default BoilingVerdict;
export {
    toCelsius,
    tryConvert,
    toFahrenheit
}