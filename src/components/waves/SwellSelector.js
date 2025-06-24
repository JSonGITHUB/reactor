import React, {useEffect, useState, useContext} from 'react';
import directions from './Directions.js';
import angles from './Angles.js';
import waveHeights from './WaveHeights.js';
import Selector from '../forms/FunctionalSelector.js';
import swell1 from '../../assets/images/wavePrimary.png';
import swell2 from '../../assets/images/waveSecondaryB.png';
//import thumbsUp from '../../assets/images/ThumbsUp.png';
//import thumbsDown from '../../assets/images/ThumbsDown.png';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';
import icons from '../site/icons.js';
import { OceanContext } from '../context/OceanContext';

const SwellSelector = ({ 
    id, 
    swellDirection, 
}) => {
    
    const {
        status,
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
        swell1Angle,
        swell2Angle
    } = useContext(OceanContext);

    const isSelected = ((id === '1' && status.isSwell1) || (id === '2' && status.isSwell2)) ? true : false;

    const [selected, setSelected] = useState(isSelected);

    const roundToNearestFive = (number) => Math.round(number / 5) * 5;

    useEffect(() => {
        if (id === '1') {
            localStorage.setItem('isSwell1', selected);
        } else {
            localStorage.setItem('isSwell2', selected);
        }
    }, [selected]);

    const toggleSelected = () => {
        setSelected(!selected);
        handleSwellCheck(id)
    }

    const swellClass = () => `${(selected)? 'bg-veryLite' : 'bg-tinted'} containerBox flex2Column contentCenter`;
    const intervals = ['','0 seconds','1 seconds','2 seconds','3 seconds','4 seconds','5 seconds','6 seconds','7 seconds','8 seconds','9 seconds','10 seconds','11 seconds','12 seconds','13 seconds','14 seconds','15 seconds','16 seconds','17 seconds','18 seconds','19 seconds','20 seconds','21 seconds','22 seconds','23 seconds'];

    const getSwellIcon = (id) => {
        if (id === '1') {
            return <img src={swell1} className='shaka r-20 p-2' alt='swell1' />
        } else {
            return <img src={swell2} className='shaka r-20 p-2' alt='swell2' />;
        }
    }
    const classes = 'h50w50 r-10 p-5 bg-white';
    const getDirectionIcon = () => {
        if (swellDirection === 'N') {
            return <img src={N} className={classes} alt={swellDirection} />;
        } else if ((swellDirection === 'NE') || (swellDirection === 'NNE') || (swellDirection === 'ENE')) {
            return <img src={NE} className={classes} alt={swellDirection} />;
        } else if (swellDirection === 'E') {
            return <img src={E} className={classes} alt={swellDirection} />;
        } else if ((swellDirection === 'SE') || (swellDirection === 'SSE') || (swellDirection === 'ESE')) {
            return <img src={SE} className={classes} alt={swellDirection} />;
        } else if (swellDirection === 'S') {
            return <img src={S} className={classes} alt={swellDirection} />;
        } else if ((swellDirection === 'SW') || (swellDirection === 'SSW') || (swellDirection === 'WSW')) {
            return <img src={SW} className={classes} alt={swellDirection} />;
        } else if (swellDirection === 'W') {
            return <img src={W} className={classes} alt={swellDirection} />;
        } else if ((swellDirection === 'NW') || (swellDirection === 'NNW') || (swellDirection === 'WNW')) {
            return <img src={NW} className={classes} alt={swellDirection} />;
        }
    }
    return (
        <div className={`${swellClass()}`}>
            <div className='containerBox'>
                <div className='containerBox bg-lite'>
                    {getSwellIcon(id)}
                    <div className='ml-5'>Swell{id}</div>
                </div>
                <div className='p-10'>{getDirectionIcon()}</div>  
            </div>
            
            <div className='p-10 r-10 bg-tinted mt-20'>
                <div className='flex2Column size20'>
                    <div className='containerBox color-yellow bg-lite'>direction</div>
                    <div className='containerBox button color-red brdr-red' onClick={(id === '1') ? handleSwell1LiveSelection : handleSwell2LiveSelection}>GET CURRENT</div>
                    <Selector
                        groupTitle={`Swell${id}`}
                        selected={(id === '1') ? status.swell1Direction : status.swell2Direction} 
                        //getState(`swell1`)
                        label='Direction' 
                        items={directions}
                        onChange={(id === '1') ? handleSwell1Selection : handleSwell2Selection}
                        fontSize='20'
                        padding='10px'
                        width='70%'
                    />
                </div>
            </div>
            <div className='p-10 r-10 bg-tinted mt-20'>
                <div className='containerBox color-yellow bg-lite'>angle</div>
                <Selector
                    groupTitle={`SwellAngle${id}`}
                    selected={(id === '1') ? roundToNearestFive(status.swell1Angle) : roundToNearestFive(status.swell2Angle)} 
                    label='Angle' 
                    items={angles}
                    onChange={(id === '1') ? handleSwell1Angle : handleSwell2Angle}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
            </div>
            <div className='p-10 r-10 bg-tinted mt-20'>
                <div className='containerBox color-yellow bg-lite'>height</div>
                <Selector
                    groupTitle={`SwellHeight${id}`}
                    selected={(id === '1') ? `${Number(localStorage.getItem(`swell1Height`).replace('ft', '')).toFixed(0)}ft` : `${Number(localStorage.getItem('swell2Height').replace('ft', '')).toFixed(0)}ft`} 
                    label='Height' 
                    items={waveHeights}
                    onChange={(id === '1') ? handleSwell1Height : handleSwell2Height}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
            </div>
            
            <div className='p-10 r-10 bg-tinted mt-20'>
                <div className='containerBox color-yellow bg-lite'>interval</div>
                <Selector
                    groupTitle={`SwellInterval${id}`}
                    selected={
                      (id === '1')
                        ? (status.swell1Interval && !status.swell1Interval.toString().includes('seconds')
                            ? `${status.swell1Interval} seconds`
                            : status.swell1Interval)
                        : (status.swell2Interval && !status.swell2Interval.toString().includes('seconds')
                            ? `${status.swell2Interval} seconds`
                            : status.swell2Interval)
                    }
                    label='interval' 
                    items={intervals}
                    onChange={(id === '1') ? handleSwell1Interval : handleSwell2Interval}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
            </div>
            
            <div className='containerBoxDetail button size40 p-20' onClick={() => toggleSelected()}>
                {/*<img src={(selected) ? thumbsUp : thumbsDown} alt={`swell${id}`} className='p-10 r-20' />*/}
                {((selected) === true) ? icons.good : icons.bad }
            </div>
        </div>
    )
}
export default SwellSelector;