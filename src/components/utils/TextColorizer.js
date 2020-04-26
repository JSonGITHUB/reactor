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
        return (
            <div className={this.class}>
                {this.text.split('').map(function(listValue, index){
                    yourClassName = colors[index];
                    return <span key={getKey(listValue)} className={yourClassName}>{listValue}</span>;
                })}
            </div>
        );
    }
}

export default TextColorizer;  