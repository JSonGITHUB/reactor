import React, { useState } from 'react';
import Loader from './Loader.js';
import TextColorizer from '../utils/TextColorizer.js';
import close from '../../assets/images/menuClose.png';
import getKey from '../utils/KeyGenerator.js';
// eslint-disable-next-line
import { Link } from 'react-router-dom';
import { navClassesClosed, navClassesOpen, navClassesClose } from './NavClasses.js';
import { CgMenuGridO } from "react-icons/cg";
import Menu from './Menu.js';
//import GoogleAuth from './GoogleAuth.js';

const Header = ({company, width, isMotionOn, isSignedIn, setSignIn}) => {
    //console.log(`Header => width: ${width}`)
    //console.log(`Header => isSignedIn: ${isSignedIn}`)
    const [menuOpen, setMenuOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const initialize = () => setInitialized(true);
    const goHome = () => window.location.pathname = "/reactor/Home";
    const toggleMenu = () => setMenuOpen(!menuOpen);
    const displayMenu = (event) => {
        toggleMenu();
        initialize();
    }
    const closeMenu = (label) => {
        localStorage.setItem('path', `/${label}`)
        setMenuOpen(false);
    }
    const menuClick = (event) => (event.target.nodeName === "SPAN") ? goHome() : displayMenu();
    const logoButton = (label) => <Link key={getKey("link")} to="Home"><div className="navButton button logoButton">{label}</div></Link>;
    const closeButton = <button className="bg-tinted navButton menuPad" onClick={menuClick}><img src={close} alt="close menu" /></button>;
    const burgerButton = <button className="bg-tinted navButton menuPad mt-2 mb-10 pb-5 pl-10 pr-10 mr-20 r-10" onClick={menuClick}><h2 className='hover'><CgMenuGridO alt="open menu"/></h2></button>;
    const mobileLogo = <TextColorizer class='navBranding mt-7' text={company}/>;
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
    const hamburgerOpen = <div>
                            <div className="flexContainer width-100-percent">
                                <div className="flex3ColumnLeft">{logoButton(mobileLogo)}</div>
                                <div className="flex3Column"></div>
                                <div className="flex3ColumnRight">{getMenuButton}</div>
                            </div>
                            <div className="t-50 lowerBorder scroll width-100-percent bg-black">
                                <Menu closeMenu={closeMenu} />
                            </div>
                        </div>
    const hamburgerClosed = <div>
                                <div className="flexContainer width-100-percent">
                                    <div className="flex3ColumnLeft">{logoButton(mobileLogo)}</div>
                                    <div className="flex3Column centeredContent pb-3"></div>
                                    <div className="flex3ColumnRight">{burgerButton}</div>
                                </div>
                                <div className="t-collapse t-50 lowerBorder width-100-percent scroll bg-black">
                                    <Menu closeMenu={closeMenu}/>
                                </div>
                            </div>
                            
    const hamburgerNav = (menuOpen === true) ? hamburgerOpen : hamburgerClosed;
        
    //console.log(`menuOpen: ${menuOpen}`);
        
    return (
        <div className="App-header">
            <div className={navClasses}>{hamburgerNav}</div>
            <Background />
            <div className="flexContainer header width-100-percent">
                <div className="flex3Column bg-green" />
                <div className="flex3Column bg-yellow"></div>
                <div className="flex3Column bg-red" />
            </div>
            <Branding />
        </div>
    );
}

export default Header;