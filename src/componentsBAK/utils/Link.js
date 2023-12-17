import React from 'react';
import getKey from './KeyGenerator.js';

const Link = ({label}) => {
    const navClasses = "button greet m-1 mt-5 pl-10 pr-10 pt-10 pb-15 color-yellow r-5 width-110-percent"
    return (
        <a href={`/${label}`} key={getKey(label)} className={navClasses}>
            {label}
        </a>
    );
};

export default Link;