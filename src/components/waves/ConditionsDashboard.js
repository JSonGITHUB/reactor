import { useContext, useEffect, useState } from 'react';
import ConditionsContext from '../context/ConditionsContext';
import { OceanContext } from '../context/OceanContext';
import icons from '../site/icons';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import initializeData from '../utils/InitializeData';
import useCurrentTime from '../utils/useCurrentTime';
import AirTemp from './AirTemp';
import BuoysDisplay from './BuoysDisplay';
import { buoysTemplateData } from './buoysTemplateData';
import ConditionsSelectors from './ConditionsSelectors';
import getDirection from './getDirection';
import SunTracker from './SunTracker';
import SwellDisplay from './SwellDisplay';
import WaterTemp from './WaterTemp';
import WindDirection from './WindDirection';
//import BuoyReadingsChart from './BuoyReadingsChart';
//import MarineDataChart from './MarineDataChart';
//import MarineChart from './MarineChart';

const ConditionsDashboard = ({
    tideDisplay,
    conditionsCollapse
}) => {

const BUOY_FETCH_WARNING_KEY = 'buoyFetchFallbackWarned';

const {
        status,
        setStatus,
        setWind,
        handleSwell1Selection,
        handleSwell2Selection,
    } = useContext(OceanContext);

    const getLocalData = (localItem) => initializeData(localItem, 'false');
    const collapseStateInit = (localItem) => getLocalData(localItem) ? getLocalData(localItem) === 'true' : true;
    const [conditionCollapse, setConditionCollapse] = useState(collapseStateInit('conditionCollapse'));
    const [buoyCollapse, setBuoyCollapse] = useState(collapseStateInit('buoyCollapse'));
    const [buoyData, setBuoyData] = useState(buoysTemplateData);
    const [range] = useState(0.05);
    const SURFLINE_BASE_URL = process.env.REACT_APP_SURFLINE_BASE_URL;
    const SURFLINE_TOKEN = process.env.REACT_APP_SURFLINE_TOKEN;
    const localBuoyReadings = () => `${SURFLINE_BASE_URL}/bounds?north=${Number(localStorage.getItem('latitude')) - range}&south=${Number(localStorage.getItem('latitude')) + range}&east=${Number(localStorage.getItem('longitude')) + 1}&west=${Number(localStorage.getItem('longitude')) - 1}&accesstoken=${SURFLINE_TOKEN}`;
    const getCachedBuoyData = () => initializeData('buoyData', buoysTemplateData);
    const setBuoyDataSafely = (payload) => {
        if (payload && Array.isArray(payload.data)) {
            setBuoyData(payload);
            localStorage.setItem('buoyData', JSON.stringify(payload));
            return true;
        }
        return false;
    };
    const warnBuoyFallbackOnce = () => {
        if (localStorage.getItem(BUOY_FETCH_WARNING_KEY) === 'true') return;
        localStorage.setItem(BUOY_FETCH_WARNING_KEY, 'true');
        console.warn('ConditionsDashboard => Using cached buoy data due to fetch issue.');
    };

    //console.log(`ConditionsDashboard => status: ${JSON.stringify(status, null, 2)}`)
    const time = useCurrentTime();
    
    useEffect(() => {
        localStorage.setItem('conditionCollapse', conditionCollapse);
    }, [conditionCollapse]);
    useEffect(() => {
        localStorage.setItem('buoyCollapse', buoyCollapse);
    }, [buoyCollapse]);

    const fetchAndSetBuoyData = (controller, isMountedRef) => {
        fetch(localBuoyReadings(), { signal: controller.signal })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!isMountedRef.current) return;
                if (!setBuoyDataSafely(data)) {
                    const cached = getCachedBuoyData();
                    setBuoyData(cached);
                    warnBuoyFallbackOnce();
                }
            })
            .catch((error) => {
                if (error?.name === 'AbortError' || !isMountedRef.current) return;
                const cached = getCachedBuoyData();
                setBuoyData(cached);
                warnBuoyFallbackOnce();
            });
    };

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
        const nextSwell1Direction = swells[0] && swells[0].latestData
            ? getDirection(swells[0].latestData.direction)
            : null;
        const nextSwell2Direction = swells[1] && swells[1].latestData
            ? getDirection(swells[1].latestData.direction)
            : null;
        if (nextSwell1Direction && nextSwell1Direction !== status.swell1Direction) {
            handleSwell1Selection(null, null, nextSwell1Direction);
        }
        if (nextSwell2Direction && nextSwell2Direction !== status.swell2Direction) {
            handleSwell2Selection(null, null, nextSwell2Direction);
        }
    }, [buoyData, status.swell1Direction, status.swell2Direction]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const mountedRef = { current: true };
        const controller = new AbortController();
        fetchAndSetBuoyData(controller, mountedRef);

        return () => {
            mountedRef.current = false;
            controller.abort();
        };
    }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

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
            {
                (localStorage.getItem(BUOY_FETCH_WARNING_KEY) === 'true')
                ? <span className='size15 ml-5 color-orange'>🤔</span>
                    : null
            }
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
            {/*<MarineChart />*/}
            {
                /*
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
                        <div className='containerDetail flex3Column bg-yellow button p-20 mr-10' onClick={() => setRange(range + .05)}>
                            {icons.plus}
                        </div>
                        <div className='containerDetail flex3Column bg-yellow button p-20 mr-10' onClick={() => setRange(range + .05)}>
                            ⛴️range {range} miles
                        </div>
                        <div className='containerDetail flex3Column bg-yellow button p-20' onClick={() => setRange((range - .05) < .05 ? .05 : (range - .05))}>
                            {icons.minus}
                        </div>
                    </div>
                </div>
                */
            }
            {(conditionsCollapse) ? null : swellDisplay()}
            {tideDisplay('wide')}
            <div className='containerDetail size20 mt-5 mb-5 bold color-yellow bg-lite p-20'>
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
                        <WindDirection columns='2' setWind={setWind} height='0px' collapse={conditionCollapse} />
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
            <div className='containerDetail size20 bold mb-5 color-yellow bg-lite p-20'>
                <CollapseToggleButton
                    title={`${icons.buoys} Buoys`}
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