import React from 'react';
import swell1 from '../../assets/images/wavePrimary.png';
import swell2 from '../../assets/images/waveSecondaryB.png';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';
// eslint-disable-next-line
import tideIcon from '../../assets/images/tide.png';
import tide from '../../assets/images/tide.png';
import icons from '../site/icons';
// eslint-disable-next-line
import high from '../../assets/images/tide.png';
// eslint-disable-next-line
import medium from '../../assets/images/tide.png';
// eslint-disable-next-line
//import low from '../../assets/images/tide.png';
//import waterTemp from '../../assets/images/waterTemp.png';
//import airTemp from '../../assets/images/airTemp.png';

const getMatchIcon = ({
    kind,
    status,
    collapse
}) => {
    //console.log(`getMatchIcon => kind: ${kind}\nstatus:${JSON.stringify(status,null,2)}`)
    const getStarMatchKind = (kind) => {
        //let classes = 'shaka r-20 p-2';
        let classes = `${(collapse)?'h30w30':'h50w50'} ${(kind === 'tide') ? 'pb-5' : ''}`;
        classes = (kind === 'wind') ? (classes + ' r-10 bg-white') : classes; 
        return classes;
    }
    // eslint-disable-next-line
    //console.log(`status.tide: ${status.tide}`);
    //const getTideIcon = <img src={status.tide} className={`mb--5 ${getStarMatchKind('tide')}`} alt='tide' />;
    // eslint-disable-next-line
    //const getWaterTempIcon = <img src={waterTemp} className={`mb--7 ${getStarMatchKind('tide')}`} alt='water temp' />;
    // eslint-disable-next-line
    //const getAirTempIcon = <img src={airTemp} className={`mb--7 ${getStarMatchKind('tide')}`} alt='air temp' />;
    // eslint-disable-next-line
    let icon = (kind === 'swell1') ? 'swell1' : 'swell2';
    icon = (kind === 'wind') ? 'wind' : icon;
    // eslint-disable-next-line
    icon = (kind === 'tide') ? 'tide' : icon;
    const getPrimaryDirection = (direction) => {
        if (direction === 'N') {
            return N;
        } else if ((direction === 'NE') || (direction === 'NNE') || (direction === 'ENE')) {
            return NE;
        } else if (direction === 'E') {
            return E;
        } else if ((direction === 'SE') || (direction === 'SSE') || (direction === 'ESE')) {
            return SE;
        } else if (direction === 'S') {
            return S;
        } else if ((direction === 'SW') || (direction === 'SSW') || (direction === 'WSW')) {
            return SW;
        } else if (direction === 'W') {
            return W;
        } else if ((direction === 'NW') || (direction === 'NNW') || (direction === 'WNW')) {
            return NW;
        }
    }
    const getDirectionIcon = (direction) => {
        return <img src={getPrimaryDirection(direction)} className={`${getStarMatchKind(kind)}`} alt={kind} />;
    }
    if (kind === 'swell1') {
        const swellDirection = status.swell1Direction;
        if (collapse) {
            return <div className='size25 columnCenterAlign'>
                <img
                    src={swell1}
                    className={`${getStarMatchKind(kind)}`}
                    alt={kind}
                />
                <span className='size15'>
                    {Number(localStorage.getItem('swell1Height')).toFixed(0)}ft
                    {localStorage.getItem('swell1Direction')}
                    /{Number(localStorage.getItem('swell1Interval')).toFixed(0)}
                </span>
            </div>
        }
        return <div className='mt--5'>
            <img src={swell1} className={getStarMatchKind(kind)} alt={kind} />
            <div className='flex2Column m-auto contentCenter bg-white mt-10 r-10 p-5'>
                {getDirectionIcon(swellDirection)}
            </div>
        </div>;
    } else if (kind === 'swell2') {
        const swellDirection = status.swell2Direction;
        if (collapse) {
            return <div className='size25 columnCenterAlign'>
                    <img 
                        src={swell2} 
                        className={`${getStarMatchKind(kind)}`} 
                        alt={kind} 
                    />
                    <div className='size15'>
                        {Number(localStorage.getItem('swell2Height')).toFixed(0)}ft
                        {localStorage.getItem('swell2Direction')}
                        /{Number(localStorage.getItem('swell2Interval')).toFixed(0)}
                    </div>
                </div>
        }
        return <div className='mt--5'>
                    <img src={swell2} className={getStarMatchKind(kind)} alt={kind} />
                    <div className='flex2Column m-auto contentCenter bg-white mt-10 r-10 p-5'>
                        {getDirectionIcon(swellDirection)} 
                    </div>
                </div>;
    } else if (kind === 'tide') {
        return <div className={`w-50 size25 ${(!collapse)?'ml-auto mr-auto':'columnCenterAlign'}`}>
                    <img src={tide} className={`${getStarMatchKind(kind)}`} alt={kind} />
                    {
                        (collapse) 
                        ? <span className='size15 mb-5'>
                                {String(localStorage.getItem('tide').toUpperCase().substring(0, 1))}
                            </span>
                        : <span></span>
                    }   
                </div>
    } else if (kind === 'wind') {
        const windDirection = status.windDirection;
        if (collapse) {
            return <div className='w-50 mt-5 size25 columnCenterAlign'>
                        <span className=''>
                            {icons.wind}
                        </span>
                        <span className='size15'>
                            {localStorage.getItem('windDirection')}
                        </span>             
                    </div>
        }
        return <div className='flex2Column contentCenter'>
                    <div className='bold mt-20 mb-25 pb-1 size40'>{icons.wind}</div>
                    <div className='bg-white r-10 m-auto p-5'>{getDirectionIcon(windDirection)}</div>
                </div>
        
    }
};
export default getMatchIcon;