import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FullWidthButton = ({ display, height, expandedHeight, label, transitionType }) => {

    const [expanded, setExpanded] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    const toggleExpand = () => {
        setExpanded((prev) => !prev);
        if (expanded) setShowLabel(false);
    };

    const handleTransitionEnd = () => {
        if (expanded) {
            setShowLabel(true);
        }
    };

    useEffect(() => {
        toggleExpand();
        if (display === 'true') {
            setShowLabel(true)
        }
    }, []);

    const transitionClass = `button ${transitionType}`;

    return (
        <div
            className={`fullWidthButton ${transitionClass} ${expanded ? 'expanded' : ''}`}
            onTransitionEnd={handleTransitionEnd}
            style={{
                height: (expanded) ? `${expandedHeight}` : `${height}`,
            }}
        >
            <span className={`label ${showLabel ? 'fade-in' : 'fade-out'}`}>
                {label}
            </span>
        </div>
    );
};

// PropTypes for safety
FullWidthButton.propTypes = {
    height: PropTypes.string,
    expandedHeight: PropTypes.string,
    label: PropTypes.string,
    transitionType: PropTypes.oneOf([
        'ease',
        'ease-in',
        'ease-out',
        'ease-in-out',
        'linear',
        'bounce',
        'bounce-in',
        'bounce-out',
        'bounce-in-out',
    ]),
};

// Default props
FullWidthButton.defaultProps = {
    height: '50',
    extendedHeight: '550',
    label: 'Click Me',
    transitionType: 'ease',
};

export default FullWidthButton;