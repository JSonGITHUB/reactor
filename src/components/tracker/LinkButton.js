import React from 'react';

const LinkButton = ({label}) => {
    const navClasses = "button greet m-1 mt-5 pl-10 pr-10 pt-10 pb-15 color-yellow r-5 width-110-percent"
    return (
        <a href={`/${label}`} className={navClasses}>
            {label}
        </a>
    );
};

export default LinkButton;