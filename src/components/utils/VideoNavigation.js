import React, { useState } from 'react';
const VideoNavigation = React.forwardRef((props, ref) => { 
    console.log(`VideoNavigation props.playerStatus.isPlaying: ${props.playerStatus.isPlaying}`);

    return (
        <React.Fragment>
            <button className='navButton p-10' onClick={props.handleJumpToStart}>|&lt;=</button>
            <button className='navButton p-10' onClick={props.handleMinusOne}>-1</button>
            {
                /*
                <button className='navButton p-10' onClick={props.handleRewind}>&lt;&lt;&lt;</button>
                <button className='navButton p-10' onClick={props.handleMediumRewind}>&lt;&lt;</button>
                */
            }
            <button className='navButton p-10' onClick={props.handleSlowRewind}>&lt;</button>
            <button className='navButton p-10' onClick={props.handlePlayPause}>{props.playerStatus.isPlaying ? 'Pause' : 'Play'}</button>
            <button className='navButton p-10' onClick={props.handleSlowMotion}>&gt;</button>
            <button className='navButton p-10' onClick={props.handleMediumMotion}>&gt;&gt;</button>
            <button className='navButton p-10' onClick={props.handleFastForward}>&gt;&gt;&gt;</button>
            <button className='navButton p-10' onClick={props.handleAddOne}>+1</button>
            <button className='navButton p-10' onClick={props.handleJumpToEnd}>=&gt;|</button>
        </React.Fragment>
    );
});

export default VideoNavigation;