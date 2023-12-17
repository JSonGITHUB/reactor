import React, { useRef, useState } from 'react';

const PlayerNavigation = () => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleSlowMotion = () => {
    videoRef.current.playbackRate = 0.5; // Adjust the playback rate as needed
  };

  const handleSlowRewind = () => {
    videoRef.current.playbackRate = -1; // Negative value for reverse playback
  };

  const handleJumpToStart = () => {
    videoRef.current.currentTime = 0;
  };

  const handleJumpToEnd = () => {
    videoRef.current.currentTime = videoRef.current.duration;
  };

  const handleScrub = (event) => {
    const scrubTime = event.target.value;
    videoRef.current.currentTime = scrubTime;
    setCurrentTime(scrubTime);
  };

  const handleTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
    setCurrentTime(currentTime);
  };

  return (
    <div>
      <video ref={videoRef} onTimeUpdate={handleTimeUpdate}>
        {/* Video source and other video properties */}
      </video>

      <div>
        {/* UI for video controls */}
        <button onClick={handlePlayPause}>Play/Pause</button>
        <button onClick={handleSlowMotion}>Slow Motion</button>
        <button onClick={handleSlowRewind}>Slow Rewind</button>
        <button onClick={handleJumpToStart}>Jump to Start Keyframe</button>
        <button onClick={handleJumpToEnd}>Jump to End Keyframe</button>
        <input type="range" min="0" max="100" value={currentTime} onChange={handleScrub} />
        {/* Display current timecode */}
        <span>Current Timecode: {formatTime(currentTime)}</span>
      </div>
    </div>
  );
}

// Helper function to format time in HH:MM:SS format
const formatTime = (time) => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  return formattedTime;
}

// Helper function to pad single digit with leading zero
const padZero = (number) => {
  return number.toString().padStart(2, '0');
}

export default PlayerNavigation;