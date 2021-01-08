import React, {useState} from 'react';
import getKey from '../utils/KeyGenerator.js';
import { openweatherAPI_KEY, openweatherAPI_BASE_URL } from '../../apis/config';
import getDirectionIcon from './GetDirectionIcon.js';
import getDirection from './GetDirection.js';
import weekday from './Weekday.js';

const CitySelector = () => {
    //api.openweathermap.org/data/2.5/forecast?q=London,us&appid={APIKEY}
    //Metric
    //api.openweathermap.org/data/2.5/forecast?q=London,us&appid={APIKEY}&units=metric
    //Image Source
    //http://openweathermap.org/img/wn/10d@2x.png
    const key = openweatherAPI_KEY;
    const baseUrl = openweatherAPI_BASE_URL;

    const [city, setCity] = useState('Carlsbad, CA');
    const [results, setResults] = useState('');
    const urlEnd = `/data/2.5/forecast?q=${city},us&appid=`;

    const displayResults = (results) => {

        const list = results.list.map((item) => {
            const main = item.main;
            const fahrenheit = (k) => ((k - 273.15) * (9/5) + 32);
            const temp = fahrenheit(main.temp).toFixed(1);
            const temp_min = fahrenheit(main.temp_min).toFixed(1);
            const temp_max = fahrenheit(main.temp_max).toFixed(1);
            const feels_like = `feels like: ${fahrenheit(main.feels_like).toFixed(1)}°`;
            const temperature = <div>
                            <div className='color-yellow bold mb-10'>temperature: </div>
                            <div className='r-5 p-10 bg-dkGreen'>
                                {temp}°<br/>
                                <span className='copyright'>{temp_min}°</span>
                            </div>
                        </div>;
            
            const humidity = <div>
                                <div className='color-yellow bold mb-10'>humidity: </div>
                                <div className='r-5 p-10 bg-dkGreen'>
                                    {main.humidity}%
                                </div>
                            </div>
            const weather = item.weather[0];
            const mainDescription = weather.main;
            const description = weather.description;
            const icon = weather.icon;
            const wind = item.wind;
            const windSpeed = () => <div>
                                        {wind.speed.toFixed(0)}
                                        <span className='copyright'> mph</span>
                                    </div>;
            
            const windDirection = () => <div>{wind.deg}°</div>;
            const windDisplay = () => <div>
                                            <div className='color-yellow bold mb-10'>wind: </div>
                                            <div className='r-5 p-10 bg-dkGreen'>
                                                <div className="r-5 m-5 pt-5 pb-5 bg-white">
                                                    {getDirectionIcon(getDirection(wind.deg))}
                                                </div>
                                                {getDirection(wind.deg)}
                                                {windDirection()}
                                                {windSpeed()}
                                            </div>
                                        </div>
            const visibility = <div>
                                    <div className='color-yellow bold mb-10'>visibility: </div>
                                    <div className='r-5 p-10 bg-dkGreen'>
                                        {item.visibility}
                                        <span className='copyright'> ft</span>
                                    </div>
                            </div>;
            const period = () => item.dt_txt;
            console.log(`period: ${period()}`)
            const momentArray = () => period().split(' ');
            console.log(`momentArray: ${momentArray()[0]}`)
            const date = momentArray()[0];
            console.log(`date: ${date}`)
            const dateArray = date.split('-');
            console.log(`Day: ${dateArray[2]}`);
            const someDate = new Date(date);
            console.log(`someDate: ${someDate}`);
            //new Date('2011-04-11T10:20:30Z').
            //.toUTCString(),
            const year = dateArray[0];
            const month = dateArray[1];
            const day = dateArray[2];
            const timeArray = momentArray()[1].split(':');
            const hour = timeArray[0];
            const getHour = (hour>12) ? (hour-12) : hour;
            const timeOfDay = (hour>12) ? 'pm' : 'am';
            const minutes = timeArray[1];
            const getTime = `${getHour}:${minutes}`;
            const time = getTime;
            const displayDate = `${month} ${day} ${year}`
            const cards = [temperature, windDisplay(), humidity, visibility]

            const card = (matchKind) => <div key={getKey('card')} className='flex4Column bg-lite mr-5 ml-5 p-10 r-10'>
                            {/*this.getMatchIcon(matchKind)*/}
                            <div className='greet'>{matchKind}</div>
                        </div>;
            return (
                <div className='width100Percant p-10 m-20 r-10 bg-dkGreen'>
                    <div className='color-yellow p-10 navBranding'>{weekday(date)}</div>
                    <div className='greet color-neogreen'>{displayDate}</div>
                    <div className='greet color-neogreen mb-20'>{time} {timeOfDay}</div>
                    <div className='bg-green r-10 p-10 ml-5 mr-5 mb-10'>
                        <div className='color-yellow navBranding p-5'>{mainDescription}</div>
                        <div className='greet color-neogreen shadow p-5'>{description}</div>
                    </div>
                    <div className='width100Percent flexContainer'>
                        {cards.map((item) => card(item))}
                    </div>
                </div>
            )
        })
        console.log(`display: ${JSON.stringify(results, null, 2)}`)
        setResults(list)
    }

    const onSearch = () => {
        fetch(`${baseUrl}${urlEnd}${key}`)
        .then((response) => response.json())
//        .then((result) => console.log(`${JSON.stringify(result,null, 2)}`))
        .then((results) => displayResults(results));
    };
    const onKeyDown = (event) => {
        if (event.keyCode === 13) {
            onSearch();
        }
    };
    return (
        <div>
            <h1 className='navBranding color-yellow'>Search your city</h1>
            <input onKeyDown={onKeyDown} value={city} placeholder='Enter city'
                    onChange={(event) => setCity(event.target.value)} className='greet p-20 r-10 w-200 brdr-green'/>
            <button onClick={onSearch} className='ml-5 greet p-20 r-10 w-200 bg-green brdr-green'>
                Check Weather
            </button>
            <div className='white shadow'>{results}</div>
        </div>
    );
};

export default CitySelector;