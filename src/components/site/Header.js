import React, { useState } from 'react';
import Loader from '../utils/Loader.js';
import TextColorizer from '../utils/TextColorizer.js';
import menu from '../../assets/images/menuYellow.png';
import close from '../../assets/images/menuClose.png';
import getKey from '../../utils/KeyGenerator.js';
import {BrowserRouter as Router, Switch, Link, Route} from 'react-router-dom';
import navItems from './NavItems.js';
import { navClassesClosed, navClassesOpen, navClassesClose } from './NavClasses.js';
//import { landscapeButton, portraitButton} from './NavButtons.js';
//import { landscapeButton, portraitButton} from './NavButtons.js';

const Header = ({company, width, isMotionOn}) => {

    const [menuOpen, setMenuOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const isNavButton = (event) => (event.target.nodeName === "BUTTON") ? true : false;
    const showContent = (event) => {
        displayMenu();
    };
    const goHome = () => window.location.pathname = "/reactor/Home";
    
    const displayMenu = (event) => {
        setMenuOpen(!menuOpen);
        setInitialized(true);
    }
    const menuClick = (event) => (event.target.nodeName === "SPAN") ? goHome() : displayMenu();
    const siteNavClick = (event) => (isNavButton(event)) ? (showContent(event)) : menuClick(event);
    const logoButton = (label) => <Link key={getKey("link")} to="Home"><div className="navButton logoButton">{label}</div></Link>;
    const closeButton = <button className="navButton menuPad" onClick={siteNavClick}><img src={close} alt="close menu" /></button>;
    const burgerButton = <button className="navButton menuPad" onClick={siteNavClick}><img src={menu} alt="open menu" /></button>;
    const mobileLogo = <TextColorizer class='navBranding mt-7' text={company}/>;
    const headerLogo = <TextColorizer class='navBranding mt-7' text={company}/>;
    const landscapeButton = (label) => <Link className="fl-left" key={getKey("link")} to={label}>
        <div key={getKey(label)} className="button greet m-1 mt-5 pl-10 pr-10 pt-10 pb-15 color-yellow r-5 width-110-percent" onClick={siteNavClick}>
            {label}
        </div>
    </Link>;
    const portraitButton = (label) => <Link className="noUnderline" key={getKey("link")} to={label}>
            <div key={getKey(label)} className="button greet p-15 color-yellow r-5 bg-dkGreen mr-20 ml-20 mt-1" onClick={siteNavClick}>
                {label}
            </div>
        </Link>;
    const wideNav = (item) => landscapeButton(item, siteNavClick);
    const portraitNav = (item) => <div key={getKey("nav")}>{portraitButton(item, siteNavClick)}</div>;

    const isWideScreen = (width >= 1080) ? true : false;
    const closedClasses = (initialized) ? navClassesClose : navClassesClosed;
    const navClasses = (menuOpen) ? navClassesOpen : closedClasses;
    const getMenuButton = (menuOpen) ? closeButton : burgerButton;
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
    const getNavButton = (item) => (isWideScreen) ? wideNav(item) : portraitNav(item);
    const getMenuItems = () => {
        const menuItems = navItems.map((item) => getNavButton(item));
        return (menuItems);
    }
    const navigation =  <div>
                            {logoButton(headerLogo)}
                            {getMenuItems()}
                        </div>
    const hamburgerOpen = <div>
                            <div className="flexContainer width-100-percent">
                                <div className="flex3ColumnLeft">{logoButton(mobileLogo)}</div>
                                <div className="flex3Column"></div>
                                <div className="flex3ColumnRight">{getMenuButton}</div>
                            </div>
                            <div className="t-0 navigation height100Percent width-100-percent bg-dark">
                                <div className="height50Percent scroll">
                                    {getMenuItems()}
                                </div>
                            </div>
                        </div>
    const hamburgerClosed = <div>
                                <div className="flexContainer width-100-percent">
                                    <div className="flex3ColumnLeft">{logoButton(mobileLogo)}</div>
                                    <div className="flex3Column"></div>
                                    <div className="flex3ColumnRight">{burgerButton}</div>
                                </div>
                            <div className="t-collapse navigation width-100-percent bg-dark">{getMenuItems()}</div>
                        </div>
                            
    const hamburgerNav = (menuOpen === true) ? hamburgerOpen : hamburgerClosed;
    const getNavigation = (isWideScreen) ? navigation : hamburgerNav;
        
    console.log(`menuOpen: ${menuOpen}`);
        
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