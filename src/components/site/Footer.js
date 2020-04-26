import React from 'react';
import Toggle from '../utils/Toggle.js';
import LoginControl from '../utils/LoginControl.js';
import CopyrightText from '../functional/CopyrightText.js';
import js from '../../assets/images/js.png';
import Loader from '../utils/Loader.js';

class Footer extends React.Component {

    constructor(props) {
        super(props);
        this.isMotionOn = this.props.isMotionOn; 
        this.setMotion = this.props.setMotion;
    }
    
    render() {
        const percent = (window.innerWidth < 700) ? 'twentyfivePercent mt--70 mb--70' : 'fiftyPercent mt--40 mb--40';      
        const loaderTag = <div className={percent}>
                        <Loader isMotionOn={this.props.isMotionOn}/>
                    </div>
        const path = window.location.pathname.toLocaleLowerCase();
        const isPageSurfLog = (path === '/surflog') ? true : false;
        const bottom = (isPageSurfLog) ? 'b-collapse' : 'b-0';
        const footerClasses = bottom + ' subfooter flexContainer responsive height200';
        return (
            <div>
                <div id='footer' className={footerClasses}>
                    <div className="flex3Column responsive bg-dk-green m-1 p-10 color-neogreen">
                        <LoginControl />
                    </div>
                    <div className="flex3Column responsive bg-dk-yellow m-1 color-yellow">
                        {loaderTag}
                        <img className="mb-1" src={js} alt="js" />
                        <CopyrightText />
                    </div>
                    <div className="flex3Column responsive bg-dk-red m-1 p-10 color-red">
                        <Toggle isMotionOn={this.props.isMotionOn} setMotion={this.props.setMotion} id='toggle'/>
                    </div>
                </div>
                <div className="flexContainer footer">
                    <div className="flex3Column bg-green" />
                    <div className="flex3Column bg-yellow" />
                    <div className="flex3Column bg-red" />
                </div>
            </div>
        );
    };
}

export default Footer;