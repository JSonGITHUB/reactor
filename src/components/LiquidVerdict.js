import React from 'react';

const toGallons = (liter) => (liter * .264172);
const tryConvert = (volume, convert) => {
    const input = parseFloat(volume);
    if (Number.isNaN(input)) {
        return '';
    }
    const output = convert(input);
    const rounded = Math.round(output * 1000) / 1000;
    return rounded.toString();
};
const toLiters = (gallon) => (gallon * 3.78541);
export {
    toGallons,
    tryConvert,
    toLiters
}