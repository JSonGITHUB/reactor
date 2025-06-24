import React, { useState, useEffect } from 'react';

const GPSStatus = () => {
    
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialized(true), 5000); // Simulate 5s GPS initialization
        return () => clearTimeout(timer); // Cleanup timer on component unmount
    }, []);

    return (
        <div className='containerDetail columnCenterAlign'>
            <div className={`gps-circle ${isInitialized ? 'success' : 'pulsing'}`}>
                {!isInitialized && <p className='gps-text'>Initializing GPS...</p>}
                {isInitialized && <p className='gps-text'>GPS Initialized</p>}
            </div>
        </div>
    );
};

export default GPSStatus;