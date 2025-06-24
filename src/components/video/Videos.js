import React, { useState, useEffect } from 'react';
import config from '../apis/config';
import VideoDetail from './VideoDetail';

const KEY = config.youtubeAPI_KEY;
const api = config.youtubeAPI_BASE_URL;
const YOUTUBE_API_KEY = config.youtubeAPI_KEY;

const Videos = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  useEffect(() => {
      window.scrollTo(0, 0);
  }, [selectedVideo]);

  const fetchVideos = async () => {
    if (!searchTerm) return;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          searchTerm
        )}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      setVideos(data.items || []);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  return (
    <div className='containerBox'>
      {selectedVideo && (
        <div className='containerBox'>
          <div className='relative'>
            <button
              onClick={() => setSelectedVideo(null)}
              className='containerDetail color-lite absolute rt-0 text-white'
            >
              ✕
            </button>
            <iframe
              width='100%'
              height='400'
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              frameBorder='0'
              allowFullScreen
              className='containerBox'
            ></iframe>
          </div>
        </div>
      )}
      <div className=''>
        <input
          type='text'
          placeholder='Enter video search...'
          className='containerBox width--10'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchVideos()}
        />
        {/* <div
          onClick={fetchVideos}
          className='containerDetail p-10 m-5 flex13Column button bg-green'
        >
          Search
        </div> */}
      </div>
      <div className='grid'>
        {videos.map((video) => (
          <div
            key={video.id.videoId}
            className='containerBox button'
            onClick={() => setSelectedVideo(video.id.videoId)}
          >
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className='containerBox'
            />
            <p className='containerBox color-yellow columnLeftAlign ml-auto mr-auto'>{video.snippet.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Videos;