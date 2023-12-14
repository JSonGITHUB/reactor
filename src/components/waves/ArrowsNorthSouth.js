import React from 'react';

const ArrowsNorthSouth = () => {
  return (
    <div style={{ textAlign: 'center' }} className='mb-40'>
      <svg height="50" width="100">
        <polygon points="50,0 100,50 0,50" fill="blue" />
      </svg>
      <div className='mt--30 mb-10 bold'>NORTH</div>
      <svg height="50" width="100">
        <polygon points="50,50 100,0 0,0" fill="red" />
      </svg>
      <div className='mt--52 bold'>SOUTH</div>
    </div>
  );
};

export default ArrowsNorthSouth;