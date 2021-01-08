import React, {useState} from 'react';
import SearchBar from './utils/SearchBar';
import YouTube from './utils/YouTube';
import VideoList from './utils/VideoList';
import VideoDetail from './utils/VideoDetail';
import { youtubeAPI_KEY, youtubeAPI_BASE_URL } from '../apis/config';

const Videos = () => {

  const KEY = youtubeAPI_KEY;
  const api = youtubeAPI_BASE_URL;
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); 

  const onTermSubmit = async term => {
    console.log(`onTermSubmit =====> ${term}`);
    const response = await YouTube.get("/search", {
      params: {
        q: term,
        part: "snippet",
        maxResults: 5,
        type: 'video',
        key: KEY
      }
    });
    setVideos(response.data.items);
  };
  const onVideoSelect = (video) => {
    console.log(`video: ${JSON.stringify(video, null, 2)}`)
    setSelectedVideo(video);
  }
  /*
  componentDidMount() {
    this.onTermSubmit("Jamie O'Brien")
  }
  */
  return (
    <div>
      <SearchBar onSubmit={onTermSubmit} KEY={KEY} api={api} term='Tidal Wave' />
      <div>
        <div>
          <div>
            <VideoDetail video={selectedVideo} />
          </div>
          <div className='flexContainer'>
            <div className='flex3Column10Percent'></div>
            <div className='flex3Column80Percent'>
              <VideoList onVideoSelect={onVideoSelect} videos={videos} />
            </div>
            <div className='flex3Column10Percent'></div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Videos;