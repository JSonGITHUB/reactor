import React, { useEffect, useState } from 'react';
import Toggle from '../utils/Toggle.js';
import LoginControl from '../utils/LoginControl.js';
import CopyrightText from '../functional/CopyrightText.js';
import js from '../../assets/images/js.png';
import Loader from '../utils/Loader.js';
//import GoogleAuth from './GoogleAuth.js';
import CountrySelector from './CountrySelector.js';

const Footer = ({ isSignedIn, isMotionOn, setMotion, setSignIn, setCountry }) => {
    
    const [signedIn, setSignedIn] = useState(
        isSignedIn !== null ? isSignedIn : false || false
    );
    
    const percent =
        window.innerWidth < 700
        ? 'twentyfivePercent mt--70 mb--70'
        : 'fiftyPercent mt--30 mb--40';
    
        const loaderTag = (
        <div className={percent}>
        <Loader isMotionOn={isMotionOn} />
        </div>
    );

    useEffect(() => {
        console.log(`Footer => useEffect => isSignedIn: ${isSignedIn}`);
        setSignedIn(isSignedIn !== null ? isSignedIn : false);
    }, [isSignedIn]);

    const path = window.location.pathname.toLocaleLowerCase();
    const isPageSurfLog =
        path.includes('surflog') || window.innerHeight < 600 ? true : false;
    const isPageHome =
        path.includes('home') || path === '/reactor' || path === '/reactor/'
        ? true
        : console.log(`path: ${path}`);
    const bottom = isPageSurfLog || !isPageHome ? 'b-collapse' : 'bt-0';
    const footerClasses =
        bottom +
        ' fixed subfooter flexContainer width-100-percent responsive height200';
    console.log(`Footer 2 =>\nisSignedIn: ${isSignedIn}\nsignedIn: ${signedIn}`);
   return (
        <div>
            <div id='footer' className={footerClasses}>
                <div className='flex3Column responsive bg-dkGreen m-1 color-neogreen centeredContent'>
                <CountrySelector setCountry={setCountry} />
                {/*<GoogleAuth isSignedIn={signedIn} setSignIn={setSignIn} />*/}
                </div>
                <div className='flex3Column responsive bg-dkYellow m-1 color-yellow'>
                {loaderTag}
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
