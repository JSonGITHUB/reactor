import React, { useState } from 'react';
import BuoysDisplay from './BuoysDisplay';
import report from './Abreojos';
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
        xhttp.onreadystatechange = function () {
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

    return (
        <div className='m-5 pb-10'>
            <BuoysDisplay />
            <link href="//www.surf-forecast.com/stylesheets/widget.css" media="screen" rel="stylesheet" type="text/css" />
            <div className="wf-width-cont surf-fc-widget">
                <div className="widget-container">
                    <div className="external-cont">
                        <iframe title='Ulu' className="surf-fc-i" allowtransparency="true" src="//www.surf-forecast.com/breaks/Uluwatu/forecasts/widget/a" scrolling="no" frameBorder="0" marginWidth="0" marginHeight="0">
                        </iframe>
                    </div>
                </div>
            </div>
            {/*menu()*/}
            <div className=''>
                {report}
            </div>
        </div>
    )
}

export default SurfReports;