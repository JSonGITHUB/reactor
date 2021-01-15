const angleArray = [ 0, 25, 45, 65, 90, 115, 135, 160, 180, 205, 225, 250, 270, 295, 315, 340];
const directionArray = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

const GetDirection = (direction) => {
    const windAngle = direction.toFixed(0);
    const angleIndex = angleArray.findIndex(angle => angle >= windAngle);
    return directionArray[angleIndex];
}

export default GetDirection;