import React from 'react';
import SearchBar from './utils/SearchBar';
import YouTube from './utils/YouTube';
import VideoList from './utils/VideoList';

class Videos extends React.Component {

  state = { 
    videos: [],
    KEY: '',
    api: 'https://www.googleapis.com/youtube/v3'
  };

  onTermSubmit = async term => {
    console.log(`onTermSubmit =====> ${term}`);
    const response = await YouTube.get("/search", {
      params: {
        q: term,
        part: "snippet",
        maxResults: 5,
        type: 'video',
        key: this.state.KEY
      }
    });
    this.setState({ videos: response.data.items});
    const videos = [
      {
        title: 'cars',
        video: ''
      },
      {
        title: 'monkeys',
        video: ''
      }
    ]
    //this.setState({ videos: videos});
  };
 
    render() {
        return (
            <div className='flexContainer mt-10'>
              <div className='flex3Column'></div>
              <div className='flex3Column'>
                <SearchBar onSubmit={this.onTermSubmit} KEY={this.state.KEY} api={this.state.api} />
                <VideoList videos={this.state.videos} />
              </div>
              <div className='flex3Column'></div>
            </div>
        )
    }
}
export default Videos;