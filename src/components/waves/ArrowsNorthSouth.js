import React from 'react';

const ArrowsNorthSouth = ({
  north,
  south
}) => {
  return (
    <div style={{ textAlign: 'center' }} className='mb-20 color-yellow'>
      <svg height='50' width='400'>
        <polygon points='200,0 400,50 0,50' fill='blue' />
      </svg>
      <div className='mt--45 bold'>{north}</div>
      <div className='bold'>
        {`NORTH`}
      </div>
      <svg height='55' width='400'>
        <polygon points='200,55 400,5 0,5' fill='red' />
      </svg>
      <div className='mt--48 bold'>
        {`SOUTH`}
      </div>
      <div className='bold'>
        {south}
      </div>
    </div>
  );
};

export default ArrowsNorthSouth;