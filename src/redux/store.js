import { createStore, combineReducers } from 'redux';
import { numberOfClicksReducer } from '../reducers/reducers'

const rootReducer = combineReducers ({
    numberOfClicks: numberOfClicksReducer,
});

export const store = createStore(rootReducer);