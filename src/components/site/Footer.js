import React, { useEffect, useState } from 'react';
import Toggle from '../utils/Toggle';
//import LoginControl from '../utils/LoginControl';
import CopyrightText from '../functional/CopyrightText';
import js from '../../assets/images/js.png';
import Loader from './Loader';
//import GoogleAuth from './GoogleAuth.js';
import CountrySelector from './CountrySelector';
import ScrollListener from './ScrollListener'

const Footer = ({ isSignedIn, isMotionOn, setMotion, setSignIn, setCountry }) => {
    
    //const getPath = () => window.location.pathname.toLocaleLowerCase();
   
    const [signedIn, setSignedIn] = useState(false);
    const [display, setDisplay] = useState(false);
    //const [homePage, setHomePage] = useState(false);
    //const [pageBottom, setPageBottom] = useState(false);
    //const [path, setPath] = useState(getPath());

    const percent = () => (window.innerWidth < 700)
        ? 'twentyfivePercent mt--70 mb--70'
        : 'fiftyPercent mt--30 mb--40';
    
    const loaderTag = () => <div className={percent()}>
                                <Loader isMotionOn={isMotionOn} />
                            </div>;

    useEffect(() => {
        console.log(`Footer => useEffect => isSignedIn: ${isSignedIn}`);
        if (isSignedIn === null) setSignedIn(false);
    }, [isSignedIn]);

    /*
    useEffect(() => {

        if (homePage && pageBottom) {
            setDisplay(true);
        } else {
            setDisplay(false);
        }
        
    }, [homePage, pageBottom]);
    */
    const onScrollToBottom = (status) => {
        console.log(`onScrollToBottom => ${status}`)
        setDisplay(status);
    }
    /*
    const isPageHome = () => {
        console.log(`isPageHome => path: ${getPath()}`)
        const homePage = (getPath().includes('home') || getPath() === '/reactor' || getPath() === '/reactor/')
        ? true
        : false;
        return homePage
    }
    const checkScroll = () => {
        
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const totalHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        if (isPageHome()) {

        } else 
        if ((scrollTop + windowHeight >= totalHeight - 10) && ) {
            setDisplay(true);
        } else {
            setDisplay(false);
        }

    };
    window.addEventListener('scroll', checkScroll);
    */
    //const bottom = (!display) ? 'b-collapse' : 'bt-0';
    const bottom = (!display) ? 'b-collapse' : 'b-collapse';
    const footerClasses =
        bottom +
        ' fixed subfooter flexContainer width-100-percent responsive height200';
    console.log(`Footer 2 =>\nisSignedIn: ${isSignedIn}\nsignedIn: ${signedIn}`);
   return (
        <div>
            <ScrollListener onScrollToBottom={onScrollToBottom}/>
            <div id='footer' className={footerClasses}>
                <div className='flex3Column responsive bg-dkGreen m-1 color-neogreen centeredContent'>
                <CountrySelector setCountry={setCountry} />
                {/*<GoogleAuth isSignedIn={signedIn} setSignIn={setSignIn} />*/}
                </div>
                <div className='flex3Column responsive bg-dkYellow m-1 color-yellow'>
                {loaderTag()}
                <img className='mb-1' src={js} alt='js' />
                <CopyrightText />
                </div>
                <div className='flex3Column responsive bg-dkRed m-1 color-red centeredContent'>
                <Toggle isMotionOn={isMotionOn} setMotion={setMotion} id='toggle' />
                </div>
            </div>
            <div className='flexContainer width-100-percent footer fixed'>
                <div className='flex3Column bg-green' />
                <div className='flex3Column bg-yellow' />
                <div className='flex3Column bg-red' />
            </div>
        </div>
    );
};

export default Footer;
