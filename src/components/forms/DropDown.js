import React from 'react';

const DropDown = ({ options, value, onChange }) => {
  return (
    <select value={value} onChange={onChange} className='color-dark p-10 r-5 m-5'>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default DropDown;