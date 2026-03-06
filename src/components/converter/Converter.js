import React, { useState, useEffect } from 'react';
import directionObject from '../waves/DirectionObject';
import getKey from '../utils/KeyGenerator';
import icons from '../site/icons';

// --- Constants and Data ---
const categories = [
  'all', 'temperature', 'currency', 'volume', 'length', 'ocean', 'time'
];

const units = {
  // Temperature
  Celsius: ['Fahrenheit', 'Kelvin'],
  Fahrenheit: ['Celsius', 'Kelvin'],
  Kelvin: ['Celsius', 'Fahrenheit'],
  // Currency
  Pesos: ['Dollars', 'Euros', 'Yen', 'Pounds'],
  Dollars: ['Pesos', 'Euros', 'Yen', 'Pounds Sterling'],
  Euros: ['Dollars', 'Pesos', 'Yen', 'Pounds Sterling'],
  Yen: ['Dollars', 'Euros', 'Pesos', 'Pounds Sterling'],
  'Pounds Sterling': ['Dollars', 'Euros', 'Pesos', 'Yen'],
  // Volume
  Gallons: ['Liters', 'Cups', 'Milliliters', 'Ounces', 'Quarts', 'Pints'],
  Quarts: ['Gallons', 'Liters', 'Cups', 'Milliliters', 'Ounces', 'Pints'],
  Liters: ['Gallons', 'Quarts', 'Cups', 'Milliliters', 'Ounces', 'Pints'],
  Milliliters: ['Gallons', 'Quarts', 'Cups', 'Ounces', 'Liters', 'Tablespoons', 'Teaspoons', 'Pints'],
  Cups: ['Ounces', 'Tablespoons', 'Teaspoons', 'Grams', 'Liters', 'Milliliters', 'Gallons', 'Quarts', 'Pints'],
  Tablespoons: ['Ounces', 'Teaspoons', 'Grams', 'Cups', 'Liters', 'Milliliters', 'Pints'],
  Teaspoons: ['Ounces', 'Tablespoons', 'Grams', 'Cups', 'Liters', 'Milliliters', 'Pints'],
  Ounces: ['Grams', 'Cups', 'Tablespoons', 'Teaspoons', 'Pounds', 'Kilograms', 'Liters', 'Milliliters', 'Gallons', 'Quarts', 'Pints'],
  Grams: ['Ounces', 'Cups', 'Tablespoons', 'Teaspoons', 'Kilograms', 'Pounds', 'Liters', 'Milliliters', 'Gallons', 'Quarts', 'Pints'],
  Pounds: ['Kilograms', 'Grams', 'Ounces'],
  Kilograms: ['Pounds', 'Grams', 'Ounces'],
  Pints: ['Cups', 'Quarts', 'Gallons', 'Liters', 'Milliliters'],
  // Length
  Inches: ['Centimeters', 'Yards', 'Feet', 'Millimeters', 'Meters'],
  Feet: ['Meters', 'Yards', 'Inches', 'Miles', 'Millimeters', 'Centimeters'],
  Yards: ['Meters', 'Feet', 'Inches', 'Miles', 'Millimeters', 'Centimeters'],
  Miles: ['Kilometers', 'Yards', 'Feet', 'Centimeters', 'Meters'],
  Millimeters: ['Centimeters', 'Yards', 'Feet', 'Inches', 'Meters'],
  Centimeters: ['Inches', 'Millimeters', 'Meters', 'Feet', 'Yards'],
  Meters: ['Centimeters', 'Millimeters', 'Yards', 'Feet', 'Inches', 'Miles'],
  Kilometers: ['Miles', 'MPH', 'Knots', 'Centimeters', 'Meters'],
  // Area
  'Square Inches': ['Square Feet', 'Square Yards', 'Square Meters', 'Acres'],
  'Square Feet': ['Square Inches', 'Square Yards', 'Square Meters', 'Acres'],
  'Square Yards': ['Square Inches', 'Square Feet', 'Square Meters', 'Acres'],
  'Square Meters': ['Square Inches', 'Square Feet', 'Square Yards', 'Acres', 'Hectares'],
  Acres: ['Square Feet', 'Square Yards', 'Square Meters', 'Hectares'],
  Hectares: ['Square Meters', 'Acres'],
  // Speed
  MPH: ['Knots', 'Kilometers', 'Meters per second'],
  'Meters per second': ['MPH', 'Kilometers', 'Knots'],
  Knots: ['MPH', 'Kilometers', 'Meters per second'],
  // Time
  Seconds: ['Hours', 'Minutes', 'Milliseconds', 'Days'],
  Minutes: ['Hours', 'Seconds', 'Milliseconds', 'Days'],
  Hours: ['Minutes', 'Seconds', 'Milliseconds', 'Days'],
  Days: ['Hours', 'Minutes', 'Seconds'],
  Milliseconds: ['Hours', 'Minutes', 'Seconds'],
  // Pressure
  Pascals: ['Bar', 'PSI', 'Atmospheres'],
  Bar: ['Pascals', 'PSI', 'Atmospheres'],
  PSI: ['Pascals', 'Bar', 'Atmospheres'],
  Atmospheres: ['Pascals', 'Bar', 'PSI'],
  // Energy
  Joules: ['Calories', 'Kilowatt-hours', 'BTU'],
  Calories: ['Joules', 'Kilowatt-hours', 'BTU'],
  'Kilowatt-hours': ['Joules', 'Calories', 'BTU'],
  BTU: ['Joules', 'Calories', 'Kilowatt-hours'],
  // Data
  Bytes: ['Kilobytes', 'Megabytes', 'Gigabytes'],
  Kilobytes: ['Bytes', 'Megabytes', 'Gigabytes'],
  Megabytes: ['Bytes', 'Kilobytes', 'Gigabytes'],
  Gigabytes: ['Bytes', 'Kilobytes', 'Megabytes'],
  // Frequency
  Hertz: ['Kilohertz', 'Megahertz'],
  Kilohertz: ['Hertz', 'Megahertz'],
  Megahertz: ['Hertz', 'Kilohertz'],
  // Ocean/Direction
  Degrees: ['Direction'],
  Direction: ['Degrees']
};

