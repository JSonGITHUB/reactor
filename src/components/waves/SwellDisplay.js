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
        swell,
        retry
    } = useContext(OceanContext);

    const storedCollapse = initializeData('swellCollapse', null);
    const initialCollapse = storedCollapse ? storedCollapse === 'true' : true;
    const [swellCollapse, setSwellCollapse] = useState(initialCollapse);
    const safeSwell = swell || {};
    const asNumber = (value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };
    const getSwellHeight = () => asNumber(safeSwell.swell_wave_height); //?? Number(status.swell1Height);
    const getSwellDirection = () => asNumber(safeSwell.swell_wave_direction);// ?? Number(status.swell1Direction);
    const getSwellInterval = () => asNumber(safeSwell.swell_wave_period);// ?? Number(status.swell1Interval);
    const getWaveHeight = () => asNumber(safeSwell.wave_height);// ?? Number(status.swell1Height);
    const getWaveDirection = () => asNumber(safeSwell.wave_direction);// ?? Number(status.swell1Direction);
    const getWaveInterval = () => asNumber(safeSwell.wave_period);// ?? Number(status.swell1Interval);
    const getWindWaveHeight = () => asNumber(safeSwell.wind_wave_height);// ?? Number(status.swell2Height);
    const getWindWaveDirection = () => asNumber(safeSwell.wind_wave_direction);// ?? Number(status.swell2Direction);
    const getWindWaveInterval = () => asNumber(safeSwell.wind_wave_period);// ?? Number(status.swell2Interval);
    
   /*  useEffect(() => {
        localStorage.setItem('swellData', JSON.stringify(swell));
    }, [swell]); */
    useEffect(() => {
        localStorage.setItem('swellCollapse', swellCollapse);
    }, [swellCollapse]);

    const swellHeader = () => <div>
                                {icons.wave} Swell {Number(getWaveHeight()).toFixed(0)}
                                <span className='size12 mr-5'>ft</span>
                                {getDirection(getWaveDirection(), 'swellDirection')} {getWaveDirection()} {Number(getWaveInterval()).toFixed(0)}
                                <span className='size12'>sec</span>
                            </div>;
    return (
        <div>
            {
                (retry !== '')
                ? <div className='containerDetail bg-lite mb-5 p-20 contentLeft bg-lite color-yellow'>
                    {icons.wave} Swell: fetching data retry attempt {retry}
                </div>
                : <div className='mt-5'>
                    <div className='containerDetail bg-lite mb-5 color-yellow bg-lite p-20 size20'>
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
                                : <div className='containerDetail bg-lite'>
                                    <div className='containerDetail bg-tintedMedium mb-5 flexContainer centerVertical p-15'>
                                    <div className='flex4Column contentCenter'>
                                        <span className='size30 mr-30'>{icons.wave}</span>
                                            <span className='size25 color-lite'>{Number(getWaveHeight()).toFixed(0)}</span><span className='size15 color-lite'>ft</span>
                                    </div>
                                    <div className='flex10Column pl-10'>
                                            <div className='r-20 pr-5 pb-4 pt-2 bg-white width30px'>
                                            <GetDirectionIcon
                                                id='waveDirection'
                                                direction={getWaveDirection()}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex5Column contentLeft size15 color-lite'>
                                        {getWaveDirection()} {getDirection(getWaveDirection(), 'waveDirection')}
                                    </div>
                                        <div className='flex5Column contentCenter size20 color-lite'>
                                        {Number(getWaveInterval()).toFixed(0)} sec
                                    </div>
                                </div>
                                <div className='containerDetail bg-tintedMedium mb-5 flexContainer centerVertical p-15'>
                                    <div className='flex4Column contentCenter'>
                                        <span className='size25 mr-30'>{icons.wave}</span>
                                        <span className='size25 color-lite'>{Number(getSwellHeight()).toFixed(0)}</span><span className='size15 color-lite'>ft</span>
                                    </div>
                                    <div className='flex10Column pl-10'>
                                        <div className='r-20 pr-5 pb-4 pt-2 bg-white width30px'>
                                            <GetDirectionIcon
                                                id='swellDirection'
                                                direction={getSwellDirection()}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex5Column contentLeft size15 color-lite'>
                                        {getSwellDirection()} {getDirection(getSwellDirection(), 'swellDirection')}
                                    </div>
                                        <div className='flex5Column contentCenter size20 color-lite'>
                                        {Number(getSwellInterval()).toFixed(0)} sec
                                    </div>
                                </div>
                                    <div className='containerDetail bg-tintedMedium mb-5 flexContainer centerVertical p-15'>
                                        <div className='flex4Column contentCenter size15 color-lite'>
                                        <span className='mr-30'>{icons.wind} {icons.wave}</span>
                                        <span className='size25 color-lite'>{Number(getWindWaveHeight()).toFixed(0)}</span><span className='size15 color-lite'>ft</span>
                                    </div>
                                    <div className='flex10Column pl-10'>
                                        <div className='r-20 pr-5 pb-4 pt-2 bg-white width30px'>
                                            <GetDirectionIcon
                                                id='swell2Direction'
                                                direction={getWindWaveDirection()}
                                            />
                                        </div>
                                    </div>
                                    <div className='flex5Column contentLeft size15 color-lite'>
                                        {getWindWaveDirection()} {getDirection(getWindWaveDirection(), 'swell2Direction')}
                                    </div>
                                        <div className='flex5Column contentCenter size20 color-lite'>
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