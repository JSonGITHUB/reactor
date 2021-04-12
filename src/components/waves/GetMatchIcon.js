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
// eslint-disable-next-line
import high from '../../assets/images/tide.png';
// eslint-disable-next-line
import medium from '../../assets/images/tide.png';
// eslint-disable-next-line
import low from '../../assets/images/tide.png';
import waterTemp from '../../assets/images/waterTemp.png';
import airTemp from '../../assets/images/airTemp.png';

const getMatchIcon = ({kind, status}) => {
    //console.log(`getMatchIcon => kind: ${kind}\nstatus:${JSON.stringify(status,null,2)}`)
    const getStarMatchKind = (kind) => {
        //let classes = "shaka r-20 p-2";
        let classes = 'h50w50 p-5';
        classes = (kind === "wind") ? (classes + " r-10 bg-white mb-55") : classes; 
        return classes;
    }
    // eslint-disable-next-line
    const getTideIcon = <img src={status.tide} className={`mb--5 ${getStarMatchKind("tide")}`} alt="tide" />;
    // eslint-disable-next-line
    const getWaterTempIcon = <img src={waterTemp} className={`mb--7 ${getStarMatchKind("tide")}`} alt="water temp" />;
    // eslint-disable-next-line
    const getAirTempIcon = <img src={airTemp} className={`mb--7 ${getStarMatchKind("tide")}`} alt="air temp" />;
    // eslint-disable-next-line
    let icon = (kind === "swell1") ? "swell1" : "swell2";
    icon = (kind === "wind") ? "wind" : icon;
    // eslint-disable-next-line
    icon = (kind === "tide") ? "tide" : icon;
    const getDirectionIcon = (direction) => {
        if (direction === "N") {
            return <img src={N} className={getStarMatchKind(kind)} alt={kind} />;
        } else if ((direction === "NE") || (direction === "NNE") || (direction === "ENE")) {
            return <img src={NE} className={getStarMatchKind(kind)} alt={kind} />;
        } else if (direction === "E") {
            return <img src={E} className={getStarMatchKind(kind)} alt={kind} />;
        } else if ((direction === "SE") || (direction === "SSE") || (direction === "ESE")) {
            return <img src={SE} className={getStarMatchKind(kind)} alt={kind} />;
        } else if (direction === "S") {
            return <img src={S} className={getStarMatchKind(kind)} alt={kind} />;
        } else if ((direction === "SW") || (direction === "SSW") || (direction === "WSW")) {
            return <img src={SW} className={getStarMatchKind(kind)} alt={kind} />;
        } else if (direction === "W") {
            return <img src={W} className={getStarMatchKind(kind)} alt={kind} />;
        } else if ((direction === "NW") || (direction === "NNW") || (direction === "WNW")) {
            return <img src={NW}  alt={kind} />;
        }
    }
    if (kind === "swell1") {
        const swellDirection = status.swell1Direction;
        return <React.Fragment>
                <img src={swell1} className={getStarMatchKind(kind)} alt={kind} /><br/>
                {getDirectionIcon(swellDirection)}
            </React.Fragment>;
    } else if (kind === "swell2") {
        const swellDirection = status.swell2Direction;
        return <React.Fragment>
                <img src={swell2} className={getStarMatchKind(kind)} alt={kind} /><br/>
                {getDirectionIcon(swellDirection)}
            </React.Fragment>;
    } else if (kind === "tide") {
        return <img src={tide} className={getStarMatchKind(kind)} alt={kind} />;
    } else if (kind === "wind") {
        const windDirection = status.windDirection;
        return getDirectionIcon(windDirection);
    }
};
export default getMatchIcon;