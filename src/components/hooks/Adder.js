import React, { useState } from 'react';

export default function Adder(props) {
  // Declare a new state variable, which we'll call "count"
    const [count, setCount] = useState(0);
    let { label, unit } = props;
    return (
        <div>
            <p>
                {label ? label : "How many?"}
            </p>
            <button onClick={() => setCount(count - 1)}>
                -
            </button>
            <button onClick={() => setCount(count + 1)}>
                +
            </button>
            <p>
                {count}{unit ? unit : ""}
            </p>
        </div>
    );
}