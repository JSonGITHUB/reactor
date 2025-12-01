import React from 'react';
import { connect } from 'react-redux';
import randomBackgroundColor from '../utils/RandomBackgroundColor.js';
import randomColor from '../utils/RandomColor.js';

//props.song
const SongDetail = ({ song }) => {
    console.log(`song: ${JSON.stringify(song, null, 2)}`)
    let classes = `p-20 r-10 shadow bold size25 m-1 ${randomBackgroundColor()} ${randomColor()}`;
    if (!song) {
        return <div className={classes}>Select a song...</div> 
    }
    return (
        <div className={classes}>
            {song.title}
            <div className='copyright'>
                time: {song.duration}
            </div>
        </div>
    )

}
const mapStateToProps = (state) => {
    return { song: state.selectedSong }
}
export default connect(mapStateToProps)(SongDetail);