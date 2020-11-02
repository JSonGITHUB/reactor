import React from 'react';

const VideoItem = ({channel, thumb, title, published}) => {
    return (
        <div className='flexContainer button p-10 m-1 r-10 bg-lite color-yellow'>
            <div className="flex2Column">
                <img alt={title} src={thumb} />
            </div>
            <div className="flex2Column columnLeft pl-10">
                <div className='copyright bold'>{channel}</div>
                <div className='small bold white'>{title}</div>
                <div className='copyright'>{published.substring(0,10)}</div>
            </div>
        </div>
    ) 
};

export default VideoItem;
