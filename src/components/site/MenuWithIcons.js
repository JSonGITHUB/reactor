import React, { useState, useEffect } from 'react';
import navItems from './NavItems.js';
// eslint-disable-next-line
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom';
import getKey from '../utils/KeyGenerator.js';
import icons from './icons.js';

const Menu = ({ closeMenu }) => {

    const [maxLabelLength, setMaxLabelLength] = useState(0);

    useEffect(() => {
        const maxLength = Math.max(...navItems.map(label => label.length));
        setMaxLabelLength(maxLength+12);
    }, []);

    useEffect(() => {
        console.log(`maxLabelLength: ${maxLabelLength}`)
    }, [maxLabelLength]);

    const classes = 'button p-22 color-yellow size20';
    const handleScrollChild = (e) => {
        e.stopPropagation();
    };
    const portraitButton = (label) => <Link key={getKey("link")} to={`../${label}`}>
        <div 
            title={`${icons[String(label).toLowerCase()]} ${label}`}
            key={getKey(label)} 
            className={classes} 
            onClick={() => closeMenu(label)}
        >
            <div style={{ width: `${maxLabelLength * 8}px` }} className='label-container ml--15'>
                <span className='containerBox'>{icons[String(label).toLowerCase()]}</span>{label}
            </div>
        </div>
    </Link>;

    const menuItems = navItems.map((item) => portraitButton(item, closeMenu));

    const menu = () => {
        return  <div className='menu'>
                    {navItems.map((label, index) => (
                        <button key={getKey(label)} className='menu-button'>
                            <div style={{ width: `${maxLabelLength * 8}px` }} className='label-container'>
                                <span className='containerBox'>{icons[String(label).toLowerCase()]}</span>{label}
                            </div>
                        </button>
                    ))}
                </div>
    }
    return <div onScroll={handleScrollChild} className='menu scrollHeight550 bg-tintedDark'>
        {menuItems}
        {/*menu()*/}
    </div>;
}
export default Menu;