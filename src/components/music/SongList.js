import React from 'react';
import { connect } from 'react-redux';
import getKey from '../utils/KeyGenerator.js';
import { selectSong } from './MusicActions.js';

const SongList = (props) => {
    console.log(`SongList => props: ${JSON.stringify(props,null,2)}`);
    const buttonClasses = 'p-10 r-10 bg-dkYellow m-1 greet color-yellow incompletedSelector button';
    const renderList = () => {
        return props.songs.map(song => {
            return (
                <div 
                    key={getKey(song.title)} 
                    className={buttonClasses} 
                    onClick={() => props.selectSong(song)}
                >
                    <div className='bold'>{song.title}</div>
                    <div className='color-yellow'>{song.duration}</div>
                </div>
            )
        })
    }
    return renderList();
}

//const getReduxState
const mapStateToProps = state => {
    console.log(`SongList => mapStateToProps => state: ${JSON.stringify(state,null,2)}`);
    return { songs: state.songs };
}
export default connect(mapStateToProps, { selectSong })(SongList);