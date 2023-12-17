import React, { useState } from 'react';
import getKey from '../utils/KeyGenerator.js';
//import cheerio from 'cheerio';
//import got from 'got';

const SurfReports = () => {
    // eslint-disable-next-line
    const [oSideBuoyData, setOSideBuoyData] = useState({});
    // eslint-disable-next-line
    const getSwellData = () => {
        const unirest = require("unirest");
        const req = unirest("GET", "https://stormglass.p.rapidapi.com/forecast");
        req.headers({
            "x-rapidapi-host": "stormglass.p.rapidapi.com",
            "x-rapidapi-key": "cd590b7832msheb65a284b1083a6p112e16jsn24ac4a11b813",
            "useQueryString": true
        });
        req.end(function (res) {
            if (res.error) throw new Error(res.error);
            console.log(`getSwellData => ${res.body}`);
        });

    }
    // eslint-disable-next-line
    const getRapidData = () => {
        const settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://community-open-weather-map.p.rapidapi.com/weather?q=san%20francisco%2Cus",
            "method": "GET",
            "headers": {
              "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
              "x-rapidapi-key": "SIGN-UP-FOR-KEY"
            }
          }
          
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                console.log(`getRapidData: ${this.responseText}`);
            } else {
                console.log(`getRapidData: ${this.status}`)
            }
        };
        xhttp.open("GET", settings, true);
        xhttp.send();
          /*
          $.ajax(settings).done(function (response) {
            console.log(`getRapidData: ${response}`);
          });
          */
    }
        //this.getSwellData();
        //this.getRapidData();
    
    const bouys = [
        {
           title: 'Oceanside Offshore',
           src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224'
        },
        {
            title: 'Torrey Pines Outer',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46225'
        },
        {
            title: 'Del Mar Nearshore',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46266'
        },
        {
            title: 'SCRIPPS Nearshore',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46254'
        },
        {
            title: 'La Jolla LJAC1',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJAC1'
        },
        {
            title: 'La Jolla LJPC1',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJPC1'
        },
        {
            title: 'Point Loma South',
            src: 'https://www.ndbc.noaa.gov/widgets/station_page.php?station=46232'
        }
    ];
    const menu = () => {
        const classes = 'maxWidth400 m-10 r-5 glassy height400 horizontalItem';
        const portraitButton = (item, index) => <iframe src={item.src} title={item.title} key={getKey(`index${index}`)} className={classes}></iframe>;
        const menuItems = bouys.map((item) => portraitButton(item));
        return menuItems;
    }
    return <div className='mt--30 width-100-percent h-scroll'>
            {menu()}
        </div>
}

export default SurfReports;