import React, { useState, useEffect } from 'react';
import directionObject from '../waves/DirectionObject';
import validate from '../utils/validate';
import getKey from '../utils/KeyGenerator';

const categories = [
  'all',
  'temperature',
  'currency',
  'volume',
  'length',
  'ocean',
  'time'
]
const units = {
  Celsius: ['Fahrenheit'],
  Fahrenheit: ['Celsius'],
  Gallons: ['Liters', 'Cups', 'Milliliters', 'Ounces'],
  Liters: ['Gallons', 'Cups', 'Milliliters', 'Ounces'],
  Milliliters: ['Gallons', 'Cups', 'Ounces', 'Liters', 'Tablespoons', 'Teaspoons'],
  Pesos: ['Dollars'],
  Dollars: ['Pesos'],
  Miles: ['Kilometers', 'Yards', 'Feet'],
  Kilometers: ['Miles', 'MPH', 'Knots'],
  Millimeters: ['Centimeters', 'Yards', 'Feet', 'Inches', 'Meters'],
  Inches: ['Centimeters','Yards', 'Feet', 'Millimeters'],
  Centimeters: ['Inches', 'Millimeters'],
  Pounds: ['Kilograms', 'Grams', 'Ounces'],
  Kilograms: ['Pounds', 'Grams', 'Ounces'],
  Ounces: ['Grams', 'Cups', 'Tablespoons', 'Teaspoons', 'Pounds', 'Kilograms', 'Liters', 'Milliliters', 'Gallons'],
  Grams: ['Ounces', 'Cups', 'Tablespoons', 'Teaspoons', 'Kilograms', 'Pounds', 'Liters', 'Milliliters', 'Gallons'],
  Cups: ['Ounces', 'Tablespoons', 'Teaspoons', 'Grams', 'Liters', 'Milliliters', 'Gallons'],
  Tablespoons: ['Ounces', 'Teaspoons', 'Grams', 'Cups', 'Liters', 'Milliliters'],
  Teaspoons: ['Ounces', 'Tablespoons', 'Grams', 'Cups', 'Liters', 'Milliliters'],
  Yards: ['Meters','Yards', 'Feet', 'Inches', 'Miles', 'Millimeters'],
  Feet: ['Meters', 'Yards', 'Inches', 'Miles', 'Millimeters'],
  Meters: ['Yards','Feet', 'Inches', 'Miles', 'Millimeters'],
  MPH: ['Knots', 'Kilometers'],
  Knots: ['MPH', 'Kilometers'],
  Degrees: ['Direction'],
  Direction: ['Degrees'],
  Seconds: ['Hours', 'Minutes', 'Milliseconds'],
  Minutes: ['Hours', 'Seconds', 'Milliseconds'],
  Hours: ['Minutes', 'Seconds', 'Milliseconds'],
  Milliseconds: ['Hours', 'Minutes', 'Seconds']
};


const temperature = {
  Celsius: ['Fahrenheit'],
  Fahrenheit: ['Celsius']
};

const currency = {
  Pesos: ['Dollars'],
  Dollars: ['Pesos']
};

const volume = {
  Gallons: ['Liters', 'Cups', 'Milliliters', 'Ounces'],
  Liters: ['Gallons', 'Cups', 'Milliliters', 'Ounces'],
  Milliliters: ['Gallons', 'Cups', 'Ounces', 'Liters', 'Tablespoons', 'Teaspoons'],
  Pounds: ['Kilograms', 'Grams', 'Ounces'],
  Kilograms: ['Pounds', 'Grams', 'Ounces'],
  Ounces: ['Grams', 'Cups', 'Tablespoons', 'Teaspoons', 'Pounds', 'Kilograms', 'Liters', 'Milliliters', 'Gallons'],
  Grams: ['Ounces', 'Cups', 'Tablespoons', 'Teaspoons', 'Kilograms', 'Pounds', 'Liters', 'Gallons'],
  Cups: ['Ounces', 'Tablespoons', 'Teaspoons', 'Grams', 'Liters', 'Milliliters', 'Gallons'],
  Tablespoons: ['Ounces', 'Teaspoons', 'Grams', 'Cups', 'Liters', 'Milliliters'],
  Teaspoons: ['Ounces', 'Tablespoons', 'Grams', 'Cups', 'Liters', 'Milliliters']
};

