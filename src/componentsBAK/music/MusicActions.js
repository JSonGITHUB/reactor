const selectSong = (song) => {
    const action = {
        type: 'SONG_SELECTED',
        payload: song
    }
    console.log(`selectSong =>\naction: ${JSON.stringify(action ,null,2)}`);
    return action;
}
export { selectSong }