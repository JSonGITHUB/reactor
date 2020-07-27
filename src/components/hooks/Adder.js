import React, { useState } from 'react';

export default function Adder(props) {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);
    const label = (props.label) ? props.label : "How many?";
    const unit = (props.unit) ? props.unit : "";
  return (
    <div>
      <p>{label}</p>
      <button onClick={() => setCount(count - 1)}>
        -
      </button>
      <button onClick={() => setCount(count + 1)}>
        +
      </button>
      <p>{count}{unit}</p>
    </div>
  );
}