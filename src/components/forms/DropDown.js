import React from 'react';

const DropDown = ({ 
  options, 
  value, 
  onChange, 
  classes
}) => {
  return (
    <select value={value} onChange={onChange} className={`${classes}`}>
      {options.map((option, index) => (
        <option key={index} value={(!option.value)?option:option.value}>
          {(!option.label)?option:option.label}
        </option>
      ))}
    </select>
  );
};

export default DropDown;