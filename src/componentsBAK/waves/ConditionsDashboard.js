import React from 'react';
import WaterTemp from './WaterTemp.js';
import AirTemp from './AirTemp.js';
import WindDirection from './WindDirection.js';
import Sunset from './Sunset.js';
import BuoyReport from './BuoyReport.js';

const ConditionsDashboard = ({tideDisplay, setWind}) => {

    return (
        <div className='m-10'>
            <div className="flexContainer">
                <div className="flex2Column p-5 r-10 color-orange glassy m-5">
                    tide<br/>
                    {tideDisplay('wide')}
                </div>
                <div className="flex2Column p-5 r-10 color-yellow glassy m-5">
                    wind
                    <WindDirection columns="2" setWind={setWind} height='157px'/>
                </div>
            </div>
            <div className="flexContainer">
                <span className="flex2Column p-5 r-10 color-blue glassy m-5">
                    {/*getWaterTempIcon*/}
                    <span className="ml-2">water</span><br/>
                    <WaterTemp/>
                </span>
                <span className="flex2Column p-5 r-10 color-white glassy m-5">
                    {/*getAirTempIcon*/}
                    <span className="ml-2">air</span><br/>
                    <AirTemp/>
                </span>
            </div>
            <Sunset />
            <BuoyReport />
        </div>
    )
}

export default ConditionsDashboard;