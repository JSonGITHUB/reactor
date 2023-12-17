import { combineReducers } from 'redux';
import streamReducer from './streamReducer.js';

export default combineReducers({
    streamLoggedIn: streamReducer
});