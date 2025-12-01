import React from 'react';
import N from '../../assets/images/windN.png';
import NE from '../../assets/images/windNE.png';
import E from '../../assets/images/windE.png';
import SE from '../../assets/images/windSE.png';
import S from '../../assets/images/windS.png';
import SW from '../../assets/images/windSW.png';
import W from '../../assets/images/windW.png';
import NW from '../../assets/images/windNW.png';
import icons from '../site/icons';
import getDirection from '../waves/getDirection';

const directionIcon = (direction) => {
    return <img src={direction} className='mb--5 shaka r-20 p-2' alt={direction} />
}
const GetDirectionIcon = ({
    id,
    direction
}) => {

    const windDirection = getDirection(direction, id);
    //console.log(`GetDirectionIcon => direction: ${direction} windDirection: ${windDirection}`)
    if (windDirection === 'N') {
        return directionIcon(N);
    } else if ((windDirection === 'NE') || (windDirection === 'NNE') || (windDirection === 'ENE')) {
        return directionIcon(NE);
    } else if (windDirection === 'E') {
        return directionIcon(E);
    } else if ((windDirection === 'SE') || (windDirection === 'SSE') || (windDirection === 'ESE')) {
        return directionIcon(SE);
    } else if (windDirection === 'S') {
        return directionIcon(S);
    } else if ((windDirection === 'SW') || (windDirection === 'SSW') || (windDirection === 'WSW')) {
        return directionIcon(SW);
    } else if (windDirection === 'W') {
        return directionIcon(W);
    } else if ((windDirection === 'NW') || (windDirection === 'NNW') || (windDirection === 'WNW')) {
        return directionIcon(NW);
    }
    return icons.cancel

}

export default GetDirectionIcon;