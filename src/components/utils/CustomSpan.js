import React from 'react';

const ColorizedSpan = props => <span className={props.colorClass}>
                                    {props.text}
                                </span>

const CustomSpan = props => {
    const colors = ["color-green", "color-yellow", "color-red"];
    let colorIndex = -1;
    const getNextIndex = () => { 
        colorIndex = colorIndex + 1;
        return colorIndex;
    };
    let output = <ColorizedSpan  colorClass={colors[getNextIndex()]} text={props.text}/>
    return output;
}

export default CustomSpan;