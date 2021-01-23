import React, { useState } from 'react';
import config from '../apis/config';
import CitySelector from './CitySelector';

const Weather  = () => {
    // eslint-disable-next-line
    const [city, setCity] = useState('London');
    //api.openweathermap.org/data/2.5/forecast?q=London,us&appid={APIKEY}
    //Metric
    //api.openweathermap.org/data/2.5/forecast?q=London,us&appid={APIKEY}&units=metric
    //Image Source
    //http://openweathermap.org/img/wn/10d@2x.png
    const key = config.openweatherAPI_KEY;
    const baseUrl = config.openweatherAPI_BASE_URL;
    const urlEnd = `/data/2.5/forecast?q=${city},us&appid=`;
    // eslint-disable-next-line
    const path = '/data/2.5/forecast?q=';
    // eslint-disable-next-line
    const param = ',us&appid=';
    const api = `${baseUrl}${urlEnd}${key}`
    // eslint-disable-next-line
    const onSearch = (term, callback) => {
        fetch(api)
        .then((response) => response.json())
        .then((result) => console.log(`${JSON.stringify(result,2, null)}`))
    };

    return (
        <CitySelector />
    )
}
export default Weather;