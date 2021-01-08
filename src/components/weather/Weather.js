import React, { useState } from 'react';
import { openweatherAPI_KEY, openweatherAPI_BASE_URL } from '../../apis/config';
import CitySelector from './CitySelector';

const Weather  = () => {
    const [city, setCity] = useState('London');
    //api.openweathermap.org/data/2.5/forecast?q=London,us&appid={APIKEY}
    //Metric
    //api.openweathermap.org/data/2.5/forecast?q=London,us&appid={APIKEY}&units=metric
    //Image Source
    //http://openweathermap.org/img/wn/10d@2x.png
    const key = openweatherAPI_KEY;
    const baseUrl = openweatherAPI_BASE_URL;
    const urlEnd = `/data/2.5/forecast?q=${city},us&appid=`;
    const path = '/data/2.5/forecast?q=';
    const param = ',us&appid=';
    const api = `${baseUrl}${urlEnd}${key}`

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