import React from 'react';
import SongList from './SongList.js';
import SongDetail from './SongDetail.js';

const Player = () => {
    return (
        <React.Fragment>
            <SongDetail />
            <SongList />
        </React.Fragment>
    )
}

export default Player;