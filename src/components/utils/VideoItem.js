import React from 'react';

const VideoItem = ({videoObj, onVideoSelect}) => {

    //console.log(`video: ${JSON.stringify(videoObj, null, 2)}`)

    const title = videoObj.snippet.title;
    const thumb = videoObj.snippet.thumbnails.default.url;
    const channel = videoObj.snippet.channelTitle;
    const publishDate = videoObj.snippet.publishedAt.substring(0,10);

    return (
        <div className='flexContainer button p-10 lowerBorder pointer color-yellow' onClick={() => onVideoSelect(videoObj)}>
            <div className="flex2Column columnRightAlign">
                <img alt={title} src={thumb} />
            </div>
            <div className="flex2Column columnLeftAlign pl-10">
                <div className='copyright bold'>{channel}</div>
                <div className='small bold white'>{title}</div>
                <div className='copyright'>{publishDate}</div>
            </div>
        </div>
    ) 
};

export default VideoItem;