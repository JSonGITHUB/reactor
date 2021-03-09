import getWaveHeight from './GetWaveHeight.js';
import getWindOrientation from './GetWindOrientation.js';
import getWindMPH from './GetWindMPH.js';
import getSurface from './GetSurface.js';
const getNotes = ({status}) => {
    const { height, tide, windDirection, windGusts, swell1Height, swell1Angle, swell1Direction, swell1Interval } = status;
    let notes = `${swell1Height}(${getWaveHeight(swell1Height)})`;
    notes = `${notes} out of the ${swell1Direction}`;
    notes = `${notes}(${swell1Angle})`;
    notes = `${notes} at ${swell1Interval}.`;
    notes = `${notes} It was a ${tide} tide`;
    notes = `${notes}(${Number(height).toFixed(0)}ft).`;
    notes = `${notes} the wind was ${getWindOrientation(windDirection)} out of the ${windDirection} at ${getWindMPH(windGusts)}.`;
    notes = `${notes} The conditions were ${getSurface(windGusts)}.`;
    return notes;
}
export default getNotes;