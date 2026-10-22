import React, { useEffect } from 'react';
import useLocationData from './useLocationData';

const Location = ({
    mode,
    onLocationData
}) => {
    const {
        snapshot,
        requestLocation,
        location,
        data,
        zipCode,
        city,
        road,
        suburb,
        county,
        state: region,
        country,
        loading,
        error
    } = useLocationData({ autoRequest: true });

    useEffect(() => {
        if (onLocationData) {
            onLocationData(snapshot);
        }
    }, [onLocationData, snapshot]);
    useEffect(() => {
        console.log(`Location => useEffect => data: ${JSON.stringify(data, null, 2)}`);
    }, [data]);

    return (zipCode && mode === 'zipOnly')
        ? (location && zipCode) ? zipCode : 'Loading zip code...'
        : <div className='containerDetail mr-5 ml-5 mt--20'>
            <div className='containerDetail m-5 bg-lite color-yellow size20 p-20 contentLeft'>
                Find My Zip Code
            </div>
            <div
                className='containerDetail m-5 bg-blue color-lite p-20 size20 button'
                onClick={requestLocation} disabled={loading}
            >
                {loading ? 'Getting Location...' : 'Current Location'}
            </div>

            {error && <div className='color-red mt-10'>{error}</div>}

            {location && <div className='containerDetail m-5 bg-lite size20 bg-lite contentLeft'>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            Coordinates:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </div>
                    </div>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            Road:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {road || 'Road not available'}
                        </div>
                    </div>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            Suburb:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {suburb || 'Suburb not available'}
                        </div>
                    </div>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            City:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {city || 'City not available'}
                        </div>
                    </div>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            County:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {county || 'County not available'}
                        </div>
                    </div>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            State / Region:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {region || 'State not available'}
                        </div>
                    </div>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            Country:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {country || 'Country not available'}
                        </div>
                    </div>

                    <div className='containerDetail m-5 bg-lite size20 bg-lite'>
                        <div className='containerDetail m-5 bg-lite size20 bg-lite color-yellow p-10'>
                            Zip Code:
                        </div>
                        <div className='containerDetail m-5 bg-tintedMedium size20 color-lite p-10'>
                            {zipCode || 'Zip not available'}
                        </div>
                    </div>
                </div>
            }
        </div>
};

export default Location;