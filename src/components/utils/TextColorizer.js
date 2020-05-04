import React from 'react';
import getKey from '../utils/KeyGenerator.js';

class TextColorizer extends React.Component {
    text;
    constructor(props) {
        super(props);
        this.class = this.props.class;
        this.text = this.props.text;
    }

    render() {
        let yourClassName = "";
        const colors = ["color-green", "color-yellow", "color-red"];
        let colorIndex = 0;
        const resetColorIndex = () => {
            colorIndex = 0
            return colorIndex
        }
        const nextIndex = () => {
            colorIndex++
            return colorIndex
        }
        const getNextColor = () => (colorIndex >= colors.length-1) ? resetColorIndex() : nextIndex();
        return (
            <div className={this.class}>
                {this.text.split('').map(function(listValue, index){
                    yourClassName = colors[getNextColor()];
                    return <span key={getKey(listValue)} className={yourClassName}>{listValue}</span>;
                })}
            </div>
        );
    }
}

export default TextColorizer;  