import React, { useState } from 'react';

const Touch = (props) => {
  const [timer, setTimer] = useState(null);
  const [showButtons, setShowButtons] = useState(false);

  const handleTouchStart = () => {
    setTimer(setTimeout(() => setShowButtons(true), 1000));
  };

  const handleTouchEnd = () => {
    clearTimeout(timer);
    setShowButtons(false);
  };
  return (
    <div>
        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <button>EDIT</button>
        </div>
        <div>
            {showButtons && (
                <div>
                <button onClick={props.subtract}>-</button>
                <button onClick={props.add}>+</button>
                </div>
            )}
        </div>
    </div>
  );
};

export default Touch;