// ...existing code...
const unitObjects = {
  all: units,
  temperature: {
    Celsius: ['Fahrenheit', 'Kelvin'],
    Fahrenheit: ['Celsius', 'Kelvin'],
    Kelvin: ['Celsius', 'Fahrenheit']
  },
  currency: {
    Pesos: ['Dollars', 'Euros', 'Yen', 'Pounds'],
    Dollars: ['Pesos', 'Euros', 'Yen', 'Pounds'],
    Euros: ['Dollars', 'Pesos', 'Yen', 'Pounds'],
    Yen: ['Dollars', 'Euros', 'Pesos', 'Pounds'],
    Pounds: ['Dollars', 'Euros', 'Pesos', 'Yen']
  },
  volume: {
    Gallons: ['Liters', 'Cups', 'Milliliters', 'Ounces', 'Quarts', 'Pints'],
    Quarts: ['Gallons', 'Liters', 'Cups', 'Milliliters', 'Ounces', 'Pints'],
    Liters: ['Gallons', 'Quarts', 'Cups', 'Milliliters', 'Ounces', 'Pints'],
    Milliliters: ['Gallons', 'Quarts', 'Cups', 'Ounces', 'Liters', 'Tablespoons', 'Teaspoons', 'Pints'],
    Cups: ['Ounces', 'Tablespoons', 'Teaspoons', 'Grams', 'Liters', 'Milliliters', 'Gallons', 'Quarts', 'Pints'],
    Tablespoons: ['Ounces', 'Teaspoons', 'Grams', 'Cups', 'Liters', 'Milliliters', 'Pints'],
    Teaspoons: ['Ounces', 'Tablespoons', 'Grams', 'Cups', 'Liters', 'Milliliters', 'Pints'],
    Ounces: ['Grams', 'Cups', 'Tablespoons', 'Teaspoons', 'Pounds', 'Kilograms', 'Liters', 'Milliliters', 'Gallons', 'Quarts', 'Pints'],
    Grams: ['Ounces', 'Cups', 'Tablespoons', 'Teaspoons', 'Kilograms', 'Pounds', 'Liters', 'Milliliters', 'Gallons', 'Quarts', 'Pints'],
    Pounds: ['Kilograms', 'Grams', 'Ounces'],
    Kilograms: ['Pounds', 'Grams', 'Ounces'],
    Pints: ['Cups', 'Quarts', 'Gallons', 'Liters', 'Milliliters']
  },
  length: {
    Inches: ['Centimeters', 'Yards', 'Feet', 'Millimeters', 'Meters'],
    Feet: ['Meters', 'Yards', 'Inches', 'Miles', 'Millimeters', 'Centimeters'],
    Yards: ['Meters', 'Feet', 'Inches', 'Miles', 'Millimeters', 'Centimeters'],
    Miles: ['Kilometers', 'Yards', 'Feet', 'Centimeters', 'Meters'],
    Millimeters: ['Centimeters', 'Yards', 'Feet', 'Inches', 'Meters'],
    Centimeters: ['Inches', 'Millimeters', 'Meters', 'Feet', 'Yards'],
    Meters: ['Centimeters', 'Millimeters', 'Yards', 'Feet', 'Inches', 'Miles'],
    Kilometers: ['Miles', 'MPH', 'Knots', 'Centimeters', 'Meters']
  },
  area: {
    'Square Inches': ['Square Feet', 'Square Yards', 'Square Meters', 'Acres'],
    'Square Feet': ['Square Inches', 'Square Yards', 'Square Meters', 'Acres'],
    'Square Yards': ['Square Inches', 'Square Feet', 'Square Meters', 'Acres'],
    'Square Meters': ['Square Inches', 'Square Feet', 'Square Yards', 'Acres', 'Hectares'],
    Acres: ['Square Feet', 'Square Yards', 'Square Meters', 'Hectares'],
    Hectares: ['Square Meters', 'Acres']
  },
  speed: {
    MPH: ['Knots', 'Kilometers', 'Meters per second'],
    'Meters per second': ['MPH', 'Kilometers', 'Knots'],
    Knots: ['MPH', 'Kilometers', 'Meters per second']
  },
  time: {
    Seconds: ['Hours', 'Minutes', 'Milliseconds', 'Days'],
    Minutes: ['Hours', 'Seconds', 'Milliseconds', 'Days'],
    Hours: ['Minutes', 'Seconds', 'Milliseconds', 'Days'],
    Days: ['Hours', 'Minutes', 'Seconds'],
    Milliseconds: ['Hours', 'Minutes', 'Seconds']
  },
  pressure: {
    Pascals: ['Bar', 'PSI', 'Atmospheres'],
    Bar: ['Pascals', 'PSI', 'Atmospheres'],
    PSI: ['Pascals', 'Bar', 'Atmospheres'],
    Atmospheres: ['Pascals', 'Bar', 'PSI']
  },
  energy: {
    Joules: ['Calories', 'Kilowatt-hours', 'BTU'],
    Calories: ['Joules', 'Kilowatt-hours', 'BTU'],
    'Kilowatt-hours': ['Joules', 'Calories', 'BTU'],
    BTU: ['Joules', 'Calories', 'Kilowatt-hours']
  },
  data: {
    Bytes: ['Kilobytes', 'Megabytes', 'Gigabytes'],
    Kilobytes: ['Bytes', 'Megabytes', 'Gigabytes'],
    Megabytes: ['Bytes', 'Kilobytes', 'Gigabytes'],
    Gigabytes: ['Bytes', 'Kilobytes', 'Megabytes']
  },
  frequency: {
    Hertz: ['Kilohertz', 'Megahertz'],
    Kilohertz: ['Hertz', 'Megahertz'],
    Megahertz: ['Hertz', 'Kilohertz']
  },
  ocean: {
    Kilometers: ['Knots', 'MPH'],
    MPH: ['Knots', 'Kilometers'],
    Knots: ['MPH', 'Kilometers'],
    Degrees: ['Direction'],
    Direction: ['Degrees']
  }
};

