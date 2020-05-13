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
    }
    navClassesClosed = "width-100-percent navigation mt-2 pointer faded bg-dark";
    navClassesOpen = "width-100-percent navigation mt-2 pointer fadeInFaded fadedDark bg-dark";
    navClassesClose = "width-100-percent navigation mt-2 pointer fadeOutFaded faded bg-dark";
    isNavButton = (event) => (event.target.nodeName === "BUTTON") ? true : false;
    showContent = (event) => {
        this.displayMenu();
    };
    goHome = () => window.location.pathname = "/reactor/Home";
    landscapeButton = (label) => <Link className="fl-left" key={getKey("link")} to={label}>
            <div key={getKey(label)} className="button greet m-1 mt-5 pl-10 pr-10 pt-10 pb-15 color-yellow r-5 width-110-percent" onClick={this.siteNavClick}>
                {label}
            </div>
        </Link>;
    portraitButton = (label) => <Link className="noUnderline" key={getKey("link")} to={label}>
            <div key={getKey(label)} className="button greet m-1 p-15 color-yellow r-5 width-100-percent bg-dkGreen" onClick={this.siteNavClick}>
                {label}
            </div>
        </Link>;
    displayMenu = (event) => {
        this.setState({
            menu: !this.state.menu,
            initialized: true
        })
    }
    menuClick = (event) => (event.target.nodeName === "SPAN") ? this.goHome() : this.displayMenu();
    siteNavClick = (event) => (this.isNavButton(event)) ? (this.showContent(event)) : this.menuClick(event);
    logoButton = (label) => <Link key={getKey("link")} to="Home"><div className="navButton logoButton">{label}</div></Link>;
    closeButton = <button className="navButton menuPad" onClick={this.siteNavClick}><img src={close} alt="close menu" /></button>;
    burgerButton = <button className="navButton menuPad" onClick={this.siteNavClick}><img src={menu} alt="open menu" /></button>;
    mobileLogo = <TextColorizer class='navBranding mt-7' text={this.props.company}/>;
    headerLogo = <TextColorizer class='navBranding mt-7' text={this.props.company}/>;
    navItems = [
        'Home',
        'BowlBuilder',
        'TempConverter',
        'Essay',
        'Reservation',
        'GuestList',
        'LogDirectory',
        'SurfLog',
        'Swell'
    ];
    wideNav = (item) => this.landscapeButton(item);
    portraitNav = (item) => <div key={getKey("nav")}>{this.portraitButton(item)}</div>;

    render() {
        const isWideScreen = (this.props.width >= 1080) ? true : false;
        const closedClasses = (this.state.initialized) ? this.navClassesClose : this.navClassesClosed;
        const navClasses = (this.state.menu) ? this.navClassesOpen : closedClasses;
        const getMenuButton = (this.state.menu) ? this.closeButton : this.burgerButton;
        const path = window.location.pathname.toLocaleLowerCase();
        const isHomePage = (path === '/reactor/home' || path === '/reactor/') ? true : false;
        const homepageHeader = <div className="pt-70">
                        <Loader isMotionOn={this.props.isMotionOn}/>
                        <TextColorizer class='bigHeader' text={this.props.company}/>
                    </div>;
        const Branding = () => {
            if (isHomePage === true) { return homepageHeader }
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
        const hamburgerOpen = <div>
                                <div className="flexContainer width-100-percent">
                                    <div className="flex3ColumnLeft">{this.logoButton(this.mobileLogo)}</div>
                                    <div className="flex3Column"></div>
                                    <div className="flex3ColumnRight">{getMenuButton}</div>
                                </div>
                                <div className="t-0 navigation width-100-percent bg-dark pb-200">{getMenuItems()}</div>
                            </div>
        const hamburgerClosed = <div>
                                    <div className="flexContainer width-100-percent">
                                        <div className="flex3ColumnLeft">{this.logoButton(this.mobileLogo)}</div>
                                        <div className="flex3Column"></div>
                                        <div className="flex3ColumnRight">{this.burgerButton}</div>
                                    </div>
                                <div className="t-collapse navigation width-100-percent bg-dark">{getMenuItems()}</div>
                            </div>
                            
        const hamburgerNav = (this.state.menu === true) ? hamburgerOpen : hamburgerClosed;
        const getNavigation = (isWideScreen) ? navigation : hamburgerNav;
        
        console.log(`this.state.menu: ${this.state.menu}`);
        
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
    };
}

export default Header;