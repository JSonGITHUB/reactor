import React, { useState } from 'react';
import LinkButton from '../LinkButton.js';
import getKey from '../utils/KeyGenerator.js';

const HamburgerNav = ({ navItems }) => {
    
    const [menuOpen, setMenuOpen] = useState(false);
    const portraitButton = (label) => <LinkButton  label={label} href={label} className="noUnderline" key={getKey("link")}>
            <div key={getKey(label)} className="button greet p-15 color-yellow r-5 bg-dkGreen mr-20 ml-20 mt-1">
                {label}
            </div>
        </LinkButton>;
    const portraitNav = (item) => <div key={getKey("nav")}>{portraitButton(item)}</div>;
    const getMenuItems = () => {
        const menuItems = navItems.map((item) => portraitNav(item));
        return (menuItems);
    }
    
    const hamburgerOpen = <div>
                            <div className="flexContainer width-100-percent">
                                <div className="flex3ColumnLeft">{logoButton(mobileLogo)}</div>
                                <div className="flex3Column"></div>
                                <div className="flex3ColumnRight">{getMenuButton}</div>
                            </div>
                            <div className="t-50 navigation height100Percent width-100-percent bg-dark">
                                <div className="height50Percent scroll">
                                    {getMenuItems()}
                                </div>
                            </div>
                        </div>;
    
    const hamburgerClosed = <div>
                                <div className="flexContainer width-100-percent">
                                    <div className="flex3ColumnLeft">{logoButton(mobileLogo)}</div>
                                    <div className="flex3Column"></div>
                                    <div className="flex3ColumnRight">{burgerButton}</div>
                                </div>
                            <div className="t-collapse navigation width-100-percent bg-dark">{getMenuItems()}</div>
                        </div>;

    return (menuOpen === true) ? hamburgerOpen : hamburgerClosed;
}

export default HamburgerNav;