import React, { useState } from 'react';
import Loader from '../utils/Loader.js';
import TextColorizer from '../utils/TextColorizer.js';
import getKey from '../utils/KeyGenerator.js';
import Link from '../Link.js';
import HamburgerNav from './HamburgerNav';
import navItems from './NavItems.js';

const Header = ({ company, width, isMotionOn }) => {
    // eslint-disable-next-line
    const [menuOpen, setMenuOpen] = useState(false);
    // eslint-disable-next-line
    const [initialized, setInitialized] = useState(false);

    const navClassesClosed = "width-100-percent navigation mt-2 pointer fadedDark bg-dark";
    const navClassesOpen = "width-100-percent navigation mt-2 pointer fadeInFaded fadedDark bg-dark";
    const navClassesClose = "width-100-percent navigation mt-2 pointer fadeOutFaded faded bg-dark";
    const landscapeButton = (label) => <Link label={label} href={label} className="fl-left" key={getKey("link")}></Link>;
    const logoButton = (label) => <div key={getKey("link")} to="Home"><div className="navButton logoButton">{label}</div></div>;
    const headerLogo = <TextColorizer class='navBranding mt-7' text={company}/>;    
    const isWideScreen = (width >= 1080) ? true : false;
    const closedClasses = (initialized) ? navClassesClose : navClassesClosed;
    const navClasses = (menuOpen) ? navClassesOpen : closedClasses;
    const path = window.location.pathname.toLocaleLowerCase();
    const isHomePage = (path === '/reactor/home' || path === '/reactor/') ? true : false;
    const homepageHeader = <div className="pt-70">
                    <Loader isMotionOn={isMotionOn}/>
                    <TextColorizer class='bigHeader' text={company}/>
                </div>;
    const Branding = () => {
        if (isHomePage === true) { return homepageHeader }
        return <div className='mt-88'></div>
    };
    const backgroundClass = (isMotionOn) ? 'rgb-stripe' : 'rgb-stripeStopped';
    const Background = () => <div className={backgroundClass}></div>;
    const getNavButton = (item) => landscapeButton(item);
    const getMenuItems = () => {
        const menuItems = navItems.map((item) => getNavButton(item));
        return (menuItems);
    }
    const navigation =  <div>
                            {logoButton(headerLogo)}
                            {getMenuItems()}
                        </div>
                        
    const hamburgerNav = <HamburgerNav navItems={navItems}></HamburgerNav>;
    const getNavigation = (isWideScreen) ? navigation : hamburgerNav;
    
    console.log(`menu: ${menuOpen}`);
    
    return (
        <div className="App-header">
            <div className={navClasses}>{getNavigation}</div>
            <Background />
            <div className="flexContainer header width-100-percent">
                <div className="flex3Column bg-green" />
                <div className="flex3Column bg-yellow" />
                <div className="flex3Column bg-red" />
            </div>
            <Branding />
        </div>
    );
}

export default Header;