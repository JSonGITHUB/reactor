import React, { useState, useEffect } from 'react';
import navItems from './NavItems.js';
// eslint-disable-next-line
import getKey from '../utils/KeyGenerator.js';
import icons from './icons.js';

const Menu = ({ closeMenu }) => {

    const [maxLabelLength, setMaxLabelLength] = useState(0);
    const [appSearch, setAppSearch] = useState('');

    useEffect(() => {
        const maxLength = Math.max(...navItems.map(label => label.length));
        setMaxLabelLength(maxLength+12);
    }, []);

    useEffect(() => {
        console.log(`maxLabelLength: ${maxLabelLength}`)
    }, [maxLabelLength]);

    const classes = 'button p-10 color-yellow size20';
    const handleScrollChild = (e) => {
        e.stopPropagation();
    };
    const getApp = (label) => {
        const menus = JSON.parse(localStorage.getItem('menus'));
        const categories = JSON.parse(localStorage.getItem('categories'));
        const newMenus = { ...menus };
        if (newMenus.recent) {
            const MAX_RECENT = 10;
            newMenus.recent = [label, ...newMenus.recent.filter(item => item !== label)].slice(0, MAX_RECENT);
            console.log(`Header => getApp => newMenus: ${JSON.stringify(newMenus, null, 2)}`);
        } else {
            newMenus.recent = [`${label}`];
            const newCategories = [...categories];
            newCategories.push('recent');
            localStorage.setItem('categories', JSON.stringify(newCategories));
        }
        localStorage.setItem('menus', JSON.stringify(newMenus));
        window.location = `/reactor/${label}`
    }
    const portraitButton = (label) => <div
                                            title={`${icons[String(label).toLowerCase()]} ${label}`}
                                            key={getKey('homeLink')}
                                            onClick={() => getApp(label)}
                                        >
                                            <div key={getKey(label)} className={classes}>
                                                <div className='color-yellow mt-25 contentCenter'>
                                                    <div className='size60 m-10'>
                                                        {icons[String(label).toLowerCase()]}
                                                    </div>
                                                    <div className='text-outline-dark'>
                                                        {label}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
    /*
    const portraitButton = (label) => <Link key={getKey(`link${label}`)} to={`../${label}`}>
        <div key={getKey(label)} className={classes} onClick={() => closeMenu(label)}>
            <div style={{ width: `${maxLabelLength * 8}px` }} className=''>
                <span className='containerBox'>{icons[String(label).toLowerCase()]}</span>{label}
            </div>
        </div>
    </Link>;
*/
    //const menuItems = navItems.map((item) => portraitButton(item, closeMenu));
    // filter navItems by appSearch (case-insensitive). If appSearch is empty, show all.
    const searchTerm = (appSearch || '').toString().trim().toLowerCase();
    const filteredItems = searchTerm === ''
        ? navItems
        : navItems.filter(item => String(item).toLowerCase().includes(searchTerm));
    const menuItems = filteredItems.map(item => portraitButton(item));

    return <div onScroll={handleScrollChild} className='scrollHeight550 bg-tintedDark menu pb-100'>
        <input
            id='menu-app-search'
            name='menu-app-search'
            className='containerBox color-lite bg-dark width--10'
            type='text'
            placeholder={'Find an app...'}
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
        />
        {menuItems}
    </div>;
}
export default Menu;