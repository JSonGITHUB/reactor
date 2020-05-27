import React from 'react';
import Loader from '../utils/Loader.js';
//import tide from '../../assets/images/tide.png'

class SurfReports extends React.Component {
    getOside = () => {
        let data;
        const returnText = (response) => response.text();
        const returnRejection = (response) => Promise.reject({status: response.status, data});
        const validate = (response) => (response.ok) ? returnText(response) : returnRejection(response);
        const uri = "https://www.ndbc.noaa.gov/data/realtime2/46224.txt";
                     
        fetch(uri)
            .then(response => validate(response))
            .then(data => {
                console.log(`SurfReport => ${data}`)
                this.props.setWind(data.data[0].dr, data.data[0].d, data.data[0].s, data.data[0].g)
                this.setState({
                    station: data.metadata.name,
                    speed: data.data[0].s,
                    angle: data.data[0].d,
                    direction: data.data[0].dr,
                    gusts: data.data[0].g
                })
            })
            .catch(err => console.log(`Something went wrong!\nuri: ${uri} \npath: ${window.location.pathname}\n`, err));

    }
    getBuoy = () => {
        const myHeaders = new Headers();
        const myRequest = new Request('https://www.ndbc.noaa.gov/data/realtime2/46224.txt', {
        method: 'GET',
        headers: myHeaders,
        mode: 'no-cors',
        cache: 'default',
        });

        fetch(myRequest)
            .then(response => response.text())
            .then(data => console.log(`SSSURF: ${data}`));
    }
    getSwellData = () => {
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
    getRapidData = () => {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://community-open-weather-map.p.rapidapi.com/weather?q=san%20francisco%2Cus",
            "method": "GET",
            "headers": {
              "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
              "x-rapidapi-key": "SIGN-UP-FOR-KEY"
            }
          }
          
                        var xhttp = new XMLHttpRequest();
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
    render() {
        //this.getOside();
        //this.getBuoy();
        //this.getSwellData();
        //this.getRapidData();
        return <div>
            <iframe id="Oside" title="surf report" src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46224"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46225" ></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46266"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46254"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJAC1"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=LJPC1"></iframe><br/>
            <iframe src="https://www.ndbc.noaa.gov/widgets/station_page.php?station=46232"></iframe><br/>
        </div>
    };
}

export default SurfReports;