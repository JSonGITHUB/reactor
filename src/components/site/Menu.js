import React, { useState, useEffect } from 'react';
import navItems from './NavItems.js';
// eslint-disable-next-line
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

    const classes = 'button p-10 color-yellow size20';
    const handleScrollChild = (e) => {
        e.stopPropagation();
    };
    const portraitButton = (label) => <div
                                            title={`${icons[String(label).toLowerCase()]} ${label}`}
                                            key={getKey('homeLink')}
                                            onClick={() => window.location = `/reactor/${label}`}
                                        >
                                            <div key={getKey(label)} className={classes}>
                                                <div className='flexContainer color-yellow mt-25 contentCenter'>
                                                    <div className='size30 m-10'>
                                                        {icons[String(label).toLowerCase()]}
                                                    </div>
                                                    <div>
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
    const menuItems = navItems.map((item) => portraitButton(item, closeMenu));

    const menu = () => {
        return  <div >
                    {navItems.map((label, index) => (
                        <button key={getKey(label)} className='menu-button containerBox button'>
                            <div style={{ width: `${maxLabelLength * 8}px` }} className='label-container'>
                                <span className='containerBox'>
                                    {icons[String(label).toLowerCase()]}
                                </span>
                                {label}
                            </div>
                        </button>
                    ))}
                </div>
    }
    return <div onScroll={handleScrollChild} className='scrollHeight550 bg-tintedDark menu pb-100'>
        {menuItems}
        {/*menu()*/}
    </div>;
}
export default Menu;