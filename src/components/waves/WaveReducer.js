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
    DISTANCE
} from '../../actions/types';
import _ from 'lodash';

const waveReducer = (state = {}, action) => {
    switch (action.type) {
        case FETCH_STREAMS:
            return { ...state, ..._.mapKeys(action.payload, 'id') };
        case FETCH_STREAM:
            return { ...state, [action.payload.id]: action.payload }
        case CREATE_STREAM:
            console.log(`CREATE_STREAM => \naction: ${JSON.stringify(action, null, 2)}`)
            return { ...state, [action.payload.id]: action.payload }
        case EDIT_STREAM:
            return { ...state, [action.payload.id]: action.payload }
        case DELETE_STREAM:
            return _.omit(state, action.payload);
        default:
            return state;
    }
};
export default streamReducer;