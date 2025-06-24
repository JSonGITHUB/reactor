import React, { useState, useEffect } from 'react';
import validate from '../utils/validate';

const units = {
  Celsius: ['Fahrenheit'],
  Fahrenheit: ['Celsius'],
  Gallons: ['Liters'],
  Liters: ['Gallons'],
  Pesos: ['Dollars'],
  Dollars: ['Pesos'],
  Miles: ['Kilometers', 'Yards', 'Feet'],
  Kilometers: ['Miles'],
  Inches: ['Centimeters', 'Yards', 'Feet'],
  Centimeters: ['Inches'],
  Pounds: ['Kilograms', 'Grams', 'Ounces'],
  Kilograms: ['Pounds', 'Grams', 'Ounces'],
  Ounces: ['Grams', 'Cups', 'Tablespoons', 'Teaspoons', 'Pounds', 'Kilograms'],
  Grams: ['Ounces', 'Cups', 'Tablespoons', 'Teaspoons', 'Kilograms', 'Pounds'],
  Cups: ['Ounces', 'Tablespoons', 'Teaspoons', 'Grams'],
  Yards: ['Meters', 'Yards', 'Feet', 'Inches', 'Miles'],
  Feet: ['Meters', 'Yards', 'Inches', 'Miles'],
  Meters: ['Yards', 'Feet', 'Inches', 'Miles'],
  MPH: ['Knots'],
  Knots: ['MPH'],
  Degrees: ['Direction'],
  Direction: ['Degrees']
};

const directionObject = {
  'N': 0,
  'NNE': 23,
  'NE': 45,
  'ENE': 68,
  'E': 90,
  'ESE': 113,
  'SE': 135,
  'SSE': 167,
  'S': 180,
  'SSW': 203,
  'SW': 225,
  'WSW': 247,
  'W': 270,
  'WNW': 293,
  'NW': 315,
  'NNW': 338
};

const degreesToDirection = (degrees) => {
  const directions = Object.entries(directionObject).sort((a, b) => a[1] - b[1]);
  for (let i = 0; i < directions.length; i++) {
    if (degrees < directions[i][1]) {
      return directions[i - 1][0];
    }
  }
  return 'N';
};

const directionToDegrees = (direction) => {
  //return directionObject[direction] !== undefined ? directionObject[direction] : 0;
  return validate(directionObject[direction]) !== null ? directionObject[direction] : 0;
};

const conversionFactors = {
  Celsius: (value) => (value * 9/5) + 32,
  Fahrenheit: (value) => (value - 32) * 5/9,
  Gallons: (value) => value * 3.78541,
  Liters: (value) => value / 3.78541,
  Pesos: (value) => value / 20, // example conversion rate
  Dollars: (value) => value * 20, // example conversion rate
  Miles: (value, toUnit) => toUnit === 'Kilometers' ? value * 1.60934 : value * 5280,
  Kilometers: (value) => value / 1.60934,
  Inches: (value, toUnit) => toUnit === 'Centimeters' ? value * 2.54 : value / 12,
  Centimeters: (value) => value / 2.54,
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
        return value * 5;
      default:
        return value;
    }
  },
  Feet: (value, toUnit) => {
    switch (toUnit) {
      case 'Meters':
        return value * 0.3048;
      case 'Yards':
        return value * 4;
      case 'Inches':
        return value * 12;
      case 'Miles':
        return value / 5280;
      default:
        return value;
    }
  },
  Yards: (value, toUnit) => {
    switch (toUnit) {
      case 'Meters':
        return value * 0.1016;
      case 'Yards':
        return value * 1.333333333333333;
      case 'Inches':
        return value * 4;
      case 'Feet':
        return value / 3;
      case 'Miles':
        return value / 1760;
      default:
        return value;
    }
  },
  Meters: (value, toUnit) => {
    switch (toUnit) {
      case 'Yards':
        return value / 0.1016;
      case 'Feet':
        return value / 0.3048;
      case 'Inches':
        return value * 39.3701;
      case 'Miles':
        return value / 1609.34;
      default:
        return value;
    }
  },
  MPH: (value) => value * 0.868976,
  Knots: (value) => value / 0.868976,
  Degrees: (value) => degreesToDirection(value),
  Direction: (value) => directionToDegrees(value)
};

const UnitConverter = () => {
  const [unit1, setUnit1] = useState('Celsius');
  const [unit2, setUnit2] = useState('Fahrenheit');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  useEffect(() => {
    if (value1 !== '') {
      setValue2(conversionFactors[unit1](parseFloat(value1), unit2));
    }
  }, [unit1, value1]);

  useEffect(() => {
    if (value2 !== '') {
      setValue1(conversionFactors[unit2](parseFloat(value2), unit1));
    }
  }, [unit2, value2]);

  const handleUnit1Change = (e) => {
    const newUnit1 = e.target.value;
    const relatedUnits = units[newUnit1];
    setUnit1(newUnit1);
    setUnit2(relatedUnits[0]);
  };

  const handleValue1Change = (e) => {
    const newValue1 = e.target.value;
    setValue1(newValue1);
    setValue2(conversionFactors[unit1](parseFloat(newValue1), unit2));
  };

  const handleUnit2Change = (e) => {
    setUnit2(e.target.value);
    setValue2(conversionFactors[unit1](parseFloat(value1), e.target.value));
  };

  const handleValue2Change = (e) => {
    const newValue2 = e.target.value;
    setValue2(newValue2);
    setValue1(conversionFactors[unit2](parseFloat(newValue2), unit1));
  };

  return (
    <div>
      <div>
        <select value={unit1} onChange={handleUnit1Change}>
          {Object.keys(units).map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
        <input 
          id='unit1'
          name='unit1'
          type='number' 
          value={value1} 
          onChange={handleValue1Change} 
        />
      </div>
      <div>
        <select value={unit2} onChange={handleUnit2Change}>
          {units[unit1].map((unit) => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
        <input 
          id='unit2'
          name='unit2'
          type='number' 
          value={value2} 
          onChange={handleValue2Change} 
        />
      </div>
    </div>
  );
};

export default UnitConverter;