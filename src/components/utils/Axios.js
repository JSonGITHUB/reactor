import React from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';

class AxiosSearch extends React.Component {
    onSearchSubmit = async (term, url, key, callback) => {
        const response = await axios
            .get(url, {
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
            <SearchBar onSubmit={this.onSearchSubmit} />
            </div>
        )
    }
}
export default AxiosSearch;