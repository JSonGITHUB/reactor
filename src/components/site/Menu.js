import React from 'react';
import navItems from './NavItems.js';
// eslint-disable-next-line
import { BrowserRouter as Router, Switch, Link, Route } from 'react-router-dom';
import getKey from '../utils/KeyGenerator.js';

const Menu = ({ closeMenu }) => {
    const classes = 'button greet p-22 color-yellow r-10 bg-lite m-5 bold size20';
    const handleScrollChild = (e) => {
        console.log(`WTF?????`)
        e.stopPropagation();
    };
    const portraitButton = (label) => <Link key={getKey("link")} to={`../${label}`}>
        <div key={getKey(label)} className={classes} onClick={() => closeMenu(label)}>
            {label}
        </div>
    </Link>;

    const menuItems = navItems.map((item) => portraitButton(item, closeMenu));
    return <div onScroll={handleScrollChild} className='scrollHeight550 width-100-percent bg-tintedDark'>{menuItems}</div>;
}
export default Menu;