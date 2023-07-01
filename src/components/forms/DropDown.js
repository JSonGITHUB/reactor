import React from 'react';

const DropDown = ({ options, value, onChange }) => {
  return (
    <select value={value} onChange={onChange}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default DropDown;