import React from 'react';
import SongList from './SongList.js';
import SongDetail from './SongDetail.js';

const Player = () => {
    return (
        <div>
            <div>
                <SongDetail />
            </div>
            <div>
                <SongList />
            </div>
            
        </div>
    )
}

export default Player;