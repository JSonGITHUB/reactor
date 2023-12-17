import angles from './Angles.js';
import directions from './Directions.js';

const GetAngle = (direction) => {
    //console.log(`GetAngle => direction: ${direction}`)
    const angleIndex = directions.findIndex(angle => angle === direction);
    return angles[angleIndex*2];
}

export default GetAngle;