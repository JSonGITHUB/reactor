import React from 'react';

const vulgarFractions = {
  '0.250000': '¼',
  '0.500000': '½',
  '0.750000': '¾',
  '0.142857': '⅐', // Approximate value for 1/7
  '0.111111': '⅑', // Approximate value for 1/9
  '0.100000': '⅒',
  '0.333333': '⅓', // Approximate value for 1/3
  '0.666667': '⅔', // Approximate value for 2/3
  '0.200000': '⅕',
  '0.400000': '⅖',
  '0.600000': '⅗',
  '0.800000': '⅘',
  '0.166667': '⅙', // Approximate value for 1/6
  '0.833333': '⅚', // Approximate value for 5/6
  '0.125000': '⅛',
  '0.375000': '⅜',
  '0.625000': '⅝',
  '0.875000': '⅞',
  '¼': '¼',
  '½': '½',
  '¾': '¾',
  '⅐': '⅐', // Approximate value for 1/7
  '⅑': '⅑', // Approximate value for 1/9
  '⅒': '⅒',
  '⅓': '⅓', // Approximate value for 1/3
  '⅔': '⅔', // Approximate value for 2/3
  '⅕': '⅕',
  '⅖': '⅖',
  '⅗': '⅗',
  '⅘': '⅘',
  '⅙': '⅙', // Approximate value for 1/6
  '⅚': '⅚', // Approximate value for 5/6
  '⅛': '⅛',
  '⅜': '⅜',
  '⅝': '⅝',
  '⅞': '⅞',
  '1/4': '¼',
  '1/2': '½',
  '3/4': '¾',
  '1/7': '⅐', // Approximate value for 1/7
  '1/9': '⅑', // Approximate value for 1/9
  '1/10': '⅒',
  '1/3': '⅓', // Approximate value for 1/3
  '2/3': '⅔', // Approximate value for 2/3
  '1/5': '⅕',
  '2/5': '⅖',
  '3/5': '⅗',
  '4/5': '⅘',
  '1/6': '⅙', // Approximate value for 1/6
  '5/6': '⅚', // Approximate value for 5/6
  '1/8': '⅛',
  '3/8': '⅜',
  '5/8': '⅝',
  '7/8': '⅞',
};

const formatValue = (value) => {

  const integerPart = Math.floor(value);
  const fractionalPart = value - integerPart;
  const roundedFractionalPart = (Math.round(fractionalPart * 1000000) / 1000000).toFixed(6);

  if (fractionalPart === 0) {
    return integerPart.toString();
  }

  console.log(`formatValue => roundedFractionalPart: ${roundedFractionalPart}`);

  const vulgarFraction = vulgarFractions[roundedFractionalPart];

  console.log(`formatValue => vulgarFraction: ${vulgarFraction}`); 

  if (integerPart === 0) {
    return vulgarFraction || value.toString();
  } else {
    return `${integerPart} ${vulgarFraction || roundedFractionalPart}`;
  }
};

const VulgarFractions = ({ 
  value 
}) => {
  const displayValue = isNaN(value)
    ? String(value)
    : formatValue(value)

  return (
    <div className='fl-left mr-10'>
      {displayValue}
    </div>
  );
};

export default VulgarFractions;
