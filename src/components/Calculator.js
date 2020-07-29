//stateful component
import React from 'react';
import TemperatureInput from './TemperatureInput';
import BoilingVerdict, {tryConvert, toCelsius, toFahrenheit} from './BoilingVerdict';

class Calculator extends React.Component {

    constructor(props) {
        super(props);
        this.handleCelsiusChange = this.handleCelsiusChange.bind(this);
        this.handleFahrenheitChange = this.handleFahrenheitChange.bind(this);
        this.state = {temperature: '', scale: 'c'};
    }
    handleCelsiusChange(temperature) {
        //console.log("handleCelsiusChange")
        this.setState({scale: 'c', temperature});
    }
    handleFahrenheitChange(temperature) {
        //console.log("handleFahrenheitChange")
        this.setState({scale: 'f', temperature});
    }

    render() {
        const { scale, temperature } = this.state;
        const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
        const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;
        return (
            <div className="p-20 App-content fadeIn">
                {/*<div className="p-20 neumorphism">*/}
                <div className="p-20">
                    <TemperatureInput
                        scale="c"
                        temperature={celsius}
                        onTemperatureChange={this.handleCelsiusChange} id="celsius"/>
                    <TemperatureInput
                        scale="f"
                        temperature={fahrenheit}
                        onTemperatureChange={this.handleFahrenheitChange} id="fahrenheit"/>
                    <BoilingVerdict celsius={parseFloat(celsius)} />
                </div>
            </div>
        );
    }
}

  export default Calculator;