import React from 'react';
import WaterTemp from './WaterTemp.js';
import AirTemp from './AirTemp.js';
import WindDirection from './WindDirection.js';
import Sunset from './Sunset.js';
import BuoyReport from './BuoyReport.js';
import BuoyData from './BuoyData.js';

const ConditionsDashboard = ({tideDisplay, setWind}) => {

    return (
        <div className='m-10'>
            <div className="r-10 bg-tinted p-10 m-5">
                <div className='bold color-yellow p-10 r-10 bg-tinted'>TIDE</div>
                <div>{tideDisplay('wide')}</div>
            </div>
            <div className="r-10 bg-tinted p-10 m-5">
                <div className='bold color-yellow p-10 r-10 bg-tinted'>WIND</div>
                <WindDirection columns="2" setWind={setWind} height='157px'/>
            </div>
            <div className="flexContainer">
                <div className="flex2Column p-10 r-10 color-lite bg-tinted m-5">
                    {/*getWaterTempIcon*/}
                    <div className="bold color-yellow p-10 r-10 bg-tinted">WATER</div>
                    <WaterTemp/>
                </div>
                <div className="flex2Column p-10 r-10 color-white bg-tinted m-5">
                    {/*getAirTempIcon*/}
                    <div className="bold color-yellow p-10 r-10 bg-tinted">AIR</div>
                    <AirTemp/>
                </div>
            </div>
            <Sunset view='full'/>
            <BuoyReport />
            {/*<BuoyData />*/}
        </div>
    )
}

export default ConditionsDashboard;