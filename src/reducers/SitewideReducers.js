import { combineReducers } from 'redux';
import songReducer from '../components/music/songReducer.js';
import selectedSongReducer from '../components/music/selectedSongReducer.js';
import wavesReducer from '../components/waves/WavesReducer.js';
import authReducer from './authReducer';
import { reducer as formReducer } from 'redux-form';

export default combineReducers({
    songs: songReducer,
    selectedSong: selectedSongReducer,
    auth: authReducer,
    waves: wavesReducer,
    form: formReducer
});