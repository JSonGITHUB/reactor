import React from 'react';
import '../../assets/css/App.css';

const Dialog = props => {
    const { title, message, children } = props;
    return <FancyBorder color="blue">
            <h1 className="Dialog-title">{title}</h1>
            <p>{message}</p>
            {children} 
        </FancyBorder>
}
const FancyBorder = props => {
    const { children } = props;
    return <React.Fragment>{children}</React.Fragment>
}
export default Dialog;