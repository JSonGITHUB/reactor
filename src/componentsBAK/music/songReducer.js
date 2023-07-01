const songReducer = () => {
    const songs = [
        { title: 'Police Truck', duration: '1:20'},
        { title: "I'm Now", duration: '1:50'},
        { title: 'Bad Fish', duration: '4:20'},
        { title: 'Labadami', duration: '1:20'},
        { title: 'Mongaloid', duration: '3:20'}
    ];
    //console.log(`songsReducer => songs: ${songs}`)
    return songs;
};
export default songReducer;