import React, { useState, useEffect, useContext } from 'react';
import WaterTemp from './WaterTemp';
import AirTemp from './AirTemp';
import WindDirection from './WindDirection';
import SunTracker from './SunTracker';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import BuoysDisplay from './BouysDisplay';
import icons from '../site/icons';
import SwellDisplay from './SwellDisplay';
import initializeData from '../utils/InitializeData';
import useCurrentTime from '../utils/useCurrentTime';
import { OceanContext } from '../context/OceanContext';

const ConditionsDashboard = ({
    tideDisplay
}) => {

    const {
        status,
        setStatus,
        setWind
    } = useContext(OceanContext);

    const getLocalData = (localItem) => initializeData(localItem, 'false');
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [conditionCollapse, setConditionCollapse] = useState(collapseStateInit('conditionCollapse'));
    const [buoyCollapse, setBuoyCollapse] = useState(collapseStateInit('buoyCollapse'));
    
    //console.log(`ConditionsDashboard => status: ${JSON.stringify(status, null, 2)}`)
    const time = useCurrentTime();
    
    useEffect(() => {
        localStorage.setItem('conditionCollapse', conditionCollapse);
    }, [conditionCollapse]);
    useEffect(() => {
        localStorage.setItem('buoyCollapse', buoyCollapse);
    }, [buoyCollapse]);

    const windDisplay = () => <WindDirection columns='2' setWind={setWind} height='0px' collapse={conditionCollapse}/>
    const windHeader = () => <div>
            {icons.wind} {status.windDirection} {status.windGusts}
            <span className='size12'>
                mph
            </span> 
            {icons.water}{initializeData('waterTemp', 0)}°
            <span className='size12'>
                F
            </span> 
            {icons.temperature} {initializeData('airTemp', 0)}°
            <span className='size12'>
                F
            </span>
        </div>
    
    const swellDisplay = () => <SwellDisplay
        time={time}
        //status={status}
        //setStatus={setStatus}
    />
    return (
        <div className=''>
            {swellDisplay()}
            {tideDisplay('wide')}
            <div className='containerBox bold color-yellow bg-lite p-20'>
                <CollapseToggleButton
                    title={''}
                    component={windHeader()}
                    isCollapsed={conditionCollapse}
                    setCollapse={setConditionCollapse}
                    align='left'
                />
            </div>
            <div className={`${(conditionCollapse)?' hidden ht-0 mb--5':'containerBox'}`}>
                <div className='flexContainer'>
                    <div className='containerBox flex2Column'>
                        <div className='containerBox bold color-yellow'>
                            WIND {icons.wind}
                        </div>
                        {windDisplay()}
                    </div>
                    <div className='containerBox flex2Column'>
                        <div className='containerBox bold color-yellow'>
                            WATER {icons.water}
                        </div>
                        <WaterTemp
                            setStatus={setStatus}
                        />
                        <div className='containerBox bold color-yellow'>
                            AIR {icons.temperature}
                        </div>
                        <AirTemp/>
                    </div>
                </div>
            </div>
            <SunTracker />
            <div className='containerBox bold color-yellow bg-lite p-20'>
                <CollapseToggleButton
                    title={`${icons.buoys} BUOYS`}
                    isCollapsed={buoyCollapse}
                    setCollapse={setBuoyCollapse}
                    align='left'
                />
            </div>
            {
                (buoyCollapse)
                ? null
                : <BuoysDisplay />
                /*<BuoyReport />*/
                /*<LuecadiaRSS/>*/
            }
        </div>
    )
}

export default ConditionsDashboard;