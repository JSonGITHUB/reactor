import angles from '../waves/Angles.js';
import directions from '../waves/Directions.js';

const GetDirection = (direction) => {
    const windAngle = direction.toFixed(0);
    const angleIndex = angles.findIndex(angle => angle >= windAngle);
    return directions[angleIndex];
}

export default GetDirection;