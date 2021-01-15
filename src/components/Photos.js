import React, {useState} from 'react';
import SearchBar from './utils/SearchBar';
import UnSplash from './utils/UnSplash';
import config from '../apis/config';

const Photos = () => {

    const [photos, setPhotos] = useState([]);
    const KEY = 'Client-ID '+config.unsplashAPI_KEY;
    const api = config.unsplashAPI_BASE_URL;
    console.log(`KEY: ${KEY}\napi: ${api}`)
    const onSearchSubmit = async (term, callback) => {
        const response = await UnSplash.get(api, {
                params: {query: term},
                headers: {
                    Authorization: KEY//need to get key
                }
            })
            .then (response => {
                const images = [];
                console.log(`response.data.results: ${response.data.results}`)
                response.data.results.map((item, index) => {
                    images.push({
                        'image': item.urls.thumb,
                        'description': item.alt_description,
                        'location': item.user.location
                    });
                })
                setPhotos(images);
                return callback(images)
            });
    }
    return (
        <div className="ui container">
            <SearchBar onSubmit={onSearchSubmit} api={api} KEY={KEY} term='Wave'/>
            <div className='white p-10'>{photos.length} photos.</div>
        </div>
    )
}
export default Photos;