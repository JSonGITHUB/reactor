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
    if (props.celsius >= 100) { return <p>water is boiling...</p> }
    if (props.celsius <= 0) { return <p>water is freezing...</p> }
    return <p>water is not boiling or freezing...</p>;
}

export default BoilingVerdict;
export {
    toCelsius,
    tryConvert,
    toFahrenheit
}