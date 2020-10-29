import React from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import YouTube from './YouTube';
import UnSplash from './UnSplash';
import App from '../Reducer';

class AxiosSearch extends React.Component {

    onTermSubmit = async term => {
        console.log(`onTermSubmit =====> ${term}`)
        const response = await YouTube.get("/search", {
          params: {
            q: term,
            part: "snippet",
            maxResults: 5,
            type: 'video',
            key: 'AIzaSyDRsPztCjKmboO5QqAOSzLLn5fJDJCxUD0'
          }
        });
      };

    onSearchSubmit = async (term, url, key, callback) => {
        console.log(`onSearchSubmit =====> term: ${term} url: ${url} key: ${key}`)
        const response = await UnSplash.get(url, {
                params: {query: term},
                headers: {
                    Authorization: key //need to get key
                }
            })
            .then (response => {
                const images = [];
                console.log(`onSearchSubmit ${JSON.stringify(response.data.results, null, 2)}`);
                console.log(`onSearchSubmit ${response.data.results[0].urls.thumb}`);
                console.log(`onSearchSubmit Length: ${response.data.results.length}`);
                response.data.results.map((item, index) => {
                    console.log(`BOOM!!! ${index} => ${item.urls.thumb}`)
                    images.push({
                        'image': item.urls.thumb,
                        'description': item.alt_description,
                        'location': item.user.location
                    });
                })
                return callback(images)
            });
    }  
    render() {
        return (
            <div className="ui container" style={{ marginTop: '10px'}}>
            {/*<SearchBar onSubmit={this.onTermSubmit} />*/}
            <SearchBar onSubmit={this.onSearchSubmit} />
            </div>
        )
    }
}
export default AxiosSearch;