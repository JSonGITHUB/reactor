import React from 'react';

const Toggle = props => (
  <div className='width-100-percent mt-20 responsiveTopMargin'>
    <div className="greet color-red p-5">Motion</div>
    <button  className="button-red" onClick={props.setMotion}>
      {props.isMotionOn ? 'ON' : 'OFF'}
    </button>
  </div>
);

export default Toggle;