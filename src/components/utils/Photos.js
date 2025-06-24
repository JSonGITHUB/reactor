import React, { useState } from 'react';
import config from '../apis/config';

const Photos = () => {

    const KEY = 'Client-ID ' + config.unsplashAPI_KEY;
    const api = config.unsplashAPI_BASE_URL;

    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState([]);

    const fetchPhotos = async () => {
        if (!query) return;
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&client_id=${config.unsplashAPI_KEY}`
        );
        const data = await response.json();
        setPhotos(data.results);
    };

    return (
        <div className='containerBox'>
            <div className='containerBox'>
                <textarea
                    className='containerBox width-100-percent'
                    type='text'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPhotos()}
                    placeholder='Enter keywords to search photos...'
                />
            </div>
            <div className='containerBox'>
                {photos.map((photo) => (
                    <div key={photo.id} className='containerBox'>
                        <img
                            src={photo.urls.small}
                            alt={photo.alt_description}
                            className='width-100-percent'
                        />
                        <div className='containerDetail color-dark copyright'>
                            {photo.alt_description}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Photos;