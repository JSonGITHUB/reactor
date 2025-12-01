import React, { useState, useEffect } from 'react';

const Location = ({
    mode
}) => {
    const [location, setLocation] = useState(null);
    const [data, setData] = useState(null);
    const [zipCode, setZipCode] = useState('');
    const [city, setCity] = useState('');
    const [road, setRoad] = useState('');
    const [address, setAddress] = useState('');
    const [suburb, setSuburb] = useState('');
    const [county, setCounty] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });

                try {
                    // Use Nominatim reverse geocoding API
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                    );
                    const data = await response.json();
                    setData(data);
                    const zip =
                        data.address.postcode ||
                        data.address.zip ||
                        'No zip code found for your location.';
                    setZipCode(zip);
                    const address = data.address;
                    setAddress(address);
                    const road = address.road || '';
                    setRoad(road);
                    const suburb = address.suburb || '';
                    setSuburb(suburb);
                    const city = address.city || address.town || address.village || '';
                    setCity(city);
                    const state = address.state || '';
                    setState(state);
                    const country = address.country || '';
                    setCountry(country);
                    const county = address.county || '';
                    setCounty(county);

                    // Extract city/town/village/hamlet/county from address (best-effort)
                    const cityName =
                        data.address.city ||
                        data.address.town ||
                        data.address.village ||
                        data.address.hamlet ||
                        data.address.county ||
                        '';
                    setCity(cityName);
                } catch (err) {
                    setError('Failed to retrieve zip code from location data.');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError('Unable to retrieve your location. Please allow location access.');
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        getLocation();
    }, []);
    useEffect(() => {
        console.log(`Location => useEffect => data: ${JSON.stringify(data, null, 2)}`);
    }, [data]);

    return (zipCode && mode === 'zipOnly')
        ? (location && zipCode) ? zipCode : 'Loading zip code...'
        : <div className='containerDetail mr-5 ml-5 mt--20'>
            <div className='containerDetail m-5 bg-lite color-yellow size20 p-10 contentLeft'>
                Find My Zip Code
            </div>
            <div
                className='containerDetail m-5 bg-blue color-lite p-20 size20 button'
                onClick={getLocation} disabled={loading}
            >
                {loading ? 'Getting Location...' : 'Current Location'}
            </div>

            {error && <div className='color-red mt-10'>{error}</div>}

            {location && (
                <div className='containerDetail m-5 bg-lite size20 bg-lite contentLeft'>

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
                            {state || 'State not available'}
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
            )}
        </div>
};

export default Location;