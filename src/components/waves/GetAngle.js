import angles from './Angles.js';
import directions from './Directions.js';

const GetAngle = (direction) => {
    //console.log(`GetAngle => direction: ${direction}`)
    const angleIndex = directions.findIndex(angle => angle === direction);
    const roundToNearestFive = (number) => Math.round(number / 5) * 5;
    return angles[roundToNearestFive(angleIndex*2)];
}

export default GetAngle;