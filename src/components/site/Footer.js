import React from 'react';
import Toggle from '../utils/Toggle.js';
import LoginControl from '../utils/LoginControl.js';
import CopyrightText from '../functional/CopyrightText.js';
import js from '../../assets/images/js.png';
import Loader from '../utils/Loader.js';

const Footer = ({isMotionOn, setMotion}) => {
    
    const percent = (window.innerWidth < 700) ? 'twentyfivePercent mt--70 mb--70' : 'fiftyPercent mt--30 mb--40';      
    const loaderTag = <div className={percent}>
                    <Loader isMotionOn={isMotionOn}/>
                </div>
    const path = window.location.pathname.toLocaleLowerCase();
    const isPageSurfLog = (path.includes('surflog') || window.innerHeight < 600) ? true : false;
    const isPageHome = (path.includes('home') || path === "/reactor" || path === "/reactor/") ? true : console.log(`path: ${path}`);
    const bottom = (isPageSurfLog||!isPageHome) ? 'b-collapse' : 'b-0';
    const footerClasses = bottom + ' fixed subfooter flexContainer width-100-percent responsive height200';
    return (
        <div>
            <div id='footer' className={footerClasses}>
                <div className="flex3Column responsive bg-dkGreen m-1 p-10 color-neogreen">
                    <LoginControl />
                </div>
                <div className="flex3Column responsive bg-dkYellow m-1 color-yellow">
                    {loaderTag}
                    <img className="mb-1" src={js} alt="js" />
                    <CopyrightText />
                </div>
                <div className="flex3Column responsive bg-dkRed m-1 p-10 color-red">
                    <Toggle isMotionOn={isMotionOn} setMotion={setMotion} id='toggle'/>
                </div>
            </div>
            <div className="flexContainer width-100-percent footer fixed">
                <div className="flex3Column bg-green" />
                <div className="flex3Column bg-yellow" />
                <div className="flex3Column bg-red" />
            </div>
        </div>
    );
}

export default Footer;