const directions = Object.keys(directionObject);

// --- Conversion Functions ---
// ...existing code...
const conversionFactors = {
  // --- Temperature ---
  Celsius: (value, toUnit) => {
    if (toUnit === 'Fahrenheit') return (value * 9 / 5) + 32;
    if (toUnit === 'Kelvin') return value + 273.15;
    return value;
  },
  Fahrenheit: (value, toUnit) => {
    if (toUnit === 'Celsius') return (value - 32) * 5 / 9;
    if (toUnit === 'Kelvin') return ((value - 32) * 5 / 9) + 273.15;
    return value;
  },
  Kelvin: (value, toUnit) => {
    if (toUnit === 'Celsius') return value - 273.15;
    if (toUnit === 'Fahrenheit') return ((value - 273.15) * 9 / 5) + 32;
    return value;
  },

  // --- Currency (example rates, update as needed) ---
  Pesos: (value, toUnit) => {
    if (toUnit === 'Dollars') return value / 20;
    if (toUnit === 'Euros') return value / 21.5;
    if (toUnit === 'Yen') return value * 7.2;
    if (toUnit === 'Pounds') return value / 25;
    return value;
  },
  Dollars: (value, toUnit) => {
    if (toUnit === 'Pesos') return value * 20;
    if (toUnit === 'Euros') return value * 0.93;
    if (toUnit === 'Yen') return value * 155;
    if (toUnit === 'Pounds') return value * 0.79;
    return value;
  },
  Euros: (value, toUnit) => {
    if (toUnit === 'Dollars') return value * 1.08;
    if (toUnit === 'Pesos') return value * 21.5;
    if (toUnit === 'Yen') return value * 167;
    if (toUnit === 'Pounds') return value * 0.85;
    return value;
  },
  Yen: (value, toUnit) => {
    if (toUnit === 'Dollars') return value / 155;
    if (toUnit === 'Euros') return value / 167;
    if (toUnit === 'Pesos') return value / 7.2;
    if (toUnit === 'Pounds') return value / 196;
    return value;
  },
  'Pounds Sterling': (value, toUnit) => {
    if (toUnit === 'Dollars') return value / 0.79;
    if (toUnit === 'Euros') return value / 0.85;
    if (toUnit === 'Pesos') return value * 25;
    if (toUnit === 'Yen') return value * 196;
    return value;
  },

  // --- Volume ---
  Gallons: (value, toUnit) => {
    if (toUnit === 'Liters') return value * 3.78541;
    if (toUnit === 'Cups') return value * 16;
    if (toUnit === 'Milliliters') return value * 3785.41;
    if (toUnit === 'Ounces') return value * 128;
    if (toUnit === 'Quarts') return value * 4;
    if (toUnit === 'Pints') return value * 8;
    return value;
  },
  Quarts: (value, toUnit) => {
    if (toUnit === 'Gallons') return value / 4;
    if (toUnit === 'Liters') return value * 0.946353;
    if (toUnit === 'Cups') return value * 4;
    if (toUnit === 'Milliliters') return value * 946.353;
    if (toUnit === 'Ounces') return value * 32;
    if (toUnit === 'Pints') return value * 2;
    return value;
  },
  Liters: (value, toUnit) => {
    if (toUnit === 'Gallons') return value / 3.78541;
    if (toUnit === 'Quarts') return value / 0.946353;
    if (toUnit === 'Cups') return value * 4.22675;
    if (toUnit === 'Milliliters') return value * 1000;
    if (toUnit === 'Ounces') return value * 33.814;
    if (toUnit === 'Pints') return value * 2.11338;
    return value;
  },
  Milliliters: (value, toUnit) => {
    if (toUnit === 'Gallons') return value / 3785.41;
    if (toUnit === 'Quarts') return value / 946.353;
    if (toUnit === 'Liters') return value / 1000;
    if (toUnit === 'Cups') return value / 236.588;
    if (toUnit === 'Ounces') return value / 29.5735;
    if (toUnit === 'Tablespoons') return value / 14.787;
    if (toUnit === 'Teaspoons') return value / 4.929;
    if (toUnit === 'Pints') return value / 473.176;
    return value;
  },
  Cups: (value, toUnit) => {
    if (toUnit === 'Gallons') return value / 16;
    if (toUnit === 'Quarts') return value / 4;
    if (toUnit === 'Liters') return value / 4.22675;
    if (toUnit === 'Milliliters') return value * 236.588;
    if (toUnit === 'Ounces') return value * 8;
    if (toUnit === 'Tablespoons') return value * 16;
    if (toUnit === 'Teaspoons') return value * 48;
    if (toUnit === 'Grams') return value * 240;
    if (toUnit === 'Pints') return value / 2;
    return value;
  },
  Tablespoons: (value, toUnit) => {
    if (toUnit === 'Cups') return value / 16;
    if (toUnit === 'Liters') return value / 67.628;
    if (toUnit === 'Milliliters') return value * 14.787;
    if (toUnit === 'Ounces') return value / 2;
    if (toUnit === 'Teaspoons') return value * 3;
    if (toUnit === 'Grams') return value * 15;
    if (toUnit === 'Pints') return value / 32;
    return value;
  },
  Teaspoons: (value, toUnit) => {
    if (toUnit === 'Cups') return value / 48;
    if (toUnit === 'Liters') return value / 202.884;
    if (toUnit === 'Milliliters') return value * 4.929;
    if (toUnit === 'Ounces') return value / 6;
    if (toUnit === 'Tablespoons') return value / 3;
    if (toUnit === 'Grams') return value * 5;
    if (toUnit === 'Pints') return value / 96;
    return value;
  },
  Ounces: (value, toUnit) => {
    if (toUnit === 'Gallons') return value / 128;
    if (toUnit === 'Quarts') return value / 32;
    if (toUnit === 'Liters') return value / 33.814;
    if (toUnit === 'Milliliters') return value * 29.5735;
    if (toUnit === 'Cups') return value / 8;
    if (toUnit === 'Tablespoons') return value * 2;
    if (toUnit === 'Teaspoons') return value * 6;
    if (toUnit === 'Grams') return value * 28.3495;
    if (toUnit === 'Pounds') return value / 16;
    if (toUnit === 'Kilograms') return value / 35.274;
    if (toUnit === 'Pints') return value / 16;
    return value;
  },
  Grams: (value, toUnit) => {
    if (toUnit === 'Ounces') return value / 28.3495;
    if (toUnit === 'Cups') return value / 240;
    if (toUnit === 'Tablespoons') return value / 15;
    if (toUnit === 'Teaspoons') return value / 5;
    if (toUnit === 'Kilograms') return value / 1000;
    if (toUnit === 'Pounds') return value / 453.592;
    if (toUnit === 'Liters') return value / 1000;
    if (toUnit === 'Milliliters') return value;
    if (toUnit === 'Gallons') return value / 3785.41;
    if (toUnit === 'Quarts') return value / 946.353;
    if (toUnit === 'Pints') return value / 473.176;
    return value;
  },
  Pounds: (value, toUnit) => {
    if (toUnit === 'Kilograms') return value * 0.453592;
    if (toUnit === 'Grams') return value * 453.592;
    if (toUnit === 'Ounces') return value * 16;
    return value;
  },
  Kilograms: (value, toUnit) => {
    if (toUnit === 'Pounds') return value / 0.453592;
    if (toUnit === 'Grams') return value * 1000;
    if (toUnit === 'Ounces') return value * 35.274;
    return value;
  },
  Pints: (value, toUnit) => {
    if (toUnit === 'Cups') return value * 2;
    if (toUnit === 'Quarts') return value / 2;
    if (toUnit === 'Gallons') return value / 8;
    if (toUnit === 'Liters') return value * 0.473176;
    if (toUnit === 'Milliliters') return value * 473.176;
    return value;
  },

  // --- Length ---
  Inches: (value, toUnit) => {
    if (toUnit === 'Centimeters') return value * 2.54;
    if (toUnit === 'Yards') return value / 36;
    if (toUnit === 'Feet') return value / 12;
    if (toUnit === 'Millimeters') return value * 25.4;
    if (toUnit === 'Meters') return value * 0.0254;
    return value;
  },
  Feet: (value, toUnit) => {
    if (toUnit === 'Meters') return value * 0.3048;
    if (toUnit === 'Yards') return value / 3;
    if (toUnit === 'Inches') return value * 12;
    if (toUnit === 'Miles') return value / 5280;
    if (toUnit === 'Millimeters') return value * 304.8;
    if (toUnit === 'Centimeters') return value * 30.48;
    return value;
  },
  Yards: (value, toUnit) => {
    if (toUnit === 'Meters') return value * 0.9144;
    if (toUnit === 'Feet') return value * 3;
    if (toUnit === 'Inches') return value * 36;
    if (toUnit === 'Miles') return value / 1760;
    if (toUnit === 'Millimeters') return value * 914.4;
    if (toUnit === 'Centimeters') return value * 91.44;
    return value;
  },
  Miles: (value, toUnit) => {
    if (toUnit === 'Kilometers') return value * 1.60934;
    if (toUnit === 'Yards') return value * 1760;
    if (toUnit === 'Feet') return value * 5280;
    if (toUnit === 'Centimeters') return value * 160934;
    if (toUnit === 'Meters') return value * 1609.34;
    return value;
  },
  Millimeters: (value, toUnit) => {
    if (toUnit === 'Centimeters') return value / 10;
    if (toUnit === 'Yards') return value / 914.4;
    if (toUnit === 'Feet') return value / 304.8;
    if (toUnit === 'Inches') return value / 25.4;
    if (toUnit === 'Meters') return value / 1000;
    return value;
  },
  Centimeters: (value, toUnit) => {
    if (toUnit === 'Inches') return value / 2.54;
    if (toUnit === 'Millimeters') return value * 10;
    if (toUnit === 'Meters') return value / 100;
    if (toUnit === 'Feet') return value / 30.48;
    if (toUnit === 'Yards') return value / 91.44;
    return value;
  },
  Meters: (value, toUnit) => {
    if (toUnit === 'Centimeters') return value * 100;
    if (toUnit === 'Millimeters') return value * 1000;
    if (toUnit === 'Yards') return value / 0.9144;
    if (toUnit === 'Feet') return value * 3.28084;
    if (toUnit === 'Inches') return value * 39.3701;
    if (toUnit === 'Miles') return value / 1609.34;
    return value;
  },
  Kilometers: (value, toUnit) => {
    if (toUnit === 'Miles') return value / 1.60934;
    if (toUnit === 'MPH') return value / 1.60934;
    if (toUnit === 'Knots') return value / 1.852;
    if (toUnit === 'Centimeters') return value * 100000;
    if (toUnit === 'Meters') return value * 1000;
    return value;
  },

  // --- Area ---
  'Square Inches': (value, toUnit) => {
    if (toUnit === 'Square Feet') return value / 144;
    if (toUnit === 'Square Yards') return value / 1296;
    if (toUnit === 'Square Meters') return value * 0.00064516;
    if (toUnit === 'Acres') return value * 1.5942e-7;
    return value;
  },
  'Square Feet': (value, toUnit) => {
    if (toUnit === 'Square Inches') return value * 144;
    if (toUnit === 'Square Yards') return value / 9;
    if (toUnit === 'Square Meters') return value * 0.092903;
    if (toUnit === 'Acres') return value / 43560;
    return value;
  },
  'Square Yards': (value, toUnit) => {
    if (toUnit === 'Square Inches') return value * 1296;
    if (toUnit === 'Square Feet') return value * 9;
    if (toUnit === 'Square Meters') return value * 0.836127;
    if (toUnit === 'Acres') return value / 4840;
    return value;
  },
  'Square Meters': (value, toUnit) => {
    if (toUnit === 'Square Inches') return value / 0.00064516;
    if (toUnit === 'Square Feet') return value / 0.092903;
    if (toUnit === 'Square Yards') return value / 0.836127;
    if (toUnit === 'Acres') return value / 4046.86;
    if (toUnit === 'Hectares') return value / 10000;
    return value;
  },
  Acres: (value, toUnit) => {
    if (toUnit === 'Square Feet') return value * 43560;
    if (toUnit === 'Square Yards') return value * 4840;
    if (toUnit === 'Square Meters') return value * 4046.86;
    if (toUnit === 'Hectares') return value * 0.404686;
    return value;
  },
  Hectares: (value, toUnit) => {
    if (toUnit === 'Square Meters') return value * 10000;
    if (toUnit === 'Acres') return value / 0.404686;
    return value;
  },

  // --- Speed ---
  MPH: (value, toUnit) => {
    if (toUnit === 'Knots') return value * 0.868976;
    if (toUnit === 'Kilometers') return value * 1.60934;
    if (toUnit === 'Meters per second') return value * 0.44704;
    return value;
  },
  'Meters per second': (value, toUnit) => {
    if (toUnit === 'MPH') return value / 0.44704;
    if (toUnit === 'Kilometers') return value * 3.6;
    if (toUnit === 'Knots') return value * 1.94384;
    return value;
  },
  Knots: (value, toUnit) => {
    if (toUnit === 'MPH') return value / 0.868976;
    if (toUnit === 'Kilometers') return value * 1.852;
    if (toUnit === 'Meters per second') return value / 1.94384;
    return value;
  },

  // --- Time ---
  Seconds: (value, toUnit) => {
    if (toUnit === 'Hours') return value / 3600;
    if (toUnit === 'Minutes') return value / 60;
    if (toUnit === 'Milliseconds') return value * 1000;
    if (toUnit === 'Days') return value / 86400;
    return value;
  },
  Minutes: (value, toUnit) => {
    if (toUnit === 'Hours') return value / 60;
    if (toUnit === 'Seconds') return value * 60;
    if (toUnit === 'Milliseconds') return value * 60000;
    if (toUnit === 'Days') return value / 1440;
    return value;
  },
  Hours: (value, toUnit) => {
    if (toUnit === 'Minutes') return value * 60;
    if (toUnit === 'Seconds') return value * 3600;
    if (toUnit === 'Milliseconds') return value * 3600000;
    if (toUnit === 'Days') return value / 24;
    return value;
  },
  Days: (value, toUnit) => {
    if (toUnit === 'Hours') return value * 24;
    if (toUnit === 'Minutes') return value * 1440;
    if (toUnit === 'Seconds') return value * 86400;
    return value;
  },
  Milliseconds: (value, toUnit) => {
    if (toUnit === 'Hours') return value / 3600000;
    if (toUnit === 'Minutes') return value / 60000;
    if (toUnit === 'Seconds') return value / 1000;
    return value;
  },

  // --- Pressure ---
  Pascals: (value, toUnit) => {
    if (toUnit === 'Bar') return value / 100000;
    if (toUnit === 'PSI') return value / 6894.76;
    if (toUnit === 'Atmospheres') return value / 101325;
    return value;
  },
  Bar: (value, toUnit) => {
    if (toUnit === 'Pascals') return value * 100000;
    if (toUnit === 'PSI') return value * 14.5038;
    if (toUnit === 'Atmospheres') return value / 1.01325;
    return value;
  },
  PSI: (value, toUnit) => {
    if (toUnit === 'Pascals') return value * 6894.76;
    if (toUnit === 'Bar') return value / 14.5038;
    if (toUnit === 'Atmospheres') return value / 14.6959;
    return value;
  },
  Atmospheres: (value, toUnit) => {
    if (toUnit === 'Pascals') return value * 101325;
    if (toUnit === 'Bar') return value * 1.01325;
    if (toUnit === 'PSI') return value * 14.6959;
    return value;
  },

  // --- Energy ---
  Joules: (value, toUnit) => {
    if (toUnit === 'Calories') return value / 4.184;
    if (toUnit === 'Kilowatt-hours') return value / 3.6e6;
    if (toUnit === 'BTU') return value / 1055.06;
    return value;
  },
  Calories: (value, toUnit) => {
    if (toUnit === 'Joules') return value * 4.184;
    if (toUnit === 'Kilowatt-hours') return value * 1.1622e-6;
    if (toUnit === 'BTU') return value / 252.164;
    return value;
  },
  'Kilowatt-hours': (value, toUnit) => {
    if (toUnit === 'Joules') return value * 3.6e6;
    if (toUnit === 'Calories') return value / 1.1622e-6;
    if (toUnit === 'BTU') return value * 3412.14;
    return value;
  },
  BTU: (value, toUnit) => {
    if (toUnit === 'Joules') return value * 1055.06;
    if (toUnit === 'Calories') return value * 252.164;
    if (toUnit === 'Kilowatt-hours') return value / 3412.14;
    return value;
  },

  // --- Data ---
  Bytes: (value, toUnit) => {
    if (toUnit === 'Kilobytes') return value / 1024;
    if (toUnit === 'Megabytes') return value / (1024 * 1024);
    if (toUnit === 'Gigabytes') return value / (1024 * 1024 * 1024);
    return value;
  },
  Kilobytes: (value, toUnit) => {
    if (toUnit === 'Bytes') return value * 1024;
    if (toUnit === 'Megabytes') return value / 1024;
    if (toUnit === 'Gigabytes') return value / (1024 * 1024);
    return value;
  },
  Megabytes: (value, toUnit) => {
    if (toUnit === 'Bytes') return value * 1024 * 1024;
    if (toUnit === 'Kilobytes') return value * 1024;
    if (toUnit === 'Gigabytes') return value / 1024;
    return value;
  },
  Gigabytes: (value, toUnit) => {
    if (toUnit === 'Bytes') return value * 1024 * 1024 * 1024;
    if (toUnit === 'Kilobytes') return value * 1024 * 1024;
    if (toUnit === 'Megabytes') return value * 1024;
    return value;
  },

  // --- Frequency ---
  Hertz: (value, toUnit) => {
    if (toUnit === 'Kilohertz') return value / 1000;
    if (toUnit === 'Megahertz') return value / 1e6;
    return value;
  },
  Kilohertz: (value, toUnit) => {
    if (toUnit === 'Hertz') return value * 1000;
    if (toUnit === 'Megahertz') return value / 1000;
    return value;
  },
  Megahertz: (value, toUnit) => {
    if (toUnit === 'Hertz') return value * 1e6;
    if (toUnit === 'Kilohertz') return value * 1000;
    return value;
  },

  // --- Ocean/Direction ---
  Degrees: (value, toUnit) => {
    if (toUnit === 'Direction') {
      const closest = directions.reduce((prev, curr) =>
        Math.abs(directionObject[curr] - value) < Math.abs(directionObject[prev] - value) ? curr : prev
      );
      return closest;
    }
    return value;
  },
  Direction: (value, toUnit) => {
    if (toUnit === 'Degrees') {
      return directionObject[value] ?? '';
    }
    return value;
  }
};
// ...existing code...

