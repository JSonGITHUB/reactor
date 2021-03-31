import { combineReducers } from 'redux';
import postsReducer from './postsReducer.js';
import usersReducer from './usersReducer.js';
import songReducer from './songReducer.js';
import selectedSongReducer from './selectedSongReducer.js';
import streamReducer from './streamReducer.js';
import authReducer from './authReducer';

export default combineReducers({
    posts: postsReducer,
    users: usersReducer,
    songs: songReducer,
    selectedSong: selectedSongReducer,
    streamLoggedIn: streamReducer,
    auth: authReducer
});