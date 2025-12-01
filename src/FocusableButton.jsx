// FocusableButton.jsx
import React from 'react';
import { useFocusable } from './useFocusable';

export const FocusableButton = ({ children, onClick, variant = 'primary' }) => {
    const { ref, isFocused } = useFocusable();

    const baseStyle = {
        padding: '14px 18px',
        marginBottom: 12,
        width: '100%',
        textAlign: 'left',
        borderRadius: 10,
        fontSize: 18,
        cursor: 'pointer',
        outline: 'none',
        borderWidth: 2,
        borderStyle: 'solid',
        transition: 'background 150ms ease, box-shadow 150ms ease, transform 100ms ease',
    };

    const palette =
        variant === 'danger'
            ? { bg: '#4b1010', bgFocused: '#7a1919', border: '#ff6b6b' }
            : variant === 'secondary'
                ? { bg: '#1f2933', bgFocused: '#243b53', border: '#7b8794' }
                : { bg: '#1f2933', bgFocused: '#355c7d', border: '#5ccfe6' };

    const style = {
        ...baseStyle,
        backgroundColor: isFocused ? palette.bgFocused : palette.bg,
        color: '#f9fafb',
        borderColor: isFocused ? palette.border : '#4b5563',
        boxShadow: isFocused
            ? '0 0 0 3px rgba(92,207,230,0.6), 0 10px 18px rgba(0,0,0,0.35)'
            : '0 4px 10px rgba(0,0,0,0.25)',
        transform: isFocused ? 'translateY(-1px)' : 'translateY(0)',
    };

    return (
        <button
            ref={ref}
            data-focusable="true"
            type="button"
            style={style}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
