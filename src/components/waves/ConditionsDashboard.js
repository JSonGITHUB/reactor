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
import ConditionsSelectors from './ConditionsSelectors';
import ConditionsContext from '../context/ConditionsContext';
import { buoysTemplateData } from './buoysTemplateData';
import getDirection from './getDirection';
import { setSwell1 } from './WaveActions';
//import BuoyReadingsChart from './BuoyReadingsChart';
//import MarineDataChart from './MarineDataChart';
import MarineChart from './MarineChart';

const ConditionsDashboard = ({
    tideDisplay,
    conditionsCollapse
}) => {

const {
        status,
        setStatus,
        swellData,
        setTide,
        setWind,
        setWindStatus,
        handleTideCheck,
        handleTideSelection,
        handleWindCheck,
        handleSwellCheck,
        handleSwell1Selection,
        handleSwell2Selection,
        handleSwell1LiveSelection,
        handleSwell2LiveSelection,
        handleSwell1Angle,
        handleSwell2Angle,
        handleSwell1Height,
        handleSwell2Height,
        handleSwell1Interval,
        handleSwell2Interval,
        handleStarSelection,
        handleDistanceSelection,
        pause
    } = useContext(OceanContext);

    const getLocalData = (localItem) => initializeData(localItem, 'false');
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [conditionCollapse, setConditionCollapse] = useState(collapseStateInit('conditionCollapse'));
    const [buoyCollapse, setBuoyCollapse] = useState(collapseStateInit('buoyCollapse'));
    const [buoyData, setBouyData] = useState(buoysTemplateData);
    const [localBuoyCollapse, setLocalBuoyCollapse] = useState(true);
    const [range, setRange] = useState(0.05);
    const localBouyReadings = () => `https://services.surfline.com/kbyg/buoys/bounds?north=${Number(localStorage.getItem('latitude')) - range}&south=${Number(localStorage.getItem('latitude')) + range}&east=${Number(localStorage.getItem('longitude')) + 1}&west=${Number(localStorage.getItem('longitude')) - 1}&accesstoken=407e60413d9466f60c54364020f4e448a1a03f9d`;

    //console.log(`ConditionsDashboard => status: ${JSON.stringify(status, null, 2)}`)
    const time = useCurrentTime();
    
    useEffect(() => {
        localStorage.setItem('conditionCollapse', conditionCollapse);
    }, [conditionCollapse]);
    useEffect(() => {
        localStorage.setItem('buoyCollapse', buoyCollapse);
    }, [buoyCollapse]);
    useEffect(() => {
        const localBuoyData = initializeData('buoyData', buoysTemplateData);
        fetch(localBouyReadings())
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                console.log(`ConditionsDashboard => fetch localBuoyReadings: ${JSON.stringify(data, null, 2)}`);
                setBouyData(data);
                localStorage.setItem('buoyData', JSON.stringify(data));
            })
            .catch(() => {
                setBouyData(localBuoyData);
            });
    }, []);
    useEffect(() => {
        const swells = buoyData.data
                    .slice() // copy array to avoid mutating state
                    .sort((a, b) => {
                        if (b.latestData.peakPeriod !== a.latestData.peakPeriod) {
                            return b.latestData.peakPeriod - a.latestData.peakPeriod;
                        }
                        return b.latestData.height - a.latestData.height;
                    })
                    .slice(0, 5)
        if (swells[0] && swells[0].latestData) {
            handleSwell1Selection(null, null, getDirection(swells[0].latestData.direction));
        }
        if (swells[1] && swells[1].latestData) {
            handleSwell2Selection(null, null, getDirection(swells[1].latestData.direction));
        }
    }, [buoyData]);
    useEffect(() => {
        const localBuoyData = initializeData('buoyData', buoysTemplateData);
        fetch(localBouyReadings())
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                console.log(`ConditionsDashboard => fetch localBuoyReadings: ${JSON.stringify(data, null, 2)}`);
                setBouyData(data);
                localStorage.setItem('buoyData', JSON.stringify(data));
            })
            .catch(() => {
                setBouyData(localBuoyData);
            });
            console.log(`ConditionsDashboard => range: ${range}`);
    }, [range]);

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
            {/*<BuoyReadingsChart lat={localStorage.getItem('latitude')} long={localStorage.getItem('longitude')} />*/}
            {/*<MarineDataChart />*/}
            <MarineChart />

            <div className='containerBox bold color-yellow bg-lite p-20'>
                <CollapseToggleButton
                    title={`🌊 ${buoyData.data[0].latestData.height}ft ${getDirection(buoyData.data[0].latestData.direction)} ${buoyData.data[0].latestData.direction}° ${buoyData.data[0].latestData.peakPeriod}s`}
                    isCollapsed={localBuoyCollapse}
                    setCollapse={setLocalBuoyCollapse}
                    align='left'
                />
            </div>
            {
                (localBuoyCollapse) 
                ? null 
                : <div className='scrollHeight250'>
                {
                    buoyData.data
                    .slice() // copy array to avoid mutating state
                    .sort((a, b) => {
                        if (b.latestData.peakPeriod !== a.latestData.peakPeriod) {
                            return b.latestData.peakPeriod - a.latestData.peakPeriod;
                        }
                        return b.latestData.height - a.latestData.height;
                    })
                    .slice(0, 5).map((buoy, index) => (
                        <div key={index} className='containerBox contentLeft'>
                            <div className='containerDetail bold color-yellow bg-lite pb-10 pt-10'> 
                                🌊  {buoy.name}
                            </div>
                            <div className='flexContainer'>
                                <div className='containerDetail flex4Column'>
                                    {buoy.latestData.height}ft
                                </div>
                                <div className='containerDetail flex4Column contentCenter'>
                                    {getDirection(buoy.latestData.direction)}
                                </div>
                                <div title='set swell' onClick={() => handleSwell1Selection(null, null, getDirection(buoy.latestData.direction))} className='containerDetail flex4Column button'>
                                    {buoy.latestData.direction}°
                                </div>
                                <div className='containerDetail flex4Column'>
                                    {buoy.latestData.peakPeriod}s
                                </div>
                            </div>
                        </div>
                    ))
                }
                <div className='containerBox flexContainer'>
                    <div className='containerDetail flex2Column bg-yellow button p-20 mr-10' onClick={() => setRange(range + .05)}>
                        {icons.plus}
                    </div>
                            <div className='containerDetail flex2Column bg-yellow button p-20' onClick={() => setRange((range - .05) < .05 ? .05 : (range - .05))}>
                        {icons.minus}
                    </div>
                </div>
            </div>
    }
            {(conditionsCollapse) ? null : swellDisplay()}
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
            <ConditionsContext.Provider value={status}>
                <ConditionsSelectors
                    tideDisplay={tideDisplay}
                />
            </ConditionsContext.Provider>
        </div>
    )
}

export default ConditionsDashboard;