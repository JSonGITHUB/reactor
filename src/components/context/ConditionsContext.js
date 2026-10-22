import React from 'react';

export default React.createContext({
    module: 'Waves',
    pause: true,
    date: new Date(),
    edit: false,
    tide: 'low',
    stars: 1,
    waterTemp: '66.2',
    swell1Height: '2.0',
    swell1Interval: '17',
    swell1Direction: 'SSW',
    swell2Height: '2.0',
    swell2Interval: '9',
    swell2Direction: 'SSW',
    swell1Angle: 205,
    swell2Angle: 205,
    windDirection: 'E',
    distance: 20,
    isSwell1: true,
    isSwell2: false,
    isTide: true,
    isWind: false,
    locations: [],
    matches: []
});