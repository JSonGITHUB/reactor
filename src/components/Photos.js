import React, {useState} from 'react';
import SearchBar from './utils/SearchBar';
import UnSplash from './utils/UnSplash';
import { unsplashAPI_KEY, unsplashAPI_BASE_URL } from '../apis/config';

const Photos = () => {

    const [photos, setPhotos] = useState([]);
    const KEY = unsplashAPI_KEY;
    const api = unsplashAPI_BASE_URL;

    const onSearchSubmit = async (term, callback) => {
        const response = await UnSplash.get(api, {
                params: {query: term},
                headers: {
                    Authorization: KEY//need to get key
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