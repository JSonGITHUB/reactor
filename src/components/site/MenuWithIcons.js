import React, { useState, useEffect } from 'react';
import navItems from './NavItems.js';
// eslint-disable-next-line
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import getKey from '../utils/KeyGenerator.js';
import icons from './icons.js';

const Menu = ({ closeMenu }) => {

    // initialize as empty string for easier filtering
    const [appSearch, setAppSearch] = useState('');

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

    // filter navItems by appSearch (case-insensitive). If appSearch is empty, show all.
    const searchTerm = (appSearch || '').toString().trim().toLowerCase();
    const filteredItems = searchTerm === ''
        ? navItems
        : navItems.filter(item => String(item).toLowerCase().includes(searchTerm));
    const menuItems = filteredItems.map(item => portraitButton(item));

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
        <input
            id='app search'
            name='app search'
            className='containerBox color-lite bg-dark width--10'
            type='text'
            placeholder={'Find an app...'}
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
        />
        {menuItems}
        {/*menu()*/}
    </div>;
}
export default Menu;