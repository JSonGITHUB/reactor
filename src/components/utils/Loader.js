import React from 'react';

import logoRed from '../../assets/images/logoRed.png';
import logoYellow from '../../assets/images/logoYellow.png';
import logoGreen from '../../assets/images/logoGreen.png';
import shakaBlack from '../../assets/images/shakaBlack.png';

class Loader extends React.Component {

    constructor(props) {
        super(props);
        this.isMotionOn = this.props.isMotionOn;
    }
    
    render() {
        let shakaClass = (this.props.isMotionOn === true) ? "shakingShaka shaka" : "shaka";
        shakaClass += " mt-88 absolute";
        const logoClasses = " absolute logo height200 ml--100";
        let logo1Class = (this.props.isMotionOn === true) ? "z3 logo1" : "z3 logo1Stopped";
        logo1Class += logoClasses;
        let logo2Class = (this.props.isMotionOn === true) ? "z2 logo2" : "z2 logo2Stopped";
        logo2Class += logoClasses;
        let logo3Class = (this.props.isMotionOn === true) ? "z1 logo3" : "z1 logo3Stopped";
        logo3Class += logoClasses;
        return (
            <div>
                <div className="ml--28">
                    <img id="shaka" src={shakaBlack} className={shakaClass} alt="js" />
                </div>
                <div className="flexContainer width-100-percent">
                    <div className="flex3Column height200" />
                    <div className="flex3Column height200">
                        <img id="logo1" src={logoRed} className={logo1Class} alt="logoRed" />
                        <img id="logo2" src={logoYellow} className={logo2Class} alt="logoYellow" />
                        <img id="logo3" src={logoGreen} className={logo3Class} alt="logoGreen" />
                    </div>
                    <div className="flex3Column height200" />
                </div>
            </div>
        );
    };
}

export default Loader;