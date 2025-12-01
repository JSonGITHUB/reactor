import angles from '../waves/Angles.js';
import directions from '../waves/Directions.js';

const GetDirection = (direction) => {
    const roundToNearestFive = (number) => Math.round(number / 5) * 5;
    const windAngle = roundToNearestFive(direction.toFixed(0));
    console.log(`GetDirection => windAngle: ${windAngle}`);
    const angleIndex = angles.findIndex(angle => angle >= windAngle);
    console.log(`GetDirection => angleIndex: ${angleIndex}`);
    return directions[angleIndex];
}

export default GetDirection;