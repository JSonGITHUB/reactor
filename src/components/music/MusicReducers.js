import { combineReducers } from 'redux';
import songReducer from './songReducer.js';
import selectedSongReducer from './selectedSongReducer.js';

export default combineReducers({
    songs: songReducer,
    selectedSong: selectedSongReducer
});