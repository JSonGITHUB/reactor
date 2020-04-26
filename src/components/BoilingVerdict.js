import React from 'react';

class BoilingVerdict extends React.Component {

    constructor(props) {
        super(props);
        this.celsius = props.celsius;
    }
    tryConvert(temperature, convert) {
        const input = parseFloat(temperature);
        if (Number.isNaN(input)) {
            return '';
        }
        const output = convert(input);
        const rounded = Math.round(output * 1000) / 1000;
        return rounded.toString();
    }
    toCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5 / 9;
    }

    toFahrenheit(celsius) {
        return (celsius * 9 / 5) + 32;
    }
    render() {
        if (this.props.celsius >= 100) { return <p>The water would boil.</p> }
        return <p>The water would not boil.</p>;
    }
}

export default BoilingVerdict;