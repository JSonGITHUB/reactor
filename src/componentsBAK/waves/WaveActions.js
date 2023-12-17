import { 
    TIDE, 
    WIND, 
    SWELL1_SELECTED, 
    SWELL2_SELECTED, 
    SWELL1_DIRECTION, 
    SWELL2_DIRECTION,
    SWELL1_ANGLE,
    SWELL2_ANGLE,
    SWELL1_HEIGHT,
    SWELL2_HEIGHT,
    SWELL1_INTERVAL,
    SWELL2_INTERVAL,
    WIND_DIRECTION,
    FETCH_GPS
} from '../../actions/types';
      
export const setTide = tide => async dispatch => {
    return {
        type: TIDE,
        payload: tide
    };
};
export const setWind = wind => {
    return {
        type: WIND,
        payload: wind
    };
};
export const setWindDirection = windDirection => {
    return {
        type: WIND_DIRECTION,
        payload: windDirection
    };
};
export const setSwell1Direction = swell1Direction => {
    return {
        type: SWELL1_DIRECTION,
        payload: swell1Direction
    };
};
export const setSwell2Direction = swell2Direction => {
    return {
        type: SWELL2_DIRECTION,
        payload: swell2Direction
    };
};
export const setSwell1Angle = swell1Angle => {
    return {
        type: SWELL1_ANGLE,
        payload: swell1Angle
    };
};
export const setSwell2Angle = swell2Angle => {
    return {
        type: SWELL2_ANGLE,
        payload: swell2Angle
    };
};
export const setSwell1Height = swell1Height => {
    return {
        type: SWELL1_HEIGHT,
        payload: swell1Height
    };
};
export const setSwell2Height = swell2Height => {
    return {
        type: SWELL2_HEIGHT,
        payload: swell2Height
    };
};
export const setSwell1 = swell1Selected => {
    return {
        type: SWELL1_SELECTED,
        payload: swell1Selected
    };
};
export const setSwell2 = swell2Selected => {
    return {
        type: SWELL2_SELECTED,
        payload: swell2Selected
    };
};
export const setSwell1Interval = swell1Interval => {
    return {
        type: SWELL1_INTERVAL,
        payload: swell1Interval
    };
};
export const setSwell2Interval = swell2Interval => {
    return {
        type: SWELL2_INTERVAL,
        payload: swell2Interval
    };
};
export const setGPS = gps => {
    return {
        type: FETCH_GPS,
        payload: gps
    };
};