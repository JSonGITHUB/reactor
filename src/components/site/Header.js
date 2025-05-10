import React, { useState } from 'react';
import Loader from './Loader';
import TextColorizer from '../utils/TextColorizer';
import close from '../../assets/images/menuClose.png';
import getKey from '../utils/KeyGenerator';
// eslint-disable-next-line
import { Link } from 'react-router-dom';
import { navClassesClosed, navClassesOpen, navClassesClose } from './NavClasses';
import { CgMenuGridO } from 'react-icons/cg';
import Menu from './Menu';

const Header = ({ company, width, isMotionOn, isSignedIn, setSignIn }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const initialize = () => setInitialized(true);
    const goHome = () => window.location.pathname = '/reactor/Home';
    const toggleMenu = () => setMenuOpen(!menuOpen);
    const displayMenu = (event) => {
        toggleMenu();
        initialize();
    }
    const closeMenu = (label) => {
        localStorage.setItem('path', `/${label}`)
        setMenuOpen(false);
    }
    const menuClick = (event) => (event.target.nodeName === 'SPAN') ? goHome() : displayMenu();
    const logoButton = (label) => <Link key={getKey('link')} to='Home'><div className='navButton button logoButton'>{label}</div></Link>;
    const closeButton = <button title='close' className='bg-tinted navButton menuPad' onClick={menuClick}>
                            <img src={close} alt='close menu' />
                        </button>;
    const burgerButton = <button title='open menu' className='bg-tinted navButton menuPad mt-2 mb-10 pb-5 pl-10 pr-10 mr-20 r-10' onClick={menuClick}>
                            <h2 className='hover'>
                                <CgMenuGridO alt='open menu' />
                            </h2>
                        </button>;
    const mobileLogo = <TextColorizer class='navBranding mt-7' text={company} />;
    const closedClasses = (initialized) ? navClassesClose : navClassesClosed;
    const navClasses = (menuOpen) ? navClassesOpen : closedClasses;
    const getMenuButton = (menuOpen) ? closeButton : burgerButton;
    const path = window.location.pathname.toLocaleLowerCase();
    const isHomePage = (path === '/reactor/home') ? true : false;
    const homepageHeader = <div className='mt-70 containerBox waveBackground bg-dark pt-200 width-100-20 animated-background'>
        <div className='o-0'>
            <Loader isMotionOn={isMotionOn} />
        </div>
        <TextColorizer class='bigHeader shadow' text={company} />
    </div>;
    const Branding = () => {
        if (isHomePage === true) { return homepageHeader }
        return <div className='mt-88'></div>
    };
    const backgroundClass = (isMotionOn) ? 'rgb-stripe' : 'rgb-stripeStopped';
    const Background = () => <div className={backgroundClass}></div>;
    const hamburgerOpen = <div className=''>
        <div className='flexContainer width-100-percent'>
            <div className='flex2Column contentLeft'>{logoButton(mobileLogo)}</div>
            <div className='flex2Column contentRight'>{getMenuButton}</div>
        </div>
        <div className='t-50 mt--65'>
            <Menu closeMenu={closeMenu} />
        </div>
    </div>
    const hamburgerClosed = <div>
        <div className='flexContainer width-100-percent'>
            <div className='flex2Column contentLeft'>{logoButton(mobileLogo)}</div>
            <div className='flex2Column contentRight'>{burgerButton}</div>
        </div>
        <div className='t-collapse t-50 lowerBorder width-100-percent scroll bg-black'>
            <Menu closeMenu={closeMenu} />
        </div>
    </div>
    const hamburgerNav = (menuOpen === true) ? hamburgerOpen : hamburgerClosed;
    return (
        <div className='App-header'>
            <div className={navClasses}>{hamburgerNav}</div>
            <Background />
            <div className='flexContainer header width-100-percent'>
                <div className='flex3Column bg-green' />
                <div className='flex3Column bg-yellow'></div>
                <div className='flex3Column bg-red' />
            </div>
            <Branding />
        </div>
    );
}

export default Header;