// --- Component ---
const Converter = () => {
  const [category, setCategory] = useState('all');
  const [unit1, setUnit1] = useState(Object.keys(unitObjects['all'])[0]);
  const [unit2, setUnit2] = useState(units[Object.keys(unitObjects['all'])[0]][0]);
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');

  const unit2Options = unitObjects[category]?.[unit1] || [];

  // Update units when category changes
  useEffect(() => {
    const categoryUnits = unitObjects[category] || {};
    const firstUnit = Object.keys(categoryUnits)[0];
    if (!firstUnit) return;
    setUnit1(firstUnit);
    setUnit2(units[firstUnit][0]);
    setValue1('');
    setValue2('');
  }, [category]);

  // Update unit2 when unit1 changes
  useEffect(() => {
    setUnit2(units[unit1][0]);
    setValue1('');
    setValue2('');
  }, [unit1]);

  // Convert value1 to value2
  useEffect(() => {
    if (value1 === '') {
      setValue2('');
      return;
    }
    let v1 = unit1 === 'Direction' ? value1 : parseFloat(value1);
    let result = conversionFactors[unit1](v1, unit2);
    setValue2(
      typeof result === 'number' && !isNaN(result)
        ? result.toFixed(4).replace(/\.?0+$/, '')
        : result
    );
  }, [value1, unit1, unit2]);

  // Convert value2 to value1 (reverse conversion)
  const handleValue2Change = (e) => {
    let newValue = unit2 === 'Direction' ? e.target.value : e.target.value;
    setValue2(newValue);
    let v2 = unit2 === 'Direction' ? newValue : parseFloat(newValue);
    let result = conversionFactors[unit2](v2, unit1);
    setValue1(
      typeof result === 'number' && !isNaN(result)
        ? result.toFixed(4).replace(/\.?0+$/, '')
        : result
    );
  };

  // Input change for value1
  const handleValue1Change = (e) => {
    let newValue = unit1 === 'Direction' ? e.target.value : e.target.value;
    setValue1(newValue);
  };

  return (
    <div className='mt--30'>
      <div className='containerDetail color-yellow bg-lite m-5 p-22 size20 contentLeft'>
        <span className='m-5'>{icons.converter}</span> Converter
      </div>
      <div className='containerDetail ml-5 mr-5 flexContainer bg-lite'>
        <div className='containerDetail m-5 p-20 size20 flex2Column contentRight color-lite'>
          Category:
        </div>
        <select 
          className='containerDetail flex2Column size20 color-lite m-5' 
          value={category} 
          onChange={e => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={getKey(cat)} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className='containerDetail bg-lite m-5'>
        <div className='containerDetail flexContainer bg-lite mb-5'>
          <select className='containerDetail color-lite size20 flex2Column contentRight m-5' value={unit1} onChange={e => setUnit1(e.target.value)}>
            {Object.keys(unitObjects[category]).map((unit) => (
              <option key={getKey(unit)} value={unit}>{unit}</option>
            ))}
          </select>
          <div className='flex2Column pr-10'>
            {(unit1 === 'Degrees')
              ? <input
                  className='containerBox bg-dark width-100-percent'
                  type="number"
                  value={value1}
                  onChange={handleValue1Change}
                />
              : (unit1 === 'Direction')
                ? <select className='containerBox flex2Column width-100-percent' value={value1} onChange={handleValue1Change}>
                  {directions.map((direction) => (
                    <option key={getKey(direction)} value={direction}>{direction}</option>
                  ))}
                </select>
                : <input
                  className='containerBox bg-dark width-100-percent'
                  type="number"
                  value={value1}
                  onChange={handleValue1Change}
                />
            }
          </div>
        </div>
        <div className='containerDetail flexContainer bg-lite'>
          <select className='containerDetail color-lite size20 flex2Column contentRight m-5' value={unit2} onChange={e => setUnit2(e.target.value)}>
            {unit2Options.map((unit) => (
              <option key={getKey(unit)} value={unit}>{unit}</option>
            ))}
          </select>
          <div className='flex2Column pr-10'>
            {(unit2 === 'Degrees')
              ? <input
                  className='containerBox bg-dark width-100-percent'
                  type="number"
                  value={value2}
                  onChange={handleValue2Change}
                />
              : (unit2 === 'Direction')
                ? <select className='containerBox flex2Column width-100-percent' value={value2} onChange={handleValue2Change}>
                  {directions.map((direction) => (
                    <option key={getKey(direction)} value={direction}>{direction}</option>
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