const length = {
  Miles: ['Kilometers', 'Yards', 'Feet'],
  Kilometers: ['Miles'],
  Inches: ['Centimeters', 'Yards', 'Feet', 'Millimeters'],
  Centimeters: ['Inches', 'Millimeters'],
  Feet: ['Meters', 'Yards', 'Inches', 'Miles', 'Millimeters'],
  Meters: ['Yards', 'Feet', 'Inches', 'Miles', 'Millimeters'],
  Millimeters: ['Yards', 'Feet', 'Inches', 'Centimeters', 'Meters']
};
const ocean = {
  Kilometers: ['Knots', 'MPH'],
  MPH: ['Knots', 'Kilometers'],
  Knots: ['MPH', 'Kilometers'],
  Degrees: ['Direction'],
  Direction: ['Degrees']
};
const time = {
  Seconds: ['Hours', 'Minutes', 'Milliseconds'],
  Minutes: ['Hours', 'Seconds', 'Milliseconds'],
  Hours: ['Minutes', 'Seconds', 'Milliseconds'],
  Milliseconds: ['Hours', 'Minutes', 'Seconds']
};
const unitObjects = {
  all: units,
  temperature: temperature,
  currency: currency,
  volume: volume,
  length: length,
  ocean: ocean,
  time: time
}
const directions = Object.keys(directionObject);
const degrees = Object.values(directionObject);
/*
const degreesToDirection = (degrees) => {
  const directionsAndDegrees = Object.entries(directionObject);
  for (let i = 0; i < directionsAndDegrees.length; i++) {
    if (degrees < directionsAndDegrees[i][1]) {
      return directionsAndDegrees[i - 1][0];
    }
  }
  return 'N';
};

const directionToDegrees = (direction) => {
  return validate(directionObject[direction]) !== null ? directionObject[direction] : 0;
};
*/
const conversionFactors = {
  Celsius: (value) => (value * 9 / 5) + 32,
  Fahrenheit: (value) => (value - 32) * 5 / 9,
  Gallons: (value, toUnit) => {
    switch (toUnit) {
      case 'Liters':
        return value * 3.78541;
      case 'Cups':
        return value * 16;
      case 'Milliliters':
        return value * 3785.41;
      case 'Ounces':
        return value * 128;
      default:
        return value;
    }
  },
  Liters: (value, toUnit) => {
    switch (toUnit) {
      case 'Gallons':
        return value / 3.78541;
      case 'Cups':
        return value * 4.22675;
      case 'Milliliters':
        return value * 1000;
      case 'Ounces':
        return value * 33.814;
      default:
        return value;
    }
  },
  Pesos: (value) => value / 20,
  Dollars: (value) => value * 20,
  Miles: (value, toUnit) => {
    switch (toUnit) {
      case 'Millimeters':
        return value * 1.609E-6;
      case 'Meters':
        return value * 1609.34;
      case 'Inches':
        return value * 63360;
      case 'Feet':
        return value * 5280;
      case 'Yards':
        return value * 1760;
      case 'Kilometer':
        return value * 1.60934;
      default:
        return value;
    }
  },
  Kilometers: (value, toUnit) => {
    switch (toUnit) {
      case 'Knots':
        return value / 1.852;
      case 'Miles':
        return value / 1.60934;
      case 'MPH':
        return value / 1.60934;
      default:
        return value;
    }
  },
  Inches: (value, toUnit) => {
    switch (toUnit) {
      case 'Centimeters':
        return value * 2.54;
      case 'Feet':
        return value / 12;
      case 'Yards':
        return value / 36;
      case 'Millimeters':
        return value / .0393701;
      default:
        return value;
    }
  },

  Centimeters: (value, toUnit) => {
    switch (toUnit) {
      case 'Millimeters':
          return value / 0.1;
      case 'Inches':
        return value / 2.54
      default:
        return value;
    }
  },
  Pounds: (value, toUnit) => {
    switch (toUnit) {
      case 'Kilograms':
        return value * 0.453592;
      case 'Grams':
        return value * 453.592;
      case 'Ounces':
        return value * 16;
      default:
        return value;
    }
  },
  Kilograms: (value, toUnit) => {
    switch (toUnit) {
      case 'Pounds':
        return value / 0.453592;
      case 'Grams':
        return value * 1000;
      case 'Ounces':
        return value * 35.274;
      default:
        return value;
    }
  },
  Ounces: (value, toUnit) => {
    switch (toUnit) {
      case 'Grams':
        return value * 28.3495;
      case 'Cups':
        return value / 8;
      case 'Tablespoons':
        return value * 2;
      case 'Teaspoons':
        return value * 6;
      case 'Liters':
        return value / 33.814;
      case 'Milliliters':
        return value * 29.5735;
      case 'Gallons':
        return value / 128;
      case 'Pounds':
        return value / 16;
      case 'Kilograms':
        return value / 35.274;
      default:
        return value;
    }
  },
  Grams: (value, toUnit) => {
    switch (toUnit) {
      case 'Ounces':
        return value / 28.3495;
      case 'Cups':
        return value / 240;
      case 'Tablespoons':
        return value / 15;
      case 'Teaspoons':
        return value / 5;
      case 'Kilograms':
        return value / 1000;
      case 'Pounds':
        return value / 453.592;
      case 'Liters':
        return value / 1000;
      case 'Milliliters':
        return value;
      case 'Gallons':
        return value / 3785.41;
      default:
        return value;
    }
  },
  Cups: (value, toUnit) => {
    switch (toUnit) {
      case 'Ounces':
        return value * 8;
      case 'Tablespoons':
        return value * 16;
      case 'Teaspoons':
        return value * 48;
      case 'Grams':
        return value * 240;
      case 'Liters':
        return value / 4.22675;
      case 'Milliliters':
        return value * 236.588;
      case 'Gallons':
        return value / 16;
      default:
        return value;
    }
  },
  Tablespoons: (value, toUnit) => {
    switch (toUnit) {
      case 'Ounces':
        return value / 2;
      case 'Cups':
        return value / 16;
      case 'Teaspoons':
        return value * 3;
      case 'Grams':
        return value * 15;
      case 'Liters':
        return value / 67.628;
      case 'Milliliters':
        return value * 14.787;
      default:
        return value;
    }
  },
  Teaspoons: (value, toUnit) => {
    switch (toUnit) {
      case 'Ounces':
        return value / 6;
      case 'Cups':
        return value / 48;
      case 'Tablespoons':
        return value / 3;
      case 'Grams':
        return value * 5.69;
      case 'Liters':
        return value / 202.884;
      case 'Milliliters':
        return value * 4.929;
      default:
        return value;
    }
  },

  Yards: (value, toUnit) => {
    switch (toUnit) {
      case 'Millimeters':
        return value / 0.001093613333333;
      case 'Meters':
        return value * 0.9144;
      case 'Inches':
        return value * 36;
      case 'Miles':
        return value / 1760;
      case 'Feet':
        return value * 3;
      default:
        return value;
    }
  },
  
  Feet: (value, toUnit) => {
    switch (toUnit) {
      case 'Millimeters':
        return value / .00328084;
      case 'Meters':
        return value * 0.3048;
      case 'Inches':
        return value * 12;
      case 'Miles':
        return value / 5280;
      case 'Yards':
        return value / 3;
      default:
        return value;
    }
  },
  
  Millimeters: (value, toUnit) => {
    switch (toUnit) {
      case 'Centimeters':
        return value * 0.1;
      case 'Meters':
        return value * 0.001;
      case 'Inches':
        return value * .0393701;
      case 'Feet':
        return value * .00328084;
      case 'Yards':
        return value * .001093613333333;
      default:
        return value;
    }
  },
  
  Meters: (value, toUnit) => {
    switch (toUnit) {
      case 'Millimeters':
        return value / .001;
      case 'Yards':
        return value / 0.3048;
      case 'Feet':
        return value / 0.1016;
      case 'Inches':
        return value * 39.3701;
      case 'Miles':
        return value / 1609.34;
      default:
        return value;
    }
  },
  MPH: (value, toUnit) => {
    switch (toUnit) {
      case 'Knots':
        return value * 0.868976;
      case 'Kilometers':
        return value * 1.60934;
      default:
        return value;
    }
  },
  //Seconds: ['Hours', 'Minutes', 'Milliseconds'],
  Milliseconds: (value, toUnit) => {
    switch (toUnit) {
      case 'Hours':
        return value / 36000;
      case 'Minutes':
        return value / 600;
      case 'Seconds':
        return value / 1000;
      default:
        return value;
    }
  },
  Seconds: (value, toUnit) => {
    switch (toUnit) {
      case 'Hours':
        return value / 3600;
      case 'Minutes':
        return value / 60;
      case 'Milliseconds':
        return value * 1000;
      default:
        return value;
    }
  },
  Minutes: (value, toUnit) => {
    switch (toUnit) {
      case 'Hours':
        return value / 60;
      case 'Seconds':
        return value / 600;
      case 'Milliseconds':
        return value * 6000;
      default:
        return value;
    }
  },
  Hours: (value, toUnit) => {
    switch (toUnit) {
      case 'Minutes':
        return value * 60;
      case 'Seconds':
        return value * 60 * 60;
      case 'Milliseconds':
        return value * 60 * 60 * 1000;
      default:
        return value;
    }
  },
  Knots: (value, toUnit) => {
    switch (toUnit) {
      case 'Kilometers':
        return value / 1.852;
      case 'MPH':
        return value / 0.868976;
      default:
        return value;
    }
  },
  Milliliters: (value, toUnit) => {
    switch (toUnit) {
      case 'Gallons':
        return value / 3785.41;
      case 'Liters':
        return value / 1000;
      case 'Cups':
        return value / 236.588;
      case 'Ounces':
        return value / 29.5735;
      case 'Tablespoons':
        return value / 14.787;
      case 'Teaspoons':
        return value / 4.929;
      default:
        return value;
    }
  },
  //Direction: (value) => directionToDegrees(value),
  Degrees: (value, toUnit) => {
    const closestDirection = directions.reduce((prev, curr) =>
      Math.abs(directionObject[curr] - value) < Math.abs(directionObject[prev] - value) ? curr : prev
    );
    return toUnit === 'Direction' ? closestDirection : value;
  },
  Direction: (value, toUnit) => {
    if (isNaN(value)) {
      return toUnit === 'Degrees' ? directionObject[value] : value;
    }
  }
};

