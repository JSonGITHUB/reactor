import { combineReducers } from 'redux';
import postsReducer from '../components/blog/postsReducer.js';
import usersReducer from '../components/blog/usersReducer.js';
import songReducer from '../components/music/songReducer.js';
import selectedSongReducer from '../components/music/selectedSongReducer.js';
import streamReducer from '../components/streams/streamReducer.js';
import authReducer from './authReducer';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
    posts: postsReducer,
    users: usersReducer,
    songs: songReducer,
    selectedSong: selectedSongReducer,
    auth: authReducer,
    form: formReducer,
    streams: streamReducer
});