import { useState } from 'react';
import close from '../../assets/images/menuClose.png';
import getKey from '../utils/KeyGenerator';
import TextColorizer from '../utils/TextColorizer';
import Loader from './Loader';
// eslint-disable-next-line
import { CgMenuGridO } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import Menu from './Menu';
import { navClassesClose, navClassesClosed, navClassesOpen } from './NavClasses';
import NavItems from './NavItems';
import NavItemsMeta from './NavItemsMeta';
import WordExploder from './WordExploder';
import icons from './icons';

const Header = ({ company, width, isMotionOn, isSignedIn, setSignIn }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const initialize = () => setInitialized(true);
    const [notifications, setNotifications] = useState(NavItems);
    const [notificationCollapse, setNoticationCollapse] = useState(true);
    const goHome = () => window.location.pathname = '/reactor/Home';
    const toggleMenu = () => setMenuOpen(prev => !prev);
    const displayMenu = (event) => {
        toggleMenu();
        initialize();
    }
    const [appSearch, setAppSearch] = useState();
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
                            <h2 className='hamburger'>
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
        <div className='absolute width-100-percent l-0 mt--10 faded'>
            <WordExploder />
        </div>
        <TextColorizer class='bigHeader shadow' text={company} />
    </div>;
    const getKeyByValue = (obj, value) => {
        return Object.keys(obj).find(key => obj[key] === value);
    }
    const getIconKey = (value) => getKeyByValue(icons, value);
    const Branding = () => {
        if (isHomePage === true) { return homepageHeader }
        return <div className='mt-88'></div>
    };
    const backgroundClass = (isMotionOn) ? 'rgb-stripe' : 'rgb-stripeStopped';
    const Background = () => <div className={backgroundClass}></div>;
    const hamburgerOpen = <div className=''>
        <div className='flexContainer width-100-percent'>
            <div className='flex2Column contentLeft'>{logoButton(mobileLogo)}</div>
            <div className='flex2Column contentRight'>
                {getMenuButton}
            </div>
        </div>
        <div className='t-50 mt--65'>
            <Menu closeMenu={closeMenu} />
        </div>
    </div>
    const hamburgerClosed = <div>
        <div className='flexContainer width-100-percent'>
            <div className='flex2Column contentLeft'>
                {logoButton(mobileLogo)}
            </div>
            <div className='flexColumn flexContainer'>
                <div className='flexColumn'>
                    <div
                        className={`color-dark r-5 p-5 button mb-10 mr-30`}
                        title='Share this link'
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                        }}
                    >
                        🔗
                    </div>
                </div>
                <div title='notifications' className='flexColumn button pb-5 centerVertical w-50' onClick={() => setNoticationCollapse(prev => !prev)}>
                    👀
                    <span className='copyright'>
                        {notifications.length}
                    </span>
                </div>
                <div className='flexColumn contentRight'>
                    {burgerButton}
                </div>
            </div>
        </div>
        {
        /* 
            <div className='t-collapse t-50 lowerBorder width-100-percent scroll bg-black'>
                <Menu closeMenu={closeMenu} />
            </div> 
        */
        }
    </div>
    const hamburgerNav = (menuOpen === true) ? hamburgerOpen : hamburgerClosed;
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
    return (
        <div className='App-header'>
            <div className={navClasses}>
                {hamburgerNav}
            </div>
            <Background />
            <div className='flexContainer header width-100-percent'>
                <div className='flex3Column bg-green' />
                <div className='flex3Column bg-yellow'></div>
                <div className='flex3Column bg-red' />
            </div>
            <Branding />
            {
                (notificationCollapse)
                ? null
                    : <div className='t-0 fixed mt-50 containerDetail p-10 mt--20 width--20 flexContainer bg-dark z1 h-scroll'>
                        <input
                            id='app search'
                            name='app search'
                            className='color-lite bg-dark'
                            type='text'
                            placeholder={'Find an app...'}
                            value={typeof appSearch === 'string' ? appSearch : ''}
                            onChange={(e) => setAppSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                }
                            }}
                        />
                        {
                            notifications
                                .filter(notification => {
                                    if (!appSearch) return true;

                                    const lowerSearch = appSearch.toLowerCase();
                                    const categoryTerms = NavItemsMeta[notification] || [];

                                    return categoryTerms.some(term =>
                                        term.toLowerCase().includes(lowerSearch)
                                    );
                                })
                                .map(notification => (
                                    <div
                                        title={notification}
                                        onClick={() => getApp(notification)}
                                        key={getKey(notification)}
                                        className="containerBox flexColumn"
                                    >
                                        {icons[notification.toLowerCase()]}
                                    </div>
                            ))
                        }
                    </div>
            }
        </div>
    );
}

export default Header;