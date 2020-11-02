import React from 'react';
import VideoItem from './VideoItem';

const VideoList = ({ videos }) => {
    const renderedList = videos.map((video) => {
        return <VideoItem 
                    channel={video.snippet.channelTitle} 
                    thumb={video.snippet.thumbnails.default.url} 
                    title={video.snippet.title} 
                    published={video.snippet.publishedAt}
                />;
    });
    return <div>{renderedList}</div>
};

export default VideoList;