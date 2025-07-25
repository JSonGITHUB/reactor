import React from 'react';
import navItems from './NavItems.js';
// eslint-disable-next-line
import { BrowserRouter as Router, Switch, Link, Route} from 'react-router-dom';
import getKey from '../utils/KeyGenerator.js';

const Menu = ({closeMenu}) => {
    const classes = 'button greet p-22 color-yellow r-5 bg-dkGreen m-1 maxWidth400 fl-right glassy';
    const portraitButton = (label) => <Link className="horizontalItem" key={getKey("link")} to={`../${label}`}>
                <div key={getKey(label)} className={classes} onClick={closeMenu}>
                    {label}
                </div>
            </Link>;

    const menuItems = navItems.map((item) => portraitButton(item, closeMenu));
    return menuItems;
}
export default Menu;