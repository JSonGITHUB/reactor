import React, { useState } from 'react';
const VideoNavigation = React.forwardRef((props, ref) => {
    console.log(`VideoNavigation props.playerStatus.isPlaying: ${props.playerStatus.isPlaying}`);
    const [currentTime, setCurrentTime] = useState(0);
    const [slider, setSlider] = useState(0);
    
    const handleScrub = (event) => {
        //const scrubTime = (100/props.playerStatus.videoRef.current.duration)/event.target.value;
        //props.playerStatus.videoRef.current.currentTime = scrubTime;
        //console.log(`scrubTime: ${scrubTime} value: ${event.target.value}`);
        const sliderValue = event.target.value;
        const videoDuration = (props.playerStatus.videoRef) ? props.playerStatus.videoRef.current.duration : null;
        const videoDuration1 = (props.playerStatus.videoPlayer1Ref) ? props.playerStatus.videoPlayer1Ref.current.duration : null;
        const videoDuration2 = (props.playerStatus.videoPlayer2Ref) ? props.playerStatus.videoPlayer2Ref.current.duration : null;
        const currentTime = (sliderValue / 100) * videoDuration;
        const currentTime1 = (videoDuration1!=null) ? ((sliderValue / 100) * videoDuration1) : 0;
        const currentTime2 = (videoDuration2!=null) ? ((sliderValue / 100) * videoDuration2) : 0;
        console.log(`scrubTime => currentTime: ${currentTime.toFixed(5)} value: ${event.target.value}`);
        if (!!props.playerStatus.videoRef) props.playerStatus.videoRef.current.currentTime = currentTime.toFixed(5);
        if (!!props.playerStatus.videoPlayer1Ref) props.playerStatus.videoPlayer1Ref.current.currentTime = currentTime1.toFixed(5);
        if (!!props.playerStatus.videoPlayer2Ref) props.playerStatus.videoPlayer2Ref.current.currentTime = currentTime2.toFixed(5);
        if (!!props.playerStatus.videoRef) setCurrentTime(currentTime.toFixed(5));
        if (!!props.playerStatus.videoPlayer1Ref) setCurrentTime(currentTime1.toFixed(5));
        if (!!props.playerStatus.videoPlayer2Ref) setCurrentTime(currentTime2.toFixed(5));
        //alert(`videoRef: ${!!props.playerStatus.videoRef}`)
        //alert(`videoPlayer1Ref: ${!!props.playerStatus.videoPlayer1Ref}`)
        //alert(`videoPlayer2Ref: ${!!props.playerStatus.videoPlayer2Ref}`)
        
        setSlider(sliderValue);
    };

    return (
        <React.Fragment>
            <div>
                <input type="range" min="0" max="100" value={slider} onChange={handleScrub} />
            </div>
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