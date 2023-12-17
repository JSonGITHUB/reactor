import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import VideoNavigation from './VideoNavigation';

const DualVideoPlayer = forwardRef(({ src1, src2 }, ref) => {

  const [status, setStatus] = useState({
    startTime1: 0,
    startTime2: 0,
    videoPlayer1Ref: useRef(null),
    videoPlayer2Ref: useRef(null),
    isPlaying: false,
    isSlow: false,
    isSlowRewind: false,
    isMediumRewind: false,
    isMedium: false,
    isFast: false
  });

  useEffect(() => {
    const speed = (status.isMediumRewind) ? 250 : 80;
    const interval = (status.isSlowRewind) ? 300 : speed;
    console.log(`status startTime1: ${(status.startTime1) ? status.endTime1 : '??'}`);
    console.log(`status startTime2: ${(status.endTime2) ? status.endTime2 : '??'}`);
    console.log(`status endTime1: ${(status.endTime1) ? status.endTime1 : '??'}`);
    console.log(`status endTime2: ${(status.endTime2) ? status.endTime2 : '??'}`);
    const intervalId = setInterval(() => {
      const time1 = status.videoPlayer1Ref.current.currentTime - 0.05;
      const time2 = status.videoPlayer2Ref.current.currentTime - 0.05;
      if ((status.isSlowRewind || status.isMediumRewind || status.isRewind) && status.isPlaying && ((status.videoPlayer1Ref.current.currentTime > status.startTime1) || (status.videoPlayer2Ref.current.currentTime > status.startTime2))) {
        console.log(`SLOOOOW REEEEEEwind!!! status.videoPlayer1Ref.current.currentTime: ${status.videoPlayer1Ref.current.currentTime} startTime1: ${status.startTime1} status.videoPlayer2Ref.current.currentTime: ${status.videoPlayer2Ref.current.currentTime}  startTime2: ${status.startTime2}`)
        if (status.videoPlayer1Ref.current.currentTime > (status.startTime1)) status.videoPlayer1Ref.current.currentTime = time1;
        if (status.videoPlayer2Ref.current.currentTime > (status.startTime2)) status.videoPlayer2Ref.current.currentTime = time2;
      } else if ((status.isSlowRewind || status.isMediumRewind || status.isRewind) && status.isPlaying && ((status.videoPlayer1Ref.current.currentTime <= status.startTime1) && (status.videoPlayer2Ref.current.currentTime <= status.startTime2))) {
        console.log(`STOOOOP SLOOOOW REEEEEEwind!!! status.videoPlayer1Ref.current.currentTime: ${status.videoPlayer1Ref.current.currentTime} startTime1: ${status.startTime1} status.videoPlayer2Ref.current.currentTime: ${status.videoPlayer2Ref.current.currentTime}  startTime2: ${status.startTime2}`)
        clearInterval(intervalId);
        setStatus(prevState => ({
          ...prevState,
          isPlaying: false
        }));
      } else if (!status.isPlaying) {
        console.log(`STOOOOP REEEEEEwind!!!`)
        clearInterval(intervalId);
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
    };

  }, [status.isPlaying, status.isSlowRewind, status.isMediumRewind, status.isRewind, status.startTime1, status.startTime2, status.videoRef]);

  const handleTimeUpdate1 = time => {
    /*
    setStatus(prevState => ({
      ...prevState,
      currentTime1: time
    }));
    */
  };

  const handleTimeUpdate2 = time => {
    /*
    setStatus(prevState => ({
      ...prevState,
      currentTime2: time
    }));
    */
  };
  const handleStartTimeUpdate1 = time => {
    console.log("handleStartTimeUpdate1", time);
    setStatus(prevState => ({
      ...prevState,
      startTime1: time
    }));
  };
  const handleStartTimeUpdate2 = time => {
    console.log("handleStartTimeUpdate2", time);
    setStatus(prevState => ({
      ...prevState,
      startTime2: time
    }));
  };
  const handleEndTimeUpdate1 = time => {
    console.log("handleEndTimeUpdate1", time);
    setStatus(prevState => ({
      ...prevState,
      endTime1: time
    }));
  };
  const handleEndTimeUpdate2 = time => {
    console.log("handleEndTimeUpdate2", time);
    setStatus(prevState => ({
      ...prevState,
      endTime2: time
    }));
  };

  useImperativeHandle(ref, () => ({
    setStatus,
  }));

  const handlePlayPause = (id) => {
    console.log(`handlePlayPause id: ${id}`);
    if (status.isPlaying) {
      console.log(`handlePlayPause => pause id: ${id}`);

      if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
        status.videoPlayer1Ref.current.pause();
      };
      if ((id === '1' || id === 'both') && status.videoPlayer2Ref.current) {
        status.videoPlayer2Ref.current.pause();
      }

      setStatus(prevState => ({
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
      console.log(`handlePlayPause => play id: ${id}`);

      if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
        status.videoPlayer1Ref.current.playbackRate = 1;
        status.videoPlayer1Ref.current.play();
      }
      if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
        status.videoPlayer2Ref.current.playbackRate = 1;
        status.videoPlayer2Ref.current.play();
      }

      setStatus(prevState => ({
        ...prevState,
        isPlaying: true,
        isSlow: false,
        isMedium: false,
        isSlowRewind: false,
        isMediumRewind: false,
        isRewind: false,
        isFast: false,
      }));
    }
  };

  const handleRewind = (id) => {

    if (status.videoPlayer1Ref.current) {
      console.log(`handleRewind id: ${id}`);
      if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
        status.videoPlayer1Ref.current.pause();
      };
      if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
        status.videoPlayer2Ref.current.pause();
      };
      setStatus(prevState => ({
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
  const handleJumpToStart = (id) => {
    //console.log(`handleJumpToStart id: ${id} startTime1: ${status.startTime1} startTime2: ${status.startTime2}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
      //alert(`handleJumpToStart id: ${id} startTime1: ${status.startTime1}`);
      //status.videoPlayer1Ref.current.pause();
      status.videoPlayer1Ref.current.currentTime = status.startTime1 || 0;
    };
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
      //alert(`handleJumpToStart id: ${id} startTime2: ${status.startTime2}`);
      //status.videoPlayer2Ref.current.pause();
      status.videoPlayer2Ref.current.currentTime = status.startTime2 || 0;
    };
    setStatus(prevState => ({
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
  const handleJumpToEnd = (id) => {
    console.log(`handleJumpToEnd id: ${id}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
      //alert(`handleJumpToEnd id: ${id} endTime1: ${status.endTime1}`);
      status.videoPlayer1Ref.current.pause();
      status.videoPlayer1Ref.current.currentTime = status.endTime1;
    };
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
      //alert(`handleJumpToEnd id: ${id} endTime1: ${status.endTime2}`);
      status.videoPlayer2Ref.current.pause();
      status.videoPlayer2Ref.current.currentTime = status.endTime2;
    };
    setStatus(prevState => ({
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
  const handleMinusOne = (id) => {
    console.log(`handleMinusOne id: ${id}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
      status.videoPlayer1Ref.current.pause();
      status.videoPlayer1Ref.current.currentTime -= 0.05;
    };
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
      status.videoPlayer2Ref.current.pause();
      status.videoPlayer2Ref.current.currentTime -= 0.05;
    };
    setStatus(prevState => ({
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
  const handleAddOne = (id) => {
    console.log(`handlePlusOne: id(${id})`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
      status.videoPlayer1Ref.current.pause();
      status.videoPlayer1Ref.current.currentTime += 0.05;
    }
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
      status.videoPlayer2Ref.current.pause();
      status.videoPlayer2Ref.current.currentTime += 0.05;
    }
    setStatus(prevState => ({
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

  const handleSlowRewind = (id) => {
    console.log(`handleSlowMotionRewind id: ${id}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) status.videoPlayer1Ref.current.pause();
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) status.videoPlayer2Ref.current.pause();
    setStatus(prevState => ({
      ...prevState,
      isPlaying: true,
      isRewind: false,
      isSlow: false,
      isMedium: false,
      isSlowRewind: true,
      isMediumRewind: false,
      isFast: false
    }));
  };

  const handleMediumRewind = (id) => {
    console.log(`handleMediumMotionRewind id: ${id}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) status.videoPlayer1Ref.current.pause();
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) status.videoPlayer2Ref.current.pause();
    setStatus(prevState => ({
      ...prevState,
      isPlaying: true,
      isRewind: false,
      isSlow: false,
      isMedium: false,
      isSlowRewind: false,
      isMediumRewind: true,
      isFast: false
    }));
  };

  const handleSlowMotion = (id) => {
    console.log(`handleSlowMotion id: ${id}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
      status.videoPlayer1Ref.current.playbackRate = .2;
      status.videoPlayer1Ref.current.play();
    }
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
      status.videoPlayer2Ref.current.playbackRate = .2;
      status.videoPlayer2Ref.current.play();
    }
    setStatus(prevState => ({
      ...prevState,
      isPlaying: true,
      isRewind: false,
      isSlow: true,
      isMedium: false,
      isSlowRewind: false,
      isMediumRewind: false,
      isFast: false
    }));
  };
  const handleMediumMotion = (id) => {
    console.log(`handleMediumMotion id: ${id}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
      status.videoPlayer1Ref.current.playbackRate = .5;
      status.videoPlayer1Ref.current.play();
    }
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
      status.videoPlayer2Ref.current.playbackRate = .5;
      status.videoPlayer2Ref.current.play();
    }
    setStatus(prevState => ({
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
  };

  const handleFastForward = (id) => {
    console.log(`handleFastMotion id: ${id}`);
    if ((id === '1' || id === 'both') && status.videoPlayer1Ref.current) {
      status.videoPlayer1Ref.current.playbackRate = 2;
      status.videoPlayer1Ref.current.play();
    };
    if ((id === '2' || id === 'both') && status.videoPlayer2Ref.current) {
      status.videoPlayer2Ref.current.playbackRate = 2;
      status.videoPlayer2Ref.current.play();
    };
    setStatus(prevState => ({
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
  };

  return (
    <div>
      <div>
        <div className='dualVideoPlayer'>
          <VideoPlayer
            id='1'
            src={src1}
            onTimeUpdate={handleTimeUpdate1}
            onStartTimeUpdate={handleStartTimeUpdate1}
            onEndTimeUpdate={handleEndTimeUpdate1}
            handleJumpToStart={handleJumpToStart}
            handleMinusOne={handleMinusOne}
            handleRewind={handleRewind}
            handleMediumRewind={handleMediumRewind}
            handleSlowRewind={handleSlowRewind}
            handlePlayPause={handlePlayPause}
            handleSlowMotion={handleSlowMotion}
            handleMediumMotion={handleMediumMotion}
            handleFastForward={handleFastForward}
            handleAddOne={handleAddOne}
            handleJumpToEnd={handleJumpToEnd}
            startTime={status.startTime1}
            endTime={status.endTime1}
            playStatus={true}
            ref={status.videoPlayer1Ref}
          />
        </div>
        <div className='dualVideoPlayer'>
          <VideoPlayer
            id='2'
            src={src2}
            onTimeUpdate={handleTimeUpdate2}
            onStartTimeUpdate={handleStartTimeUpdate2}
            onEndTimeUpdate={handleEndTimeUpdate2}
            handleMinusOne={handleMinusOne}
            handleRewind={handleRewind}
            handleMediumRewind={handleMediumRewind}
            handleSlowRewind={handleSlowRewind}
            handlePlayPause={handlePlayPause}
            handleSlowMotion={handleSlowMotion}
            handleMediumMotion={handleMediumMotion}
            handleFastForward={handleFastForward}
            handleAddOne={handleAddOne}
            ref={status.videoPlayer2Ref}
            playStatus={true}
            startTime={status.startTime2}
            endTime={status.endTime2}
          />
        </div>
      </div>
      <VideoNavigation
        handleJumpToStart={() => handleJumpToStart('both')}
        handleMinusOne={() => handleMinusOne('both')}
        handleRewind={() => handleRewind('both')}
        handleMediumRewind={() => handleMediumRewind('both')}
        handleSlowRewind={() => handleSlowRewind('both')}
        handlePlayPause={() => handlePlayPause('both')}
        handleSlowMotion={() => handleSlowMotion('both')}
        handleMediumMotion={() => handleMediumMotion('both')}
        handleFastForward={() => handleFastForward('both')}
        handleAddOne={() => handleAddOne('both')}
        handleJumpToEnd={() => handleJumpToEnd('both')}
        playerStatus={status}
      />
    </div>
  );
});

export default DualVideoPlayer;