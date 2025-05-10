import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

const Video = forwardRef(({ src1, src2}, ref) => {

  const [currentTime1, setCurrentTime1] = useState(0);
  const [currentTime2, setCurrentTime2] = useState(0);
  const videoPlayer1Ref = useRef(null);
  const videoPlayer2Ref = useRef(null);

  const [status, setStatus] = useState({
    currentTime1: currentTime1,
    currentTime2: currentTime2,
    videoRef: ref,
    isPlaying: false,
    isSlow: false,
    isSlowRewind: false
  });

  useEffect(() => {
    const interval = (status.isSlowRewind) ? 250 : 80;
    const intervalId = setInterval(() => {
      if ((status.isSlowRewind || status.isRewind) && status.isPlaying) 
        console.log(`No REEEEEEwind!!!`);
        //status.videoRef.current.currentTime -= 0.05;
        videoPlayer1Ref.current.pause();
        videoPlayer2Ref.current.pause();
    }, interval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [
    status.isSlow, 
    status.isPlaying, 
    status.isSlowRewind, 
    status.isFast, 
    status.isRewind, 
    status.videoRef
  ]);   

  const handleTimeUpdate1 = time => {
    setCurrentTime1(time);
    /*
    setStatus(prevState => ({
      ...prevState,
      isPlaying: false,
      isRewind: false,
      isFast: false,
      isSlow: false,
      isSlowRewind: false,
      currentTime1: time,
    }));
    */
  };

  const handleTimeUpdate2 = time => {
    setCurrentTime2(time);
    /*
    setStatus(prevState => ({
      ...prevState,
      isPlaying: false,
      isRewind: false,
      isFast: false,
      isSlow: false,
      isSlowRewind: false,
      currentTime2: time,
    }));
    */
  };

  useImperativeHandle(ref, () => ({
    setStatus,
  }));
  
  const handleSlowRewind = () => {
    if (videoPlayer1Ref.current && status.isSlowRewind === false) {
      console.log("handleSlowMotionRewind");
      videoPlayer1Ref.current.pause();
      videoPlayer2Ref.current.pause();
      setStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isRewind: false,
        isSlow: false,
        isSlowRewind: true,
        isFast: false
      }));
    }
  };
  const handleRewind = () => {
    if (videoPlayer1Ref.current && status.isRewind === false) {
      console.log("handleRewind");
      videoPlayer1Ref.current.pause();
      videoPlayer2Ref.current.pause();
      setStatus(prevState => ({
        ...prevState,
        isPlaying: false,
        isRewind: true,
        isSlow: false,
        isSlowRewind: false,
        isFast: false
      }));
    }
  };
  
  const handleControlClick = action => {
    console.log('handleControlClick: ', action);
    if (action === 'slowMotion') {
      videoPlayer1Ref.current.playbackRate = .5;
      videoPlayer2Ref.current.playbackRate = .5;
      videoPlayer1Ref.current.play();
      videoPlayer2Ref.current.play();
    } else if (action === 'fastForward') {
      videoPlayer1Ref.current.playbackRate = 2;
      videoPlayer2Ref.current.playbackRate = 2;
      videoPlayer1Ref.current.play();
      videoPlayer2Ref.current.play();
    } else if (action === 'rewind') {
      handleRewind();
    } else if (action === 'slowRewind') {
      handleSlowRewind();
    } else if (action === 'pause') {
      videoPlayer1Ref.current.pause();
      videoPlayer2Ref.current.pause();
    } else {
      videoPlayer1Ref.current.playbackRate = 1;
      videoPlayer2Ref.current.playbackRate = 1;
      videoPlayer1Ref.current.play();
      videoPlayer2Ref.current.play();
    }
    console.log(`handlePlayPause => status.isPlaying: ${status.isPlaying}`);
    if (status.isPlaying) {
      setStatus(prevState => ({
        ...prevState,
        isPlaying: false,
        isRewind: false,
        isFast: false,
        isSlow: false,
        isSlowRewind: false,
      }));
    } else {
      setStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isSlow: false,
        isSlowRewind: false,
        isRewind: false,
        isFast: false,
      }));
    }
  };

  return (
    <div>
      <div>
        <div>
          <VideoPlayer
            src={src1}
            onTimeUpdate={handleTimeUpdate1}
            startTime={0}
            endTime={10}
            playStatus={true}
            ref={videoPlayer1Ref}
            status={status}
          />
        </div>
        <div>
          <VideoPlayer
            src={src2}
            onTimeUpdate={handleTimeUpdate2}
            ref={videoPlayer2Ref}
            playStatus={true}
            startTime={0}
            endTime={10}
            status={status}
          />
        </div>
      </div>
      <div>
        <button className='navButton p-30 button' onClick={() => handleControlClick('play')}>Play</button>
        <button className='navButton p-30 button' onClick={() => handleControlClick('pause')}>Pause</button>
        <button className='navButton p-30 button' onClick={() => handleControlClick('rewind')}>Rewind</button>
        <button className='navButton p-30 button' onClick={() => handleControlClick('slowRewind')}>Slow Rewind</button>
        <button className='navButton p-30 button' onClick={() => handleControlClick('slowMotion')}>Slow Motion</button>
        <button className='navButton p-30 button' onClick={() => handleControlClick('fastForward')}>Fast Forward</button>
      </div>
    </div>
  );
});

export default Video;