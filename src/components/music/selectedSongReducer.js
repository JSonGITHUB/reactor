const selectedSongReducer = (song=null, action) => {
    if (action.type === 'SONG_SELECTED') {
        return action.payload;
    }
    return song;
}
export default selectedSongReducer;