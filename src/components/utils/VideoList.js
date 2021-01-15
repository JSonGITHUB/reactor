import React from 'react';
import VideoItem from './VideoItem';
import getKey from './KeyGenerator.js';

const VideoList = ({ videos, onVideoSelect }) => {
    const renderedList = videos.map((video) => {
        return <VideoItem 
                    onVideoSelect = {onVideoSelect}
                    key={getKey("vidItem")} 
                    videoObj={video}
                />;
    });
    return <div>{renderedList}</div>
};

export default VideoList;