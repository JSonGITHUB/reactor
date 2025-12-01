import React, { useState } from 'react';

export default function Counter() {
  // Declare a new state variable, which we'll call 'count'
  const [count, setCount] = useState(0);
  const onButtonClick = () => {
    setCount(count + 1)
  };
  return (
    <div className='greet white bg-darker r-10 p-10 m-20'>
      <div className='p-10'>You clicked <span className='bold color-neogreen'>{count}</span> times.</div>
      <div className='bg-dark r-10 p-10 m-10'>
        <button 
          title='click me'
          className='m-10 bg-green p-10 r-10' 
          onClick={() => setCount(count + 1)}
        >
          Click me
        </button>
        <button 
          title='click me'
          className='m-10 bg-green p-10 r-10' 
          onClick={onButtonClick}
        >
          Or click me!
        </button>
      </div>
      </div>
  );
}