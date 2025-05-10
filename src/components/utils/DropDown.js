import React, { useState, useEffect, useRef } from 'react';

const DropDown = ({ 
    label, 
    options, 
    selected, 
    onSelectionChange, 
    classes 
}) => {
    const [open, setOpen] = useState(false);
    const toggleOpenStatus = () => setOpen(!open);
    const ref = useRef();
    useEffect(() => {
        const onBodyClick = (event) => {
            if (ref.current.contains(event.target)) {
                return;
            }
            setOpen(false);
        }
        document.body.addEventListener('click', onBodyClick);

        return () => {
            document.body.removeEventListener('click', onBodyClick);
        }

    }, []);
    const list = options.map((option) => {
        if (option.value === selected.value) {
            return null;
        }
        return (
            <div 
                key={option.value} 
                className={`button r-5 p-10 bg-dark white ${classes}`}
                onClick={() => onSelectionChange(option)}
            >
                {option.label}
            </div>
        )
    })
    return (

        <div ref={ref} className={classes}>
            <div 
                onClick={() => toggleOpenStatus()}
                className={`ui selection dropdown ${open ? 'visible active' : ''} ${classes}`}
            >
                <i className="dropdown icon"></i>
                <span className={classes}>{selected.label}</span>
                <div className={`menu ${open ? 'visible transition' : ''} ${classes}`}>
                    {list}
                </div>
            </div>
        </div>
    )
}
export default DropDown;