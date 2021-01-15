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
                className={`item button pointer r-5 p-10 mr-20 ml-20 bold mb-1 bg-${option.value}`}
                onClick={() => onSelectionChange(option)}
            >
                {option.label}
            </div>
        )
    })
    return (
        <div ref={ref} className='ui form bg-dkGreen p-10 r-5'>
            <div className='field'>
                <label className='label'><span className='color-yellow greet normal'>{label}</span></label>
                <div 
                    onClick={() => toggleOpenStatus()}
                    className={`ui selection dropdown ${open ? 'visible active' : ''}`}
                >
                    <i className="dropdown icon"></i>
                    <div className='text'>{selected.label}</div>
                    <div className={`menu ${open ? 'visible transition' : ''}`}>
                        {list}
                    </div>
                </div>
                
            </div>
        </div>
    )
}
export default DropDown;