import React from 'react';
import Loader from '../utils/Loader.js';
import TextColorizer from '../utils/TextColorizer.js';
import menu from '../../assets/images/menuYellow.png';
import close from '../../assets/images/menuClose.png';
import getKey from '../utils/KeyGenerator.js';
import {BrowserRouter as Router, Switch, Link, Route} from 'react-router-dom';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            menu: false,
            initialized: false
        };
        this.company = this.props.company;
        this.isMotionOn = this.props.isMotionOn; 
        this.setMotion = this.props.setMotion;
    }
    navClassesClosed = "width-100-percent header mt-2 pointer faded bg-dark";
    navClassesOpen = "width-100-percent header mt-2 pointer fadeInFaded fadedDark bg-dark";
    navClassesClose = "width-100-percent header mt-2 pointer fadeOutFaded faded bg-dark";
    isNavButton = (event) => (event.target.nodeName === "BUTTON") ? true : false;
    showContent = (event) => {
        this.displayMenu();
    };
    goHome = () => window.location.pathname = "/reactor/Home";
    navButton = (label) => <Link key={getKey("link")} to={label}>
                                <button key={getKey(label)} className="navButton buttonPad" onClick={this.siteNavClick}>
                                    {label}
                                </button>
                            </Link>;
    displayMenu = (event) => {
        this.setState({
            menu: !this.state.menu,
            initialized: true
        })
    }
    menuClick = (event) => (event.target.nodeName === "SPAN") ? this.goHome() : this.displayMenu();
    siteNavClick = (event) => (this.isNavButton(event)) ? (this.showContent(event)) : this.menuClick(event);
    logoButton = (label) => <button className="navButton logoButton" onClick={this.siteNavClick}>{label}</button>;
    closeButton = <button className="navButton menuPad" onClick={this.siteNavClick}><img src={close} alt="close menu" /></button>;
    burgerButton = <button className="navButton menuPad" onClick={this.siteNavClick}><img src={menu} alt="open menu" /></button>;
    homepageHeader = <div className="pt-70">
                        <Loader isMotionOn={this.props.isMotionOn}/>
                        <TextColorizer class='bigHeader' text={this.props.company}/>
                    </div>;
    mobileLogo = <TextColorizer class='navBranding mt--4' text={this.props.company}/>;
    headerLogo = <TextColorizer class='navBranding' text={this.props.company}/>;
    navItems = [
        'Home',
        'BowlBuilder',
        'TempConverter',
        'Essay',
        'Reservation',
        'GuestList',
        'SurfLog'
    ];
    wideNav = (item) => this.navButton(item);
    portraitNav = (item) => <div key={getKey("nav")}>{this.navButton(item)}</div>;

    render() {
        const isWideScreen = (this.props.width >= 1080) ? true : false;
        const closedClasses = (this.state.initialized) ? this.navClassesClose : this.navClassesClosed;
        const navClasses = (this.state.menu) ? this.navClassesOpen : closedClasses;
        const getMenuButton = (this.state.menu) ? this.closeButton : this.burgerButton;
        const path = window.location.pathname.toLocaleLowerCase();
        const isHomePage = (path === '/reactor/home' || path === '/reactor/') ? true : false;
        const Branding = () => {
            if (isHomePage === true) { return this.homepageHeader }
            return <div className='mt-88'></div>
        };
        const backgroundClass = (this.props.isMotionOn) ? 'rgb-stripe' : 'rgb-stripeStopped';
        const Background = () => <div className={backgroundClass}></div>;
        const getNavButton = (item) => (isWideScreen) ? this.wideNav(item) : this.portraitNav(item);
        const getMenuItems = () => {
            const menuItems = this.navItems.map((item) => getNavButton(item));
            return (menuItems);
        }
        const navigation =  <div>
                                {this.logoButton(this.headerLogo)}
                                {getMenuItems()}
                            </div>
        const hamburgerOpen = <div className="flexContainer">
                                <div className="flex3ColumnLeft mt-13">{this.logoButton(this.mobileLogo)}</div>
                                <div className="flex3Column"><br/><br/>{getMenuItems()}</div>
                                <div className="flex3ColumnRight">{getMenuButton}</div>
                            </div>
        const hamburgerClosed = <div className="flexContainer">
                            <div className="flex3ColumnLeft m-auto">{this.logoButton(this.mobileLogo)}</div>
                            <div className="flex3Column bg-dark"></div>
                            <div className="flex3ColumnRight m-auto">{this.burgerButton}</div>
                        </div>
                            
        const hamburgerNav = (this.state.menu === true) ? hamburgerOpen : hamburgerClosed;
        const getNavigation = (isWideScreen) ? navigation : hamburgerNav;
        
        return (
            <div className="App-header">
                <Background />
                <div className="flexContainer header">
                    <div className="flex3Column bg-green" />
                    <div className="flex3Column bg-yellow" />
                    <div className="flex3Column bg-red" />
                </div>
                <div className={navClasses}>{getNavigation}</div>
                <Branding />
            </div>
        );
    };
}

export default Header;