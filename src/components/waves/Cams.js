import React, { useMemo, useState } from 'react';
import getSurfSpots from './SurfSpots';

const Cams = () => {
    const [search, setSearch] = useState('');

    const camSpots = useMemo(() => {
        return getSurfSpots()
            .filter((spot) => Boolean(spot.cam))
            .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }, []);

    const filteredSpots = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        if (!searchTerm) {
            return camSpots;
        }

        return camSpots.filter((spot) => String(spot.name).toLowerCase().includes(searchTerm));
    }, [camSpots, search]);

    return <div>
        <div className='containerDetail mt-25'>
            <div className='containerDetail p-10 bg-dark'>
                <input
                    id='cams-search'
                    name='cams-search'
                    type='text'
                    className='containerDetail p-20 size20 m-5 color-yellow color-lite bg-dark width--10'
                    placeholder='Search cam locations...'
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <div className='containerDetail color-yellow ml-10 copyright mt-10 contentLeft'>
                    {filteredSpots.length} cam{filteredSpots.length === 1 ? '' : 's'}
                </div>
            </div>
        </div>
        <div className='height--220' style={{ overflowY: 'auto' }}>
            {
                filteredSpots.map((spot) => <div key={`${spot.name}-cam`} className=''>
                    <div
                        className='containerDetail button bg-lite flexContainer centerVertical mb-5'
                        onClick={() => window.open(spot.cam, '_blank')}
                    >
                        <div className='flexColumn contentRight containerDetail mr-10 bg-lite color-lite w-50 noScroll size60'>
                            🌅
                        </div>
                        <div className='flex2Column color-yellow size20 contentLeft ml-10'>
                            {spot.name}
                        </div>
                    </div>
                </div>)
            }
        </div>
    </div>;
};

export default Cams;