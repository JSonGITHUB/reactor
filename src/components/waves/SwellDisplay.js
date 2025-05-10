import React, { useState, useEffect, useContext } from 'react';
import icons from '../site/icons';
import GetDirectionIcon from '../weather/GetDirectionIcon';
import CollapseToggleButton from '../utils/CollapseToggleButton';
import getDirection from './getDirection';
//import useOceanData from './useOceanData';
import initializeData from '../utils/InitializeData';
import { OceanContext } from '../context/OceanContext';


const SwellDisplay = ({
    time
}) => {

    const {
        status,
        setStatus,
        swell,
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
        pause,
        retry
    } = useContext(OceanContext);

    const [dataInit, setDataInit] = useState(false);
    const storedCollapse = initializeData('swellCollapse', null);
    const initialCollapse = storedCollapse ? storedCollapse === 'true' : true;
    const [swellCollapse, setSwellCollapse] = useState(initialCollapse);
    const getSwellHeight = () => Number(swell.swell_wave_height); //?? Number(status.swell1Height);
    const getSwellDirection = () => Number(swell.swell_wave_direction);// ?? Number(status.swell1Direction);
    const getSwellInterval = () => Number(swell.swell_wave_period);// ?? Number(status.swell1Interval);
    const getWaveHeight = () => Number(swell.wave_height);// ?? Number(status.swell1Height);
    const getWaveDirection = () => Number(swell.wave_direction);// ?? Number(status.swell1Direction);
    const getWaveInterval = () => Number(swell.wave_period);// ?? Number(status.swell1Interval);
    const getWindWaveHeight = () => Number(swell.wind_wave_height);// ?? Number(status.swell2Height);
    const getWindWaveDirection = () => Number(swell.wind_wave_direction);// ?? Number(status.swell2Direction);
    const getWindWaveInterval = () => Number(swell.wind_wave_period);// ?? Number(status.swell2Interval);
    
   /*  useEffect(() => {
        localStorage.setItem('swellData', JSON.stringify(swell));
    }, [swell]); */
    useEffect(() => {
        localStorage.setItem('swellCollapse', swellCollapse);
    }, [swellCollapse]);

    const swellHeader = () => <div>{icons.wave} SWELL {Number(getSwellHeight()).toFixed(0)}<span className='size12'>ft</span> {getDirection(getSwellDirection(), 'swell1Direction')} {getSwellDirection()} {Number(getSwellInterval()).toFixed(0)}<span className='size12'>sec</span></div>
    return (
        <div>
            {
                (retry !== '')
                ? <div className='containerBox p-20 contentLeft bg-lite color-yellow bold'>
                    {icons.wave} SWELL: fetching data retry attempt {retry}
                </div>
                : <div className=''>
                    <div className='containerBox bold color-yellow bg-lite p-20'>
                        <CollapseToggleButton
                            //title={`${icons.wave} SWELL ${Number(getSwellHeight()).toFixed(0)}ft ${getDirection(getSwellDirection())} ${getSwellDirection()} ${Number(getSwellInterval()).toFixed(0)}sec`}
                            title=''
                            component={swellHeader()}
                            isCollapsed={swellCollapse}
                            setCollapse={setSwellCollapse}
                            align='left'
                        />
                    </div>
                    {
                        (swellCollapse)
                            ? null
                            : <div>
                                <div className='containerBox flexContainer centerVertical'>
                                    <div className='flex4Column contentCenter'>
                                        <span className='size40 mr-30'>{icons.wave}</span>
                                        {Number(getSwellHeight()).toFixed(0)}ft
                                    </div>
                                    <div className='flex10Column pl-10'>
                                        <div className='r-20 pr-5 pb-4 pt-2 bg-white width30px'>
                                            <GetDirectionIcon
                                                id='swell1Direction'
                                                direction={getSwellDirection()}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex5Column contentLeft'>
                                        {getSwellDirection()} {getDirection(getSwellDirection(),'swell1Direction')}
                                    </div>
                                    <div className='flexColumn contentRight'>
                                        {icons.track}
                                    </div>
                                    <div className='flex5Column contentCenter'>
                                        {Number(getSwellInterval()).toFixed(0)} sec
                                    </div>
                                </div>
                                <div className='containerBox flexContainer centerVertical'>
                                    <div className='flex4Column contentCenter'>
                                        <span className='size30 mr-35'>{icons.wave}</span>
                                        {Number(getWaveHeight()).toFixed(0)}ft
                                    </div>
                                    <div className='flex10Column pl-10'>
                                        <div className='r-20 pr-5 pb-4 pt-2 bg-white width30px'>
                                            <GetDirectionIcon
                                                id='swell1Direction'
                                                direction={getWaveDirection()}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex5Column contentLeft'>
                                        {getWaveDirection()} {getDirection(getWaveDirection(), 'swell1Direction')}
                                    </div>
                                    <div className='flexColumn contentRight'>
                                        {icons.track}
                                    </div>
                                    <div className='flex5Column contentCenter'>
                                        {Number(getWaveInterval()).toFixed(0)} sec
                                    </div>
                                </div>
                                <div className='containerBox flexContainer centerVertical'>
                                    <div className='flex4Column contentCenter'>
                                        <span className='mr-30'>{icons.wind} {icons.wave}</span>
                                        {Number(getWindWaveHeight()).toFixed(0)}ft
                                    </div>
                                    <div className='flex10Column pl-10'>
                                        <div className='r-20 pr-5 pb-4 pt-2 bg-white width30px'>
                                            <GetDirectionIcon
                                                id='swell2Direction'
                                                direction={getWindWaveDirection()}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex5Column contentLeft'>
                                        {getWindWaveDirection()} {getDirection(getWindWaveDirection(), 'swell2Direction')}
                                    </div>
                                    <div className='flexColumn contentRight'>
                                        {icons.track}
                                    </div>
                                    <div className='flex5Column contentCenter'>
                                        {Number(getWindWaveInterval()).toFixed(0)} sec
                                    </div>
                                </div>
                            </div>
                    }

                </div>
            }
        </div>
    )

}

export default SwellDisplay;