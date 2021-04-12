    import React, { useState, useEffect, useRef } from 'react';
const DropDown = ({ label, options, selected, onSelectionChange}) => {
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
                className={`button r-5 p-10 bg-dark white`}
                onClick={() => onSelectionChange(option)}
            >
                {option.label}
            </div>
        )
    })
    return (

        <div ref={ref}>
            <div 
                onClick={() => toggleOpenStatus()}
                className={`ui selection dropdown ${open ? 'visible active' : ''}`}
            >
                <i className="dropdown icon"></i>
                <span>{selected.label}</span>
                <div className={`menu ${open ? 'visible transition' : ''}`}>
                    {list}
                </div>
            </div>
        </div>
    )
}
export default DropDown;