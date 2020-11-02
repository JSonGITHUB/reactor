import React from 'react';
import SearchBar from './utils/SearchBar';
import UnSplash from './utils/UnSplash';

class Photos extends React.Component {

    state = { 
        photos: [],
        KEY: '',
        api: 'https://api.unsplash.com/search/photos'
    };

    onSearchSubmit = async (term, callback) => {
        const response = await UnSplash.get(this.state.api, {
                params: {query: term},
                headers: {
                    Authorization: this.state.KEY//need to get key
                }
            })
            .then (response => {
                const images = [];
                response.data.results.map((item, index) => {
                    images.push({
                        'image': item.urls.thumb,
                        'description': item.alt_description,
                        'location': item.user.location
                    });
                })
                this.setState({ photos: images })
                return callback(images)
            });
    }  
    render() {
        return (
            <div className="ui container" style={{ marginTop: '10px'}}>
            <SearchBar onSubmit={this.onSearchSubmit} api={this.state.api} KEY={this.state.KEY}/>
            <div className='white'>{this.state.photos.length} photos.</div>
            </div>
        )
    }
}
export default Photos;