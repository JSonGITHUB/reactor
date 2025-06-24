import React, { useState } from 'react';
import icons from '../site/icons';

const VideoNavigation = React.forwardRef((props, ref) => {
    console.log(`VideoNavigation props.playerStatus.isPlaying: ${props.playerStatus.isPlaying}`);
    const [slider, setSlider] = useState(0);
    
    const handleScrub = (event) => {
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
        setSlider(sliderValue);
    };

    return (
        <div className='mt--50'>
            <div className='containerDetail mb--5 button'>
                <input 
                    id='range'
                    name='range'
                    type='range' 
                    min='0' 
                    max='100' 
                    value={slider} 
                    onChange={handleScrub} 
                />
            </div>
            <div className='containerBox flexContainer bg-dark'>
                <div className='flex1Auto button m-5' onClick={props.handleJumpToStart}>{icons.start}</div>
                <div className='flex1Auto button m-5' onClick={props.handleMinusOne}>-1</div>
                <div className='flex1Auto button m-5' onClick={props.handleSlowRewind}>
                    {icons.back}
                </div>
                <div className='flex1Auto button m-5' onClick={props.handlePlayPause}>
                    {props.playerStatus.isPlaying ? icons.pause : icons.play}
                </div>
                <div className='flex1Auto button m-5' onClick={props.handleSlowMotion}>
                    <div className='size25'>
                        {icons.play}
                    </div>
                </div>
                <div className='flex1Auto button m-5' onClick={props.handleMediumMotion}>
                    <div className='size30'>
                        {icons.play}
                    </div>
                </div>
                <div className='flex1Auto button m-5' onClick={props.handleFastForward}>
                    <div className='size35'>
                        {icons.play}
                    </div>
                </div>
                <div className='flex1Auto button m-5' onClick={props.handleAddOne}>
                    +1
                </div>
                <div className='flex1Auto button m-5' onClick={props.handleJumpToEnd}>
                    {icons.end}
                </div>
            </div>
        </div>
    );
});

export default VideoNavigation;