const getWindOrientation = (windDirection) => {
    const directions = {
        'N': 'sideshore => lefts',
        'NE': 'sideshore => lefts',
        'ENE': 'offshore',
        'NNE': 'offshore',
        'NW': 'onshore',
        'NNW': 'sideshore => lefts',
        'W': 'onshore',
        'WNW': 'onshore',
        'E': 'offshore',
        'ESE': 'sideshore => rights',
        'S': 'sideshore => rights',
        'SE': 'sideshore => rights',
        'SSE': 'sideshore => rights',
        'WSW': 'onshore',
        'SW': 'sideshore => rights',
        'SSW': 'sideshore => rights'
    }
    return directions[windDirection]
}
export default getWindOrientation;