import React from 'react';
import '../../assets/css/App.css';

const Dialog = props => (
    <FancyBorder color="blue">
        <h1 className="Dialog-title">
            {props.title}
        </h1>
        <p>
            {props.message}
        </p>
        {props.children} 
    </FancyBorder>
);

const FancyBorder = props => (
    <div className="p-20">
        {props.children}
    </div>
);

export default Dialog;