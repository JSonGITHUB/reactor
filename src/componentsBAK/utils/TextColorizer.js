import React from 'react';
import getKey from '../utils/KeyGenerator.js';

const TextColorizer = props => {
    let colorClass = "";
    const colors = ["color-green", "color-yellow", "color-red"];
    let colorIndex = 0;
    const resetColorIndex = () => {
        colorIndex = 0
        return colorIndex;
    }
    const nextIndex = () => {
        colorIndex++
        return colorIndex;
    }
    const getNextColor = () => (colorIndex >= colors.length-1) ? resetColorIndex() : nextIndex();
    return (
        <div className={props.class}>
            {props.text.split('').map(function(listValue, index){
                colorClass = colors[getNextColor()];
                return <span key={getKey(listValue)} className={colorClass}>{listValue}</span>;
            })}
        </div>
    );
}
export default TextColorizer;