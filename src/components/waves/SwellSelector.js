import React from 'react';
import directions from './Directions.js';
import angles from './Angles.js';
import waveHeights from './WaveHeights.js';
import Selector from '../forms/FunctionalSelector.js';
import swell1 from '../../assets/images/wavePrimary.png';
import swell2 from '../../assets/images/waveSecondaryB.png';
import thumbsUp from '../../assets/images/ThumbsUp.png';
import thumbsDown from '../../assets/images/ThumbsDown.png';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';

const SwellSelector = ({id, swellDirection, status, handleSwell1Selection, handleSwell2Selection, handleSwell1Angle, handleSwell2Angle, handleSwell1Height, handleSwell2Height, handleSwell1Interval, handleSwell2Interval, handleSwell1Check, handleSwell2Check, pause}) => {
    const swellClass = (id) => `${isSwellSelected(id)} flex2Column r-10 m-5 p-15`;
    const isSwellSelected = (id) => ((id === '1' && status.isSwell1 === true) || (id === 2 && status.isSwell2===true)) ? 'bg-green' : 'bg-dkGreen';
    const intervals = ['','5 seconds','6 seconds','7 seconds','8 seconds','9 seconds','10 seconds','11 seconds','12 seconds','13 seconds','14 seconds','15 seconds','16 seconds','17 seconds','18 seconds','19 seconds','20 seconds','21 seconds','22 seconds','23 seconds'];

    const getSwellIcon = (id) => {
        if (id === '1') {
            return <img src={swell1} className='shaka r-20 p-2' alt="swell1" />
        } else {
            return <img src={swell2} className='shaka r-20 p-2' alt="swell2" />;
        }
    }
    const getDirectionIcon = () => {
        if (swellDirection === "N") {
            return <img src={N} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        } else if ((swellDirection === "NE") || (swellDirection === "NNE") || (swellDirection === "ENE")) {
            return <img src={NE} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        } else if (swellDirection === "E") {
            return <img src={E} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        } else if ((swellDirection === "SE") || (swellDirection === "SSE") || (swellDirection === "ESE")) {
            return <img src={SE} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        } else if (swellDirection === "S") {
            return <img src={S} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        } else if ((swellDirection === "SW") || (swellDirection === "SSW") || (swellDirection === "WSW")) {
            return <img src={SW} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        } else if (swellDirection === "W") {
            return <img src={W} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        } else if ((swellDirection === "NW") || (swellDirection === "NNW") || (swellDirection === "WNW")) {
            return <img src={NW} className='shaka r-20 p-2 bg-white' alt={swellDirection} />;
        }
    }
    const getSwellIndicator = () => {
        console.log(`getSwellIndicator => swellDirection: ${swellDirection}`)
        return (
            getDirectionIcon()
        )
    }
    return (
            <div className={swellClass(id)} onMouseDown={pause}>
            {getSwellIcon(id)}
            <div className="ml-5">Swell{id}</div>
            <div className='p-10'>{getSwellIndicator()}</div>
            <div className='bg-lite r-10 mt-20 pb-15'>
                <span className="greet ml-5">direction</span><br/>
                <Selector
                    groupTitle={`Swell${id}`}
                    selected={swellDirection} 
                    //getState(`swell1`)
                    label="Direction" 
                    items={directions}
                    onChange={(id === '1') ? handleSwell1Selection : handleSwell2Selection}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
                <br/>
                <span className="greet ml-5">angle</span><br/>
                <Selector
                    groupTitle={`SwellAngle${id}`}
                    selected={(id === '1') ? status.swell1Angle : status.swell2Angle} 
                    label="Angle" 
                    items={angles}
                    onChange={(id === '1') ? handleSwell1Angle : handleSwell2Angle}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
                <br/>
                <span className="greet ml-5">height</span><br/>
                <Selector
                    groupTitle={`SwellHeight${id}`}
                    selected={(id === '1') ? status.swell1Height : status.swell2Height} 
                    label="Height" 
                    items={waveHeights}
                    onChange={(id === '1') ? handleSwell1Height : handleSwell2Height}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
                <br/>
                <span className="greet ml-5">interval</span><br/>
                <Selector
                    groupTitle={`SwellInterval${id}`}
                    selected={(id === '1') ? status.swell1Interval : status.swell2Interval} 
                    label="interval" 
                    items={intervals}
                    onChange={(id === '1') ? handleSwell1Interval : handleSwell2Interval}
                    fontSize='20'
                    padding='5px'
                    width='70%'
                />
            </div>
            
            {(id===1) 
                ? <div className="button mt-15" onClick={handleSwell1Check}>
                    {(status.isSwell1 === true) ? <img src={thumbsUp} alt='swell1' className='p-10 r-20' /> : <img src={thumbsDown} alt='swell1' className='p-10 r-20' /> }
                </div>
                : <div className="button mt-15" onClick={handleSwell2Check}>
                    {(status.isSwell2 === true) ? <img src={thumbsUp} alt='swell2' className='p-10 r-20' /> : <img src={thumbsDown} alt='swell2' className='p-10 r-20' /> }
                </div>
            }
        </div>
    )
}
export default SwellSelector;