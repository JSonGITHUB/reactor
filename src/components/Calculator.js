//stateful component
import React from 'react';
import TemperatureInput from './TemperatureInput';
import BoilingVerdict from './BoilingVerdict';

class Calculator extends React.Component {

    constructor(props) {
        super(props);
        this.handleCelsiusChange = this.handleCelsiusChange.bind(this);
        this.handleFahrenheitChange = this.handleFahrenheitChange.bind(this);
        this.state = {temperature: '', scale: 'c'};
    }
    handleCelsiusChange(temperature) {
        console.log("handleCelsiusChange")
        this.setState({scale: 'c', temperature});
    }
    handleFahrenheitChange(temperature) {
        console.log("handleFahrenheitChange")
        this.setState({scale: 'f', temperature});
    }

    render() {
        const boilingVerdict = new BoilingVerdict({'celsius': ''});
        const scale = this.state.scale;
        const temperature = this.state.temperature;
        const celsius = scale === 'f' ? boilingVerdict.tryConvert(temperature, boilingVerdict.toCelsius) : temperature;
        const fahrenheit = scale === 'c' ? boilingVerdict.tryConvert(temperature, boilingVerdict.toFahrenheit) : temperature;
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