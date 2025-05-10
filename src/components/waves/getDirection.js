import initializeData from '../utils/InitializeData';
const getDirection = (direction, id) => {
    //console.log(`getDirection => direction: ${direction}`)
    const directions = [
        ['N', 'North', 348.75, 11.25],
        ['NNE', 'North-Northeast', 11.25, 33.75],
        ['NE', 'Northeast', 33.75, 56.25],
        ['ENE', 'East-Northeast', 56.25, 78.75],
        ['E', 'East', 78.75, 101.25],
        ['ESE', 'East-Southeast', 101.25, 123.75],
        ['SE', 'Southeast', 123.75, 146.25],
        ['SSE', 'South-Southeast', 146.25, 168.75],
        ['S', 'South', 168.75, 191.25],
        ['SSW', 'South-Southwest', 191.25, 213.75],
        ['SW', 'Southwest', 213.75, 236.25],
        ['WSW', 'West-Southwest', 236.25, 258.75],
        ['W', 'West', 258.75, 281.25],
        ['WNW', 'West-Northwest', 281.25, 303.75],
        ['NW', 'Northwest', 303.75, 326.25],
        ['NNW', 'North-Northwest', 326.25, 348.75]
    ];
    const resolveDirection = (value) => {
        for (let i = 0; i < directions.length; i++) {
            const range = directions[i];
            if (value >= range[2] && value < range[3]) {
                return range[0];
            }
        }
        return initializeData(id, null);
    }
    if (resolveDirection(direction) === null) return 'N';
    return resolveDirection(direction);
}

export default getDirection;