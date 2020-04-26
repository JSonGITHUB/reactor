import React from 'react';

export function ColorizedSpan(props) {
    console.log(`ColorizedSpan: ${props.text}`)
    return <span className={props.colorClass}>{props.text}</span>;
}

export default function CustomSpan(props) {
    const colors = ["color-green", "color-yellow", "color-red"];
    let colorIndex = -1;
    const getNextIndex = () => { 
        colorIndex = colorIndex + 1;
        return colorIndex;
    };
    let output = <ColorizedSpan  colorClass={colors[getNextIndex()]} text={props.text}/>
    return output;
}