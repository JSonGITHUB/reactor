//stateful component
import React, {useState} from 'react';
import TemperatureInput from './TemperatureInput';
import BoilingVerdict, {tryConvert, toCelsius, toFahrenheit} from './BoilingVerdict';
import templateData from './waves/TemplateData';

const Calculator = () => {

    const [temperature, setTemperature] = useState('');
    const [scale, setScale] = useState('c');

    const handleCelsiusChange = (temperature) => {
        setTemperature(temperature);
        setScale('c');
    }
    const handleFahrenheitChange = (temperature) => {
        setTemperature(temperature);
        setScale('f');
    }
    const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
    const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;
    return (
        <div className="p-20 App-content fadeIn">
            <div className="p-20">
                <TemperatureInput
                    scale="c"
                    temperature={celsius}
                    onTemperatureChange={handleCelsiusChange} 
                    id="celsius"
                />
                <TemperatureInput
                    scale="f"
                    temperature={fahrenheit}
                    onTemperatureChange={handleFahrenheitChange}
                    id="fahrenheit"
                />
                <BoilingVerdict celsius={parseFloat(celsius)} />
            </div>
        </div>
    );
}

  export default Calculator;