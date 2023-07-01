import React from 'react';

const Fireworks = ({ display, quantity }) => {
  console.log(`Fireworks => display: ${display}, count: ${quantity}`);
  
  const renderFirework = () => {
    const fireworks = [];
    const half = (number) => Math.floor(number / 2);
    const getStyle = (quantity, i) => {
      return {
        '--x': `${(60 * Math.random())-30}vmin`,
        '--speed': `${(10 * Math.random())}s`,
        '--verticalDistance': `${((-50 * Math.random())) * Math.random()}vmin`,
        '--finalSize': `${((150 * Math.random())) * Math.random()}vmin`,
        '--particleSize': `${(i * (5 * Math.random() + 1))}vmin`
      };
    };
    for (let i = 0; i < quantity; i++) {
      fireworks.push(
        <div className="firework" key={i} style={getStyle(quantity, i)}></div>
      );
    }
    return fireworks;
  };

  if (display === 'true') {
    return <div>{renderFirework()}</div>;
  }
  return <div></div>;
};

export default Fireworks;