const Converter = () => {
  const [category, setCategory] = useState('all');
  const [unit1, setUnit1] = useState(Object.keys(unitObjects[category])[0]);
  const [unit2, setUnit2] = useState(units[Object.keys(unitObjects[category])[0]][0]);
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  useEffect(() => {
    setUnit1(Object.keys(unitObjects[category])[0]);
    setUnit2(units[Object.keys(unitObjects[category])[0]][0]);
  }, [category]);

  useEffect(() => {
    setUnit2(units[unit1][0]);
    if (value1) {
      if (unit1 === 'Direction' || unit2 === 'Direction') {
        setValue2(conversionFactors[unit1](parseFloat(value1), unit2));
      } else {
        setValue2(conversionFactors[unit1](parseFloat(value1), unit2).toFixed(2));
      }
    }
  }, [unit1]);

  useEffect(() => {
    /* 
    if (value2) {
      if (unit1 === 'Direction' || unit2 === 'Direction') {
        setValue1(conversionFactors[unit2](parseFloat(value2), unit1));
      } else {
        console.log(`unit1: ${unit1} unit2: ${unit2} value2: ${value2}`)
        setValue1(conversionFactors[unit2](parseFloat(value2), unit1).toFixed(2));
      }
  */  
    if (value1) {
      if (unit1 === 'Direction' || unit2 === 'Direction') {
        setValue2(conversionFactors[unit1](parseFloat(value1), unit2));
      } else {
        setValue2(conversionFactors[unit1](parseFloat(value1), unit2).toFixed(2));
      }
    }
  }, [unit2]);
  const handleValue1Change = (e) => {
    const newValue = e.target.value;
    setValue1(newValue);
    if (unit1 === 'Degrees') {
      setValue2(conversionFactors[unit1](parseFloat(newValue), unit2));
    } else if (unit1 === 'Direction') {
      setValue2(conversionFactors[unit1](newValue, unit2));
    } else {
      setValue2(conversionFactors[unit1](parseFloat(newValue), unit2).toFixed(2));
    }
  };
  const handleValue2Change = (e) => {
    let newValue = null;
    if (unit2 === 'Degrees') {
      newValue = e;
      setValue2(newValue);
      setValue1(conversionFactors[unit2](parseFloat(newValue), unit1));
    } else if (unit2 === 'Direction') {
      newValue = e;
      setValue2(newValue);
      setValue1(conversionFactors[unit2](newValue, unit1));
    } else {
      newValue = e.target.value;
      setValue2(newValue);
      setValue1(conversionFactors[unit2](parseFloat(newValue), unit1).toFixed(2));
    }
  };
  return (
    <div>
      <div className='containerBox'>
        <div className='containerBox flexContainer bg-lite'>
          <div className='containerBox flex2Column contentRight'>
            Category:
          </div>
          <select className='containerBox flex2Column' value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((category) => (
              <option key={getKey(category)} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='containerBox'>
        <div className='containerBox flexContainer bg-lite'>
          <select className='containerBox flex2Column contentRight' value={unit1} onChange={(e) => setUnit1(e.target.value)}>
            {Object.keys(unitObjects[category]).map((unit) => (
              <option key={getKey(unit)} value={unit}>
                {unit}:
              </option>
            ))}
          </select>
          <div className='flex2Column pr-10'>
            {
              (unit1 === 'Degrees')
                ? <select className='containerBox flex2Column width-100-percent' value={value1} onChange={handleValue1Change}>
                  {degrees.map((degree) => (
                    <option key={getKey(degree)} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
                : (unit1 === 'Direction')
                  ? <select className='containerBox flex2Column width-100-percent' value={value1} onChange={handleValue1Change}>
                    {directions.map((direction) => (
                      <option key={getKey(direction)} value={direction}>
                        {direction}
                      </option>
                    ))}
                  </select>
                  : <input
                    id='direction'
                    name='direction'
                    className='containerBox bg-dark width-100-percent'
                    type="number"
                    value={value1}
                    onChange={handleValue1Change}
                  />
            }
          </div>
        </div>
        <div className='containerBox flexContainer bg-lite'>
          {
            (validate(unitObjects[category][unit1]) !== null)
              ? <select
                className='containerBox flex2Column contentRight'
                value={unit2}
                onChange={(e) => setUnit2(e.target.value)}
              >
                {
                  unitObjects[category][unit1].map((unit) => (
                    <option key={getKey(unit)} value={unit}>
                      {unit}:
                    </option>
                  ))
                }
              </select>
              : <div className='containerBox bg-neogreen'>
                catergory: {category} unit1: {unit1}
              </div>
          }
          <div className='flex2Column pr-10'>
            {
              (unit2 === 'Degrees')
                ? <select className='containerBox flex2Column width-100-percent' value={value2} onChange={(e) => handleValue2Change(e.target.value)}>
                  {degrees.map((degree) => (
                    <option key={getKey(degree)} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
                : (unit2 === 'Direction')
                  ? <select className='containerBox flex2Column width-100-percent' value={value2} onChange={(e) => handleValue2Change(e.target.value)}>
                    {directions.map((direction) => (
                      <option key={getKey(direction)} value={direction}>
                        {direction}
                      </option>
                    ))}
                  </select>
                  : <input
                    className='containerBox bg-dark width-100-percent'
                    type="number"
                    value={value2}
                    onChange={handleValue2Change}
                  />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;