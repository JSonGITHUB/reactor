import React, { useState, useRef, useEffect } from 'react';
import videoFile from '../../assets/1.MP4';
import VideoNavigation from './VideoNavigation';
import { TextField } from '@material-ui/core';
//const VideoPlayer = ({ src, startTime, endTime, onTimeUpdate }) => {
const VideoPlayer = React.forwardRef((props, ref) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [playerStatus, setPlayerStatus] = useState({
    videoRef: ref,
    isPlaying: false,
    isSlow: false,
    isMedium: false,
    isSlowRewind: false,
    isMediumRewind: false,
    playbackRate: 1
  });
  //const videoRef = useRef(playerStatus.videoRef);
  let time = (playerStatus.videoRef.current !== null) ? playerStatus.videoRef.current.currentTime : '00:00:00';
  console.log('props: ', props)

  useEffect(() => {
    const updateCurrentTime = () => {
      if (playerStatus.videoRef.current.currentTime >= playerStatus.endTime) {
        setPlayerStatus(prevState => ({
          ...prevState,
          isPlaying: false,
          isRewind: false,
          isFast: false,
          isSlow: false,
          isMedium: false,
          isSlowRewind: false,
          isMediumRewind: false
        }));
      }
      /*
      if (playerStatus.endTime > playerStatus.videoRef.current.duration) {
        alert(`playerStatus.endTime(${playerStatus.endTime}) > playerStatus.videoRef.current.duration (${playerStatus.videoRef.current.duration})`)
        endChange(playerStatus.videoRef.current.duration)
        setPlayerStatus(prevState => ({
          ...prevState,
          endTime: playerStatus.videoRef.current.duration
        }));
      }
      */
      setCurrentTime(playerStatus.videoRef.current.currentTime);
    };
    // Attach the time update event listener
    playerStatus.videoRef.current.addEventListener('timeupdate', updateCurrentTime);
    // Clean up the event listener on component unmount
    return () => {
      playerStatus.videoRef.current.removeEventListener('timeupdate', updateCurrentTime);
    };
  }, []);

  useEffect(() => {
    const speed = (playerStatus.isMediumRewind) ? 250 : 80;
    const interval = (playerStatus.isSlowRewind) ? 300 : speed;
    const intervalId = setInterval(() => {
      const currentTime = playerStatus.videoRef.current.currentTime;
      const time = currentTime - 0.05;
      if ((playerStatus.isSlowRewind || playerStatus.isMediumRewind || playerStatus.isRewind) && playerStatus.isPlaying && (time > (playerStatus.startTime))) {
        playerStatus.videoRef.current.currentTime = time;
      } else {
        clearInterval(intervalId);
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
    }
  }, [
    playerStatus.isPlaying,
    playerStatus.isSlowRewind,
    playerStatus.isMediumRewind,
    playerStatus.isRewind,
    playerStatus.startTime,
    playerStatus.videoRef
  ]);

  const handleJumpToStart = () => {
    //console.log(`handleJumpToStart startTime: ${playerStatus.startTime}`);
    //alert(`handleJumpToStart startTime1: ${playerStatus.startTime}`);
    playerStatus.videoRef.current.currentTime = playerStatus.startTime || 0;
    setPlayerStatus(prevState => ({
      ...prevState,
      isPlaying: false,
      isRewind: false,
      isFast: false,
      isSlow: false,
      isMedium: false,
      isSlowRewind: false,
      isMediumRewind: false
    }));
  };
  const handleJumpToEnd = () => {
    //console.log(`handleJumpToEnd id: ${id}`);
    //alert(`handleJumpToEnd id: ${id} endTime1: ${status.endTime1}`);
    playerStatus.videoRef.current.currentTime = playerStatus.endTime;

    setPlayerStatus(prevState => ({
      ...prevState,
      isPlaying: false,
      isRewind: false,
      isFast: false,
      isSlow: false,
      isMedium: false,
      isSlowRewind: false,
      isMediumRewind: false
    }));
  };
  const handlePlayPause = () => {
    console.log("handlePlayPause");
    if (playerStatus.isPlaying) {
      console.log("handlePlayPause => pause");
      playerStatus.videoRef.current.pause();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: false,
        isRewind: false,
        isFast: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false
      }));
    } else {
      console.log("handlePlayPause => play");
      playerStatus.videoRef.current.playbackRate = 1;
      playerStatus.videoRef.current.play();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false,
        isRewind: false,
        isFast: false
      }));
    }
  };

  const handleRewind = () => {
    if (playerStatus.videoRef.current && playerStatus.isRewind === false) {
      console.log("handleRewind");
      playerStatus.videoRef.current.pause();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isRewind: true,
        isFast: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false
      }));
    }
  };
  const handleMinusOne = () => {
    if (playerStatus.videoRef.current) {
      console.log("handleMinusOne");
      playerStatus.videoRef.current.pause();
      playerStatus.videoRef.current.currentTime -= 0.05;
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: false,
        isRewind: false,
        isFast: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false
      }));
    }
  };
  const handleAddOne = () => {
    if (playerStatus.videoRef.current) {
      console.log("handlePlusOne");
      playerStatus.videoRef.current.pause();
      playerStatus.videoRef.current.currentTime += 0.05;
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: false,
        isRewind: false,
        isFast: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false
      }));
    }
  };

  const handleSlowRewind = () => {
    if (playerStatus.videoRef.current && playerStatus.isSlowRewind === false) {
      console.log("handleSlowMotionRewind");
      playerStatus.videoRef.current.pause();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isRewind: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: true,
        isMediumRewind: false,
        isFast: false
      }));
    }
  };

  const handleMediumRewind = () => {
    if (playerStatus.videoRef.current && playerStatus.isMediumRewind === false) {
      console.log("handleMediumMotionRewind");
      playerStatus.videoRef.current.pause();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isRewind: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: true,
        isFast: false
      }));
    }
  };

  const handleSlowMotion = () => {
    if (playerStatus.videoRef.current && playerStatus.isSlow === false) {
      console.log("handleSlowMotion");
      playerStatus.videoRef.current.playbackRate = .2;
      playerStatus.videoRef.current.play();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isSlow: true,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false,
        isRewind: false,
        isFast: false,
        playbackRate: 0.2
      }));
    }
  };
  const handleMediumMotion = () => {
    if (playerStatus.videoRef.current && playerStatus.isMedium === false) {
      console.log("handleMediumMotion");
      playerStatus.videoRef.current.playbackRate = .5;
      playerStatus.videoRef.current.play();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isSlow: false,
        isMedium: true,
        isSlowRewind: false,
        isMediumRewind: false,
        isRewind: false,
        isFast: false,
        playbackRate: 0.5
      }));
    }
  };

  const handleFastForward = () => {
    if (playerStatus.videoRef.current && playerStatus.isFast === false) {
      console.log("handleFastMotion");
      playerStatus.videoRef.current.playbackRate = 2;
      playerStatus.videoRef.current.play();
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isFast: true,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false,
        isRewind: false,
        playbackRate: 0.5
      }));
    }
  };
  const handleTimeUpdate = () => {
    props.onTimeUpdate(time);
    if (time >= playerStatus.endTime) {
      playerStatus.videoRef.current.pause();
      playerStatus.videoRef.current.currentTime = playerStatus.endTime;
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: false
      }));
    } else if (time <= playerStatus.startTime) {
      playerStatus.videoRef.current.pause();
      playerStatus.videoRef.current.currentTime = playerStatus.startTime;
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: false
      }));
    }
  };

  const handleScrub = e => {
    const x = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;
    const duration = playerStatus.videoRef.current.duration;
    const scrubTime = (x / width) * duration;
    playerStatus.videoRef.current.currentTime = scrubTime;
  };
  const startChange = (value) => {
    props.onStartTimeUpdate(value);
    setPlayerStatus(prevState => ({
      ...prevState,
      startTime: value,
      currentTime: playerStatus.videoRef.current.currentTime
    }));
  }
  const endChange = (value) => {
    props.onEndTimeUpdate(value);
    setPlayerStatus(prevState => ({
      ...prevState,
      endTime: value,
      currentTime: playerStatus.videoRef.current.currentTime
    }));
  }

  const handleStartChange = (event) => {
    const { value } = event.target;
    props.onStartTimeUpdate(value);
    setPlayerStatus(prevState => ({
      ...prevState,
      startTime: value,
      currentTime: playerStatus.videoRef.current.currentTime
    }));
  }

  function handleEndChange(event) {
    const { value } = event.target;
    props.onEndTimeUpdate(value);
    setPlayerStatus(prevState => ({
      ...prevState,
      endTime: value,
      currentTime: playerStatus.videoRef.current.currentTime
    }));
  }
  const timeDisplay = () => {
    console.log(`timeDisplay: ${time} of ${playerStatus.videoRef.current.duration}`)
    return <div className='timerBox'>
      {playerStatus.videoRef.current.currentTime} of {playerStatus.videoRef.current.duration}
    </div>
  }
  const handleVideoUpdate = (event) => {
    const { currentTime } = event.target;
    if (currentTime > playerStatus.endTime) {
      playerStatus.videoRef.current.pause();
      playerStatus.videoRef.current.currentTime = playerStatus.endTime;
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: false,
        isRewind: false,
        isFast: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false,
        currentTime: currentTime
      }));
    } else if (currentTime <= playerStatus.startTime) {
      playerStatus.videoRef.current.pause();
      playerStatus.videoRef.current.currentTime = playerStatus.startTime;
      setPlayerStatus(prevState => ({
        ...prevState,
        isPlaying: false,
        isRewind: false,
        isFast: false,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false,
        currentTime: playerStatus.videoRef.current.currentTime
      }));
    }
  };

  return (
    <div>
      <video
        ref={playerStatus.videoRef}
        //src={props.src}
        src={videoFile}
        onTimeUpdate={handleVideoUpdate}
        style={{
          width: `100%`,
          height: `auto`,
        }}

        onLoadedMetadata={() => {
          if (time !== null) {
            time = props.startTime;
            playerStatus.videoRef.current.playbackRate = 1;
          }
        }}
      />
      <div className='videoNavigation'>
          <VideoNavigation 
            handleJumpToStart={() => handleJumpToStart()}
            handleMinusOne={() => handleMinusOne()}
            handleRewind={() => handleRewind()}
            handleMediumRewind={() => handleMediumRewind()}
            handleSlowRewind={() => handleSlowRewind()}
            handlePlayPause={() => handlePlayPause()}
            handleSlowMotion={() => handleSlowMotion()}
            handleMediumMotion={() => handleMediumMotion()}
            handleFastForward={() => handleFastForward()}
            handleAddOne={() => handleAddOne()}
            handleJumpToEnd={() => handleJumpToEnd()}
            playerStatus={playerStatus}
          />
      </div>
      <div>
        <div><span className='p-20'>{playerStatus.startTime}</span><span className='p-20'>{currentTime}</span><span className='p-20'>{playerStatus.endTime}</span></div>
      </div>
      <button onClick={() => startChange(currentTime)}>Start Mark</button><input type="text" value={playerStatus.startTime} onChange={handleStartChange} />
      <button onClick={() => endChange(currentTime)}>End Mark</button><input type="text" value={playerStatus.endTime} onChange={handleEndChange} />
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            //width: `${((playerStatus.videoRef.current?.currentTime || 0) / playerStatus.videoRef.current?.duration) * 100}%`,
            width: '100px',
            backgroundColor: 'blue',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            backgroundColor: '00FF00',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            zIndex: 1,
          }}
          onClick={handleScrub}
        />
      </div>
    </div>
  );
});

export default VideoPlayer;