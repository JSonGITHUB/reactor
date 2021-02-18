import React, {useState} from 'react';
import SearchBar from './utils/SearchBar';
import YouTube from './utils/YouTube';
import VideoList from './utils/VideoList';
import VideoDetail from './utils/VideoDetail';
import config from './apis/config';

const Videos = () => {

  const [keyword, setTerm] = useState('');
  const KEY = config.youtubeAPI_KEY;
  const api = config.youtubeAPI_BASE_URL;
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); 
  
  const onChange = (value) => setTerm(value)
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
  const onFormSubmit = event =>  {
    event.preventDefault();
    console.log(`Search Term: ${keyword}`);
    onTermSubmit(keyword);
  }
  const onVideoSelect = (video) => {
    //console.log(`video: ${JSON.stringify(video, null, 2)}`)
    setSelectedVideo(video);
  }
  /*
  componentDidMount() {
    this.onTermSubmit("Jamie O'Brien")
  }
  */
  return (
    <div>
      <div className='input'>
        <SearchBar onSubmit={onFormSubmit}  onChange={onChange} label='search for videos' KEY={KEY} api={api} term='' />
      </div>
      <div className='mt-88'>
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