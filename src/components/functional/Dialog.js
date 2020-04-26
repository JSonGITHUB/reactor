import React from 'react';
import '../../assets/css/App.css';

export default function Dialog(props) {
    return (
        <FancyBorder color="blue">
            <h1 className="Dialog-title">
                {props.title}
            </h1>
            <p className="Dialog-message">
                {props.message}
            </p>
            {props.children}
        </FancyBorder>
    );
}

export function FancyBorder(props) {
    return (
//        <div className="neumorphism p-20">
    <div className="p-20">
            {props.children}
        </div>
    );
}