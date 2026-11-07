import React, { useState } from 'react';
import { requestProvider } from '../../services/providerApi';
const Photos = () => {
    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState([]);

    const fetchPhotos = async () => {
        if (!query) return;
        const data = await requestProvider('photos', { query });
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
                        <div className='containerDetail color-lite copyright'>
                            {photo.alt_description}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Photos;