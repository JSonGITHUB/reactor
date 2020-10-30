import React from 'react';
import SearchBar from './utils/SearchBar';
import YouTube from './utils/YouTube';

class Videos extends React.Component {

    state = { 
        videos: [],
        KEY: '',
        api: 'https://www.googleapis.com/youtube/v3'
    };

    onTermSubmit = async term => {
        console.log(`onTermSubmit =====> ${term}`)
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
      };
 
    render() {
        return (
            <div className="ui container" style={{ marginTop: '10px'}}>
                <SearchBar onSubmit={this.onTermSubmit} KEY={this.state.KEY} api={this.state.api} />
                I have {this.state.videos.length} videos.
            </div>
        )
    }
}
export default Videos;