import React, { useState } from 'react';
import BuoysDisplay from './BouysDisplay';
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
        <div className='m-10'>
            <BuoysDisplay />
            <link href="//www.surf-forecast.com/stylesheets/widget.css" media="screen" rel="stylesheet" type="text/css" /><div className="wf-width-cont surf-fc-widget"><div className="widget-container"><div className="external-cont"><iframe title='Ulu' className="surf-fc-i" allowtransparency="true" src="//www.surf-forecast.com/breaks/Uluwatu/forecasts/widget/a" scrolling="no" frameBorder="0" marginWidth="0" marginHeight="0"></iframe><div className="footer"><a className="logo" href="//www.surf-forecast.com/"><img src="//www.surf-forecast.com/images/widget.png" width="1" height="1" alt='Surf Forecast' /></a><div className="about" id="cmt">View detailed surf forecast for <a href="//www.surf-forecast.com/breaks/Uluwatu">Uluwatu</a>. Visit <a href="//www.surf-forecast.com/breaks/Uluwatu">surf-forecast.com</a> for more details, long range forecasts, surf reports, swell and weather maps.</div></div></div></div></div>
            {/*menu()*/}
            {report}
        </div>
    )
}

export default SurfReports;