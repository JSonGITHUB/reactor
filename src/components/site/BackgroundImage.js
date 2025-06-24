// BackgroundImage.js
import React from 'react';
import Wave from '../../assets/images/JS17_Large_cresting_wave_hyperrealistic_ultra_detailed_hd_Cinem_834c51dd-f856-4596-8e59-3cbbf48bce0d.png';

const BackgroundImage = () => {
    const imageUrl = '../../assets/images/';
    const backgroundStyle = {
        backgroundImage: `url(${imageUrl})`,
    };

    //return <div className="background-image" style={backgroundStyle}></div>;
    return <img 
                className='background-image fixed' 
                alt='select' 
                src={Wave}
            />
};

export default BackgroundImage;