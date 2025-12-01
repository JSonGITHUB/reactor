import React, { useState } from 'react';
const Photos = () => {

    const KEY = process.env.REACT_APP_UNSPLASH_API_KEY;
    const api = process.env.REACT_APP_UNSPLASH_API_BASE_URL;

    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState([]);

    const fetchPhotos = async () => {
        if (!query) return;
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&client_id=${KEY}`
        );
        const data = await response.json();
        setPhotos(data.results);
    };

    return (
        <div className='mt--30'>
            <div className='containerBox bg-lite'>
                <textarea
                    className='containerBox width--10 ht-50'
                    type='text'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPhotos()}
                    placeholder='Enter keywords to search photos...'
                />
            </div>
            <div>
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